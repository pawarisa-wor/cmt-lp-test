# Assets Plan — salepage_glow (GLOW SOCIETY)

> **สถานะ: รอ review — ยังไม่ generate**
> ไฟล์นี้คือแผนรูปทั้งหมดของหน้าเพจ อ่าน + แก้ prompt ให้พอใจก่อน แล้วค่อยรัน
> `node scripts/gen-images.mjs` (💰 KIE.ai คิดเงินต่อรูป)

---

## สรุปงบและจำนวน

| Priority | คืออะไร | จำนวน | ทำเมื่อไหร่ |
|---|---|---|---|
| **P0** | ขาดไม่ได้ หน้าเพจพังถ้าไม่มี | **8 รูป** | ทำในคลาส |
| **P1** | ทำให้หน้าเพจน่าเชื่อถือขึ้นชัดเจน | 7 รูป | ทำในคลาสถ้าเวลาเหลือ |
| **P2** | มีแล้วดี ไม่มีก็ยังขายได้ | 4 รูป | ทำที่บ้าน |
| **Pixabay** | icon / texture / graphic | ~6 ชิ้น | ฟรี ทำได้เลย |

**แนะนำสำหรับคลาส 3 ชม.: gen แค่ P0 (8 รูป) ก่อน** แล้วใช้ Pixabay เติมที่เหลือ
ถ้าเวลาเหลือค่อยทำ P1

```bash
node scripts/gen-images.mjs --dry-run              # ดู prompt ทั้งหมด ไม่เสียเงิน
node scripts/gen-images.mjs --priority P0          # gen 8 รูปหลัก
node scripts/gen-images.mjs --only hero-01         # gen ทีละรูป (ตอนแก้)
```

---

## กฎที่ใช้กับทุกรูป

**Photography direction (จาก `visual-guideline.md`):**
คนไทย/เอเชียตะวันออกเฉียงใต้ อายุ 22–32 · เน้นผู้หญิงและ LGBTQ+ · lifestyle documentary
เหมือนเพื่อนถ่ายให้ · แสงกลางวันสว่าง · หัวเราะจริง กำลังคุยกัน · ส่วนใหญ่ 2–5 คนต่อรูป

**ห้ามมีในรูป:** ฝรั่งยิ้ม stock · นายแบบกล้ามชัด · โทนสปามืด เทียน หินซ้อน ดอกไม้ลอยน้ำ ·
watermark · โลโก้แบรนด์อื่น · คนเดียวนั่งสมาธิเงียบ · ตัวหนังสือในภาพ (ยกเว้น OG + moodboard)

**ตัวหนังสือในภาพ:** GPT Image 2 เขียนไทยได้ถูกต้อง แต่บนหน้าเพจเราใช้ HTML text
(แก้ง่าย ไม่เบลอ SEO ได้) → ใส่ข้อความในภาพเฉพาะ `og-image` และ `moodboard`

**หลัง gen ทุกครั้ง:** `node scripts/optimize-images.mjs` แล้วเช็คว่าน้ำหนักผ่านเป้า

---

## ตารางรูปทั้งหมด

| # | P | Section | filename | ratio | res | เป้าหมายไฟล์ | source |
|---|---|---|---|---|---|---|---|
| 1 | P0 | Hero | `hero-01.webp` | `16:9` | 2K | ≤200KB @1400px | KIE |
| 2 | P0 | Services — Grounding | `ground-01.webp` | `4:3` | 1K | ≤150KB @800px | KIE |
| 3 | P0 | Services — Moving | `move-01.webp` | `4:3` | 1K | ≤150KB @800px | KIE |
| 4 | P0 | Community proof | `community-01.webp` | `16:9` | 1K | ≤150KB @800px | KIE |
| 5 | P0 | Testimonial มิ้นท์ | `testi-01.webp` | `1:1` | 1K | ≤30KB @128px | KIE |
| 6 | P0 | Testimonial ปาล์ม | `testi-02.webp` | `1:1` | 1K | ≤30KB @128px | KIE |
| 7 | P0 | Testimonial จูน | `testi-03.webp` | `1:1` | 1K | ≤30KB @128px | KIE |
| 8 | P0 | OG / social share | `og-image.jpg` | `2:1` | 2K | ≤200KB @1200px | KIE |
| 9 | P1 | Grounding — sauna | `ground-02.webp` | `4:3` | 1K | ≤150KB @800px | KIE |
| 10 | P1 | Grounding — red light | `ground-03.webp` | `4:3` | 1K | ≤150KB @800px | KIE |
| 11 | P1 | Moving — hyrox | `move-02.webp` | `4:3` | 1K | ≤150KB @800px | KIE |
| 12 | P1 | Testimonial ฟ้า | `testi-04.webp` | `1:1` | 1K | ≤30KB @128px | KIE |
| 13 | P1 | Coach — Grounding | `coach-01.webp` | `1:1` | 1K | ≤80KB @400px | KIE |
| 14 | P1 | Coach — Dance | `coach-02.webp` | `1:1` | 1K | ≤80KB @400px | KIE |
| 15 | P1 | Coach — Hyrox | `coach-03.webp` | `1:1` | 1K | ≤80KB @400px | KIE |
| 16 | P2 | Location ทองหล่อ | `location-01.webp` | `3:2` | 1K | ≤150KB @800px | KIE |
| 17 | P2 | Location สาทร | `location-02.webp` | `3:2` | 1K | ≤150KB @800px | KIE |
| 18 | P2 | Social Night | `community-02.webp` | `4:5` | 1K | ≤80KB @400px | KIE |
| 19 | P2 | Moodboard | `moodboard.png` | `9:16` | 2K | — | KIE (skill) |
| 20 | — | Favicon | `favicon.png` | — | — | 32×32 | crop จากโลโก้/hero |

---

## Prompts

### 1. `hero-01.webp` — P0 · `16:9` · 2K

> Documentary-style photograph, bright natural morning light. Four Southeast Asian friends in their
> mid-twenties — three women and one androgynous person — gathered around a stainless steel ice bath
> in a modern indoor wellness studio. One is submerged to the shoulders, eyes squeezed shut, laughing
> hard; the others crouch at the rim cheering her on, one reaching out a hand. Wet hair, water
> droplets, genuine mid-motion candid energy. Background: pale wood slats, large window with soft
> daylight, hints of electric blue tile. Shot on 35mm, shallow depth of field, warm skin tones,
> vibrant but natural color grade. Feels like a friend took the photo. NOT posed, NOT smiling at
> camera, no text, no watermark.

**Alt (ไทย):** กลุ่มเพื่อน 4 คนหัวเราะรอบอ่าง ice bath ที่ GLOW SOCIETY

### 2. `ground-01.webp` — P0 · `4:3` · 1K

> Documentary photograph of a young Thai woman, mid-twenties, submerged to her collarbones in a
> stainless steel ice bath, floating ice cubes on the surface. Eyes closed, controlled breathing,
> water beading on her skin. A host in a simple dark tee crouches beside the tub, one hand on the
> rim, counting with the other hand. Bright cool daylight, electric-blue accent lighting, pale wood
> and white tile studio. Steam rising slightly. Candid, respectful, empowering. No text, no watermark.

**Alt:** ผู้หญิงกำลังแช่ ice bath โดยมี host นับเวลาให้ข้างอ่าง

### 3. `move-01.webp` — P0 · `4:3` · 1K

> Wide documentary photograph of an aerobic dance class in progress. Eight to ten Southeast Asian
> people in their twenties, mixed genders and body types, mid-movement with arms up, laughing,
> clearly having fun. Bright studio with pale wood floor, mirrored wall, warm orange and yellow
> accent lighting, a hint of colorful light haze. Motion blur on a few limbs conveying energy.
> Instructor at the front on a small platform. Feels like a party, not a gym class.
> No text, no watermark.

**Alt:** คลาสเต้นแอโรบิคที่คนเต้นกันสนุกเต็มห้อง

### 4. `community-01.webp` — P0 · `16:9` · 1K

> Candid group photograph taken right after a workout — nine Southeast Asian people in their
> twenties crowded into frame, sweaty, towels around necks, some with wet hair from an ice bath.
> Arms around each other, several mid-laugh, one making a peace sign, one drinking from a bottle.
> Mixed genders, visibly including queer-presenting people. Bright natural light from a large
> window, pale wood interior, warm inviting tone. Slightly imperfect framing like a phone photo
> taken by a friend. No text, no watermark.

**Alt:** สมาชิก GLOW SOCIETY ถ่ายรูปหมู่หลังจบรอบ

### 5–7 & 12. `testi-01..04.webp` — `1:1` · 1K

โครงเดียวกัน เปลี่ยนรายละเอียดคน (ให้ตรงกับ testimonial ใน `offers.md`):

| file | คน | prompt เพิ่มเติม |
|---|---|---|
| `testi-01` | มิ้นท์ 26 · graphic designer | Thai woman, mid-twenties, shoulder-length dyed light-brown hair, small silver earrings, wearing an oversized crew-neck tee, relaxed genuine half-smile |
| `testi-02` | ปาล์ม 29 · software engineer | Thai man, late twenties, short hair, thin-frame glasses, plain t-shirt, calm friendly expression |
| `testi-03` | จูน 24 · content creator | Thai woman, early twenties, long black hair in a claw clip, colorful sports bra strap visible under a loose tank, bright open laugh |
| `testi-04` | ฟ้า 31 · HR manager | Thai woman, early thirties, tied-back hair, minimal makeup, soft confident smile, simple hoop earrings |

> **base prompt:** Natural-light portrait headshot of [รายละเอียดคน]. Shot indoors in a bright
> wellness studio, softly blurred pale wood and plants in the background. Real person energy —
> the kind of photo a friend takes, not a corporate headshot. Square crop, face centered,
> shoulders visible. Warm natural skin tones. No text, no watermark, no studio backdrop.

**Alt:** รูปโปรไฟล์ของ [ชื่อ] สมาชิก GLOW SOCIETY

### 8. `og-image.jpg` — P0 · `2:1` · 2K (ใส่ตัวหนังสือได้)

> Social share banner image. Left two-thirds: bold Thai headline text reading exactly
> "รีเซ็ตแล้วได้เพื่อนกลับบ้าน" in a heavy contemporary Thai sans-serif, dark charcoal on a warm
> off-white background, with a small electric-blue underline accent stroke. Right one-third:
> a bright candid photo of three Southeast Asian friends laughing at the edge of an ice bath,
> bleeding to the frame edge. A thin hot-orange border strip along the bottom. Clean, modern,
> high contrast, poster-like composition. Text must be spelled exactly as written and fully legible.
> No watermark.

**Alt:** GLOW SOCIETY — รีเซ็ตแล้วได้เพื่อนกลับบ้าน
**หลัง gen:** resize เป็น 1200×630 (`optimize-images.mjs` ทำให้)

### 9. `ground-02.webp` — P1 · `4:3` · 1K

> Documentary photograph inside a Finnish-style wooden sauna. Four Southeast Asian people in their
> twenties sitting on the wooden benches wrapped in towels, mid-conversation — one gesturing while
> talking, another laughing with head tipped back. Warm amber light from a low lamp, visible steam,
> honey-toned cedar walls, water bucket and ladle on the floor. Sociable and relaxed, absolutely not
> a solemn spa. Respectful framing, everyone modestly covered. No text, no watermark.

**Alt:** กลุ่มสมาชิกนั่งคุยกันในห้อง sauna

### 10. `ground-03.webp` — P1 · `4:3` · 1K

> Photograph of a red light therapy room in a modern wellness studio. A young Southeast Asian person
> lying relaxed on a padded bed under a large panel of deep red LED light, eyes closed, wearing
> athletic wear, a folded towel under the head. The whole room glows deep crimson with clean
> geometric shadows; a second bed visible in the background. Calm but contemporary and clean —
> like a design-forward studio, not a clinic. No text, no watermark.

**Alt:** ห้อง red light therapy ของ GLOW SOCIETY

### 11. `move-02.webp` — P1 · `4:3` · 1K

> Documentary photograph of a hyrox-style functional training area. Two Southeast Asian people in
> their twenties mid-effort: one pushing a weighted sled across turf, the other on a ski erg,
> both sweating and focused. Industrial-but-bright space with pale concrete floor, black rig,
> orange accent markings on the turf, large windows with daylight. A coach in the background
> clapping encouragement. Real effort, not a fitness-model shoot. No text, no watermark.

**Alt:** โซน hyrox กำลังมีคนซ้อม sled push และ ski erg

### 13–15. `coach-01..03.webp` — P1 · `1:1` · 1K

| file | บทบาท | prompt เพิ่มเติม |
|---|---|---|
| `coach-01` | Grounding coach | Thai person in their early thirties, short cropped hair, wearing a plain dark tee, arms relaxed, standing beside an ice bath, warm confident expression |
| `coach-02` | Dance coach | Thai woman, late twenties, high ponytail, bright crop top and joggers, standing in a mirrored dance studio, energetic grin mid-laugh |
| `coach-03` | Hyrox coach | Thai man, early thirties, athletic build but not bodybuilder, tank top, chalk on hands, standing in front of a black training rig, friendly steady gaze |

> **base prompt:** Natural-light half-body portrait of [รายละเอียด] inside a bright modern wellness
> studio, softly blurred background. Approachable and human — a real coach, not a fitness model.
> Square crop. Warm natural skin tones. No text, no watermark.

**Alt:** [ชื่อโค้ช] — โค้ช[บทบาท]ของ GLOW SOCIETY

### 16–17. `location-01/02.webp` — P2 · `3:2` · 1K

> Interior photograph of a boutique urban wellness club reception and lounge in Bangkok.
> Pale wood slat walls, terrazzo floor, electric-blue accent bench, hanging plants, a neon-free
> minimal sign area (no readable text), warm daylight from street-facing glass. Two young people
> chatting at the counter in the middle distance. Bright, fresh, youthful — feels like a café
> crossed with a studio, not a hotel spa. No text, no watermark.
>
> `location-01` (ทองหล่อ): เพิ่ม "street-level entrance visible through the glass with tropical
> plants outside"
> `location-02` (สาทร): เพิ่ม "high-floor space with a city skyline visible through the windows"

**Alt:** บรรยากาศ GLOW SOCIETY สาขา[ทองหล่อ/สาทร]

### 18. `community-02.webp` — P2 · `4:5` · 1K

> Vertical candid photograph of a Friday social night at a wellness club. Six to eight Southeast
> Asian people in their twenties standing around with drinks in hand, some in towels and robes
> fresh from the sauna, warm string lights overhead, one person laughing loudly at something
> off-frame. Warm evening tones, orange and amber, slight grain, phone-photo spontaneity.
> Social and fun, clearly not a party with alcohol as the focus. No text, no watermark.

**Alt:** บรรยากาศ Social Night ทุกคืนวันศุกร์

### 19. `moodboard.png` — P2 · `9:16` · 2K

สร้างด้วย skill `create-moodboard` (สไตล์ที่แนะนำ: **A) Flowing**) ไม่ต้องเขียน prompt เอง

---

## Pixabay (ฟรี — ไม่ใช้ credit)

```bash
node scripts/fetch-stock.mjs --query "ice cube" --out ground-icon
```

| ใช้ที่ | คำค้น | หมายเหตุ |
|---|---|---|
| ไอคอน Grounding | `ice cube`, `snowflake` | เอาแบบ transparent PNG ถ้ามี |
| ไอคอน Moving | `dance icon`, `dumbbell` | |
| ไอคอน How it works (3 ขั้น) | `calendar`, `location pin`, `check mark` | |
| Texture พื้น section | `paper texture`, `noise texture` | ใช้เป็น background overlay จางๆ |
| Divider / accent | `abstract shape blue` | ตกแต่งมุม section |

⚠️ ตรวจ license ทุกไฟล์ (Pixabay Content License ใช้เชิงพาณิชย์ได้) และห้ามใช้ภาพที่มีโลโก้แบรนด์อื่น

---

## Checklist ก่อนไป build หน้าเพจ (Stop 5)

- [ ] ไฟล์ P0 ครบ 8 ไฟล์อยู่ใน `public/assets/`
- [ ] ทุกชื่อไฟล์เป็น web-safe (ตัวเล็ก ไม่มีเว้นวรรค ไม่มีอักษรไทย)
- [ ] รัน `optimize-images.mjs` แล้ว ทุกไฟล์ผ่านเป้าน้ำหนัก
- [ ] `og-image.jpg` ขนาด 1200×630
- [ ] `favicon.png` ขนาด 32×32
- [ ] เขียน `public/assets/manifest.md` ครบ (filename · section · alt ไทย · source · size)
- [ ] รวมทุกภาพที่ใช้จริงบนหน้า ≤3MB
- [ ] ไม่มีภาพที่มีตัวหนังสือหลุดมา (นอกจาก og-image)
