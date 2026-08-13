/**
 * GET /api/health — ตรวจว่า deployment พร้อมใช้งานไหม
 *
 * มีไว้ 3 เหตุผล:
 *  1. `vercel.json` ประกาศ functions glob `api/*.js` ไว้ — ถ้า api/ ว่าง build จะ fail ด้วย
 *     "The pattern api/*.js ... doesn't match any Serverless Functions"
 *     ไฟล์นี้ทำให้ deploy ผ่านได้ตั้งแต่ก่อนสร้างหน้าเพจ (ขั้น 5)
 *  2. ยืนยันว่า `includeFiles` ทำงาน — ถ้า catalogs ว่างทั้งที่มี public_pages/[slug]/catalog.json
 *     แล้ว แปลว่า serverless function อ่านไฟล์ไม่เจอ (ดู technical-setup ส่วน C0 ข้อ 5)
 *  3. ยืนยันว่า env vars ครบใน Vercel — คืนแค่ true/false **ไม่คืนค่าจริง**
 *
 * ⚠️ endpoint นี้เป็นเครื่องมือ debug สำหรับ workshop และเปิดให้ทุกคนเรียกได้
 *    ถ้าเอาโปรเจกต์ไปใช้จริง ให้ลบไฟล์นี้ หรือใส่ Vercel Deployment Protection
 *    (ตอนนั้น api/ มีไฟล์อื่นแล้ว ลบได้เลยไม่กระทบ build)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/** cwd ของ serverless function ต่างกันระหว่าง vercel dev กับ production — ลองทีละที่ */
function pageRoots() {
  return [
    join(process.cwd(), 'public_pages'),
    join(here, '..', 'public_pages'),
    join('/var/task', 'public_pages'),
  ];
}

/** หา slug ที่มี catalog.json อ่านได้จริงจากใน function */
function findCatalogs() {
  const tried = [];
  for (const root of pageRoots()) {
    tried.push(root);
    if (!existsSync(root)) continue;

    const slugs = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(root, d.name, 'catalog.json')))
      .map((d) => d.name)
      .sort();

    if (slugs.length) return { root, slugs, tried };
  }
  return { root: null, slugs: [], tried };
}

/**
 * pipeline/stage ที่ catalog ของ **deployment นี้** ใช้อยู่
 * มีไว้จับกรณีที่เจอบ่อยสุดหลังแก้ pipeline: รัน setup-hubspot.mjs แล้วลืม commit/push
 * → HubSpot มีสเตจใหม่ แต่ function ยังส่ง id ชุดเก่า (ไม่ใช่ความลับ เป็นแค่ชื่อสเตจ)
 */
function stageConfigFor(root, slugs) {
  const out = {};
  for (const slug of slugs) {
    try {
      const h = JSON.parse(readFileSync(join(root, slug, 'catalog.json'), 'utf8')).hubspot || {};
      out[slug] = {
        pipeline: h.pipeline ?? null,
        stageOnLead: h.stageOnLead ?? null,
        stageOnCheckout: h.stageOnCheckout ?? null,
        stageOnPaid: h.stageOnPaid ?? null,
        ready: Boolean(h.pipeline && h.stageOnLead && h.stageOnPaid),
      };
    } catch {
      out[slug] = { error: 'อ่าน catalog.json ไม่ได้' };
    }
  }
  return out;
}

/** ตัวแปรที่ api/ ต้องใช้ตอน runtime — เช็คแค่ว่ามีค่าหรือไม่มี */
const REQUIRED_ENV = [
  'HUBSPOT_PRIVATE_APP_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

/**
 * base URL ของหน้าเพจ — ไม่ต้องตั้ง SITE_URL ใน Vercel
 * `VERCEL_PROJECT_PRODUCTION_URL` = production domain (custom domain ถ้ามี ไม่งั้น *.vercel.app)
 * Vercel ตั้งให้เองทั้ง build และ runtime และ**ไม่มี** `https://` นำหน้า
 * ต้องเปิด "Enable access to System Environment Variables" ใน project settings (ค่า default เปิดอยู่)
 */
export function resolveSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return null;
}

export default function handler(req, res) {
  const { root, slugs, tried } = findCatalogs();

  const env = {};
  for (const key of REQUIRED_ENV) env[key] = Boolean(process.env[key]);
  const envReady = REQUIRED_ENV.every((key) => env[key]);

  const siteUrl = resolveSiteUrl();

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    node: process.version,
    // URL สาธารณะ ไม่ใช่ความลับ — คืนค่าได้ ช่วยจับกรณีลืมแก้ localhost
    siteUrl,
    siteUrlFrom: process.env.SITE_URL
      ? 'SITE_URL'
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? 'VERCEL_PROJECT_PRODUCTION_URL (auto)'
        : 'ไม่พบทั้งสองตัว',
    catalogs: slugs,
    // stage id ที่ deployment นี้จะส่งเข้า HubSpot — เทียบกับ catalog.json ใน repo ได้ว่า deploy ใหม่แล้วยัง
    hubspotStages: root ? stageConfigFor(root, slugs) : {},
    pagesRoot: root,
    ...(slugs.length ? {} : { pagesTried: tried }),
    env,
    envReady: envReady && Boolean(siteUrl),
    hint:
      envReady && siteUrl
        ? 'env ครบแล้ว'
        : 'ยังขาด env บางตัวใน Vercel → Project Settings → Environment Variables (ติ๊ก Production)',
  });
}
