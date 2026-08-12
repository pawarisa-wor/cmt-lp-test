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

## Session Rules (MANDATORY)

**Never run more than one stop-point in a single turn.** Finish it, update `_progress.md`,
show the deliverable, then STOP and wait for the user to say ต่อ / next.

Running the whole pipeline in one turn causes long silent turns and burns image credits on
work the user hasn't approved yet.

Stop เหล่านี้ map ตรงกับ **Workshop Steps** ในบรีฟ (Offer Building → ASCII wireframe →
Copywriting → Assets prep → Create landing page with HubSpot connection → Hosting on Vercel):

| Stop | Workshop step | Deliverable |
|---|---|---|
| 0 | เตรียม project folder | `workspace/salepage_[ชื่อโปรเจกต์]/` + `_progress.md` |
| 1 | **Offer Building** | `offer-building.md` |
| 2 | Design guide + **ASCII wireframe** | `design-guide.md` + `wireframe.md` |
| 3 | **Copywriting** (ไทย) + lead-form spec | `copywriting.md` |
| 4 | **Assets prep** | `assets-plan.md` (เติมแล้ว) + `assets.json` + รูปครบ + `manifest.md` |
| 5 | **Create landing page + HubSpot connection → Hosting on Vercel** | หน้าเพจ live + `cro-report.md` |

หลังจบ Stop 5 → **Test lead** ด้วย `node scripts/test-lead.mjs`

### ต้องมีอะไรก่อนเริ่ม (ห้ามข้าม)

| ต้องมี | ได้จาก | ถ้ายังไม่มี |
|---|---|---|
| `context/{company,clients,offers}.md` มีข้อมูลจริง | ผู้ใช้กรอกเอง หรือ `cp -r context_example/. context/` | หยุด — ขั้นถัดไปจะเดาข้อมูลแบรนด์เอง |
| **`context/brand-identity/moodboard.png` + `visual-guideline.md` + `context/voice.md`** | skill `create-moodboard` | **หยุดแล้วเรียก `create-moodboard` ก่อน** |
| `catalog.json` (offers/ราคา/sku) | skill `setup-crm` | ทำ Stop 1–4 ได้ แต่ **Stop 5 ต้องมี** |

**หน้าเพจต้อง follow brand identity ที่สร้างไว้** — palette, ฟอนต์, photography direction และ
โทน copy ทุกบรรทัดมาจาก `visual-guideline.md` + `voice.md` ห้ามคิดสี/ฟอนต์/โทนใหม่เอง
ถ้าเห็นว่า guideline ขัดกับสิ่งที่ควรทำ ให้เสนอแก้ที่ guideline ก่อน แล้วค่อยทำหน้าเพจตามนั้น

---

## Stop 0 — เตรียม project folder

```bash
cp -r "workspace/salepage_[PROJECT]" workspace/salepage_[ชื่อโปรเจกต์]
```

template folder มีแค่ `technical-setup.md` + `assets-plan.md` (โครงเปล่า) — ที่เหลือเราสร้างกันตาม stop
สร้าง `_progress.md` แล้วบันทึกว่ากำลังทำ project ไหน ใช้ context อะไร

> **STOP** — บอกชื่อโฟลเดอร์ที่สร้าง แล้วถามว่าเริ่ม Stop 1 เลยไหม

## Stop 1 — Context + Offer building

1. Read **all** of: `context/company.md`, `clients.md`, `offers.md`, `voice.md`,
   `brand-identity/visual-guideline.md`, plus this project's `technical-setup.md`
   (และ `catalog.json` ถ้ามีแล้ว).
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

> **STOP** — create/update `_progress.md`, show the offer in ~10 lines, ask for approval.

## Stop 2 — Design guide + wireframe

Read `references/design-standards.md` first.

1. **Recommend** a theme (light/dark) and one **tone** from the 11 directions, with a one-line reason
   tied to the brand voice. Ask the user to confirm — commit fully to it, no half measures.
2. Write `design-guide.md`: palette with roles + HEX · type pair (Thai-capable, characterful —
   **never** Inter/Roboto/Arial/system-ui/Sarabun as primary) · 1.333x scale · 4px spacing rhythm ·
   component specs (CTA, card, pricing table, FAQ accordion, form) · per-section visual treatment ·
   section divider style · texture/depth decisions.
3. Write `wireframe.md` as an **ASCII lo-fi wireframe** in this section order:

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

> **STOP** — update `_progress.md`, show the wireframe, ask for approval.

## Stop 3 — Copywriting

Read `references/copywriting.md` and `references/lead-form.md`.

- Write every line in **Thai**, obeying `voice.md` (คำที่ห้ามใช้ = ห้ามจริงๆ)
- Specific beats clever: "รอบละไม่เกิน 10 คน" ไม่ใช่ "รอบเล็กอบอุ่น"
- One idea per section. Benefit first, feature second.
- Hero must answer in 5 seconds: นี่คืออะไร · ฉันได้อะไร · ต้องทำอะไรต่อ
- FAQ = objections from `clients.md`, answered honestly
- Include image references and every data point inline — Stop 5 builds from this file only
- Specify the **lead form**: 3 ช่องเท่านั้น (**ชื่อ · อีเมล · เบอร์โทร**) + `sku` เป็น hidden field
  จากการ์ดราคาที่กดมา + ข้อความปุ่ม + error message ไทยทีละช่อง + state หลังส่งสำเร็จ

Save `copywriting.md`.

> **STOP** — update `_progress.md`, show the copy, ask for approval.

## Stop 4 — Assets prep

Read `assets-plan.md` (โครงเปล่าใน project folder) และ `../../.claude/skills/_shared/gpt-image-guide.md`
**Images cost money per generation — confirm the list and prompts with the user before generating.**

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

> **STOP** — update `_progress.md`, show the manifest, ask for approval.

## Stop 5 — Create landing page + HubSpot connection → Hosting on Vercel

Read `references/project-scaffold.md` **ก่อน** (มี pattern ที่ทดสอบแล้วของทุกไฟล์ที่ต้องสร้าง —
ไม่ต้องคิดโครงใหม่) แล้วอ่าน `manifest.md`, `design-guide.md`, `copywriting.md`,
`technical-setup.md`, `references/tracking.md`, `references/cro-check.md`

**ต้องมี `catalog.json` ก่อน** — ถ้ายังไม่มี ให้หยุดแล้วรัน skill `setup-crm` ก่อน

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

**Deploy:**
```bash
cd workspace/salepage_[PROJECT]
vercel link && vercel env add …   # ทุก key ที่ใช้
vercel --prod
```

**CRO check** — run `references/cro-check.md` against the built page, including the
**button contrast check on every section** (CTA must be the highest-contrast element on the page in
both light and dark sections). Write `cro-report.md`: score per category, top 5 ดี, top 5 ควรแก้
เรียงตาม impact, quick wins. Then offer to apply the quick wins.

> **STOP** — update `_progress.md`, give the live URL + report, ask what to revise.

---

## Never

- ห้าม hardcode API key/token ในไฟล์ใดๆ — อ่านจาก env เท่านั้น
- ห้ามเชื่อราคาที่ browser ส่งมา
- ห้ามใส่ testimonial/ตัวเลขที่แต่งขึ้นสำหรับแบรนด์จริง
- ห้าม glass morphism · ห้าม gradient ม่วง-ชมพู · ห้าม emoji แทนรูปคน
- ห้ามข้าม stop point เพราะ "ใกล้เสร็จแล้ว"
