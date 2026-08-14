/**
 * POST /api/checkout — สร้าง Stripe Checkout Session แล้ว redirect ไปชำระเงิน
 *
 * Body: { sku, page, dealId, contactId }
 * Response: { url: string } (Stripe checkout URL)
 *
 * ราคาต้องมาจาก catalog.json ฝั่ง server เท่านั้น — ห้ามเชื่อราคาจาก browser
 */
import Stripe from 'stripe';
import { loadCatalogFor, findOffer } from '../lib/catalog.js';
import { resolveSiteUrl } from './health.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function bad(res, msg, status = 400) {
  res.status(status).json({ error: msg });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 'Method not allowed', 405);

  const { sku, page, dealId, contactId } = req.body || {};

  if (!sku || !page) return bad(res, 'sku และ page จำเป็น');
  if (!dealId) return bad(res, 'dealId จำเป็น');

  const catalog = loadCatalogFor(page);
  if (!catalog) return bad(res, 'ไม่พบ catalog', 404);

  const offer = findOffer(catalog, sku);
  if (!offer) return bad(res, `ไม่พบ sku: ${sku}`, 404);

  const siteUrl = resolveSiteUrl() || `https://${req.headers.host}`;
  const stageOnPaid = catalog.hubspot.stageIds?.[catalog.hubspot.stageOnPaid] ||
    catalog.hubspot.stageOnPaid;

  const lineItems = offer.stripePriceId
    ? [{ price: offer.stripePriceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: catalog.currency.toLowerCase(),
            unit_amount: offer.price * 100,
            product_data: { name: offer.name, description: offer.description || undefined },
          },
          quantity: 1,
        },
      ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${siteUrl}/${page}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${page}`,
      metadata: {
        dealId,
        contactId: contactId || '',
        sku,
        page,
        stageOnPaid,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้าง session ชำระเงินได้' });
  }
}
