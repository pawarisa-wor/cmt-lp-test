# โฟลเดอร์นี้คือ template ของ 1 salepage project

**ยังไม่มีหน้าเพจในนี้ — เราจะสร้างกันในคลาส** ตาม Workshop Steps

## เริ่มใช้งาน

```bash
cp -r "workspace/salepage_[PROJECT]" workspace/salepage_glow    # ตั้งชื่อตามโปรเจกต์ของคุณ
```

แล้วบอก Claude Code:

```
อ่าน CLAUDE.md แล้วใช้ skill generate-salepage
ทำ salepage ใน workspace/salepage_glow จาก context/
```

## มีอะไรให้แล้ว (2 ไฟล์)

| ไฟล์ | คืออะไร |
|---|---|
| `technical-setup.md` | tools ที่ต้องใช้ + วิธี setup ทีละคลิก + **spec ที่ AI อ่านเพื่อ config HubSpot/Stripe/GA4/Pixel เอง** |
| `assets-plan.md` | โครงเปล่าสำหรับวางแผนรูป — `generate-salepage` Stop 4 จะเติมให้ (ต้อง review ก่อน generate จริง) |

## อะไรจะถูกสร้างในคลาส (ไม่ต้องเตรียมมาก่อน)

```
_progress.md            ← tracker ว่าทำถึง stop ไหน
catalog.json            ← offers/ราคา/sku ที่แปลงมาจาก context/offers.md (skill setup-crm สร้าง)
offer-building.md       ← Stop 1
design-guide.md         ← Stop 2
wireframe.md            ← Stop 2 (ASCII wireframe)
copywriting.md          ← Stop 3
assets.json             ← Stop 4 (เวอร์ชันที่ scripts/gen-images.mjs อ่าน)
public/
  index.html            ← Stop 5
  thanks.html           ← Stop 5
  config.js             ← Stop 5 (GA4 ID / Pixel ID)
  assets/               ← รูปที่ generate + manifest.md
api/
  lead.js               ← Stop 5 — ฟอร์ม → HubSpot Contact + Deal
  checkout.js           ← Stop 5 — sku → Stripe Checkout Session
  stripe-webhook.js     ← Stop 5 — จ่ายสำเร็จ → ปิด Deal เป็น closedwon
lib/
  catalog.js  hubspot.js
package.json  vercel.json
cro-report.md           ← Stop 5 (ท้ายสุด)
```

> โครง + code pattern ของไฟล์พวกนี้อยู่ใน
> `.claude/skills/generate-salepage/references/project-scaffold.md`
> Claude จะอ่านไฟล์นั้นตอน Stop 5 ไม่ต้องเขียนจากศูนย์

## ลำดับที่ต้องทำ (ห้ามข้าม)

1. `context/` ต้องมีข้อมูลแบรนด์ก่อน → กรอกจาก `templates/` หรือ copy `context_example/`
2. brand identity → skill `create-moodboard` (ได้ moodboard.png + visual-guideline.md + voice.md)
3. HubSpot + Stripe → skill `setup-crm` (สร้าง `catalog.json` ที่นี่)
4. หน้าเพจ → skill `generate-salepage` (5 stops)
5. ทดสอบ → `node scripts/test-lead.mjs`
