/**
 * POST /api/lead — รับข้อมูล lead จาก form แล้ว upsert contact + สร้าง deal ใน HubSpot
 *
 * Body: { name, email, phone, sku, page, location?, service_interest? }
 * Response: { ok: true, contactId, dealId } หรือ { error: string }
 */
import { loadCatalogFor, findOffer, isValidLocation, isValidService, propName } from '../lib/catalog.js';
import { upsertContact, createDeal } from '../lib/hubspot.js';

function bad(res, msg, status = 400) {
  res.status(status).json({ error: msg });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 'Method not allowed', 405);

  const { name, email, phone, sku, page, location, service_interest } = req.body || {};

  if (!email || !email.includes('@')) return bad(res, 'อีเมลไม่ถูกต้อง');
  if (!name || name.trim().length < 2) return bad(res, 'กรุณาใส่ชื่อ');
  if (!sku) return bad(res, 'ไม่มี sku');
  if (!page) return bad(res, 'ไม่มี page');

  const catalog = loadCatalogFor(page);
  if (!catalog) return bad(res, 'ไม่พบ catalog', 404);

  const offer = findOffer(catalog, sku);
  if (!offer) return bad(res, `ไม่พบ sku: ${sku}`, 404);

  const prefix = catalog.propertyPrefix;
  const extraProps = {};
  if (location && isValidLocation(catalog, location)) {
    extraProps[`${prefix}_location`] = location;
  }
  if (service_interest && isValidService(catalog, service_interest)) {
    extraProps[`${prefix}_service_interest`] = service_interest;
  }

  try {
    const contact = await upsertContact({
      email: email.trim().toLowerCase(),
      firstname: name.trim(),
      phone: phone?.trim() || '',
    });

    const deal = await createDeal({
      catalog,
      contactId: contact.id,
      sku,
      amount: offer.price,
      extraProps,
    });

    res.status(200).json({
      ok: true,
      contactId: contact.id,
      dealId: deal.id,
    });
  } catch (err) {
    console.error('[lead] error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
  }
}
