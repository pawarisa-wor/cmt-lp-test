/**
 * POST /api/checkout
 * สร้าง Stripe Checkout Session จาก sku → คืน url ให้ browser redirect ไป
 *
 * body: { sku, dealId?, email?, location?, service? }
 * → { ok, url }
 *
 * ⚠️ ราคา lookup จาก catalog.json เท่านั้น — ถ้า body ส่ง price มา จะถูก ignore
 */
import Stripe from 'stripe';
import { loadCatalog, findOffer } from '../lib/catalog.js';

function readBody(req) {
  if (!req.body) return {};
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
}

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'ใช้ POST เท่านั้น' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('[checkout] STRIPE_SECRET_KEY ยังว่าง');
    return res.status(500).json({ ok: false, error: 'ระบบชำระเงินยังตั้งค่าไม่เสร็จ' });
  }
  if (!key.startsWith('sk_test')) {
    // กันอุบัติเหตุในคลาส: ห้ามใช้ key จริง
    console.error('[checkout] ปฏิเสธ: STRIPE_SECRET_KEY ไม่ใช่ test key');
    return res.status(500).json({
      ok: false,
      error: 'workshop นี้ต้องใช้ Stripe test key (sk_test_…) เท่านั้น',
    });
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'body ไม่ใช่ JSON ที่ถูกต้อง' });
  }

  const offer = findOffer(String(body.sku || '').trim());
  if (!offer) return res.status(400).json({ ok: false, error: 'ไม่พบแพ็กเกจนี้' });

  const catalog = loadCatalog();
  const stripe = new Stripe(key);
  const base = siteUrl(req);
  const isSubscription = offer.billing === 'monthly';

  // ใช้ price id ที่ setup-stripe.mjs สร้างไว้ ถ้ายังไม่มีก็สร้าง price ชั่วคราวจาก catalog
  const lineItem = offer.stripePriceId
    ? { price: offer.stripePriceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: catalog.currency.toLowerCase(),
          unit_amount: offer.price * 100,
          product_data: { name: `${catalog.brand} — ${offer.name}`, description: offer.description },
          ...(isSubscription ? { recurring: { interval: 'month' } } : {}),
        },
      };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [lineItem],
      success_url: `${base}/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?canceled=1&sku=${encodeURIComponent(offer.sku)}`,
      customer_email: body.email || undefined,
      locale: 'th',
      metadata: {
        sku: offer.sku,
        dealId: body.dealId ? String(body.dealId) : '',
        location: body.location ? String(body.location) : '',
        service: body.service ? String(body.service) : '',
      },
    });

    return res.status(200).json({ ok: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[checkout] Stripe error', err.message);
    return res.status(502).json({
      ok: false,
      error: 'สร้างหน้าชำระเงินไม่สำเร็จ — เราเก็บข้อมูลคุณไว้แล้ว ทีมงานจะติดต่อกลับ',
    });
  }
}
