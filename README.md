# CMT#6 Workshop — สร้าง Salepage เก็บ Lead เข้า CRM อัตโนมัติ

> Workshop 3 ชั่วโมง โดย **โอชวิน จิรโสตติกุล**
> เครื่องมือหลัก: Claude Code · HubSpot · Stripe · Vercel · KIE.ai · Pixabay

## จบคลาสนี้คุณจะได้

- Salepage ของแบรนด์ตัวเอง ออนไลน์จริง (มี URL กดเข้าได้)
- Lead จากฟอร์ม → เข้า HubSpot เป็น **Contact + Deal** อัตโนมัติ
- ปุ่มชำระเงินผ่าน Stripe → จ่ายเสร็จ Deal เด้งเป็น **Closed Won** เอง
- Event `generate_lead` / `purchase` ยิงเข้า GA4 + Facebook Pixel
- Skill set ที่เอากลับไปทำ salepage ตัวถัดไปได้ใน 1 ชั่วโมง

**รีโปนี้เป็น template เปล่า** — หน้าเพจ, API, catalog ยังไม่มี เพราะเราจะสร้างกันในคลาสทีละขั้น

---

## 0. เตรียมก่อนเข้าคลาส (15 นาที)

```bash
git clone <repo-url> cmt6-salepage
cd cmt6-salepage
cp .env.example .env
node -v            # ต้อง 20 ขึ้นไป
npm i -g vercel
```

เปิด **[`workspace/salepage_[PROJECT]/technical-setup.md`](workspace/salepage_%5BPROJECT%5D/technical-setup.md)**
→ ทำตามส่วน **A (checklist บัญชี)** และ **B (วิธีหา key ทีละขั้น)**

> ขอ **HubSpot** กับ **Vercel** ให้ได้ก่อนเป็นอย่างน้อย · KIE.ai key แจกในคลาส

---

## 1. ลำดับในคลาส (Workshop Steps)

| เวลา | ขั้น | พิมพ์อะไรใน Claude Code |
|---|---|---|
| 0:00–0:20 | เช็ค `.env` + อธิบาย funnel และโครงรีโป | — |
| 0:20–0:45 | **1. Build company context** | กรอก `context/*.md` (มี `templates/` เปล่า + `context_example/` ให้ copy) |
| 0:45–1:05 | **2. Product brief** — offer, ราคา, sku, testimonials | กรอก `context/offers.md` |
| 1:05–1:25 | **3. Setup HubSpot + Stripe** | `ใช้ skill setup-crm` |
| 1:25–1:45 | **4. Create a moodboard** (ได้ moodboard.png + visual-guideline.md + voice.md) | `ใช้ skill create-moodboard` |
| 1:45–2:40 | **5. Build landing page** (offer → wireframe → copy → assets → build) | `ใช้ skill generate-salepage` |
| 2:40–2:50 | **Deploy** ขึ้น Vercel | `vercel --prod` |
| 2:50–3:00 | **6. Test lead** + ดู Deal เด้งใน HubSpot | `node scripts/test-lead.mjs` |

แต่ละขั้นเป็น input ของขั้นถัดไป — ข้ามแล้วขั้นหลังจะเดาข้อมูลเอง แล้วหน้าเพจจะไม่ตรงแบรนด์

---

## 2. โครง repo

```
templates/                  ← หัวข้อเปล่า (company/clients/offers/voice + brand-identity)
                              ไม่อยากกรอก? `cp -r context_example/. context/` ใช้ตัวอย่างเลย

context/                    ← ข้อมูลแบรนด์ที่ใช้งานจริง
  company.md  clients.md  offers.md  voice.md
  brand-identity/visual-guideline.md  moodboard-prompt.txt
  ▸ ตอนนี้ใส่แบรนด์ตัวอย่าง GLOW SOCIETY (wellness social club) ไว้ให้แล้ว
    เพื่อให้ทดลองรันได้ทันที — จะทำแบรนด์ตัวเอง: `cp -r templates/. context/` แล้วกรอก

context_example/            ← ตัวอย่างอ้างอิง (ไม่ต้องแก้)

.claude/skills/
  create-moodboard/         (+ references/ = prompt 2 สไตล์: flowing / bento grid)
                            → ออก 3 ไฟล์: moodboard.png, visual-guideline.md, voice.md
  setup-crm/
  generate-salepage/        (+ references/ 7 ไฟล์: offer-building, design-standards,
                              copywriting, lead-form, tracking, cro-check, project-scaffold)
  _shared/gpt-image-guide.md

scripts/                    ← ทุกตัวรับ --dry-run
  setup-hubspot.mjs   สร้าง deal properties + products ใน HubSpot
  setup-stripe.mjs    สร้าง products + prices ใน Stripe sandbox
  gen-images.mjs      generate รูปด้วย KIE.ai (GPT Image 2)
  fetch-stock.mjs     ดึงรูป/ไอคอนจาก Pixabay (ฟรี)
  optimize-images.mjs ย่อ/บีบรูปให้ผ่านเป้าน้ำหนัก
  test-lead.mjs       ยิง lead ปลอมเข้าระบบแล้วเช็คว่าเข้า HubSpot จริง

workspace/
  salepage_[PROJECT]/       ← template เปล่า มี 2 ไฟล์
    technical-setup.md      ★ tools + วิธี setup ทีละคลิก + spec ที่ AI อ่านเพื่อ config เอง
    assets-plan.md          ★ โครงวางแผนรูป (review ก่อน generate จริง)
```

หน้าเพจ (`public/`), API (`api/`), `catalog.json`, `assets.json` **จะถูกสร้างในคลาส** —
โครงและ code pattern อยู่ใน `.claude/skills/generate-salepage/references/project-scaffold.md`

---

## 3. เริ่มทำโปรเจกต์

```bash
cp -r "workspace/salepage_[PROJECT]" workspace/salepage_myproject
```

แล้วบอก Claude Code:

```
อ่าน CLAUDE.md แล้วช่วยสัมภาษณ์ผมเพื่อกรอก context/ ของแบรนด์ผม
(ใช้หัวข้อจาก templates/) จากนั้นทำ moodboard แล้วทำ salepage ใน workspace/salepage_myproject
```

---

## 4. รัน local (หลังมีหน้าเพจแล้ว)

```bash
cd workspace/salepage_myproject
npm install
vercel dev                 # http://localhost:3000
```

บัตรทดสอบ Stripe: `4242 4242 4242 4242` · วันหมดอายุอนาคตอะไรก็ได้ · CVC `123`

ให้ webhook เข้าเครื่องตัวเองตอน dev:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

---

## ⚠️ ความปลอดภัย

- ใช้ **Stripe test key** (`sk_test_…`) ในคลาสเท่านั้น — โค้ดปฏิเสธ key จริงให้อยู่แล้ว
- `.env` ถูก gitignore ไว้ — ถ้าเผลอ commit key ให้ revoke ทันทีที่ dashboard
- ราคาถูก lookup จาก `catalog.json` ฝั่ง server เสมอ ไม่เชื่อค่าที่ browser ส่งมา
- ข้อมูลแบรนด์ GLOW SOCIETY ทั้งหมดเป็น **ข้อมูลสมมติ** สำหรับ workshop ไม่ใช่ธุรกิจจริง
