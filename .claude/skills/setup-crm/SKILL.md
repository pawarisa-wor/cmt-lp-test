---
name: setup-crm
description: Configure HubSpot and Stripe automatically from the project's offers so the salepage can capture leads and take payment. Use when the user says "setup crm", "config hubspot", "ตั้งค่า hubspot", "setup stripe", "ต่อ CRM", when catalog.json needs to be (re)generated from offers.md, or when prices changed and both systems must be re-synced.
metadata:
  version: 1.0.0
---

# Setup CRM (HubSpot + Stripe)

Read the brand's offers, turn them into one machine-readable catalog, then configure HubSpot and
Stripe to match — so `api/lead.js` and `api/checkout.js` work without any manual clicking in dashboards.

**Read `technical-setup.md` (repo root) section C before doing anything** — that
file is the spec for what objects/properties/products must exist.

---

## Rules

- **`--dry-run` first, every time.** Show the user the exact payloads, get a go-ahead, then run for real.
- **Never print token values.** Not in output, not in logs, not in commit messages.
  If a key is missing, say which env var is empty — never echo what's in it.
- **Idempotent.** Running twice must not create duplicates: check for existing property/product by
  name/sku first, then create or skip. Report `created` vs `already exists` per item.
- **`catalog.json` is the single source of truth.** HubSpot, Stripe, the page and the tracking all
  read the same `sku`. If a price changes, change it here and re-run this skill.
- Stripe must be a **sandbox / test key** (`sk_test_…`). If the key doesn't start with `sk_test`,
  stop and warn the user — never configure a live account in a workshop.

---

## Step 1 — Build `catalog.json` from `offers.md`

Read `context/offers.md` (or `context_example/offers.md`) and write `catalog.json` **ในโฟลเดอร์ของหน้านั้น**
(`public_pages/[slug]/catalog.json`) — แต่ละหน้ามี catalog ของตัวเอง ราคา/sku แยกกันได้

```json
{
  "brand": "GLOW SOCIETY",
  "currency": "THB",
  "slug": "page_a",
  "propertyPrefix": "glow",
  "locations": [
    { "id": "thonglor", "label": "ทองหล่อ" },
    { "id": "sathorn",  "label": "สาทร" }
  ],
  "services": [
    { "id": "grounding", "label": "Grounding — ice bath / sauna / red light" },
    { "id": "moving",    "label": "Moving — คลาสเต้น / hyrox" }
  ],
  "offers": [
    {
      "sku": "GLOW-TRIAL",
      "name": "Social Trial",
      "price": 390,
      "billing": "one_time",
      "service": "both",
      "hero": true,
      "description": "1 รอบ Grounding หรือ Moving + เครื่องดื่ม recovery",
      "stripePriceId": null,
      "hubspotProductId": null
    }
  ]
}
```

- `slug` ต้องตรงกับ **ชื่อโฟลเดอร์** ของหน้านั้น (= URL) เช่น `public_pages/page_a` → `"slug": "page_a"`
- `propertyPrefix` ตัวเล็ก a–z — **ใช้ค่าเดียวกันทุกหน้าใน HubSpot portal เดียวกัน**
- `price` เป็นจำนวนเต็มบาท (script จะ ×100 เป็นสตางค์ให้ Stripe เอง)
- `billing`: `one_time` หรือ `monthly`
- `hero: true` ได้ตัวเดียว
- `stripePriceId` / `hubspotProductId` ปล่อย `null` ไว้ — script จะเขียนกลับให้
- ต้องมี `dealProperties[]` + `hubspot{}` ด้วย — โครงเต็มอยู่ใน
  `../generate-salepage/references/project-scaffold.md` ข้อ 1

**ยืนยันตาราง sku/ราคา กับผู้ใช้ก่อนไปต่อ** — ราคาผิดตรงนี้ = ระบบเก็บเงินผิดทั้งสาย

## Step 1b — ออกแบบ pipeline stage ให้ตรง funnel ของธุรกิจนี้

pipeline default ของ HubSpot เป็นสเตจ **B2B sales** (Appointment Scheduled · Qualified To Buy ·
Presentation Scheduled · Decision Maker Bought-In · Contract Sent) — salepage ที่คนกรอกฟอร์มแล้ว
จ่ายเงินเองไม่มีขั้นพวกนี้เลย **ต้องเขียน `hubspot.pipelineSetup` ใน `catalog.json` ทุกครั้ง**

โครงตั้งต้นที่ใช้ได้กับ salepage เกือบทุกแบบ (ปรับ label ตามภาษาที่ธุรกิจใช้จริง):

```json
"pipelineSetup": {
  "mode": "adopt",
  "label": "[แบรนด์] — Salepage",
  "stages": [
    { "key": "lead",     "label": "ลงทะเบียนจากหน้าเพจ",     "probability": 0.2, "use": "onLead" },
    { "key": "checkout", "label": "เข้าหน้าชำระเงิน",        "probability": 0.5, "use": "onCheckout" },
    { "key": "followup", "label": "ติดตามอยู่ (ยังไม่จ่าย)",  "probability": 0.3 },
    { "key": "paid",     "label": "ชำระเงินแล้ว",            "closed": "won",    "use": "onPaid" },
    { "key": "lost",     "label": "ไม่ไปต่อ",                "closed": "lost" }
  ]
}
```

- **อ่าน `context/company.md` + `offers.md` ก่อนตั้ง label** — ธุรกิจที่ต้องนัดก่อนใช้บริการ
  (คลินิก, สตูดิโอ, บริการนอกสถานที่) ควรมีสเตจ "นัดวันแล้ว" / "มาใช้บริการแล้ว" เพิ่ม
  ส่วนของที่จ่ายจบในหน้าเดียวไม่ต้องมี — **สเตจที่ไม่มีใครย้าย deal เข้าไปคือสเตจที่ไม่ควรมี**
- `use` คือสัญญาระหว่าง catalog กับ `api/`: `onLead` (บังคับ) · `onPaid` (บังคับ + `closed: "won"`)
  · `onCheckout` (ไม่บังคับ — ถ้าใส่ `api/checkout.js` จะย้ายสเตจตอนกดไปจ่ายเงิน)
- `key` **ห้ามเปลี่ยนหลังรันแล้ว** — เป็นตัวผูก `stageIds` (key → stage id จริง) ไว้จับคู่ตอนรันซ้ำ
- `mode`: `adopt` = ดัดสเตจของ pipeline เดิม (บัญชี **free ใช้ได้** เพราะไม่ได้สร้าง pipeline เพิ่ม)
  · `create` = สร้าง pipeline ใหม่ **ต้อง Starter ขึ้นไป** ถ้าบัญชีทำไม่ได้ script บอกให้กลับไปใช้ `adopt`
- ขั้นนี้ยังไม่ต้องแตะ HubSpot — แค่เขียนลง `catalog.json` แล้วไปทำ Step 2

**เสนอ funnel ให้ผู้ใช้ดูก่อน** (ตารางสเตจ + ลำดับ + ตัวไหนคือ won/lost) แล้วค่อยไป Step 2
ตัด/เพิ่มสเตจตามที่เขาบอก — เขารู้จัก sales motion ของตัวเองดีกว่า

## Step 2 — HubSpot

**ต้องใช้ script ไม่ใช่ connector** — HubSpot connector สร้าง *นิยาม* custom property ไม่ได้
(tool เรื่อง property เป็นอ่านทั้งหมด · `manage_crm_objects` สร้างได้แต่ record)
จึงต้องมี `HUBSPOT_PRIVATE_APP_TOKEN` ใน env

```bash
node scripts/setup-hubspot.mjs --dry-run   # payload ที่จะส่ง (ไม่เรียก API)
node scripts/setup-hubspot.mjs --plan      # อ่านของจริงมาเทียบ (read-only) — สเตจไหน rename/สร้าง/ลบ
node scripts/setup-hubspot.mjs             # ทำจริง
```

Script จะสร้าง (ตาม spec ใน `technical-setup.md` ส่วน C):
- **deal pipeline + สเตจ** ตาม `hubspot.pipelineSetup` → เขียน `pipeline`, `stageIds`,
  `stageOnLead`, `stageOnCheckout`, `stageOnPaid` (id จริง) กลับเข้า catalog
- **custom deal properties**: `glow_location`, `glow_service_interest`, `glow_package`,
  `glow_source_page` (ปรับ prefix ตามแบรนด์ได้ แต่ต้องตรงกับที่ `api/lead.js` ส่ง)
- **products** 1 รายการต่อ 1 offer (`name`, `price`, `hs_sku`) → เขียน `hubspotProductId` กลับเข้า catalog

**ต้องให้ผู้ใช้ดู `--plan` แล้ว confirm ก่อนรันจริง** — การแก้ pipeline กระทบ deal ทุกใบใน portal
สรุปให้เห็นชัดว่าสเตจไหนจะถูก **rename** (id เดิม ไม่กระทบอะไร) และสเตจไหนจะถูก **ลบ**

หลังรันจริง 3 ข้อที่ต้องบอกผู้ใช้:

1. **commit + push `catalog.json`** — Vercel อ่านไฟล์นี้ตอน runtime ถ้าไม่ deploy ใหม่ก็ยังใช้ id ชุดเก่า
   (ยังทำงานได้เพราะ rename ไม่เปลี่ยน id — แต่สเตจใหม่ที่ถูก *สร้าง* จะยังไม่ถูกใช้)
2. ถ้า script เตือนว่า **ย้ายสเตจไปท้ายบอร์ดแทนการลบ** = สเตจนั้นยังมี deal ค้าง
   → ย้าย deal ออกใน HubSpot แล้วรันซ้ำได้ (idempotent)
3. ยืนยันด้วย HubSpot connector: `get_crm_objects` / `search_crm_objects` ดู deal ล่าสุด
   ว่า `dealstage` ตรงกับ `stageOnLead` ที่เพิ่งเขียนลง catalog

ถ้าได้ **401** → token ผิดหรือ scope ไม่ครบ ให้ชี้ผู้ใช้ไปที่ `technical-setup.md` ส่วน B1
(scope ที่ต้องมี: `crm.objects.contacts.read/write`, `crm.objects.deals.read/write`,
`crm.schemas.deals.write`, `crm.objects.line_items.write`, `e-commerce`
· แก้ pipeline stage ต้องมี `crm.schemas.deals.write` และบางบัญชีต้องเพิ่ม `crm.pipelines.deals.write`)

## Step 3 — Stripe

มี 2 ทาง เลือกตามว่ามี key ใน env หรือไม่ — **ผลลัพธ์ต้องเหมือนกัน**: product + price
ต่อ 1 offer (THB, one-time หรือ recurring monthly), `metadata.sku` ตรงกับ catalog,
แล้ว `stripePriceId` ถูกเขียนกลับเข้า `catalog.json`

**ทาง A — Stripe connector (ไม่ต้องมี key ในเซสชัน):**

1. ยืนยันบัญชีก่อนทุกครั้ง — ต้องได้ `livemode: false` ถ้าเป็น live ให้ **หยุดและแจ้งผู้ใช้**
2. สรุปตาราง sku / ชื่อ / ราคา / billing ให้ผู้ใช้ยืนยันก่อนสร้าง
3. สร้าง product + price (`unit_amount = price * 100`, `currency: thb`,
   `metadata.sku`, ถ้า `billing === 'monthly'` ใส่ `recurring: { interval: 'month' }`)
4. **เขียน `stripePriceId` กลับเข้า `catalog.json` เอง** — connector ไม่ทำให้
   ตรวจว่าทุก offer ได้ id แล้วก่อนบอกว่าเสร็จ

**ทาง B — script (ถ้ามี `STRIPE_SECRET_KEY` ใน env):**

```bash
node scripts/setup-stripe.mjs --dry-run
node scripts/setup-stripe.mjs
```

idempotent และเขียน id กลับให้เอง — เลือกทางนี้ถ้าจะ re-sync ราคาบ่อยๆ

## Step 4 — รายงานผล

สรุปเป็นตารางให้ผู้ใช้เห็นว่าอะไรถูกสร้าง:

| SKU | HubSpot product | Stripe price | สถานะ |
|---|---|---|---|
| GLOW-TRIAL | ✅ created | ✅ created | ok |

แล้วบอกสิ่งที่ผู้ใช้ต้องทำเองใน dashboard (script ทำแทนไม่ได้):
1. Stripe → Webhooks → เพิ่ม endpoint `[SITE_URL]/api/stripe-webhook` event
   `checkout.session.completed` → เอา signing secret ใส่ `STRIPE_WEBHOOK_SECRET`
   (ต้อง deploy ก่อนจึงจะมี URL ให้ตั้ง · endpoint เดียวใช้ได้ทุกหน้า)
2. ใส่ key ทุกตัวใน **Vercel → Project Settings → Environment Variables** ก่อน deploy prod
   — ฝั่ง session ใส่ใน **Environment variables** ของ cloud environment
3. บนเครื่องตัวเองเท่านั้น: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
   (cloud session ใช้ไม่ได้ ไม่มี localhost ให้ forward)

## Step 5 — ทดสอบ

```bash
node scripts/test-lead.mjs --dry-run   # ดู payload
node scripts/test-lead.mjs             # ยิง lead ปลอมเข้าระบบจริง
```

ต้องเห็น: Contact ใหม่ (หรือ contact เดิมถูก update) + Deal ผูกกับ contact นั้น +
deal properties มีค่าที่ส่งไป → แล้วบอกลิงก์ไปดู record ใน HubSpot

**ยืนยันด้วย HubSpot connector ให้ผู้ใช้เห็นในแชทเลย** (ไม่ต้องให้เขาไปเปิด HubSpot):
- `search_crm_objects` หา contact ด้วยอีเมลที่เพิ่งยิง แล้วโชว์ deal ที่ผูกอยู่
- `get_properties` ยืนยันว่า `[prefix]_location` / `[prefix]_service_interest` มีอยู่จริง
  และมี options ตรงกับ `catalog.json`
- `test-lead.mjs` เตือนเองถ้า `dealstage` ที่ได้ไม่ตรง `stageOnLead` ใน catalog —
  เจอเตือนนี้แปลว่า **deployment ยังใช้ catalog เก่า** (ลืม commit/push) ไม่ใช่ HubSpot พัง

**ตรวจให้ครบก่อนบอกว่าเสร็จ** — `test-lead.mjs` ยิงผ่าน `SITE_URL` ถ้ายังชี้ localhost
จะไม่ได้ทดสอบของจริงบน Vercel · และปุ่มจ่ายเงินจะใช้ได้เมื่อ `STRIPE_SECRET_KEY` กับ
`STRIPE_WEBHOOK_SECRET` อยู่ใน **Vercel** แล้วเท่านั้น (connector แทนไม่ได้)

---

## หลายหน้าใน HubSpot portal เดียว

- **ใช้ `propertyPrefix` เดียวกันทุกหน้า** ที่อยู่ใน portal เดียวกัน ไม่งั้นจะได้ custom property
  ชุดซ้ำๆ ต่างกันแค่ prefix (`glow_location`, `page2_location`, …) รกและกรองรายงานยาก
- แยกว่า lead มาจากหน้าไหนด้วย `[prefix]_source_page` (= slug ของหน้า) ไม่ใช่ด้วย prefix
- รัน `setup-hubspot.mjs --project [slug]` ต่อหน้า — property ที่มีอยู่แล้วจะถูกข้าม (409) ไม่ซ้ำ
- **pipeline: ให้ทุกหน้าใน portal เดียวกันใช้ `pipelineSetup` ชุดเดียวกัน** (ก๊อปทั้งบล็อกไปวาง)
  ไม่งั้นหน้าที่รันทีหลังจะดัดสเตจของ pipeline เดิมทับหน้าแรก — บอร์ดจะสลับไปมาทุกครั้งที่รัน
  · อยากให้แต่ละหน้ามี funnel ของตัวเองจริงๆ ต้องใช้ `mode: "create"` + `label` ต่างกัน (Starter ขึ้นไป)
  แล้วชี้ `hubspot.pipeline` ของหน้านั้นไปที่ pipeline ใหม่
- Stripe: product/price ผูกกับ sku → ถ้าหน้าไหนใช้ sku เดียวกัน จะ reuse price เดิม (ไม่สร้างซ้ำ)

## เวลาแก้ราคาภายหลัง

1. แก้ `context/offers.md`
2. แก้ `catalog.json` ให้ตรง (หรือให้ skill นี้ generate ใหม่)
3. รัน `setup-hubspot.mjs` + `setup-stripe.mjs` อีกครั้ง (idempotent — ของเดิมจะไม่ซ้ำ)
4. **ราคาเก่าใน Stripe จะไม่ถูกลบ** (Stripe ไม่ให้ลบ price ที่ใช้แล้ว) — script จะสร้าง price ใหม่
   แล้วอัปเดต `stripePriceId` ให้ ของเก่าถูก archive
