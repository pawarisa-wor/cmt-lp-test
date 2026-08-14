# Assets Plan — trial (/trial)

> **Stop 4 — ต้องให้ผู้ใช้ยืนยันค่าใช้จ่ายก่อน generate จริงทุกครั้ง** (KIE.ai คิดเงินต่อรูป)
> PromPt ทุกอันมาจาก `wireframe-copywriting.md` + `visual-guideline.md` + `moodboard.png`

---

## 1. สรุปงบและจำนวน

| Priority | คืออะไร | จำนวน | ทำเมื่อไหร่ |
|---|---|---|---|
| **P0** | ขาดไม่ได้ หน้าเพจพังถ้าไม่มี | **6 รูป** | ทำในคลาส |
| P1 | ทำให้น่าเชื่อถือขึ้น | 0 (เหลือเวลาค่อยเพิ่ม) | ถ้าเวลาเหลือ |
| P2 | มีแล้วดี | 0 | ทำที่บ้าน |
| Pixabay | icon / texture (ฟรี) | 0 | — |

```bash
node scripts/gen-images.mjs --dry-run --project trial        # ดู prompt ทั้งหมด ไม่เสียเงิน
node scripts/gen-images.mjs --priority P0 --project trial    # gen เฉพาะรูปหลัก
node scripts/gen-images.mjs --only hero-01 --project trial   # gen ทีละรูปตอนแก้
node scripts/optimize-images.mjs --project trial             # บีบหลัง gen
```

---

## 2. กฎที่ใช้กับทุกรูป (จาก visual-guideline.md)

**ใคร**: คนไทย/SEA อายุ 22–32 · mixed gender · LGBTQ+ inclusive · **2–5 คนต่อรูปเสมอ** (ยกเว้น portrait testimonial)
**สถานการณ์**: ice bath กลุ่ม · คลาส movement mid-motion · post-workout · Bangkok urban
**แสง**: กลางวันธรรมชาติสว่างสำหรับ ice bath/dance · amber ในซาวน่า
**อารมณ์**: หัวเราะจริง กำลังคุย เปียก ผมบิน เหนื่อยแบบมีความสุข — ไม่ posed

**ห้ามมีในรูป**: stock ฝรั่งยิ้มเฟค · นายแบบกล้ามชัด · ภาพมืด/เทียน/หินซ้อน/ดอกไม้ลอยน้ำ ·
คนเดียวนั่งสมาธิ · watermark · โลโก้แบรนด์อื่น

---

## 3. ตารางรูป

| # | P | Section | filename | ratio | res | source | alt (ไทย) |
|---|---|---|---|---|---|---|---|
| 1 | P0 | Hero | `hero-01.webp` | `16:9` | 2K | KIE | กลุ่มเพื่อนไทยกำลังหัวเราะอยู่ที่อ่างแช่น้ำเย็นบนดาดฟ้ากรุงเทพ |
| 2 | P0 | Services — Grounding | `services-grounding-01.webp` | `4:3` | 1K | KIE | สองคนแช่น้ำเย็นในอ่างกลม มองหน้ากันด้วยความฮึกเหิม |
| 3 | P0 | Services — Moving | `services-moving-01.webp` | `4:3` | 1K | KIE | กลุ่มคนกำลัง movement class ยกแขนสูงผมปลิวในห้องออกกำลังกายสว่าง |
| 4 | P0 | Testimonials — มิ้นท์ | `testimonial-01.webp` | `1:1` | 1K | KIE | ภาพหน้าตรงของมิ้นท์ นักออกแบบกราฟิก อายุ 26 ปี ยิ้มสบายๆ |
| 5 | P0 | Testimonials — ปาล์ม | `testimonial-02.webp` | `1:1` | 1K | KIE | ภาพหน้าตรงของปาล์ม นักพัฒนาซอฟต์แวร์ อายุ 29 ปี |
| 6 | P0 | Testimonials — ฟ้า | `testimonial-03.webp` | `1:1` | 1K | KIE | ภาพหน้าตรงของฟ้า HR Manager อายุ 31 ปี |

**แหล่งอ้างอิง**: ราคา hero เป็น P0 ครบ = 6 รูป KIE.ai

---

## 4. Prompt ต่อรูป

*(มาจาก moodboard.png ที่ดูด้วยตา: rooftop ice bath กลุ่ม · ซาวน่า amber · dance arms-up · post-workout หัวเราะ · duotone BTS · red light therapy)*
*(+ visual-guideline.md photography direction ข้อห้ามทุกข้อ)*

---

### `hero-01.webp` — P0 · `16:9` · 2K

> Editorial lifestyle photograph, bright natural Thai daylight, midday.
> Three young Thai and Southeast Asian women (ages 23–28) standing at the edge of a large stainless steel cold plunge tub on an urban Bangkok rooftop, mid-laugh — one reaching out to touch another's arm, genuine expressions, wet hair, dark athletic swimwear.
> Background: Bangkok city skyline softly out of focus behind them, warm cream-toned rooftop terrace, modern industrial railing.
> 35mm equivalent lens, f/3.5, foreground subjects sharp, city background blurred. Color grade: warm cream highlights, cool-blue water surface reflections, bold energetic editorial tone.
> No text overlays, no watermark, NOT posed or choreographed, no fake stock smiles, no foreign-looking models, no spa candles or flower petals, no solo composition.

**Alt (ไทย):** กลุ่มเพื่อนสาวไทยกำลังหัวเราะอยู่ที่อ่างแช่น้ำเย็นบนดาดฟ้ากรุงเทพ

---

### `services-grounding-01.webp` — P0 · `4:3` · 1K

> Documentary lifestyle photograph, bright outdoor natural daylight.
> Two young Thai women (ages 24–28) and one Thai man (age 26) seated together inside a large round stainless steel cold plunge tub, shoulders above the water surface, faces showing exhilarating shock mixed with laughter, one person with hands pressed to their chest, water ripples around them.
> Background: Bangkok rooftop outdoor space, warm-toned terrace tiles, soft-focus city skyline in the distance.
> Mid-close shot, 50mm equivalent, f/4, warm highlights on skin tones, cool blue water reflections, vibrant and alive.
> No text, no watermark, NOT posed, no spa flowers or candles, no western-looking models, no dark moody tone.

**Alt (ไทย):** สองคนไทยแช่น้ำเย็นในอ่างกลมบนดาดฟ้า ยิ้มหัวเราะด้วยความฮึกเหิม

---

### `services-moving-01.webp` — P0 · `4:3` · 1K

> Editorial documentary photograph, bright natural light flooding in through floor-to-ceiling windows.
> Four young Thai and Southeast Asian women (ages 22–30), mixed body types, wearing athletic wear — sports bras, leggings, shorts — arms raised high in unison during a movement fitness class, hair flying mid-motion, wide genuine smiles of effort and joy, dynamic body positions.
> Background: modern bright fitness studio interior, polished wooden floor, light cream-painted walls, large windows with natural sunlight.
> Wide shot, 28mm equivalent, f/5.6, high energy, warm natural editorial light, color grade: clean, slightly warm tones, lifestyle magazine aesthetic.
> No text, no watermark, NOT yoga or meditation, NOT staged poses to camera, no spa aesthetic, no solo person, no western-looking models.

**Alt (ไทย):** กลุ่มผู้หญิงยกแขนขึ้นกลางคลาส movement ผมปลิวด้วยพลังงาน

---

### `testimonial-01.webp` — P0 · `1:1` · 1K (มิ้นท์, 26, Graphic Designer)

> Editorial portrait photograph, soft natural window light from the side.
> One young Thai woman, age 25–27, creative urban style — oversized graphic tee, small hoop earrings, medium-length wavy or straight black hair — genuine candid half-smile, gaze directed slightly off-camera as if in mid-conversation, not looking directly into lens.
> Background: warm cream-toned minimal interior, soft bokeh, no distracting elements.
> 50mm portrait lens, f/2.2, shallow depth of field, warm cream-to-neutral skin-tone highlights, editorial portrait color grade — not overly retouched.
> No text, no watermark, NOT stiff stock photo pose, no fake wide grin, no heavy beauty filter look, no studio seamless backdrop.

**Alt (ไทย):** ภาพหน้าตรงของมิ้นท์ กราฟิกดีไซน์เนอร์ อายุ 26 ยิ้มสบายๆ

---

### `testimonial-02.webp` — P0 · `1:1` · 1K (ปาล์ม, 29, Developer)

> Editorial portrait photograph, natural soft light from a large window.
> One young Thai man, age 27–30, casually dressed in a plain fitted t-shirt, short neat hair, relaxed genuine expression — natural candid moment, slight calm half-smile, eyes directed slightly off to the side of camera.
> Background: warm minimal interior, soft-focus light-wood surface or cream-tone wall, nothing distracting.
> 50mm portrait lens, f/2.2, shallow depth of field, warm neutral color grade, editorial documentary tone.
> No text, no watermark, NOT stiff or posed, no exaggerated grin, no studio white seamless backdrop, no gym muscle flexing, no western-looking models.

**Alt (ไทย):** ภาพหน้าตรงของปาล์ม นักพัฒนาซอฟต์แวร์อายุ 29 สีหน้าสงบและเป็นธรรมชาติ

---

### `testimonial-03.webp` — P0 · `1:1` · 1K (ฟ้า, 31, HR Manager)

> Editorial portrait photograph, bright soft natural window light from the front.
> One Thai woman, age 29–33, smart-casual style — relaxed linen blouse or simple knit top, mid-length straight or slightly wavy black hair, confident yet warm expression — genuine natural moment, subtle smile, looking slightly off the camera lens.
> Background: soft-focus warm interior, neutral cream or light off-white tone, clean and uncluttered.
> 50mm portrait lens, f/2.4, shallow depth of field, clean warm editorial color grade, professional yet approachable.
> No text, no watermark, NOT a stiff corporate HR stock photo pose, NOT overly formal, no studio seamless backdrop, no western-looking models.

**Alt (ไทย):** ภาพหน้าตรงของฟ้า HR Manager อายุ 31 ดูอบอุ่นและมั่นใจ

---

## 5. Pixabay (ฟรี — ไม่ใช้ credit)

ไม่มีสำหรับ Stop 4 ของหน้า trial — ทุกรูปเป็น KIE.ai

---

## 6. Checklist ก่อนไป Stop 5 (build หน้าเพจ)

- [ ] ไฟล์ P0 ทั้ง 6 อยู่ใน `public_pages/trial/public/assets/`
- [ ] ชื่อไฟล์ web-safe ทุกไฟล์ (ตัวเล็ก, a-z 0-9 - _)
- [ ] รัน `optimize-images.mjs` แล้วผ่านเป้าน้ำหนัก
- [ ] ไม่มีภาพที่มีตัวหนังสือ (ยกเว้น og-image ถ้ามี)
- [ ] เขียน `manifest.md` ครบ (filename · section · alt ไทย · source · size)
- [ ] รวมทุกภาพที่ใช้จริง ≤3MB
