# Tracking — GA4 + Facebook (Meta) Pixel

อ่านไฟล์นี้ตอน Stop 5 · ID ทุกตัวมาจาก `public/config.js` ห้าม hardcode ในหน้าเพจ

---

## หลักการตั้งชื่อ

- ใช้ **ชื่อ event มาตรฐานของ GA4** ตรงที่ GA4 มีให้ (`view_item_list`, `select_item`,
  `generate_lead`, `begin_checkout`, `purchase`) → ปลดล็อกรายงาน e-commerce/lead ในตัว ไม่ต้องตั้งค่าเพิ่ม
- event ที่ GA4 ไม่มีชื่อมาตรฐาน ใช้รูปแบบ **object_action** ตัวเล็ก คั่นด้วย `_`
  (`cta_clicked`, `form_started`, `checkout_cancelled`, `contact_clicked`)
- **context อยู่ใน properties ไม่ใช่ในชื่อ event** — `cta_clicked` + `location: "hero"`
  ไม่ใช่ `hero_cta_clicked`
- ห้ามใส่ PII (อีเมล/เบอร์/ชื่อ) ลงใน event properties

---

## ตาราง event ที่ต้อง implement

| จุดใน funnel | GA4 | Pixel | properties | ยิงเมื่อ |
|---|---|---|---|---|
| เข้าหน้า | `page_view` (auto) | `PageView` | — | โหลดหน้า |
| เห็นราคา | `view_item_list` | `ViewContent` | `item_list_name:"offers"`, `items[]` | IntersectionObserver ที่ section pricing (ครั้งเดียว) |
| เลือกแพ็กเกจ | `select_item` | — | `items:[{item_id:sku, item_name, price}]` | คลิกการ์ดแพ็กเกจ |
| คลิก CTA | `cta_clicked` | — | `button_text`, `location:"hero"\|"pricing"\|"final"` | ทุกปุ่ม CTA |
| เริ่มกรอกฟอร์ม | `form_started` | — | `form_type:"lead"` | focus ช่องแรก (ครั้งเดียว) |
| **ส่งฟอร์มสำเร็จ** | `generate_lead` | **`Lead`** | `value`, `currency:"THB"`, `sku`, `location`, `service`, `deal_id` | หลัง `/api/lead` ตอบ 200 |
| ไปจ่ายเงิน | `begin_checkout` | `InitiateCheckout` | `value`, `currency`, `items[]` | ก่อน redirect ไป Stripe |
| **จ่ายสำเร็จ** | `purchase` | **`Purchase`** | `transaction_id:session_id`, `value`, `currency`, `items[]` | `thanks.html` |
| ยกเลิกการจ่าย | `checkout_cancelled` | — | `sku` | กลับมาที่ `?canceled=1` |
| กด LINE/โทร | `contact_clicked` | `Contact` | `channel:"line"\|"phone"` | คลิกลิงก์ติดต่อ |

**`sku` ต้องเป็นค่าเดียวกันทั้ง `catalog.json` → HubSpot product → Stripe price → GA4 `item_id`**
ไม่งั้นต่อ funnel ข้ามระบบไม่ได้

---

## ป้องกัน purchase ซ้ำ

`thanks.html` อาจถูก refresh หรือ share ลิงก์ → ต้องกันซ้ำ:

```js
const sid = new URLSearchParams(location.search).get('session_id');
if (sid && localStorage.getItem('purchased_' + sid) !== '1') {
  gtag('event', 'purchase', { transaction_id: sid, value, currency: 'THB', items });
  fbq('track', 'Purchase', { value, currency: 'THB' });
  localStorage.setItem('purchased_' + sid, '1');
}
```

`transaction_id` = Stripe `session_id` → GA4 จะ dedupe ให้อีกชั้นด้วย

---

## Snippet ที่ต้องมีใน `<head>`

```html
<script src="config.js"></script>
<!-- GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA4_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', window.SITE_CONFIG.ga4Id);
</script>
<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s){/* standard meta pixel loader */}(...);
  fbq('init', window.SITE_CONFIG.pixelId);
  fbq('track', 'PageView');
</script>
```

ถ้า `ga4Id` หรือ `pixelId` ยังว่าง → **ต้องไม่ error** ให้ข้ามการโหลด script ไปเงียบๆ
(ผู้เรียนบางคนยังไม่มี ID ตอนสร้างหน้าเพจ)

```js
window.track = (ga4Name, params = {}, pixelName = null, pixelParams = null) => {
  if (window.gtag) gtag('event', ga4Name, params);
  if (window.fbq && pixelName) fbq('track', pixelName, pixelParams || {});
};
```

---

## ตรวจว่ายิงจริง

| เครื่องมือ | ดูอะไร |
|---|---|
| GA4 → Reports → **Realtime** | เห็น event ภายใน ~30 วินาที |
| GA4 → Admin → **DebugView** | ต้องเปิด debug mode (ต่อ `?debug_mode=1` หรือใช้ extension) |
| **Meta Pixel Helper** (Chrome extension) | เห็น Lead / Purchase ยิงพร้อม parameter |
| Console | `window.dataLayer` ต้องมี event ที่ยิงไป |

**ทดสอบทั้ง funnel จบใน 1 รอบ:** เปิดหน้า → scroll ถึงราคา → เลือกแพ็กเกจ → กรอกฟอร์ม →
จ่ายด้วย `4242 4242 4242 4242` → ต้องเห็น `generate_lead` แล้วตามด้วย `purchase`

---

## นอก scope ของคลาส (ทำต่อได้)

- **Meta Conversions API (CAPI)** — ยิง event จาก server เพื่อกัน ad blocker/iOS
  วิธีทำ: ใน `api/stripe-webhook.js` ยิง POST ไป `graph.facebook.com/v21.0/{pixel_id}/events`
  พร้อม hashed email — แม่นกว่า client-side แต่ต้องมี access token เพิ่ม
- **GA4 Measurement Protocol** — ยิง `purchase` จาก webhook เช่นกัน
- **Consent mode / PDPA** — ถ้าใช้กับ traffic จริงในไทย ควรมี cookie consent ก่อนยิง Pixel
