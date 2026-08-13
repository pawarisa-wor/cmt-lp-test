# CMT#6 Workshop — Lead-Capturing Salepage + Auto CRM

Repo นี้เป็น **template เปล่า** สำหรับ workshop 3 ชั่วโมง: สร้าง salepage ที่เก็บ lead เข้า HubSpot
อัตโนมัติ แล้วต่อการชำระเงินด้วย Stripe พร้อม track ด้วย GA4 + Facebook Pixel

**⚠️ หน้าเพจยังไม่มีในรีโป — เราสร้างกันในคลาสตามลำดับ Workshop Steps**
ห้ามข้ามขั้นไปเขียน `index.html` หรือ `api/*.js` ก่อนที่ขั้นก่อนหน้าจะเสร็จและผู้ใช้อนุมัติ

## ลำดับที่ต้องทำ (Workshop Steps — ห้ามข้าม ห้ามสลับ)

| # | ขั้น | ใช้อะไร | ได้อะไร |
|---|---|---|---|
| **0** | **Setup keys ให้ครบก่อน** | ใส่ค่าใน **Environment variables** ของ cloud environment (ดู `technical-setup.md` ส่วน A–B) | key ครบก่อนเริ่ม — ขั้น 3–5 ไม่สะดุดกลางทาง |
| 1 | Build company context | กรอก `context/*.md` (มีหัวข้อให้) **หรือ** `cp -r context_example/. context/` | `context/{company,clients,offers,voice}.md` |
| 2 | Product brief (offer + ราคา + sku) | กรอก `context/offers.md` | ราคา/sku ที่ระบบเก็บเงินใช้ได้ |
| 3 | Setup HubSpot + Stripe | skill `setup-crm` | `catalog.json` + properties/products/**pipeline stage** จริง |
| 4 | **Create a moodboard** | skill `create-moodboard` | **3 ไฟล์**: `moodboard.png` · `brand-identity/visual-guideline.md` · `voice.md` |
| 5 | Build landing page (Stop 0–5c) | skill `generate-salepage` | **`salepage-brief.md`** (ขอ brief ก่อนลงมือ) → หน้าเพจ live บน Vercel — **ต้อง follow brand identity จากขั้น 4** |
| 6 | Test lead | `node scripts/test-lead.mjs` | Contact + Deal เด้งใน HubSpot จริง |

ถ้าผู้ใช้ขอข้ามขั้น ให้เตือนสั้นๆ ว่าขั้นนั้นเป็น input ของขั้นถัดไป แล้วถามยืนยันก่อนทำ

### Review gate — 5 จุดที่คนต้องตรวจ (นอกจากนี้ทำต่อเนื่องได้เลย)

| Gate | ตรวจอะไร | อยู่ที่ | ส่งอะไรให้ตรวจ |
|---|---|---|---|
| **A** | moodboard + visual brand guideline | `create-moodboard` | **ส่งไฟล์รูป** + วาง palette/ฟอนต์/tone ที่ถอดจากรูปลงแชท + path `visual-guideline.md` |
| **B** | offer | `generate-salepage` Stop 1 | **วาง output**: hero offer + stack + anchor + guarantee + urgency (คำจริง) + path `offer-building.md` |
| **C** | ASCII wireframe + copywriting | Stop 3 (ตรวจคู่กัน) | **วาง output**: ผัง ASCII เต็มเป็น code block + copy ทุก section เป็นคำจริง + path ไฟล์ |
| **D** | landing page + CRO | Stop 5b | **preview URL ที่เปิดได้จริง** (เปิดเช็คเองก่อนส่ง) + score/top-5 จาก `cro-report.md` วางลงแชท |
| **E** | published บน Vercel | Stop 5c | **production URL ของหน้านั้น** (`[domain]/[slug]`) + **วาง JSON ที่ `/api/health` ตอบ** |

- **ทุก gate ต้องส่ง "ของที่กดดู/อ่านได้จริง" ให้คน ไม่ใช่คำบรรยายว่าทำอะไรไป** —
  ถ้าเป็นหน้าเว็บ/ภาพ → **link หรือไฟล์** · ถ้าเป็นเอกสาร → **วาง output จริงลงในแชท** (ผัง ASCII เต็ม,
  copy คำจริง, ตัวเลข) + **path ของไฟล์** · ถ้าเป็นผลรัน → **วาง output ของคำสั่ง**
  แล้ว**อธิบายกำกับทุกครั้ง**: ให้ดูอะไร · จุดไหนที่ตัดสินใจแทนไปแล้วและเพราะอะไร · อะไรยังใช้ไม่ได้
  → คนตรวจต้องตรวจได้โดยไม่ต้องเปิดรีโปเองและไม่ต้องถามกลับว่า "ดูที่ไหน"
- **link ต้องเปิดเองก่อนส่ง** — ยืนยันว่าไม่ใช่ 404/302 แล้วค่อยส่งให้คน
- **ห้ามผ่าน gate เองโดยไม่มีคนตอบว่าผ่าน** — "บอกให้ทำต่อ" ตอนก่อนหน้า ไม่นับเป็นการตรวจ gate ถัดไป
- **ผ่าน gate แล้ว commit + push ขึ้น GitHub ทันที** ก่อนเริ่มงานถัดไป (1 gate = 1 commit)
- **ไม่ต้องตรวจ**: setup keys · context/offers.md · setup-crm · page folder · design-guide · assets prep
  → แต่ **assets prep ยังต้องขออนุมัติค่าใช้จ่าย** ก่อนยิง KIE.ai ทุกครั้ง (กฎข้อ 4) — คนละเรื่องกับการตรวจงาน
- แก้ที่ gate ไหน กลับมาตรวจ gate เดิมซ้ำ ห้ามเดินหน้าด้วยของที่ยังไม่ผ่าน

### ขั้น 0 — เช็ค key ก่อนเริ่มเสมอ (อย่าไปเจอกำแพงกลางทาง)

**ก่อนเริ่มขั้น 1 ให้เช็คว่า env var ครบไหม แล้วบอกผู้ใช้ทันทีว่าขาดตัวไหน** — ขั้น 1–2 เป็นแค่การ
เขียน md ไม่ต้องใช้ key เลย แต่ขั้น 3 (HubSpot + Stripe), ขั้น 4 (KIE.ai) และ deploy (Vercel) ใช้ทั้งหมด
ถ้าไม่เตือนไว้ก่อน ผู้ใช้จะเสียเวลาไปกับ context แล้วมาค้างตอนขั้น 3 เพราะยังไม่ได้สมัครบัญชี

```bash
for v in HUBSPOT_PRIVATE_APP_TOKEN KIE_API_KEY PIXABAY_API_KEY SITE_URL; do
  [ -n "$(eval echo \$$v)" ] && echo "$v ✅" || echo "$v ❌ ยังว่าง"
done
```

**ห้าม echo ค่าออกมา** — เช็คแค่ว่ามีค่าหรือไม่มี

| ต้องมีก่อนขั้น | key | ขาดแล้วเป็นอะไร |
|---|---|---|
| 3 | `HUBSPOT_PRIVATE_APP_TOKEN` | สร้าง property/product ไม่ได้ (401/403) — ต้องมี scope ครบ |
| 4 | `KIE_API_KEY` | สร้าง `moodboard.png` และรูปบนหน้าเพจไม่ได้ |
| 5 | `PIXABAY_API_KEY` | ดึง stock photo ไม่ได้ |
| deploy | Vercel เชื่อม repo แล้ว | deploy ไม่ได้ |

### Connector — เช็คก่อนว่ามีตัวไหนใช้ได้ ก่อนจะไปขอ key จากผู้ใช้

คลาสนี้ต่อ connector 4 ตัว: **github · vercel · hubspot · stripe**
งานบางอย่างทำผ่าน connector ได้เลย ไม่ต้องให้ผู้ใช้หา key มาให้

| งาน | ใช้ connector ได้ | ต้องใช้ key |
|---|---|---|
| สร้าง Stripe product + price | ✅ Stripe connector | — |
| สร้าง Stripe webhook endpoint (คืน `whsec_` ตอนสร้างเท่านั้น) | ✅ Stripe connector | — |
| **สร้าง HubSpot custom property** | ❌ connector สร้างนิยาม property ไม่ได้ | ✅ `setup-hubspot.mjs` |
| **แก้ deal pipeline / stage** | ❌ connector แก้ pipeline ไม่ได้ | ✅ `setup-hubspot.mjs` (ดู `--plan` ก่อนรันจริงเสมอ) |
| สร้าง HubSpot product / contact / deal | ✅ `manage_crm_objects` | หรือใช้ script |
| ตรวจว่า lead เข้า HubSpot จริง (ขั้น 6) | ✅ `search_crm_objects` | — |
| อ่าน Vercel build log / runtime error | ✅ Vercel connector | — |
| **ตั้ง env vars ใน Vercel** | ❌ ไม่มี tool | ผู้ใช้กรอกเอง |

- **ห้ามยิง connector ที่เขียนข้อมูลโดยไม่ขอ confirm** — สรุปให้ผู้ใช้เห็นก่อนทุกครั้ง
- Stripe connector ต้องเป็น `livemode: false` เท่านั้น ถ้าเจอ live account ให้หยุดและแจ้งผู้ใช้
- ถ้าจะรัน `setup-stripe.mjs` แทน connector ต้องมี `STRIPE_SECRET_KEY` ใน env ก่อน

### key อยู่ที่ไหน — Environment variables ไม่ใช่ไฟล์ `.env`

คลาสนี้รันบน **Claude Code Cloud Session** ซึ่งไม่มีไฟล์ `.env` ให้เติม
ค่าทุกตัวอยู่ใน **Environment variables** ของ cloud environment (รูปแบบ `KEY=value` เหมือน `.env`)

- `scripts/lib/util.mjs` → `loadEnv()` อ่าน `.env` แบบ **ไม่ทับค่าที่มีอยู่** และข้ามไปถ้าไม่มีไฟล์
  → ใช้ได้ทั้งสองทางโดยไม่ต้องแก้โค้ด (cloud = env var · เครื่องตัวเอง = `.env`)
- **ค่าถูก copy ตอน session เริ่มครั้งเดียว** — ถ้าผู้ใช้เพิ่ม key กลางทางแล้ว script ยังบอกว่าไม่มีค่า
  ให้บอกให้ **เปิด session ใหม่** อย่าไปไล่หาสาเหตุที่ token
- Environment variables **ไม่ใช่ที่เก็บ secret** (ใครใช้ environment นั้นอ่านได้) → test key เท่านั้น
  และเตือนผู้ใช้ให้ revoke ทุกตัวหลังเรียนจบ
- **ห้ามขอ `HUBSPOT_PORTAL_ID` หรือ `STRIPE_PUBLISHABLE_KEY` จากผู้ใช้** — ถอดออกแล้ว
  portalId ดึงเองผ่าน `hubspotAccount()` · publishable key ไม่มีโค้ดไหนอ่าน
- ถ้า script error เรื่อง network ไม่ใช่เรื่อง token → environment ตั้ง **Network access** ไม่ถูก
  ต้องเป็น **Full** (หรือ Custom + `api.hubapi.com`, `api.kie.ai`, `pixabay.com` —
  ไม่ต้องใส่ `api.stripe.com` เพราะ traffic ของ connector ไม่ออกทาง network ของเซสชัน)

**ขั้น 3–5 ยังเดินต่อได้แม้ key ไม่ครบ** ถ้าจำเป็น: `catalog.json` สร้างได้เลย ปล่อย
`stripePriceId`/`hubspotProductId` เป็น `null` ไว้ แล้ว sync ทีหลัง (idempotent — เขียน id กลับให้เอง)
· หน้าเพจ build ได้ก่อน ปุ่มจ่ายเงินจะใช้ได้เมื่อ sync แล้ว
→ บอกผู้ใช้ให้ชัดว่าตอนนี้อะไรยังใช้ไม่ได้ อย่าปล่อยให้เข้าใจว่าเสร็จสมบูรณ์

### ค่าที่ต้องอยู่ใน Vercel ด้วย (Claude ตั้งให้ไม่ได้)

`api/` รันบน Vercel ไม่ใช่ในเซสชัน → connector ช่วยไม่ได้ **ผู้ใช้ต้องกรอกเอง 3 ตัว**
ที่ Vercel → Project Settings → Environment Variables (ติ๊ก Production):
`HUBSPOT_PRIVATE_APP_TOKEN` · `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET`

**`SITE_URL` ไม่ต้องใส่ใน Vercel** — โค้ด fallback ไป `VERCEL_PROJECT_PRODUCTION_URL`
ที่ Vercel ตั้งให้เอง (ดู `resolveSiteUrl()` ใน `api/health.js`)
ฝั่งเซสชันยังต้องมี เพราะ `test-lead.mjs` ไม่ได้รันบน Vercel

**ยืนยันด้วย `/api/health`** — `envReady: true` และ `catalogs` มี slug ของหน้านั้น

**ห้ามบอกผู้ใช้ว่าระบบพร้อมใช้งาน** ถ้ายังไม่ได้ยืนยันว่า 3 ตัวนี้อยู่ใน Vercel แล้ว —
lead จะเข้าไม่ได้และ deal จะไม่ปิด แม้ทุกอย่างในเซสชันจะดูสำเร็จ

## กฎสำคัญ (อ่านก่อนทำงานทุกครั้ง)

1. **อ่าน context ก่อนเขียนอะไรก็ตาม** — `context/company.md`, `clients.md`, `offers.md`, `voice.md`,
   `brand-identity/visual-guideline.md`
   **`context/` มาเป็นหัวข้อเปล่า** — ผู้เรียนกรอกแบรนด์ตัวเอง (กรอก md ธรรมดา
   หรือให้ Claude ช่วยสัมภาษณ์แล้วเขียนให้ก็ได้ ไม่มี skill สำหรับขั้นนี้)
   ถ้า `context/` ยังว่างและผู้ใช้อยากลองเร็วๆ ให้เสนอ `cp -r context_example/. context/`
   (แบรนด์ตัวอย่าง GLOW SOCIETY — ข้อมูลสมมติ) แล้ว **บอกผู้ใช้ให้ชัดว่ากำลังใช้ตัวอย่าง**
2. **ห้าม hardcode API key / token ในไฟล์ใดๆ** — อ่านจาก `process.env` เท่านั้น
   ห้าม echo ค่า key ออกมาใน terminal หรือใส่ใน commit message
3. **ห้าม commit key ลง git** (`.gitignore` กัน `.env` ไว้แล้ว) — ถ้าเห็นว่า key หลุดเข้า git
   ให้หยุดและแจ้งผู้ใช้ทันทีว่าต้อง **revoke ที่ dashboard** ไม่ใช่แค่ลบไฟล์ (ประวัติ git ยังเก็บค่าไว้)
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
10. **stage/pipeline ของ deal อ่านจาก `catalog.hubspot.stageOn*` เท่านั้น** — ห้าม hardcode
    `appointmentscheduled` / `closedwon` ในโค้ดหรือใน prompt ของ skill
    pipeline ถูกดัดให้ตรง funnel ตาม `hubspot.pipelineSetup` (ขั้น 3) และ id ไม่เหมือนกันทุกบัญชี
    · **แก้ pipeline เสร็จต้อง commit + push `catalog.json`** ไม่งั้น Vercel ยังใช้ id ชุดเก่า
    · การแก้ pipeline กระทบ deal ทุกใบใน portal → ให้ผู้ใช้ดู `--plan` แล้ว confirm ก่อนรันจริงทุกครั้ง

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
technical-setup.md  ← **ของกลางทุกหน้า**: บัญชี · key · connector · env · spec ให้ AI (ส่วน C)
scripts/            ← node scripts ทุกตัวรับ --dry-run
vercel.json         ← Vercel project อยู่ที่ root (buildCommand + includeFiles)
package.json        ← dependency: stripe
public_pages/
  [SALEPAGE_SLUG]/     ← template เปล่า: assets-plan.md + README.md
  [slug]/                 ← 1 โฟลเดอร์ = 1 หน้าเพจ · **ชื่อโฟลเดอร์ = URL**
                            salepage-brief.md ← **หน้านี้ขายอะไร ให้ใคร angle ไหน (ถามผู้ใช้ที่ Stop 0)**
                            catalog.json · offer-building.md · design-guide.md
                            wireframe-copywriting.md (ผัง+copy ไฟล์เดียว) · manifest.md · _progress.md
.env.example        ← ชื่อ key ทั้งหมด (คัดลอกเป็น .env)
```

## หลายหน้าใน Vercel deployment เดียว

```
public_pages/page_a/  →  [domain]/page_a
public_pages/page_b/  →  [domain]/page_b
```

- `scripts/build-site.mjs` ประกอบ `public_pages/*/public/` ทุกหน้าลง `public/` ที่ root
  (Vercel เรียกให้เองตอน build · `public/` เป็นผลผลิต gitignored ห้ามแก้มือ)
- **deploy ที่ root ของ repo เท่านั้น** — `vercel --prod` (ไม่ใช่ในโฟลเดอร์หน้า)
- `api/` + `lib/` อยู่ที่ root **แชร์ทุกหน้า** สร้างครั้งเดียวตอนทำหน้าแรก
- **แต่ละหน้ามี `salepage-brief.md` ของตัวเอง** — หน้าหนึ่งขายสินค้าตัวเดียว อีกหน้าให้เลือกหลายตัว
  หรือขายของเดียวกันคนละ angle ก็ได้ · brief คือสิ่งที่ทำให้หน้าต่างกัน ไม่ใช่ `context/` ที่ใช้ร่วมกัน
- ทุก request ต้องส่ง `page` (slug) ไปด้วย → server เลือก `catalog.json` ของหน้านั้น
- หน้าที่ 2 ขึ้นไป: ทำแค่ `catalog.json` + `public/` แล้ว deploy ใหม่ หน้าเดิมไม่หาย

## Conventions

- ทุก script รับ `--dry-run` → พิมพ์ payload ที่จะส่งโดยไม่เรียก API จริง (ใช้ตรวจก่อนรันจริงเสมอ)
- script หา project ใน `public_pages/` เองถ้ามีอันเดียว ถ้ามีหลายอันต้องใส่ `--project [ชื่อ]`
- `catalog.json` คือแหล่งความจริงเดียวของ offers/ราคา/sku — sku เดียวกันนี้ใช้ทั้ง HubSpot product,
  Stripe price และ GA4 `item_id` · ถ้าแก้ราคา ต้องรัน `setup-hubspot.mjs` + `setup-stripe.mjs` ใหม่
- ชื่อไฟล์รูป: `[section]-[NN].webp` (เช่น `hero-01.webp`) เก็บใน
  `public_pages/salepage_*/public/assets/` — ตัวเล็ก ไม่มีอักษรไทย ไม่มีเว้นวรรค
- GPT Image 2 เขียนภาษาไทยในรูปได้ถูกต้อง แต่บนหน้าเพจใช้ HTML text (แก้ง่าย SEO ได้)
  ใส่ตัวหนังสือในรูปเฉพาะ og-image และ moodboard
- Node 20+ (ใช้ `fetch` built-in) — dependency ของหน้าเพจมีแค่ `stripe`

## เวลาติดปัญหา

- **env var ว่างแต่ผู้ใช้ยืนยันว่าใส่แล้ว** → ค่าถูก copy ตอน session เริ่ม ให้เปิด session ใหม่
- **push แล้ว Vercel ไม่ deploy (เว็บยังเป็นของเก่า)** → เปิดหน้า deployment ดูว่าขึ้น
  **Deployment Blocked** ไหม — Hobby plan บล็อก commit ที่ author ไม่มีสิทธิ์ในโปรเจกต์
  ให้ commit ด้วย `Claude <noreply@anthropic.com>` (เหมือน commit เก่าในรีโปนี้) แล้ว push ใหม่
  · เช็คก่อน push: `git log -1 --format='%an <%ae>'`
- **error เรื่อง network / ต่อ API ไม่ได้** → environment ตั้ง Network access เป็น Trusted อยู่
  ต้องเปลี่ยนเป็น **Full** (API ของคลาสนี้ไม่อยู่ใน default allowlist)
- HubSpot 401 → key ผิด · 403 → scope ไม่ครบ
  (Service Key แก้ scope ทีหลังได้ · legacy private app ต้อง generate token ใหม่)
  → ดู `technical-setup.md` (root) ส่วน B1
- HubSpot 409 ตอนสร้าง contact → contact มีอยู่แล้ว → search แล้ว PATCH (ห้ามใช้ batch/upsert ด้วย email)
- **บอร์ด deal ยังเป็นสเตจ B2B / `dealstage` 400** → รัน `node scripts/setup-hubspot.mjs --plan`
  ดูสเตจจริง แล้วรันจริง + commit/push `catalog.json` · เทียบของที่ deploy อยู่ได้ที่ `/api/health`
  → `hubspotStages`
- Stripe webhook signature ไม่ผ่าน → ลืมปิด bodyParser ใน `api/stripe-webhook.js`
- Stripe webhook ไม่เข้า → ตั้ง endpoint เป็น URL production ใน Stripe dashboard แล้วหรือยัง
  (บน cloud session ใช้ `stripe listen` ไม่ได้ เพราะไม่มี localhost ให้ forward)
