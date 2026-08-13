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

/** ชื่อโฟลเดอร์ template ที่ไม่ใช่ page จริง */
const TEMPLATE_DIR = '[SALEPAGE_SLUG]';

/**
 * list page ที่มีอยู่ใน public_pages/
 * **ชื่อโฟลเดอร์ = URL slug** เช่น public_pages/page_a → [domain]/page_a
 * ข้าม template, โฟลเดอร์ที่ขึ้นต้นด้วย _ หรือ . และ node_modules
 */
export function listProjects() {
  const ws = join(REPO_ROOT, 'public_pages');
  if (!existsSync(ws)) return [];
  return readdirSync(ws, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        d.name !== TEMPLATE_DIR &&
        d.name !== 'node_modules' &&
        !d.name.startsWith('_') &&
        !d.name.startsWith('.'),
    )
    .map((d) => d.name)
    .sort();
}

/** ตรวจว่าชื่อโฟลเดอร์ใช้เป็น URL segment ได้ (a-z 0-9 - _ เท่านั้น) */
export function assertValidSlug(name) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) {
    fail(
      `ชื่อโฟลเดอร์ "${name}" ใช้เป็น URL ไม่ได้\n` +
        'ชื่อโฟลเดอร์ใน public_pages/ = URL slug → ใช้ได้แค่ a-z 0-9 - _ และต้องเริ่มด้วยตัวอักษร/เลข\n' +
        'เช่น page_a, glow, ice-bath',
    );
  }
  return name;
}

/**
 * หา project folder: ใช้ --project ถ้าระบุมา
 * ถ้าไม่ระบุและมี project เดียวใน public_pages/ → ใช้อันนั้นเลย
 * ถ้ามีหลายอัน → ให้ผู้ใช้เลือก
 */
export function projectDir(args) {
  if (args.project) {
    const dir = join(REPO_ROOT, 'public_pages', args.project);
    if (!existsSync(dir)) fail(`ไม่พบ project: public_pages/${args.project}`);
    return dir;
  }

  const found = listProjects();
  if (found.length === 1) return join(REPO_ROOT, 'public_pages', found[0]);

  if (found.length === 0) {
    fail(
      'ยังไม่มีหน้าเพจใน public_pages/\n' +
        `สร้างก่อนด้วย:  cp -r "public_pages/${TEMPLATE_DIR}" public_pages/[slug]\n` +
        'ชื่อโฟลเดอร์คือ URL ของหน้านั้น (เช่น page_a → [domain]/page_a)\n' +
        '(หรือให้ skill generate-salepage ทำให้ใน Stop 0)',
    );
  }
  fail(`มีหลายหน้า — ระบุด้วย --project [slug]\nที่มีอยู่: ${found.join(', ')}`);
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

/**
 * ดึง portalId + uiDomain จาก HubSpot เอง — ผู้ใช้ไม่ต้องกรอก HUBSPOT_PORTAL_ID
 * `uiDomain` สำคัญ: บัญชีที่อยู่ region อื่นใช้ app-na2.hubspot.com ไม่ใช่ app.hubspot.com
 * ใช้ scope เดิมที่มีอยู่แล้ว ไม่ต้องเพิ่ม
 * คืน null ถ้าเรียกไม่สำเร็จ — ลิงก์เป็นของแถม ห้ามทำให้ script ล้มเพราะเรื่องนี้
 */
let _accountInfo;
export async function hubspotAccount(token = process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
  if (_accountInfo !== undefined) return _accountInfo;
  _accountInfo = null;

  if (token) {
    try {
      const res = await fetch('https://api.hubapi.com/account-info/v3/details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        if (d?.portalId) {
          _accountInfo = {
            portalId: String(d.portalId),
            uiDomain: d.uiDomain || 'app.hubspot.com',
          };
        }
      }
    } catch {
      // เงียบไว้ — ไม่มีลิงก์ก็ยังทำงานได้
    }
  }

  // เผื่อกรอก HUBSPOT_PORTAL_ID เองไว้ (ไม่จำเป็นแล้ว แต่ยังรองรับ)
  if (!_accountInfo && process.env.HUBSPOT_PORTAL_ID) {
    _accountInfo = {
      portalId: process.env.HUBSPOT_PORTAL_ID,
      uiDomain: 'app.hubspot.com',
    };
  }
  return _accountInfo;
}
