# CRO Check — ตรวจหน้าเพจก่อนส่ง

รันตอน Stop 5 หลัง build เสร็จ · output เป็น `cro-report.md`

---

## 1. Value proposition clarity (impact สูงสุด)

- [ ] อ่าน hero 5 วินาที แล้วบอกได้ว่า **ขายอะไร ให้ใคร ได้อะไร**
- [ ] headline พูดผลลัพธ์ ไม่ใช่ชื่อบริการ
- [ ] ไม่มีศัพท์ที่ลูกค้าไม่ได้ใช้เอง
- [ ] คนที่ไม่รู้จักแบรนด์เลย เข้าใจได้โดยไม่ต้อง scroll

## 2. CTA

- [ ] **ปุ่ม CTA คือสิ่งที่ contrast สูงสุดในหน้า**
- [ ] **Button contrast check ทุก section** — ไล่ทีละ section (ทั้งพื้นสว่างและพื้นเข้ม)
      ว่าปุ่มไม่กลืนพื้น · contrast ≥3:1 กับพื้นหลังที่มันวางอยู่
- [ ] ข้อความปุ่มเป็นกริยา + สิ่งที่ได้ ไม่ใช่ "ส่งข้อมูล"
- [ ] มี CTA ก่อน fold แรก และซ้ำหลังทุก section หลัก
- [ ] ไม่มี CTA แข่งกันเองใน section เดียว (เช่นปุ่มจอง + ปุ่มดาวน์โหลด คู่กัน)
- [ ] บนมือถือกดถึงง่าย (sticky CTA ถ้าหน้ายาว)

## 3. Trust & social proof

- [ ] testimonial มี **รูปจริง + ชื่อ + อาชีพ + ผลลัพธ์ที่วัดได้**
- [ ] คนใน testimonial หน้าตา/ช่วงวัยตรงกับกลุ่มเป้าหมาย
- [ ] มีตัวเลขจริงอย่างน้อย 3 ตัว และตัวเลขทุกตัวมีที่มา
- [ ] guarantee อยู่ใกล้จุดตัดสินใจ (ใต้ปุ่ม + ในตารางราคา)
- [ ] ไม่มีเคลมที่พิสูจน์ไม่ได้ / ไม่มี urgency ปลอม

## 4. Friction

- [ ] ฟอร์มมีแค่ ชื่อ/อีเมล/เบอร์ (แพ็กเกจเป็น hidden จากการ์ดที่กดมา)
- [ ] ไม่บังคับสมัครสมาชิกก่อนซื้อ
- [ ] ราคาแสดงชัด ไม่ต้องทัก LINE ถาม
- [ ] objection ทุกข้อใน `clients.md` มีคำตอบอยู่ในหน้า
- [ ] ไม่มี popup บังตอนเพิ่งเข้าหน้า
- [ ] ทุกลิงก์/ปุ่มไปที่ปลายทางที่ถูก (ไม่มี `#` ค้าง)

## 5. Visual hierarchy & scannability

- [ ] scan อ่านแค่หัวข้อ ก็เข้าใจเรื่องทั้งหน้า
- [ ] แต่ละ section หน้าตาไม่ซ้ำเป็นบล็อกเดิม
- [ ] มี visual interest ทุก section (ภาพ/พื้นสี/ลาย/accent)
- [ ] ผ่าน Anti-AI checklist ใน `design-standards.md` ทุกข้อ

## 6. Mobile (ทดสอบที่ 390px ก่อนเสมอ)

- [ ] ไม่มี horizontal scroll
- [ ] ตัวหนังสือ ≥16px · ปุ่ม ≥44px
- [ ] ตารางราคาอ่านได้ (stack เป็นการ์ด ไม่ใช่ตารางแคบ)
- [ ] ภาพไม่ยืด/ไม่บี้ (logo คง aspect ratio)
- [ ] ฟอร์มกรอกได้จริงด้วยนิ้ว ไม่ zoom เอง

## 7. Technical

- [ ] **ทุก `src`/`href` ในหน้าโหลดขึ้นจริง "จากมุมเบราว์เซอร์"** — ดึง HTML ของหน้าที่ deploy แล้ว
      เอาทุก src มา `new URL(src, [page URL])` แล้วยิงตาม path ที่ได้ · **ห้ามยิง path ที่เดาเอง**
      (relative path บนหน้าที่ไม่มี `/` ปิดท้าย จะ resolve ไป root — รูปหายทั้งหน้า และ `config.js`
      หายด้วยจน `window.SITE_CONFIG` undefined → ฟอร์มพัง แต่หน้ายัง "ดูปกติ" ถ้าดูแค่ตัวหนังสือ)
- [ ] ทุกภาพมี `alt`, `width`, `height` · below-fold มี `loading="lazy"`
- [ ] น้ำหนักรูปรวมทั้งหน้า ≤3MB
- [ ] `<head>` มี favicon + OG/Twitter meta ครบ
- [ ] event ยิงครบตาม `tracking.md` (เช็คด้วย GA4 Realtime + Pixel Helper)
- [ ] ไม่มี key/token โผล่ใน HTML/JS ฝั่ง client
- [ ] heading เรียง h1→h2→h3 ไม่ข้ามลำดับ
- [ ] `prefers-reduced-motion` ถูกเคารพ

---

## Output — `cro-report.md`

```markdown
# CRO Report — [page] · [วันที่]

## Score (1–10)
| หมวด | คะแนน | เหตุผลสั้นๆ |
|---|---|---|
| Value proposition | | |
| CTA | | |
| Trust / social proof | | |
| Friction | | |
| Visual hierarchy | | |
| Mobile | | |
| Technical | | |

## 5 อย่างที่ทำได้ดี
## 5 อย่างที่ควรแก้ (เรียงตาม impact สูง → ต่ำ)
| # | ปัญหา | ผลที่คาดว่าจะได้ | แก้ยังไง |
## Quick wins (แก้ได้ใน 5 นาที)
## Test ideas (ถ้ามี traffic พอ)
- ทดสอบ headline / offer / hero image คนละแบบ — **ไม่ต้องทดสอบสีปุ่ม**
```

เสนอ user ว่าจะให้แก้ quick wins ให้เลยไหม
