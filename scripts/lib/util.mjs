/**
 * helper ที่ทุก script ใช้ร่วมกัน — โหลด .env, อ่าน args, อ่าน/เขียน catalog.json
 * Node 20+ (ใช้ fetch built-in) ไม่ต้องลง dependency เพิ่ม
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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

/** ต้องระบุ project ได้ด้วย --project ถ้าไม่ใช่ salepage_glow */
export function projectDir(args) {
  const name = args.project || 'salepage_glow';
  const dir = join(REPO_ROOT, 'workspace', name);
  if (!existsSync(dir)) {
    fail(`ไม่พบ project: workspace/${name}\nระบุด้วย --project [ชื่อโฟลเดอร์]`);
  }
  return dir;
}

export function readCatalog(args) {
  const path = join(projectDir(args), 'catalog.json');
  if (!existsSync(path)) fail(`ไม่พบ ${path}\nให้ skill setup-crm สร้าง catalog.json ก่อน`);
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
