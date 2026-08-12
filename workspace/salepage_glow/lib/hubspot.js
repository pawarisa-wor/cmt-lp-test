/**
 * HubSpot CRM v3 helper — spec อยู่ใน technical-setup.md ส่วน C1
 * ห้าม log ค่า token ออกมาไม่ว่ากรณีใด
 */
const BASE = 'https://api.hubapi.com';

function token() {
  const t = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!t) throw new Error('ยังไม่ได้ตั้งค่า HUBSPOT_PRIVATE_APP_TOKEN (ดู technical-setup.md ส่วน B1)');
  return t;
}

export async function hs(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* HubSpot ตอบ non-JSON เฉพาะกรณี error ระดับ gateway */
  }

  if (!res.ok) {
    const err = new Error(json?.message || `HubSpot ${res.status} ${path}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * สร้าง contact ถ้ายังไม่มี / อัปเดตถ้ามีแล้ว
 * ใช้ create → 409 → search → patch (ห้ามใช้ batch/upsert ด้วย email — ดู technical-setup.md C1)
 */
export async function upsertContact({ email, firstname, phone }) {
  if (!EMAIL_RE.test(email || '')) throw new Error('อีเมลไม่ถูกต้อง');

  const properties = { email };
  if (firstname) properties.firstname = firstname;
  if (phone) properties.phone = phone;

  try {
    const created = await hs('/crm/v3/objects/contacts', { method: 'POST', body: { properties } });
    return { id: created.id, created: true };
  } catch (err) {
    if (err.status !== 409) throw err;

    // ดึง id จากข้อความ error ก่อน ("Existing ID: 12345") ถ้าไม่เจอค่อย search
    let id = String(err.body?.message || '').match(/(\d{4,})/)?.[1] || null;

    if (!id) {
      const found = await hs('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: {
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
          properties: ['email'],
          limit: 1,
        },
      });
      id = found?.results?.[0]?.id || null;
    }
    if (!id) throw new Error('contact ซ้ำแต่หา id ไม่เจอ — ลองใหม่อีกครั้ง');

    await hs(`/crm/v3/objects/contacts/${id}`, { method: 'PATCH', body: { properties } });
    return { id, created: false };
  }
}

/** สร้าง deal แล้วผูกกับ contact (associationTypeId 3 = deal → contact) */
export async function createDeal({ properties, contactId, associationTypeId = 3 }) {
  return hs('/crm/v3/objects/deals', {
    method: 'POST',
    body: {
      properties,
      associations: contactId
        ? [
            {
              to: { id: String(contactId) },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId }],
            },
          ]
        : undefined,
    },
  });
}

export async function updateDeal(dealId, properties) {
  return hs(`/crm/v3/objects/deals/${dealId}`, { method: 'PATCH', body: { properties } });
}
