#!/usr/bin/env node
/**
 * สร้าง product + price ใน Stripe sandbox ตาม catalog.json
 * แล้วเขียน stripePriceId กลับเข้า catalog.json
 *
 *   node scripts/setup-stripe.mjs --dry-run    ← ดูว่าจะสร้างอะไร (ไม่ต้องมี key)
 *   node scripts/setup-stripe.mjs              ← รันจริง
 *
 * idempotent: หา product จาก metadata.sku ก่อน ถ้ามีแล้วจะไม่สร้างซ้ำ
 * ⚠️ ยอมรับแค่ sk_test_… เท่านั้น (กันอุบัติเหตุใช้ key จริงในคลาส)
 */
import {
  loadEnv, parseArgs, readCatalog, writeCatalog, info, ok, warn, fail, c, dryRunBanner,
} from './lib/util.mjs';

loadEnv();
const args = parseArgs();
const dry = Boolean(args['dry-run']);
const { path: catalogPath, catalog } = readCatalog(args);
const currency = (catalog.currency || 'THB').toLowerCase();

// ── สรุปสิ่งที่จะสร้าง ──────────────────────────────────────────
dryRunBanner(dry);
info(`${c.bold('Stripe setup')} — ${catalog.brand} · ${catalog.currency}\n`);
info(`${catalog.offers.length} product + price:`);
for (const o of catalog.offers) {
  const kind = o.billing === 'monthly' ? 'recurring (month)' : 'one-time';
  info(
    `  • ${o.sku.padEnd(16)} ${o.name.padEnd(20)} ` +
      `${String(o.price).padStart(5)} ${catalog.currency}  ${kind}` +
      (o.stripePriceId ? c.dim(`  [มี priceId แล้ว: ${o.stripePriceId}]`) : ''),
  );
}

if (dry) {
  const sample = catalog.offers[0];
  info(`\n${c.dim('payload ตัวอย่าง:')}`);
  info(
    c.dim(
      JSON.stringify(
        {
          product: { name: `${catalog.brand} — ${sample.name}`, metadata: { sku: sample.sku } },
          price: {
            currency,
            unit_amount: sample.price * 100,
            ...(sample.billing === 'monthly' ? { recurring: { interval: 'month' } } : {}),
            metadata: { sku: sample.sku },
          },
        },
        null,
        2,
      ),
    ),
  );
  info(c.yellow('\ndry run — ไม่มีการเรียก API'));
  process.exit(0);
}

// ── รันจริง ────────────────────────────────────────────────────
const key = process.env.STRIPE_SECRET_KEY;
if (!key) fail('ยังไม่ได้ตั้งค่า STRIPE_SECRET_KEY ใน .env\nดู technical-setup.md ส่วน B2');
if (!key.startsWith('sk_test')) {
  fail(
    'STRIPE_SECRET_KEY ไม่ใช่ test key\n' +
      'workshop นี้ต้องใช้ sandbox/test mode เท่านั้น (sk_test_…) — หยุดเพื่อความปลอดภัย',
  );
}

let Stripe;
try {
  ({ default: Stripe } = await import('stripe'));
} catch {
  fail('ยังไม่ได้ติดตั้ง dependency\nรัน: cd workspace/salepage_glow && npm install');
}

const stripe = new Stripe(key);
info('');

for (const offer of catalog.offers) {
  try {
    // 1) หา product จาก metadata.sku
    const search = await stripe.products.search({ query: `metadata['sku']:'${offer.sku}'`, limit: 1 });
    let product = search.data[0];

    if (product) {
      warn(`product ${offer.sku} — มีอยู่แล้ว (${product.id})`);
    } else {
      product = await stripe.products.create({
        name: `${catalog.brand} — ${offer.name}`,
        description: offer.description || undefined,
        metadata: { sku: offer.sku },
      });
      ok(`product ${offer.sku} — created (${product.id})`);
    }

    // 2) หา price ที่ active และตรงกับราคา/รอบบิลปัจจุบัน
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
    const wantAmount = offer.price * 100;
    const wantRecurring = offer.billing === 'monthly';

    const match = prices.data.find(
      (p) =>
        p.unit_amount === wantAmount &&
        p.currency === currency &&
        Boolean(p.recurring) === wantRecurring &&
        (!wantRecurring || p.recurring?.interval === 'month'),
    );

    if (match) {
      offer.stripePriceId = match.id;
      warn(`price   ${offer.sku} — มีอยู่แล้ว (${match.id})`);
    } else {
      // ราคาเปลี่ยน → archive ตัวเก่า (Stripe ลบ price ไม่ได้) แล้วสร้างใหม่
      for (const old of prices.data) {
        await stripe.prices.update(old.id, { active: false });
        warn(`price   ${offer.sku} — archive ราคาเก่า ${old.id} (${(old.unit_amount ?? 0) / 100})`);
      }
      const price = await stripe.prices.create({
        product: product.id,
        currency,
        unit_amount: wantAmount,
        ...(wantRecurring ? { recurring: { interval: 'month' } } : {}),
        metadata: { sku: offer.sku },
      });
      offer.stripePriceId = price.id;
      ok(`price   ${offer.sku} — created (${price.id})`);
    }

    offer.stripeProductId = product.id;
  } catch (err) {
    if (err?.type === 'StripeAuthenticationError') {
      fail('Stripe 401 — secret key ไม่ถูกต้อง (ดู technical-setup.md B2)');
    }
    warn(`${offer.sku} — ${err.message}`);
  }
}

writeCatalog(catalogPath, catalog);

info(`\n${c.bold('สรุป')}`);
for (const o of catalog.offers) {
  info(`  ${o.sku.padEnd(16)} ${o.stripePriceId ? c.green(o.stripePriceId) : c.red('ไม่มี priceId')}`);
}
ok(`เขียน stripePriceId กลับเข้า ${catalogPath.split('/').slice(-2).join('/')}`);

info(`\n${c.bold('ต้องทำเองใน dashboard (script ทำแทนไม่ได้):')}`);
info('  1) Developers → Webhooks → Add endpoint  →  [SITE_URL]/api/stripe-webhook');
info('     เลือก event: checkout.session.completed  → เอา signing secret ใส่ STRIPE_WEBHOOK_SECRET');
info('  2) ตอน dev: stripe listen --forward-to localhost:3000/api/stripe-webhook');
info(c.dim('\nขั้นต่อไป: node scripts/test-lead.mjs --dry-run'));
