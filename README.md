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

คลาสนี้รันบน **Claude Code Cloud Session** — **ไม่ต้องติดตั้งอะไรบนเครื่องเลย**
ไม่ต้องลง Node, git, Vercel CLI หรือ Stripe CLI เพราะเครื่อง cloud มีให้พร้อมแล้ว
(Node 20/21/22 · npm/yarn/pnpm · git · jq · ripgrep) ใช้ Mac, Windows, iPad หรือ Chromebook
ก็เหมือนกันหมด ขอแค่เปิดเบราว์เซอร์ได้

**3 อย่างที่ต้องมีก่อนเข้าคลาส:**

1. **บัญชี Claude แบบ Pro / Max / Team / Enterprise** — แผนฟรีใช้ Claude Code ไม่ได้
2. **บัญชี GitHub** + fork รีโปนี้ไปเป็นของตัวเอง (ต้อง push ได้ตอน deploy)
3. **เข้า [claude.ai/code](https://claude.ai/code) ได้** → authorize Claude GitHub App → เลือก repo

**ต่อ connector 4 ตัว** ที่ claude.ai/code → เมนู **Connectors**:

| Connector | ช่วยอะไร |
|---|---|
| **GitHub** | clone / commit / push ให้ โดย credential ไม่เข้าไปอยู่ในเครื่อง cloud |
| **Stripe** | สร้าง product/price + webhook endpoint ให้ — **ไม่ต้องใส่ `STRIPE_SECRET_KEY` ในเซสชัน** |
| **HubSpot** | ตรวจผลในแชทว่า lead เข้าจริงไหม (แต่ยังต้องสร้าง Service Key เอง) |
| **Vercel** | อ่าน build log ให้ Claude ช่วย debug ตอน deploy พัง |

> ตอนต่อ **Stripe** เลือก **sandbox** · ตอนต่อ **Vercel** เลือก **All projects**

**แล้วตั้งค่า environment** ที่ claude.ai/code → ไอคอนรูปเมฆ:

| ช่อง | ใส่อะไร |
|---|---|
| **Network access** | **Full** — API ของคลาสนี้ไม่อยู่ใน default allowlist ของ Trusted |
| **Environment variables** | ก๊อปจาก [`.env.example`](.env.example) ทั้งก้อนมาวาง แล้วเติมค่า |

> ⚠️ ค่าถูกอ่านตอน session เริ่มครั้งเดียว — ใส่ค่าใหม่แล้วต้อง **เปิด session ใหม่**
> ⚠️ **Vercel ต้องกรอก env เองอีก 3 ตัว** — connector ตั้งให้ไม่ได้ (ดู technical-setup B7)
> `SITE_URL` ไม่ต้องใส่ Vercel ตั้งเองจาก `VERCEL_PROJECT_PRODUCTION_URL`

เปิด **[`technical-setup.md`](technical-setup.md)** (อยู่ที่ root ของรีโป)
→ ทำตามส่วน **A (checklist บัญชี)** และ **B (วิธีหา key ทีละขั้น)**

> ขอ **HubSpot** กับ **Vercel** ให้ได้ก่อนเป็นอย่างน้อย · KIE.ai key แจกในคลาส
> อยากทำบนเครื่องตัวเองแทน? ดู [ส่วน B0](technical-setup.md) — ใช้ได้ แต่ต้องลง Node 20+ กับ git เอง

---

## 1. ลำดับในคลาส (Workshop Steps)

| เวลา | ขั้น | พิมพ์อะไรใน Claude Code |
|---|---|---|
| 0:00–0:20 | เช็ค env var ครบ + อธิบาย funnel และโครงรีโป | — |
| 0:20–0:45 | **1. Build company context** | กรอก `context/*.md` (มีหัวข้อให้) หรือ `cp -r context_example/. context/` |
| 0:45–1:05 | **2. Product brief** — offer, ราคา, sku, testimonials | กรอก `context/offers.md` |
| 1:05–1:25 | **3. Setup HubSpot + Stripe** | `ใช้ skill setup-crm` |
| 1:25–1:45 | **4. Create a moodboard** (ได้ moodboard.png + visual-guideline.md + voice.md) | `ใช้ skill create-moodboard` |
| 1:45–2:40 | **5. Build landing page** (offer → wireframe → copy → assets → build) | `ใช้ skill generate-salepage` |
| 2:40–2:50 | **Deploy** ขึ้น Vercel | `git push` (Git integration deploy เอง) |
| 2:50–3:00 | **6. Test lead** + ดู Deal เด้งใน HubSpot | `node scripts/test-lead.mjs` |

แต่ละขั้นเป็น input ของขั้นถัดไป — ข้ามแล้วขั้นหลังจะเดาข้อมูลเอง แล้วหน้าเพจจะไม่ตรงแบรนด์

---

## 2. โครง repo

```
context/                    ← **หัวข้อเปล่า** — ผู้เรียนกรอกแบรนด์ตัวเองที่นี่
  company.md  clients.md  offers.md  voice.md
  brand-identity/            ว่างไว้ — create-moodboard เติม moodboard.png +
                             visual-guideline.md ให้ในขั้น 4

context_example/            ← ตัวอย่างเขียนครบ: GLOW SOCIETY (wellness social club BKK)
  company.md  clients.md  offers.md  voice.md
  brand-identity/visual-guideline.md  moodboard-prompt.txt
  ▸ ไม่อยากกรอกเอง? `cp -r context_example/. context/` แล้วทำ workshop ต่อได้เลย

.claude/skills/
  create-moodboard/         (+ references/ = prompt 2 สไตล์: flowing / bento grid)
                            → ออก 3 ไฟล์: moodboard.png, visual-guideline.md, voice.md
  setup-crm/
  generate-salepage/        (+ references/ 7 ไฟล์: offer-building, design-standards,
                              copywriting, lead-form, tracking, cro-check, project-scaffold)
  _shared/gpt-image-guide.md

scripts/                    ← ทุกตัวรับ --dry-run
  setup-hubspot.mjs   ดัด deal pipeline/สเตจ + สร้าง deal properties + products ใน HubSpot
                      (--plan = อ่านของจริงมาเทียบก่อน ไม่เขียนอะไร)
  setup-stripe.mjs    สร้าง products + prices ใน Stripe sandbox
  gen-images.mjs      generate รูปด้วย KIE.ai (GPT Image 2)
  fetch-stock.mjs     ดึงรูป/ไอคอนจาก Pixabay (ฟรี)
  optimize-images.mjs ย่อ/บีบรูปให้ผ่านเป้าน้ำหนัก
  test-lead.mjs       ยิง lead ปลอมเข้าระบบแล้วเช็คว่าเข้า HubSpot จริง

  build-site.mjs      ประกอบทุกหน้าใน public_pages/ ลง public/ สำหรับ deploy
  lib/pipeline.mjs    ดัด deal pipeline ให้ตรง funnel (+ pipeline.test.mjs รันเทสได้เลย)

vercel.json                 ← Vercel project อยู่ที่ root · package.json (stripe)
technical-setup.md          ★ ของกลางทุกหน้า: tools + วิธี setup ทีละคลิก + spec ที่ AI อ่านเพื่อ config เอง

public_pages/
  [SALEPAGE_SLUG]/       ← template เปล่า
    salepage-brief.md       ★ brief ของหน้านั้น (Stop 0 ถามผู้ใช้แล้วเติมให้)
    assets-plan.md          ★ โครงวางแผนรูป (review ก่อน generate จริง)
  [slug]/                   ← 1 โฟลเดอร์ = 1 หน้าเพจ (ชื่อโฟลเดอร์ = URL)
```

**สิ่งที่ยังไม่มีในรีโป — สร้างในคลาสทั้งหมด:**

| ไฟล์ | สร้างตอนไหน |
|---|---|
| `context/*.md` (มีแต่หัวข้อ) | ขั้น 1–2 กรอกเอง หรือ `cp -r context_example/. context/` |
| `public_pages/[slug]/` | Stop 0 (copy จาก `[SALEPAGE_SLUG]`) |
| `catalog.json` | skill `setup-crm` |
| `lib/{pages,catalog,hubspot}.js` · `api/{lead,checkout,stripe-webhook}.js` | Stop 5a |
| `public/{index,thanks,config}.html/js` + `assets/` | Stop 4–5a |

> `api/health.js` มีให้แล้วตัวเดียว เพื่อให้ deploy แรกยืนยันได้ว่า env ครบก่อนเริ่มสร้างอะไร

หน้าเพจ (`public/`), API (`api/`), `catalog.json`, `assets.json` **จะถูกสร้างในคลาส** —
โครงและ code pattern อยู่ใน `.claude/skills/generate-salepage/references/project-scaffold.md`

---

## 2b. หลายหน้าใน Vercel deployment เดียว

**ชื่อโฟลเดอร์ใน `public_pages/` = URL ของหน้านั้น**

```
public_pages/page_a/   →   https://[project].vercel.app/page_a
public_pages/page_b/   →   https://[project].vercel.app/page_b
```

```bash
node scripts/build-site.mjs --dry-run   # ดูว่ามีหน้าอะไรจะขึ้น
git push                                # Git integration deploy ทุกหน้าพร้อมกัน
```

- `api/` + `lib/` แชร์ทุกหน้า (สร้างครั้งเดียวตอนทำหน้าแรก) — แต่ละหน้ามี `catalog.json` ของตัวเอง
- ตั้ง env และ Stripe webhook **ครั้งเดียว** ใช้ได้ทุกหน้า
- เพิ่มหน้าใหม่ = สร้างโฟลเดอร์ใหม่ + `git push` · หน้าเดิมไม่หาย

---

## 3. เริ่มทำโปรเจกต์

```bash
cp -r "public_pages/[SALEPAGE_SLUG]" public_pages/page_a     # ชื่อโฟลเดอร์ = URL → /page_a
```

แล้วบอก Claude Code:

```
อ่าน CLAUDE.md แล้วช่วยสัมภาษณ์ผมเพื่อกรอก context/ ของแบรนด์ผม
จากนั้นทำ moodboard แล้วทำ salepage ใน public_pages/page_a
```

---

## 4. ทดสอบหน้าเพจ

บัตรทดสอบ Stripe: `4242 4242 4242 4242` · วันหมดอายุอนาคตอะไรก็ได้ · CVC `123`

**บน cloud session** — deploy ก่อนแล้วทดสอบบน URL จริง (ไม่มี localhost ให้ใช้):

```bash
node scripts/test-lead.mjs --dry-run   # ดู payload ที่จะส่ง
node scripts/test-lead.mjs             # ยิง lead ปลอมเข้า HubSpot จริง
```

แล้วเปิด URL ที่ Vercel ให้ กดปุ่มจ่ายเงินด้วยบัตรทดสอบ → เช็คว่า deal ย้ายไปสเตจ "ชำระเงินแล้ว"
(สเตจตาม `hubspot.stageOnPaid` ใน `catalog.json` — pipeline ถูกดัดให้ตรง funnel ในขั้น 3)
(ต้องตั้ง webhook endpoint ใน Stripe dashboard ให้ชี้ URL production แล้ว — ดู B3)

**ถ้าทำบนเครื่องตัวเอง** (ต้องมี Node + Vercel CLI + Stripe CLI):

```bash
npm install                # ที่ root ของ repo
vercel dev                 # http://localhost:3000/[slug]
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

---

## ⚠️ ความปลอดภัย

- ใช้ **Stripe test key** (`sk_test_…`) ในคลาสเท่านั้น — โค้ดปฏิเสธ key จริงให้อยู่แล้ว
- **Environment variables ไม่ใช่ที่เก็บ secret** — ใครใช้ environment นั้นอ่านค่าได้
  ใช้ได้เฉพาะ environment ส่วนตัว + test key และ **revoke ทุกตัวหลังเรียนจบ**
  ห้ามใส่ key ของระบบจริง และห้ามใช้ shared environment ของทีม
- `.env` ถูก gitignore ไว้ — ถ้าเผลอ commit key ให้ **revoke ที่ dashboard** ทันที
  ไม่ใช่แค่ลบไฟล์ เพราะประวัติ git ยังเก็บค่าไว้
- **HubSpot ใช้ portal ใหม่** อย่าใช้ของบริษัทจริง — contact ทดสอบจะไปปนกับ lead จริง
- ราคาถูก lookup จาก `catalog.json` ฝั่ง server เสมอ ไม่เชื่อค่าที่ browser ส่งมา
- ข้อมูลแบรนด์ GLOW SOCIETY ทั้งหมดเป็น **ข้อมูลสมมติ** สำหรับ workshop ไม่ใช่ธุรกิจจริง
