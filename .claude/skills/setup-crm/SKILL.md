---
name: setup-crm
description: Configure HubSpot and Stripe automatically from the project's offers so the salepage can capture leads and take payment. Use when the user says "setup crm", "config hubspot", "ตั้งค่า hubspot", "setup stripe", "ต่อ CRM", when catalog.json needs to be (re)generated from offers.md, or when prices changed and both systems must be re-synced.
metadata:
  version: 1.0.0
---

# Setup CRM (HubSpot + Stripe)

Read the brand's offers, turn them into one machine-readable catalog, then configure HubSpot and
Stripe to match — so `api/lead.js` and `api/checkout.js` work without any manual clicking in dashboards.

**Read `workspace/salepage_[PROJECT]/technical-setup.md` section C before doing anything** — that
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
(`workspace/[slug]/catalog.json`) — แต่ละหน้ามี catalog ของตัวเอง ราคา/sku แยกกันได้

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

- `slug` ต้องตรงกับ **ชื่อโฟลเดอร์** ของหน้านั้น (= URL) เช่น `workspace/page_a` → `"slug": "page_a"`
- `propertyPrefix` ตัวเล็ก a–z — **ใช้ค่าเดียวกันทุกหน้าใน HubSpot portal เดียวกัน**
- `price` เป็นจำนวนเต็มบาท (script จะ ×100 เป็นสตางค์ให้ Stripe เอง)
- `billing`: `one_time` หรือ `monthly`
- `hero: true` ได้ตัวเดียว
- `stripePriceId` / `hubspotProductId` ปล่อย `null` ไว้ — script จะเขียนกลับให้
- ต้องมี `dealProperties[]` + `hubspot{}` ด้วย — โครงเต็มอยู่ใน
  `../generate-salepage/references/project-scaffold.md` ข้อ 1

**ยืนยันตาราง sku/ราคา กับผู้ใช้ก่อนไปต่อ** — ราคาผิดตรงนี้ = ระบบเก็บเงินผิดทั้งสาย

## Step 2 — HubSpot

```bash
node scripts/setup-hubspot.mjs --dry-run
node scripts/setup-hubspot.mjs
```

Script จะสร้าง (ตาม spec ใน `technical-setup.md` ส่วน C):
- **custom deal properties**: `glow_location`, `glow_service_interest`, `glow_package`,
  `glow_source_page` (ปรับ prefix ตามแบรนด์ได้ แต่ต้องตรงกับที่ `api/lead.js` ส่ง)
- **products** 1 รายการต่อ 1 offer (`name`, `price`, `hs_sku`) → เขียน `hubspotProductId` กลับเข้า catalog

ถ้าได้ **401** → token ผิดหรือ scope ไม่ครบ ให้ชี้ผู้ใช้ไปที่ `technical-setup.md` ส่วน B1
(scope ที่ต้องมี: `crm.objects.contacts.read/write`, `crm.objects.deals.read/write`,
`crm.schemas.deals.write`, `crm.objects.line_items.write`, `e-commerce`)

## Step 3 — Stripe

```bash
node scripts/setup-stripe.mjs --dry-run
node scripts/setup-stripe.mjs
```

Script จะสร้าง product + price ต่อ 1 offer (THB, one-time หรือ recurring monthly)
ใส่ `metadata.sku` ให้ตรงกับ catalog แล้วเขียน `stripePriceId` กลับเข้า `catalog.json`

## Step 4 — รายงานผล

สรุปเป็นตารางให้ผู้ใช้เห็นว่าอะไรถูกสร้าง:

| SKU | HubSpot product | Stripe price | สถานะ |
|---|---|---|---|
| GLOW-TRIAL | ✅ created | ✅ created | ok |

แล้วบอกสิ่งที่ผู้ใช้ต้องทำเองใน dashboard (script ทำแทนไม่ได้):
1. Stripe → Webhooks → เพิ่ม endpoint `[SITE_URL]/api/stripe-webhook` event
   `checkout.session.completed` → เอา signing secret ใส่ `STRIPE_WEBHOOK_SECRET`
2. ตอน dev ให้รัน `stripe listen --forward-to localhost:3000/api/stripe-webhook`
3. `vercel env add` ทุก key ก่อน deploy prod

## Step 5 — ทดสอบ

```bash
node scripts/test-lead.mjs --dry-run   # ดู payload
node scripts/test-lead.mjs             # ยิง lead ปลอมเข้าระบบจริง
```

ต้องเห็น: Contact ใหม่ (หรือ contact เดิมถูก update) + Deal ผูกกับ contact นั้น +
deal properties มีค่าที่ส่งไป → แล้วบอกลิงก์ไปดู record ใน HubSpot

---

## หลายหน้าใน HubSpot portal เดียว

- **ใช้ `propertyPrefix` เดียวกันทุกหน้า** ที่อยู่ใน portal เดียวกัน ไม่งั้นจะได้ custom property
  ชุดซ้ำๆ ต่างกันแค่ prefix (`glow_location`, `page2_location`, …) รกและกรองรายงานยาก
- แยกว่า lead มาจากหน้าไหนด้วย `[prefix]_source_page` (= slug ของหน้า) ไม่ใช่ด้วย prefix
- รัน `setup-hubspot.mjs --project [slug]` ต่อหน้า — property ที่มีอยู่แล้วจะถูกข้าม (409) ไม่ซ้ำ
- Stripe: product/price ผูกกับ sku → ถ้าหน้าไหนใช้ sku เดียวกัน จะ reuse price เดิม (ไม่สร้างซ้ำ)

## เวลาแก้ราคาภายหลัง

1. แก้ `context/offers.md`
2. แก้ `catalog.json` ให้ตรง (หรือให้ skill นี้ generate ใหม่)
3. รัน `setup-hubspot.mjs` + `setup-stripe.mjs` อีกครั้ง (idempotent — ของเดิมจะไม่ซ้ำ)
4. **ราคาเก่าใน Stripe จะไม่ถูกลบ** (Stripe ไม่ให้ลบ price ที่ใช้แล้ว) — script จะสร้าง price ใหม่
   แล้วอัปเดต `stripePriceId` ให้ ของเก่าถูก archive
