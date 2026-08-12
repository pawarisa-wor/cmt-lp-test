#!/usr/bin/env node
/**
 * config HubSpot ให้ตรงกับ catalog.json โดยอัตโนมัติ
 *   - สร้าง custom deal properties
 *   - สร้าง products (1 รายการต่อ 1 offer) แล้วเขียน id กลับเข้า catalog.json
 *
 *   node scripts/setup-hubspot.mjs --dry-run    ← ดู payload ที่จะส่ง (ไม่ต้องมี token)
 *   node scripts/setup-hubspot.mjs              ← รันจริง
 *
 * idempotent: รันซ้ำได้ ของที่มีอยู่แล้วจะถูกข้าม (HubSpot ตอบ 409)
 * spec: technical-setup.md ส่วน C1 (ในโฟลเดอร์ project)
 */
import {
  loadEnv, parseArgs, readCatalog, writeCatalog, info, ok, warn, fail, c, dryRunBanner,
} from './lib/util.mjs';

loadEnv();
const args = parseArgs();
const dry = Boolean(args['dry-run']);
const { path: catalogPath, catalog } = readCatalog(args);

const BASE = 'https://api.hubapi.com';
const prefix = catalog.propertyPrefix || 'brand';

function optionsFor(source) {
  const list = catalog[source] || [];
  return list.map((item, i) => ({ label: item.label, value: item.id, displayOrder: i }));
}

// ── สร้าง payload ทั้งหมดก่อน (dry-run จะได้เห็นครบ) ─────────────
const propertyPayloads = (catalog.dealProperties || []).map((p) => ({
  name: `${prefix}_${p.name}`,
  label: p.label,
  type: p.type,
  fieldType: p.fieldType,
  groupName: 'dealinformation',
  ...(p.optionsFrom ? { options: optionsFor(p.optionsFrom) } : {}),
}));

const productPayloads = catalog.offers.map((o) => ({
  sku: o.sku,
  properties: {
    name: o.name,
    price: String(o.price),
    hs_sku: o.sku,
    description: o.description || '',
  },
}));

// ── dry run ───────────────────────────────────────────────────
dryRunBanner(dry);
info(`${c.bold('HubSpot setup')} — brand: ${catalog.brand}\n`);

info(c.bold(`1) Custom deal properties (${propertyPayloads.length})`));
info(c.dim('   POST /crm/v3/properties/deals'));
for (const p of propertyPayloads) {
  const opts = p.options ? ` [${p.options.map((o) => o.value).join(', ')}]` : '';
  info(`   • ${p.name.padEnd(26)} ${p.type}/${p.fieldType}${opts}`);
}

info(`\n${c.bold(`2) Products (${productPayloads.length})`)}`);
info(c.dim('   POST /crm/v3/objects/products'));
for (const p of productPayloads) {
  info(`   • ${p.sku.padEnd(16)} ${p.properties.name.padEnd(20)} ${p.properties.price} ${catalog.currency}`);
}

if (dry) {
  info(`\n${c.dim('payload ตัวอย่าง (property แรก):')}`);
  info(c.dim(JSON.stringify(propertyPayloads[0], null, 2)));
  info(`\n${c.dim('payload ตัวอย่าง (product แรก):')}`);
  info(c.dim(JSON.stringify(productPayloads[0], null, 2)));
  info(c.yellow('\ndry run — ไม่มีการเรียก API'));
  process.exit(0);
}

// ── รันจริง ────────────────────────────────────────────────────
const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!token) {
  fail('ยังไม่ได้ตั้งค่า HUBSPOT_PRIVATE_APP_TOKEN ใน .env\nดู technical-setup.md ส่วน B1');
}

async function hs(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error */ }
  if (!res.ok) {
    const err = new Error(json?.message || `HubSpot ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

info('');
const summary = { properties: [], products: [] };

// 1) properties
for (const p of propertyPayloads) {
  try {
    await hs('/crm/v3/properties/deals', { method: 'POST', body: p });
    ok(`property ${p.name} — created`);
    summary.properties.push({ name: p.name, status: 'created' });
  } catch (err) {
    if (err.status === 409) {
      warn(`property ${p.name} — มีอยู่แล้ว (ข้าม)`);
      summary.properties.push({ name: p.name, status: 'exists' });
    } else if (err.status === 401) {
      fail('HubSpot 401 — token ไม่ถูกต้อง/หมดอายุ (ดู technical-setup.md B1)');
    } else if (err.status === 403) {
      fail(
        'HubSpot 403 — scope ไม่ครบ\n' +
          'ต้องมี crm.schemas.deals.write แล้ว generate token ใหม่ (แก้ scope เฉยๆ ไม่พอ)',
      );
    } else {
      warn(`property ${p.name} — ${err.message}`);
      summary.properties.push({ name: p.name, status: `error: ${err.message}` });
    }
  }
}

// 2) products — เช็คก่อนว่ามี sku นี้อยู่แล้วไหม
info('');
for (const p of productPayloads) {
  const offer = catalog.offers.find((o) => o.sku === p.sku);
  try {
    const found = await hs('/crm/v3/objects/products/search', {
      method: 'POST',
      body: {
        filterGroups: [{ filters: [{ propertyName: 'hs_sku', operator: 'EQ', value: p.sku }] }],
        properties: ['hs_sku', 'name'],
        limit: 1,
      },
    });

    if (found?.results?.length) {
      const id = found.results[0].id;
      offer.hubspotProductId = id;
      warn(`product ${p.sku} — มีอยู่แล้ว (id ${id})`);
      summary.products.push({ sku: p.sku, status: 'exists', id });
      continue;
    }

    const created = await hs('/crm/v3/objects/products', { method: 'POST', body: { properties: p.properties } });
    offer.hubspotProductId = created.id;
    ok(`product ${p.sku} — created (id ${created.id})`);
    summary.products.push({ sku: p.sku, status: 'created', id: created.id });
  } catch (err) {
    if (err.status === 403) {
      fail('HubSpot 403 — ขาด scope `e-commerce` สำหรับสร้าง product (ดู technical-setup.md B1)');
    }
    warn(`product ${p.sku} — ${err.message}`);
    summary.products.push({ sku: p.sku, status: `error: ${err.message}` });
  }
}

writeCatalog(catalogPath, catalog);

// ── สรุป ──────────────────────────────────────────────────────
info(`\n${c.bold('สรุป')}`);
info(`  properties: ${summary.properties.filter((s) => s.status === 'created').length} created · ` +
  `${summary.properties.filter((s) => s.status === 'exists').length} มีอยู่แล้ว`);
info(`  products:   ${summary.products.filter((s) => s.status === 'created').length} created · ` +
  `${summary.products.filter((s) => s.status === 'exists').length} มีอยู่แล้ว`);
ok(`เขียน hubspotProductId กลับเข้า ${catalogPath.split('/').slice(-2).join('/')}`);

const portal = process.env.HUBSPOT_PORTAL_ID;
if (portal) {
  info(c.dim(`\nดู products: https://app.hubspot.com/products/${portal}`));
  info(c.dim(`ดู deals:    https://app.hubspot.com/contacts/${portal}/objects/0-3/views/all/list`));
}
info(c.dim('\nขั้นต่อไป: node scripts/setup-stripe.mjs --dry-run'));
