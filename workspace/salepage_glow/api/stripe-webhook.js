/**
 * POST /api/stripe-webhook
 * จ่ายเงินสำเร็จ → ปิด Deal ใน HubSpot เป็น closedwon
 *
 * นี่คือ "ความจริง" ของการจ่ายเงิน — ไม่พึ่ง client
 * event ที่ต้องเปิดใน Stripe: checkout.session.completed
 *
 * ตอน dev:  stripe listen --forward-to localhost:3000/api/stripe-webhook
 */
import Stripe from 'stripe';
import { loadCatalog } from '../lib/catalog.js';
import { updateDeal } from '../lib/hubspot.js';

// ต้องอ่าน raw body เพื่อ verify signature — ห้ามให้ Vercel parse ก่อน
export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('ใช้ POST เท่านั้น');
  }

  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) {
    console.error('[webhook] ยังไม่ได้ตั้ง STRIPE_SECRET_KEY หรือ STRIPE_WEBHOOK_SECRET');
    return res.status(500).send('webhook ยังตั้งค่าไม่เสร็จ');
  }

  const stripe = new Stripe(key);
  let event;

  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, req.headers['stripe-signature'], secret);
  } catch (err) {
    // signature ไม่ผ่าน = อาจมีคนยิงปลอม หรือ secret ไม่ตรง
    console.error('[webhook] signature ไม่ผ่าน:', err.message);
    return res.status(400).send(`Webhook signature verification failed`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  const dealId = session.metadata?.dealId;
  const sku = session.metadata?.sku || '';

  if (!dealId) {
    console.warn('[webhook] session ไม่มี dealId ใน metadata — ข้าม', session.id);
    return res.status(200).json({ received: true, note: 'no dealId' });
  }

  const catalog = loadCatalog();

  try {
    await updateDeal(dealId, {
      dealstage: catalog.hubspot.stageOnPaid,
      // amount_total เป็นสตางค์ → แปลงกลับเป็นบาท
      amount: String((session.amount_total ?? 0) / 100),
    });
    console.log(`[webhook] ปิด deal ${dealId} (${sku}) เป็น ${catalog.hubspot.stageOnPaid}`);
    return res.status(200).json({ received: true, dealId, sku });
  } catch (err) {
    console.error('[webhook] อัปเดต deal ไม่สำเร็จ', err.status || '', err.message);
    // ตอบ 500 เพื่อให้ Stripe retry ให้เอง
    return res.status(500).json({ received: false, error: 'อัปเดต HubSpot ไม่สำเร็จ' });
  }
}
