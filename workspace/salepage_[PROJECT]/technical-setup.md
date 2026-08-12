# Technical Setup — salepage_[PROJECT]

ไฟล์นี้มี 3 ส่วน อ่านตามบทบาท:

| ส่วน | สำหรับใคร | เนื้อหา |
|---|---|---|
| **A** | ผู้เรียน | checklist เครื่องมือ + บัญชีที่ต้องมี |
| **B** | ผู้เรียน | วิธี setup ทีละคลิก + วิธีหา key แต่ละตัว |
| **C** | **AI (Claude)** | spec ที่ต้องอ่านก่อน config อะไรก็ตาม — object, property, event, endpoint |

> ⚠️ ห้ามใส่ค่า key ลงในไฟล์นี้ ทุกค่าอยู่ใน `.env` ที่ root ของ repo เท่านั้น

---

# A. Checklist เครื่องมือและบัญชี

## เครื่องมือบนเครื่อง

| อะไร | ตรวจด้วย | หมายเหตุ |
|---|---|---|
| Node.js 20+ | `node -v` | ต้อง 20 ขึ้นไป (ใช้ `fetch` built-in) |
| Claude Code | `claude --version` | เครื่องมือหลักของคลาส |
| git | `git --version` | |
| Vercel CLI | `vercel --version` | ติดตั้ง: `npm i -g vercel` |
| Stripe CLI | `stripe --version` | ใช้ทดสอบ webhook ตอน dev — [ติดตั้ง](https://docs.stripe.com/stripe-cli) |

## บัญชีที่ต้องมี

| บริการ | ใช้ทำอะไร | ฟรีไหม | ต้องมีก่อนเข้าคลาส |
|---|---|---|---|
| **HubSpot** | CRM เก็บ lead (Contact + Deal) | ✅ free tier พอ | ✅ **จำเป็น** |
| **Vercel** | hosting + serverless API | ✅ | ✅ **จำเป็น** |
| **GitHub** | เก็บ repo + ต่อ Vercel | ✅ | ✅ |
| **Stripe** | รับชำระเงิน (ใช้ sandbox) | ✅ test mode | ✅ |
| **GA4** | track pageview / lead / purchase | ✅ | ⭕️ ทำในคลาสได้ |
| **Meta Pixel** | track lead / purchase ฝั่ง Facebook | ✅ | ⭕️ ทำในคลาสได้ |
| **KIE.ai** | generate รูปด้วย GPT Image 2 | 💰 จ่ายต่อรูป | ผู้สอนแจก key ในคลาส |
| **Pixabay** | ดึง stock photo / icon ฟรี | ✅ | ⭕️ ทำในคลาสได้ |

## `.env` ที่ต้องเต็ม

```bash
cp .env.example .env    # แล้วเติมค่าตามส่วน B
```

| ตัวแปร | จำเป็น | ได้จากส่วน |
|---|---|---|
| `HUBSPOT_PRIVATE_APP_TOKEN` | ✅ | B1 |
| `HUBSPOT_PORTAL_ID` | ⭕️ | B1 |
| `STRIPE_SECRET_KEY` | ✅ | B2 |
| `STRIPE_PUBLISHABLE_KEY` | ⭕️ | B2 |
| `STRIPE_WEBHOOK_SECRET` | ✅ (ตอนทดสอบจ่ายเงิน) | B3 |
| `PUBLIC_GA4_MEASUREMENT_ID` | ⭕️ | B4 |
| `PUBLIC_FB_PIXEL_ID` | ⭕️ | B5 |
| `KIE_API_KEY` | ⭕️ (ถ้าจะ gen รูป) | B6 |
| `PIXABAY_API_KEY` | ⭕️ | B6 |
| `SITE_URL` | ✅ | B7 |

---

# B. วิธี setup ทีละขั้น

## B1. HubSpot — Private App Token

1. เข้า [app.hubspot.com](https://app.hubspot.com) → ถ้ายังไม่มีบัญชี สมัคร **free account** ใหม่
   (แนะนำให้สมัครบัญชีใหม่สำหรับคลาส ไม่ใช้ portal ของบริษัทจริง)
2. คลิก **⚙️ Settings** (มุมขวาบน)
3. เมนูซ้าย → **Integrations → Private Apps**
4. กด **Create a private app**
5. แท็บ **Basic Info**: ตั้งชื่อ `CMT6 Salepage`
6. แท็บ **Scopes** → เลือกให้ครบ 6 ตัวนี้ (ค้นในช่อง search ได้):

   ```
   crm.objects.contacts.read
   crm.objects.contacts.write
   crm.objects.deals.read
   crm.objects.deals.write
   crm.schemas.deals.write      ← ต้องมี ไม่งั้นสร้าง custom property ไม่ได้
   e-commerce                   ← ต้องมี ไม่งั้นสร้าง product ไม่ได้
   ```

7. กด **Create app** → กด **Continue creating**
8. Copy **access token** (ขึ้นต้นด้วย `pat-na1-…`)
   ⚠️ **เห็นได้ครั้งเดียว** ถ้าปิดหน้าไปแล้วต้อง generate ใหม่
9. วางใน `.env`:
   ```
   HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-xxxxxxxx
   ```
10. **Hub ID** (เลขมุมขวาบนข้างชื่อบัญชี) → ใส่ `HUBSPOT_PORTAL_ID`

**เช็คว่าใช้ได้:**
```bash
node scripts/setup-hubspot.mjs --dry-run    # ต้องไม่ error เรื่อง token
```

## B2. Stripe — Sandbox keys

1. เข้า [dashboard.stripe.com](https://dashboard.stripe.com) → สมัคร/ล็อกอิน
2. มุมขวาบน สลับเป็น **Test mode** (หรือสร้าง **Sandbox** ใหม่)
   ⚠️ **ห้ามใช้ live mode ในคลาส**
3. เมนู **Developers → API keys**
4. Copy:
   - **Publishable key** (`pk_test_…`) → `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_…`) กด Reveal ก่อน → `STRIPE_SECRET_KEY`

**ถ้า secret key ไม่ขึ้นต้นด้วย `sk_test_` ให้หยุด** — นั่นคือ key จริง จะเก็บเงินจริง

## B3. Stripe — Webhook

**ตอน dev (ในคลาส):**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
จะได้ signing secret `whsec_…` ในบรรทัดแรก → ใส่ `STRIPE_WEBHOOK_SECRET`
(ต้องเปิด terminal นี้ค้างไว้ตลอดที่ทดสอบ)

**ตอน prod (หลัง deploy):**
1. Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://[โปรเจกต์ของคุณ].vercel.app/api/stripe-webhook`
3. Events: เลือก **`checkout.session.completed`** (ตัวเดียวพอ)
4. กด Add → copy **Signing secret** → `vercel env add STRIPE_WEBHOOK_SECRET production`

## B4. GA4 — Measurement ID

1. [analytics.google.com](https://analytics.google.com) → **Admin** (เฟือง ล่างซ้าย)
2. **Create → Property** → ตั้งชื่อ → เลือกเขตเวลา Bangkok, สกุลเงิน THB
3. **Data Streams → Add stream → Web** → ใส่ URL เว็บ (ใส่ URL vercel ทีหลังได้)
4. Copy **Measurement ID** (`G-XXXXXXXXXX`) → `PUBLIC_GA4_MEASUREMENT_ID`
5. ใส่ค่าเดียวกันใน `public/config.js`

## B5. Meta Pixel — Pixel ID

1. [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. **Connect data source → Web → Meta Pixel** → ตั้งชื่อ
3. Copy **Pixel ID** (ตัวเลข ~15 หลัก) → `PUBLIC_FB_PIXEL_ID`
4. ใส่ค่าเดียวกันใน `public/config.js`
5. ติดตั้ง Chrome extension **Meta Pixel Helper** ไว้ตรวจว่า event ยิงจริง

## B6. KIE.ai + Pixabay

- **KIE.ai**: ผู้สอนแจก key ในคลาส → `KIE_API_KEY`
  (ถ้าใช้ของตัวเอง: สมัคร [kie.ai](https://kie.ai) → API Keys → เติมเครดิต)
  💰 **มีค่าใช้จ่ายต่อรูป** — รัน `--dry-run` ก่อนเสมอ
- **Pixabay**: สมัครฟรีที่ [pixabay.com/api/docs](https://pixabay.com/api/docs/) → copy API key
  → `PIXABAY_API_KEY`

## B7. Vercel — deploy

```bash
cd workspace/salepage_[ชื่อโปรเจกต์ของคุณ]
npm install
vercel login
vercel link                    # สร้าง project ใหม่ หรือผูกกับที่มีอยู่
```

ใส่ env ทุกตัวที่ prod ต้องใช้ (ทำซ้ำทีละตัว):
```bash
vercel env add HUBSPOT_PRIVATE_APP_TOKEN production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add SITE_URL production
```

```bash
vercel --prod                  # ได้ URL จริง
```

แล้วเอา URL ที่ได้ไป: อัปเดต `SITE_URL`, ตั้ง webhook ใน B3, ใส่ใน GA4 data stream

**รัน local:**
```bash
vercel dev                     # http://localhost:3000
```
บัตรทดสอบ: `4242 4242 4242 4242` · วันหมดอายุอนาคตอะไรก็ได้ · CVC `123` · zip อะไรก็ได้

---

# C. Spec สำหรับ AI — อ่านส่วนนี้ก่อน config

> Claude: อ่านส่วนนี้ก่อนเขียน/รันอะไรที่แตะ HubSpot, Stripe, GA4, Pixel หรือ KIE.ai
> ทุกค่าที่เป็น "ความจริง" เรื่อง offer/ราคา อยู่ใน `catalog.json` ไม่ใช่ในไฟล์นี้

## C1. HubSpot

**Base:** `https://api.hubapi.com` · **Auth:** `Authorization: Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`

### Custom deal properties ที่ต้องสร้าง

`POST /crm/v3/properties/deals` (ต้องมี scope `crm.schemas.deals.write`)

`[prefix]` = `propertyPrefix` ใน `catalog.json` (ตัวเล็ก a–z เช่น `glow`) — ต้องตรงกับที่ `api/lead.js` ส่ง

| name | label | type | fieldType | options |
|---|---|---|---|---|
| `[prefix]_location` | สาขา/พื้นที่ที่สนใจ | `enumeration` | `select` | จาก `locations[]` ใน catalog |
| `[prefix]_service_interest` | บริการที่สนใจ | `enumeration` | `select` | จาก `services[]` ใน catalog |
| `[prefix]_package` | แพ็กเกจ (SKU) | `string` | `text` | — |
| `[prefix]_source_page` | หน้าที่มาจาก | `string` | `text` | — |

```json
{
  "name": "[prefix]_location",
  "label": "สาขาที่สนใจ",
  "type": "enumeration",
  "fieldType": "select",
  "groupName": "dealinformation",
  "options": [
    { "label": "ทองหล่อ", "value": "thonglor", "displayOrder": 0 },
    { "label": "สาทร",    "value": "sathorn",  "displayOrder": 1 }
  ]
}
```

ถ้า property มีอยู่แล้ว API ตอบ **409** → ถือว่าสำเร็จ (idempotent) ไม่ต้อง retry

### Products

`POST /crm/v3/objects/products` (scope `e-commerce`) — 1 record ต่อ 1 offer ใน `catalog.json`

```json
{ "properties": { "name": "[ชื่อแพ็กเกจ]", "price": "[ราคา]", "hs_sku": "[SKU]",
                  "description": "[คำอธิบายสั้น]" } }
```

เขียน `id` ที่ได้กลับเข้า `catalog.json` → `offers[].hubspotProductId`

### Contact — สร้างหรืออัปเดต (ใช้ใน `api/lead.js`)

1. `POST /crm/v3/objects/contacts`
   ```json
   { "properties": { "email": "...", "firstname": "...", "phone": "..." } }
   ```
2. ถ้าได้ **409 Conflict** = contact มีอยู่แล้ว → ค้นหา id:
   ```
   POST /crm/v3/objects/contacts/search
   { "filterGroups": [{ "filters": [
       { "propertyName": "email", "operator": "EQ", "value": "..." } ] }],
     "properties": ["email"], "limit": 1 }
   ```
   แล้ว `PATCH /crm/v3/objects/contacts/{id}` เพื่ออัปเดต

> ❗ **ห้ามใช้** `/crm/v3/objects/contacts/batch/upsert` กับ `idProperty: "email"` —
> HubSpot ไม่ถือว่า email เป็น unique id เสมอไป จะได้ 400/409 แบบเดาไม่ได้
> ใช้ create → 409 → search → patch เท่านั้น

### Deal — สร้างพร้อม associate contact

`POST /crm/v3/objects/deals`

```json
{
  "properties": {
    "dealname": "[แบรนด์] — [ชื่อแพ็กเกจ] — [ชื่อลูกค้า]",
    "pipeline": "default",
    "dealstage": "appointmentscheduled",
    "amount": "390",
    "[prefix]_location": "[location id]",
    "[prefix]_service_interest": "[service id]",
    "[prefix]_package": "[SKU]",
    "[prefix]_source_page": "salepage_[PROJECT]"
  },
  "associations": [{
    "to": { "id": "[contactId]" },
    "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3 }]
  }]
}
```

- `associationTypeId: 3` = deal → contact
- `amount` ต้องมาจาก `catalog.json` ฝั่ง server **ห้ามเอาจาก request body ของ browser**
- stage ที่ใช้: lead ใหม่ = `appointmentscheduled` · จ่ายเงินแล้ว = `closedwon`
  (ถ้า pipeline ถูกแก้ในบัญชีนั้น ให้ `GET /crm/v3/pipelines/deals` มาดู stage id จริงก่อน)

### จ่ายเงินสำเร็จ (ใน `api/stripe-webhook.js`)

`PATCH /crm/v3/objects/deals/{dealId}` → `{ "properties": { "dealstage": "closedwon" } }`

### Error ที่เจอบ่อย

| status | ความหมาย | ทำอะไร |
|---|---|---|
| 401 | token ผิด / หมดอายุ | ชี้ผู้ใช้ไป B1 · ห้าม echo token |
| 403 | scope ไม่ครบ | บอกว่าขาด scope ตัวไหน → B1 ข้อ 6 |
| 409 | มีอยู่แล้ว | property/contact: ถือว่าสำเร็จ แล้วไป search/patch |
| 429 | rate limit | รอ 1 วินาที retry ไม่เกิน 3 ครั้ง |

## C2. Stripe

- Auth: secret key จาก env · ใช้ npm package `stripe`
- **สร้าง product + price ต่อ 1 offer** — `unit_amount = price * 100`, `currency: "thb"`,
  `metadata.sku = [SKU]`, ถ้า `billing === "monthly"` ใส่ `recurring: { interval: "month" }`
- Checkout Session (ใน `api/checkout.js`):

```js
{
  mode: offer.billing === 'monthly' ? 'subscription' : 'payment',
  line_items: [{ price: offer.stripePriceId, quantity: 1 }],
  success_url: `${SITE_URL}/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${SITE_URL}/?canceled=1`,
  customer_email: email,
  metadata: { sku, dealId, location, service }
}
```

- **ราคา lookup จาก `catalog.json` ด้วย `sku` เท่านั้น** — request จาก browser ส่งมาแค่ `sku`
  ถ้า body มี `price` มาด้วย ให้ **ignore**
- Webhook: verify ด้วย `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`
  → ต้องอ่าน **raw body** (ปิด body parser ของ Vercel ด้วย `export const config = { api: { bodyParser: false } }`)
  → handle เฉพาะ `checkout.session.completed` → อ่าน `session.metadata.dealId` → ปิด deal

## C3. GA4 + Meta Pixel

ตารางเต็มอยู่ใน `../../.claude/skills/generate-salepage/references/tracking.md` — สรุปสั้น:

| funnel | GA4 | Pixel |
|---|---|---|
| เข้าหน้า | `page_view` | `PageView` |
| เห็นราคา | `view_item_list` | `ViewContent` |
| เลือกแพ็กเกจ | `select_item` | — |
| คลิก CTA | `cta_clicked` | — |
| เริ่มกรอกฟอร์ม | `form_started` | — |
| **ได้ lead** | `generate_lead` | `Lead` |
| ไปจ่ายเงิน | `begin_checkout` | `InitiateCheckout` |
| **จ่ายสำเร็จ** | `purchase` | `Purchase` |
| ยกเลิก | `checkout_cancelled` | — |
| กด LINE/โทร | `contact_clicked` | `Contact` |

- ค่า `value`/`currency`/`items[].item_id` ต้องตรงกับ `catalog.json`
- `purchase.transaction_id` = Stripe `session_id` (กันยิงซ้ำเวลา refresh)
- ID ทุกตัวอ่านจาก `public/config.js` — ถ้าว่างต้องไม่ error ให้ข้าม script ไปเงียบๆ

## C4. KIE.ai (GPT Image 2)

- `POST https://api.kie.ai/api/v1/jobs/createTask`
  `{ model: "gpt-image-2-text-to-image", input: { prompt, aspect_ratio, resolution } }`
- poll `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=…` ทุก 30 วิ จน `state=success`
  → `JSON.parse(data.resultJson).resultUrls[0]`
- `aspect_ratio` ที่รองรับ: `auto 1:1 3:2 2:3 4:3 3:4 5:4 4:5 16:9 9:16 2:1 1:2 3:1 1:3 21:9 9:21`
- `resolution`: `1K` `2K` `4K`
- ภาษาไทยใน prompt render ได้ถูกต้อง
- 💰 มีค่าใช้จ่ายต่อรูป → **ต้องขอ confirm จากผู้ใช้ก่อนยิงจริงทุกครั้ง**
- รายละเอียด + error codes: `../../.claude/skills/_shared/gpt-image-guide.md`

## C5. Pixabay

`GET https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=[url-encoded]&image_type=photo&per_page=10&safesearch=true`
→ ใช้ `hits[].largeImageURL` · ตรวจ license ว่าใช้เชิงพาณิชย์ได้ (Pixabay Content License = ได้)

---

# แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| HubSpot 401 | token ผิด/หมดอายุ | สร้าง token ใหม่ (B1) แล้วอัปเดต `.env` + `vercel env` |
| HubSpot 403 | scope ไม่ครบ | เพิ่ม scope แล้ว **generate token ใหม่** (แก้ scope เฉยๆ ไม่พอ) |
| สร้าง deal ได้ แต่ไม่ผูกกับ contact | ลืม `associations` | ใส่ `associationTypeId: 3` |
| `dealstage` invalid | pipeline ถูกแก้ | `GET /crm/v3/pipelines/deals` เอา stage id จริงมาใช้ |
| Stripe webhook ไม่เข้า | ยังไม่ได้รัน `stripe listen` / secret ไม่ตรง | B3 |
| Webhook signature ผิด | body ถูก parse ไปแล้ว | ปิด bodyParser ใน `api/stripe-webhook.js` |
| ราคาใน Stripe ไม่ตรง page | catalog เปลี่ยนแต่ไม่ได้ sync | รัน `setup-stripe.mjs` ใหม่ |
| GA4 ไม่เห็น event | ID ผิด / ad blocker | ดู Realtime + ปิด blocker + เช็ค `config.js` |
| Pixel ไม่ยิง | Pixel ID ว่าง | ใส่ใน `config.js` + เช็คด้วย Pixel Helper |
| KIE 402 | เครดิตหมด | แจ้งผู้สอน |
| รูปใหญ่ หน้าโหลดช้า | ไม่ได้ optimize | `node scripts/optimize-images.mjs` |
