# Offer Building — Value Equation

อ่านไฟล์นี้ตอน Stop 1 ก่อนเขียน `offer-building.md`

---

## Value Equation ($100M Offers, Alex Hormozi)

```
              Dream Outcome  ×  Perceived Likelihood of Achievement
   Value  =  ─────────────────────────────────────────────────────────
                    Time Delay  ×  Effort & Sacrifice
```

งานของเราคือ **ดันตัวเศษขึ้น กดตัวส่วนลง** โดยไม่โกหก

| ตัวแปร | คำถามที่ต้องตอบ | วิธีดันในหน้าเพจ |
|---|---|---|
| **Dream Outcome** | ลูกค้าอยากได้ผลลัพธ์อะไรในชีวิต (ไม่ใช่ตัวสินค้า) | headline พูดถึงผลลัพธ์ ไม่ใช่ feature |
| **Perceived Likelihood** | เขาจะเชื่อได้ยังไงว่ามันได้ผล *กับเขา* | testimonial ที่หน้าตาเหมือนเขา · ตัวเลขจริง · guarantee · demo/ทดลอง |
| **Time Delay** | เห็นผลเร็วแค่ไหน | "รอบแรกหลับดีคืนนั้น" · quick win ในวันแรก · จองได้พรุ่งนี้ |
| **Effort & Sacrifice** | เขาต้องออกแรง/สละอะไร | "ไม่ต้องฟิตมาก่อน" · มีทุกอย่างให้ · ฟอร์มแค่ 3 ช่อง · ยกเลิกได้ |

---

## Offer stack ที่ควรมี

1. **Core** — ตัวบริการหลัก (จาก `offers.md`)
2. **Bonus ที่ลด Time Delay** — เช่น onboarding call, starter guide, จับคู่ buddy รอบแรก
3. **Bonus ที่ลด Effort** — เช่น อุปกรณ์ให้ครบ, ตารางแนะนำ, กลุ่มไลน์ที่ถามได้
4. **Guarantee** — ยิ่งกล้ายิ่งแปลง: "รอบแรกไม่ประทับใจ คืนเงินเต็ม ไม่ต้องอธิบาย"
5. **Value anchor** — เทียบกับทางเลือกอื่นที่แพงกว่า/ช้ากว่า (ห้ามตั้งราคาปลอมมาขีดฆ่า)
6. **Urgency / scarcity** — **ต้องจริง** เช่น "รอบละ 10 คน" · "โปรจบ 31 ส.ค."
   ❌ ห้ามใส่ countdown ปลอมที่รีเซ็ตทุกครั้งที่โหลดหน้า — ผิดกฎหมายคุ้มครองผู้บริโภคและทำลายแบรนด์

---

## Hero offer selection

เลือก 1 ตัวเป็นพระเอกของหน้า — ปกติคือ **ตัวที่กำแพงการตัดสินใจต่ำสุดแต่ยังได้ประสบการณ์ครบ**
(trial / first session / starter pack) เพราะโจทย์ของหน้านี้คือ **เก็บ lead** แล้วไป upsell ทีหลัง

แพ็กเกจอื่นยังแสดงในตารางราคาได้ แต่ CTA หลักทั้งหน้าต้องชี้ไปที่ hero offer ตัวเดียว

---

## Objection → Answer map

ดึงทุกข้อจาก `context/clients.md` มาทำตาราง แล้วกระจายลงหน้าเพจ:

| ข้อลังเล | ไปอยู่ section ไหน |
|---|---|
| แพง | Pricing (value anchor) + FAQ |
| ไม่เชื่อว่าได้ผล | Testimonials + ตัวเลข + guarantee |
| กลัว/เขิน/ไม่กล้า | Problem + How it works + FAQ |
| ไม่มีเวลา | How it works (ระยะเวลา) + ตารางรอบ |
| ผูกสัญญาไหม | Pricing + FAQ |

**FAQ = objection ที่แปลงเป็นคำถาม** ไม่ใช่คำถามทั่วไปแบบ "เปิดกี่โมง" (อันนั้นไปอยู่ section ตารางรอบ)

---

## Output template — `offer-building.md`

```markdown
# Offer Building — [ชื่อโปรเจกต์]

## Hero offer
- SKU / ชื่อ / ราคา
- ทำไมเลือกตัวนี้

## Value equation
- Dream outcome:
- Perceived likelihood (proof ที่ใช้):
- Time delay (เห็นผลเมื่อไหร่):
- Effort (เราเอาอะไรออกให้เขา):

## Offer stack
1. Core:
2. Bonus (ลดเวลา):
3. Bonus (ลดแรง):
4. Guarantee:
5. Value anchor:
6. Urgency (ที่เป็นความจริง):

## Objection → answer → section
| ข้อลังเล | คำตอบ | ไปอยู่ที่ |

## แพ็กเกจอื่นที่จะโชว์ในตารางราคา
| SKU | ชื่อ | ราคา | ตำแหน่งในตาราง |
```
