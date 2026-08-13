#!/usr/bin/env node
/**
 * config HubSpot ให้ตรงกับ catalog.json โดยอัตโนมัติ
 *   - ดัด deal pipeline + สเตจให้ตรง funnel ของ salepage (ตาม hubspot.pipelineSetup)
 *   - สร้าง custom deal properties
 *   - สร้าง products (1 รายการต่อ 1 offer) แล้วเขียน id กลับเข้า catalog.json
 *
 *   node scripts/setup-hubspot.mjs --dry-run    ← ดู payload ที่จะส่ง (ไม่ต้องมี token · ไม่เรียก API)
 *   node scripts/setup-hubspot.mjs --plan       ← อ่านของจริงมาเทียบ (read-only ไม่เขียนอะไรเลย)
 *   node scripts/setup-hubspot.mjs              ← รันจริง
 *
 * idempotent: รันซ้ำได้ ของที่มีอยู่แล้วจะถูกข้าม (HubSpot ตอบ 409)
 * spec: technical-setup.md ส่วน C1 (ในโฟลเดอร์ project)
 */
import {
  loadEnv, parseArgs, readCatalog, writeCatalog, info, ok, warn, fail, c, dryRunBanner,
  hubspotAccount,
} from './lib/util.mjs';
import { planPipeline, describePlan, syncPipeline, writeBackStages } from './lib/pipeline.mjs';

loadEnv();
const args = parseArgs();
const dry = Boolean(args['dry-run']);
const planOnly = Boolean(args.plan);
const { path: catalogPath, catalog } = readCatalog(args);

const BASE = 'https://api.hubapi.com';
const prefix = catalog.propertyPrefix || 'brand';
const catalogName = catalogPath.split('/').slice(-2).join('/');

function optionsFor(source) {
  const list = catalog[source] || [];
  return list.map((item, i) => ({ label: item.label, value: item.id, displayOrder: i }));
}

// ── สร้าง payload ทั้งหมดก่อน (dry-run จะได้เห็นครบ) ─────────────
let pipelinePlan = null;
try {
  pipelinePlan = planPipeline(catalog);
} catch (err) {
  fail(`${catalogName} → hubspot.pipelineSetup ยังไม่ถูกต้อง:\n${err.message}`);
}

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

// ── สรุปสิ่งที่จะทำ ────────────────────────────────────────────
dryRunBanner(dry);
if (planOnly) info(c.yellow('── PLAN — อ่านของจริงมาเทียบ ไม่มีการเขียนข้อมูล ──'));
info(`${c.bold('HubSpot setup')} — brand: ${catalog.brand}\n`);

info(c.bold('1) Deal pipeline + สเตจ'));
if (pipelinePlan) {
  const target = pipelinePlan.mode === 'create'
    ? `สร้าง pipeline ใหม่ "${pipelinePlan.pipelineLabel}"`
    : `ดัดสเตจของ pipeline "${pipelinePlan.pipelineId}" ให้ตรง funnel นี้`;
  info(c.dim(`   ${target}`));
  info(c.dim('   GET/POST/PATCH /crm/v3/pipelines/deals'));
  for (const line of describePlan(pipelinePlan)) info(line);
} else {
  warn(`${catalogName} ไม่มี hubspot.pipelineSetup — ข้ามขั้นนี้ (ใช้สเตจเดิมใน HubSpot ต่อไป)`);
}

info(`\n${c.bold(`2) Custom deal properties (${propertyPayloads.length})`)}`);
info(c.dim('   POST /crm/v3/properties/deals'));
for (const p of propertyPayloads) {
  const opts = p.options ? ` [${p.options.map((o) => o.value).join(', ')}]` : '';
  info(`   • ${p.name.padEnd(26)} ${p.type}/${p.fieldType}${opts}`);
}

info(`\n${c.bold(`3) Products (${productPayloads.length})`)}`);
info(c.dim('   POST /crm/v3/objects/products'));
for (const p of productPayloads) {
  info(`   • ${p.sku.padEnd(16)} ${p.properties.name.padEnd(20)} ${p.properties.price} ${catalog.currency}`);
}

if (dry) {
  if (pipelinePlan) {
    info(`\n${c.dim('stage ที่ api จะใช้ (เขียนกลับเข้า catalog.json ให้เอง หลังรันจริง):')}`);
    for (const [role, key] of Object.entries(pipelinePlan.roles)) {
      info(c.dim(`  ${role.padEnd(11)} → stage "${key}"`));
    }
  }
  info(`\n${c.dim('payload ตัวอย่าง (property แรก):')}`);
  info(c.dim(JSON.stringify(propertyPayloads[0], null, 2)));
  info(`\n${c.dim('payload ตัวอย่าง (product แรก):')}`);
  info(c.dim(JSON.stringify(productPayloads[0], null, 2)));
  info(c.yellow('\ndry run — ไม่มีการเรียก API'));
  info(c.dim('ขั้นต่อไป: node scripts/setup-hubspot.mjs --plan (อ่านของจริงมาเทียบ ยังไม่เขียน)'));
  process.exit(0);
}

// ── ต้องมี token ตั้งแต่ตรงนี้ (ทั้ง --plan และรันจริง) ──────────
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

/** ข้อความ error ของ HubSpot ที่เจอบ่อย — ให้ทางแก้ ไม่ใช่แค่บอกว่าพัง */
function explain(err, what) {
  if (err.status === 401) return 'HubSpot 401 — token ไม่ถูกต้อง/หมดอายุ (ดู technical-setup.md B1)';
  if (err.status === 403) {
    return `HubSpot 403 — scope ไม่ครบสำหรับ${what}\n` +
      'ต้องมี crm.schemas.deals.write + crm.objects.deals.read/write ' +
      '(บางบัญชีต้องติ๊ก crm.pipelines.deals.write เพิ่ม) แล้ว generate token ใหม่';
  }
  return err.message;
}

// ── โหมด --plan: อ่านของจริงมาเทียบ ไม่เขียนอะไรเลย ──────────────
if (planOnly) {
  info(`\n${c.bold('เทียบกับของจริงใน HubSpot')}`);

  if (pipelinePlan) {
    try {
      const result = await syncPipeline({ hs, plan: pipelinePlan, apply: false });
      info(`\n  pipeline: ${result.pipelineLabel || pipelinePlan.pipelineLabel} (id ${result.pipelineId || 'ยังไม่มี'})`);
      for (const a of result.actions) {
        if (a.type === 'create-pipeline') info(`  ${c.green('+')} สร้าง pipeline "${a.label}" พร้อมสเตจทั้งหมด`);
        else if (a.type === 'keep') info(`  ${c.dim('=')} ${a.stage.label.padEnd(28)} ${c.dim(`ตรงแล้ว (id ${a.current.id})`)}`);
        else if (a.type === 'create') info(`  ${c.green('+')} ${a.stage.label.padEnd(28)} สร้างสเตจใหม่`);
        else if (a.type === 'update') {
          info(`  ${c.yellow('~')} ${a.stage.label.padEnd(28)} จาก "${a.current.label}" (id ${a.current.id} · แก้ ${Object.keys(a.changes).join(', ')})`);
        } else if (a.type === 'surplus') {
          const why = a.protectedByCatalog ? 'catalog ยังอ้างถึง'
            : a.deals === -1 ? 'นับ deal ไม่ได้'
              : a.deals > 0 ? `มี ${a.deals} deal ค้างอยู่` : '';
          info(`  ${a.removable ? c.red('-') : c.yellow('!')} ${String(a.current.label).padEnd(28)} ${a.removable ? 'จะถูกลบ (ไม่มี deal ค้าง)' : `เก็บไว้ย้ายไปท้ายบอร์ด — ${why}`}`);
        }
      }
    } catch (err) {
      warn(explain(err, 'การอ่าน/แก้ pipeline'));
    }
  }

  try {
    const all = await hs('/crm/v3/properties/deals');
    const names = new Set((all?.results || []).map((p) => p.name));
    info('');
    for (const p of propertyPayloads) {
      info(`  ${names.has(p.name) ? c.dim('=') : c.green('+')} ${p.name.padEnd(26)} ${names.has(p.name) ? c.dim('มีอยู่แล้ว') : 'จะถูกสร้าง'}`);
    }
  } catch (err) {
    warn(explain(err, 'การอ่าน property'));
  }

  info('');
  for (const p of productPayloads) {
    try {
      const found = await hs('/crm/v3/objects/products/search', {
        method: 'POST',
        body: {
          filterGroups: [{ filters: [{ propertyName: 'hs_sku', operator: 'EQ', value: p.sku }] }],
          properties: ['hs_sku'],
          limit: 1,
        },
      });
      const id = found?.results?.[0]?.id;
      info(`  ${id ? c.dim('=') : c.green('+')} ${p.sku.padEnd(16)} ${id ? c.dim(`มีอยู่แล้ว (id ${id})`) : 'จะถูกสร้าง'}`);
    } catch (err) {
      warn(`product ${p.sku} — ${explain(err, 'การอ่าน product')}`);
    }
  }

  info(c.yellow('\nplan — ไม่มีการเขียนข้อมูล'));
  info(c.dim('พอใจกับ plan แล้วรัน: node scripts/setup-hubspot.mjs'));
  process.exit(0);
}

// ── รันจริง ────────────────────────────────────────────────────
info('');
const summary = { pipeline: null, properties: [], products: [] };

// 1) pipeline + สเตจ — ทำก่อน property/product เพราะ deal ทุกใบต้องมีสเตจที่ถูกต้อง
let stageWriteBackMissing = [];
if (pipelinePlan) {
  try {
    const result = await syncPipeline({ hs, plan: pipelinePlan, apply: true, log: ok });
    stageWriteBackMissing = writeBackStages(catalog, pipelinePlan, result);
    const moved = result.actions.filter((a) => a.movedToEnd);
    const deleted = result.actions.filter((a) => a.deleted);
    summary.pipeline = {
      id: result.pipelineId,
      label: result.pipelineLabel,
      stages: Object.keys(result.stageIds).length,
      deleted: deleted.length,
      moved: moved.length,
    };
    for (const a of moved) {
      warn(
        `stage "${a.current.label}" ไม่ได้อยู่ใน funnel นี้ แต่ลบไม่ได้ — ` +
          `${a.protectedByCatalog ? 'catalog ยังอ้างถึง' : a.deals === -1 ? 'นับ deal ไม่ได้' : `มี ${a.deals} deal ค้างอยู่`}` +
          ' → ย้ายไปท้ายบอร์ดแล้ว (ย้าย deal ออกแล้วรันซ้ำถ้าต้องการลบ)',
      );
    }
    for (const a of result.actions.filter((x) => x.error)) {
      warn(`stage "${a.current.label}" — จัดการไม่สำเร็จ: ${a.error} (ลบเองใน HubSpot หรือรันซ้ำได้)`);
    }
    ok(`pipeline "${result.pipelineLabel}" ตรงกับ funnel แล้ว (${Object.keys(result.stageIds).length} สเตจ)`);
  } catch (err) {
    // ไม่ล้มทั้ง script — property/product ยังทำต่อได้ และ stage id เดิมใน catalog ยังใช้งานได้อยู่
    warn(`pipeline — ${explain(err, 'การแก้ pipeline')}`);
    summary.pipeline = { error: err.message };
  }
}

// 2) properties
info('');
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

// 3) products — เช็คก่อนว่ามี sku นี้อยู่แล้วไหม
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
if (summary.pipeline?.id) {
  info(`  pipeline:   ${summary.pipeline.label} (id ${summary.pipeline.id}) · ${summary.pipeline.stages} สเตจ` +
    `${summary.pipeline.deleted ? ` · ลบสเตจที่ไม่ใช้ ${summary.pipeline.deleted}` : ''}` +
    `${summary.pipeline.moved ? ` · ย้ายไปท้ายบอร์ด ${summary.pipeline.moved}` : ''}`);
  info(`  stage:      lead → ${catalog.hubspot.stageOnLead} · paid → ${catalog.hubspot.stageOnPaid}` +
    `${catalog.hubspot.stageOnCheckout ? ` · checkout → ${catalog.hubspot.stageOnCheckout}` : ''}`);
} else if (summary.pipeline?.error) {
  warn(`  pipeline:   ไม่สำเร็จ — stage id ใน catalog.json ยังเป็นค่าเดิม (ระบบเดิมยังทำงานได้)`);
}
info(`  properties: ${summary.properties.filter((s) => s.status === 'created').length} created · ` +
  `${summary.properties.filter((s) => s.status === 'exists').length} มีอยู่แล้ว`);
info(`  products:   ${summary.products.filter((s) => s.status === 'created').length} created · ` +
  `${summary.products.filter((s) => s.status === 'exists').length} มีอยู่แล้ว`);
ok(`เขียน hubspotProductId + stage id กลับเข้า ${catalogName}`);

if (stageWriteBackMissing.length) {
  warn(`ยังไม่ได้ stage id ของ: ${stageWriteBackMissing.join(', ')} — api จะยังใช้ค่าเดิม รันซ้ำอีกครั้ง`);
}

if (summary.pipeline?.id) {
  info(c.yellow(
    '\n⚠️  stage id อยู่ใน catalog.json ซึ่ง Vercel อ่านตอน runtime — ต้อง commit + push ให้ deploy ใหม่\n' +
    '    ก่อนหน้านั้น deployment เดิมยังใช้ stage id ชุดเก่า (ยังทำงานได้ เพราะ rename ไม่เปลี่ยน id)',
  ));
}

const account = await hubspotAccount();
if (account) {
  const { portalId, uiDomain } = account;
  info(c.dim(`\nดู products: https://${uiDomain}/products/${portalId}`));
  info(c.dim(`ดู deals:    https://${uiDomain}/contacts/${portalId}/objects/0-3/views/all/board`));
  info(c.dim(`ดู pipeline: https://${uiDomain}/settings/${portalId}/objects/0-3/pipelines`));
}
info(c.dim('\nขั้นต่อไป: node scripts/setup-stripe.mjs --dry-run'));
