# Design Guide — หน้า /trial

## Theme & Tone

- **Theme**: Light (warm off-white `#FAF7F2`) — confirmed จาก `visual-guideline.md`
- **Tone direction**: **Editorial / Maximalist-energy** — magazine layout ที่มีชีวิตชีวา
  asymmetric composition, typography ขนาดใหญ่ bold, texture เต็ม ไม่แบนโล่ง
  เลือกเพราะ brand tone คือ "Bold Lifestyle / Energetic Editorial" — ห้ามทำเป็น
  Organic/wellness (สปาผู้ใหญ่) และห้ามทำเป็น SaaS minimal

---

## Palette (ทั้งหมดมาจาก `visual-guideline.md` — ห้ามใช้สีนอกตาราง)

| Token | HEX | บทบาทบนหน้าเพจ |
|---|---|---|
| `--primary` | `#0F5FD9` | กรอบ badge · link · secondary CTA |
| `--accent-hot` | `#FF5A36` | **CTA button หลัก** · hand-drawn underline · counter badge |
| `--accent-glow` | `#FFD84D` | highlight span · star icon · accent chip |
| `--ink` | `#1A2035` | body text · heading บนพื้นสว่าง |
| `--ink-muted` | `#5C6570` | body รอง · placeholder · label ใน form |
| `--surface` | `#FAF7F2` | **page background** (cream/parchment) |
| `--surface-tint` | `#F2F6FF` | section สลับ: Social proof, Testimonials |
| `--surface-warm` | `#FFF4EF` | section How it works, Final CTA |
| `--surface-dark` | `#1A2035` | Lead form section (dark Navy — contrast สูงสุดที่ conversion point) |

**สีที่ห้ามใช้**: SaaS blue `#3B82F6` · gradient ม่วง-ชมพู · sage green · beige สปา · ขาวจัด `#FFFFFF` เป็น bg หลัก

---

## Typography (จาก `visual-guideline.md` — ห้ามใช้ Inter/Roboto/Arial/Sarabun)

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@700&family=Anuphan:wght@400;500&display=swap');

--font-display: 'Bai Jamjuree', sans-serif;  /* headlines */
--font-body:    'Anuphan', sans-serif;        /* body, UI */
```

| ระดับ | Font | Weight | Size (clamp) | Line-height |
|---|---|---|---|---|
| Hero H1 | Bai Jamjuree | 700 | `clamp(2.5rem, 6vw, 4.5rem)` | 1.1 |
| Section H2 | Bai Jamjuree | 700 | `clamp(1.75rem, 4vw, 2.75rem)` | 1.15 |
| Sub H3 | Bai Jamjuree | 700 | `clamp(1.25rem, 2.5vw, 1.75rem)` | 1.2 |
| Body | Anuphan | 400 | `clamp(1rem, 1.5vw, 1.125rem)` | 1.6 |
| Body emphasis | Anuphan | 500 | same | 1.6 |
| Label / badge | Anuphan | 500 | `0.75rem` letter-spacing 0.08em uppercase | — |

Scale 1.333x · letter-spacing headline: `-0.03em` · body label: `+0.02em`

---

## Spacing & Layout

- Base 4px → `4 8 12 16 24 32 48 64 96 128`
- Section padding: `64px` mobile → `96px` tablet → `128px` desktop
- Container: max `1200px` centered · gutter `16px`(mob) / `24px`(tab) / `32px`(desk)
- **Layout class เท่านั้น — ห้าม inline style สำหรับ grid/flex/breakpoint** (ทำให้ responsive พัง)
- Image path ต้องเป็น absolute `/trial/assets/...` เพื่อป้องกัน 404 จาก cleanUrls

---

## Components

### CTA Button
```css
.btn-primary {
  background: var(--accent-hot);       /* #FF5A36 */
  color: #fff;
  border-radius: 999px;                /* pill — ตาม visual-guideline */
  padding: 14px 32px;
  min-height: 52px;
  font: 600 1rem var(--font-body);
  letter-spacing: 0.01em;
  transition: background 200ms, transform 100ms;
}
.btn-primary:hover  { background: #e04a2b; }  /* -10% */
.btn-primary:active { transform: scale(.98); }
```

### Pricing card (hero)
```css
.pricing-card {
  border-radius: 20px;                          /* ตาม visual-guideline */
  box-shadow: 0 12px 32px rgba(15,95,217,.14); /* ตาม visual-guideline */
  border: 2.5px solid var(--primary);
  background: #fff;
  position: relative;
}
.pricing-card::before { /* "★ แนะนำ" badge */
  content: "✦ RECOMMENDED";
  background: var(--accent-hot);
  color: #fff;
  border-radius: 999px;
  font-size: .7rem;
  letter-spacing: .08em;
  padding: 4px 14px;
}
```

### Card (service, testimonial)
```css
.card {
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(15,95,217,.14);
  overflow: hidden;
}
```

### FAQ accordion
```css
.faq-item summary { cursor: pointer; min-height: 48px; padding: 16px 0; }
.faq-item[open] summary { color: var(--primary); }
.faq-item .answer { animation: slideDown 250ms ease; }
```

---

## Section-by-section visual treatment

| Section | พื้นหลัง | ลักษณะพิเศษ |
|---|---|---|
| 1 — Hero | `--surface` (`#FAF7F2`) + paper grain | torn-paper image, hand-drawn orange circle รอบ headline |
| 2 — Social proof | `--primary` (`#0F5FD9`) | ตัวเลขขาว ใหญ่ Bai Jamjuree, label เล็ก Anuphan |
| 3 — Problem | `--surface` | bullet มี `#FF5A36` dot |
| 4 — Solution/USP | `--surface-tint` (`#F2F6FF`) | 4 USP card กริด · icon + text |
| 5 — Services | `--surface` | 2 คอลัมน์ image card (torn-paper edges) |
| 6 — How it works | `--surface-warm` (`#FFF4EF`) | 4 step ไอคอนตัวเลข `--accent-hot` |
| 7 — Pricing | `--surface` | 1 การ์ดกลาง · shadow `0 12px 32px rgba(15,95,217,.14)` |
| 8 — Testimonials | `--surface-tint` | 3 การ์ดรูปวงกลม · ผลลัพธ์ bold `--accent-hot` |
| 9 — Locations | `--surface` | 2 column · `--primary` border-left |
| 10 — FAQ | `--surface-warm` | accordion |
| 11 — Lead form | `--surface-dark` (`#1A2035`) | ตัวหนังสือขาว · form สีขาว · ปุ่ม `--accent-hot` |
| 12 — Final CTA | `--primary` (`#0F5FD9`) | ตัวหนังสือขาว · ปุ่ม `--accent-hot` |
| Footer | `#141824` (เข้มกว่า ink) | ข้อมูลติดต่อ |

**Section divider**: สลับพื้นสี (ไม่ใช้เส้นตรง) + glow orb มุม (`--accent-glow` opacity 30%)

---

## Texture & Depth

- Paper grain overlay บน hero + surface sections: `noise.svg` opacity 4% (inferred จาก visual-guideline)
- Drop shadow ใต้ภาพ: `0 8px 24px rgba(26,32,53,.15)`
- Hand-drawn accent (SVG inline): วงกลม `#FF5A36` ล้อม headline · ลูกศร · เส้นใต้
- Color chip decorative: `8×8px` squares กระจายระหว่าง section (สี `--accent-glow`, `--primary`)

---

## Motion

- Fade-in-up 24px · 400ms · stagger 80ms · `cubic-bezier(.4,0,.2,1)`
- CTA hover: `background 200ms` · active `scale .98 100ms`
- FAQ: `max-height` animation 250ms ease
- `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`

---

## Accessibility

- Contrast: `#FAF7F2` bg + `#1A2035` text → ratio ~13:1 ✅
- `#FF5A36` on white → ratio ~3.1:1 (ขนาดใหญ่ ✅ WCAG AA large text)
- Touch target ≥ 48×48px ทุกปุ่ม
- Form: `<label for>` ผูกทุก input · error ผูกด้วย `aria-describedby`
- Heading order: h1 (hero) → h2 (section) → h3 (subsection)
