# Progress — salepage_glow

> `generate-salepage` อัปเดตไฟล์นี้ทุก stop point (ตาม Session Rules)
> ถ้ากลับมาทำต่อวันหลัง อ่านไฟล์นี้ก่อนเพื่อรู้ว่าค้างอยู่ตรงไหน

**Project:** GLOW SOCIETY (ตัวอย่างสมมติสำหรับ workshop CMT#6)
**Context ที่ใช้:** `context_example/` (แบรนด์ตัวอย่าง)
**อัปเดตล่าสุด:** ตอนสร้าง template — ยังไม่เริ่มรัน pipeline

---

## สถานะแต่ละ stop

| Stop | ขั้นตอน | สถานะ | ไฟล์ที่ได้ |
|---|---|---|---|
| — | Template + context + skills + spec | ✅ พร้อมใช้ | `technical-setup.md`, `assets-plan.md`, `catalog.json` |
| 1 | Offer building | ⬜ ยังไม่ทำ | `offer-building.md` |
| 2 | Design guide + ASCII wireframe | ⬜ | `design-guide.md`, `wireframe.md` |
| 3 | Copywriting (ไทย) + lead form | 🟡 มี copy ตัวอย่างในหน้าเพจแล้ว แต่ยังไม่มีเอกสาร | `copywriting.md` |
| 4 | Image prep | ⬜ **ยังไม่ generate รูป** | `public/assets/*`, `manifest.md` |
| 5 | Build + wire + deploy + CRO check | 🟡 หน้าเพจ reference เขียนแล้ว ยังไม่ deploy / ยังไม่ทำ CRO report | `cro-report.md` |

## สิ่งที่มีอยู่แล้วในโปรเจกต์นี้

- `public/index.html` — หน้า salepage reference (12 section) ต่อ `/api/lead` + `/api/checkout` + tracking ครบ
- `public/thanks.html` — ยิง `purchase` (กันยิงซ้ำด้วย `session_id`)
- `public/config.js` — ที่เดียวสำหรับ GA4 ID / Pixel ID
- `api/lead.js` · `api/checkout.js` · `api/stripe-webhook.js`
- `lib/catalog.js` · `lib/hubspot.js`
- `catalog.json` — 6 offers พร้อม sku (ยังไม่มี `stripePriceId` / `hubspotProductId`)

## ต้องทำก่อนใช้งานจริง

1. `cp .env.example .env` แล้วเติม key (ดู `technical-setup.md` ส่วน B)
2. `node scripts/setup-hubspot.mjs --dry-run` → แล้วรันจริง
3. `node scripts/setup-stripe.mjs --dry-run` → แล้วรันจริง
4. `node scripts/gen-images.mjs --dry-run` → ตรวจ prompt → `--priority P0`
5. `node scripts/optimize-images.mjs`
6. ใส่ GA4 / Pixel ID ใน `public/config.js`
7. `npm install && vercel dev` → `node scripts/test-lead.mjs`
8. `vercel --prod` + ตั้ง webhook ตาม `technical-setup.md` B3

## บันทึกการตัดสินใจ

- Tone: **Playful / toy-like** + light theme — dark theme ทำให้ ice bath ดูเป็น recovery clinic ของผู้ใหญ่
- คู่สีลายเซ็น: น้ำเงินเย็น `#0F5FD9` × ส้มร้อน `#FF5A36` (= ice bath × sauna)
- ฟอนต์: Bai Jamjuree (heading) + Anuphan (body) — ฟอนต์ไทยที่มีคาแรกเตอร์ ไม่ใช้ system font
- Hero offer: `GLOW-TRIAL` 390 บาท — กำแพงตัดสินใจต่ำสุดแต่ได้ประสบการณ์ครบ
- 2 steps: เก็บ lead เข้า HubSpot ให้เสร็จก่อน แล้วจึงพาไป Stripe — ถ้าจ่ายเงินพลาด lead ไม่หาย
