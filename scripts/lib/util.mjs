/**
 * helper ที่ทุก script ใช้ร่วมกัน — โหลด .env, อ่าน args, อ่าน/เขียน catalog.json
 * Node 20+ (ใช้ fetch built-in) ไม่ต้องลง dependency เพิ่ม
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, '..', '..');

/** โหลด .env ที่ root ของ repo เข้า process.env (ไม่ทับค่าที่มีอยู่แล้ว) */
export function loadEnv() {
  const path = join(REPO_ROOT, '.env');
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

/** parse argv แบบง่าย: --flag / --key value / --key=value */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }
    const body = a.slice(2);
    if (body.includes('=')) {
      const [k, ...rest] = body.split('=');
      out[k] = rest.join('=');
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      out[body] = argv[++i];
    } else {
      out[body] = true;
    }
  }
  return out;
}

/** ชื่อโฟลเดอร์ template ที่ไม่ใช่ project จริง */
const TEMPLATE_DIR = 'salepage_[PROJECT]';

/** list project ที่มีอยู่ใน workspace/ (ไม่รวม template) */
export function listProjects() {
  const ws = join(REPO_ROOT, 'workspace');
  if (!existsSync(ws)) return [];
  return readdirSync(ws, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('salepage_') && d.name !== TEMPLATE_DIR)
    .map((d) => d.name);
}

/**
 * หา project folder: ใช้ --project ถ้าระบุมา
 * ถ้าไม่ระบุและมี project เดียวใน workspace/ → ใช้อันนั้นเลย
 * ถ้ามีหลายอัน → ให้ผู้ใช้เลือก
 */
export function projectDir(args) {
  if (args.project) {
    const dir = join(REPO_ROOT, 'workspace', args.project);
    if (!existsSync(dir)) fail(`ไม่พบ project: workspace/${args.project}`);
    return dir;
  }

  const found = listProjects();
  if (found.length === 1) return join(REPO_ROOT, 'workspace', found[0]);

  if (found.length === 0) {
    fail(
      'ยังไม่มี salepage project ใน workspace/\n' +
        `สร้างก่อนด้วย:  cp -r "workspace/${TEMPLATE_DIR}" workspace/salepage_[ชื่อโปรเจกต์]\n` +
        '(หรือให้ skill generate-salepage ทำให้ใน Stop 0)',
    );
  }
  fail(`มีหลาย project — ระบุด้วย --project [ชื่อ]\nที่มีอยู่: ${found.join(', ')}`);
}

export function readCatalog(args) {
  const dir = projectDir(args);
  const path = join(dir, 'catalog.json');
  if (!existsSync(path)) {
    fail(
      `ยังไม่มี catalog.json ใน ${dir.replace(REPO_ROOT + '/', '')}\n` +
        'catalog.json คือแหล่งความจริงเดียวของ offers/ราคา/sku — สร้างจาก context/offers.md\n' +
        'ให้ Claude ใช้ skill setup-crm (Step 1) แปลง offers.md → catalog.json ก่อน',
    );
  }
  return { path, catalog: JSON.parse(readFileSync(path, 'utf8')) };
}

export function writeCatalog(path, catalog) {
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}

/** อ่าน env ที่จำเป็น — ถ้าไม่มี บอกชื่อตัวแปร (ห้าม print ค่า) */
export function requireEnv(name, hint = '') {
  const v = process.env[name];
  if (!v) fail(`ยังไม่ได้ตั้งค่า ${name} ใน .env${hint ? `\n${hint}` : ''}`);
  return v;
}

export const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

export function info(msg) {
  console.log(msg);
}
export function ok(msg) {
  console.log(`${c.green('✓')} ${msg}`);
}
export function warn(msg) {
  console.log(`${c.yellow('!')} ${msg}`);
}
export function fail(msg) {
  console.error(`${c.red('✗')} ${msg}`);
  process.exit(1);
}

export function dryRunBanner(isDry) {
  if (isDry) {
    console.log(c.yellow('── DRY RUN — ไม่มีการเรียก API จริง ──'));
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
