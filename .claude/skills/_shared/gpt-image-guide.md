# GPT Image 2 Generation Guide (kie.ai)

ทุก skill ในโปรเจกต์นี้ generate รูปด้วย **GPT Image 2 ผ่าน kie.ai REST API** — ไม่ใช้ MCP
โค้ดจริงอยู่ที่ `scripts/kie.mjs` (Node 20+, ใช้ `fetch` built-in) — skill ไม่ต้องเขียน API call เอง
ให้เรียก `scripts/gen-images.mjs` แทน

---

## Model Selection

| สถานการณ์ | model |
|---|---|
| ไม่มีรูป reference | `gpt-image-2-text-to-image` |
| มี logo / moodboard / reference image (public URL) | `gpt-image-2-image-to-image` |

> ⚠️ image-to-image ต้องใช้ **public URL** เท่านั้น (local path ใช้ไม่ได้)
> ใน workshop นี้เราใช้ **text-to-image ล้วน** เพื่อไม่ต้องตั้ง image host

---

## Aspect Ratio + Resolution

ยึดตาม [doc ของ kie.ai](https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image) — `aspect_ratio`
รองรับ 16 ค่า:

```
auto · 1:1 · 3:2 · 2:3 · 4:3 · 3:4 · 5:4 · 4:5
16:9 · 9:16 · 2:1 · 1:2 · 3:1 · 1:3 · 21:9 · 9:21
```

`resolution` รองรับ `1K` · `2K` · `4K` (ยิ่งใหญ่ยิ่งแพงและช้า)

| ใช้งาน | ratio | resolution |
|---|---|---|
| Hero full-width | `16:9` (หรือ `21:9` ถ้าอยากเตี้ยแบน) | `2K` |
| ภาพประกอบ section | `4:3` หรือ `3:2` | `1K` |
| Portrait โค้ช / avatar | `1:1` | `1K` |
| ภาพแนวตั้งบนมือถือ | `4:5` หรือ `9:16` | `1K` |
| Moodboard | `9:16` | `2K` |
| OG thumbnail (1200×630) | `1.91:1 ≈` ใช้ `2:1` แล้ว resize | `2K` |

`scripts/gen-images.mjs` จะ **error ทันที** ถ้าเจอ ratio นอกลิสต์ 16 ค่านี้ หรือ resolution
นอก 1K/2K/4K — ป้องกันยิง API เสียเปล่า

---

## ภาษาไทยในรูป

GPT Image 2 **render ภาษาไทยได้ถูกต้อง** ใส่ข้อความไทยใน prompt ได้ตรงๆ
ไม่ต้องแยก text layer, ไม่ต้อง composite ด้วย Pillow

**แต่บนหน้าเพจ**: headline/body copy ต้องเป็น HTML text (แก้ง่าย, SEO ได้, ไม่เบลอ)
ใส่ตัวหนังสือในรูปเฉพาะ **OG thumbnail** และ **moodboard** เท่านั้น

---

## Flow

```
POST https://api.kie.ai/api/v1/jobs/createTask
  Authorization: Bearer $KIE_API_KEY
  { "model": "...", "input": { "prompt": "...", "aspect_ratio": "16:9" } }
  → data.taskId

GET  https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...
  → data.state: waiting | queuing | generating | success | fail
  → เมื่อ success: JSON.parse(data.resultJson).resultUrls[0]
```

poll ทุก **30 วินาที** · text-to-image ใช้เวลา ~30–90 วินาที

---

## Error Codes

| Code | ความหมาย | วิธีแก้ |
|---|---|---|
| `401` | API key ผิด | เช็ค `KIE_API_KEY` ใน `.env` |
| `402` | เครดิตหมด | เติมที่ https://kie.ai (ในคลาสให้แจ้งผู้สอน) |
| `429` | Rate limit | รอ 60 วินาทีแล้ว retry |
| `5xx` | Server error | รอ 30 วินาที retry ไม่เกิน 3 ครั้ง |

---

## กฎการใช้ในคลาส (สำคัญ — มีค่าใช้จ่ายต่อรูป)

1. **ต้องสรุปจำนวนรูป + prompt ให้ผู้ใช้ยืนยันก่อน** ทุกครั้ง
2. รัน `--dry-run` ก่อนเสมอ → เห็น prompt ทั้งหมดโดยไม่เสียเงิน
3. gen ทีละกลุ่มด้วย `--only hero` / `--only coach` ไม่ต้องยิงทั้ง 16 รูปรอบเดียว
4. ถ้ารูปไม่ถูกใจ ให้แก้ prompt ใน `assets-plan.md` แล้ว gen ซ้ำเฉพาะตัวนั้น (`--only hero-01`)

## Output convention

```
workspace/salepage_[PROJECT]/public/assets/[section]-[NN].webp
context/brand-identity/moodboard.png
```

ทุกไฟล์ต้องผ่าน `scripts/optimize-images.mjs` ก่อนใช้บนหน้าเพจ
