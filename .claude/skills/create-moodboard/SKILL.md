---
name: create-moodboard
description: Generate a brand moodboard image from the project's context files, then write the visual direction back into the brand guideline. Use when the user says "สร้าง moodboard", "moodboard", "อยากเห็นภาพแบรนด์", "visual direction", "create moodboard", or right before building a salepage when brand-identity/visual-guideline.md has no locked visual direction yet.
metadata:
  version: 1.0.0
---

# Create Moodboard

Turn brand context into one scroll-stopping moodboard image, then lock the visual direction so
`generate-salepage` produces a page that looks like the brand instead of like a template.

**Outputs:**
- `context/brand-identity/moodboard.png` (9:16)
- `context/brand-identity/moodboard-prompt.txt` — the exact prompt used, so it can be regenerated
- updated `context/brand-identity/visual-guideline.md` (palette + typography + photography locked)

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

## Step 6 — Lock the direction back into the guideline (do not skip)

The moodboard is worthless to the next skill unless it becomes rules. Update
`context/brand-identity/visual-guideline.md` with what the approved image actually shows:

- **Palette**: 5–8 HEX with roles (primary / accent / ink / surface / surface-tint)
- **Typography**: headline + body font names — must be **Thai-capable and characterful**
  (e.g. Bai Jamjuree, Anuphan, IBM Plex Sans Thai, Noto Serif Thai).
  **Never** Inter / Roboto / Arial / Helvetica / system-ui / Sarabun as the primary font.
- **Photography direction**: subject, lighting, number of people per shot, emotion, what to avoid
- **UI**: radius, shadow, spacing rhythm, section divider style, texture
- **Tone label** from the 11 directions in `../generate-salepage/references/design-standards.md`

> **STOP** — tell the user the visual direction is locked, and the next step is
> skill `generate-salepage`.

---

## Notes

- Never put a real person's likeness or another brand's logo in the prompt
- If the brand is fictional/practice, label the moodboard file as สมมติ in the guideline
- Keep the approved prompt — regenerating from scratch loses the direction you just agreed on
