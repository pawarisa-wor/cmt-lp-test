#!/usr/bin/env node
/**
 * ย่อ/บีบรูปใน public/assets ให้ผ่านเป้าน้ำหนักตาม assets.json (ใช้ npx sharp-cli — ไม่ต้อง install)
 *
 *   node scripts/optimize-images.mjs --dry-run     ดูว่าจะทำอะไรกับไฟล์ไหน
 *   node scripts/optimize-images.mjs               บีบจริง
 *   node scripts/optimize-images.mjs --report      แค่รายงานน้ำหนักไฟล์ปัจจุบัน
 *
 * เป้า (จาก assets.json → target): hero ≤200KB@1400 · section ≤150KB@800
 *                                  card ≤80KB@400 · avatar ≤30KB@256
 * รวมทุกภาพที่ใช้บนหน้าเพจไม่ควรเกิน 3MB
 */
import { existsSync, readFileSync, statSync, readdirSync, renameSync, unlinkSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs, projectDir, info, ok, warn, fail, c, dryRunBanner } from './lib/util.mjs';

const args = parseArgs();
const dir = projectDir(args);
const dry = Boolean(args['dry-run']);

const assetsDir = join(dir, 'public', 'assets');
if (!existsSync(assetsDir)) fail(`ไม่พบ ${assetsDir} — generate รูปก่อน`);

const planPath = join(dir, 'assets.json');
const plan = existsSync(planPath) ? JSON.parse(readFileSync(planPath, 'utf8')) : { assets: [] };

const kb = (bytes) => Math.round(bytes / 1024);
const QUALITY = Number(args.quality || 80);

/** หา target ของไฟล์จาก assets.json (ถ้าไม่มีในแผน เดาจากชื่อ) */
function targetFor(file) {
  const found = plan.assets.find((a) => a.file === file);
  if (found?.target) return found.target;

  if (/^hero/.test(file)) return { width: 1400, maxKB: 200 };
  if (/^og-/.test(file)) return { width: 1200, height: 630, maxKB: 200 };
  if (/^(testi|avatar)/.test(file)) return { width: 256, maxKB: 30 };
  if (/^(coach|community-02)/.test(file)) return { width: 400, maxKB: 80 };
  if (/^(ground|move|location|community)/.test(file)) return { width: 800, maxKB: 150 };
  return { width: 800, maxKB: 150 };
}

const files = readdirSync(assetsDir).filter((f) =>
  ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f).toLowerCase()),
);

if (!files.length) fail('ไม่มีไฟล์รูปใน public/assets');

// ── report mode ───────────────────────────────────────────────
let total = 0;
const rows = [];
for (const f of files) {
  const size = statSync(join(assetsDir, f)).size;
  total += size;
  const t = targetFor(f);
  rows.push({ file: f, size, target: t, over: kb(size) > t.maxKB });
}

info(`${c.bold('น้ำหนักไฟล์ปัจจุบัน')} (${files.length} ไฟล์ · รวม ${kb(total)}KB)\n`);
for (const r of rows) {
  const mark = r.over ? c.yellow('เกินเป้า') : c.green('ผ่าน');
  info(`  ${r.file.padEnd(22)} ${String(kb(r.size)).padStart(5)}KB / ${String(r.target.maxKB).padStart(4)}KB  ${mark}`);
}
info('');
if (kb(total) > 3072) warn(`รวมทั้งหมด ${kb(total)}KB เกิน 3MB — หน้าเพจจะโหลดช้าบนมือถือ`);

if (args.report) process.exit(0);

const todo = rows.filter((r) => r.over || extname(r.file).toLowerCase() === '.png');
if (!todo.length) {
  ok('ทุกไฟล์ผ่านเป้าแล้ว ไม่ต้องทำอะไร');
  process.exit(0);
}

dryRunBanner(dry);
info(`${c.bold(`${todo.length} ไฟล์`)} จะถูกย่อ/บีบ:\n`);
for (const r of todo) {
  const to = extname(r.file).toLowerCase() === '.png' && !/^(favicon|moodboard)/.test(r.file)
    ? `${basename(r.file, extname(r.file))}.webp`
    : r.file;
  info(
    `  ${r.file.padEnd(22)} → ${to.padEnd(22)} ` +
      `width ${r.target.width}${r.target.height ? `×${r.target.height}` : ''} q${QUALITY}`,
  );
}

if (dry) {
  info(c.yellow('\ndry run — ยังไม่แก้ไฟล์'));
  process.exit(0);
}
info('');

// ── บีบจริงด้วย npx sharp-cli ──────────────────────────────────
let done = 0;
for (const r of todo) {
  const src = join(assetsDir, r.file);
  const ext = extname(r.file).toLowerCase();
  const isPngKeep = /^(favicon|moodboard)/.test(r.file);
  const outName = ext === '.png' && !isPngKeep ? `${basename(r.file, ext)}.webp` : r.file;
  const tmp = join(assetsDir, `__tmp-${outName}`);

  const sharpArgs = [
    '--yes', 'sharp-cli',
    '-i', src,
    '-o', tmp,
    'resize', String(r.target.width),
  ];
  if (r.target.height) sharpArgs.push(String(r.target.height), '--fit', 'cover');

  try {
    execFileSync('npx', sharpArgs, { stdio: 'pipe' });
    // sharp-cli อาจเขียนออกมาเป็นโฟลเดอร์/ชื่อเดิม — จัดการทั้งสองแบบ
    const produced = existsSync(tmp) ? tmp : join(assetsDir, `__tmp-${outName}`, r.file);
    if (!existsSync(produced)) throw new Error('ไม่พบไฟล์ผลลัพธ์จาก sharp-cli');

    const dest = join(assetsDir, outName);
    if (existsSync(dest) && dest !== src) unlinkSync(dest);
    renameSync(produced, dest);
    if (dest !== src && existsSync(src)) unlinkSync(src);

    const after = kb(statSync(dest).size);
    const mark = after <= r.target.maxKB ? c.green('ผ่าน') : c.yellow(`ยังเกิน (${r.target.maxKB}KB)`);
    ok(`${r.file} → ${outName}  ${kb(r.size)}KB → ${after}KB  ${mark}`);
    done++;
  } catch (err) {
    warn(`${r.file} — ${err.message.split('\n')[0]}`);
    warn(c.dim('  ถ้า npx ใช้ไม่ได้ ให้ย่อมือด้วยเครื่องมืออื่นแล้วรัน --report เช็คซ้ำ'));
  }
}

info('');
ok(`บีบสำเร็จ ${done}/${todo.length} ไฟล์`);
info(c.dim('เช็คซ้ำ: node scripts/optimize-images.mjs --report'));
info(c.dim('อย่าลืมอัปเดตชื่อไฟล์ใน public/assets/manifest.md และใน HTML ถ้านามสกุลเปลี่ยน'));
