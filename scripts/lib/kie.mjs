/**
 * KIE.ai GPT Image 2 client
 * spec: .claude/skills/_shared/gpt-image-guide.md
 * 💰 ทุกการเรียกมีค่าใช้จ่าย — caller ต้องขอ confirm จากผู้ใช้ก่อน
 */
import { writeFileSync } from 'node:fs';
import { requireEnv, sleep, info, warn, c } from './util.mjs';

const CREATE_URL = 'https://api.kie.ai/api/v1/jobs/createTask';
const POLL_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo';

/** ตาม doc ของ kie.ai */
export const ASPECT_RATIOS = [
  'auto', '1:1', '3:2', '2:3', '4:3', '3:4', '5:4', '4:5',
  '16:9', '9:16', '2:1', '1:2', '3:1', '1:3', '21:9', '9:21',
];
export const RESOLUTIONS = ['1K', '2K', '4K'];

export function validateSpec({ id, aspect_ratio, resolution }) {
  if (!ASPECT_RATIOS.includes(aspect_ratio)) {
    throw new Error(
      `[${id}] aspect_ratio "${aspect_ratio}" ไม่รองรับ\nใช้ได้: ${ASPECT_RATIOS.join(' ')}`,
    );
  }
  if (resolution && !RESOLUTIONS.includes(resolution)) {
    throw new Error(`[${id}] resolution "${resolution}" ไม่รองรับ — ใช้ได้: ${RESOLUTIONS.join(' ')}`);
  }
}

const ERRORS = {
  401: 'KIE_API_KEY ไม่ถูกต้อง — เช็คค่าใน .env',
  402: 'เครดิต KIE.ai หมด — แจ้งผู้สอน หรือเติมที่ https://kie.ai',
  429: 'ยิงถี่เกินไป (rate limit) — รอ 60 วินาทีแล้วลองใหม่',
};

async function kieFetch(url, init = {}) {
  const key = requireEnv('KIE_API_KEY', 'ดู technical-setup.md ส่วน B6');
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const msg = ERRORS[res.status] || `KIE.ai ตอบ ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  if (json.code && json.code !== 200) {
    throw new Error(`KIE.ai: ${json.msg || `code ${json.code}`}`);
  }
  return json;
}

/** สร้าง task → คืน taskId */
export async function createTask({ prompt, aspect_ratio = 'auto', resolution = '1K', inputUrls }) {
  const model = inputUrls?.length ? 'gpt-image-2-image-to-image' : 'gpt-image-2-text-to-image';
  const json = await kieFetch(CREATE_URL, {
    method: 'POST',
    body: JSON.stringify({
      model,
      input: {
        prompt,
        aspect_ratio,
        resolution,
        ...(inputUrls?.length ? { input_urls: inputUrls } : {}),
      },
    }),
  });
  const taskId = json?.data?.taskId;
  if (!taskId) throw new Error('KIE.ai ไม่ส่ง taskId กลับมา');
  return taskId;
}

/** poll จน success → คืน url ของรูป */
export async function waitForResult(taskId, { intervalMs = 30_000, timeoutMs = 600_000 } = {}) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const json = await kieFetch(`${POLL_URL}?taskId=${encodeURIComponent(taskId)}`);
    const data = json?.data || {};
    const state = data.state || 'waiting';

    if (state === 'success') {
      const parsed = typeof data.resultJson === 'string' ? JSON.parse(data.resultJson) : data.resultJson;
      const url = parsed?.resultUrls?.[0];
      if (!url) throw new Error('task สำเร็จแต่ไม่มี resultUrls');
      return url;
    }
    if (state === 'fail') {
      throw new Error(`task ล้มเหลว: ${data.failReason || 'ไม่ทราบสาเหตุ'}`);
    }

    info(c.dim(`   ${state}… (รออีก 30 วิ)`));
    await sleep(intervalMs);
  }
  throw new Error(`หมดเวลารอ task ${taskId} (10 นาที)`);
}

/**
 * ดาวน์โหลดรูปที่ generate เสร็จแล้ว — **retry เองเมื่อเจอ 5xx**
 *
 * ทำไมต้อง retry: ตอนนี้รูปถูก generate เสร็จและ**จ่ายเงินไปแล้ว** ถ้าปล่อยให้ 503 ทำให้แพ้
 * คือจ่ายเงินแล้วไม่ได้ไฟล์ ต้อง generate ใหม่ = จ่ายสองรอบสำหรับรูปเดียว
 * 4xx ไม่ retry เพราะ URL หมดอายุ/ผิด retry ไปก็เท่านั้น
 */
export async function download(url, outPath, { attempts = 4 } = {}) {
  let lastStatus = 0;
  for (let i = 1; i <= attempts; i++) {
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      if (i === attempts) throw new Error(`ดาวน์โหลดรูปไม่สำเร็จ: ${err.message}`);
      await sleep(2000 * i);
      continue;
    }
    if (res.ok) {
      writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
      return outPath;
    }
    lastStatus = res.status;
    if (res.status < 500) break; // 4xx = ไม่มีประโยชน์ที่จะลองใหม่
    if (i < attempts) {
      warn(`   ดาวน์โหลดได้ ${res.status} — ลองใหม่ครั้งที่ ${i + 1}/${attempts} (รูป generate เสร็จแล้ว)`);
      await sleep(2000 * i);
    }
  }
  throw new Error(
    `ดาวน์โหลดรูปไม่สำเร็จ: ${lastStatus}` +
      (lastStatus >= 500 ? ` (ลองแล้ว ${attempts} ครั้ง — รูปนี้ generate ไปแล้วแต่โหลดไม่ลง)` : ''),
  );
}

/** ครบวงจร: create → poll → download */
export async function generateImage(spec, outPath) {
  validateSpec(spec);
  const taskId = await createTask(spec);
  info(c.dim(`   taskId: ${taskId}`));
  const url = await waitForResult(taskId);
  return download(url, outPath);
}
