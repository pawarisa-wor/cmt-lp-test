# Image Manifest — salepage_glow

> อัปเดตไฟล์นี้ทุกครั้งที่เพิ่ม/เปลี่ยนรูป — `generate-salepage` Stop 5 อ่านไฟล์นี้ก่อนเขียน HTML
> แผน + prompt ทั้งหมดอยู่ใน `../../assets-plan.md` · เวอร์ชันที่ script อ่านคือ `../../assets.json`

**สถานะ: ยังไม่ได้ generate** — หน้าเพจจะแสดงกล่อง placeholder แทนรูปที่ยังไม่มี (layout ไม่พัง)

| Filename | Section | Alt text (ไทย) | Source | ขนาดเป้า | สถานะ |
|---|---|---|---|---|---|
| `hero-01.webp` | Hero | กลุ่มเพื่อน 4 คนหัวเราะรอบอ่าง ice bath ที่ GLOW SOCIETY | KIE 16:9 2K | 1400px ≤200KB | ⬜ ยังไม่ gen |
| `ground-01.webp` | Services — Grounding | ผู้หญิงกำลังแช่ ice bath โดยมี host นับเวลาให้ข้างอ่าง | KIE 4:3 1K | 800px ≤150KB | ⬜ |
| `move-01.webp` | Services — Moving | คลาสเต้นแอโรบิคที่คนเต้นกันสนุกเต็มห้อง | KIE 4:3 1K | 800px ≤150KB | ⬜ |
| `community-01.webp` | Testimonials (ภาพหมู่) | สมาชิก GLOW SOCIETY ถ่ายรูปหมู่หลังจบรอบ | KIE 16:9 1K | 800px ≤150KB | ⬜ |
| `testi-01.webp` | Testimonials | รูปโปรไฟล์ของมิ้นท์ สมาชิก GLOW SOCIETY | KIE 1:1 1K | 256px ≤30KB | ⬜ |
| `testi-02.webp` | Testimonials | รูปโปรไฟล์ของปาล์ม สมาชิก GLOW SOCIETY | KIE 1:1 1K | 256px ≤30KB | ⬜ |
| `testi-03.webp` | Testimonials | รูปโปรไฟล์ของจูน สมาชิก GLOW SOCIETY | KIE 1:1 1K | 256px ≤30KB | ⬜ |
| `og-image.jpg` | `<head>` OG/Twitter | GLOW SOCIETY — รีเซ็ตแล้วได้เพื่อนกลับบ้าน | KIE 2:1 2K | 1200×630 ≤200KB | ⬜ |
| `favicon.png` | `<head>` favicon | — | crop จากโลโก้/hero | 32×32 | ⬜ |

## P1 / P2 (ยังไม่ถูกอ้างอิงใน index.html — เพิ่ม section ได้ถ้า gen แล้ว)

| Filename | Section | Alt text | สถานะ |
|---|---|---|---|
| `ground-02.webp` | Grounding — sauna | กลุ่มสมาชิกนั่งคุยกันในห้อง sauna | ⬜ P1 |
| `ground-03.webp` | Grounding — red light | ห้อง red light therapy ของ GLOW SOCIETY | ⬜ P1 |
| `move-02.webp` | Moving — hyrox | โซน hyrox กำลังมีคนซ้อม sled push และ ski erg | ⬜ P1 |
| `testi-04.webp` | Testimonials | รูปโปรไฟล์ของฟ้า สมาชิก GLOW SOCIETY | ⬜ P1 |
| `coach-01..03.webp` | Coaches | โค้ช Grounding / คลาสเต้น / Hyrox | ⬜ P1 |
| `location-01/02.webp` | Locations | บรรยากาศสาขาทองหล่อ / สาทร | ⬜ P2 |
| `community-02.webp` | Social Night | บรรยากาศ Social Night ทุกคืนวันศุกร์ | ⬜ P2 |

## Checklist

- [ ] ทุกไฟล์ P0 มีอยู่จริงในโฟลเดอร์นี้
- [ ] ชื่อไฟล์ web-safe (ตัวเล็ก ไม่มีเว้นวรรค ไม่มีอักษรไทย)
- [ ] รัน `node scripts/optimize-images.mjs --report` แล้วผ่านเป้าทุกไฟล์
- [ ] รวมทุกไฟล์ที่ใช้บนหน้าเพจ ≤3MB
- [ ] `og-image.jpg` = 1200×630 · `favicon.png` = 32×32
- [ ] alt text ทุกภาพเป็นภาษาไทยและสื่อความหมายจริง (ไม่ใช่ "image1")
