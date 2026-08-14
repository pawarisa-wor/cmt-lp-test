/**
 * POST /api/stripe-webhook — Stripe webhook endpoint
 *
 * ได้รับ checkout.session.completed event จาก Stripe
 * แล้วปิด deal ใน HubSpot (ย้ายไปสเตจ Closed Won)
 *
 * ⚠️ ต้องปิด body parser เพราะ Stripe ต้องรับ raw body เพื่อ verify signature
 * vercel.json ตั้งไว้ในส่วน functions > stripe-webhook > config > maxDuration
 */
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Close deal ใน HubSpot pipeline ให้ตรงกับ stage ที่ตั้งไว้ใน catalog.json
 */
async function closeDealInHubSpot(dealId, stageId) {
  const response = await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealstage: stageId,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update deal: ${response.statusText}`);
  }

  return response.json();
}

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

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Metadata ต่อเข้ามาจาก checkout form: { dealId, stageOnPaid, ... }
      if (!session.metadata?.dealId) {
        console.warn('No dealId in session metadata:', session.id);
        res.status(200).json({ received: true, note: 'No dealId to update' });
        return;
      }

      const { dealId, stageOnPaid } = session.metadata;

      // ปิด deal ใน HubSpot
      await closeDealInHubSpot(dealId, stageOnPaid);
      console.log(`Deal ${dealId} updated to stage ${stageOnPaid}`);

      res.status(200).json({ received: true, dealId, updated: true });
    } else {
      console.log(`Unhandled event type: ${event.type}`);
      res.status(200).json({ received: true, type: event.type });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Vercel serverless function ต้องใส่ config เพื่อปิด body parser
 * ให้ req.body เป็น Buffer ที่ Stripe.webhooks.constructEvent ต้องใช้
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
