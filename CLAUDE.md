# CMT#6 Workshop — Lead-Capturing Salepage + Auto CRM

Repo นี้เป็น **template** สำหรับ workshop 3 ชั่วโมง: สร้าง salepage ที่เก็บ lead เข้า HubSpot อัตโนมัติ
แล้วต่อการชำระเงินด้วย Stripe พร้อม track ด้วย GA4 + Facebook Pixel

## กฎสำคัญ (อ่านก่อนทำงานทุกครั้ง)

1. **อ่าน context ก่อนเขียนอะไรก็ตาม** — `context/company.md`, `clients.md`, `offers.md`, `voice.md`,
   `brand-identity/visual-guideline.md`
   ถ้า `context/` ยังว่าง (ผู้เรียนยังไม่กรอก) ให้ใช้ `context_example/` แทน และบอกผู้ใช้ว่ากำลังใช้ตัวอย่าง
2. **ห้าม hardcode API key / token ในไฟล์ใดๆ** — อ่านจาก `.env` เท่านั้น
   ห้าม echo ค่า key ออกมาใน terminal หรือใส่ใน commit message
3. **ห้าม commit `.env`** (`.gitignore` กันไว้แล้ว) — ถ้าเห็นว่า key หลุดเข้า git ให้หยุดและแจ้งผู้ใช้ทันที
4. **ถามก่อนยิง API ที่มีค่าใช้จ่าย** — KIE.ai (generate รูป) มีค่าใช้จ่ายต่อรูป
   ต้องสรุปจำนวนรูป + prompt ให้ผู้ใช้ยืนยันก่อนรัน `scripts/gen-images.mjs`
5. **ราคาต้องมาจาก `catalog.json` ฝั่ง server เท่านั้น** — ห้ามเชื่อราคาที่ browser ส่งมา
   (`api/checkout.js` ต้อง lookup ราคาจาก sku เอง)
6. **copy บนหน้าเพจเป็นภาษาไทย** โทนตาม `voice.md` — เอกสารเป็นไทย, `SKILL.md` เป็นอังกฤษ

## Skills ที่มีให้ใช้

| Skill | ใช้เมื่อไหร่ |
|---|---|
| `create-company-context` | เริ่มต้น project ใหม่ — สัมภาษณ์แบรนด์แล้วเขียนไฟล์ใน `context/` |
| `create-moodboard` | หลังมี context — สร้าง visual direction + moodboard.png |
| `generate-salepage` | สร้างหน้า salepage ตั้งแต่ offer → wireframe → copy → assets → build → deploy |
| `setup-crm` | config HubSpot + Stripe ให้ตรงกับ `offers.md` โดยอัตโนมัติ |

## โครง repo

```
context/            ← ผู้เรียนกรอกแบรนด์ตัวเอง (หัวข้อให้แล้ว)
context_example/    ← ตัวอย่างเขียนครบ (GLOW SOCIETY — wellness social club)
scripts/            ← node scripts: setup HubSpot/Stripe, gen รูป, test lead
workspace/
  salepage_glow/    ← project ตัวอย่าง (deploy เป็น Vercel project เดี่ยวๆ ได้)
    technical-setup.md   ← spec + วิธี setup ทุก tool (อ่านไฟล์นี้ก่อน config อะไร)
    assets-plan.md       ← แผนรูปทั้งหมด + prompt
    catalog.json         ← single source of truth: offers, ราคา, sku, location, service
    public/              ← หน้าเว็บ static
    api/                 ← Vercel serverless functions
```

## Conventions

- ทุก script รับ `--dry-run` ได้ → ต้องพิมพ์ payload ที่จะส่งโดยไม่เรียก API จริง (ใช้ตรวจก่อนรันจริงเสมอ)
- `catalog.json` คือแหล่งความจริงเดียวของ offers/ราคา/sku — ถ้าแก้ราคา ต้องแก้ที่นี่แล้วรัน
  `setup-hubspot.mjs` + `setup-stripe.mjs` ใหม่
- ชื่อไฟล์รูป: `[section]-[NN].webp` (เช่น `hero-01.webp`, `coach-02.webp`) เก็บใน
  `workspace/salepage_*/public/assets/`
- ห้าม gen รูปที่มีตัวหนังสือในภาพ (model เขียนไทยเพี้ยน) — ใส่ข้อความด้วย HTML/CSS แทน
- Node 20+ (ใช้ `fetch` ที่ built-in) — dependency มีแค่ `stripe`

## เวลาติดปัญหา

- HubSpot 401 → token ผิดหรือ scope ไม่ครบ → ดู checklist ใน `technical-setup.md` ส่วน A
- HubSpot 409 ตอนสร้าง contact → contact มีอยู่แล้ว → `api/lead.js` จะ search + PATCH ให้เอง
- Stripe webhook ไม่เข้า → ต้องรัน `stripe listen --forward-to localhost:3000/api/stripe-webhook`
  ตอน dev และ signing secret ต้องตรงกับ `.env`
