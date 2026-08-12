#!/usr/bin/env node
/**
 * ประกอบทุกหน้าใน workspace/ เป็น public/ เดียวสำหรับ deploy ขึ้น Vercel ครั้งเดียว
 *
 *   workspace/page_a/public/**  →  public/page_a/**   →  [domain]/page_a
 *   workspace/page_b/public/**  →  public/page_b/**   →  [domain]/page_b
 *
 *   node scripts/build-site.mjs --dry-run     ดูว่าจะประกอบอะไร
 *   node scripts/build-site.mjs               ประกอบจริง (ล้าง public/ ก่อน)
 *   node scripts/build-site.mjs --no-index    ไม่ต้องสร้างหน้า index รวมลิงก์
 *
 * Vercel เรียก script นี้เป็น buildCommand — public/ เป็นผลผลิต ไม่ต้อง commit
 */
import {
  existsSync, mkdirSync, rmSync, cpSync, readdirSync, readFileSync, writeFileSync, statSync,
} from 'node:fs';
import { join } from 'node:path';
import {
  REPO_ROOT, parseArgs, listProjects, assertValidSlug, info, ok, warn, fail, c, dryRunBanner,
} from './lib/util.mjs';

const args = parseArgs();
const dry = Boolean(args['dry-run']);
const outRoot = join(REPO_ROOT, 'public');

/** นับไฟล์ในโฟลเดอร์แบบ recursive (ใช้รายงานเท่านั้น) */
function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countFiles(join(dir, entry.name));
    else n++;
  }
  return n;
}

function dirSizeKB(dir) {
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    bytes += entry.isDirectory() ? dirSizeKB(p) * 1024 : statSync(p).size;
  }
  return Math.round(bytes / 1024);
}

// ── หา page ที่พร้อม deploy ────────────────────────────────────
const slugs = listProjects();
const pages = [];
const skipped = [];

for (const slug of slugs) {
  assertValidSlug(slug); // ชื่อโฟลเดอร์กลายเป็น URL — ต้องใช้ได้จริง
  const dir = join(REPO_ROOT, 'workspace', slug);
  const pub = join(dir, 'public');

  if (!existsSync(pub)) {
    skipped.push({ slug, why: 'ยังไม่มี public/ (ยังไม่ได้ build หน้าเพจ)' });
    continue;
  }
  if (!existsSync(join(pub, 'index.html'))) {
    skipped.push({ slug, why: 'ไม่มี public/index.html' });
    continue;
  }

  let brand = null;
  const catalogPath = join(dir, 'catalog.json');
  if (existsSync(catalogPath)) {
    try {
      brand = JSON.parse(readFileSync(catalogPath, 'utf8')).brand || null;
    } catch {
      warn(`${slug}: catalog.json อ่านไม่ได้ (JSON เพี้ยน?) — ยังประกอบหน้าให้ แต่ /api จะพัง`);
    }
  } else {
    warn(`${slug}: ไม่มี catalog.json — /api/lead กับ /api/checkout ของหน้านี้จะใช้งานไม่ได้`);
  }

  pages.push({ slug, dir, pub, brand, files: countFiles(pub), sizeKB: dirSizeKB(pub) });
}

// ── รายงาน ────────────────────────────────────────────────────
dryRunBanner(dry);

if (!pages.length) {
  warn('ยังไม่มีหน้าเพจที่พร้อม deploy ใน workspace/');
  if (skipped.length) {
    for (const s of skipped) info(c.dim(`  - ${s.slug}: ${s.why}`));
  } else {
    info(c.dim('  สร้างหน้าแรกด้วย skill generate-salepage ก่อน'));
  }
  // ไม่ fail — ให้ deploy ผ่านได้แม้ยังไม่มีหน้า (จะได้หน้า index ว่างๆ)
}

if (pages.length) {
  info(`${c.bold(`${pages.length} หน้า`)} จะถูกประกอบลง public/\n`);
  for (const p of pages) {
    info(
      `  ${c.bold(('/' + p.slug).padEnd(22))} ← workspace/${p.slug}/public/  ` +
        c.dim(`(${p.files} ไฟล์ · ${p.sizeKB}KB${p.brand ? ` · ${p.brand}` : ''})`),
    );
    if (p.sizeKB > 3072) warn(`   ${p.slug} หนัก ${p.sizeKB}KB — เกิน 3MB ควรรัน optimize-images.mjs`);
  }
}
if (skipped.length && pages.length) {
  info('');
  for (const s of skipped) warn(`ข้าม ${s.slug} — ${s.why}`);
}

if (dry) {
  info(c.yellow('\ndry run — ยังไม่เขียนไฟล์'));
  process.exit(0);
}

// ── ประกอบจริง ────────────────────────────────────────────────
info('');
rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

for (const p of pages) {
  cpSync(p.pub, join(outRoot, p.slug), { recursive: true });
  ok(`/${p.slug}`);
}

// manifest ให้ debug ได้ว่า deployment นี้มีหน้าอะไร
writeFileSync(
  join(outRoot, '_pages.json'),
  `${JSON.stringify({ pages: pages.map(({ slug, brand }) => ({ slug, brand })) }, null, 2)}\n`,
  'utf8',
);

// ── หน้า index รวมลิงก์ (ปิดด้วย --no-index) ────────────────────
if (!args['no-index']) {
  const items = pages.length
    ? pages
        .map(
          (p) =>
            `      <li><a href="/${p.slug}/">${p.brand ? `${p.brand} — ` : ''}/${p.slug}</a></li>`,
        )
        .join('\n')
    : '      <li>ยังไม่มีหน้าเพจใน deployment นี้</li>';

  writeFileSync(
    join(outRoot, 'index.html'),
    `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Salepages</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1.5rem;
         color: #111418; line-height: 1.6; }
  h1 { font-size: 1.5rem; }
  ul { padding-left: 1.2rem; }
  li { margin: .4rem 0; }
  a { color: #0F5FD9; }
  p.note { color: #5C6570; font-size: .9rem; margin-top: 2rem; }
</style>
</head>
<body>
    <h1>Salepages ใน deployment นี้</h1>
    <ul>
${items}
    </ul>
    <p class="note">หน้านี้สร้างโดย <code>scripts/build-site.mjs</code> — แต่ละหน้ามาจากโฟลเดอร์ใน
    <code>workspace/</code> · CMT#6 workshop</p>
</body>
</html>
`,
    'utf8',
  );
  ok('/ (หน้า index รวมลิงก์)');
}

info('');
ok(`ประกอบ ${pages.length} หน้าลง public/ แล้ว`);
info(c.dim('ทดสอบ local: vercel dev   →   http://localhost:3000/[slug]'));
info(c.dim('deploy:       vercel --prod   (รันที่ root ของ repo)'));
