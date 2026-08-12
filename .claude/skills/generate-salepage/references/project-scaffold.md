# Project Scaffold — ไฟล์ที่ต้องสร้างตอน Stop 5

อ่านไฟล์นี้ตอน **Stop 5** เท่านั้น (หลัง copy ประโยคจาก `copywriting.md` และมีรูปครบตาม `manifest.md`)
ทุกอย่างในนี้เป็น **pattern ที่ผ่านการทดสอบแล้ว** — ใช้เป็นโครงแล้วปรับตามแบรนด์ ไม่ต้องคิดใหม่

> โค้ดเต็มที่รันผ่านจริงอยู่ใน git history: `git show 9ef7723 --stat`
> ดูไฟล์เดี่ยว เช่น `git show 9ef7723:workspace/salepage_glow/api/lead.js`

---

## สถาปัตยกรรม: หลายหน้า 1 Vercel deployment

**ชื่อโฟลเดอร์ใน `workspace/` = URL ของหน้านั้น**

```
workspace/page_a/public/  →  build  →  public/page_a/  →  [domain]/page_a
workspace/page_b/public/  →  build  →  public/page_b/  →  [domain]/page_b
```

`scripts/build-site.mjs` (มีให้แล้ว) ประกอบทุกหน้าลง `public/` ที่ root — Vercel เรียกเป็น buildCommand

```
[repo root]                        ← Vercel project อยู่ที่นี่ ไม่ใช่ในโฟลเดอร์หน้า
├── vercel.json                    ← มีให้แล้ว (buildCommand + includeFiles)
├── package.json                   ← มีให้แล้ว (dependency: stripe)
├── api/                           ★ สร้างที่ Stop 5 — **แชร์ทุกหน้า สร้างครั้งเดียว**
│   ├── lead.js  checkout.js  stripe-webhook.js
├── lib/                           ★ สร้างที่ Stop 5 — แชร์ทุกหน้า
│   ├── pages.js                   resolve page slug → catalog
│   ├── catalog.js  hubspot.js
├── public/                        ← ผลผลิตของ build (gitignored ห้ามแก้มือ)
└── workspace/
    ├── page_a/
    │   ├── catalog.json           ← ของหน้านี้ (skill setup-crm สร้าง)
    │   ├── technical-setup.md  assets-plan.md  _progress.md
    │   └── public/{index.html, thanks.html, config.js, assets/}
    └── page_b/  (โครงเดียวกัน)
```

**หน้าที่ 2 ขึ้นไปสร้างเร็วมาก** เพราะ `api/` + `lib/` มีอยู่แล้ว — ทำแค่ `catalog.json` + `public/`

### สิ่งที่ทำให้ multi-page ทำงานได้ (พลาดข้อไหนก็พัง)

1. ทุก request จากหน้าเพจต้องส่ง **`page`** (slug) ไปด้วย → server ใช้เลือก `catalog.json` ที่ถูก
2. `success_url` / `cancel_url` ต้องมี slug: `${base}/${page}/thanks`
3. Stripe `metadata.page` ต้องมี ไม่งั้น webhook ไม่รู้ว่าจะปิด deal ด้วย catalog ไหน
4. path ในหน้า HTML ใช้ **relative** (`assets/…`, `config.js`) ส่วน API ใช้ **absolute** (`/api/lead`)
5. `vercel.json` ต้องมี `includeFiles: "workspace/**/catalog.json"` ไม่งั้น function อ่าน catalog ไม่เจอ

---

## 1. `catalog.json` — แหล่งความจริงเดียว

สร้างจาก `context/offers.md` (skill `setup-crm` ทำให้) — `sku` เดียวกันนี้ไหลไป
HubSpot product → Stripe price → GA4 `item_id`

```json
{
  "brand": "[ชื่อแบรนด์]",
  "currency": "THB",
  "slug": "page_a",                     // ★ ต้องตรงกับชื่อโฟลเดอร์ = URL ของหน้านี้
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

## 2. `package.json` / `vercel.json` — มีให้แล้วที่ root

ไม่ต้องสร้างใหม่ ไม่ต้องสร้างซ้ำในโฟลเดอร์หน้า อ่านของเดิมแล้วใช้เลย
(`buildCommand: node scripts/build-site.mjs` · `outputDirectory: public` ·
`includeFiles: workspace/**/catalog.json`)

## 3. `lib/pages.js` — resolve slug → catalog (หัวใจของ multi-page)

`catalog.json` อยู่ในโฟลเดอร์ของแต่ละหน้า ไม่ได้อยู่ข้าง function → ต้อง resolve path หลายทาง
เพราะ cwd ของ serverless function ต่างกันระหว่าง `vercel dev` กับ production

```js
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/** slug ต้องเป็น a-z 0-9 - _ เท่านั้น — กัน path traversal (../../etc/passwd) */
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;

/** ที่เป็นไปได้ของ workspace/ — ลองทีละอันแล้วบอกให้ชัดถ้าไม่เจอ */
function workspaceRoots() {
  return [
    join(process.cwd(), 'workspace'),
    join(here, '..', 'workspace'),
    join('/var/task', 'workspace'),
  ];
}

const cache = new Map();

export function loadCatalogFor(page) {
  if (!SLUG_RE.test(String(page || ''))) return null;
  if (cache.has(page)) return cache.get(page);

  const tried = [];
  for (const root of workspaceRoots()) {
    const p = join(root, page, 'catalog.json');
    tried.push(p);
    if (existsSync(p)) {
      const catalog = JSON.parse(readFileSync(p, 'utf8'));
      cache.set(page, catalog);
      return catalog;
    }
  }
  // log ให้ debug ได้ว่า bundle ไม่ได้ include ไฟล์มา (เช็ค includeFiles ใน vercel.json)
  console.error(`[pages] ไม่พบ catalog ของ "${page}" — ลองแล้ว:\n  ${tried.join('\n  ')}`);
  return null;
}

/** ใช้ตอน debug: /api/... จะบอกได้ว่า deployment นี้เห็นหน้าอะไร */
export function listPages() {
  for (const root of workspaceRoots()) {
    if (!existsSync(root)) continue;
    return readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && SLUG_RE.test(d.name))
      .map((d) => d.name);
  }
  return [];
}
```

## 3b. `lib/catalog.js` — lookup ราคาฝั่ง server (per page)

```js
import { loadCatalogFor } from './pages.js';

/** คืน null ถ้าไม่มี sku นี้ในหน้านั้น — ห้าม fallback เป็นราคาอื่น */
export function findOffer(catalog, sku) {
  if (!catalog || typeof sku !== 'string') return null;
  return catalog.offers.find((o) => o.sku === sku) || null;
}
export const isValidLocation = (catalog, id) => Boolean(catalog?.locations?.some((l) => l.id === id));
export const isValidService  = (catalog, id) => Boolean(catalog?.services?.some((s) => s.id === id));
export const propName = (catalog, short) => `${catalog.propertyPrefix}_${short}`;
export { loadCatalogFor };
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

body ที่รับ: `{ page, name, email, phone, sku }` — **กรอกแค่ 3 ช่อง** ตาม `lead-form.md`
`page` มาจากหน้าเพจอัตโนมัติ · `location` / `service` เป็น optional

```js
// 1) หาว่าเป็นหน้าไหนก่อน แล้วค่อยโหลด catalog ของหน้านั้น
const page = String(body.page || '').trim();
const catalog = loadCatalogFor(page);
if (!catalog) {
  return res.status(400).json({ ok: false, error: 'ไม่รู้ว่ามาจากหน้าไหน (page ไม่ถูกต้อง)' });
}

// 2) amount ต้องมาจาก catalog ของหน้านั้นเท่านั้น — browser ส่งมาแค่ sku
const offer = findOffer(catalog, String(body.sku || '').trim());
if (!offer) errors.sku = 'ไม่พบแพ็กเกจนี้ ลองเลือกใหม่อีกครั้ง';
...
properties: {
  dealname: `${catalog.brand} — ${offer.name} — ${name}`,
  pipeline: catalog.hubspot.pipeline,
  dealstage: catalog.hubspot.stageOnLead,
  amount: String(offer.price),                          // ← ไม่ใช่ body.price
  [propName(catalog, 'package')]: offer.sku,
  [propName(catalog, 'source_page')]: page,             // ← รู้ว่า lead มาจากหน้าไหน
  // ใส่เฉพาะถ้ามีค่าส่งมา — ห้ามส่ง property ว่างเข้า HubSpot
  ...(location && isValidLocation(catalog, location)
    ? { [propName(catalog, 'location')]: location } : {}),
  ...(service && isValidService(catalog, service)
    ? { [propName(catalog, 'service_interest')]: service } : {}),
}
```

> `[prefix]_source_page` = slug ของหน้า → ใน HubSpot กรองได้เลยว่า lead มาจาก `page_a` หรือ `page_b`
> **ใช้ `propertyPrefix` เดียวกันทุกหน้าที่อยู่ใน HubSpot portal เดียวกัน** ไม่งั้นจะได้ property ซ้ำซ้อน
> เป็นชุดๆ ต่างกันแค่ prefix

- validate ฝั่ง server ซ้ำกับฝั่ง client เสมอ: `name` ≥2 ตัวอักษร · email regex · เบอร์ ≥9 หลัก ·
  `sku` ต้องอยู่ใน catalog (ถ้ามี `location`/`service` ส่งมา ก็ต้องอยู่ใน catalog ด้วย)
- ตอบ `400` + `{ errors: { field: 'ข้อความไทย' } }` เพื่อให้ฟอร์มโชว์ทีละช่อง
- error จาก HubSpot: `console.error` ได้ แต่ **ตอบ client เป็นข้อความกลางๆ** ห้ามหลุดรายละเอียดระบบ

## 6. `api/checkout.js`

```js
if (!key.startsWith('sk_test')) return res.status(500).json({ ok:false,
  error: 'workshop นี้ต้องใช้ Stripe test key (sk_test_…) เท่านั้น' });   // กันอุบัติเหตุในคลาส

const catalog = loadCatalogFor(page);                 // ← page มาจาก body เหมือน /api/lead
const offer = findOffer(catalog, sku);

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
  // ★ URL ต้องมี slug ของหน้า ไม่งั้นจ่ายเสร็จเด้งไปหน้าอื่น
  success_url: `${base}/${page}/thanks?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${base}/${page}/?canceled=1&sku=${encodeURIComponent(offer.sku)}`,
  customer_email: body.email || undefined,
  locale: 'th',
  metadata: { page, sku: offer.sku, dealId: String(body.dealId || ''), location, service },
});
```

`metadata.dealId` สำคัญ — webhook ใช้ตัวนี้หา deal ที่จะปิด
`metadata.page` สำคัญ — webhook ใช้ตัวนี้เลือก catalog ที่ถูก (แต่ละหน้าอาจตั้ง stage ต่างกัน)

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
  const catalog = loadCatalogFor(s.metadata?.page);        // ← รู้ว่ามาจากหน้าไหน
  if (!catalog) { console.error('[webhook] page ไม่รู้จัก:', s.metadata?.page); }
  await updateDeal(s.metadata.dealId, {
    dealstage: catalog?.hubspot?.stageOnPaid || 'closedwon',
    amount: String((s.amount_total ?? 0) / 100),           // สตางค์ → บาท
  });
}
```

**webhook เดียวใช้ได้ทุกหน้า** — ตั้ง endpoint ใน Stripe แค่ `[domain]/api/stripe-webhook` ครั้งเดียว

- ตอบ `200` เสมอสำหรับ event ที่ไม่สนใจ · ตอบ `500` ถ้าอัปเดต HubSpot พลาด (ให้ Stripe retry)
- signature ไม่ผ่าน → `400` (อาจมีคนยิงปลอม หรือ secret ไม่ตรง)

## 8. `workspace/[slug]/public/config.js`

```js
window.SITE_CONFIG = {
  page: 'page_a',            // ★ ต้องตรงกับชื่อโฟลเดอร์ = slug ใน URL
  ga4Id: '', pixelId: '',    // ตั้งต่อหน้าได้ (แต่ละหน้าใช้ property/pixel คนละตัวก็ได้)
  lineId: '@...', phone: '', currency: 'THB',
};
```

- ถ้า `ga4Id`/`pixelId` ว่าง → **ต้องไม่ error** ให้ข้ามการโหลด script ไปเงียบๆ
- `page` คือค่าที่หน้าเพจส่งไปให้ `/api/*` ทุกครั้ง
  ให้ fallback เป็น slug จาก URL ด้วย กันกรณีลืมแก้ตอน copy หน้า:
  ```js
  const PAGE = window.SITE_CONFIG?.page || location.pathname.split('/').filter(Boolean)[0] || '';
  ```

## 9. `workspace/[slug]/public/index.html`

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

- ฟอร์ม: **ชื่อ / อีเมล / เบอร์** + `<input type="hidden" name="sku">` ตาม `lead-form.md`
  · validate ตอน blur · ปุ่ม disable ตอนส่ง (กัน deal ซ้ำ)
- ลำดับตอน submit: `POST /api/lead` → ยิง `generate_lead`/`Lead` → `POST /api/checkout` →
  `sessionStorage` เก็บ offer ไว้ให้หน้า thanks → `location.href = url`
- **ทุก fetch ต้องส่ง `page: PAGE` ไปด้วย** (ดูข้อ 8) ไม่งั้น server ไม่รู้ว่าเป็นหน้าไหน
- ถ้า checkout พลาด **ต้องบอกว่า lead ถูกเก็บไว้แล้ว** (เพราะเก็บก่อนจริง)

## 10. `workspace/[slug]/public/thanks.html`

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
- [ ] เปิด `workspace/[slug]/public/index.html` ตรงๆ layout อ่านได้แม้ยังไม่มีรูป
- [ ] `node scripts/build-site.mjs --dry-run` เห็นหน้าของเราในลิสต์ (ถ้าไม่เห็น = ขาด index.html)
- [ ] `npm install && vercel dev` (รันที่ **root** ของ repo) → เปิด `localhost:3000/[slug]` ได้
- [ ] `node scripts/test-lead.mjs` ผ่าน (ยิงไปที่ `/[slug]`)
- [ ] จ่ายด้วย `4242 4242 4242 4242` แล้ว deal เป็น `closedwon`
- [ ] ไม่มี key/token โผล่ใน HTML/JS ฝั่ง client (`git grep -nE "sk_(test|live)|pat-na"`)
- [ ] event ยิงครบตาม `tracking.md` (เช็ค GA4 Realtime + Meta Pixel Helper)
- [ ] ผ่าน `cro-check.md` รวม button contrast ทุก section
