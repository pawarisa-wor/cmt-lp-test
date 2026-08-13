# Technical Setup (ทั้งรีโป)

> **ไฟล์นี้อยู่ที่ root ของรีโป ไม่ได้อยู่ในโฟลเดอร์หน้าเพจ** — เพราะทุกอย่างในนี้เป็นของกลาง:
> บัญชี · key · connector · env vars · `api/` + `lib/` ที่แชร์ทุกหน้า · endpoint webhook ตัวเดียว
> ไม่มีอะไรที่เป็นของหน้าใดหน้าเดียว (เดิมไฟล์นี้ถูกคัดลอกไว้ในทุกโฟลเดอร์หน้า ซึ่งซ้ำกันแบบ
> byte-identical และทำให้ต้องแก้หลายที่เวลามีอะไรเปลี่ยน)
>
> ของที่เป็นรายหน้าจริงๆ อยู่ใน `public_pages/[slug]/`: **`salepage-brief.md`** · `catalog.json` · `offer-building.md` ·
> `design-guide.md` · `wireframe-copywriting.md` · `assets-plan.md` · `manifest.md` · `_progress.md`

ไฟล์นี้มี 3 ส่วน อ่านตามบทบาท:

| ส่วน | สำหรับใคร | เนื้อหา |
|---|---|---|
| **A** | ผู้เรียน | checklist เครื่องมือ + บัญชีที่ต้องมี |
| **B** | ผู้เรียน | วิธี setup ทีละคลิก + วิธีหา key แต่ละตัว |
| **C** | **AI (Claude)** | spec ที่ต้องอ่านก่อน config อะไรก็ตาม — object, property, event, endpoint |

> ⚠️ ห้ามใส่ค่า key ลงในไฟล์นี้ ทุกค่าอยู่ใน **Environment variables** ของ cloud environment
> (หรือ `.env` ที่ root ถ้าทำบนเครื่องตัวเอง — ซึ่ง `.gitignore` กันไว้แล้ว)

---

# A. Checklist เครื่องมือและบัญชี

## เครื่องมือบนเครื่อง — ไม่ต้องติดตั้งอะไรเลย

คลาสนี้รันบน **Claude Code Cloud Session** ซึ่งเป็นเครื่องบน cloud ไม่ใช่เครื่องของคุณ
เครื่องมือที่คลาสต้องใช้ติดตั้งมาให้แล้วทั้งหมด

| อะไร | ในเครื่อง cloud | ต้องลงบนเครื่องตัวเองไหม |
|---|---|---|
| Node.js | มี 20, 21, 22 (22 เป็น default) | ไม่ต้อง |
| npm / yarn / pnpm | มีให้แล้ว | ไม่ต้อง |
| git · jq · ripgrep | มีให้แล้ว | ไม่ต้อง |
| Claude Code | เป็นตัว session เอง | ไม่ต้อง |
| Vercel CLI | ไม่มี | ไม่ต้อง — ใช้ Git integration (B7) |
| Stripe CLI | ไม่มี | ไม่ต้อง — ตั้ง webhook ใน dashboard (B3) |

**Mac / Windows / iPad / Chromebook ทำได้เหมือนกันหมด** เพราะไม่มีการติดตั้งบนเครื่อง
สิ่งเดียวที่ต้องมีคือ **เบราว์เซอร์** และเข้า [claude.ai/code](https://claude.ai/code) ได้

> อยากทำบนเครื่องตัวเองแทน? ดู **B0** ข้างล่าง — ใช้ได้ แต่ต้องลงเองและมีข้อดีเดียวคือ
> ได้ `vercel dev` สำหรับทดสอบ `api/` ที่ localhost

## บัญชีที่ต้องมี

| บริการ | ใช้ทำอะไร | ฟรีไหม | ต้องมีก่อนเข้าคลาส |
|---|---|---|---|
| **Claude** | Claude Code Cloud Session | ❌ **ต้อง Pro / Max / Team / Enterprise** | ✅ **จำเป็น — แผนฟรีใช้ไม่ได้** |
| **GitHub** | เก็บ repo + ต่อ Vercel | ✅ | ✅ **จำเป็น** (ต้อง fork ไปเป็นของตัวเอง) |
| **HubSpot** | CRM เก็บ lead (Contact + Deal) | ✅ free tier พอ | ✅ **จำเป็น** |
| **Vercel** | hosting + serverless API | ✅ | ✅ **จำเป็น** |
| **Stripe** | รับชำระเงิน (ใช้ sandbox) | ✅ test mode | ✅ |
| **GA4** | track pageview / lead / purchase | ✅ | ⭕️ ข้ามได้ |
| **Meta Pixel** | track lead / purchase ฝั่ง Facebook | ✅ | ⭕️ ข้ามได้ |
| **KIE.ai** | generate รูปด้วย GPT Image 2 | 💰 จ่ายต่อรูป | ✅ **จำเป็น** — ผู้สอนแจก key ในคลาส |
| **Pixabay** | ดึง stock photo / icon ฟรี | ✅ | ✅ **จำเป็น** (สมัครฟรี 1 นาที) |

## Connector ที่ต้องต่อ (ทำครั้งเดียว — ลดงาน manual ไปเยอะ)

ที่ [claude.ai/code](https://claude.ai/code) → เมนู **Connectors** → กด connect ทีละตัว

| Connector | แทนงาน manual ได้ | ยังต้องทำเอง |
|---|---|---|
| **GitHub** | clone / commit / push / เปิด PR — credential ไม่เข้าไปอยู่ในเครื่อง cloud | fork repo ครั้งเดียว |
| **Stripe** | สร้าง product + price · สร้าง webhook endpoint แล้วคืน `whsec_` ให้ · **ไม่ต้องใส่ `STRIPE_SECRET_KEY` ในเซสชัน** · ไม่ต้องใส่ `api.stripe.com` ใน allowlist | ก๊อป `sk_test_` + `whsec_` ไปใส่ **Vercel** |
| **HubSpot** | ตรวจผลในแชท — ดู contact/deal ที่เพิ่งเข้า · เช็คว่า property ถูกสร้างจริง · เช็คสิทธิ์บัญชีล่วงหน้า | **ยังต้องสร้าง Service Key + เลือก scope เอง** (ดู B1) |
| **Vercel** | อ่าน build log / runtime log / runtime error → ให้ Claude วินิจฉัย deploy fail ได้เอง | **กรอก env vars เอง** — connector ไม่มีเครื่องมือตั้ง env |

- ตอนต่อ **Stripe** เลือก **sandbox / test account** เท่านั้น
- ตอนต่อ **Vercel** เลือก **All projects** ไม่งั้น Claude อ่าน build log ไม่ได้
- Connector traffic วิ่งผ่านเซิร์ฟเวอร์ Anthropic **ไม่ได้ออกทาง network ของเซสชัน**
  → ไม่ต้องใส่ host ของ connector ใน allowlist

## ตัวแปรที่ต้องเต็ม — ใส่ใน Environment variables ไม่ใช่ไฟล์ `.env`

ที่ [claude.ai/code](https://claude.ai/code) → **ไอคอนรูปเมฆ** → ช่อง **Environment variables**
→ ก๊อป [`.env.example`](.env.example) ทั้งก้อนมาวาง แล้วเติมค่าตามส่วน B

**ค่าเดียวกันต้องใส่ 2 ที่** — Claude Code environment (สำหรับ script ในคลาส)
และ Vercel Project Settings (สำหรับ `api/` ตอนมีคนเข้าเว็บ) แต่ **ไม่ใช่ชุดเดียวกันทั้งหมด**

**จำเป็น** — ขาดแล้วทำ workshop ไม่จบ

| ตัวแปร | Claude Code | Vercel | ได้จากส่วน |
|---|---|---|---|
| `HUBSPOT_PRIVATE_APP_TOKEN` | ✅ | ✅ | B1 |
| `STRIPE_SECRET_KEY` | — *(ใช้ connector)* | ✅ | B2 |
| `STRIPE_WEBHOOK_SECRET` | — *(ใช้ connector)* | ✅ | B3 |
| `KIE_API_KEY` | ✅ | — | B6 |
| `PIXABAY_API_KEY` | ✅ | — | B6 |

**ข้ามได้** — ไม่มีก็แค่ track ไม่ได้ หน้าเพจยังทำงานครบ

| ตัวแปร | Claude Code | Vercel | ได้จากส่วน |
|---|---|---|---|
| `SITE_URL` | ⭕️ | — *(Vercel ตั้งเองจาก `VERCEL_PROJECT_PRODUCTION_URL`)* | B7 |
| `PUBLIC_GA4_MEASUREMENT_ID` | ⭕️ | — | B4 |
| `PUBLIC_FB_PIXEL_ID` | ⭕️ | — | B5 |

**ถอดออกแล้ว ไม่ต้องกรอก**

| ตัวแปรเดิม | ทำไมไม่ต้องมี |
|---|---|
| `HUBSPOT_PORTAL_ID` | script ดึง `portalId` + `uiDomain` จาก HubSpot เองผ่าน `GET /account-info/v3/details` (ใช้ scope เดิม) — ได้ domain ที่ถูก region ด้วย |
| `STRIPE_PUBLISHABLE_KEY` | ไม่มีโค้ดที่ไหนในรีโปอ่านค่านี้ — หน้าเพจ redirect ไป Stripe Checkout ไม่ได้ฝัง Stripe.js |

> ถ้าจะรัน `setup-stripe.mjs` เองแทนการใช้ connector ต้องใส่ `STRIPE_SECRET_KEY`
> ใน Claude Code environment ด้วย

**สามข้อที่พลาดกันบ่อยสุด:**

1. **ค่าถูก copy ตอน session เริ่มครั้งเดียว** — ใส่ค่าใหม่แล้ว script ยังบอกว่าไม่มีค่า
   → ต้อง **เปิด session ใหม่** ไม่ใช่ไปไล่หาสาเหตุที่ token
2. **Network access ต้องเป็น Full** — default คือ Trusted ซึ่งยอมให้ต่อเฉพาะ domain ใน allowlist
   และ `api.hubapi.com` / `api.kie.ai` / `pixabay.com` **ไม่อยู่ในลิสต์นั้น**
   ถ้าถูกบล็อก script จะ error เรื่อง network ทำให้เข้าใจผิดว่า token พัง
   (อยากแน่นกว่านั้นให้ใช้ **Custom** แล้วใส่สาม domain นี้ + ติ๊ก "include default list"
   — **ไม่ต้องใส่ `api.stripe.com`** เพราะ traffic ของ connector ไม่ได้ออกทาง network ของเซสชัน)
3. **Environment variables ไม่ใช่ที่เก็บ secret** — ใครใช้ environment นั้นอ่านค่าได้
   → test key เท่านั้น, environment ส่วนตัวเท่านั้น, **revoke ทุกตัวหลังเรียนจบ**

```bash
# เช็คว่าครบไหมโดยไม่พิมพ์ค่าออกมา (ฝั่งเซสชันต้องมี 3 ตัวนี้)
for v in HUBSPOT_PRIVATE_APP_TOKEN KIE_API_KEY PIXABAY_API_KEY; do
  [ -n "$(eval echo \$$v)" ] && echo "$v ✅" || echo "$v ❌ ยังว่าง"
done
```

**ค่าของ Vercel เช็คด้วยคำสั่งนี้ไม่ได้** — คนละที่กัน ต้องเปิดดูที่
Vercel → Project Settings → Environment Variables ว่ามี 3 ตัวและติ๊ก Production แล้ว
(หรือเปิด `/api/health` ดู `envReady` — ง่ายกว่า)

---

# B. วิธี setup ทีละขั้น

## B0. (ทางเลือก) ทำบนเครื่องตัวเองแทน cloud session

ข้ามส่วนนี้ได้ถ้าใช้ cloud session ตามปกติ — เหตุผลเดียวที่คุ้มลงเองคือได้ `vercel dev`
สำหรับทดสอบ `api/` ที่ localhost

**macOS**

```bash
git --version                                    # ไม่มี → macOS เด้งถามให้ติดตั้ง กด Install
# Node 20+ : โหลด .pkg จาก nodejs.org/en/download แล้วกด Next รัวๆ
curl -fsSL https://claude.ai/install.sh | bash   # Claude Code CLI
npm i -g vercel                                  # ถ้าจะใช้ vercel dev
```

**Windows** (native ไม่ต้องใช้ WSL — WSL กินเวลาติดตั้งนานและพังได้หลายแบบ)

```powershell
# 1. Git for Windows : git-scm.com/downloads/win  → กด Next รัวๆ  (ลงก่อน Claude)
# 2. Node 20+        : โหลด .msi จาก nodejs.org/en/download
# 3. Claude Code — เปิด PowerShell (prompt ขึ้น PS C:\) แล้วรัน:
irm https://claude.ai/install.ps1 | iex
# 4. ปิดแล้วเปิด PowerShell ใหม่ ไม่งั้นคำสั่งใหม่จะยังไม่รู้จัก
npm i -g vercel
```

> Git for Windows สำคัญกว่าที่คิด — ถ้าไม่มี Claude Code จะใช้ PowerShell แทน Bash
> ทำให้คำสั่งในเอกสารนี้ (เขียนแบบ bash ทั้งหมด) ใช้ไม่ได้ตรงๆ
> · ไม่อยากแตะ terminal เลย → ใช้ Desktop app แทน CLI ได้ ([Mac](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect) · [Windows](https://claude.com/download))

แล้ว `cp .env.example .env` เติมค่าตาม B1–B7 (`loadEnv()` อ่าน `.env` แบบไม่ทับ env var ที่มีอยู่)

## B1. HubSpot — Service Key

> ⚠️ **มี HubSpot connector แล้วก็ยังต้องทำข้อนี้** — connector สร้าง **นิยาม custom property
> ไม่ได้** (tool เรื่อง property เป็นอ่านทั้งหมด: `get_properties`, `search_properties` ·
> `manage_crm_objects` สร้างได้แต่ *record* เช่น contact/deal)
> แต่ขั้น 3 ต้องสร้าง `[prefix]_location`, `[prefix]_service_interest`, `[prefix]_package`,
> `[prefix]_source_page` ผ่าน `POST /crm/v3/properties/deals` → ต้องรัน `setup-hubspot.mjs`
> ซึ่งใช้ token · และ `api/lead.js` บน Vercel ก็ต้องมี token ตอน runtime อยู่แล้ว
>
> connector มีประโยชน์ตอน **ตรวจผล** แทน — ขั้น 6 ยิง lead ทดสอบแล้วดู contact/deal
> ได้ในแชทเลย ไม่ต้องเปิด HubSpot

HubSpot มี key สามชนิดที่ชื่อคล้ายกันจนสับสน **เลือกผิดคือใช้ไม่ได้เลย**:

| ชนิด | ใช้ทำอะไร | ใช้กับคลาสนี้ |
|---|---|---|
| **Personal Access Key** | ยืนยันตัวตนให้คำสั่ง HubSpot CLI (`hs`) | ❌ ไม่ใช่ Bearer token ของ REST API |
| **Service Key** | เรียก REST API ระดับ account แบบ system-to-system | ✅ **ตัวที่ใช้** |
| **Legacy Private App** | ของเดิม ยังใช้ได้ แต่ HubSpot ให้ย้ายออก | ⚠️ ใช้แทนได้ถ้าบัญชียังไม่มี Service Keys |

คลาสนี้เรียก HubSpot แค่ REST ธรรมดา (สร้าง property / product / contact / deal)
**ไม่มี HubSpot webhook เลย** — webhook ทุกตัวในคลาสเป็นของ Stripe
ข้อจำกัดของ Service Key (ใช้กับ webhook และ UI extension ไม่ได้) จึงไม่กระทบเรา

1. เข้า [app.hubspot.com](https://app.hubspot.com) → ถ้ายังไม่มีบัญชี สมัคร **free account** ใหม่
   (สมัครใหม่สำหรับคลาส ไม่ใช้ portal ของบริษัทจริง — contact ทดสอบจะไปปนกับ lead จริง
   และคุณอาจไม่มีสิทธิ์สร้าง key ใน portal บริษัท)
2. เมนูซ้าย → **Development → Keys → Service Keys**
3. กด **Create service key** → ตั้งชื่อ `CMT6 Salepage`
4. ติ๊ก scope ให้ครบ (ค้นในช่อง search ได้):

   ```
   crm.objects.contacts.read
   crm.objects.contacts.write
   crm.objects.deals.read
   crm.objects.deals.write
   crm.schemas.deals.write        ← ต้องมี ไม่งั้นสร้าง custom property + แก้ pipeline stage ไม่ได้
   e-commerce                     ← ต้องมี ไม่งั้นสร้าง product ไม่ได้
   crm.objects.line_items.write   ← ติ๊กเผื่อไว้ ไม่เสียหาย
   crm.pipelines.deals.write      ← ถ้าบัญชีมีให้ติ๊ก (บางบัญชีต้องมีตัวนี้จึงแก้ stage ได้)
   ```

5. Copy key (ขึ้นต้นด้วย `pat-na1-…`)
   ⚠️ **เห็นได้ครั้งเดียว** ถ้าปิดหน้าไปแล้วต้องสร้างใหม่
6. ใส่ใน **Environment variables** (ชื่อตัวแปรยังเป็นชื่อเดิม ไม่ต้องแก้โค้ด
   เพราะ service key เป็น Bearer token prefix `pat-na1-…` เหมือนกัน):
   ```
   HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-xxxxxxxx
   ```

> **ไม่ต้องหา Hub ID มากรอกแล้ว** — script ดึง `portalId` และ `uiDomain` จาก
> `GET /account-info/v3/details` เอง (`hubspotAccount()` ใน `scripts/lib/util.mjs`)
> ใช้ scope เดิมที่มีอยู่ ไม่ต้องเพิ่ม · และได้ domain ที่ถูก region ด้วย
> (บัญชีบางที่เป็น `app-na2.hubspot.com` ไม่ใช่ `app.hubspot.com`)

**ข้อควรรู้:**

- ต้องเป็น **Super admin** หรือมีสิทธิ์ *Developer tools access* ถึงจะสร้างได้
  (คนที่สมัคร free portal ใหม่เองเป็น super admin อยู่แล้ว)
- Service Keys ยังเป็น **public beta** — ถ้าบัญชีไหนไม่เห็นเมนูนี้
  ให้สร้าง legacy private app ที่ **Settings → Integrations → Private Apps** แทน
  (scope ชุดเดียวกัน · ต่างกันแค่ private app แก้ scope แล้วต้อง generate token ใหม่ทั้งใบ
  ส่วน Service Key แก้ scope ทีหลังได้เลย)

**เช็คว่าใช้ได้:**
```bash
# ไม่พิมพ์ค่า key ออกมา — ดูแค่ HTTP code
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN" \
  'https://api.hubapi.com/crm/v3/objects/contacts?limit=1'
# 200 = ใช้ได้ · 401 = key ผิด · 403 = scope ไม่ครบ · 000 = network ถูกบล็อก (ดู A)

node scripts/setup-hubspot.mjs --dry-run    # ดู payload ที่จะส่ง
```

## B2. Stripe — Secret key

Stripe มี 3 ค่าที่ชื่อคล้ายกันจนสับสน **ทั้งสามเป็นค่าต่างกันจริง มาจากคนละหน้าใน dashboard**:

| ตัวแปร | รูปแบบ | ได้จากไหน | รีโปนี้ใช้ไหม |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | Developers → **API keys** | ✅ **เอาในข้อนี้** |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Developers → **Webhooks** | ✅ เอาในข้อ **B3** (ต้อง deploy ก่อน) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | Developers → API keys | ❌ **ไม่ได้ใช้ ข้ามได้** |

**ต่อ connector ก่อน แล้วค่อยเอา key มาเฉพาะสำหรับ Vercel**

การสร้าง product + price ทำผ่าน **Stripe connector** ได้เลย ไม่ต้องมี key ในเซสชัน —
แต่ `api/checkout.js` ที่รันบน Vercel เรียก connector ไม่ได้ จึงยังต้องก๊อป `sk_test_` ไปใส่ที่นั่น

1. ที่ [claude.ai/code](https://claude.ai/code) → **Connectors → Stripe** → connect
   → เลือก **sandbox / test account**
2. ยืนยันว่าต่อถูกบัญชี: บอก Claude ว่า *"เช็คว่า Stripe connector ต่ออยู่บัญชีไหน"*
   → ต้องได้ `livemode: false`
3. เข้า [dashboard.stripe.com](https://dashboard.stripe.com) → มุมขวาบนสลับเป็น **Test mode**
   ⚠️ **ห้ามใช้ live mode ในคลาส**
4. เมนู **Developers → API keys** → Copy **Secret key** (`sk_test_…`) กด Reveal ก่อน
5. เอาไปใส่ **Vercel → Project Settings → Environment Variables** เท่านั้น
   (ไม่ต้องใส่ใน Claude Code environment ถ้าใช้ connector)

**ถ้า secret key ไม่ขึ้นต้นด้วย `sk_test_` ให้หยุด** — นั่นคือ key จริง จะเก็บเงินจริง

> **ไม่ต้องเอา Publishable key** — ไม่มีโค้ดที่ไหนในรีโปอ่าน `STRIPE_PUBLISHABLE_KEY` เลย
> เพราะหน้าเพจใช้วิธี redirect ไป Stripe Checkout ไม่ได้ฝัง Stripe.js
> จะต้องใช้ก็ตอนที่เปลี่ยนไปทำฟอร์มบัตรเองในหน้าเพจ

ตอนก๊อปให้ดูด้วยตาว่าขึ้นต้น `sk_test_` — key นี้ไปอยู่ที่ Vercel ไม่ได้อยู่ในเซสชัน
จึงเช็คด้วยคำสั่งใน session ไม่ได้ (ยกเว้นเลือกทาง B ใน `setup-crm` ที่ใส่ในเซสชันด้วย):

```bash
# ใช้ได้เฉพาะถ้าใส่ STRIPE_SECRET_KEY ในเซสชันด้วย
case "$STRIPE_SECRET_KEY" in
  sk_test_*) echo 'test key ✅' ;;
  "")        echo 'ไม่ได้ตั้งค่าในเซสชัน (ปกติ ถ้าใช้ connector)' ;;
  *)         echo 'ไม่ใช่ test key — หยุด ❌' ;;
esac
```

## B3. Stripe — Webhook

**ทางหลัก — ให้ Stripe connector สร้าง endpoint แล้วคืน `whsec_` มาให้:**

1. **deploy ให้เสร็จก่อน** (B7) — ต้องมี URL production จริงจึงจะตั้ง endpoint ได้
2. บอก Claude ว่า *"สร้าง Stripe webhook endpoint ชี้ไป `[URL]/api/stripe-webhook`
   รับ event `checkout.session.completed`"*
3. Claude เรียก API สร้างให้ แล้วอ่าน **signing secret** (`whsec_…`) กลับมาให้
4. เอาไปใส่ **Vercel → Project Settings → Environment Variables** → `STRIPE_WEBHOOK_SECRET`
5. Vercel → **Redeploy** เพื่อให้ function อ่านค่าใหม่

> ⚠️ **`whsec_` ดูย้อนหลังไม่ได้** — เอกสาร Stripe ระบุว่า signing secret ถูกคืนมา
> **ตอนสร้าง endpoint เท่านั้น** เรียกดู endpoint ทีหลังจะไม่มีค่านี้ให้
> ถ้าทำหายต้องลบ endpoint แล้วสร้างใหม่ (หรือกด roll secret ใน dashboard)
>
> endpoint เดียวใช้ได้ทุกหน้า — `metadata.page` บอก webhook ว่ามาจากหน้าไหน

**ทางเลือก — คลิกใน dashboard เอง:**

Dashboard → **Developers → Webhooks → Add endpoint** → URL
`https://[โปรเจกต์ของคุณ].vercel.app/api/stripe-webhook` → Events เลือก
**`checkout.session.completed`** ตัวเดียวพอ → Add → copy Signing secret

**ทางเลือก — ตอน dev บนเครื่องตัวเอง (ต้องมี Stripe CLI):**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
จะได้ signing secret `whsec_…` ในบรรทัดแรก → ใส่ `STRIPE_WEBHOOK_SECRET` ใน `.env`
(ต้องเปิด terminal นี้ค้างไว้ตลอดที่ทดสอบ)
**บน cloud session ใช้วิธีนี้ไม่ได้** เพราะไม่มี localhost ให้ forward เข้า

## B4. GA4 — Measurement ID

1. [analytics.google.com](https://analytics.google.com) → **Admin** (เฟือง ล่างซ้าย)
2. **Create → Property** → ตั้งชื่อ → เลือกเขตเวลา Bangkok, สกุลเงิน THB
3. **Data Streams → Add stream → Web** → ใส่ URL เว็บ (ใส่ URL vercel ทีหลังได้)
4. Copy **Measurement ID** (`G-XXXXXXXXXX`) → `PUBLIC_GA4_MEASUREMENT_ID`
5. ใส่ค่าเดียวกันใน `public/config.js`

### "GA4 ให้ Google tag (gtag.js) มา ต้องใส่ตัวไหน" — คำถามที่ถามกันทุกรอบ

ตอนสมัคร GA4 เสร็จ Google จะโชว์ snippet ก้อนนี้ **นั่นคือ GA4 อยู่แล้ว ไม่ใช่ของคนละอย่าง**:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**เอาแค่ `G-XXXXXXXXXX` มาใส่ `PUBLIC_GA4_MEASUREMENT_ID`** — ไม่ต้องก๊อป snippet ทั้งก้อน
เพราะหน้าเพจมี snippet เดียวกันนี้อยู่แล้ว ต่างกันแค่ดึง ID จาก `public/config.js` (ดู C3)

| ID | คืออะไร | ใช้กับรีโปนี้ |
|---|---|---|
| `G-XXXXXXXXXX` | **GA4 Measurement ID** — ตัวที่ต้องใช้ | ✅ |
| `GT-XXXXXXX` | Google Tag ID (ตัวใหม่ ยิงได้หลาย destination) | ✅ ใช้แทนกันได้ `gtag()` รับทั้งสองแบบ ไม่ต้องแก้โค้ด |
| `GTM-XXXXXXX` | Google **Tag Manager** container | ❌ คนละ snippet (`gtm.js`) คนละ API (`dataLayer.push({event})`) — ต้องรื้อ `gtag('event', …)` ทุกตัวใน C3 แล้วไปตั้ง tag ในหน้า GTM อีกชั้น **ไม่คุ้มในคลาส 3 ชั่วโมง** |

## B5. Meta Pixel — Pixel ID

1. [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. **Connect data source → Web → Meta Pixel** → ตั้งชื่อ
3. Copy **Pixel ID** (ตัวเลข ~15 หลัก) → `PUBLIC_FB_PIXEL_ID`
4. ใส่ค่าเดียวกันใน `public/config.js`
5. ติดตั้ง Chrome extension **Meta Pixel Helper** ไว้ตรวจว่า event ยิงจริง

## B6. KIE.ai + Pixabay (จำเป็น — ใช้สร้างรูปบนหน้าเพจ)

- **KIE.ai**: ผู้สอนแจก key ในคลาส → `KIE_API_KEY`
  (ถ้าใช้ของตัวเอง: สมัคร [kie.ai](https://kie.ai) → API Keys → เติมเครดิต)
  💰 **มีค่าใช้จ่ายต่อรูป** — รัน `--dry-run` ก่อนเสมอ
- **Pixabay**: สมัครฟรีที่ [pixabay.com/api/docs](https://pixabay.com/api/docs/) → copy API key
  → `PIXABAY_API_KEY`

## B7. Vercel — deploy (หลายหน้า 1 deployment)

**สำคัญ: deploy จาก root ของ repo ไม่ใช่จากในโฟลเดอร์หน้า**

หนึ่ง Vercel project เสิร์ฟได้หลายหน้า โดย **ชื่อโฟลเดอร์ใน `public_pages/` = URL ของหน้านั้น**

```
public_pages/page_a/   →   https://[project].vercel.app/page_a
public_pages/page_b/   →   https://[project].vercel.app/page_b
```

`vercel.json` ที่ root ตั้ง `buildCommand: node scripts/build-site.mjs` ไว้แล้ว —
ตอน build Vercel จะประกอบ `public_pages/*/public/` ทุกหน้าลง `public/` เอง

### ทางหลัก — Git integration (ไม่ต้องลง CLI)

`vercel login` ต้องเปิดเบราว์เซอร์ ซึ่งทำใน cloud session ไม่ได้ → ใช้ Git integration แทน
ต่อ repo ครั้งเดียว หลังจากนั้น **push เข้า branch หลัก = deploy เอง**

> **Vercel connector ตั้ง env vars ให้ไม่ได้** — เครื่องมือที่มีให้เขียนคือ deploy,
> deployment protection, domain, billing เท่านั้น ต้องกรอก env ใน dashboard เอง
> · แต่ connector **อ่าน build log / runtime log / runtime error ได้** →
> deploy พังแล้วบอก Claude ได้เลย ไม่ต้องส่ง screenshot
> (ตอน authorize ต้องเลือก **All projects** ไม่งั้น Claude มองไม่เห็นโปรเจกต์)

1. สมัคร/ล็อกอิน [vercel.com](https://vercel.com/signup) — ใช้ GitHub ง่ายสุด
2. ไปที่ [vercel.com/new](https://vercel.com/new) → **Import** repo ของคุณ
3. ปล่อย **Root Directory** เป็นค่า default (repo root) — **อย่าชี้เข้า `public_pages` หรือโฟลเดอร์หน้าเพจ**
   ถ้าตั้งผิด build จะ fail ทันทีด้วย `Cannot find module '/vercel/path0/public_pages/scripts/build-site.mjs'`
   เพราะ `scripts/`, `api/` และ output `public/` อยู่ที่ **root** ทั้งหมด
4. กด **Deploy** — ไม่ต้องตั้ง build setting เอง `vercel.json` จัดการให้แล้ว
5. ใส่ env ที่ prod ต้องใช้ที่ **Project Settings → Environment Variables**
   (ทำครั้งเดียว ทุกหน้าใช้ร่วมกัน) — **แค่ 3 ตัว ไม่ใช่ทั้ง 10 ตัว** (ดูตารางข้างล่าง)
6. **ยืนยันด้วย `/api/health`** → ต้องได้ `envReady: true` · `catalogs` มี slug ของหน้าเรา ·
   `siteUrlFrom: "VERCEL_PROJECT_PRODUCTION_URL (auto)"` (ถ้าขึ้น `SITE_URL` แปลว่ามีคนใส่ค่าไว้
   ใน Vercel ซึ่งไม่ต้องใส่ — ลบออกได้ ดูข้างล่าง)

### Preview ก่อน production — เพราะ cloud session ไม่มี localhost ให้ดู

`vercel dev` ใช้ได้เฉพาะบนเครื่องตัวเอง (B0) บน cloud session จึง **ดูหน้าเพจก่อน deploy ไม่ได้เลย**
วิธีที่ใช้ในคลาสคือให้ Vercel สร้าง **preview deployment** จาก branch:

```
push เข้า branch  →  Vercel ออก preview URL  →  ตรวจ + ทำ CRO บนหน้าจริง  →  merge  →  production
                                                (gate D)                            (gate E)
```

- preview ใช้ env ชุดเดียวกับ production ถ้าติ๊ก scope ไว้ทั้งคู่ (ค่า default ของ Vercel
  คือติ๊กครบทุก environment) — ถ้าติ๊กแค่ Production ปุ่มจ่ายเงินบน preview จะพัง
- **Stripe webhook endpoint ชี้ไป production URL เท่านั้น** (endpoint เดียว) → จ่ายเงินทดสอบ
  บน preview จะไม่มี webhook มาปิด deal ให้ **ทดสอบ flow จ่ายเงินเต็มวงจรต้องทำบน production**
  ส่วน preview ใช้ตรวจหน้าตา/copy/CRO/ฟอร์ม lead ได้ครบ

### Vercel ใส่แค่ 3 ตัว (ต่างจาก Claude Code environment ที่ใส่ครบ)

Claude Code environment รัน **setup script** (ตั้งค่า CRM, gen รูป, ทดสอบ lead) จึงต้องใช้ทุกตัว
ส่วน Vercel รันแค่ **API ตอน runtime** จึงใช้น้อยกว่ามาก

| ตัวแปร | ใครใช้บน Vercel |
|---|---|
| `HUBSPOT_PRIVATE_APP_TOKEN` | `api/lead.js` (สร้าง contact + deal) · `api/stripe-webhook.js` (ปิด deal) |
| `STRIPE_SECRET_KEY` | `api/checkout.js` · `api/stripe-webhook.js` |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook.js` (verify ลายเซ็น) |

**`SITE_URL` ไม่ต้องใส่ใน Vercel** — Vercel ตั้ง `VERCEL_PROJECT_PRODUCTION_URL` ให้เอง
(production domain · ใช้ custom domain ถ้ามี · ตั้งให้ทั้ง build และ runtime)
โค้ดใช้เป็น fallback อยู่แล้ว — ดู `resolveSiteUrl()` ในส่วน C2
ใส่ `SITE_URL` เองเฉพาะเมื่อต้องการ override (เช่นชี้ไป domain อื่น)

> ต้องเปิด **Enable access to System Environment Variables** ใน Project Settings →
> Environment Variables (ค่า default เปิดอยู่) ถ้าปิดไว้ fallback จะใช้ไม่ได้

**ไม่ต้องใส่ใน Vercel:**

| ตัวแปร | เพราะ |
|---|---|
| `KIE_API_KEY` · `PIXABAY_API_KEY` | ใช้ตอนสร้างรูปใน session — รูปที่ได้ commit ลง repo ไปแล้ว |
| `PUBLIC_GA4_MEASUREMENT_ID` · `PUBLIC_FB_PIXEL_ID` | อยู่ใน `public/config.js` ที่ commit แล้ว ไม่ได้อ่านจาก env ตอน runtime (จึงมี prefix `PUBLIC_` — เป็นค่าที่เปิดเผยได้อยู่แล้ว) |

**กับดัก 2 ข้อ:**

1. **Vercel แยก env ตาม Production / Preview / Development** — ต้องติ๊ก **Production**
   อย่างน้อย ไม่งั้น deploy จริงอ่านค่าไม่เจอ
2. **ถ้าใส่ `SITE_URL` เอง ต้องเป็น URL production** ไม่ใช่ `localhost:3000` —
   ค่าที่ตั้งเองชนะ fallback เสมอ ใส่ผิดแล้วปุ่มจ่ายเงินจะพาลูกค้าไป localhost
   (ไม่ใส่เลยปลอดภัยกว่า ปล่อยให้ Vercel เติมให้)

### ลำดับที่ทำให้ไม่ต้องกลับมาแก้ env สองรอบ

`STRIPE_WEBHOOK_SECRET` ต้องรอ URL จริง จึงตั้ง endpoint ก่อน deploy ไม่ได้ —
แต่ไม่ต้องใส่ env แบบเว้นช่องไว้แล้วกลับมาเติม ให้เรียงแบบนี้:

1. **Import + Deploy** (ข้อนี้) — ยังไม่ต้องใส่ env เลย build ผ่านได้เพราะมี `api/health.js`
   → ได้ URL production มา
2. **Stripe** — ให้ connector สร้าง product + price + webhook endpoint (B2, B3)
   → ได้ `whsec_` ครบในรอบเดียว
3. **ใส่ env 3 ตัวใน Vercel ทีเดียว** แล้ว Redeploy → เปิด `/api/health` เช็คว่า `envReady: true`

แล้วเอา URL ที่ได้ไปใส่ GA4 data stream ด้วย (B4)

### เช็คว่า deployment พร้อมจริงไหม — เปิด `/api/health`

```
https://[โปรเจกต์ของคุณ].vercel.app/api/health
```

| ฟิลด์ | ต้องได้อะไร | ถ้าไม่ตรงแปลว่า |
|---|---|---|
| `catalogs` | มี slug ของหน้าคุณ เช่น `["glow"]` | ว่าง = `includeFiles` ไม่ทำงาน หรือยังไม่มี `catalog.json` |
| `envReady` | `true` | `false` = ยังขาด env บางตัว ดู `env` ว่าตัวไหนเป็น `false` |
| `siteUrl` | URL production จริง | ยังเป็น `localhost:3000` = ตั้ง `SITE_URL` ทับไว้ผิด |
| `siteUrlFrom` | `VERCEL_PROJECT_PRODUCTION_URL (auto)` หรือ `SITE_URL` | `ไม่พบทั้งสองตัว` = System Env Vars ถูกปิด |
| `hubspotStages[slug]` | `stageOnLead`/`stageOnPaid` ตรงกับ `catalog.json` ในรีโป · `ready: true` | ไม่ตรง = **ยังไม่ได้ deploy catalog ตัวใหม่** (ลืม commit/push หลังรัน `setup-hubspot.mjs`) |

`env` คืนแค่ `true`/`false` **ไม่คืนค่า key ออกมา**

> ⚠️ endpoint นี้เป็นเครื่องมือ debug ของ workshop และเปิดให้ทุกคนเรียกได้
> ถ้าเอาไปใช้จริงให้ลบ `api/health.js` (ตอนนั้น `api/` มีไฟล์อื่นแล้ว build ไม่พัง)
> หรือเปิด Vercel Deployment Protection

**เพิ่มหน้าที่ 2 ทีหลัง:** สร้าง `public_pages/[slug ใหม่]/` แล้ว push —
หน้าเดิมไม่หาย ไม่ต้องตั้ง env ใหม่ ไม่ต้องตั้ง webhook ใหม่

```bash
node scripts/build-site.mjs --dry-run   # เช็คก่อน push ว่าเห็นหน้าที่ต้องการครบ
```

### ทางเลือก — CLI (เฉพาะบนเครื่องตัวเอง)

เหตุผลเดียวที่ยังต้องมี CLI คือ **`vercel dev`** ซึ่งรัน `api/` ที่ localhost ได้ —
Git integration แทนไม่ได้ และบน cloud session ใช้ไม่ได้

```bash
cd [root ของ repo]             # ไม่ใช่ public_pages/...
npm install
npm i -g vercel
vercel login
vercel link                    # ทำครั้งเดียว ใช้ได้กับทุกหน้า
vercel dev                     # http://localhost:3000/[slug]
vercel --prod                  # deploy แบบไม่ต้อง commit
```

บัตรทดสอบ: `4242 4242 4242 4242` · วันหมดอายุอนาคตอะไรก็ได้ · CVC `123` · zip อะไรก็ได้

---

# C. Spec สำหรับ AI — อ่านส่วนนี้ก่อน config

> Claude: อ่านส่วนนี้ก่อนเขียน/รันอะไรที่แตะ HubSpot, Stripe, GA4, Pixel หรือ KIE.ai
> ทุกค่าที่เป็น "ความจริง" เรื่อง offer/ราคา อยู่ใน `catalog.json` ไม่ใช่ในไฟล์นี้

## C0. Multi-page — หลายหน้าใน deployment เดียว

- **ชื่อโฟลเดอร์ใน `public_pages/` = URL slug ของหน้านั้น** (`public_pages/page_a` → `/page_a`)
- แต่ละหน้ามี `catalog.json` ของตัวเอง → ราคาและ sku แยกกันได้
- `api/` + `lib/` อยู่ที่ **root ของ repo** และ **แชร์ทุกหน้า** สร้างครั้งเดียว
- ทุก request จากหน้าเพจต้องส่ง **`page`** (slug) ไปด้วย → server ใช้เลือก catalog ที่ถูก
  `lib/pages.js` → `loadCatalogFor(page)` (validate slug ด้วย regex กัน path traversal)
- `vercel.json` ต้องมี `"includeFiles": "public_pages/**/catalog.json"` ไม่งั้น serverless function
  อ่าน catalog ไม่เจอตอน production
- ทุกหน้าที่อยู่ใน **HubSpot portal เดียวกันควรใช้ `propertyPrefix` เดียวกัน** — ไม่งั้นจะได้ custom
  property ชุดซ้ำๆ ต่างกันแค่ prefix · ใช้ `[prefix]_source_page` แยกว่า lead มาจากหน้าไหน
- Stripe: product/price แยกตาม sku ของแต่ละหน้าได้ปกติ (metadata.sku กันสับสน)

## C1. HubSpot

**Base:** `https://api.hubapi.com` · **Auth:** `Authorization: Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`

### Deal pipeline + stage — ต้องดัดให้ตรง funnel ก่อน

pipeline default ของ HubSpot เป็นสเตจแบบ **B2B sales** (Appointment Scheduled · Qualified To Buy ·
Presentation Scheduled · Decision Maker Bought-In · Contract Sent) ซึ่ง **ไม่ตรงกับ salepage** ที่
คนกรอกฟอร์มแล้วจ่ายเงินเองทันที — บอร์ด deal จะมีคอลัมน์ที่ไม่มีใครใช้ และรายงานอ่านไม่ได้ว่า
หลุดตรงไหน

สเปกของ funnel อยู่ใน `catalog.json` → `hubspot.pipelineSetup` แล้ว `setup-hubspot.mjs`
ทำให้ HubSpot ตรงตามนั้น (`GET/POST/PATCH /crm/v3/pipelines/deals`)

```json
"hubspot": {
  "pipeline": "default",              // ← script เขียน id จริงกลับให้
  "stageOnLead": "appointmentscheduled",
  "stageOnCheckout": null,
  "stageOnPaid": "closedwon",
  "stageIds": {},                     // ← key → stage id (script เขียนกลับ)
  "dealToContactAssociationTypeId": 3,
  "pipelineSetup": {
    "mode": "adopt",                  // adopt = ดัดสเตจของ pipeline เดิม · create = สร้าง pipeline ใหม่
    "label": "[แบรนด์] — Salepage",   // ใช้เฉพาะ mode: "create"
    "stages": [
      { "key": "lead",     "label": "ลงทะเบียนจากหน้าเพจ",   "probability": 0.2, "use": "onLead" },
      { "key": "checkout", "label": "เข้าหน้าชำระเงิน",      "probability": 0.5, "use": "onCheckout" },
      { "key": "followup", "label": "ติดตามอยู่ (ยังไม่จ่าย)", "probability": 0.3 },
      { "key": "paid",     "label": "ชำระเงินแล้ว",          "closed": "won",    "use": "onPaid" },
      { "key": "lost",     "label": "ไม่ไปต่อ",              "closed": "lost" }
    ]
  }
}
```

| ฟิลด์ | ความหมาย |
|---|---|
| `key` | ชื่อภายใน (a–z 0–9 _) — ใช้ผูก stage id ใน `stageIds` **ห้ามเปลี่ยนทีหลัง** ไม่งั้นจับคู่สเตจเดิมไม่ได้ |
| `label` | ชื่อที่โชว์บนบอร์ด HubSpot (ไทยได้) |
| `probability` | 0.01–0.99 สำหรับสเตจที่ยังเปิด — HubSpot บังคับให้ deal pipeline มีค่านี้ |
| `closed` | `won` (probability 1.0) หรือ `lost` (0.0) |
| `use` | บทบาทที่ `api/` ใช้: `onLead` (บังคับ) · `onPaid` (บังคับ + ต้อง `closed: "won"`) · `onCheckout` (ไม่บังคับ) |
| ลำดับใน array | = ลำดับคอลัมน์บนบอร์ด (ซ้าย → ขวา) |

**mode ไหนใช้เมื่อไหร่**

- `adopt` (default) — ดัดสเตจของ pipeline ที่ `hubspot.pipeline` ชี้อยู่ (ปกติคือ `default`)
  **ใช้กับบัญชี free ได้** เพราะไม่ได้สร้าง pipeline เพิ่ม
- `create` — สร้าง pipeline ใหม่แยกจากของเดิม **ต้องเป็น Starter ขึ้นไป** (free มี deal pipeline ได้ 1 อัน)
  ถ้าบัญชีสร้างไม่ได้ script จะบอกให้เปลี่ยนกลับเป็น `adopt`

**สิ่งที่ทำให้ระบบ submit ไม่พังตอนสเตจเปลี่ยน** (สำคัญที่สุดในหัวข้อนี้)

1. `api/lead.js` / `api/stripe-webhook.js` อ่าน stage id จาก `catalog.hubspot.stageOn*` **เท่านั้น**
   ไม่มี id ไหน hardcode ในโค้ด
2. **rename ไม่เปลี่ยน id** — script จับคู่สเตจที่ต้องการกับสเตจเดิมแล้ว PATCH แค่ `label`
   (`appointmentscheduled` → "ลงทะเบียนจากหน้าเพจ") ดังนั้น deployment ที่ยังไม่ได้ deploy ใหม่
   ก็ยังยิง lead เข้าสเตจที่ถูก
3. script เขียน `stageIds` (key → id) กลับเข้า catalog → รันซ้ำจับคู่สเตจเดิมได้เสมอ
   แม้จะไปเปลี่ยนชื่อสเตจใน HubSpot ด้วยมือ
4. **ไม่ลบสเตจที่ยังมี deal ค้าง หรือที่ catalog ยังอ้างถึง** — ย้ายไปท้ายบอร์ดแล้วเตือนแทน
5. หลังรันจริง **ต้อง commit + push `catalog.json`** เพราะ Vercel อ่านไฟล์นี้ตอน runtime
   (ยังไม่ deploy = ใช้ id ชุดเก่า ซึ่งยังถูกอยู่ตามข้อ 2)

```bash
node scripts/setup-hubspot.mjs --dry-run   # เห็น funnel ที่จะได้ (ไม่เรียก API)
node scripts/setup-hubspot.mjs --plan      # อ่านของจริงมาเทียบ: สเตจไหน rename / สร้าง / ลบ (read-only)
node scripts/setup-hubspot.mjs             # ทำจริง
```

**ห้ามรันจริงก่อนให้ผู้ใช้ดู `--plan`** — การแก้ pipeline กระทบ deal ทุกใบในบัญชีนั้น

### Custom deal properties ที่ต้องสร้าง

`POST /crm/v3/properties/deals` (ต้องมี scope `crm.schemas.deals.write`)

`[prefix]` = `propertyPrefix` ใน `catalog.json` (ตัวเล็ก a–z เช่น `glow`) — ต้องตรงกับที่ `api/lead.js` ส่ง

| name | label | type | fieldType | options |
|---|---|---|---|---|
| `[prefix]_location` | สาขา/พื้นที่ที่สนใจ | `enumeration` | `select` | จาก `locations[]` ใน catalog |
| `[prefix]_service_interest` | บริการที่สนใจ | `enumeration` | `select` | จาก `services[]` ใน catalog |
| `[prefix]_package` | แพ็กเกจ (SKU) | `string` | `text` | — |
| `[prefix]_source_page` | หน้าที่มาจาก | `string` | `text` | — |

```json
{
  "name": "[prefix]_location",
  "label": "สาขาที่สนใจ",
  "type": "enumeration",
  "fieldType": "select",
  "groupName": "dealinformation",
  "options": [
    { "label": "ทองหล่อ", "value": "thonglor", "displayOrder": 0 },
    { "label": "สาทร",    "value": "sathorn",  "displayOrder": 1 }
  ]
}
```

ถ้า property มีอยู่แล้ว API ตอบ **409** → ถือว่าสำเร็จ (idempotent) ไม่ต้อง retry

### Products

`POST /crm/v3/objects/products` (scope `e-commerce`) — 1 record ต่อ 1 offer ใน `catalog.json`

```json
{ "properties": { "name": "[ชื่อแพ็กเกจ]", "price": "[ราคา]", "hs_sku": "[SKU]",
                  "description": "[คำอธิบายสั้น]" } }
```

เขียน `id` ที่ได้กลับเข้า `catalog.json` → `offers[].hubspotProductId`

### Contact — สร้างหรืออัปเดต (ใช้ใน `api/lead.js`)

1. `POST /crm/v3/objects/contacts`
   ```json
   { "properties": { "email": "...", "firstname": "...", "phone": "..." } }
   ```
2. ถ้าได้ **409 Conflict** = contact มีอยู่แล้ว → ค้นหา id:
   ```
   POST /crm/v3/objects/contacts/search
   { "filterGroups": [{ "filters": [
       { "propertyName": "email", "operator": "EQ", "value": "..." } ] }],
     "properties": ["email"], "limit": 1 }
   ```
   แล้ว `PATCH /crm/v3/objects/contacts/{id}` เพื่ออัปเดต

> ❗ **ห้ามใช้** `/crm/v3/objects/contacts/batch/upsert` กับ `idProperty: "email"` —
> HubSpot ไม่ถือว่า email เป็น unique id เสมอไป จะได้ 400/409 แบบเดาไม่ได้
> ใช้ create → 409 → search → patch เท่านั้น

### Deal — สร้างพร้อม associate contact

`POST /crm/v3/objects/deals`

```json
{
  "properties": {
    "dealname": "[แบรนด์] — [ชื่อแพ็กเกจ] — [ชื่อลูกค้า]",
    "pipeline": "[catalog.hubspot.pipeline]",
    "dealstage": "[catalog.hubspot.stageOnLead]",
    "amount": "390",
    "[prefix]_location": "[location id]",
    "[prefix]_service_interest": "[service id]",
    "[prefix]_package": "[SKU]",
    "[prefix]_source_page": "[SALEPAGE_SLUG]"
  },
  "associations": [{
    "to": { "id": "[contactId]" },
    "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3 }]
  }]
}
```

- `associationTypeId: 3` = deal → contact
- `amount` ต้องมาจาก `catalog.json` ฝั่ง server **ห้ามเอาจาก request body ของ browser**
- **`pipeline` / `dealstage` ต้องอ่านจาก `catalog.hubspot` เท่านั้น ห้าม hardcode**
  (สเตจถูกดัดตาม `pipelineSetup` แล้ว — id ของแต่ละบัญชีไม่เหมือนกัน)
- ถ้า HubSpot ตอบ **400 เรื่อง `dealstage`/`pipeline`** (เช่นสเตจถูกลบไปหลัง deploy)
  ให้ **retry 1 ครั้งโดยตัด `pipeline` + `dealstage` ออก** แล้ว `console.error` ไว้ —
  HubSpot จะใส่สเตจแรกของ pipeline default ให้เอง **lead ต้องไม่หายเพราะเรื่องสเตจ**

### จ่ายเงินสำเร็จ (ใน `api/stripe-webhook.js`)

`PATCH /crm/v3/objects/deals/{dealId}` → `{ "properties": { "dealstage": "[catalog.hubspot.stageOnPaid]" } }`

- ถ้า `stageOnPaid` ว่าง (ยังไม่ได้รัน `setup-hubspot.mjs`) → **PATCH แค่ `amount`** แล้ว log ไว้
  **ห้าม fallback เป็น `"closedwon"`** — ถ้าบัญชีนั้นย้ายไป pipeline อื่น id นี้จะไม่มีอยู่ แล้ว PATCH ทั้งก้อนพัง
- ย้ายสเตจตอนเริ่มจ่าย (optional): ถ้า `stageOnCheckout` มีค่า ให้ `api/checkout.js`
  PATCH `dealstage` เป็นค่านั้นแบบ best-effort (`try/catch` ห้ามให้ล้ม checkout)

### Error ที่เจอบ่อย

| status | ความหมาย | ทำอะไร |
|---|---|---|
| 401 | token ผิด / หมดอายุ | ชี้ผู้ใช้ไป B1 · ห้าม echo token |
| 403 | scope ไม่ครบ | บอกว่าขาด scope ตัวไหน → B1 ข้อ 6 |
| 409 | มีอยู่แล้ว | property/contact: ถือว่าสำเร็จ แล้วไป search/patch |
| 429 | rate limit | รอ 1 วินาที retry ไม่เกิน 3 ครั้ง |

## C2. Stripe

- Auth: secret key จาก env · ใช้ npm package `stripe`
- **สร้าง product + price ต่อ 1 offer** — `unit_amount = price * 100`, `currency: "thb"`,
  `metadata.sku = [SKU]`, ถ้า `billing === "monthly"` ใส่ `recurring: { interval: "month" }`
- **base URL ห้าม hardcode และไม่ต้องบังคับให้ตั้ง `SITE_URL` ใน Vercel** — Vercel ตั้ง
  `VERCEL_PROJECT_PRODUCTION_URL` ให้เองทั้ง build และ runtime (production domain ·
  ใช้ custom domain ถ้ามี · **ไม่มี** `https://` นำหน้า) ใช้เป็น fallback ได้เลย
  ตรรกะเดียวกันนี้อยู่ใน `api/health.js` → `resolveSiteUrl()` แล้ว ใช้ซ้ำได้

```js
/** SITE_URL ถ้าตั้งไว้ (ชนะเสมอ) ไม่งั้นใช้ production domain ที่ Vercel ให้ */
function resolveSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return null;   // ตอน dev บนเครื่อง ให้ตั้ง SITE_URL=http://localhost:3000 ใน .env
}
```

- Checkout Session (ใน `api/checkout.js`):

```js
const base = resolveSiteUrl();
{
  mode: offer.billing === 'monthly' ? 'subscription' : 'payment',
  line_items: [{ price: offer.stripePriceId, quantity: 1 }],
  success_url: `${base}/${page}/thanks?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${base}/${page}/?canceled=1`,
  customer_email: email,
  metadata: { page, sku, dealId, location, service }   // page = slug ของหน้า
}
```

- **ราคา lookup จาก `catalog.json` ด้วย `sku` เท่านั้น** — request จาก browser ส่งมาแค่ `sku`
  ถ้า body มี `price` มาด้วย ให้ **ignore**
- Webhook: verify ด้วย `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`
  → ต้องอ่าน **raw body** (ปิด body parser ของ Vercel ด้วย `export const config = { api: { bodyParser: false } }`)
  → handle เฉพาะ `checkout.session.completed` → อ่าน `session.metadata.dealId` → ปิด deal

## C3. GA4 + Meta Pixel

ตารางเต็มอยู่ใน `../../.claude/skills/generate-salepage/references/tracking.md` — สรุปสั้น:

| funnel | GA4 | Pixel |
|---|---|---|
| เข้าหน้า | `page_view` | `PageView` |
| เห็นราคา | `view_item_list` | `ViewContent` |
| เลือกแพ็กเกจ | `select_item` | — |
| คลิก CTA | `cta_clicked` | — |
| เริ่มกรอกฟอร์ม | `form_started` | — |
| **ได้ lead** | `generate_lead` | `Lead` |
| ไปจ่ายเงิน | `begin_checkout` | `InitiateCheckout` |
| **จ่ายสำเร็จ** | `purchase` | `Purchase` |
| ยกเลิก | `checkout_cancelled` | — |
| กด LINE/โทร | `contact_clicked` | `Contact` |

- ค่า `value`/`currency`/`items[].item_id` ต้องตรงกับ `catalog.json`
- `purchase.transaction_id` = Stripe `session_id` (กันยิงซ้ำเวลา refresh)
- ID ทุกตัวอ่านจาก `public/config.js` — ถ้าว่างต้องไม่ error ให้ข้าม script ไปเงียบๆ

## C4. KIE.ai (GPT Image 2)

- `POST https://api.kie.ai/api/v1/jobs/createTask`
  `{ model: "gpt-image-2-text-to-image", input: { prompt, aspect_ratio, resolution } }`
- poll `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=…` ทุก 30 วิ จน `state=success`
  → `JSON.parse(data.resultJson).resultUrls[0]`
- `aspect_ratio` ที่รองรับ: `auto 1:1 3:2 2:3 4:3 3:4 5:4 4:5 16:9 9:16 2:1 1:2 3:1 1:3 21:9 9:21`
- `resolution`: `1K` `2K` `4K`
- ภาษาไทยใน prompt render ได้ถูกต้อง
- 💰 มีค่าใช้จ่ายต่อรูป → **ต้องขอ confirm จากผู้ใช้ก่อนยิงจริงทุกครั้ง**
- รายละเอียด + error codes: `../../.claude/skills/_shared/gpt-image-guide.md`

## C5. Pixabay

`GET https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=[url-encoded]&image_type=photo&per_page=10&safesearch=true`
→ ใช้ `hits[].largeImageURL` · ตรวจ license ว่าใช้เชิงพาณิชย์ได้ (Pixabay Content License = ได้)

---

# แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| **Vercel build fail: `Cannot find module '/vercel/path0/public_pages/scripts/build-site.mjs'`** | **Root Directory ตั้งเป็น `public_pages`** → cwd ตอน build ผิด | Settings → Build & Deployment → **ลบค่า Root Directory ให้ว่าง** (= repo root) → Redeploy · ห้ามแก้ด้วยการติ๊ก "Include files outside the root directory" |
| **`Function Runtimes must have a valid version, for example now-php@1.0.0`** | `vercel.json` ใส่ `"runtime": "@vercel/node@5"` — ช่อง `runtime` มีไว้สำหรับ **community runtime** และต้องเป็น version เต็ม `x.y.z` | **ลบ `runtime` ออกทั้งบรรทัด** — Node เป็น runtime ที่ Vercel รองรับในตัว detect เอง · เลือกเวอร์ชัน Node ผ่าน `engines.node` ใน `package.json` แทน · `includeFiles` ใช้ได้โดยไม่ต้องมี `runtime` |
| **`The pattern "api/*.js" defined in 'functions' doesn't match any Serverless Functions`** | `api/` ว่าง แต่ `vercel.json` ประกาศ glob ไว้ (เจอตอน deploy ก่อนทำขั้น 5) | ต้องมีไฟล์ใน `api/` อย่างน้อย 1 ตัว — รีโปนี้มี `api/health.js` ให้แล้ว **ห้ามลบก่อนที่ `api/lead.js` จะถูกสร้าง** |
| **Vercel: `Deployment Blocked — the commit author did not have contributing access to the project`** | อีเมลของ **commit author** ถูก map ไปเป็นบัญชี GitHub ที่ไม่ใช่เจ้าของโปรเจกต์ Vercel — **Hobby plan ไม่รองรับ collaborator ใน private repo** (push ผ่าน แต่ build ไม่เริ่ม เว็บยังเป็นเวอร์ชันเก่า) | commit ใหม่ด้วย author ที่ Vercel ยอมรับ (อีเมลของเจ้าของโปรเจกต์ หรืออีเมลที่ไม่ผูกบัญชี GitHub เช่น `noreply@anthropic.com`) แล้ว push อีกครั้ง · หรือกด **Redeploy** ที่หน้า deployment นั้นด้วยบัญชีเจ้าของ · เช็คก่อน push: `git log -1 --format='%an <%ae>'` |
| **env var ว่าง แต่ใส่ค่าไปแล้ว** | ค่าถูก copy ตอน session เริ่มครั้งเดียว | **เปิด session ใหม่** อย่าไปไล่หาที่ token |
| **Claude มองไม่เห็นโปรเจกต์ Vercel** (`list_projects` ว่าง) | ตอน authorize เลือกเฉพาะบางโปรเจกต์ | แก้สิทธิ์ที่ Vercel integration → **All projects** |
| **Stripe connector ทำงานผิดบัญชี** | ต่อ live account ไว้ | ถอดแล้วต่อใหม่เลือก sandbox · ยืนยันว่าได้ `livemode: false` |
| **จ่ายเงินสำเร็จแต่ deal ไม่ปิด** | `STRIPE_WEBHOOK_SECRET` ยังไม่ได้ใส่ใน **Vercel** (connector แทนไม่ได้) | ใส่แล้ว Redeploy — ดู B3 |
| **HTTP 000 / ต่อ API ไม่ได้** | Network access เป็น Trusted อยู่ | เปลี่ยนเป็น **Full** (ดูส่วน A) |
| HubSpot 401 | key ผิด/หมดอายุ | สร้าง key ใหม่ (B1) แล้วอัปเดตทั้ง Environment variables และ Vercel |
| HubSpot 403 | scope ไม่ครบ | Service Key แก้ scope ได้เลย · legacy private app ต้อง **generate token ใหม่** |
| สร้าง deal ได้ แต่ไม่ผูกกับ contact | ลืม `associations` | ใส่ `associationTypeId: 3` |
| `dealstage` invalid / 400 ตอนสร้าง deal | สเตจถูกแก้หรือถูกลบ แต่ `catalog.json` ที่ deploy อยู่ยังเป็นชุดเก่า | `node scripts/setup-hubspot.mjs --plan` ดูสเตจจริง → รันจริง → **commit + push `catalog.json`** ให้ Vercel deploy ใหม่ |
| **บอร์ด deal ยังเป็นสเตจ B2B (Appointment Scheduled ฯลฯ)** | ยังไม่ได้รัน `setup-hubspot.mjs` หลังใส่ `hubspot.pipelineSetup` | รัน `--plan` แล้วรันจริง (ดู C1 หัวข้อ pipeline) |
| ลบสเตจที่ไม่ใช้ไม่ได้ (script เตือนว่าย้ายไปท้ายบอร์ด) | ยังมี deal ค้างในสเตจนั้น หรือ catalog ยังอ้างถึง | ย้าย deal ออกจากสเตจนั้นใน HubSpot แล้วรัน `setup-hubspot.mjs` ซ้ำ |
| จ่ายเงินแล้ว deal ไม่ย้ายสเตจ แต่ webhook ตอบ 200 | `stageOnPaid` ใน catalog ที่ deploy อยู่เป็น `null` | รัน `setup-hubspot.mjs` แล้ว commit + push |
| Stripe webhook ไม่เข้า | ยังไม่ได้ตั้ง endpoint ใน dashboard / secret ไม่ตรง | B3 |
| Webhook signature ผิด | body ถูก parse ไปแล้ว | ปิด bodyParser ใน `api/stripe-webhook.js` |
| ราคาใน Stripe ไม่ตรง page | catalog เปลี่ยนแต่ไม่ได้ sync | รัน `setup-stripe.mjs` ใหม่ |
| GA4 ไม่เห็น event | ID ผิด / ad blocker / `config.js` โหลดไม่ขึ้น | **ไล่ตามลำดับนี้** ⬇️ |

**GA4 เงียบ — ไล่ 4 ชั้น อย่าเดา**

1. **`config.js` โหลดขึ้นไหม** — เปิด DevTools → Network → หา `config.js` ต้องเป็น **200 ไม่ใช่ 404**
   ถ้า 404 แปลว่า path ในหน้าเป็น relative → `window.SITE_CONFIG` undefined → GA ไม่ถูกโหลดเลย
   (เช็คเร็ว: Console พิมพ์ `window.SITE_CONFIG.ga4Id` ต้องได้ `G-…`)
2. **script GA ถูกเรียกไหม** — Network กรองคำว่า `gtag` ต้องเห็น `googletagmanager.com/gtag/js?id=G-…`
   ถ้าไม่มีทั้งที่ข้อ 1 ผ่าน = **ถูกบล็อกฝั่งเบราว์เซอร์**
   ⚠️ **ไม่ใช่แค่ส่วนขยาย — เบราว์เซอร์บางตัวบล็อก tracker มาในตัวโดยไม่ต้องลงอะไรเลย**
   (เคสจริงในคลาส: **Comet เงียบสนิท · Chrome เห็นทันที** ทั้งที่เป็นหน้าเดียวกัน)
   → **เทสด้วย Chrome/Edge ที่ไม่มีส่วนขยาย** ก่อนสรุปว่าโค้ดพัง
   เบราว์เซอร์สาย privacy (Comet, Brave, Safari + ITP, Firefox strict, DuckDuckGo) บล็อกโดย default
3. **ข้อมูลถูกส่งออกจริงไหม** — Network กรอง `collect` ต้องเห็น `google-analytics.com/g/collect?…`
   **status 204 = ส่งสำเร็จ** และดูพารามิเตอร์ `tid=` ว่าเป็น measurement ID ตัวไหน
4. **ส่งเข้าถูก property ไหม** — เอา `tid=` จากข้อ 3 ไปเทียบกับ
   GA4 → **Admin → Data streams → [stream ของเว็บ] → Measurement ID**
   ⚠️ **Property ID (ตัวเลขล้วน เช่น 549792460) ไม่ใช่ Measurement ID (`G-…`)** — คนละค่ากัน
   ถ้าไม่ตรง แปลว่ายิงเข้าอีก property หนึ่ง (Realtime ของ property ที่เปิดดูอยู่จึงว่าง)

> **ทางลัด**: ต่อ `?debug=1` ท้าย URL หน้าเพจ แล้วเปิด GA4 → **Admin → DebugView**
> เห็น event ภายในไม่กี่วินาที · ถ้า DebugView เห็นแต่ Realtime ไม่เห็น = ดู property ผิดตัว

**สิ่งที่ตามมาและต้องรู้ตอนอ่านตัวเลข**: ทราฟฟิกจริงส่วนหนึ่ง **จะหายจาก GA เสมอ**
เพราะเบราว์เซอร์กลุ่มนี้บล็อกตั้งแต่ต้นทาง → **GA4 นับได้ต่ำกว่าความจริงเสมอ ไม่ใช่บั๊ก**
→ **ตัวเลขที่เชื่อได้สำหรับยอดขายคือ HubSpot + Stripe** (เขียนจากฝั่ง server ผ่าน `api/` และ webhook
ซึ่ง ad blocker แตะไม่ได้) ส่วน GA ใช้ดู**พฤติกรรมบนหน้า**และเทียบสัดส่วนระหว่างช่องทาง
· ถ้าจำนวน `generate_lead` ใน GA น้อยกว่าจำนวน Deal ใน HubSpot ให้เชื่อ HubSpot
| Pixel ไม่ยิง | Pixel ID ว่าง | ใส่ใน `config.js` + เช็คด้วย Pixel Helper |
| KIE 402 | เครดิตหมด | แจ้งผู้สอน |
| รูปใหญ่ หน้าโหลดช้า | ไม่ได้ optimize | `node scripts/optimize-images.mjs` |
