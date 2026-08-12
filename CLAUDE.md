# CMT#6 Workshop — Lead-Capturing Salepage + Auto CRM

Repo นี้เป็น **template เปล่า** สำหรับ workshop 3 ชั่วโมง: สร้าง salepage ที่เก็บ lead เข้า HubSpot
อัตโนมัติ แล้วต่อการชำระเงินด้วย Stripe พร้อม track ด้วย GA4 + Facebook Pixel

**⚠️ หน้าเพจยังไม่มีในรีโป — เราสร้างกันในคลาสตามลำดับ Workshop Steps**
ห้ามข้ามขั้นไปเขียน `index.html` หรือ `api/*.js` ก่อนที่ขั้นก่อนหน้าจะเสร็จและผู้ใช้อนุมัติ

## ลำดับที่ต้องทำ (Workshop Steps — ห้ามข้าม ห้ามสลับ)

| # | ขั้น | ใช้อะไร | ได้อะไร |
|---|---|---|---|
| 1 | Build company context | skill `create-company-context` | `context/*.md` ครบ 5 ไฟล์ |
| 2 | Product brief (offer + ราคา + sku) | กรอก `context/offers.md` | ราคา/sku ที่ระบบเก็บเงินใช้ได้ |
| 3 | Setup HubSpot + Stripe | skill `setup-crm` | `catalog.json` + properties/products จริง |
| 4 | Moodboard + visual direction | skill `create-moodboard` | `moodboard.png` + `visual-guideline.md` ที่ล็อกแล้ว |
| 5 | Build landing page (5 stops) | skill `generate-salepage` | หน้าเพจ live บน Vercel |
| 6 | Test lead | `node scripts/test-lead.mjs` | Contact + Deal เด้งใน HubSpot จริง |

ถ้าผู้ใช้ขอข้ามขั้น ให้เตือนสั้นๆ ว่าขั้นนั้นเป็น input ของขั้นถัดไป แล้วถามยืนยันก่อนทำ

## กฎสำคัญ (อ่านก่อนทำงานทุกครั้ง)

1. **อ่าน context ก่อนเขียนอะไรก็ตาม** — `context/company.md`, `clients.md`, `offers.md`, `voice.md`,
   `brand-identity/visual-guideline.md`
   ตอนนี้ `context/` ใส่แบรนด์ตัวอย่าง **GLOW SOCIETY** (ข้อมูลสมมติ) ไว้ให้แล้ว
   ถ้าผู้เรียนจะทำแบรนด์ตัวเอง ให้ skill `create-company-context` เขียนทับด้วยหัวข้อเปล่าจาก
   `.claude/skills/create-company-context/templates/`
2. **ห้าม hardcode API key / token ในไฟล์ใดๆ** — อ่านจาก `.env` เท่านั้น
   ห้าม echo ค่า key ออกมาใน terminal หรือใส่ใน commit message
3. **ห้าม commit `.env`** (`.gitignore` กันไว้แล้ว) — ถ้าเห็นว่า key หลุดเข้า git ให้หยุดและแจ้งผู้ใช้ทันที
4. **ถามก่อนยิง API ที่มีค่าใช้จ่าย** — KIE.ai (generate รูป) คิดเงินต่อรูป
   ต้องสรุปจำนวนรูป + prompt ให้ผู้ใช้ยืนยันก่อนรัน และรัน `--dry-run` ก่อนเสมอ
5. **ราคาต้องมาจาก `catalog.json` ฝั่ง server เท่านั้น** — ห้ามเชื่อราคาที่ browser ส่งมา
   (`api/checkout.js` ต้อง lookup ราคาจาก sku เอง)
6. **Stripe ต้องเป็น test key** (`sk_test_…`) เท่านั้นในคลาส
7. **copy บนหน้าเพจเป็นภาษาไทย** โทนตาม `voice.md` — เอกสารเป็นไทย, `SKILL.md` เป็นอังกฤษ

## Skills

| Skill | ใช้เมื่อไหร่ |
|---|---|
| `create-company-context` | ขั้น 1 — สัมภาษณ์แบรนด์แล้วเขียนไฟล์ใน `context/` |
| `create-moodboard` | ขั้น 4 — visual direction + moodboard.png (9:16) |
| `setup-crm` | ขั้น 3 — `offers.md` → `catalog.json` → config HubSpot + Stripe |
| `generate-salepage` | ขั้น 5 — offer → wireframe → copy → assets → build+wire → deploy → CRO |

`.claude/skills/_shared/gpt-image-guide.md` = วิธียิง KIE.ai (GPT Image 2) ใช้ร่วมกันทุก skill

## โครง repo

```
context/            ← ข้อมูลแบรนด์ที่ใช้งานจริง (ตอนนี้ใส่ GLOW SOCIETY ตัวอย่างไว้)
context_example/    ← ตัวอย่างอ้างอิง (อย่าแก้ — ใช้เทียบตอนผู้เรียนตอบไม่ออก)
scripts/            ← node scripts ทุกตัวรับ --dry-run
workspace/
  salepage_[PROJECT]/     ← template เปล่า: technical-setup.md + assets-plan.md
                            copy เป็น salepage_[ชื่อโปรเจกต์] แล้วสร้างของจริงในคลาส
.env.example        ← ชื่อ key ทั้งหมด (คัดลอกเป็น .env)
```

## Conventions

- ทุก script รับ `--dry-run` → พิมพ์ payload ที่จะส่งโดยไม่เรียก API จริง (ใช้ตรวจก่อนรันจริงเสมอ)
- script หา project ใน `workspace/` เองถ้ามีอันเดียว ถ้ามีหลายอันต้องใส่ `--project [ชื่อ]`
- `catalog.json` คือแหล่งความจริงเดียวของ offers/ราคา/sku — sku เดียวกันนี้ใช้ทั้ง HubSpot product,
  Stripe price และ GA4 `item_id` · ถ้าแก้ราคา ต้องรัน `setup-hubspot.mjs` + `setup-stripe.mjs` ใหม่
- ชื่อไฟล์รูป: `[section]-[NN].webp` (เช่น `hero-01.webp`) เก็บใน
  `workspace/salepage_*/public/assets/` — ตัวเล็ก ไม่มีอักษรไทย ไม่มีเว้นวรรค
- GPT Image 2 เขียนภาษาไทยในรูปได้ถูกต้อง แต่บนหน้าเพจใช้ HTML text (แก้ง่าย SEO ได้)
  ใส่ตัวหนังสือในรูปเฉพาะ og-image และ moodboard
- Node 20+ (ใช้ `fetch` built-in) — dependency ของหน้าเพจมีแค่ `stripe`

## เวลาติดปัญหา

- HubSpot 401 → token ผิด · 403 → scope ไม่ครบ (ต้อง generate token ใหม่หลังแก้ scope)
  → ดู `workspace/salepage_[PROJECT]/technical-setup.md` ส่วน B1
- HubSpot 409 ตอนสร้าง contact → contact มีอยู่แล้ว → search แล้ว PATCH (ห้ามใช้ batch/upsert ด้วย email)
- Stripe webhook signature ไม่ผ่าน → ลืมปิด bodyParser ใน `api/stripe-webhook.js`
- Stripe webhook ไม่เข้าตอน dev → ต้องรัน `stripe listen --forward-to localhost:3000/api/stripe-webhook`
