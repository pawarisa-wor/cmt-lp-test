# Assets Manifest — trial

| filename | section | alt (ไทย) | source | ขนาดหลัง optimize | สถานะ |
|---|---|---|---|---|---|
| `hero-01.webp` | Hero | กลุ่มเพื่อนสาวไทยกำลังหัวเราะอยู่ที่อ่างแช่น้ำเย็นบนดาดฟ้ากรุงเทพ | KIE 2K 16:9 | 91KB | ✅ พร้อม |
| `services-grounding-01.webp` | Services — Grounding | สองคนไทยแช่น้ำเย็นในอ่างกลมบนดาดฟ้า ยิ้มหัวเราะด้วยความฮึกเหิม | KIE 1K 4:3 | 72KB | ✅ พร้อม |
| `services-moving-01.webp` | Services — Moving | กลุ่มผู้หญิงยกแขนขึ้นกลางคลาส movement | KIE 1K 4:3 | — | ⏳ ยังไม่ generate |
| `testimonial-01.webp` | Testimonials — มิ้นท์ | ภาพหน้าตรงมิ้นท์ กราฟิกดีไซน์เนอร์ 26 ปี | KIE 1K 1:1 | — | ⏳ ยังไม่ generate |
| `testimonial-02.webp` | Testimonials — ปาล์ม | ภาพหน้าตรงปาล์ม นักพัฒนาซอฟต์แวร์ 29 ปี | KIE 1K 1:1 | — | ⏳ ยังไม่ generate |
| `testimonial-03.webp` | Testimonials — ฟ้า | ภาพหน้าตรงฟ้า HR Manager 31 ปี | KIE 1K 1:1 | — | ⏳ ยังไม่ generate |

**รวมที่พร้อมแล้ว**: 163KB / เป้า ≤3MB ✅

**รูปที่ยังขาด**: 4 รูป — build จะใช้ CSS placeholder แทน (services-moving: bg color, testimonials: initials circle)
gen ภายหลังได้ด้วย `node scripts/gen-images.mjs --only services-moving-01 --project trial`
