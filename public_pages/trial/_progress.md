# Progress — หน้า /trial

## สถานะปัจจุบัน

| Stop | สถานะ | หมายเหตุ |
|---|---|---|
| 0 — page folder + brief | ✅ เสร็จ | URL: `/trial` · angle: "มาคนเดียวก็ได้เพื่อน" |
| 1 — Offer building | ✅ รอ Gate B | ราคาจาก offers.md — ยังไม่มี catalog.json |
| 2 — Design guide + wireframe | ✅ รอ Gate C | design-guide.md + wireframe (ส่วน A) เสร็จ |
| 3 — Copywriting | ✅ รอ Gate C | wireframe-copywriting.md ส่วน B เสร็จ |
| 4 — Assets prep | ⏳ รอทำ | ต้องขออนุมัติค่าใช้จ่าย KIE.ai ก่อน |
| 5a — Build HTML | ⏳ รอทำ | |
| 5b — Deploy preview + CRO | ⏳ รอทำ | Gate D |
| 5c — Production | ⏳ รอทำ | Gate E |

## Context ที่ใช้

- Brand identity: `context/brand-identity/visual-guideline.md` (gate A ผ่านแล้ว)
- Moodboard prompt: `context/brand-identity/moodboard-prompt.txt`
- Voice: `context/voice.md`
- Clients: `context/clients.md`
- Offers: `context/offers.md`

## Gates

| Gate | สถานะ |
|---|---|
| A — moodboard | ✅ ผ่านแล้ว |
| B — offer | ⏳ รอตรวจ (Stop 1) |
| C — wireframe + copy | ⏳ รอตรวจ (Stop 3) |
| D — preview | ⏳ รอตรวจ (Stop 5b) |
| E — production | ⏳ รอตรวจ (Stop 5c) |

## หมายเหตุสำคัญ

- `catalog.json` ยังไม่มี — ต้องรัน `setup-crm` skill ก่อน Stop 5
- Vercel env vars ที่ผู้ใช้ต้องกรอกเอง: `HUBSPOT_PRIVATE_APP_TOKEN` · `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET`
- Stripe webhook secret: ตั้งไว้แล้วใน dashboard (production URL)
