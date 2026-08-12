/**
 * POST /api/lead
 * รับฟอร์มจากหน้าเพจ → สร้าง/อัปเดต Contact + สร้าง Deal ใน HubSpot
 *
 * body: { name, email, phone, location, service, sku }
 * → { ok, contactId, dealId, offer: { sku, name, price, currency } }
 *
 * ราคา amount มาจาก catalog.json ฝั่ง server เท่านั้น (browser ส่งมาแค่ sku)
 */
import { loadCatalog, findOffer, isValidLocation, isValidService, propName } from '../lib/catalog.js';
import { upsertContact, createDeal } from '../lib/hubspot.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readBody(req) {
  if (!req.body) return {};
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'ใช้ POST เท่านั้น' });
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'body ไม่ใช่ JSON ที่ถูกต้อง' });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').replace(/[^\d+]/g, '');
  const location = String(body.location || '').trim();
  const service = String(body.service || 'both').trim();
  const sku = String(body.sku || '').trim();

  // ── validate ────────────────────────────────────────────────
  const errors = {};
  if (name.length < 2) errors.name = 'ใส่ชื่อด้วยนะ';
  if (!EMAIL_RE.test(email)) errors.email = 'อีเมลนี้ดูไม่ถูกต้อง เช็คตัวสะกดอีกครั้งได้ไหม';
  if (phone.replace(/\D/g, '').length < 9) errors.phone = 'เบอร์มือถือ 10 หลัก เช่น 0812345678';
  if (!isValidLocation(location)) errors.location = 'เลือกสาขาที่สะดวกก่อนนะ';
  if (!isValidService(service)) errors.service = 'เลือกบริการที่สนใจก่อนนะ';

  const offer = findOffer(sku);
  if (!offer) errors.sku = 'ไม่พบแพ็กเกจนี้ ลองเลือกใหม่อีกครั้ง';

  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, error: 'ข้อมูลยังไม่ครบ', errors });
  }

  const catalog = loadCatalog();

  try {
    const contact = await upsertContact({ email, firstname: name, phone });

    const deal = await createDeal({
      contactId: contact.id,
      associationTypeId: catalog.hubspot.dealToContactAssociationTypeId,
      properties: {
        dealname: `${catalog.brand} — ${offer.name} — ${name}`,
        pipeline: catalog.hubspot.pipeline,
        dealstage: catalog.hubspot.stageOnLead,
        amount: String(offer.price), // ← จาก catalog ไม่ใช่จาก browser
        [propName('location')]: location,
        [propName('service_interest')]: service,
        [propName('package')]: offer.sku,
        [propName('source_page')]: catalog.sourcePage,
      },
    });

    return res.status(200).json({
      ok: true,
      contactId: contact.id,
      contactCreated: contact.created,
      dealId: deal.id,
      offer: {
        sku: offer.sku,
        name: offer.name,
        price: offer.price,
        currency: catalog.currency,
      },
    });
  } catch (err) {
    // ห้ามส่งรายละเอียด token/ระบบกลับไปหา client
    console.error('[lead] HubSpot error', err.status || '', err.message);

    const isAuth = err.status === 401 || err.status === 403;
    return res.status(isAuth ? 500 : 502).json({
      ok: false,
      error: isAuth
        ? 'ระบบยังตั้งค่าไม่เสร็จ (ติดต่อผู้ดูแลเว็บ)'
        : 'ระบบมีปัญหาชั่วคราว กดส่งอีกครั้ง หรือทัก LINE @glowsociety ได้เลย',
    });
  }
}
