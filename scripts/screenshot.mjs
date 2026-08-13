#!/usr/bin/env node
/**
 * ถ่ายภาพหน้าเพจที่ deploy แล้ว เพื่อ **ดูด้วยตา** ก่อนส่งให้คนตรวจ
 *
 *   node scripts/screenshot.mjs --url https://site.app/glow
 *   node scripts/screenshot.mjs --url … --out /tmp/shots      เลือกที่เก็บ
 *   node scripts/screenshot.mjs --url … --cookie "k=v"        สำหรับ preview ที่มี protection
 *
 * ได้: desktop-full.png · mobile-full.png · desktop-fold.png · mobile-fold.png
 *      + report.json (ความสูงหน้า · รูปที่โหลดไม่ขึ้น · element ที่ล้นจอ · console error)
 *
 * ทำไมต้องมี: ตรวจด้วย curl บอกได้แค่ว่า "ไฟล์อยู่บนเซิร์ฟเวอร์" ไม่ได้บอกว่า
 * "หน้าตาออกมาใช้ได้ไหม" — layout พัง, รูปยักษ์, ช่องว่างยาวเป็นพรืด, กราฟิกผิดแบรนด์
 * ทั้งหมดนี้ curl มองไม่เห็น
 */
import { mkdirSync, existsSync, globSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs, info, ok, warn, fail, c } from './lib/util.mjs';

const args = parseArgs();
const url = args.url || process.env.SITE_URL;
if (!url) fail('ต้องระบุ --url https://…/[slug]');

const outDir = args.out || '/tmp/screenshots';
mkdirSync(outDir, { recursive: true });

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  fail(
    'ยังไม่มี playwright\n' +
      'ติดตั้ง: npm i -D playwright   (Chromium มีอยู่แล้วที่ /opt/pw-browsers — ห้ามรัน playwright install)',
  );
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

/* environment มี Chromium ติดตั้งไว้แล้วที่ /opt/pw-browsers (PLAYWRIGHT_BROWSERS_PATH)
   แต่เวอร์ชัน playwright ที่ npm ลงอาจคาดหวัง build คนละเลข → ชี้ executable ตรงๆ
   **ห้ามรัน `playwright install`** (ช้าและซ้ำกับที่มีอยู่) */
const CHROME_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  ...globSync('/opt/pw-browsers/chromium-*/chrome-linux/chrome'),
  '/opt/pw-browsers/chromium/chrome',
].filter(Boolean);
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (executablePath) info(c.dim(`ใช้ Chromium: ${executablePath}`));

/* outbound HTTPS ของ environment ออกทาง proxy — Chromium ต้องรู้ด้วย ไม่งั้น ERR_CONNECTION_RESET
   (ข้ามได้ถ้ายิง localhost) */
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const useProxy = proxyUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url);
if (useProxy) info(c.dim('ผ่าน proxy ของ environment'));

const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  ...(useProxy ? { proxy: { server: proxyUrl } } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const report = { url, viewports: {}, consoleErrors: [], failedRequests: [] };

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true, // proxy ของ environment ใช้ CA ของตัวเอง
    ...(vp.isMobile ? { isMobile: true, hasTouch: true } : {}),
  });

  if (args.cookie) {
    const [name, ...rest] = String(args.cookie).split('=');
    const { hostname } = new URL(url);
    await ctx.addCookies([{ name, value: rest.join('='), domain: hostname, path: '/' }]);
  }

  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') report.consoleErrors.push(m.text().slice(0, 200));
  });
  page.on('requestfailed', (r) => report.failedRequests.push(r.url()));
  page.on('response', (r) => {
    if (r.status() >= 400) report.failedRequests.push(`${r.status()} ${r.url()}`);
  });

  info(`${c.bold(vp.name)} ${vp.width}×${vp.height} → ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200); // ให้ scroll-reveal / lazy image ทำงาน
  // scroll ทั้งหน้าให้ lazy image โหลดครบก่อนถ่าย
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y < document.body.scrollHeight) setTimeout(step, 120);
        else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
      };
      step();
    });
  });

  // ── วัดสิ่งที่ตาคนจับได้แต่ curl จับไม่ได้ ──
  const metrics = await page.evaluate(() => {
    const docH = document.documentElement.scrollHeight;
    const broken = [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.getAttribute('src'));
    const oversize = [...document.images]
      .filter((i) => i.getBoundingClientRect().height > window.innerHeight * 0.9)
      .map((i) => ({ src: i.getAttribute('src'), h: Math.round(i.getBoundingClientRect().height) }));
    const overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;
    // ช่องว่างแนวตั้งที่ยาวผิดปกติ: section ที่สูงกว่า 2.5 เท่าของจอ
    const tallSections = [...document.querySelectorAll('section')]
      .map((s, i) => ({ i, h: Math.round(s.getBoundingClientRect().height) }))
      .filter((s) => s.h > window.innerHeight * 2.5);
    return { docH, broken, oversize, overflowX, tallSections, vw: window.innerWidth };
  });
  report.viewports[vp.name] = metrics;

  await page.screenshot({ path: join(outDir, `${vp.name}-full.png`), fullPage: true });
  await page.screenshot({ path: join(outDir, `${vp.name}-fold.png`) });
  ok(`${vp.name}: สูง ${metrics.docH}px · รูปเสีย ${metrics.broken.length} · รูปสูงเกินจอ ${metrics.oversize.length}` +
     (metrics.overflowX ? c.red(' · ⚠️ scroll แนวนอน') : ''));
  await ctx.close();
}

await browser.close();
await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

info('');
if (report.failedRequests.length) warn(`request ที่ล้มเหลว ${report.failedRequests.length}:\n  ${[...new Set(report.failedRequests)].slice(0, 10).join('\n  ')}`);
if (report.consoleErrors.length) warn(`console error ${report.consoleErrors.length}:\n  ${[...new Set(report.consoleErrors)].slice(0, 5).join('\n  ')}`);
ok(`ภาพอยู่ที่ ${outDir}`);
info(c.dim('ขั้นต่อไป: **เปิดดูภาพด้วยตา** แล้วเทียบกับ design-guide.md — ตัวเลขบอกได้แค่บางส่วน'));
