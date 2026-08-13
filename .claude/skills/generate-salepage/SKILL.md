---
name: generate-salepage
description: Build a lead-capturing salepage end-to-end — offer building, design guide, ASCII wireframe, Thai copywriting, image prep, HTML build wired to HubSpot and Stripe, tracking, deploy, and a CRO check. Use when the user wants to create or rebuild a salepage or landing page, says "ทำ salepage", "สร้างหน้าขาย", "landing page", "generate salepage", or asks to connect a page's form to CRM.
metadata:
  version: 1.0.0
---

# Generate Salepage

Build ONE high-converting Thai salepage that captures leads into HubSpot and takes payment via Stripe.

## Core philosophy

- **Messaging beats visuals.** A dialed-in message on an average-looking page beats a beautiful page
  with confused copy. Copy is the biggest lever — spend the time there.
- **Reduce friction.** One clear action per section. Don't make the visitor think.
- **Server owns the price.** The browser never decides what something costs — `api/checkout.js`
  looks the price up from `catalog.json` by SKU.

---

## Review Gates — จุดที่ "คนต้องตรวจ" (MANDATORY)

**มี 4 gate ใน skill นี้เท่านั้น** (+ 1 gate ก่อนเริ่ม ที่อยู่ใน skill `create-moodboard`)
นอกจากนี้ทำต่อเนื่องได้เลย — รายงานสั้นๆ แล้วเดินหน้าต่อ ไม่ต้องรอคำตอบ

| Gate | ตรวจอะไร | อยู่ที่ | ต้องวางอะไรให้คนดู |
|---|---|---|---|
| **A** | moodboard + visual brand guideline | skill `create-moodboard` | รูป + guideline ที่ถอดจากรูป |
| **B** | **offer** | จบ Stop 1 | hero offer, สิ่งที่ stack, value anchor, guarantee, urgency ที่เป็นเรื่องจริง |
| **C** | **ASCII wireframe + copywriting** | จบ Stop 3 | wireframe ทั้งผัง + copy ทุก section (Stop 2–3 ทำต่อกันได้ ตรวจครั้งเดียว) |
| **D** | **landing page + CRO** | Stop 5b | **preview URL ที่กดเข้าไปดูได้** + `cro-report.md` + **screenshot desktop/mobile ที่ดูด้วยตาแล้ว** |
| **E** | **published บน Vercel** | Stop 5c | **production URL** + ผล `/api/health` |

**ไม่ต้องตรวจ**: Stop 0 (page folder) · `design-guide.md` เดี่ยวๆ · Stop 4 (assets prep)

> ⚠️ **"ไม่ต้องตรวจ" ไม่ได้แปลว่า "ไม่ต้องขออนุญาต"** — Stop 4 ยิง KIE.ai ซึ่ง**คิดเงินต่อรูป**
> ยังต้องสรุปจำนวนรูป + prompt ให้ผู้ใช้ยืนยันก่อนรันจริงทุกครั้ง และรัน `--dry-run` ก่อนเสมอ
> (กฎข้อ 4 ใน `CLAUDE.md`) นั่นคือ **การอนุมัติค่าใช้จ่าย** ไม่ใช่การตรวจงาน — คนละเรื่องกัน

### กฎของ gate

1. **ทุก gate ต้องส่งของที่คน "กดดู" หรือ "อ่าน" ได้จริง** ไม่ใช่รายงานว่าทำอะไรไปแล้ว

   | ประเภทงาน | ต้องส่งอะไร |
   |---|---|
   | หน้าเว็บ (gate D, E) | **URL ที่เปิดได้จริง** — เปิดเช็คเองก่อนส่งว่าไม่ใช่ 404/302 · บอกด้วยว่า URL นี้เป็น preview หรือ production |
   | รูป (gate A) | **ส่งไฟล์ให้เห็นภาพ** (`moodboard.png` อยู่ใน `.gitignore` — ถ้าไม่ส่ง คนไม่มีทางเห็น) |
   | เอกสาร (gate B, C) | **วาง output จริงลงในแชท** — ผัง ASCII เต็มเป็น code block, copy เป็นคำจริง, ตัวเลขจริง · **ห้ามเขียนแค่ "ดูในไฟล์"** แต่ให้ path ไฟล์กำกับไว้ด้วย |
   | ผลรันคำสั่ง (gate E) | **วาง output ที่คำสั่งพิมพ์ออกมา** (เช่น JSON จาก `/api/health`) ไม่ใช่สรุปว่า "ผ่านแล้ว" |

   **แล้วอธิบายกำกับทุกครั้ง 3 อย่าง**:
   (ก) ให้ดูอะไรเป็นหลัก · (ข) จุดไหนที่ตัดสินใจแทนไปแล้วและเพราะอะไร ·
   (ค) **อะไรที่ยังใช้ไม่ได้/ยังไม่จริง** ในสิ่งที่ส่งไป (เช่นปุ่มจ่ายเงินยังไม่ทำงานบน preview)

   เป้าหมาย: คนตรวจตัดสินได้จากแชทเลย **ไม่ต้องเปิดรีโปเอง ไม่ต้องถามกลับว่า "ดูที่ไหน"**

2. **ห้ามผ่าน gate ด้วยการเดาใจ** — ต้องได้คำตอบจากคนจริงๆ ว่าผ่าน
   "เขาบอกให้ทำต่อตั้งแต่เมื่อกี้" ไม่นับเป็นการตรวจ gate ถัดไป
3. **approve แล้ว commit + push ทันที** ก่อนเริ่มงานถัดไป
   ```bash
   git add -A && git commit -m "…" && git push -u origin [branch]
   ```
   commit message บอกว่า **gate ไหน** และ **ผ่านแล้วหรือยังรอตรวจ** · **ห้ามใส่ค่า key ใน message**
   (ทำให้ย้อนดูได้ว่าอะไรถูกอนุมัติเมื่อไหร่ และงานไม่หายถ้าคอนเทนเนอร์ถูกคืน)

   **commit ก่อน approve ได้ ไม่ผิดกฎ** — repo นี้มี stop hook ที่ไม่ยอมให้มีไฟล์ค้างนอก git
   ถ้าจบเทิร์นแล้วยังรอคนตรวจ ให้ commit ไว้เลยแล้วเขียนใน message ว่า *gate ยังไม่ผ่าน*
   **commit ไม่เท่ากับ approve** — ห้ามเอา commit ที่ตัวเองสร้างมาอ้างว่างานผ่านแล้ว
4. **แก้แล้วต้องตรวจซ้ำ** — ถ้าคนสั่งแก้ที่ gate ไหน ให้แก้แล้วกลับมาที่ gate เดิม
   ห้ามเดินไป gate ถัดไปด้วยของที่ยังไม่ผ่าน
5. **ระหว่าง gate เดินต่อเนื่องได้ — และ *ต้อง* เดินต่อ ไม่ต้องถามซ้ำ**
   จับกลุ่มที่ทำต่อกันในเทิร์นเดียว: **Stop 0→1** · **Stop 2→3** ·
   **Stop 4 (รูปเสร็จ) →5a (build HTML) →5b (deploy preview + CRO + ทำ quick wins) → หยุดที่ gate D**

   เมื่อรูปครบตาม manifest แล้ว **ห้ามถามว่า "จะ build ต่อไหม"** — ผู้ใช้อนุมัติค่าใช้จ่ายรูปไปแล้ว
   และ build/deploy/CRO ไม่มีค่าใช้จ่ายและย้อนกลับได้ · การถามซ้ำทำให้คนต้องพิมพ์ "ทำต่อ" หลายรอบ
   โดยไม่ได้ตัดสินใจอะไรเพิ่ม → **เดินให้จบชุดแล้วส่ง preview URL ให้ตรวจทีเดียว**

   ห้ามข้าม gate เพราะ "ใกล้เสร็จแล้ว" · และห้ามหยุดกลางชุดเพื่อรายงานความคืบหน้าเฉยๆ

Stop เหล่านี้ map ตรงกับ **Workshop Steps** ในบรีฟ (Offer Building → ASCII wireframe →
Copywriting → Assets prep → Create landing page with HubSpot connection → Hosting on Vercel):

| Stop | Workshop step | Deliverable | Gate |
|---|---|---|---|
| 0 | เตรียม page folder (**ชื่อโฟลเดอร์ = URL**) + **ขอ brief** | `public_pages/[slug]/` + **`salepage-brief.md`** + `_progress.md` | — |
| 1 | **Offer Building** | `offer-building.md` | **B** |
| 2 | Design guide + **ASCII wireframe** | `design-guide.md` + `wireframe-copywriting.md` (ส่วนผัง) | — |
| 3 | **Copywriting** (ไทย) + lead-form spec | `wireframe-copywriting.md` (เติม copy ลงไฟล์เดิม) | **C** |
| 4 | **Assets prep** | `assets-plan.md` (เติมแล้ว) + `assets.json` + รูปครบ + `manifest.md` | — (แต่ต้องยืนยันค่าใช้จ่าย) |
| 5a | Build หน้าเพจ + wire HubSpot/Stripe + tracking | `api/` `lib/` `public/` | — |
| 5b | Deploy **preview** + CRO check บนหน้าจริง | preview URL + `cro-report.md` | **D** |
| 5c | ขึ้น **production** | production URL | **E** |

หลังผ่าน gate E → **Test lead** ด้วย `node scripts/test-lead.mjs --url [production URL]`

### ต้องมีอะไรก่อนเริ่ม (ห้ามข้าม)

| ต้องมี | ได้จาก | ถ้ายังไม่มี |
|---|---|---|
| `context/{company,clients,offers}.md` มีข้อมูลจริง | ผู้ใช้กรอกเอง หรือ `cp -r context_example/. context/` | หยุด — ขั้นถัดไปจะเดาข้อมูลแบรนด์เอง |
| **`context/brand-identity/moodboard.png` + `visual-guideline.md` + `context/voice.md`** | skill `create-moodboard` | **หยุดแล้วเรียก `create-moodboard` ก่อน** |
| `catalog.json` (offers/ราคา/sku) | skill `setup-crm` | ทำ Stop 1–4 ได้ แต่ **Stop 5 ต้องมี** |
| **`public_pages/[slug]/salepage-brief.md`** | **ถามผู้ใช้ที่ Stop 0** (ไม่มีก็ร่างจาก `context/` แล้วบอกว่าเดา) | **หยุด — ห้ามเริ่ม Stop 1** ไม่งั้นจะได้หน้าที่ขายทุกอย่างให้ทุกคนด้วยมุมกลางๆ |

**หน้าเพจต้อง follow brand identity ที่สร้างไว้** — palette, ฟอนต์, photography direction และ
โทน copy ทุกบรรทัดมาจาก `visual-guideline.md` + `voice.md` ห้ามคิดสี/ฟอนต์/โทนใหม่เอง
ถ้าเห็นว่า guideline ขัดกับสิ่งที่ควรทำ ให้เสนอแก้ที่ guideline ก่อน แล้วค่อยทำหน้าเพจตามนั้น

### ทุก stop ต้องกิน output ของ stop ก่อนหน้า (ห้ามเริ่มจากศูนย์)

ปัญหาที่เกิดจริง: แต่ละ stop เขียนของใหม่สวยๆ ขึ้นมาโดยไม่ได้อ่านของที่อนุมัติไปแล้ว →
wireframe ที่ไม่มี offer, copy ที่ราคาไม่ตรง catalog, หน้าเพจที่สีไม่ตรง moodboard

| Stop | **Input ที่ต้องอ่านก่อนเขียน (บังคับ)** | Output |
|---|---|---|
| 1 | **`salepage-brief.md`** (หน้านี้ขายอะไร ให้ใคร angle ไหน) · `context/{company,clients,offers,voice}.md` · `brand-identity/visual-guideline.md` · `catalog.json` | `offer-building.md` |
| 2 | **`salepage-brief.md`** · **`offer-building.md`** (gate B) · **`visual-guideline.md`** · `catalog.json` · `references/design-standards.md` | `design-guide.md` + `wireframe-copywriting.md` |
| 3 | **`salepage-brief.md`** (angle + คนอ่านมาจากไหน = โทนของ copy) · **`offer-building.md`** · **`wireframe-copywriting.md`** · **`catalog.json`** · **`context/voice.md`** · `clients.md` · `references/{copywriting,lead-form}.md` | `wireframe-copywriting.md` |
| 4 | **`wireframe-copywriting.md`** (ตาราง Image Requirements) · **`visual-guideline.md`** (photography + ภาพที่ห้ามใช้) · **ดู `context/brand-identity/moodboard.png` ด้วยตาก่อนเขียน prompt** (ไม่มีไฟล์ → อ่าน `moodboard-prompt.txt` แทน) · `assets-plan.md` | `assets.json` + รูป + `manifest.md` |
| 5a | **`wireframe-copywriting.md`** (ทั้งผังและ copy) · **`design-guide.md`** · **`manifest.md`** · **`catalog.json`** · `visual-guideline.md` · `voice.md` · `technical-setup.md` · `references/{project-scaffold,tracking}.md` · (ถ้ามีไฟล์อยู่: **ดู `moodboard.png` ด้วยตา**เป็น cross-check) | `api/` `lib/` `public/` |
| 5b | **หน้าที่ deploy แล้ว** (ไม่ใช่ไฟล์ HTML) · `references/cro-check.md` · **`salepage-brief.md`** (หน้าที่ได้ตรงกับที่ brief สั่งไหม) · `offer-building.md` (เช็คว่า guarantee/anchor/urgency ที่ตกลงไว้ **ขึ้นบนหน้าจริงครบไหม** — เป็น input ของ *การตรวจ* ไม่ใช่ของการ build) | `cro-report.md` |

**ถ้า input ตัวไหนไม่มีหรือว่างเปล่า → หยุด** แล้วบอกว่าขาดอะไรและต้องกลับไป stop ไหน
ห้ามเดาแทน ห้ามคิดขึ้นมาใหม่เพื่อให้เดินต่อได้

**เช็ค 3 ข้อนี้ทุกครั้งที่เริ่ม stop ใหม่** (traceability — ทำให้ตรวจได้ว่าไม่ได้แต่งเอง):
1. **ราคา/sku** ที่กำลังจะเขียน ตรงกับ `catalog.json` ทุกตัวไหม (ไม่ใช่ตรงกับ `offers.md` เฉยๆ —
   `catalog.json` คือตัวที่ผูกกับ Stripe price และ HubSpot product จริง)
2. **สี/ฟอนต์** ที่กำลังจะใช้ อยู่ใน `visual-guideline.md` ไหม — ถ้าไม่อยู่ ห้ามใช้
3. **ตัวเลข/เคลม** ทุกตัวใน copy สืบกลับไปถึงไฟล์ใน `context/` ได้ไหม — ถ้าไม่ได้ ให้ตัดออก

---

## Stop 0 — เตรียม page folder + **ขอ brief ของหน้านี้**

**ชื่อโฟลเดอร์ = URL ของหน้านั้น** (หลายหน้าอยู่ใน Vercel deployment เดียวกันได้)

```bash
cp -r "public_pages/[SALEPAGE_SLUG]" public_pages/page_a     # → [domain]/page_a
```

- ถามผู้ใช้ก่อนว่าอยากให้ URL เป็นอะไร แล้วตั้งชื่อโฟลเดอร์ตามนั้น
- ใช้ได้แค่ `a-z 0-9 - _` และต้องเริ่มด้วยตัวอักษร/ตัวเลข (เป็น URL segment)
- template folder มี `salepage-brief.md` + `assets-plan.md` + `README.md` (โครงเปล่า)
  · `technical-setup.md` **อยู่ที่ root ของรีโป** ไม่ได้อยู่ในโฟลเดอร์หน้า (เป็นของกลางทุกหน้า)
- สร้าง `_progress.md` บันทึกว่าทำหน้าไหน ใช้ context อะไร
- เช็คว่ามีหน้าอื่นอยู่แล้วไหม (`ls public_pages/`) — ถ้ามี `api/` + `lib/` ที่ root แล้ว
  Stop 5 จะสั้นลงมาก เพราะ plumbing ใช้ร่วมกัน

### ขอ brief ก่อนลงมือ — ห้ามเริ่ม Stop 1 โดยไม่มี `salepage-brief.md`

`context/` บอกว่า **แบรนด์คือใคร** (เหมือนกันทุกหน้า) — brief บอกว่า **หน้านี้จะขายอะไร ให้ใคร
ด้วยมุมไหน** ซึ่ง**ต่างกันได้ในแต่ละหน้า** และนี่คือเหตุผลที่ `public_pages/` มีได้หลายโฟลเดอร์
แบรนด์เดียวกันขายของชิ้นเดียวกันด้วยคนละ angle ก็เป็นคนละหน้า คนละ headline คนละรูป

**ถามผู้ใช้ก่อนเสมอ** อย่างน้อย 4 ข้อนี้ (ถามรวบเป็นชุดเดียว ไม่ต้องถามทีละข้อ):

1. **หน้านี้ขายอะไร** — สินค้าตัวเดียว · ให้เลือกหลายตัวแล้ว checkout · หรือทั้ง catalog
   (ถ้าไม่ครบทุก sku ให้ระบุว่าเอา sku ไหนบ้าง)
2. **เป้าหมายของหน้า** — เก็บ lead → ขาย · ขายตรง · จองคิว · ลงทะเบียน
3. **คนอ่านมาจากไหน** — FB/IG ad · LINE broadcast · bio link · QR ในร้าน (มีผลกับ copy โดยตรง:
   คนที่กดจากแอดยังไม่รู้จักแบรนด์ · คนจาก LINE รู้จักแล้ว ต้องเขียนคนละแบบ)
4. **angle ที่อยากนำเสนอ** — ถ้ามีหน้าอื่นอยู่แล้ว ให้เช็ค brief ของหน้านั้นด้วยว่าใช้ angle อะไร
   จะได้ไม่เขียนซ้ำกัน

**ถ้าผู้ใช้ไม่มี brief / ตอบว่า "แล้วแต่เลย"** → **ร่างให้เองจาก `context/`** (hero offer จาก
`offers.md`, กลุ่มเป้าหมายจาก `clients.md`, angle จาก pain ที่แรงที่สุด) แล้ว **บอกให้ชัดว่า
ข้อไหนเป็นการเดา** และเดาจากอะไร — ห้ามเขียนให้ดูเหมือนผู้ใช้เป็นคนกำหนด

เขียนผลลง **`public_pages/[slug]/salepage-brief.md`** (โครงอยู่ใน template) แล้วสรุปให้ผู้ใช้เห็น
ย่อๆ ว่าหน้านี้จะขายอะไรด้วยมุมไหน ก่อนไป Stop 1

> **ไม่มี gate** (การขอ brief คือการขอ *input* ไม่ใช่การให้ตรวจงาน) — แต่ **ต้องได้คำตอบหรือ
> ต้องมีไฟล์ brief ก่อน** ถึงจะเริ่ม Stop 1 ได้ · ถ้าผู้ใช้แก้ brief ทีหลัง ต้องกลับไปทบทวน
> Stop 1–3 ว่ายังตรงกับ brief ใหม่ไหม

## Stop 1 — Context + Offer building

1. Read **all** of: `context/company.md`, `clients.md`, `offers.md`, `voice.md`,
   `brand-identity/visual-guideline.md` (และ `catalog.json` ถ้ามีแล้ว).
   **ไม่ต้องอ่าน `technical-setup.md` ที่ stop นี้** — มันเป็นคู่มือ setup บัญชี/key/deploy
   ไม่มีอะไรที่เปลี่ยนรูปร่างของ offer · ไปอ่านตอน Stop 5a ที่ต้องต่อ HubSpot/Stripe จริง
   `context/` มาเป็นหัวข้อเปล่า — ถ้ายังไม่มีใครกรอก ให้หยุดแล้วเสนอ 2 ทาง:
   (ก) สัมภาษณ์แล้วกรอกให้ · (ข) `cp -r context_example/. context/` ใช้แบรนด์ตัวอย่าง GLOW SOCIETY
   ถ้าเลือก (ข) ต้องบอกผู้ใช้ให้ชัดว่าหน้าเพจจะเป็นของแบรนด์สมมติ
2. Confirm the two things that decide everything else:
   - **เป้าหมายของหน้านี้** (default: เก็บ lead → ขาย hero offer)
   - **customer journey** (default: FB/IG Ad → salepage → lead form → Stripe checkout → thanks)
3. Build the offer with the **value equation** in `references/offer-building.md`
   (Dream Outcome × Perceived Likelihood) ÷ (Time Delay × Effort). Maximise the top, minimise
   the bottom. Stack bonuses that remove time/effort, add the guarantee that raises belief.
4. Write `offer-building.md`: hero offer, what's stacked in it, value anchor, guarantee,
   urgency/scarcity that is **true** (never invent fake countdowns), and the objection→answer map
   pulled from `clients.md`.

> ## 🔴 GATE B — ตรวจ offer
> create/update `_progress.md` แล้ว**หยุดรอคนตรวจ** วางให้ดูใน ~10 บรรทัด:
> hero offer · สิ่งที่ stack อยู่ในนั้น · value anchor · guarantee · urgency (ต้องเป็นเรื่องจริง)
> พร้อมบอกว่าราคาตรงกับ `catalog.json` หรือยัง
>
> **approve แล้ว → `git add -A && git commit && git push` ทันที** แล้วจึงเริ่ม Stop 2

## Stop 2 — Design guide + wireframe

**อ่านก่อนเขียน (บังคับ)**: `offer-building.md` ที่ผ่าน gate B · `context/brand-identity/visual-guideline.md`
· `catalog.json` · `references/design-standards.md`

- **wireframe ต้องมีที่อยู่ให้ทุกชิ้นใน offer stack** — hero offer, bonus, guarantee, value anchor,
  urgency และ objection ทุกข้อในตาราง "objection → section" ของ `offer-building.md`
  ต้องปรากฏใน section ใด section หนึ่ง **ไล่เช็คทีละแถว** ถ้ามีข้อที่ไม่มีที่อยู่ = wireframe ยังไม่เสร็จ
- **จำนวนการ์ดราคา = sku ที่ `salepage-brief.md` ระบุว่าหน้านี้ขาย** (ไม่ใช่ทุกตัวใน `catalog.json`
  เสมอไป — หน้าที่ขายสินค้าตัวเดียวมีการ์ดใบเดียวถูกต้องแล้ว) · ถ้า brief ไม่ได้ระบุ = ใช้ทั้ง catalog
  · hero card = ตัวที่ brief กำหนด ถ้าไม่ได้กำหนดจึงใช้ offer ที่ `hero: true` ใน catalog
  · **ทุก sku ที่ขึ้นหน้าต้องมีอยู่ใน `catalog.json`** ไม่งั้น `api/checkout.js` หาราคาไม่เจอ
- **design-guide ห้ามมีสี/ฟอนต์ที่ไม่อยู่ใน `visual-guideline.md`** — ถ้า guideline ไม่ได้บอกบางอย่าง
  (เช่นสไตล์ปุ่ม) ให้อนุมานจากภาษาภาพในนั้นแล้ว**เขียนกำกับว่าเป็นการอนุมาน** ห้ามหยิบสีใหม่มาใช้เงียบๆ

1. **Recommend** a theme (light/dark) and one **tone** from the 11 directions, with a one-line reason
   tied to the brand voice. Ask the user to confirm — commit fully to it, no half measures.
2. Write `design-guide.md`: palette with roles + HEX · type pair (Thai-capable, characterful —
   **never** Inter/Roboto/Arial/system-ui/Sarabun as primary) · 1.333x scale · 4px spacing rhythm ·
   component specs (CTA, card, pricing table, FAQ accordion, form) · per-section visual treatment ·
   section divider style · texture/depth decisions.
3. Write `wireframe-copywriting.md` as an **ASCII lo-fi wireframe** in this section order:

```
1  Hero              headline · sub · CTA · hero image · micro-trust (ดาว/จำนวนสมาชิก)
2  Social proof bar   ตัวเลขจริง 3–4 ตัว
3  Problem            agitate pain จาก clients.md
4  Solution + USP     เราต่างจากทางเลือกอื่นยังไง
5  Services           กลุ่มบริการ + ภาพจริง
6  How it works       3–4 ขั้น ตั้งแต่จองถึงวันมา
7  Offers / Pricing   การ์ดราคา + highlight hero offer + value anchor
8  Testimonials       ภาพ + ชื่อ + ผลลัพธ์ที่วัดได้
9  Locations/ตารางรอบ ถ้ามีหน้าร้าน
10 FAQ                objection 5 ข้อแปลงเป็นคำถาม
11 Lead form + CTA    ★ จุดเก็บ lead
12 Final CTA          ย้ำคุณค่า + guarantee + ปุ่มใหญ่
```

   Include an **Image / Visual Requirements table** (section → ภาพอะไร → ratio → filename) —
   Stop 4 reads this table.

**โครงของ `wireframe-copywriting.md` (ไฟล์เดียว 2 ส่วน — Stop 2 เขียนส่วน A, Stop 3 เขียนส่วน B):**

```markdown
# Wireframe + Copy — หน้า [slug]
## ส่วน A — ผัง (Stop 2)
   ผัง ASCII ทั้งหน้าเป็น code block เดียว (ต้องเห็นรูปร่างหน้าทั้งหน้าในตาเดียว)
   ตารางผลไล่เช็คกับ offer-building.md (ของทุกชิ้นใน stack อยู่ section ไหน)
   ตาราง Image / Visual Requirements
## ส่วน B — Copy ต่อ section (Stop 3)
   ## Section [n] — [ชื่อ]  ← เลขและชื่อต้องตรงกับผังในส่วน A
   **Headline / Sub / Body / CTA / ภาพ+alt / ข้อมูลอ้างอิง**
```

**ห้ามแยกเป็น 2 ไฟล์** — gate C ตรวจผังกับ copy พร้อมกันอยู่แล้ว และการแยกไฟล์ทำให้เลข/ชื่อ section
สองที่หลุดจากกันได้โดยไม่มีใครเห็น

> **ไม่มี gate** — update `_progress.md` สรุป theme/tone ที่เลือก + ผัง section สั้นๆ
> แล้วทำ Stop 3 ต่อได้เลย (wireframe จะถูกตรวจพร้อม copy ที่ gate C)

## Stop 3 — Copywriting

**อ่านก่อนเขียน (บังคับ)**: `offer-building.md` · `wireframe-copywriting.md` · `catalog.json` · `context/voice.md`
· `context/clients.md` · `references/copywriting.md` · `references/lead-form.md`

**เติม "ส่วน B — Copy ต่อ section" ลงใน `wireframe-copywriting.md` ที่ Stop 2 สร้างไว้ ไม่สร้างไฟล์ใหม่**

- **เขียนตาม section ที่อยู่ในส่วน A เท่านั้น** — ห้ามเพิ่ม/ตัด section เอง
  ถ้าเห็นว่าผังควรเปลี่ยน ให้กลับไปแก้ส่วน A ในไฟล์เดียวกันก่อน (แล้วบอกผู้ใช้ว่าแก้อะไร)
  **เลข + ชื่อ section ในส่วน B ต้องตรงกับส่วน A ทุกตัว** — ถ้าไม่ตรง ถือว่ายังไม่เสร็จ
- **ราคาทุกตัวก๊อปจาก `catalog.json`** ไม่ใช่พิมพ์เอง · ราคาต่อรอบที่คำนวณเอง (เช่น 1890÷4)
  ให้แสดงวิธีคิดไว้ในไฟล์ด้วย
- **guarantee / bonus / value anchor / urgency ต้องเป็นคำเดียวกับที่ผ่าน gate B**
  ห้ามแต่งข้อเสนอใหม่ตอนเขียน copy (เป็นจุดที่มักหลุด — copy สนุกกว่าเมื่อสัญญาเยอะขึ้น แต่ผิด)

- Write every line in **Thai**, obeying `voice.md` (คำที่ห้ามใช้ = ห้ามจริงๆ)
- Specific beats clever: "รอบละไม่เกิน 10 คน" ไม่ใช่ "รอบเล็กอบอุ่น"
- One idea per section. Benefit first, feature second.
- Hero must answer in 5 seconds: นี่คืออะไร · ฉันได้อะไร · ต้องทำอะไรต่อ
- FAQ = objections from `clients.md`, answered honestly
- Include image references and every data point inline — Stop 5 builds from this file only
- Specify the **lead form**: 3 ช่องเท่านั้น (**ชื่อ · อีเมล · เบอร์โทร**) + `sku` เป็น hidden field
  จากการ์ดราคาที่กดมา + ข้อความปุ่ม + error message ไทยทีละช่อง + state หลังส่งสำเร็จ

> ## 🔴 GATE C — ตรวจ ASCII wireframe + copywriting (ไฟล์เดียว ตรวจครั้งเดียว)
> update `_progress.md` แล้ว**หยุดรอคนตรวจ** วางให้ดูทั้งสองส่วนในเทิร์นเดียว:
> 1. **ผัง ASCII ทั้งผัง** จากส่วน A (วางเป็น code block ให้เห็นเต็ม ไม่ใช่สรุป)
> 2. **copy ทุก section** จากส่วน B — hero headline/sub/CTA ต้องเห็นคำจริง
>    ไม่ใช่คำอธิบายว่าจะเขียนอะไร
>
> ชี้ให้ดูด้วยว่า copy บรรทัดไหนมาจากตัวเลขจริงใน `context/` และมีคำที่ `voice.md` ห้ามใช้หลุดมาไหม
>
> **approve แล้ว → commit + push ทันที** แล้วจึงเริ่ม Stop 4

## Stop 4 — Assets prep

**อ่านก่อนเขียน (บังคับ)**: `wireframe-copywriting.md` (ตาราง Image Requirements) ·
`context/brand-identity/visual-guideline.md` (photography direction + **ลักษณะรูปที่ห้ามใช้**) ·
`assets-plan.md` · `../../.claude/skills/_shared/gpt-image-guide.md`

**เปิด `context/brand-identity/moodboard.png` ดูด้วยตาก่อนเขียน prompt ทุกครั้ง** — guideline เป็น
*ตัวหนังสือ* ส่วน moodboard คือ *ภาพจริงที่ผู้ใช้อนุมัติไปแล้วที่ gate A* รูปบนหน้าเพจต้องดูเหมือน
มาจากกองถ่ายเดียวกันกับรูปในบอร์ด ไม่ใช่แค่ "ทำตามกฎที่เขียนไว้"

สิ่งที่ต้องดูจากบอร์ดแล้วยกลง prompt: **ระยะภาพและการจัดองค์ประกอบ · color grade จริง ·
จำนวนคนที่เห็นในเฟรม · สิ่งที่อยู่ในฉากหลัง · treatment พิเศษ** (เช่น duotone) ·
และ **ประเภทฉากที่บอร์ดมีแต่แผนรูปยังไม่มี** — ถ้าบอร์ดโชว์ฉากไหนเด่นแต่หน้าเพจไม่มีเลย
ให้เสนอผู้ใช้เพิ่ม (พร้อมบอกว่ามีค่าใช้จ่ายเพิ่ม) ไม่ใช่เงียบแล้วปล่อยผ่าน

> `moodboard.png` อยู่ใน `.gitignore` → **session ใหม่จะไม่มีไฟล์นี้** ถ้าไม่มีให้ใช้
> `context/brand-identity/moodboard-prompt.txt` (commit ไว้) แทน เพราะมันบรรยายบอร์ดไว้ครบ
> แล้วบอกผู้ใช้ว่ากำลังอ้างจาก prompt ไม่ได้เห็นภาพจริง

**Images cost money per generation — confirm the list and prompts with the user before generating.**

**ทุก prompt ต้องฝังกฎจาก `visual-guideline.md` ลงไปทุกอัน** — ใคร/อายุ/กี่คนต่อรูป · แสง · อารมณ์ ·
และ **`DO NOT:` ที่ยกมาจากหัวข้อ "ลักษณะรูปที่ห้ามใช้" ตรงๆ** (ถ้า guideline ห้ามรูปคนเดียว
แต่ prompt ไม่ได้ห้าม จะได้รูปผิดแบรนด์แล้วเสียเงินซ้ำ) · จำนวนรูปต้องเท่ากับจำนวนแถวในตาราง wireframe

0. **เติม `assets-plan.md`** จาก wireframe's Image Requirements table + `visual-guideline.md`:
   ทุกแถวต้องมี `id · priority · section · filename · ratio · resolution · เป้าไฟล์ · source · alt ไทย`
   และเขียน prompt เต็มต่อรูป (ตามเทคนิคในไฟล์นั้น)
   → **ให้ผู้ใช้ review ทั้งแผนก่อน** แล้วแปลงเป็น `assets.json` (schema: `outDir`, `photoRules`,
   `assets[]`, `moodboard`, `stock[]`) ซึ่งเป็นไฟล์ที่ `scripts/gen-images.mjs` อ่าน
1. Build the inventory from the wireframe's Image Requirements table. Mark each row:
   `มีแล้ว` / `ต้อง generate` / `ต้องหา stock`
2. Generate: `node scripts/gen-images.mjs --dry-run` → review → `--only [group]` to run for real.
   `aspect_ratio` ต้องอยู่ในลิสต์ของ kie.ai (`auto`, `1:1`, `3:2`, `2:3`, `4:3`, `3:4`, `5:4`,
   `4:5`, `16:9`, `9:16`, `2:1`, `1:2`, `3:1`, `1:3`, `21:9`, `9:21`) และ `resolution` ต้องเป็น
   `1K`/`2K`/`4K` — ดู `.claude/skills/_shared/gpt-image-guide.md`
3. Stock/icons: `node scripts/fetch-stock.mjs --query "..."` (Pixabay, free, commercial-safe)
4. **Filename sanitization** — every file in `public/assets/` must be web-safe:
   lowercase · a-z 0-9 - _ . only · no Thai characters · no spaces · no double dashes
   (`hero-01.webp`, `coach-02.webp`)
5. **Optimize** — `node scripts/optimize-images.mjs` (wraps `npx sharp-cli`):
   hero ≤200KB @1400px · section ≤150KB @800px · card ≤80KB @400px · avatar ≤30KB @128px ·
   whole page ≤3MB
6. **OG thumbnail** 1200×630 (generate at `3:2` then resize) — Thai headline text in the image is
   fine here. Save `public/assets/og-image.jpg`
7. **Favicon** — 32×32 `public/assets/favicon.png`
8. Write `public/assets/manifest.md`: filename · section · alt text (Thai) · source · size

**Do not start Stop 5 until every row in the manifest has a real file.**

> **ไม่มี gate ตรวจงาน แต่มีการขออนุมัติค่าใช้จ่าย** — ก่อนยิง `gen-images.mjs` จริงต้อง
> รัน `--dry-run` แล้วสรุป **จำนวนรูป + prompt ต่อรูป** ให้ผู้ใช้ยืนยันก่อนทุกครั้ง (KIE.ai คิดเงินต่อรูป)
> เมื่อรูปครบตาม manifest แล้ว update `_progress.md` รายงานสั้นๆ ว่าได้รูปกี่ไฟล์ ขนาดรวมเท่าไร
> แล้วทำ Stop 5a ต่อได้เลยโดยไม่ต้องรอ

## Stop 5a — Build หน้าเพจ + wire HubSpot/Stripe

Read `references/project-scaffold.md` **ก่อน** (มี pattern ที่ทดสอบแล้วของทุกไฟล์ที่ต้องสร้าง —
ไม่ต้องคิดโครงใหม่) แล้วอ่าน `manifest.md`, `design-guide.md`, `wireframe-copywriting.md`,
`technical-setup.md`, `references/tracking.md`, `references/cro-check.md`
**และ `context/brand-identity/visual-guideline.md` + `context/voice.md` อีกครั้งตอน build**

**ต้องมี `catalog.json` ก่อน** — ถ้ายังไม่มี ให้หยุดแล้วรัน skill `setup-crm` ก่อน

**หน้าเพจคือการประกอบของที่อนุมัติแล้ว ไม่ใช่การเขียนใหม่:**

**offer-building.md ไม่ใช่ input ของ stop นี้** — ของใน offer stack ถูกแปลงเป็นคำไปแล้วที่ Stop 3
และถูกจัดที่อยู่ไปแล้วที่ Stop 2 · ถ้าตอน build ยังต้องเปิด `offer-building.md` เพื่อรู้ว่าจะเขียนอะไร
แปลว่า Stop 2/3 ทำไม่ครบ ให้กลับไปแก้ที่นั้น (`offer-building.md` กลับมาใช้อีกครั้งตอน CRO ที่ 5b
เพื่อ**ตรวจ**ว่า guarantee/anchor/urgency ขึ้นหน้าจริงครบ)

| ของบนหน้าเพจ | ต้องมาจาก | ห้าม |
|---|---|---|
| ลำดับ section | `wireframe-copywriting.md` | เพิ่ม/ตัด/สลับ section เอง |
| ทุกข้อความ | `wireframe-copywriting.md` | เขียน copy ใหม่ตอน build · ใส่ lorem ipsum · ใส่ placeholder |
| สี · ฟอนต์ · radius · เงา | `design-guide.md` (ซึ่งมาจาก `visual-guideline.md`) | หยิบสี/ฟอนต์ที่ไม่อยู่ในนั้น |
| ทุกไฟล์รูป + `alt` | `manifest.md` | อ้างไฟล์ที่ไม่มีใน manifest · emoji แทนรูปคน |
| ราคา · sku · ชื่อแพ็กเกจ | `catalog.json` (ฝั่ง server) | hardcode ราคาใน HTML แล้วเชื่อค่าจาก browser |

**ถ้าเจอว่าของที่อนุมัติไว้ใช้ไม่ได้จริงตอน build** (เช่น copy ยาวเกินจนพัง layout) —
แก้ที่ไฟล์ต้นทางแล้ว**บอกผู้ใช้ว่าแก้อะไรและทำไม** ห้ามแก้เฉพาะใน HTML
เพราะไฟล์ต้นทางจะไม่ตรงกับหน้าจริง แล้วรอบหน้าที่ build ใหม่จะย้อนกลับไปของเดิม

สร้างไฟล์ตามลำดับนี้: `package.json` → `vercel.json` → `lib/{catalog,hubspot}.js` →
`api/{lead,checkout,stripe-webhook}.js` → `public/{config.js,index.html,thanks.html}`

**Build** `public/index.html` + `public/thanks.html`:
- Self-contained: Tailwind via CDN + a `<style>` block for brand tokens/fonts. No build step.
- Semantic HTML, WCAG AA, responsive (mobile → desktop), flexbox/grid only
- Every `<img>`: real `<img>` tag (never a text placeholder, never emoji instead of a person),
  relative path `assets/…`, meaningful Thai `alt`, explicit `width`/`height`,
  `loading="lazy"` except the hero
- Logo keeps its aspect ratio (set one dimension only)
- `<head>`: favicon, OG + Twitter meta pointing at `assets/og-image.jpg`
- Fonts via Google Fonts link (Thai subset) per `design-guide.md`

**Wire it up:**
- Lead form → `POST /api/lead` → HubSpot Contact + Deal → returns `dealId`
- Then `POST /api/checkout` with `{sku, dealId}` → redirect to Stripe Checkout URL
- `thanks.html` reads `?session_id=` → fires `purchase`
- Never send a price from the browser — send `sku` only
- All IDs (GA4, Pixel, site URL) come from `public/config.js`

**Tracking** — implement exactly the event table in `references/tracking.md`
(`generate_lead`/`Lead` after the form succeeds, `purchase`/`Purchase` on thanks, etc.)

> **ไม่มี gate** — build เสร็จแล้วไป Stop 5b ต่อได้เลย **ห้ามให้คนตรวจจากโค้ด**
> เพราะบน cloud session ไม่มี `vercel dev`/localhost ให้เปิดดู การตรวจหน้าเพจต้องตรวจบนของจริง

## Stop 5b — Deploy preview + CRO check (บนหน้าจริง)

**Deploy — ทำที่ root ของ repo ไม่ใช่ในโฟลเดอร์หน้า:**

ทางหลัก (cloud session) = **Git integration** — ต่อ repo กับ Vercel ครั้งเดียว แล้ว push = deploy
ใส่ key ที่ **Vercel → Project Settings → Environment Variables** (ครั้งเดียว ใช้ได้ทุกหน้า)

```bash
node scripts/build-site.mjs --dry-run   # เช็คว่าหน้าเราอยู่ในลิสต์ก่อน push
git add -A && git commit -m "…" && git push -u origin [branch]
```

**push เข้า branch (ไม่ใช่ default branch) → Vercel สร้าง preview deployment ให้เอง**
เอา preview URL นั้นมาใช้ตรวจ — เป็นหน้าเดียวกับ production ทุกอย่างยกเว้น domain

**หา preview URL:** Vercel connector → `list_teams` → `list_projects` → **`list_deployments`**
แล้วเอา deployment ที่ `meta.githubCommitRef` = branch ของเรา และ `state: READY` (`target: null` = preview)

**ถ้า curl ได้ 302/403 = project เปิด deployment protection ไว้** (`ssoProtection` — ค่า default ของ
บัญชีที่มี team) คนที่ login Vercel เปิดในเบราว์เซอร์ได้ปกติ **แต่ Claude เข้าไม่ได้** ซึ่งขัดกับกฎ
"ต้องเปิดเช็คเองก่อนส่ง" → **ห้ามไปขอให้ผู้ใช้ปิด protection** ใช้เครื่องมือของ Vercel แทน:

```
get_project_deployment_protection   # ยืนยันว่าเป็น protection ไม่ใช่ deploy พัง
get_access_to_vercel_url            # ได้ URL ที่มี ?_vercel_share=… (หมดอายุ 23 ชม.)
```

แล้วเช็คด้วย `curl` ที่เก็บ cookie (share token ต้อง redirect เพื่อ set cookie ก่อน):

```bash
curl -s -c /tmp/vc.jar -L "[shareable URL]" -o /dev/null -w '%{http_code}\n'
curl -s -b /tmp/vc.jar "[preview URL]/api/health"
```

(หรือใช้ `web_fetch_vercel_url` ถ้าไม่อยากจัดการ cookie เอง)

**ตอนส่งให้ผู้ใช้ตรวจ ส่ง preview URL ตัวธรรมดา** ไม่ใช่ตัวที่มี `_vercel_share` — ผู้ใช้ login อยู่แล้ว
และ token นั้นหมดอายุใน 23 ชั่วโมง ถ้าส่ง token ไปแล้วเขาเปิดวันหลังจะเจอ error ที่ไม่มีอยู่จริง

บนเครื่องตัวเอง ถ้ามี CLI (ได้ `vercel dev` ทดสอบ `api/` ที่ localhost):
```bash
npm install && vercel dev               # → localhost:3000/[slug]
vercel link && vercel env add …         # ทุก key ที่ใช้
vercel --prod                           # deploy แบบไม่ต้อง commit
```
Vercel จะรัน `scripts/build-site.mjs` เองตอน build (ตั้งไว้ใน `vercel.json`) แล้วประกอบ
`public_pages/*/public/` ทุกหน้าลง `public/` — **หน้าอื่นที่มีอยู่แล้วจะไม่หาย**

**ก่อน CRO — ต้อง "ดูหน้าตัวเอง" ด้วยภาพก่อนเสมอ (ห้ามข้าม)**

```bash
node scripts/screenshot.mjs --url [preview URL]/[slug] --out /tmp/shots
```

ได้ `desktop-full.png` · `mobile-full.png` · `*-fold.png` + `report.json`
(ความสูงหน้า · รูปที่โหลดไม่ขึ้น · รูปที่สูงเกินจอ · scroll แนวนอน · console error · request 4xx)

**แล้วต้องเปิดภาพดูด้วยตาจริงๆ ทั้ง desktop และ mobile** — `report.json` จับได้แค่บางอย่าง
สิ่งที่มีแต่ตาคนจับได้: layout เหลือคอลัมน์เดียว · รูปยักษ์ผิดสัดส่วน · ช่องว่างยาวผิดปกติ ·
ภาพ stock ที่สไตล์ไม่เข้ากับแบรนด์ · กรอบเปล่าที่อ่านเป็น "ของหาย"

> **บทเรียนที่ทำให้ต้องมีขั้นนี้**: เคยส่ง preview URL ให้คนตรวจโดยเช็คแค่ HTTP 200
> แล้วหน้าจริงเหลือ 1 คอลัมน์ทั้งหน้า รูปยืดเต็มจอ และรูปไม่ขึ้นเลยสักใบ —
> **200 ไม่ได้แปลว่าหน้าใช้ได้** ดูรายละเอียดกับดักใน `design-standards.md` ข้อ 5b

**CRO check — ทำกับหน้า preview ที่ deploy แล้ว ไม่ใช่กับไฟล์ HTML** run `references/cro-check.md`
รวม **button contrast check ทุก section** (CTA ต้องเป็น element ที่ contrast สูงสุดในหน้า
ทั้ง section สว่างและมืด) เขียน `cro-report.md`: score ต่อหมวด · top 5 ดี · top 5 ควรแก้เรียงตาม
impact · quick wins → **ทำ quick wins ให้เสร็จก่อนส่งให้ตรวจ** แล้ว push ใหม่ให้ preview อัปเดต

> ## 🔴 GATE D — ตรวจ landing page + CRO
> update `_progress.md` แล้ว**หยุดรอคนตรวจ** ต้องส่งให้ครบ 3 อย่าง:
> 1. **preview URL ที่กดเข้าไปดูได้จริง** (ยืนยันว่าเปิดขึ้นแล้ว ไม่ใช่ 404/302 ก่อนส่งให้)
> 2. **`cro-report.md`** — score + top 5 ควรแก้เรียงตาม impact
> 3. **quick wins ที่ทำไปแล้ว** vs **ที่เหลือและเหตุผลที่ยังไม่ทำ**
>
> บอกให้ชัดว่าอะไรบน preview ยัง**ใช้ไม่ได้** (เช่นปุ่มจ่ายเงิน ถ้า env ยังไม่ครบใน Vercel)
> — ห้ามปล่อยให้คนตรวจเข้าใจว่าทุกอย่างพร้อมแล้ว
>
> **approve แล้ว → commit + push ทันที** แล้วจึงขึ้น production ที่ Stop 5c

## Stop 5c — ขึ้น production

- merge branch เข้า default branch (หรือ promote deployment ใน Vercel) → production build
- ยืนยันด้วย `curl [production URL]/api/health` → ต้องได้ `envReady: true`
  และ `catalogs` มี slug ของหน้านี้ · ถ้า `envReady: false` ให้บอกว่าขาด env ตัวไหนใน **Vercel**
- เปิดหน้า production จริงเช็คว่ารูปขึ้นครบ ไม่ใช่ 404

> ## 🔴 GATE E — ตรวจของที่ published แล้ว
> **หยุดรอคนตรวจ** ส่งให้:
> 1. **production URL** ของหน้านั้น (`[domain]/[slug]`) — กดเข้าไปดูได้
> 2. ผล `/api/health` (`envReady` · `catalogs`)
> 3. สิ่งที่ยังต้องทำเองใน dashboard ถ้ามี (env vars, Stripe webhook endpoint)
>
> **approve แล้ว → commit + push** แล้วไปต่อที่ test lead:
> `node scripts/test-lead.mjs --url [production URL]`

---

## Never

- ห้าม hardcode API key/token ในไฟล์ใดๆ — อ่านจาก env เท่านั้น
- ห้ามเชื่อราคาที่ browser ส่งมา
- ห้ามใส่ testimonial/ตัวเลขที่แต่งขึ้นสำหรับแบรนด์จริง
- ห้าม glass morphism · ห้าม gradient ม่วง-ชมพู · ห้าม emoji แทนรูปคน
- ห้ามข้าม stop point เพราะ "ใกล้เสร็จแล้ว"
- **ห้ามผ่าน gate B/C/D/E เองโดยไม่มีคนตอบว่าผ่าน** — และห้ามส่ง gate D/E โดยยังไม่ได้เปิด URL
  เช็คด้วยตัวเองก่อนว่าใช้งานได้จริง
- **ห้ามเริ่มงานของ stop ถัดไปก่อน commit + push ผลของ gate ที่เพิ่งผ่าน**
