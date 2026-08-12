# Visual Guideline — GLOW SOCIETY

> ข้อมูลสมมติสำหรับ workshop

## Mood ที่ต้องการ

สดใส · มีชีวิตชีวา · เหมือนเช้าวันเสาร์ที่อากาศดี · วัยรุ่นแต่ไม่เด็ก · social ไม่ใช่สปา

**Tone direction (จาก 11 แบบใน `references/design-standards.md`): Playful / toy-like**
ผสม accent แบบ **Maximalist** เล็กน้อยที่ section community — เพราะแบรนด์ขาย "ความสนุกแบบกลุ่ม"
ไม่ใช่ "ความสงบส่วนตัว" (ถ้าเลือก Soft/pastel หรือ Organic จะกลายเป็นสปาทันที = ผิดโจทย์)

**Theme: White (light) theme** — เพราะ dark theme ทำให้ ice bath/sauna ดูเป็น recovery clinic
ของผู้ใหญ่ ส่วน light theme + สีจัด ให้ความรู้สึกกลางวัน มีพลัง และดูอายุน้อยกว่า

## สี

| บทบาท | HEX | ใช้ที่ไหน |
|---|---|---|
| Primary | `#0F5FD9` | ปุ่ม CTA หลัก, ไอคอน Grounding — น้ำเงินอิเล็กทริก (สื่อ ice/cold) |
| Accent (hot) | `#FF5A36` | badge, urgency, ไอคอน Moving, hover — ส้มแดง (สื่อ sauna/heat/energy) |
| Accent (glow) | `#FFD84D` | highlight, underline marker, ดาว rating |
| Ink | `#111418` | ตัวหนังสือหลัก |
| Ink muted | `#5C6570` | ตัวหนังสือรอง |
| Surface | `#FFFFFF` | การ์ด, ฟอร์ม |
| Surface tint | `#F2F6FF` | พื้น section สลับ (ฟ้าจางมาก) |
| Surface warm | `#FFF4EF` | พื้น section sauna/community |

**คู่สีที่เป็นลายเซ็นแบรนด์: น้ำเงินเย็น × ส้มร้อน** — สะท้อน ice bath × sauna ตรงตัว
ห้ามใช้: SaaS blue `#3B82F6`, purple gradient บนพื้นขาว, เขียว sage/beige แบบสปา (ทำให้ดูแก่)

## Typography

- **Headline: `Bai Jamjuree`** (700/600) — ฟอนต์ไทยทรงเหลี่ยม มีคาแรกเตอร์ ดูสปอร์ต ไม่ใช่ system font
- **Body: `Anuphan`** (400/500) — อ่านง่ายบนมือถือ ทรงโมเดิร์น
- **Accent/ตัวเลข: `Bai Jamjuree` 700 italic** สำหรับราคาและตัวเลขสถิติ
- Scale 1.333x (perfect fourth) · headline line-height 1.15 · body 1.6
- ห้ามใช้เป็นฟอนต์หลัก: Inter, Roboto, Arial, Helvetica, Space Grotesk, system-ui, Sarabun (ราชการเกิน)

## ลักษณะรูปที่ใช้ได้

- **ประเภท**: ถ่ายจริงแนว lifestyle / documentary — เหมือนเพื่อนถ่ายให้ ไม่ใช่ studio จัดแสง
- **แสง**: กลางวันธรรมชาติ สว่าง มี highlight ที่ผิว · sauna ใช้แสงอุ่นจากไม้ · ice bath ใช้แสงฟ้าสว่าง
- **คนในรูป**: คนไทย/เอเชียตะวันออกเฉียงใต้ อายุ 22–32 · เน้นผู้หญิงและ LGBTQ+ ·
  ส่วนใหญ่ **2–5 คนต่อรูป** (สื่อ community) · มีรูปเดี่ยวได้เฉพาะ portrait โค้ช
- **อารมณ์**: หัวเราะจริง กำลังคุยกัน ตัวเปียก ผมเปียก เหนื่อยแบบมีความสุข
  ห้ามยิ้มค้างเข้ากล้องแบบ stock

## ลักษณะรูปที่ห้ามใช้

- stock ฝรั่งยิ้มเฟค / นายแบบนางแบบฟิตเนสกล้ามชัด
- ภาพมืด สปา เทียน หินซ้อน ดอกไม้ลอยน้ำ (โทนผู้ใหญ่ 40+)
- ภาพคนเดียวนั่งสมาธิเงียบๆ (ขัดกับ community positioning)
- ภาพที่มี watermark หรือโลโก้แบรนด์อื่น

## องค์ประกอบ UI

- **Radius**: 20px (การ์ด) · 999px (ปุ่ม, badge, pill) — ความกลมสื่อ playful
- **Shadow**: `0 12px 32px rgba(15,95,217,.14)` สำหรับการ์ดลอย · ปุ่มใช้เงาสีเดียวกับปุ่มเข้มขึ้น
- **Spacing**: base 4px → 8/12/16/24/32/48/64/96 · section padding 64px (มือถือ) / 96–128px (จอใหญ่)
- **Section divider**: ไม่ใช้เส้นตรง — ใช้สลับพื้นสี + วงกลมสี blur (glow orb) ตกแต่งมุม
- **Texture**: noise overlay จางๆ 3% บน section hero และ community กันภาพแบนเรียบ
- ห้าม glass morphism · ห้าม gradient ม่วง-ชมพูแบบ AI-generated

## Moodboard

- **`moodboard.png`** — ยังไม่ได้ generate (ต้องมี `KIE_API_KEY` ก่อน)
  prompt ที่ประกอบเสร็จแล้วอยู่ที่ `moodboard-prompt.txt` ในโฟลเดอร์เดียวกัน สร้างได้ 2 ทาง:

  ```bash
  # (ก) ใช้ prompt ของตัวอย่างนี้ตรงๆ
  node scripts/gen-images.mjs --moodboard \
    --prompt-file context_example/brand-identity/moodboard-prompt.txt --dry-run

  # (ข) copy ตัวอย่างทั้งชุดไปเป็น context ของเราก่อน แล้วรันสั้นๆ
  cp -r context_example/. context/
  node scripts/gen-images.mjs --moodboard --dry-run   # ดู prompt ก่อน
  node scripts/gen-images.mjs --moodboard             # ยิงจริง (9:16, 2K)
  ```

  ตัดคำว่า `--dry-run` ออกเมื่อพอใจกับ prompt แล้ว (💰 คิดเงินต่อรูป)
- สไตล์ที่เลือกสำหรับแบรนด์นี้: **A) Flowing** (editorial ซ้อนทับ ดูมีชีวิต) มากกว่า bento grid
