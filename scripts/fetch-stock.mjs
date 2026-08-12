#!/usr/bin/env node
/**
 * ดึงรูป/ไอคอนฟรีจาก Pixabay (ไม่มีค่าใช้จ่าย)
 *
 *   node scripts/fetch-stock.mjs --query "ice cube" --out ground-icon
 *   node scripts/fetch-stock.mjs --query "paper texture" --out texture-01 --type all
 *   node scripts/fetch-stock.mjs --plan                 ดึงตามลิสต์ stock[] ใน assets.json
 *   node scripts/fetch-stock.mjs --query "..." --dry-run
 *
 * Pixabay Content License ใช้เชิงพาณิชย์ได้ — แต่ห้ามใช้ภาพที่มีโลโก้แบรนด์อื่น
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadEnv, parseArgs, projectDir, requireEnv, info, ok, warn, fail, c, dryRunBanner,
} from './lib/util.mjs';

loadEnv();
const args = parseArgs();
const dir = projectDir(args);
const dry = Boolean(args['dry-run']);

const outDir = join(dir, 'public', 'assets');
mkdirSync(outDir, { recursive: true });

/** ทำชื่อไฟล์ให้ web-safe: ตัวเล็ก a-z0-9-_ เท่านั้น */
function webSafe(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function search({ query, type = 'photo', perPage = 5 }) {
  const key = requireEnv('PIXABAY_API_KEY', 'สมัครฟรีที่ https://pixabay.com/api/docs/ (ดู technical-setup.md B6)');
  const url =
    `https://pixabay.com/api/?key=${key}` +
    `&q=${encodeURIComponent(query)}` +
    `&image_type=${type}&per_page=${perPage}&safesearch=true&order=popular`;

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 400) throw new Error('Pixabay 400 — คำค้นหรือ API key ไม่ถูกต้อง');
    if (res.status === 429) throw new Error('Pixabay rate limit — รอสักครู่แล้วลองใหม่');
    throw new Error(`Pixabay ตอบ ${res.status}`);
  }
  const json = await res.json();
  return json.hits || [];
}

async function fetchOne({ query, out, type }) {
  const hits = await search({ query, type });
  if (!hits.length) {
    warn(`ไม่พบรูปสำหรับ "${query}"`);
    return null;
  }

  const hit = hits[0];
  const url = hit.largeImageURL || hit.webformatURL;
  const ext = url.split('?')[0].split('.').pop().toLowerCase();
  const filename = `${webSafe(out || query)}.${ext === 'png' ? 'png' : 'jpg'}`;
  const dest = join(outDir, filename);

  if (existsSync(dest) && !args.force) {
    warn(`มี ${filename} อยู่แล้ว — ข้าม (ใช้ --force ถ้าจะทับ)`);
    return null;
  }

  const img = await fetch(url);
  if (!img.ok) throw new Error(`ดาวน์โหลดไม่สำเร็จ: ${img.status}`);
  writeFileSync(dest, Buffer.from(await img.arrayBuffer()));

  ok(`${filename}  ${c.dim(`(${hit.imageWidth}×${hit.imageHeight} · โดย ${hit.user} · Pixabay)`)}`);
  return { filename, credit: hit.user, pageURL: hit.pageURL };
}

// ── mode: ตามลิสต์ใน assets.json ───────────────────────────────
if (args.plan) {
  const planPath = join(dir, 'assets.json');
  if (!existsSync(planPath)) fail(`ไม่พบ ${planPath}`);
  const list = JSON.parse(readFileSync(planPath, 'utf8')).stock || [];
  if (!list.length) fail('assets.json ไม่มีลิสต์ stock[]');

  dryRunBanner(dry);
  info(`${c.bold(`${list.length} รายการ`)} จาก assets.json → public/assets\n`);
  for (const item of list) {
    info(`${(item.use || '').padEnd(28)} ← "${item.query}"`);
  }
  if (dry) {
    info(c.yellow('\ndry run — ยังไม่ดาวน์โหลด'));
    process.exit(0);
  }

  info('');
  const credits = [];
  for (const item of list) {
    try {
      const r = await fetchOne({ query: item.query, out: item.use || item.query, type: 'all' });
      if (r) credits.push(r);
    } catch (err) {
      warn(`"${item.query}" — ${err.message}`);
    }
  }
  info('');
  ok(`ดาวน์โหลด ${credits.length}/${list.length} รายการ`);
  process.exit(0);
}

// ── mode: คำค้นเดียว ──────────────────────────────────────────
const query = args.query || args._[0];
if (!query) {
  fail('ต้องระบุ --query "คำค้น"  (หรือ --plan เพื่อดึงตาม assets.json)');
}

dryRunBanner(dry);
info(`ค้น "${query}" → public/assets/${webSafe(args.out || query)}.[jpg|png]`);

if (dry) {
  info(c.yellow('dry run — ยังไม่ดาวน์โหลด'));
  process.exit(0);
}

try {
  await fetchOne({ query, out: args.out, type: args.type || 'photo' });
} catch (err) {
  fail(err.message);
}
