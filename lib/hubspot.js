const BASE = 'https://api.hubapi.com';

async function hs(path, { method = 'GET', body } = {}) {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN ไม่ได้ตั้งค่า');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`HubSpot ${res.status}: ${data?.message || res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function upsertContact({ email, firstname, phone }) {
  const properties = {
    email,
    ...(firstname && { firstname }),
    ...(phone && { phone }),
  };
  try {
    const created = await hs('/crm/v3/objects/contacts', {
      method: 'POST',
      body: { properties },
    });
    return { id: created.id, created: true };
  } catch (err) {
    if (err.status !== 409) throw err;
    let id = String(err.body?.message || '').match(/(\d{4,})/)?.[1] || null;
    if (!id) {
      const found = await hs('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: {
          filterGroups: [
            { filters: [{ propertyName: 'email', operator: 'EQ', value: email }] },
          ],
          properties: ['email'],
          limit: 1,
        },
      });
      id = found?.results?.[0]?.id || null;
    }
    if (!id) throw new Error('contact ซ้ำแต่หา id ไม่เจอ');
    await hs(`/crm/v3/objects/contacts/${id}`, {
      method: 'PATCH',
      body: { properties },
    });
    return { id, created: false };
  }
}

export async function createDeal({ catalog, contactId, sku, amount, extraProps = {} }) {
  const stage = catalog.hubspot.stageIds?.[catalog.hubspot.stageOnLead] ||
    catalog.hubspot.stageOnLead;
  const prefix = catalog.propertyPrefix;
  const properties = {
    dealname: `${catalog.brand} — ${sku}`,
    pipeline: catalog.hubspot.stageIds?.pipeline || catalog.hubspot.pipeline,
    dealstage: stage,
    amount: String(amount),
    [`${prefix}_package`]: sku,
    [`${prefix}_source_page`]: catalog.slug,
    ...extraProps,
  };
  const deal = await hs('/crm/v3/objects/deals', {
    method: 'POST',
    body: { properties },
  });
  const assocTypeId = catalog.hubspot.dealToContactAssociationTypeId || 3;
  await hs(
    `/crm/v4/objects/deals/${deal.id}/associations/contacts/${contactId}/${assocTypeId}`,
    { method: 'PUT' }
  );
  return deal;
}

export async function updateDealStage(dealId, stageId, amount) {
  const properties = { dealstage: stageId };
  if (amount != null) properties.amount = String(amount);
  return hs(`/crm/v3/objects/deals/${dealId}`, {
    method: 'PATCH',
    body: { properties },
  });
}
