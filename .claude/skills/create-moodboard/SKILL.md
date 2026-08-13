---
name: create-moodboard
description: Build the brand identity from the project's context — a moodboard image plus the written rules that come from it (visual guideline and voice). Use when the user says "สร้าง moodboard", "moodboard", "อยากเห็นภาพแบรนด์", "visual direction", "brand identity", "create moodboard", or before building a salepage when context/brand-identity/ has no moodboard and visual-guideline yet.
metadata:
  version: 1.0.0
---

# Create Moodboard

Turn brand context into one scroll-stopping moodboard image, then turn that image into written rules
so `generate-salepage` produces a page that looks like the brand instead of like a template.

**Outputs — ทั้ง 3 ไฟล์ต้องได้ครบ ไม่ใช่แค่รูป:**

| ไฟล์ | คืออะไร |
|---|---|
| `context/brand-identity/moodboard.png` | ภาพ moodboard (9:16) |
| `context/brand-identity/visual-guideline.md` | กฎที่ถอดจากภาพ — palette + typography + photography + UI |
| `context/voice.md` | โทนเสียงของแบรนด์ที่สอดคล้องกับ visual direction |

พร้อม `context/brand-identity/moodboard-prompt.txt` (prompt ที่ใช้ เก็บไว้ regenerate ได้)

**ภาพเปล่าๆ ไม่มีประโยชน์กับขั้นถัดไป** — `generate-salepage` อ่านไฟล์ `.md` ไม่ได้อ่านรูป
ถ้าไม่เขียน 2 ไฟล์นั้น หน้าเพจจะออกมาเป็น template กลางๆ

---

## Step 1 — Read context

Read `context/company.md`, `clients.md`, `voice.md`, `brand-identity/visual-guideline.md`.
If `context/` is empty, read `context_example/` instead and tell the user you are using the example brand.

Extract: brand name · what it sells · who it's for · 3–5 emotional words · existing colors/fonts if any.

If brand info is too thin to generate anything on-brand, ask for the minimum: brand name,
what it sells, who it's for, and the feeling it should give.

## Step 2 — Recommend a direction, then ask style

First **recommend** (don't just ask) — people choose better against a recommendation:

> "จาก voice ของแบรนด์ ผมแนะนำ **[Flowing / Grid]** เพราะ [เหตุผล 1 บรรทัด]
>
> **A) Flowing** — organic editorial, ภาพซ้อนทับ ไหลต่อกัน รู้สึกมีชีวิต expressive
> **B) Grid (Bento)** — ช่องเรียงเป็นระบบ สะอาด รู้สึก premium organized
>
> เอาแบบไหนครับ?"

Wait for the answer. Then read the matching reference:
- Flowing → `references/prompt-flowing.md`
- Grid → `references/prompt-grid.md`

## Step 3 — Fill the prompt template

Fill every placeholder from context — never leave a `[BRACKET]` in the final prompt:

| Placeholder | มาจาก |
|---|---|
| `[BRAND_NAME]` | `company.md` |
| `[BRAND_VIBE]` | 3–5 คำจาก `voice.md` + `visual-guideline.md` |
| `[PUNCHY_HEADLINE]` | 2–5 คำ ผลลัพธ์หรือความรู้สึก (ภาษาไทยได้ — GPT Image 2 เขียนไทยถูก) |
| `[NICHE]` | หมวดธุรกิจจาก `company.md` |
| `[PHOTOGRAPHY_STYLE]` | photography direction จาก `visual-guideline.md` |
| `[LIGHTING_MOOD]` | แสงที่ต้องการ |
| `[COLOR_DIRECTION]` | palette (ใส่ HEX ถ้ามี) |
| `[RISK_LEVER]` | 1 การตัดสินใจกล้าๆ ที่ทำให้ไม่เหมือนคู่แข่ง |

Append:

```
👉 IMAGE ASPECT RATIO: 9:16
👉 ADDITIONAL DETAILS: [สี/ฟอนต์/คำ/reference เฉพาะของแบรนด์นี้]
👉 DO NOT: generic stock smiles, watermark, other brand logos, [ภาพที่ห้ามใช้จาก visual-guideline]
```

## Step 4 — Confirm cost, then generate

**Show the assembled prompt to the user and confirm before generating — this costs money per image.**

Then:

```bash
node scripts/gen-images.mjs --moodboard --dry-run   # ตรวจ prompt ก่อน
node scripts/gen-images.mjs --moodboard            # ยิงจริง
```

Model `gpt-image-2-text-to-image`, `aspect_ratio: "9:16"`.
See `.claude/skills/_shared/gpt-image-guide.md` for API behaviour and error codes.
Save the prompt to `context/brand-identity/moodboard-prompt.txt`.

## Step 5 — Present and offer refinement

Show the image and offer concrete levers (not "อยากแก้อะไรไหม"):

> - **โทน**: "เข้มขึ้น / สดใสขึ้น / มินิมอลกว่านี้"
> - **สลับสไตล์**: ลอง grid แทน flowing
> - **เฉพาะจุด**: เปลี่ยนภาพหลัก / สี / ความรู้สึกของตัวอักษร
> - **เริ่มใหม่**: direction ใหม่ทั้งหมด

Regenerate only what's needed — edit the prompt file, then rerun with `--moodboard`.

## Step 6 — Write `visual-guideline.md` (do not skip)

**ลำดับสำคัญ: guideline เขียน "หลัง" ได้ภาพเสมอ ไม่ใช่ก่อน**

⚠️ **ถ้า `visual-guideline.md` มีเนื้อหาอยู่แล้ว ห้ามถือว่าใช้ได้** — เกือบทุกครั้งมันคือไฟล์ที่
ติดมาจาก `cp -r context_example/. context/` ซึ่งเขียนไว้ **ก่อน** มีภาพ จึงบรรยาย "สิ่งที่ตั้งใจ"
ไม่ใช่ "สิ่งที่ภาพเป็น" ต้อง**อ่าน `moodboard.png` ด้วยตาแล้วเขียนใหม่ทั้งไฟล์**
(สังเกตง่ายๆ: ถ้าท้ายไฟล์ยังเขียนว่า "moodboard.png ยังไม่ได้ generate" = ของเก่าแน่นอน)

เวลาเขียนใหม่ ให้เทียบกับของเดิมแล้ว**บอกผู้ใช้ตรงๆ ว่าข้อไหนเปลี่ยนเพราะภาพจริงไม่ตรงกับที่ตั้งใจ**
— จุดที่มักหลุดคือ tone label, ค่า HEX จริง, สี ink (ภาพหลายใบไม่มีตัวหนังสือดำเลย),
radius/ขอบการ์ด และ typeface ที่โผล่ในภาพแต่ไม่ได้อยู่ในแผนเดิม

Write `context/brand-identity/visual-guideline.md` describing what the **approved image actually shows**
(ไม่ใช่สิ่งที่ตั้งใจให้เป็น — ถอดจากภาพจริง):

- **Mood** 3–5 คำ + **tone label** จาก 11 ทิศทางใน
  `../generate-salepage/references/design-standards.md` + theme (light/dark) พร้อมเหตุผล 1 บรรทัด
- **Palette**: 5–8 HEX พร้อมบทบาท (primary / accent / ink / ink-muted / surface / surface-tint)
  และระบุ "คู่สีที่เป็นลายเซ็นแบรนด์" ถ้ามี
- **Typography**: headline + body — ต้องเป็นฟอนต์ **ที่รองรับภาษาไทยและมีคาแรกเตอร์**
  (เช่น Bai Jamjuree, Anuphan, IBM Plex Sans Thai, Noto Serif Thai, Mitr)
  **ห้าม** Inter / Roboto / Arial / Helvetica / system-ui / Sarabun เป็นฟอนต์หลัก
- **Photography direction**: ใคร (เชื้อชาติ/อายุ/กี่คนต่อรูป) · แสง · อารมณ์ · สไตล์
- **ลักษณะรูปที่ห้ามใช้** — ข้อนี้สำคัญที่สุดสำหรับ assets prep (กันภาพผิดแบรนด์)
- **UI**: radius, shadow, spacing rhythm, section divider, texture
- อ้างอิงไฟล์ moodboard.png ไว้ท้ายไฟล์

## Step 7 — Write `context/voice.md` ให้สอดคล้องกับ visual direction

visual กับ voice ต้องมาจากทิศทางเดียวกัน — แบรนด์ที่ภาพสดใสวัยรุ่นแต่ copy เขียนเป็นราชการ คือแบรนด์ที่พัง

อ่าน `context/company.md` + `clients.md` แล้วเขียน (หรืออัปเดตถ้ามีอยู่แล้ว) `context/voice.md`:

- **บุคลิกแบรนด์** 3–5 คำ ที่ต่อเนื่องจาก tone ของ moodboard
- **เรียกลูกค้าว่า / เรียกตัวเองว่า** (ระบุคำที่ห้ามใช้ เช่น "ท่าน", "ทางเรา")
- **ระดับภาษา** — ทางการ / กึ่งทางการ / เพื่อนคุยกัน / กวนๆ (เลือก 1)
- **คำที่ใช้บ่อย** และ **คำที่ห้ามใช้เด็ดขาด** — รวมคำที่เสี่ยงผิดกฎโฆษณา
  (เคลมสุขภาพ/การแพทย์, เคลมผลลัพธ์รูปร่าง, body shaming) ถ้าธุรกิจอยู่ในหมวดนั้น
- **ตัวอย่างประโยคที่ "ใช่เลย"** 1–2 ประโยค และ **"ไม่ใช่แบรนด์เรา"** 1–2 ประโยค
- **กฎการเขียน**: ความยาวประโยค · emoji ได้ไหม · คำอังกฤษปนได้ไหม · **CTA พูดว่าอะไร**

ถ้าผู้ใช้มีโพสต์/แคปชั่นเดิมอยู่ ขอมา 2–3 ชิ้นแล้วสกัด voice จากของจริงจะแม่นกว่าเดา
ถ้า `voice.md` มีเนื้อหาอยู่แล้ว **ห้ามเขียนทับเงียบๆ** — เสนอส่วนที่จะแก้แล้วขอ confirm

> ## 🔴 GATE A — ตรวจ moodboard + visual brand guideline
> **หยุดรอคนตรวจ** ก่อนไป skill `generate-salepage`
> **ต้องส่งของที่คนดูได้จริง ไม่ใช่เล่าว่าทำอะไรไป** — ส่งไฟล์รูป + วางสาระของ guideline ลงในแชท
> (palette พร้อม HEX · ฟอนต์ · tone label) + path ของไฟล์ · แล้วอธิบายว่าให้ดูอะไรและข้อไหนเป็นการอนุมาน
> ต้องวางให้ดูครบ:
> 1. **`moodboard.png`** — ส่งไฟล์ให้ผู้ใช้เห็นภาพจริง (`moodboard.png` อยู่ใน `.gitignore`
>    และอยู่แค่ในคอนเทนเนอร์ → บอกให้เซฟเก็บไว้ด้วย ไม่งั้นหายเมื่อ session จบ)
> 2. **`visual-guideline.md`** — palette + typography + photography + UI
>    พร้อมบอกว่าข้อไหน**ถอดจากภาพ** และข้อไหน**เป็นการอนุมาน** (เช่นสไตล์ปุ่ม ถ้าในภาพไม่มีปุ่ม)
> 3. **`voice.md`** — ถ้าไฟล์มีอยู่แล้ว **ห้ามเขียนทับเงียบๆ** ให้เสนอส่วนที่จะแก้แล้วขอ confirm
>
> เสนอ lever ให้แก้เป็นข้อๆ (โทน / สลับสไตล์ / เฉพาะจุด / เริ่มใหม่) ไม่ใช่ถามลอยๆ ว่า "โอเคไหม"
>
> **approve แล้ว → `git add -A && git commit && git push` ทันที** (จะได้แค่ `.md` เพราะ
> `moodboard.png` ถูก gitignore — ระบุใน commit message ว่า guideline ถอดจาก moodboard เวอร์ชันไหน)
> แล้วบอกว่าขั้นต่อไปคือ skill `generate-salepage` ซึ่งจะยึด 3 ไฟล์นี้เป็นกรอบ
>
> **ถ้าคนสั่งแก้ → regenerate/แก้ไฟล์ แล้วกลับมาที่ gate นี้อีกครั้ง** ห้ามเดินไป generate-salepage
> ด้วย brand identity ที่ยังไม่ผ่าน

---

## Notes

- Never put a real person's likeness or another brand's logo in the prompt
- If the brand is fictional/practice, label the moodboard file as สมมติ in the guideline
- Keep the approved prompt — regenerating from scratch loses the direction you just agreed on
