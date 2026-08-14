# `[SALEPAGE_SLUG]` — template ของ 1 หน้าเพจ

โฟลเดอร์นี้เป็น **แม่แบบ ไม่ใช่หน้าเพจจริง** — ห้ามแก้เนื้อในเพื่อทำหน้าของตัวเอง
ให้ copy ออกไปเป็นโฟลเดอร์ใหม่ก่อน (`scripts/` ข้ามโฟลเดอร์ชื่อนี้ให้อยู่แล้ว จึงไม่ถูกนับเป็นหน้า)

## ชื่อโฟลเดอร์ = URL ของหน้านั้น

```bash
cp -r "public_pages/[SALEPAGE_SLUG]" public_pages/page_a    # → [domain]/page_a
```

- ใช้ได้แค่ `a-z 0-9 - _` และต้องเริ่มด้วยตัวอักษร/ตัวเลข (มันคือ URL segment)
- หลายหน้าอยู่ใน Vercel deployment เดียวกันได้ — `public_pages/page_a` → `/page_a`,
  `public_pages/page_b` → `/page_b` · หน้าเดิมไม่หายเมื่อเพิ่มหน้าใหม่
- `scripts/build-site.mjs` จะประกอบ `public_pages/*/public/` ทุกหน้าลง `public/` ที่ root ตอน build

แล้วบอก Claude Code:

```
อ่าน CLAUDE.md แล้วใช้ skill generate-salepage
ทำ salepage ใน public_pages/page_a จาก context/
```

Claude จะ **ถาม brief ของหน้านี้ก่อน** (ขายอะไร · ให้ใคร · คนอ่านมาจากไหน · angle ไหน)
ถ้ายังไม่มีคำตอบ มันจะร่างให้จาก `context/` แล้วบอกว่าข้อไหนเป็นการเดา

## มีอะไรให้แล้ว (2 ไฟล์)

| ไฟล์ | คืออะไร |
|---|---|
| `salepage-brief.md` | **brief ของหน้านี้** — ขายอะไร ให้ใคร angle ไหน · Stop 0 ถามผู้ใช้แล้วเติมให้ · **เป็น input แรกสุดของทุก stop** |
| `assets-plan.md` | โครงวางแผนรูป — Stop 4 เติมให้ (review ก่อน generate จริง เพราะ **คิดเงินต่อรูป**) |

> `technical-setup.md` **ไม่ได้อยู่ในโฟลเดอร์นี้** — ย้ายไปที่ root ของรีโปแล้ว
> เพราะบัญชี/key/connector/env เป็นของกลางทุกหน้า ไม่ใช่ของหน้าใดหน้าเดียว

## brief ทำให้แต่ละหน้าต่างกัน — `context/` ไม่ได้ทำ

`context/` (แบรนด์คือใคร · ลูกค้าเป็นใคร · โทนเสียง · brand identity) **ใช้ร่วมกันทุกหน้า**
สิ่งที่ทำให้หน้า A ต่างจากหน้า B อยู่ใน `salepage-brief.md` ของแต่ละหน้า:

| หน้า | brief ต่างกันยังไง |
|---|---|
| `public_pages/ice-bath/` | ขาย **sku เดียว** · traffic จาก FB ad · angle "นอนไม่หลับ" |
| `public_pages/all-in/` | ขาย **หลาย sku ให้เทียบแล้ว checkout** · traffic จาก LINE (รู้จักแบรนด์แล้ว) · angle "คุ้มกว่าถ้ามาบ่อย" |
| `public_pages/squad/` | ขาย sku เดียว · angle "ชวนเพื่อนมาด้วยกัน" · คนละรูป คนละ headline |

แบรนด์เดียวกัน สินค้าชุดเดียวกัน แต่คนละหน้าได้ — **นี่คือเหตุผลที่ `public_pages/` มีได้หลายโฟลเดอร์**

## อะไรจะถูกสร้างในคลาส (ไม่ต้องเตรียมมาก่อน)

**ในโฟลเดอร์หน้านี้:**
```
_progress.md             ← tracker ว่าทำถึง stop ไหน / gate ไหนผ่านแล้ว
catalog.json             ← offers/ราคา/sku (skill setup-crm สร้างจาก context/offers.md)
offer-building.md        ← Stop 1  → gate B
design-guide.md          ← Stop 2
wireframe-copywriting.md ← Stop 2 (ผัง ASCII) + Stop 3 (copy) — ไฟล์เดียว ตรวจครั้งเดียว → gate C
assets.json              ← Stop 4 (ไฟล์ที่ scripts/gen-images.mjs อ่าน)
public/
  index.html             ← Stop 5a
  thanks.html            ← Stop 5a
  config.js              ← Stop 5a (GA4 ID / Pixel ID)
  assets/                ← รูปที่ generate + manifest.md
cro-report.md            ← Stop 5b → gate D
```

**ที่ root ของ repo (แชร์ทุกหน้า — สร้างครั้งเดียวตอนทำหน้าแรก):**
```
api/lead.js  api/checkout.js  api/stripe-webhook.js
lib/pages.js  lib/catalog.js  lib/hubspot.js
public/                  ← ผลผลิตของ scripts/build-site.mjs (gitignored ห้ามแก้มือ)
vercel.json  package.json  technical-setup.md   ← มีให้แล้ว
```

> โครง + code pattern ของไฟล์พวกนี้อยู่ใน
> `.claude/skills/generate-salepage/references/project-scaffold.md`
> Claude อ่านไฟล์นั้นตอน Stop 5a ไม่ต้องเขียนจากศูนย์

## ลำดับที่ต้องทำ (ห้ามข้าม)

| # | ทำอะไร | ได้อะไร | คนต้องตรวจ |
|---|---|---|---|
| 1 | กรอก `context/*.md` (หรือ `cp -r context_example/. context/`) | แบรนด์ที่ทุกหน้าใช้ร่วมกัน | — |
| 2 | skill `create-moodboard` | `moodboard.png` + `visual-guideline.md` + `voice.md` | ✅ **gate A** |
| 3 | skill `setup-crm` | `catalog.json` + HubSpot/Stripe จริง | — |
| 4 | skill `generate-salepage` | brief → offer → ผัง+copy → รูป → หน้าเพจ live | ✅ **gate B · C · D · E** |
| 5 | `node scripts/test-lead.mjs --url [production URL]` | Contact + Deal เด้งใน HubSpot จริง | — |

รายละเอียดของ gate ทั้ง 5 อยู่ใน `CLAUDE.md` (หัวข้อ Review gate)
