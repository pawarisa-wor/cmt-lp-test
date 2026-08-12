# Design Standards — Salepage

อ่านไฟล์นี้ตอน Stop 2 (design guide) และใช้ตรวจตอน Stop 5 (build)

---

## 1. เลือก tone แล้วทุ่มสุดตัว

เลือก **1 ทิศทาง** แล้วทำให้สุด — ครึ่งๆ กลางๆ คือสาเหตุที่หน้าเพจดู "AI ทำ"

| Direction | ลักษณะ | เหมาะกับ |
|---|---|---|
| Brutally minimal | เหลือแต่แก่น typography ใหญ่ whitespace มหาศาล | luxury / premium |
| Maximalist | ซ้อนทับ แน่น สีจัด รวยรายละเอียด | แบรนด์วัยรุ่น / creative |
| Retro-futuristic | vintage ปน sci-fi | tech / innovation |
| Organic / natural | ขอบนุ่ม สีดิน เท็กซ์เจอร์ธรรมชาติ | wellness / lifestyle |
| Luxury / refined | spacing หรู typography พรีเมียม | high-ticket |
| Playful / toy-like | สีสด มุมกลม สนุก | B2C / youth |
| Editorial / magazine | ลำดับ typography ชัด layout ไม่สมมาตร | education / content |
| Brutalist / raw | โครงเปลือย contrast แรง | indie / alternative |
| Art deco / geometric | ลายเรขาคณิต accent เมทัลลิก | fashion / event |
| Soft / pastel | ไล่สีนุ่ม โทนหวาน | coaching / calm |
| Industrial | ฟังก์ชันจัด ไม่ประดิษฐ์ | B2B / tools |

## 2. Anti-AI checklist (ต้องผ่านทุกข้อก่อนส่ง)

- [ ] หน้านี้ดูเหมือน AI generate หรือเปล่า → ถ้าใช่ ออกแบบใหม่
- [ ] ฟอนต์มีคาแรกเตอร์จริง (ไม่ใช่ Inter/Roboto/Arial/Helvetica/system-ui/Sarabun)
- [ ] palette ไม่ใช่ SaaS blue `#3B82F6` และไม่ใช่ gradient ม่วง-ชมพูบนพื้นขาว
- [ ] แต่ละ section หน้าตาไม่ซ้ำกันเป็นบล็อกเดิม
- [ ] มี texture / depth / atmosphere ไม่แบนโล่ง
- [ ] hero หยุดสายตาคนได้จริง
- [ ] **ไม่มี glass morphism**

## 3. Color

- **Base 4–5 สี**: background · surface (การ์ด/ฟอร์ม) · border · ink · ink-muted
- **Accent 1–3 สี**: CTA (ต้อง contrast สูงสุดในหน้า) · hover · highlight
- hover = เข้มขึ้น 10–15% · focus = ring สี accent · disabled = opacity 40–50%
- ห้าม: text contrast ต่ำบนพื้นลาย, สีรุ้งไร้เหตุผล
- สร้างบรรยากาศด้วย: gradient mesh, noise/grain 2–4%, เงาลึก, ลายจุด/เส้นบางๆ

## 4. Typography

- Headline: อารมณ์ มีบุคลิก **คาดไม่ถึง** — บุคลิกมาก่อนความอ่านง่าย
- Body: อ่านง่ายที่สุด
- ใช้ไม่เกิน 2–3 typeface
- **ฟอนต์ไทยที่แนะนำ** (มีใน Google Fonts, มีคาแรกเตอร์): `Bai Jamjuree`, `Anuphan`,
  `IBM Plex Sans Thai`, `Noto Serif Thai`, `Mitr`, `Kanit` (Kanit ใช้ได้แต่เกลื่อน — ระวัง)
- Scale **1.333x** (perfect fourth):
  `9 · 12 · 16 · 21 · 28 · 38 · 51 · 67 · 90 px`
- line-height 1.5–1.6 (body) · 1.1–1.2 (headline) · บรรทัดยาว 45–75 ตัวอักษร
- letter-spacing: headline แคบลง (-0.02 ถึง -0.05em) · ตัวเล็กกว้างขึ้น (+0.01 ถึง +0.03em)
- responsive ด้วย `clamp()`:
  ```css
  h1 { font-size: clamp(2rem, 5vw, 4.2rem); }
  h2 { font-size: clamp(1.5rem, 3.5vw, 2.4rem); }
  ```

## 5. Spacing & layout

- base 4px → `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`
- 12-column grid · container 1200px (content) / 1440px (full-width)
- gutter 16 (มือถือ) / 24 (แท็บเล็ต) / 32 (เดสก์ท็อป)
- section padding 64px (มือถือ) → 96–128px (เดสก์ท็อป)
- breakpoints: `<640` 1 คอลัมน์ · `640–1024` 2 คอลัมน์ · `>1024` เต็ม layout

## 6. Components

- **CTA**: สูง ≥48px · padding ข้าง 24–48px · ข้อความเป็นกริยาชัด ("จองรอบแรก 390 บาท")
  · hover เข้ม 10% · active scale .98 · focus ring
- **Testimonial card**: รูปวงกลม/มุมโค้ง 48–64px · ชื่อ + อาชีพ + ผลลัพธ์ · พื้นต่างจาก section
- **Pricing**: highlight ตัวที่อยากขาย (scale/border/badge) · value anchor · ปุ่มอยู่ในการ์ด
- **FAQ**: accordion คลิกได้ทั้งแถบ · animation 200–300ms · keyboard ใช้ได้
- **Section divider**: ห้ามใช้เส้นตรงเปล่าๆ — ใช้สลับพื้นสี, clip-path เอียง, wave SVG, หรือ glow orb

## 7. Motion

- micro-interaction 100–200ms · transition 200–400ms · scroll reveal 300–600ms
- easing default `cubic-bezier(.4,0,.2,1)`
- fade-in-up ระยะ 20–40px · stagger 50–100ms
- ห้าม: animation ที่ขัดการกดปุ่ม, bounce เยอะ, autoplay วิดีโอมีเสียง, ใส่ animation ทุกชิ้น
- เคารพ `prefers-reduced-motion`

## 8. Accessibility (WCAG AA)

- contrast ตัวหนังสือปกติ ≥4.5:1 · ตัวใหญ่ ≥3:1 · UI/graphic ≥3:1
- touch target ≥44×44px · focus state มองเห็นได้ทุกชิ้น · tab order ถูกต้อง
- heading เรียง h1→h2→h3 · `alt` ทุกภาพที่มีความหมาย
- form: `<label>` ผูกกับ input ทุกช่อง · error ไม่สื่อด้วยสีอย่างเดียว
- ห้ามใช้สีเดียวสื่อความหมาย (เช่น "การ์ดสีเขียวคือแนะนำ" ต้องมีคำกำกับ)
