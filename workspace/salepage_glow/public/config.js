/**
 * ค่า public ทั้งหมดของหน้าเพจอยู่ที่นี่ที่เดียว
 * (ค่าพวกนี้เปิดเผยได้ ไม่ใช่ secret — secret อยู่ใน .env ฝั่ง server เท่านั้น)
 *
 * ใส่ ID ของคุณเองแทน placeholder ด้านล่าง ถ้าเว้นว่างไว้ script tracking จะไม่โหลด (ไม่ error)
 */
window.SITE_CONFIG = {
  // GA4 Measurement ID เช่น 'G-XXXXXXXXXX'  (ดู technical-setup.md ส่วน B4)
  ga4Id: '',

  // Facebook (Meta) Pixel ID เช่น '123456789012345'  (ดู B5)
  pixelId: '',

  // ช่องทางติดต่อ (ข้อมูลสมมติสำหรับ workshop)
  lineId: '@glowsociety',
  phone: '020001234',

  currency: 'THB',
};
