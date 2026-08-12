#!/usr/bin/env node
/**
 * generate รูปด้วย KIE.ai (GPT Image 2) ตาม assets.json
 *
 *   node scripts/gen-images.mjs --dry-run                 ดู prompt ทั้งหมด ไม่เสียเงิน
 *   node scripts/gen-images.mjs --priority P0             gen เฉพาะรูปที่ขาดไม่ได้
 *   node scripts/gen-images.mjs --only hero-01,testi-01   gen เฉพาะที่ระบุ
 *   node scripts/gen-images.mjs --moodboard               gen moodboard (ต้องมี --prompt-file)
 *   node scripts/gen-images.mjs --force                   gen ทับไฟล์ที่มีอยู่แล้ว
 *
 * 💰 มีค่าใช้จ่ายต่อรูป — ต้อง --dry-run ให้ผู้ใช้ยืนยันก่อนรันจริงเสมอ
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import {
  loadEnv, parseArgs, projectDir, info, ok, warn, fail, c, dryRunBanner,
} from './lib/util.mjs';
import { generateImage, validateSpec } from './lib/kie.mjs';

loadEnv();
const args = parseArgs();
const dir = projectDir(args);
const dry = Boolean(args['dry-run']);

const assetsPath = join(dir, 'assets.json');
if (!existsSync(assetsPath)) fail(`ไม่พบ ${assetsPath}`);
const plan = JSON.parse(readFileSync(assetsPath, 'utf8'));

// ── moodboard mode ────────────────────────────────────────────
if (args.moodboard) {
  const promptFile = args['prompt-file'] || join(dir, '..', '..', 'context', 'brand-identity', 'moodboard-prompt.txt');
  if (!existsSync(promptFile)) {
    fail(
      `ไม่พบไฟล์ prompt: ${promptFile}\n` +
        'ให้ skill create-moodboard เขียน prompt ลงไฟล์นี้ก่อน (หรือระบุ --prompt-file)',
    );
  }
  const prompt = readFileSync(promptFile, 'utf8').trim();
  const spec = {
    id: 'moodboard',
    prompt,
    aspect_ratio: plan.moodboard?.aspect_ratio || '9:16',
    resolution: plan.moodboard?.resolution || '2K',
  };
  const out = join(dir, plan.moodboard?.file || '../../../context/brand-identity/moodboard.png');

  dryRunBanner(dry);
  info(`${c.bold('moodboard')} → ${out}`);
  info(`  ratio ${spec.aspect_ratio} · ${spec.resolution}`);
  info(c.dim(`  ${prompt.slice(0, 300)}${prompt.length > 300 ? '…' : ''}`));

  if (dry) {
    info(c.yellow('\ndry run — ยังไม่ generate'));
    process.exit(0);
  }
  try {
    validateSpec(spec);
    mkdirSync(dirname(out), { recursive: true });
    await generateImage(spec, out);
    ok(`moodboard → ${out}`);
  } catch (err) {
    fail(err.message);
  }
  process.exit(0);
}

// ── เลือกรายการที่จะ gen ──────────────────────────────────────
let list = plan.assets;

if (args.only) {
  const ids = String(args.only).split(',').map((s) => s.trim());
  list = list.filter((a) => ids.includes(a.id));
  const missing = ids.filter((id) => !plan.assets.some((a) => a.id === id));
  if (missing.length) warn(`ไม่พบ id: ${missing.join(', ')}`);
}

if (args.priority) {
  const wanted = String(args.priority).toUpperCase().split(',').map((s) => s.trim());
  list = list.filter((a) => wanted.includes(a.priority));
}

if (!list.length) fail('ไม่มีรูปที่ตรงกับเงื่อนไข');

const outDir = join(dir, plan.outDir || 'public/assets');
mkdirSync(outDir, { recursive: true });

// ── validate ทุก spec ก่อน ยิง API (กันเสีย credit กลางทาง) ────
const bad = [];
for (const a of list) {
  try {
    validateSpec(a);
  } catch (err) {
    bad.push(err.message);
  }
}
if (bad.length) fail(`spec ไม่ถูกต้อง:\n${bad.join('\n')}`);

// ── สรุปให้ผู้ใช้เห็นก่อน ──────────────────────────────────────
dryRunBanner(dry);
info(`${c.bold(`${list.length} รูป`)} จะถูก generate ลง ${plan.outDir}\n`);

const skipped = [];
const queue = [];
for (const a of list) {
  const out = join(outDir, a.file);
  const exists = existsSync(out);
  if (exists && !args.force) {
    skipped.push(a.id);
    continue;
  }
  queue.push({ ...a, out });

  info(`${c.bold(a.id.padEnd(14))} ${a.priority}  ${a.aspect_ratio.padEnd(6)} ${a.resolution}  → ${a.file}`);
  info(c.dim(`  section: ${a.section}`));
  info(c.dim(`  alt: ${a.alt}`));
  info(c.dim(`  prompt: ${a.prompt.slice(0, 220)}${a.prompt.length > 220 ? '…' : ''}\n`));
}

if (skipped.length) {
  warn(`ข้าม ${skipped.length} รูปที่มีไฟล์อยู่แล้ว (${skipped.join(', ')}) — ใช้ --force ถ้าจะ gen ทับ`);
}

if (!queue.length) {
  info('ไม่มีอะไรต้อง generate');
  process.exit(0);
}

if (dry) {
  info(c.yellow(`\ndry run — ยังไม่ generate (${queue.length} รูป)`));
  info(c.dim('ถ้า prompt ผ่านแล้ว รันซ้ำโดยตัด --dry-run ออก'));
  process.exit(0);
}

// ── generate ทีละรูป (ไม่ยิงพร้อมกัน กัน rate limit) ────────────
info(c.yellow(`\n💰 กำลัง generate จริง ${queue.length} รูป — มีค่าใช้จ่าย\n`));

let done = 0;
const failed = [];

for (const a of queue) {
  info(`[${++done}/${queue.length}] ${a.id} …`);
  try {
    await generateImage(a, a.out);
    ok(`${a.id} → ${a.file}`);
  } catch (err) {
    failed.push(`${a.id}: ${err.message}`);
    warn(`${a.id} ล้มเหลว — ${err.message}`);
    if (err.status === 402) {
      fail('เครดิตหมด — หยุดทั้งหมดเพื่อไม่ให้ยิงเปล่า');
    }
  }
}

info('');
ok(`สำเร็จ ${queue.length - failed.length}/${queue.length} รูป`);
if (failed.length) {
  warn(`ล้มเหลว:\n${failed.map((f) => `  - ${f}`).join('\n')}`);
}
info(c.dim('\nขั้นต่อไป: node scripts/optimize-images.mjs'));
