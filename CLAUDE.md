# CMT#6 Workshop — Lead-Capturing Salepage + Auto CRM

Repo นี้เป็น **template เปล่า** สำหรับ workshop 3 ชั่วโมง: สร้าง salepage ที่เก็บ lead เข้า HubSpot
อัตโนมัติ แล้วต่อการชำระเงินด้วย Stripe พร้อม track ด้วย GA4 + Facebook Pixel

**⚠️ หน้าเพจยังไม่มีในรีโป — เราสร้างกันในคลาสตามลำดับ Workshop Steps**
ห้ามข้ามขั้นไปเขียน `index.html` หรือ `api/*.js` ก่อนที่ขั้นก่อนหน้าจะเสร็จและผู้ใช้อนุมัติ

## ลำดับที่ต้องทำ (Workshop Steps — ห้ามข้าม ห้ามสลับ)

| # | ขั้น | ใช้อะไร | ได้อะไร |
|---|---|---|---|
| 1 | Build company context | กรอก `context/*.md` (มีหัวข้อให้) **หรือ** `cp -r context_example/. context/` | `context/{company,clients,offers,voice}.md` |
| 2 | Product brief (offer + ราคา + sku) | กรอก `context/offers.md` | ราคา/sku ที่ระบบเก็บเงินใช้ได้ |
| 3 | Setup HubSpot + Stripe | skill `setup-crm` | `catalog.json` + properties/products จริง |
| 4 | **Create a moodboard** | skill `create-moodboard` | **3 ไฟล์**: `moodboard.png` · `brand-identity/visual-guideline.md` · `voice.md` |
| 5 | Build landing page (5 stops) | skill `generate-salepage` | หน้าเพจ live บน Vercel — **ต้อง follow brand identity จากขั้น 4** |
| 6 | Test lead | `node scripts/test-lead.mjs` | Contact + Deal เด้งใน HubSpot จริง |

ถ้าผู้ใช้ขอข้ามขั้น ให้เตือนสั้นๆ ว่าขั้นนั้นเป็น input ของขั้นถัดไป แล้วถามยืนยันก่อนทำ

## กฎสำคัญ (อ่านก่อนทำงานทุกครั้ง)

1. **อ่าน context ก่อนเขียนอะไรก็ตาม** — `context/company.md`, `clients.md`, `offers.md`, `voice.md`,
   `brand-identity/visual-guideline.md`
   **`context/` มาเป็นหัวข้อเปล่า** — ผู้เรียนกรอกแบรนด์ตัวเอง (กรอก md ธรรมดา
   หรือให้ Claude ช่วยสัมภาษณ์แล้วเขียนให้ก็ได้ ไม่มี skill สำหรับขั้นนี้)
   ถ้า `context/` ยังว่างและผู้ใช้อยากลองเร็วๆ ให้เสนอ `cp -r context_example/. context/`
   (แบรนด์ตัวอย่าง GLOW SOCIETY — ข้อมูลสมมติ) แล้ว **บอกผู้ใช้ให้ชัดว่ากำลังใช้ตัวอย่าง**
2. **ห้าม hardcode API key / token ในไฟล์ใดๆ** — อ่านจาก `.env` เท่านั้น
   ห้าม echo ค่า key ออกมาใน terminal หรือใส่ใน commit message
3. **ห้าม commit `.env`** (`.gitignore` กันไว้แล้ว) — ถ้าเห็นว่า key หลุดเข้า git ให้หยุดและแจ้งผู้ใช้ทันที
4. **ถามก่อนยิง API ที่มีค่าใช้จ่าย** — KIE.ai (generate รูป) คิดเงินต่อรูป
   ต้องสรุปจำนวนรูป + prompt ให้ผู้ใช้ยืนยันก่อนรัน และรัน `--dry-run` ก่อนเสมอ
5. **ราคาต้องมาจาก `catalog.json` ฝั่ง server เท่านั้น** — ห้ามเชื่อราคาที่ browser ส่งมา
   (`api/checkout.js` ต้อง lookup ราคาจาก sku เอง)
6. **Stripe ต้องเป็น test key** (`sk_test_…`) เท่านั้นในคลาส
7. **copy บนหน้าเพจเป็นภาษาไทย** โทนตาม `voice.md` — เอกสารเป็นไทย, `SKILL.md` เป็นอังกฤษ
8. **หน้าเพจต้องยึด brand identity จากขั้น 4** — palette/ฟอนต์/แนวภาพจาก `visual-guideline.md`
   และโทน copy จาก `voice.md` ห้ามคิดสีหรือฟอนต์ใหม่เอง
9. **ฟอร์ม lead เก็บแค่ ชื่อ / อีเมล / เบอร์โทร** แล้วพาไปชำระเงินทันที
   จ่ายสำเร็จ → webhook อัปเดต deal stage เป็นชำระแล้ว

## Skills

| Skill | ใช้เมื่อไหร่ |
|---|---|
| `create-moodboard` | ขั้น 4 — moodboard.png (9:16) + visual-guideline.md + voice.md |
| `setup-crm` | ขั้น 3 — `offers.md` → `catalog.json` → config HubSpot + Stripe |
| `generate-salepage` | ขั้น 5 — offer → wireframe → copy → assets → build+wire → deploy → CRO |

`.claude/skills/_shared/gpt-image-guide.md` = วิธียิง KIE.ai (GPT Image 2) ใช้ร่วมกันทุก skill

## โครง repo

```
context/            ← **หัวข้อเปล่า** ให้ผู้เรียนกรอกแบรนด์ตัวเอง
                      brand-identity/ ว่างไว้ — skill create-moodboard เติมให้ในขั้น 4
context_example/    ← ตัวอย่างเขียนครบ GLOW SOCIETY (อย่าแก้ — copy ไปใช้ / ใช้เทียบได้)
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
