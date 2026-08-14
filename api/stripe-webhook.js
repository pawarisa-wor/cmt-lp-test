/**
 * POST /api/stripe-webhook — Stripe webhook endpoint
 *
 * รับ checkout.session.completed แล้วอัปเดต deal stage ใน HubSpot
 * Stage ที่จะย้ายไปอ่านจาก catalog.hubspot.stageOnPaid — ห้าม hardcode
 *
 * ⚠️ ต้องปิด body parser เพราะ Stripe ต้องรับ raw body เพื่อ verify signature
 */
import Stripe from 'stripe';
import { updateDealStage } from '../lib/hubspot.js';
import { loadCatalogFor } from '../lib/pages.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  if (event.type !== 'checkout.session.completed') {
    res.status(200).json({ received: true, type: event.type });
    return;
  }

  const session = event.data.object;
  const { dealId, page, stageOnPaid } = session.metadata || {};

  if (!dealId) {
    console.warn('No dealId in session metadata:', session.id);
    res.status(200).json({ received: true, note: 'no dealId' });
    return;
  }

  const amount = session.amount_total != null ? session.amount_total / 100 : null;

  let stageId = stageOnPaid;
  if (page) {
    const catalog = loadCatalogFor(page);
    if (catalog) {
      const key = catalog.hubspot.stageOnPaid;
      stageId = catalog.hubspot.stageIds?.[key] || key;
    }
  }

  try {
    await updateDealStage(dealId, stageId, amount);
    console.log(`Deal ${dealId} → stage ${stageId}, amount ${amount}`);
    res.status(200).json({ received: true, dealId, stageId });
  } catch (err) {
    console.error('Error updating deal:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
