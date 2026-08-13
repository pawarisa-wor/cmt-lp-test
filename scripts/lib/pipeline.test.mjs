/**
 * เทสของ scripts/lib/pipeline.mjs — ไม่แตะ HubSpot จริง (hs ปลอมทั้งหมด)
 *   node scripts/lib/pipeline.test.mjs
 *
 * เคสที่ต้องผ่านคือ "แก้สเตจแล้วระบบ submit ไม่พัง": rename ต้องคง id เดิม ·
 * รันซ้ำต้องไม่เขียนอะไร · ห้ามลบสเตจที่มี deal ค้างหรือที่ catalog ยังอ้างถึง
 */
import assert from 'node:assert/strict';
import { planPipeline, syncPipeline, writeBackStages } from './pipeline.mjs';

const DEFAULT_STAGES = [
  ['appointmentscheduled', 'Appointment Scheduled', 0, 'false', '0.2'],
  ['qualifiedtobuy', 'Qualified To Buy', 1, 'false', '0.4'],
  ['presentationscheduled', 'Presentation Scheduled', 2, 'false', '0.6'],
  ['decisionmakerboughtin', 'Decision Maker Bought-In', 3, 'false', '0.8'],
  ['contractsent', 'Contract Sent', 4, 'false', '0.9'],
  ['closedwon', 'Closed Won', 5, 'true', '1.0'],
  ['closedlost', 'Closed Lost', 6, 'true', '0.0'],
].map(([id, label, displayOrder, isClosed, probability]) => ({
  id, label, displayOrder, metadata: { isClosed, probability },
}));

const baseCatalog = () => ({
  brand: 'TEST',
  hubspot: {
    pipeline: 'default',
    stageOnLead: 'appointmentscheduled',
    stageOnCheckout: null,
    stageOnPaid: 'closedwon',
    stageIds: {},
    pipelineSetup: {
      mode: 'adopt',
      stages: [
        { key: 'lead', label: 'ลงทะเบียน', probability: 0.2, use: 'onLead' },
        { key: 'checkout', label: 'เข้าหน้าจ่ายเงิน', probability: 0.5, use: 'onCheckout' },
        { key: 'followup', label: 'ติดตามอยู่', probability: 0.3 },
        { key: 'paid', label: 'จ่ายแล้ว', closed: 'won', use: 'onPaid' },
        { key: 'lost', label: 'ไม่ไปต่อ', closed: 'lost' },
      ],
    },
  },
});

/** hs ปลอม: จำ request ทั้งหมด + จำลอง state ของ pipeline */
function fakeHs({ stages = DEFAULT_STAGES, dealsIn = {} } = {}) {
  const calls = [];
  let state = stages.map((s) => ({ ...s, metadata: { ...s.metadata } }));
  let nextId = 1000;
  const hs = async (path, { method = 'GET', body } = {}) => {
    calls.push({ method, path, body });
    if (path === '/crm/v3/pipelines/deals' && method === 'GET') {
      return { results: [{ id: 'default', label: 'Deals pipeline', displayOrder: 0, stages: state }] };
    }
    if (path === '/crm/v3/objects/deals/search') {
      const stageId = body.filterGroups[0].filters[0].value;
      return { total: dealsIn[stageId] || 0 };
    }
    const stageMatch = path.match(/^\/crm\/v3\/pipelines\/deals\/default\/stages\/([^?]+)/);
    if (stageMatch && method === 'PATCH') {
      const st = state.find((s) => s.id === stageMatch[1]);
      Object.assign(st, { label: body.label, displayOrder: body.displayOrder, metadata: body.metadata });
      return st;
    }
    if (stageMatch && method === 'DELETE') {
      state = state.filter((s) => s.id !== stageMatch[1]);
      return null;
    }
    if (path === '/crm/v3/pipelines/deals/default/stages' && method === 'POST') {
      const created = { id: String(nextId++), ...body };
      state.push(created);
      return created;
    }
    throw new Error(`unexpected call ${method} ${path}`);
  };
  return { hs, calls, state: () => state };
}

// ── 1. รอบแรกบน pipeline default ────────────────────────────────
{
  const catalog = baseCatalog();
  const plan = planPipeline(catalog);
  const { hs, calls, state } = fakeHs();
  const result = await syncPipeline({ hs, plan, apply: true });

  assert.equal(result.pipelineId, 'default');
  assert.deepEqual(result.stageIds, {
    lead: 'appointmentscheduled',
    checkout: 'qualifiedtobuy',
    followup: 'presentationscheduled',
    paid: 'closedwon',
    lost: 'closedlost',
  }, 'rename ทับสเตจเดิม → id ไม่เปลี่ยน');
  assert.equal(state().length, 5, 'สเตจที่ไม่ใช้และไม่มี deal ต้องถูกลบ');
  assert.deepEqual(state().map((s) => s.label), ['ลงทะเบียน', 'เข้าหน้าจ่ายเงิน', 'ติดตามอยู่', 'จ่ายแล้ว', 'ไม่ไปต่อ']);
  // เทียบ "ลำดับ" ไม่ใช่ "เลข" — HubSpot เลื่อน displayOrder ให้เองเวลาเลขชนกัน
  const orders = state().map((s) => Number(s.displayOrder));
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b), 'ลำดับบอร์ดเรียงตามสเปก');
  assert.equal(calls.filter((c) => c.method === 'DELETE').length, 2);
  assert.equal(state().find((s) => s.id === 'closedwon').metadata.probability, '1');

  const missing = writeBackStages(catalog, plan, result);
  assert.deepEqual(missing, []);
  assert.equal(catalog.hubspot.stageOnLead, 'appointmentscheduled');
  assert.equal(catalog.hubspot.stageOnCheckout, 'qualifiedtobuy');
  assert.equal(catalog.hubspot.stageOnPaid, 'closedwon');
  console.log('✓ 1) รอบแรก: rename 5 · ลบ 2 · เขียน stage id กลับครบ');
}

// ── 2. รันซ้ำ = ไม่มี write เลย (idempotent) ─────────────────────
{
  const catalog = baseCatalog();
  const plan1 = planPipeline(catalog);
  const first = fakeHs();
  const r1 = await syncPipeline({ hs: first.hs, plan: plan1, apply: true });
  writeBackStages(catalog, plan1, r1);

  const plan2 = planPipeline(catalog);
  const second = fakeHs({ stages: first.state() });
  const r2 = await syncPipeline({ hs: second.hs, plan: plan2, apply: true });
  const writes = second.calls.filter((c) => c.method !== 'GET' && !c.path.includes('/search'));
  assert.deepEqual(writes, [], 'รันซ้ำต้องไม่เขียนอะไรเลย');
  assert.deepEqual(r2.stageIds, r1.stageIds);
  console.log('✓ 2) รันซ้ำ: ไม่มี request ที่เขียนข้อมูล และ stage id เดิม');
}

// ── 3. ผู้ใช้เปลี่ยนชื่อสเตจเองใน HubSpot → จับคู่ด้วย stageIds ที่จำไว้ ──
{
  const catalog = baseCatalog();
  const plan1 = planPipeline(catalog);
  const first = fakeHs();
  writeBackStages(catalog, plan1, await syncPipeline({ hs: first.hs, plan: plan1, apply: true }));

  const renamed = first.state().map((s) => (s.id === 'appointmentscheduled' ? { ...s, label: 'สมัครเข้ามา' } : s));
  const second = fakeHs({ stages: renamed });
  const r = await syncPipeline({ hs: second.hs, plan: planPipeline(catalog), apply: true });
  assert.equal(r.stageIds.lead, 'appointmentscheduled', 'ต้องยังจับคู่สเตจเดิมได้ ไม่สร้างใหม่');
  assert.equal(second.calls.filter((c) => c.method === 'POST' && c.path.endsWith('/stages')).length, 0);
  console.log('✓ 3) ผู้ใช้เปลี่ยนชื่อสเตจเอง: จับคู่ด้วย stageIds ได้ ไม่สร้างสเตจซ้ำ');
}

// ── 4. เพิ่มสเตจใหม่เข้าไปในสเปก → สร้างเพิ่มอันเดียว ─────────────
{
  const catalog = baseCatalog();
  const plan1 = planPipeline(catalog);
  const first = fakeHs();
  writeBackStages(catalog, plan1, await syncPipeline({ hs: first.hs, plan: plan1, apply: true }));

  catalog.hubspot.pipelineSetup.stages.splice(3, 0, {
    key: 'visited', label: 'มาใช้บริการแล้ว', probability: 0.9,
  });
  const second = fakeHs({ stages: first.state() });
  const plan2 = planPipeline(catalog);
  const r = await syncPipeline({ hs: second.hs, plan: plan2, apply: true });
  assert.ok(r.stageIds.visited, 'สเตจใหม่ต้องได้ id');
  assert.equal(second.calls.filter((c) => c.method === 'POST' && c.path.endsWith('/stages')).length, 1);
  assert.equal(r.stageIds.paid, 'closedwon', 'สเตจ won เดิมต้องไม่ถูกย้ายไปที่อื่น');
  assert.deepEqual(writeBackStages(catalog, plan2, r), []);
  assert.equal(second.state().length, 6);
  console.log('✓ 4) เพิ่มสเตจในสเปก: create แค่อันใหม่ · สเตจเดิมคง id');
}

// ── 5. สเตจเกินที่มี deal ค้าง → ห้ามลบ ย้ายไปท้ายบอร์ด ──────────
{
  const catalog = baseCatalog();
  const plan = planPipeline(catalog);
  const { hs, calls, state } = fakeHs({ dealsIn: { contractsent: 4 } });
  const r = await syncPipeline({ hs, plan, apply: true });
  assert.equal(calls.filter((c) => c.method === 'DELETE').length, 1, 'ลบได้แค่สเตจที่ว่าง');
  const kept = state().find((s) => s.id === 'contractsent');
  assert.ok(kept, 'สเตจที่มี deal ต้องไม่ถูกลบ');
  assert.ok(Number(kept.displayOrder) >= 5, 'ย้ายไปท้ายบอร์ด (หลังสเตจใน funnel ทั้ง 5)');
  assert.ok(r.actions.find((a) => a.current?.id === 'contractsent').movedToEnd);
  console.log('✓ 5) สเตจที่มี deal ค้าง: ไม่ลบ ย้ายไปท้ายบอร์ด แล้วเตือน');
}

// ── 6. สเตจเกินที่ catalog ยังอ้างถึง → ห้ามลบ (กันระบบเดิมพัง) ────
{
  const catalog = baseCatalog();
  catalog.hubspot.stageOnLead = 'contractsent';    // สมมติเคยตั้งไว้เอง
  const plan = planPipeline(catalog);
  const { hs, calls } = fakeHs();
  const r = await syncPipeline({ hs, plan, apply: true });
  assert.equal(calls.filter((c) => c.method === 'DELETE').length, 1);
  assert.ok(r.actions.find((a) => a.current?.id === 'contractsent').movedToEnd);
  console.log('✓ 6) สเตจที่ catalog อ้างถึง: ไม่ถูกลบ');
}

// ── 7. mode create ───────────────────────────────────────────────
{
  const catalog = baseCatalog();
  catalog.hubspot.pipelineSetup.mode = 'create';
  catalog.hubspot.pipelineSetup.label = 'TEST — Salepage';
  const plan = planPipeline(catalog);
  const calls = [];
  const hs = async (path, { method = 'GET', body } = {}) => {
    calls.push({ method, path, body });
    if (method === 'GET') return { results: [{ id: 'default', label: 'Deals pipeline', displayOrder: 0, stages: DEFAULT_STAGES }] };
    return { id: '77', label: body.label, stages: body.stages.map((s, i) => ({ id: `s${i}`, ...s })) };
  };
  const r = await syncPipeline({ hs, plan, apply: true });
  assert.equal(r.pipelineId, '77');
  assert.deepEqual(Object.keys(r.stageIds).sort(), ['checkout', 'followup', 'lead', 'lost', 'paid']);
  const missing = writeBackStages(catalog, plan, r);
  assert.deepEqual(missing, []);
  assert.equal(catalog.hubspot.pipeline, '77');
  assert.equal(catalog.hubspot.stageOnPaid, 's3');
  console.log('✓ 7) mode create: สร้าง pipeline ใหม่ + เขียน id กลับ');
}

// ── 8. สเปกผิด ต้อง throw ก่อนแตะ API ────────────────────────────
{
  const noPaid = baseCatalog();
  noPaid.hubspot.pipelineSetup.stages = noPaid.hubspot.pipelineSetup.stages.map((s) => (s.use === 'onPaid' ? { ...s, use: undefined } : s));
  assert.throws(() => planPipeline(noPaid), /onPaid/);

  const paidNotWon = baseCatalog();
  paidNotWon.hubspot.pipelineSetup.stages = [
    { key: 'lead', label: 'a', use: 'onLead' },
    { key: 'paid', label: 'b', use: 'onPaid' },
  ];
  assert.throws(() => planPipeline(paidNotWon), /closed/);

  const dupKey = baseCatalog();
  dupKey.hubspot.pipelineSetup.stages[1].key = 'lead';
  assert.throws(() => planPipeline(dupKey), /ซ้ำ/);

  const dupRole = baseCatalog();
  dupRole.hubspot.pipelineSetup.stages[1].use = 'onLead';
  assert.throws(() => planPipeline(dupRole), /onLead/);

  assert.equal(planPipeline({ hubspot: {} }), null, 'catalog เก่าที่ไม่มี pipelineSetup ต้องข้ามเงียบๆ');
  console.log('✓ 8) สเปกผิด: throw ก่อนเรียก API · catalog เก่าไม่พัง');
}

// ── 9. ลำดับสลับ → จัดใหม่ · ลำดับถูกแต่เลขไม่เรียงติดกัน → ไม่แตะ ──
{
  const inOrderButGappy = DEFAULT_STAGES
    .filter((s) => ['appointmentscheduled', 'qualifiedtobuy', 'presentationscheduled', 'closedwon', 'closedlost'].includes(s.id))
    .map((s, i) => ({
      ...s,
      label: ['ลงทะเบียน', 'เข้าหน้าจ่ายเงิน', 'ติดตามอยู่', 'จ่ายแล้ว', 'ไม่ไปต่อ'][i],
      displayOrder: [0, 1, 2, 5, 9][i],          // ลำดับถูก แต่เลขกระโดด (เหมือนที่ HubSpot ทำ)
      metadata: { isClosed: s.metadata.isClosed, probability: String(Number(s.metadata.probability)) },
    }));
  inOrderButGappy[1].metadata.probability = '0.5';
  inOrderButGappy[2].metadata.probability = '0.3';

  const gappy = fakeHs({ stages: inOrderButGappy });
  await syncPipeline({ hs: gappy.hs, plan: planPipeline(baseCatalog()), apply: true });
  assert.deepEqual(gappy.calls.filter((c) => c.method === 'PATCH'), [], 'เลขกระโดดแต่ลำดับถูก → ไม่ต้อง PATCH');

  const shuffled = [...inOrderButGappy];
  shuffled[3] = { ...shuffled[3], displayOrder: 1.5 };   // "จ่ายแล้ว" แซงมาอยู่กลาง
  const wrong = fakeHs({ stages: shuffled });
  await syncPipeline({ hs: wrong.hs, plan: planPipeline(baseCatalog()), apply: true });
  assert.ok(wrong.calls.filter((c) => c.method === 'PATCH').length >= 1, 'ลำดับผิด → ต้องจัดใหม่');
  const after = wrong.state().slice().sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
  assert.deepEqual(after.map((s) => s.label), ['ลงทะเบียน', 'เข้าหน้าจ่ายเงิน', 'ติดตามอยู่', 'จ่ายแล้ว', 'ไม่ไปต่อ']);
  console.log('✓ 9) ลำดับ: เลขกระโดดไม่แตะ · ลำดับผิดจัดใหม่ให้ถูก');
}

// ── 10. apply:false (--plan) ต้องไม่เขียนอะไรเลย ──────────────────
{
  const plan = planPipeline(baseCatalog());
  const { hs, calls } = fakeHs();
  const r = await syncPipeline({ hs, plan, apply: false });
  assert.equal(calls.filter((c) => c.method !== 'GET' && !c.path.includes('/search')).length, 0);
  assert.equal(r.applied, false);
  assert.equal(r.actions.filter((a) => a.type === 'update').length, 5);
  assert.equal(r.actions.filter((a) => a.type === 'surplus' && a.removable).length, 2);
  console.log('✓ 10) --plan: read-only จริง ไม่มี write');
}

console.log('\nผ่านทั้ง 10 เคส');
