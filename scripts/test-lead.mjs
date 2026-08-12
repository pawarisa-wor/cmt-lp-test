#!/usr/bin/env node
/**
 * ยิง lead ปลอมเข้าระบบ แล้วเช็คว่าเข้า HubSpot จริง (Contact + Deal + deal properties)
 *
 *   node scripts/test-lead.mjs --dry-run                 ดู payload ที่จะส่ง
 *   node scripts/test-lead.mjs                           ยิงเข้า http://localhost:3000
 *   node scripts/test-lead.mjs --url https://xxx.vercel.app
 *   node scripts/test-lead.mjs --project page_b          ระบุหน้า (ถ้ามีหลายหน้าใน workspace/)
 *   node scripts/test-lead.mjs --sku GLOW-ALLIN --checkout
 *
 * ต้องรัน `vercel dev` ที่ root ของ repo ไว้ก่อน (ถ้าทดสอบ local)
 */
import { basename, dirname } from 'node:path';
import {
  loadEnv, parseArgs, readCatalog, info, ok, warn, fail, c, dryRunBanner,
} from './lib/util.mjs';

loadEnv();
const args = parseArgs();
const dry = Boolean(args['dry-run']);
const { path: catalogPath, catalog } = readCatalog(args);

const base = String(args.url || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const hero = catalog.offers.find((o) => o.hero) || catalog.offers[0];
const sku = String(args.sku || hero.sku);
const offer = catalog.offers.find((o) => o.sku === sku);
if (!offer) fail(`ไม่พบ sku ${sku} ใน catalog.json`);

// slug ของหน้า = ชื่อโฟลเดอร์ใน workspace/ (API ใช้เลือก catalog ของหน้านั้น)
const page = basename(dirname(catalogPath));

const stamp = Date.now();
const payload = {
  page,
  name: args.name || `ทดสอบ ระบบ ${String(stamp).slice(-4)}`,
  email: args.email || `test+${stamp}@example.com`,
  phone: args.phone || '0812345678',
  sku,
  // optional — ส่งเฉพาะถ้าหน้านั้นมีช่องให้เลือก
  ...(args.location ? { location: args.location } : {}),
  ...(args.service ? { service: args.service } : {}),
};

// ── สรุปก่อนยิง ────────────────────────────────────────────────
dryRunBanner(dry);
info(`${c.bold('Test lead')} → ${base}/api/lead   (page: ${c.bold(page)} → ${base}/${page})\n`);
info(c.dim(JSON.stringify(payload, null, 2)));
info(`\nคาดว่าจะได้: Contact ใหม่ + Deal "${catalog.brand} — ${offer.name} — ${payload.name}"`);
info(`  stage: ${catalog.hubspot.stageOnLead} · amount: ${offer.price} ${catalog.currency}`);
info(`  ${catalog.propertyPrefix}_package = ${offer.sku}`);
if (payload.location) info(`  ${catalog.propertyPrefix}_location = ${payload.location}`);
info(`  ${catalog.propertyPrefix}_source_page = ${page}`);

if (dry) {
  info(c.yellow('\ndry run — ไม่มีการยิง request'));
  process.exit(0);
}

// ── ยิง /api/lead ──────────────────────────────────────────────
info('');
let lead;
try {
  const res = await fetch(`${base}/api/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* ไม่ใช่ JSON */ }

  if (!res.ok || !json?.ok) {
    if (json?.errors) {
      warn(`validation ไม่ผ่าน: ${JSON.stringify(json.errors)}`);
    }
    fail(
      `/api/lead ตอบ ${res.status}\n${json?.error || text.slice(0, 300)}\n\n` +
        'เช็ค: vercel dev รันอยู่ที่ root ของ repo ไหม · .env มี HUBSPOT_PRIVATE_APP_TOKEN ไหม\n' +
        `เช็คว่า catalog ของหน้า "${page}" อ่านได้: node scripts/build-site.mjs --dry-run`,
    );
  }

  lead = json;
  ok(`lead เข้าระบบแล้ว — contactId ${lead.contactId} (${lead.contactCreated ? 'สร้างใหม่' : 'อัปเดตของเดิม'}) · dealId ${lead.dealId}`);
} catch (err) {
  fail(`ยิง /api/lead ไม่สำเร็จ — ${err.message}\nรัน vercel dev ที่ root ของ repo ก่อน`);
}

// ── verify ใน HubSpot โดยตรง ───────────────────────────────────
const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!token) {
  warn('ไม่มี HUBSPOT_PRIVATE_APP_TOKEN ใน .env — ข้ามการ verify ฝั่ง HubSpot');
} else {
  const p = catalog.propertyPrefix;
  const props = [
    'dealname', 'dealstage', 'amount',
    `${p}_package`, `${p}_location`, `${p}_service_interest`, `${p}_source_page`,
  ];

  try {
    const res = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/${lead.dealId}` +
        `?properties=${props.join(',')}&associations=contacts`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`HubSpot ตอบ ${res.status}`);
    const deal = await res.json();

    info(`\n${c.bold('ตรวจ deal ใน HubSpot')}`);
    for (const key of props) {
      const val = deal.properties?.[key];
      info(`  ${key.padEnd(26)} ${val ? c.green(val) : c.yellow('(ว่าง)')}`);
    }

    const linked = deal.associations?.contacts?.results?.some((r) => r.id === lead.contactId);
    info(`  ${'associated contact'.padEnd(26)} ${linked ? c.green('ผูกแล้ว ✓') : c.red('ไม่ได้ผูก ✗')}`);

    const expectAmount = String(offer.price);
    if (deal.properties?.amount && Number(deal.properties.amount) !== Number(expectAmount)) {
      warn(`amount ไม่ตรง catalog (ได้ ${deal.properties.amount} คาดว่า ${expectAmount})`);
    }
    if (!linked) warn('deal ไม่ได้ผูกกับ contact — เช็ค associationTypeId ใน catalog.json (ต้องเป็น 3)');
  } catch (err) {
    warn(`verify ไม่สำเร็จ — ${err.message}`);
  }

  if (process.env.HUBSPOT_PORTAL_ID) {
    info(
      c.dim(
        `\nเปิดดู: https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/deal/${lead.dealId}`,
      ),
    );
  }
}

// ── ทดสอบ checkout ต่อ (optional) ──────────────────────────────
if (args.checkout) {
  info(`\n${c.bold('ทดสอบ /api/checkout')}`);
  try {
    const res = await fetch(`${base}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, sku, dealId: lead.dealId, email: payload.email }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      warn(`checkout ไม่สำเร็จ: ${json.error || res.status}`);
    } else {
      ok('สร้าง Checkout Session แล้ว');
      info(`  เปิดลิงก์นี้แล้วจ่ายด้วยบัตรทดสอบ 4242 4242 4242 4242:\n  ${json.url}`);
      info(c.dim('  จ่ายเสร็จ deal ต้องเปลี่ยนเป็น closedwon (ต้องรัน stripe listen ไว้ด้วย)'));
    }
  } catch (err) {
    warn(`checkout error — ${err.message}`);
  }
}

info(`\n${c.dim('ลบข้อมูลทดสอบ: ค้น email ' + payload.email + ' ใน HubSpot แล้วลบ contact/deal ทิ้ง')}`);
