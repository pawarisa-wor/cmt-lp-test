/**
 * ทำให้ deal pipeline ใน HubSpot ตรงกับ `hubspot.pipelineSetup` ใน catalog.json
 *
 * ทำไมต้องมี: pipeline default ของ HubSpot เป็นสเตจแบบ B2B (Appointment Scheduled,
 * Qualified To Buy, Presentation Scheduled, …) ซึ่งไม่ตรงกับ funnel ของ salepage
 * ที่คนกรอกฟอร์มแล้วจ่ายเงินเองทันที
 *
 * หลักการที่ทำให้ระบบ submit ไม่พังเวลาสเตจเปลี่ยน:
 *   1. `api/*` อ่าน stage id จาก `catalog.hubspot.stageOn*` เท่านั้น — ไม่มี id ไหน hardcode
 *   2. script เขียน id จริงกลับเข้า catalog ทุกครั้ง (`stageIds` เก็บ key → id ไว้ด้วย)
 *      → รันซ้ำแล้ว map กลับไปที่สเตจเดิมได้ แม้ผู้ใช้ไปเปลี่ยนชื่อสเตจใน HubSpot เอง
 *   3. **rename ไม่เปลี่ยน id** — สเตจเดิมของ pipeline default ถูกใช้ต่อโดยเปลี่ยนแค่ label
 *      ดังนั้น deal เก่าและ catalog เก่ายังชี้ถูกอยู่ ระหว่างที่ยังไม่ได้ deploy ใหม่
 *   4. **ห้ามลบสเตจที่ catalog ยังอ้างถึง หรือที่ยังมี deal ค้างอยู่** — ย้ายไปท้ายแถวแล้วเตือน
 *
 * spec: technical-setup.md ส่วน C1 (หัวข้อ Pipeline + stage)
 */

/** บทบาทที่ api ใช้ → ชื่อฟิลด์ใน catalog.hubspot */
export const STAGE_ROLES = {
  onLead: 'stageOnLead',
  onCheckout: 'stageOnCheckout',
  onPaid: 'stageOnPaid',
};

const STAGE_KEY_RE = /^[a-z][a-z0-9_]*$/;
const isClosedStage = (stage) => String(stage?.metadata?.isClosed) === 'true';
const probabilityOf = (stage) => Number(stage?.metadata?.probability ?? 0);

/**
 * อ่านสเปกจาก catalog → plan (ไม่เรียก API เลย ใช้ได้ทั้ง --dry-run และตอนรันจริง)
 * คืน null ถ้า catalog ไม่มี `hubspot.pipelineSetup` → ข้ามขั้นนี้ไปเงียบๆ (catalog เก่ายังใช้ได้)
 * throw ถ้าสเปกไม่ถูกต้อง — ดีกว่าไปพังตอนยิง API แล้วได้ pipeline ครึ่งๆ กลางๆ
 */
export function planPipeline(catalog) {
  const setup = catalog?.hubspot?.pipelineSetup;
  if (!setup) return null;

  const input = Array.isArray(setup.stages) ? setup.stages : [];
  if (input.length < 2) {
    throw new Error('hubspot.pipelineSetup.stages ต้องมีอย่างน้อย 2 สเตจ (สเตจ lead + สเตจจ่ายแล้ว)');
  }
  if (input.length > 100) {
    throw new Error('HubSpot ให้ deal pipeline มีได้ไม่เกิน 100 สเตจ');
  }

  const seen = new Set();
  const roles = {};
  const stages = input.map((s, i) => {
    const key = String(s.key || '');
    if (!STAGE_KEY_RE.test(key)) {
      throw new Error(`stage key "${key}" ใช้ไม่ได้ — ต้องเป็น a-z 0-9 _ และเริ่มด้วยตัวอักษร (เช่น lead, paid)`);
    }
    if (seen.has(key)) throw new Error(`stage key ซ้ำ: "${key}"`);
    seen.add(key);

    const label = String(s.label || '').trim();
    if (!label) throw new Error(`stage "${key}" ยังไม่มี label (ชื่อที่จะโชว์บนบอร์ด HubSpot)`);

    const closed = s.closed ? String(s.closed) : null;
    if (closed && closed !== 'won' && closed !== 'lost') {
      throw new Error(`stage "${key}" มี closed: "${closed}" — ใช้ได้แค่ "won" หรือ "lost"`);
    }

    // HubSpot: probability 1.0 = closed won · 0.0 = closed lost · ระหว่างนั้น = สเตจที่ยังเปิดอยู่
    const probability = closed === 'won' ? 1 : closed === 'lost' ? 0
      : typeof s.probability === 'number' ? Math.min(Math.max(s.probability, 0.01), 0.99)
        : 0.5;

    if (s.use && !(s.use in STAGE_ROLES)) {
      throw new Error(`stage "${key}" มี use: "${s.use}" — ใช้ได้แค่ ${Object.keys(STAGE_ROLES).join(' / ')}`);
    }
    if (s.use) {
      if (roles[s.use]) throw new Error(`use: "${s.use}" ถูกใช้ทั้ง stage "${roles[s.use]}" และ "${key}" — ได้สเตจเดียวต่อบทบาท`);
      roles[s.use] = key;
    }

    return { key, label, displayOrder: i, isClosed: Boolean(closed), closed, probability };
  });

  if (!roles.onLead) {
    throw new Error('ต้องมีสเตจที่ใส่ `"use": "onLead"` — สเตจที่ deal ไปอยู่ตอนคนกรอกฟอร์ม');
  }
  if (!roles.onPaid) {
    throw new Error('ต้องมีสเตจที่ใส่ `"use": "onPaid"` — สเตจที่ deal ไปอยู่ตอนจ่ายเงินสำเร็จ');
  }
  const paid = stages.find((s) => s.key === roles.onPaid);
  if (paid.closed !== 'won') {
    throw new Error(`สเตจ "${paid.key}" (onPaid) ต้องใส่ \`"closed": "won"\` ด้วย ไม่งั้น HubSpot ไม่ถือว่าปิดดีล`);
  }

  return {
    mode: setup.mode === 'create' ? 'create' : 'adopt',
    // adopt = ดัดสเตจของ pipeline ที่มีอยู่ (บัญชี free สร้าง pipeline ที่ 2 ไม่ได้)
    pipelineId: setup.mode === 'create' ? null : String(catalog.hubspot.pipeline || 'default'),
    pipelineLabel: String(setup.label || `${catalog.brand} — Salepage`).trim(),
    stages,
    roles,
    /** id ที่ script เขียนไว้รอบก่อน — ใช้จับคู่สเตจเดิมให้ตรงตัวเวลารันซ้ำ */
    previousIds: { ...(catalog.hubspot.stageIds || {}) },
    /** id ที่ api กำลังใช้อยู่จริง — ห้ามลบสเตจพวกนี้เด็ดขาด */
    protectedIds: Object.values(STAGE_ROLES)
      .map((field) => catalog.hubspot[field])
      .concat(Object.values(catalog.hubspot.stageIds || {}))
      .filter(Boolean)
      .map(String),
  };
}

/** บรรทัดสรุป plan สำหรับ --dry-run (ไม่ต้องเรียก API) */
export function describePlan(plan) {
  const role = (key) => Object.entries(plan.roles)
    .filter(([, k]) => k === key)
    .map(([r]) => r)
    .join(', ');

  return plan.stages.map((s) => {
    const tag = s.closed ? `closed ${s.closed}` : `prob ${s.probability}`;
    const used = role(s.key);
    return `   ${String(s.displayOrder + 1).padStart(2)}. ${s.label.padEnd(28)} ${`(${tag})`.padEnd(16)}${used ? `← ${used}` : ''}`;
  });
}

/** จับคู่สเตจที่ต้องการ กับสเตจที่มีอยู่ใน pipeline — เรียงลำดับความแม่นจากมากไปน้อย */
function matchStages(desired, existing, previousIds) {
  const pool = [...existing].sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
  const byId = new Map(pool.map((s) => [String(s.id), s]));
  const claimed = new Map();
  const taken = new Set();

  const claim = (key, stage) => {
    claimed.set(key, stage);
    taken.add(String(stage.id));
  };
  const free = (stage) => !taken.has(String(stage.id));

  // 1) id ที่ script เขียนไว้รอบก่อน — แม่นสุด (ผู้ใช้เปลี่ยนชื่อสเตจเองก็ยังจับคู่ถูก)
  for (const d of desired) {
    const prev = previousIds[d.key] && byId.get(String(previousIds[d.key]));
    if (prev && free(prev)) claim(d.key, prev);
  }
  // 2) label ตรงกันเป๊ะ — กรณีรันซ้ำบน catalog ที่ยังไม่มี stageIds
  for (const d of desired) {
    if (claimed.has(d.key)) continue;
    const hit = pool.find((s) => free(s) && String(s.label).trim() === d.label);
    if (hit) claim(d.key, hit);
  }
  // 3) สเตจปิด (won/lost) จับกับสเตจปิดที่มี probability ตรงกัน — reuse closedwon/closedlost เดิม
  for (const d of desired) {
    if (claimed.has(d.key) || !d.isClosed) continue;
    const hit = pool.find((s) => free(s) && isClosedStage(s) && probabilityOf(s) === d.probability);
    if (hit) claim(d.key, hit);
  }
  // 4) สเตจที่ยังเปิดอยู่ จับกับสเตจเปิดตัวถัดไปตามลำดับบอร์ด — rename ทับ (id ไม่เปลี่ยน)
  for (const d of desired) {
    if (claimed.has(d.key) || d.isClosed) continue;
    const hit = pool.find((s) => free(s) && !isClosedStage(s));
    if (hit) claim(d.key, hit);
  }

  const surplus = pool.filter(free);
  return { claimed, surplus };
}

/** เทียบสเตจที่ต้องการกับของจริง → รายการ action ที่จะทำ */
function diffStages(plan, existing) {
  const { claimed, surplus } = matchStages(plan.stages, existing, plan.previousIds);
  const actions = [];

  /**
   * HubSpot ไม่ได้เก็บ displayOrder ตามเลขที่เราส่งเป๊ะๆ — ถ้าเลขชนกับสเตจอื่น มันจะเลื่อนให้เอง
   * (ส่ง 3 แล้วอาจได้ 4) ถ้าเทียบเลขตรงๆ จะเห็นว่า "ไม่ตรง" ทุกครั้งแล้ว PATCH ซ้ำไปเรื่อยๆ
   * → เทียบแค่ **ลำดับสัมพัทธ์**: ถ้าสเตจใน funnel เรียงจากน้อยไปมากอยู่แล้ว ถือว่าลำดับถูก
   */
  const claimedInOrder = plan.stages.map((d) => claimed.get(d.key)).filter(Boolean);
  const orderOk = claimedInOrder.every(
    (cur, i) => i === 0 || Number(claimedInOrder[i - 1].displayOrder) < Number(cur.displayOrder),
  );
  // สเตจที่จะสร้างใหม่ต้องมีลำดับที่ถูกอยู่แล้วในตัวเอง → ถ้ามีของใหม่ก็จัดลำดับใหม่ทั้งชุด
  const reorder = !orderOk || claimedInOrder.length !== plan.stages.length;

  for (const d of plan.stages) {
    const cur = claimed.get(d.key);
    if (!cur) {
      actions.push({ type: 'create', stage: d });
      continue;
    }
    const changes = {};
    if (String(cur.label).trim() !== d.label) changes.label = d.label;
    if (reorder && Number(cur.displayOrder) !== d.displayOrder) changes.displayOrder = d.displayOrder;
    if (probabilityOf(cur) !== d.probability) changes.probability = d.probability;
    if (isClosedStage(cur) !== d.isClosed) changes.isClosed = d.isClosed;
    actions.push({
      type: Object.keys(changes).length ? 'update' : 'keep',
      stage: d,
      current: cur,
      // ส่ง displayOrder ปัจจุบันไปถ้าไม่ต้องจัดลำดับใหม่ — PATCH ของ HubSpot ต้องมีฟิลด์นี้ทุกครั้ง
      displayOrder: reorder ? d.displayOrder : Number(cur.displayOrder),
      changes,
    });
  }

  // สเตจที่เหลือต้องอยู่ท้ายบอร์ด — ถ้ามันอยู่หลังสเตจใน funnel อยู่แล้วก็ไม่ต้องแตะ
  const lastInFunnel = claimedInOrder.reduce((max, s) => Math.max(max, Number(s.displayOrder)), -1);
  surplus.forEach((cur, i) => {
    actions.push({
      type: 'surplus',
      current: cur,
      displayOrder: plan.stages.length + i,
      alreadyLast: Number(cur.displayOrder) > lastInFunnel,
      protectedByCatalog: plan.protectedIds.includes(String(cur.id)),
    });
  });

  return actions;
}

/**
 * ทำให้ pipeline ตรงกับ plan
 * `apply: false` = อ่านอย่างเดียว (ใช้กับ --plan) — ไม่มี request ที่เขียนข้อมูลเลย
 * คืน { pipelineId, pipelineLabel, stageIds, actions, applied }
 */
export async function syncPipeline({ hs, plan, apply = true, log = () => {} }) {
  const list = await hs('/crm/v3/pipelines/deals');
  const pipelines = list?.results || [];

  let pipeline = null;

  if (plan.mode === 'create') {
    pipeline = pipelines.find((p) => String(p.label).trim() === plan.pipelineLabel) || null;
    if (!pipeline) {
      if (!apply) {
        return {
          pipelineId: null,
          pipelineLabel: plan.pipelineLabel,
          stageIds: {},
          actions: [{ type: 'create-pipeline', label: plan.pipelineLabel }],
          applied: false,
        };
      }
      pipeline = await createPipeline(hs, plan, pipelines);
      log(`pipeline "${plan.pipelineLabel}" — created (id ${pipeline.id})`);
      return {
        pipelineId: String(pipeline.id),
        pipelineLabel: plan.pipelineLabel,
        stageIds: stageIdsFrom(plan, pipeline.stages || []),
        actions: [{ type: 'create-pipeline', label: plan.pipelineLabel }],
        applied: true,
      };
    }
  } else {
    pipeline = pipelines.find((p) => String(p.id) === plan.pipelineId) || null;
    if (!pipeline) {
      throw new Error(
        `ไม่พบ pipeline "${plan.pipelineId}" ในบัญชีนี้\n` +
          `pipeline ที่มี: ${pipelines.map((p) => `${p.id} (${p.label})`).join(' · ') || '(ไม่มีเลย)'}\n` +
          'แก้ `hubspot.pipeline` ใน catalog.json ให้ตรงกับ id ที่มีจริง',
      );
    }
  }

  const pipelineId = String(pipeline.id);
  const actions = diffStages(plan, pipeline.stages || []);

  // นับ deal ในสเตจที่จะลบ — ห้ามลบสเตจที่มี deal อยู่ (ทั้งตอน --plan และตอนรันจริง)
  for (const a of actions.filter((x) => x.type === 'surplus')) {
    a.deals = await countDealsInStage(hs, a.current.id);
    a.removable = a.deals === 0 && !a.protectedByCatalog;
  }

  if (!apply) {
    return {
      pipelineId,
      pipelineLabel: String(pipeline.label),
      stageIds: knownStageIds(actions),
      actions,
      applied: false,
    };
  }

  // เรียงให้ rename/patch มาก่อน create แล้วปิดท้ายด้วยการลบ
  // ถ้าพังกลางทาง สเตจที่ api ใช้อยู่ยัง id เดิม → lead ที่เข้ามาระหว่างนั้นไม่หลุด
  for (const a of actions) {
    if (a.type === 'keep') continue;

    if (a.type === 'update') {
      const updated = await hs(`/crm/v3/pipelines/deals/${pipelineId}/stages/${a.current.id}`, {
        method: 'PATCH',
        body: stageBody(a.stage, a.displayOrder),
      });
      a.current = updated || a.current;
      const what = Object.keys(a.changes).join(', ');
      log(`stage ${a.stage.key} — "${a.stage.label}" (id ${a.current.id} · แก้ ${what})`);
      continue;
    }

    if (a.type === 'create') {
      const created = await hs(`/crm/v3/pipelines/deals/${pipelineId}/stages`, {
        method: 'POST',
        body: stageBody(a.stage),
      });
      a.current = created;
      log(`stage ${a.stage.key} — "${a.stage.label}" (id ${created.id} · created)`);
    }
  }

  for (const a of actions.filter((x) => x.type === 'surplus')) {
    // ลบเป็นขั้นสุดท้ายและ **ห้ามให้ทั้งขั้นล้มเพราะลบไม่สำเร็จ** — id ที่ได้มาต้องถูกเขียนกลับเข้า catalog
    try {
      if (!a.removable) {
        if (a.alreadyLast) continue;
        // ย้ายไปท้ายแถวแทนการลบ แล้วบอกผู้ใช้ว่าทำไม
        await hs(`/crm/v3/pipelines/deals/${pipelineId}/stages/${a.current.id}`, {
          method: 'PATCH',
          body: { label: a.current.label, displayOrder: a.displayOrder, metadata: a.current.metadata },
        });
        a.movedToEnd = true;
        continue;
      }
      // ⚠️ ห้ามใส่ `?validateReferencesBeforeDelete=true` — endpoint นี้ตอบ 500 internal error
      //    (กัน deal หายด้วยการนับ deal ก่อนอยู่แล้วใน countDealsInStage)
      await hs(`/crm/v3/pipelines/deals/${pipelineId}/stages/${a.current.id}`, { method: 'DELETE' });
      a.deleted = true;
      log(`stage "${a.current.label}" — ลบแล้ว (ไม่ได้ใช้ใน funnel นี้ และไม่มี deal ค้าง)`);
    } catch (err) {
      a.error = err.message;
    }
  }

  return {
    pipelineId,
    pipelineLabel: String(pipeline.label),
    stageIds: knownStageIds(actions),
    actions,
    applied: true,
  };
}

/** payload ของ stage — HubSpot บังคับ metadata.probability สำหรับ deal pipeline */
function stageBody(stage, displayOrder = stage.displayOrder) {
  return {
    label: stage.label,
    displayOrder,
    metadata: {
      isClosed: String(stage.isClosed),
      probability: String(stage.probability),
    },
  };
}

async function createPipeline(hs, plan, existing) {
  const displayOrder = existing.reduce((max, p) => Math.max(max, Number(p.displayOrder) || 0), -1) + 1;
  try {
    return await hs('/crm/v3/pipelines/deals', {
      method: 'POST',
      body: {
        label: plan.pipelineLabel,
        displayOrder,
        stages: plan.stages.map(stageBody),
      },
    });
  } catch (err) {
    // บัญชี free สร้าง pipeline ที่ 2 ไม่ได้ (ต้อง Starter ขึ้นไป) — บอกทางออกให้ตรงจุด
    if (err.status === 400 || err.status === 403) {
      throw new Error(
        `สร้าง pipeline ใหม่ไม่ได้ — ${err.message}\n` +
          'บัญชี HubSpot free มี deal pipeline ได้แค่ 1 อัน (Starter ขึ้นไปจึงสร้างเพิ่มได้)\n' +
          'ทางแก้: เปลี่ยน `hubspot.pipelineSetup.mode` เป็น "adopt" แล้วรันซ้ำ ' +
          '— จะดัดสเตจของ pipeline เดิมให้ตรง funnel แทนการสร้างใหม่',
      );
    }
    throw err;
  }
}

/** map key → stage id จาก action ที่รู้ id แล้ว */
function knownStageIds(actions) {
  const out = {};
  for (const a of actions) {
    if (a.stage && a.current?.id) out[a.stage.key] = String(a.current.id);
  }
  return out;
}

/** map key → id ตอนสร้าง pipeline ใหม่ทั้งอัน (จับด้วย label ตามลำดับที่ส่งไป) */
function stageIdsFrom(plan, stages) {
  const out = {};
  for (const d of plan.stages) {
    const hit = stages.find((s) => String(s.label).trim() === d.label);
    if (hit) out[d.key] = String(hit.id);
  }
  return out;
}

async function countDealsInStage(hs, stageId) {
  try {
    const res = await hs('/crm/v3/objects/deals/search', {
      method: 'POST',
      body: {
        filterGroups: [{ filters: [{ propertyName: 'dealstage', operator: 'EQ', value: String(stageId) }] }],
        properties: ['dealname'],
        limit: 1,
      },
    });
    return Number(res?.total ?? 0);
  } catch {
    // นับไม่ได้ = ถือว่ามี deal อยู่ ปลอดภัยกว่าลบทิ้ง
    return -1;
  }
}

/**
 * เขียนผลกลับเข้า catalog — **จุดเดียวที่ api ใช้หา stage id**
 * ไม่แตะฟิลด์อื่น และคง key เดิมทั้งหมดไว้ (ของเก่าที่ยังไม่มีในสเปกจะถูกทับด้วย id ใหม่เท่านั้น)
 */
export function writeBackStages(catalog, plan, result) {
  const h = catalog.hubspot;
  h.pipeline = result.pipelineId;
  h.stageIds = { ...(h.stageIds || {}), ...result.stageIds };

  const missing = [];
  for (const [role, field] of Object.entries(STAGE_ROLES)) {
    const key = plan.roles[role];
    if (!key) {
      // บทบาทที่ไม่ได้ใช้ (เช่น onCheckout) → ปล่อยเป็น null ให้ api ข้ามไป
      if (field in h) h[field] = null;
      continue;
    }
    const id = result.stageIds[key];
    if (!id) {
      missing.push(`${field} (stage "${key}")`);
      continue;
    }
    h[field] = id;
  }
  return missing;
}
