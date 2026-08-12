# CMT#6 Workshop — สร้าง Salepage เก็บ Lead เข้า CRM อัตโนมัติ

> Workshop 3 ชั่วโมง โดย **โอชวิน จิรโสตติกุล**
> เครื่องมือหลัก: Claude Code · HubSpot · Stripe · Vercel · KIE.ai · Pixabay

## จบคลาสนี้คุณจะได้

- Salepage ที่ขายสินค้า/บริการของแบรนด์ตัวเอง ออนไลน์จริง (มี URL กดเข้าได้)
- Lead จากฟอร์ม → เข้า HubSpot เป็น **Contact + Deal** อัตโนมัติ
- ปุ่มชำระเงินผ่าน Stripe → จ่ายเสร็จ Deal เด้งเป็น **Closed Won** เอง
- Event `generate_lead` / `purchase` ยิงเข้า GA4 + Facebook Pixel
- Skill set ที่เอากลับไปทำ salepage ตัวถัดไปได้ใน 1 ชั่วโมง

---

## 0. เตรียมก่อนเข้าคลาส (15 นาที ทำที่บ้าน)

```bash
git clone <repo-url> cmt6-salepage
cd cmt6-salepage
cp .env.example .env
node -v            # ต้อง 20 ขึ้นไป
npm i -g vercel     # ถ้ายังไม่มี
```

แล้วเปิด **[`workspace/salepage_glow/technical-setup.md`](workspace/salepage_glow/technical-setup.md)**
→ ทำตามส่วน **A (checklist บัญชี)** และ **B (วิธีหา key ทีละขั้น)** ให้ `.env` เต็มก่อนเข้าคลาส

> ไม่ต้องรีบทำครบทุกตัว — ขอ **HubSpot** กับ **Vercel** ให้ได้ก่อนเป็นอย่างน้อย
> ส่วน KIE.ai key จะแจกในคลาส

---

## 1. Timeline ในคลาส (3 ชม.)

| เวลา | ทำอะไร | คำสั่งที่พิมพ์ใน Claude Code |
|---|---|---|
| 0:00–0:20 | เช็ค `.env` + อธิบาย funnel & โครง repo | `/setup-crm` (ดู dry-run ก่อน) |
| 0:20–0:40 | **Company context** — แบรนด์เราคือใคร | `ใช้ skill create-company-context` |
| 0:40–1:00 | **Product brief** — สินค้า/บริการ, จุดต่าง, ราคา, testimonials | กรอก `context/offers.md` |
| 1:00–1:20 | **Config CRM + Payment อัตโนมัติ** | `ใช้ skill setup-crm` |
| 1:20–1:40 | **Moodboard** — visual direction | `ใช้ skill create-moodboard` |
| 1:40–2:30 | **สร้าง Salepage** (offer → wireframe → copy → assets → build) | `ใช้ skill generate-salepage` |
| 2:30–2:45 | **Deploy** ขึ้น Vercel | `vercel --prod` |
| 2:45–3:00 | **Test lead** + ดู Deal เด้งใน HubSpot | `node scripts/test-lead.mjs` |

---

## 2. โครง repo

```
context/                    ← กรอกแบรนด์ตัวเอง (หัวข้อให้แล้ว เว้นว่างไว้)
  company.md  clients.md  offers.md  voice.md
  brand-identity/visual-guideline.md

context_example/            ← ตัวอย่างเขียนครบ: GLOW SOCIETY (wellness social club)
                              เอาไปดูเป็นแบบ หรือใช้ทำ workshop เลยก็ได้

.claude/skills/             ← 4 skills ที่ใช้ในคลาส
  create-company-context/  create-moodboard/  generate-salepage/  setup-crm/

scripts/                    ← node scripts (รับ --dry-run ทุกตัว)
  setup-hubspot.mjs   สร้าง deal properties + products ใน HubSpot
  setup-stripe.mjs    สร้าง products + prices ใน Stripe sandbox
  gen-images.mjs      generate รูปด้วย KIE.ai (GPT Image 2) ตาม assets-plan.md
  fetch-stock.mjs     ดึงรูป/ไอคอนจาก Pixabay
  test-lead.mjs       ยิง lead ปลอมเข้าระบบแล้วเช็คว่าเข้า HubSpot จริง

workspace/salepage_glow/    ← project ตัวอย่าง (copy เป็นของตัวเองได้)
  technical-setup.md   ★ tools + วิธี setup + spec ที่ AI อ่านเพื่อ config
  assets-plan.md       ★ แผนรูปทั้งหมด + prompt (review ก่อน gen จริง)
  catalog.json         ★ offers/ราคา/sku — แหล่งความจริงเดียวของทั้งระบบ
  public/index.html    หน้า salepage
  public/thanks.html   หน้าหลังจ่ายเงิน (ยิง purchase event)
  api/lead.js          รับฟอร์ม → สร้าง Contact + Deal ใน HubSpot
  api/checkout.js      สร้าง Stripe Checkout Session
  api/stripe-webhook.js จ่ายสำเร็จ → ปิด Deal เป็น Closed Won
```

---

## 3. เริ่มทำ project ของตัวเอง

```bash
cp -r workspace/salepage_glow workspace/salepage_myproject
```

แล้วบอก Claude Code:

```
อ่าน CLAUDE.md แล้วใช้ skill create-company-context
เพื่อสร้าง context ของแบรนด์ผม จากนั้นทำ salepage ใน workspace/salepage_myproject
```

---

## 4. รัน local

```bash
cd workspace/salepage_glow
npm install
vercel dev                 # เปิด http://localhost:3000
```

เทสจ่ายเงินด้วยบัตร Stripe test: `4242 4242 4242 4242` · วันหมดอายุอนาคตอะไรก็ได้ · CVC `123`

ให้ webhook เข้าเครื่องตัวเองตอน dev:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

---

## 5. Deploy

```bash
cd workspace/salepage_glow
vercel link
vercel env add HUBSPOT_PRIVATE_APP_TOKEN production   # ทำซ้ำกับ key ทุกตัวที่ใช้
vercel --prod
```

รายละเอียดครบ + วิธีตั้ง webhook ให้ชี้มาที่ URL production: ดู `technical-setup.md` ส่วน B7

---

## ⚠️ ความปลอดภัย

- ใช้ **Stripe sandbox / test key** ในคลาสเท่านั้น (`sk_test_…`) ห้ามใช้ key ตัวจริง
- `.env` ถูก gitignore ไว้ — ถ้าเผลอ commit key ให้ revoke ทันทีที่ HubSpot/Stripe dashboard
- ราคาถูก lookup จาก `catalog.json` ฝั่ง server เสมอ ไม่เชื่อค่าที่ browser ส่งมา
