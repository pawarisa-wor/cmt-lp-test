---
name: create-company-context
description: Interview the user about their brand and write the five context files that every other skill reads. Use at the very start of a project, or when the user says "สร้าง context", "กรอกข้อมูลแบรนด์", "create company context", "set up brand context", or when context/ is still empty and another skill needs brand information.
metadata:
  version: 1.0.0
---

# Create Company Context

Turn a founder's scattered brand knowledge into five structured files that every downstream skill
(`create-moodboard`, `generate-salepage`, `setup-crm`) reads as its source of truth.

**Output files** — all under `context/`:

| File | Answers |
|---|---|
| `company.md` | เราเป็นใคร ทำอะไร จุดต่าง สาขา ตัวเลขอ้างอิงได้ |
| `clients.md` | ICP, สิ่งที่เขาอยากได้จริง, pain, objections, trigger |
| `offers.md` | บริการ, แพ็กเกจ, ราคา, sku, ตารางรอบ, risk reversal, testimonials |
| `voice.md` | บุคลิก, ระดับภาษา, คำที่ใช้/ห้ามใช้, กฎการเขียน, CTA |
| `brand-identity/visual-guideline.md` | mood, palette, typography, photography direction |

---

## Rules

- **Interview in Thai. Write the files in Thai.** Section headers stay as in the templates.
- **Ask in groups, never all at once.** One group per turn, wait for the answer, then continue.
  A wall of 30 questions makes people abandon the flow.
- **Never invent facts about a real brand** — no fake numbers, no fake testimonials.
  If the user has no data for a field, write `— ยังไม่มีข้อมูล —` and move on.
  (Exception: if the user explicitly says this is a practice/mock brand, generate mock data
  and label the file clearly as สมมติ.)
- **Read the blank templates in `context/` first** and preserve their headings — the salepage
  skill navigates by them.
- If the user is stuck on a question, show 2–3 concrete examples from `context_example/`
  (GLOW SOCIETY) so they can answer by analogy instead of from a blank page.
- If the user has almost no time, tell them the **minimum viable set** is: brand name, what you
  sell, who it's for, one price, one objection, one proof point. The page can be built from that.

---

## Workflow

### Step 0 — Check what already exists

Read `context/*.md`. If files already have content, summarise what is filled vs empty and ask
whether to extend or start over. Never silently overwrite existing answers.

### Step 1 — Group A: Business core → `company.md`

Ask:
1. ชื่อแบรนด์ และขายอะไรใน 1–2 ประโยค
2. ลูกค้าเดินมาหาเราเพราะเขาแก้ปัญหาอะไรไม่ได้
3. คู่แข่งลอกอะไรของเราไม่ได้ (2–4 ข้อ)
4. สาขา/พื้นที่ให้บริการ + เวลาเปิด
5. ตัวเลขที่พูดได้จริง (ปีที่เริ่ม, จำนวนลูกค้า, จำนวนรอบ/เดือน, % กลับมาซื้อซ้ำ)

> **STOP** — เขียน `company.md` แล้วสรุปให้ดู 5 บรรทัด ถามว่าแก้อะไรไหม ก่อนไปต่อ

### Step 2 — Group B: Customer → `clients.md`

Ask:
1. ลูกค้าที่ดีที่สุดของคุณอายุเท่าไหร่ ทำงานอะไร อยู่แถวไหน
2. เขาอยากได้ **ผลลัพธ์ในชีวิต** อะไร (ไม่ใช่ตัวสินค้า)
3. ทุกวันนี้เขาหงุดหงิดกับอะไรอยู่ (ยิ่งเจาะจงยิ่งดี)
4. เหตุผลที่เขาลังเลไม่ซื้อ 3–5 ข้อ — และคุณตอบเขาว่าอะไร
5. เขาเทียบเรากับใคร/อะไร (รวม "ไม่ทำอะไรเลย")
6. อะไรทำให้เขาตัดสินใจวันนี้ ไม่ใช่เดือนหน้า

**Objections คือหัวใจ** — FAQ และ copy ครึ่งหน้าเพจมาจากตารางนี้ ถ้าผู้ใช้ตอบได้แค่ 1 ข้อ
ให้ถามต่อว่า "ลูกค้าถามอะไรซ้ำๆ ก่อนตัดสินใจ" แล้วแปลงคำถามนั้นเป็น objection

> **STOP** — เขียน `clients.md` สรุปให้ดู ก่อนไปต่อ

### Step 3 — Group C: Offer & price → `offers.md`

Ask:
1. บริการ/สินค้ามีกี่กลุ่ม แต่ละกลุ่มประกอบด้วยอะไร ได้ผลลัพธ์อะไร
2. แพ็กเกจและราคา — **ต้องเป็นตัวเลขเดียวชัดเจน** (ระบบชำระเงินต้องใช้)
3. แพ็กเกจไหนอยากดันหนักที่สุด (hero offer) และทำไม
4. ตารางเวลา/รอบให้บริการ (ถ้ามี)
5. อะไรที่ทำให้เขากล้าจ่าย (คืนเงิน, ยกเลิกได้, ครั้งแรกฟรี)
6. Testimonial อย่างน้อย 3 อัน — ชื่อ, อาชีพ, คำพูด, ผลลัพธ์ที่วัดได้

**กำหนด SKU ให้ทุกแพ็กเกจ** — ตัวพิมพ์ใหญ่ ขีดกลาง เช่น `BRAND-TRIAL`, `BRAND-MONTHLY`
SKU นี้จะถูกใช้ตรงกันทั้ง `catalog.json` → HubSpot product → Stripe price → GA4 `item_id`
ถ้าผู้ใช้ไม่กำหนด ให้เสนอ SKU แล้วขอ confirm

> **STOP** — เขียน `offers.md` แสดงตารางราคา + SKU ให้ยืนยัน ก่อนไปต่อ

### Step 4 — Group D: Voice → `voice.md`

Ask:
1. ถ้าแบรนด์เป็นคน เขาเป็นคนแบบไหน (3–5 คำ)
2. เรียกลูกค้าว่าอะไร เรียกตัวเองว่าอะไร
3. ระดับภาษา: ทางการ / กึ่งทางการ / เพื่อนคุยกัน / กวนๆ
4. คำที่แบรนด์พูดบ่อย และ **คำที่ห้ามใช้เด็ดขาด**
5. ขอตัวอย่างประโยคที่ "ใช่เลย" 1 ประโยค และ "ไม่ใช่แบรนด์เรา" 1 ประโยค
6. ปุ่ม CTA อยากให้พูดว่าอะไร

ถ้าผู้ใช้มีโพสต์/แคปชั่นเดิมอยู่ ขอ 2–3 ชิ้นแล้วสกัด voice ออกมาเองจะเร็วกว่าถาม

> **STOP** — เขียน `voice.md` ก่อนไปต่อ

### Step 5 — Group E: Visual → `brand-identity/visual-guideline.md`

Ask:
1. อยากให้คนเห็นหน้าเพจแล้วรู้สึกอะไร (3–5 คำ)
2. มีสีแบรนด์อยู่แล้วไหม (HEX ถ้ามี) / มีโลโก้ไหม
3. ชอบหน้าเว็บของแบรนด์ไหนเป็น reference
4. คนในรูปควรเป็นใคร (เชื้อชาติ, อายุ, กี่คนต่อรูป, อารมณ์)
5. **ภาพแบบไหนที่ห้ามใช้** (ข้อนี้สำคัญกว่าที่คิด — กันภาพ stock ที่ผิดแบรนด์)

เติมสิ่งที่ผู้ใช้ไม่รู้ด้วยการ **เสนอ** ไม่ใช่ปล่อยว่าง: เสนอ palette 5 สีพร้อม HEX,
เสนอฟอนต์ไทย 2 ตัวที่มีคาแรกเตอร์ (ห้ามเสนอ system font / Inter / Roboto / Sarabun)
แล้วให้ผู้ใช้เลือก

> **STOP** — เขียนไฟล์ แล้วเสนอว่าขั้นต่อไปคือ skill `create-moodboard` เพื่อเห็นภาพจริง

---

## Done criteria

- ทั้ง 5 ไฟล์มีเนื้อหา ไม่มีหัวข้อที่ถูกลบออก
- ทุกแพ็กเกจมี SKU + ราคาเป็นตัวเลข
- มี objection ≥ 3 ข้อ และ testimonial ≥ 3 อัน (หรือระบุชัดว่ายังไม่มี)
- บอกผู้ใช้ว่าไฟล์ไหนยังว่าง และมันจะกระทบหน้าเพจตรงไหน
