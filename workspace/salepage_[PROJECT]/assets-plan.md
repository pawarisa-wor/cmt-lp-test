# Assets Plan — salepage_[PROJECT]

> **โครงเปล่า** — `generate-salepage` Stop 4 จะเติมไฟล์นี้จาก `wireframe.md` + `context/brand-identity/visual-guideline.md`
> **ต้องให้ผู้ใช้ review ก่อน generate จริงทุกครั้ง** (KIE.ai คิดเงินต่อรูป)
> เสร็จแล้วแปลงเป็น `assets.json` ให้ `scripts/gen-images.mjs` อ่าน

---

## 1. สรุปงบและจำนวน

| Priority | คืออะไร | จำนวน | ทำเมื่อไหร่ |
|---|---|---|---|
| **P0** | ขาดไม่ได้ หน้าเพจพังถ้าไม่มี | ตั้งเป้า ≤8 รูป | ทำในคลาส |
| **P1** | ทำให้น่าเชื่อถือขึ้นชัดเจน | | ถ้าเวลาเหลือ |
| **P2** | มีแล้วดี ไม่มีก็ยังขายได้ | | ทำที่บ้าน |
| **Pixabay** | icon / texture / graphic (ฟรี) | | ได้เลย |

```bash
node scripts/gen-images.mjs --dry-run           # ดู prompt ทั้งหมด ไม่เสียเงิน
node scripts/gen-images.mjs --priority P0       # gen เฉพาะรูปหลัก
node scripts/gen-images.mjs --only hero-01      # gen ทีละรูปตอนแก้
node scripts/fetch-stock.mjs --plan             # ดึง Pixabay ตามลิสต์ (ฟรี)
node scripts/optimize-images.mjs                # ย่อ/บีบให้ผ่านเป้า
```

## 2. กฎที่ใช้กับทุกรูป

**Photography direction:** ดึงมาจาก `context/brand-identity/visual-guideline.md` ทั้งหมด —
ใคร (เชื้อชาติ/อายุ/กี่คนต่อรูป) · แสง · อารมณ์ · สไตล์

**ห้ามมีในรูป:** (ดึงจาก "ลักษณะรูปที่ห้ามใช้" ใน visual-guideline) + watermark + โลโก้แบรนด์อื่น

**ตัวหนังสือในภาพ:** GPT Image 2 เขียนไทยได้ถูกต้อง แต่บนหน้าเพจใช้ HTML text
(แก้ง่าย ไม่เบลอ SEO ได้) → ใส่ข้อความในภาพเฉพาะ **og-image** และ **moodboard**

**Aspect ratio ที่ยิงได้** (ตาม doc kie.ai):
`auto · 1:1 · 3:2 · 2:3 · 4:3 · 3:4 · 5:4 · 4:5 · 16:9 · 9:16 · 2:1 · 1:2 · 3:1 · 1:3 · 21:9 · 9:21`
**resolution:** `1K` · `2K` · `4K`

**เป้าน้ำหนักไฟล์:** hero ≤200KB @1400px · section ≤150KB @800px · card ≤80KB @400px ·
avatar ≤30KB @256px · **รวมทั้งหน้า ≤3MB**

**ชื่อไฟล์:** `[section]-[NN].webp` — ตัวเล็ก, a-z 0-9 - _ เท่านั้น, ห้ามอักษรไทย/เว้นวรรค

## 3. ตารางรูป

| # | P | Section | filename | ratio | res | เป้าไฟล์ | source |
|---|---|---|---|---|---|---|---|
| 1 | P0 | Hero | `hero-01.webp` | `16:9` | 2K | 1400px ≤200KB | KIE |
| 2 | P0 | | | | | | |
| 3 | | | | | | | |

**source:** `KIE` = generate ด้วย GPT Image 2 · `Pixabay` = ดึงฟรี · `มีแล้ว` = ลูกค้าให้มา

## 4. Prompt ต่อรูป

เขียนทีละรูปในรูปแบบนี้ — prompt ต้องละเอียดพอที่รูปออกมาตรงแบรนด์ตั้งแต่ครั้งแรก:

### `hero-01.webp` — P0 · `16:9` · 2K

> [ประเภทภาพ: documentary / studio / lifestyle], [แสง].
> [ใคร: จำนวนคน เชื้อชาติ อายุ เพศ กำลังทำอะไร อารมณ์หน้าตา].
> [ฉากหลัง: สถานที่ วัสดุ สี].
> [กล้อง/เลนส์/ระยะ, depth of field], [color grade].
> [สิ่งที่ห้ามมี: no text, no watermark, NOT posed, NOT stock smile].

**Alt (ไทย):** [ข้อความ alt ที่สื่อความหมายจริง ไม่ใช่ "รูปภาพ 1"]

<!-- เทคนิคเขียน prompt ที่ได้ผล
  1. บอก "ประเภทภาพ" ก่อนเสมอ (documentary photograph / editorial portrait)
  2. ระบุจำนวนคนเป็นตัวเลข ("four friends") ไม่ใช่ "a group"
  3. ระบุ action กลาง motion ("mid-laugh", "reaching out a hand") → ได้ภาพไม่แข็ง
  4. ปิดท้ายด้วยข้อห้ามเสมอ — model เชื่อฟังข้อห้ามที่อยู่ท้าย prompt มากกว่าต้น
  5. ดูตัวอย่าง prompt เต็มของแบรนด์ GLOW SOCIETY ได้ที่ commit 9ef7723
     (`git show 9ef7723:workspace/salepage_glow/assets-plan.md`)
-->

## 5. Pixabay (ฟรี — ไม่ใช้ credit)

| ใช้ที่ | คำค้น |
|---|---|
| | |

⚠️ Pixabay Content License ใช้เชิงพาณิชย์ได้ แต่ห้ามใช้ภาพที่มีโลโก้แบรนด์อื่น

## 6. Checklist ก่อนไป Stop 5 (build หน้าเพจ)

- [ ] ไฟล์ P0 ครบทุกไฟล์อยู่ใน `public/assets/`
- [ ] ชื่อไฟล์ web-safe ทุกไฟล์
- [ ] รัน `optimize-images.mjs` แล้วผ่านเป้าน้ำหนัก (เช็คซ้ำด้วย `--report`)
- [ ] `og-image.jpg` = 1200×630 · `favicon.png` = 32×32
- [ ] เขียน `public/assets/manifest.md` ครบ (filename · section · alt ไทย · source · size)
- [ ] รวมทุกภาพที่ใช้จริง ≤3MB
- [ ] ไม่มีภาพที่มีตัวหนังสือหลุดมา (นอกจาก og-image)
