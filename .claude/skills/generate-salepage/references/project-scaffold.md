# Project Scaffold — ไฟล์ที่ต้องสร้างตอน Stop 5

อ่านไฟล์นี้ตอน **Stop 5** เท่านั้น (หลัง copy ประโยคจาก `copywriting.md` และมีรูปครบตาม `manifest.md`)
ทุกอย่างในนี้เป็น **pattern ที่ผ่านการทดสอบแล้ว** — ใช้เป็นโครงแล้วปรับตามแบรนด์ ไม่ต้องคิดใหม่

> โค้ดเต็มที่รันผ่านจริงอยู่ใน git history: `git show 9ef7723 --stat`
> ดูไฟล์เดี่ยว เช่น `git show 9ef7723:workspace/salepage_glow/api/lead.js`

---

## โครงไฟล์ที่ต้องมี

```
workspace/salepage_[PROJECT]/
├── catalog.json          ← สร้างโดย skill setup-crm (ต้องมีก่อน Stop 5)
├── package.json
├── vercel.json
├── lib/{catalog.js, hubspot.js}
├── api/{lead.js, checkout.js, stripe-webhook.js}
└── public/{index.html, thanks.html, config.js, assets/}
```

---

## 1. `catalog.json` — แหล่งความจริงเดียว

สร้างจาก `context/offers.md` (skill `setup-crm` ทำให้) — `sku` เดียวกันนี้ไหลไป
HubSpot product → Stripe price → GA4 `item_id`

```json
{
  "brand": "[ชื่อแบรนด์]",
  "currency": "THB",
  "sourcePage": "salepage_[PROJECT]",
  "propertyPrefix": "[prefix ตัวเล็ก a-z]",
  "locations": [{ "id": "thonglor", "label": "ทองหล่อ" }],
  "services":  [{ "id": "grounding", "label": "..." }],
  "offers": [{
    "sku": "BRAND-TRIAL", "name": "...", "price": 390,
    "billing": "one_time",              // one_time | monthly
    "service": "both", "hero": true,
    "description": "...",
    "stripePriceId": null,              // setup-stripe.mjs เขียนกลับ
    "hubspotProductId": null            // setup-hubspot.mjs เขียนกลับ
  }],
  "dealProperties": [
    { "name": "location", "label": "สาขาที่สนใจ", "type": "enumeration", "fieldType": "select", "optionsFrom": "locations" },
    { "name": "service_interest", "label": "บริการที่สนใจ", "type": "enumeration", "fieldType": "select", "optionsFrom": "services" },
    { "name": "package", "label": "แพ็กเกจ (SKU)", "type": "string", "fieldType": "text" },
    { "name": "source_page", "label": "หน้าที่มาจาก", "type": "string", "fieldType": "text" }
  ],
  "hubspot": {
    "pipeline": "default",
    "stageOnLead": "appointmentscheduled",
    "stageOnPaid": "closedwon",
    "dealToContactAssociationTypeId": 3
  }
}
```

## 2. `package.json` / `vercel.json`

```json
{
  "name": "salepage-[project]", "private": true, "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe-webhook"
  },
  "dependencies": { "stripe": "^17.0.0" }
}
```

```json
{
  "outputDirectory": "public",
  "cleanUrls": true,
  "functions": { "api/*.js": { "runtime": "@vercel/node@5" } },
  "headers": [{ "source": "/assets/(.*)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }]
}
```

## 3. `lib/catalog.js` — lookup ราคาฝั่ง server

```js
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let cached = null;

export function loadCatalog() {
  if (!cached) cached = JSON.parse(readFileSync(join(here, '..', 'catalog.json'), 'utf8'));
  return cached;
}
/** คืน null ถ้าไม่มี sku นี้ — ห้าม fallback เป็นราคาอื่น */
export function findOffer(sku) {
  if (typeof sku !== 'string') return null;
  return loadCatalog().offers.find((o) => o.sku === sku) || null;
}
export function isValidLocation(id) { return loadCatalog().locations.some((l) => l.id === id); }
export function isValidService(id)  { return loadCatalog().services.some((s) => s.id === id); }
export function propName(short)     { return `${loadCatalog().propertyPrefix}_${short}`; }
```

## 4. `lib/hubspot.js` — จุดที่พลาดกันบ่อยที่สุด

**contact ที่มีอยู่แล้วจะได้ 409** → ต้อง search แล้ว PATCH
(ห้ามใช้ `batch/upsert` ด้วย `idProperty: "email"` — HubSpot ไม่ถือว่า email เป็น unique id เสมอ)

```js
export async function upsertContact({ email, firstname, phone }) {
  const properties = { email, ...(firstname && { firstname }), ...(phone && { phone }) };
  try {
    const created = await hs('/crm/v3/objects/contacts', { method: 'POST', body: { properties } });
    return { id: created.id, created: true };
  } catch (err) {
    if (err.status !== 409) throw err;
    // ดึง id จากข้อความ error ("Existing ID: 12345") ก่อน ถ้าไม่เจอค่อย search
    let id = String(err.body?.message || '').match(/(\d{4,})/)?.[1] || null;
    if (!id) {
      const found = await hs('/crm/v3/objects/contacts/search', { method: 'POST', body: {
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
        properties: ['email'], limit: 1 } });
      id = found?.results?.[0]?.id || null;
    }
    if (!id) throw new Error('contact ซ้ำแต่หา id ไม่เจอ');
    await hs(`/crm/v3/objects/contacts/${id}`, { method: 'PATCH', body: { properties } });
    return { id, created: false };
  }
}
```

deal ต้องผูก contact ผ่าน `associations` (`associationTypeId: 3`):

```js
body: { properties, associations: [{ to: { id: String(contactId) },
  types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] }] }
```

`hs()` = wrapper บาง ๆ ของ `fetch` ที่ใส่ `Authorization: Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`
แล้ว throw error ที่มี `.status` + `.body` — **ห้าม log ค่า token**

## 5. `api/lead.js`

ลำดับ: validate → `upsertContact` → `createDeal` → คืน `{ ok, contactId, dealId, offer }`

```js
// amount ต้องมาจาก catalog เท่านั้น — browser ส่งมาแค่ sku
const offer = findOffer(String(body.sku || '').trim());
if (!offer) errors.sku = 'ไม่พบแพ็กเกจนี้ ลองเลือกใหม่อีกครั้ง';
...
properties: {
  dealname: `${catalog.brand} — ${offer.name} — ${name}`,
  pipeline: catalog.hubspot.pipeline,
  dealstage: catalog.hubspot.stageOnLead,
  amount: String(offer.price),          // ← ไม่ใช่ body.price
  [propName('location')]: location,
  [propName('service_interest')]: service,
  [propName('package')]: offer.sku,
  [propName('source_page')]: catalog.sourcePage,
}
```

- validate ฝั่ง server ซ้ำกับฝั่ง client เสมอ (email regex, เบอร์ ≥9 หลัก, location/service/sku ต้องอยู่ใน catalog)
- ตอบ `400` + `{ errors: { field: 'ข้อความไทย' } }` เพื่อให้ฟอร์มโชว์ทีละช่อง
- error จาก HubSpot: `console.error` ได้ แต่ **ตอบ client เป็นข้อความกลางๆ** ห้ามหลุดรายละเอียดระบบ

## 6. `api/checkout.js`

```js
if (!key.startsWith('sk_test')) return res.status(500).json({ ok:false,
  error: 'workshop นี้ต้องใช้ Stripe test key (sk_test_…) เท่านั้น' });   // กันอุบัติเหตุในคลาส

const lineItem = offer.stripePriceId
  ? { price: offer.stripePriceId, quantity: 1 }
  : { quantity: 1, price_data: {                      // fallback ถ้ายังไม่ได้รัน setup-stripe
      currency: catalog.currency.toLowerCase(),
      unit_amount: offer.price * 100,
      product_data: { name: `${catalog.brand} — ${offer.name}` },
      ...(isSubscription ? { recurring: { interval: 'month' } } : {}) } };

await stripe.checkout.sessions.create({
  mode: isSubscription ? 'subscription' : 'payment',
  line_items: [lineItem],
  success_url: `${base}/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${base}/?canceled=1&sku=${encodeURIComponent(offer.sku)}`,
  customer_email: body.email || undefined,
  locale: 'th',
  metadata: { sku: offer.sku, dealId: String(body.dealId || ''), location, service },
});
```

`metadata.dealId` สำคัญ — webhook ใช้ตัวนี้หา deal ที่จะปิด

## 7. `api/stripe-webhook.js` — ต้องอ่าน raw body

```js
export const config = { api: { bodyParser: false } };   // ← ถ้าไม่ใส่ signature จะไม่ผ่าน

async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

const event = stripe.webhooks.constructEvent(await rawBody(req),
  req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);

if (event.type === 'checkout.session.completed') {
  const s = event.data.object;
  await updateDeal(s.metadata.dealId, {
    dealstage: catalog.hubspot.stageOnPaid,
    amount: String((s.amount_total ?? 0) / 100),   // สตางค์ → บาท
  });
}
```

- ตอบ `200` เสมอสำหรับ event ที่ไม่สนใจ · ตอบ `500` ถ้าอัปเดต HubSpot พลาด (ให้ Stripe retry)
- signature ไม่ผ่าน → `400` (อาจมีคนยิงปลอม หรือ secret ไม่ตรง)

## 8. `public/config.js`

```js
window.SITE_CONFIG = { ga4Id: '', pixelId: '', lineId: '@...', phone: '', currency: 'THB' };
```

ถ้า `ga4Id`/`pixelId` ว่าง → **ต้องไม่ error** ให้ข้ามการโหลด script ไปเงียบๆ
(ผู้เรียนบางคนยังไม่มี ID ตอน build)

## 9. `public/index.html`

- Tailwind CDN + `<style>` block สำหรับ token สีและฟอนต์ตาม `design-guide.md` — **ไม่มี build step**
- Google Fonts (subset ไทย) ตามฟอนต์ที่เลือกไว้
- section ตาม `wireframe.md` · copy ทุกบรรทัดจาก `copywriting.md` เท่านั้น
- ทุก `<img>`: path `assets/…`, `alt` ไทย, `width`/`height`, `loading="lazy"` ยกเว้น hero
- `<head>`: favicon + OG/Twitter meta ชี้ `assets/og-image.jpg`
- **รูปที่ยังไม่มี ต้องไม่ทำ layout พัง** — ใส่ handler นี้:

```js
document.querySelectorAll('img').forEach((img) => {
  img.addEventListener('error', () => { img.classList.add('missing'); img.removeAttribute('src'); });
});
```
```css
img.missing { background: linear-gradient(135deg,#E3ECFF,#FFE6DE); position: relative; }
img.missing::after { content: attr(data-label); position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center; font-size:.8rem; color:#5C6570; }
```

- ฟอร์ม: 5 ช่อง ตาม `lead-form.md` · validate ตอน blur · ปุ่ม disable ตอนส่ง (กัน deal ซ้ำ)
- ลำดับตอน submit: `POST /api/lead` → ยิง `generate_lead`/`Lead` → `POST /api/checkout` →
  `sessionStorage` เก็บ offer ไว้ให้หน้า thanks → `location.href = url`
- ถ้า checkout พลาด **ต้องบอกว่า lead ถูกเก็บไว้แล้ว** (เพราะเก็บก่อนจริง)

## 10. `public/thanks.html`

```js
const sid = new URLSearchParams(location.search).get('session_id');
if (sid && localStorage.getItem('purchased_' + sid) !== '1') {
  gtag('event', 'purchase', { transaction_id: sid, currency, value, items });
  fbq('track', 'Purchase', { currency, value });
  localStorage.setItem('purchased_' + sid, '1');     // กัน refresh ยิงซ้ำ
}
```

---

## Checklist ก่อนบอกว่าเสร็จ

- [ ] `node --check` ผ่านทุกไฟล์ `.js`
- [ ] เปิด `public/index.html` ตรงๆ layout อ่านได้แม้ยังไม่มีรูป
- [ ] `npm install && vercel dev` แล้ว `node scripts/test-lead.mjs` ผ่าน
- [ ] จ่ายด้วย `4242 4242 4242 4242` แล้ว deal เป็น `closedwon`
- [ ] ไม่มี key/token โผล่ใน HTML/JS ฝั่ง client (`git grep -nE "sk_(test|live)|pat-na"`)
- [ ] event ยิงครบตาม `tracking.md` (เช็ค GA4 Realtime + Meta Pixel Helper)
- [ ] ผ่าน `cro-check.md` รวม button contrast ทุก section
