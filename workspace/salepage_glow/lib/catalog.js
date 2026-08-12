/**
 * catalog.json = แหล่งความจริงเดียวของ offers/ราคา/sku
 * ห้ามเชื่อราคาที่ browser ส่งมา — ต้อง lookup จากที่นี่เสมอ
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

let cached = null;

export function loadCatalog() {
  if (!cached) {
    cached = JSON.parse(readFileSync(join(here, '..', 'catalog.json'), 'utf8'));
  }
  return cached;
}

/** คืน offer จาก sku — คืน null ถ้าไม่มี (อย่าเดา อย่า fallback เป็นราคาอื่น) */
export function findOffer(sku) {
  if (typeof sku !== 'string') return null;
  return loadCatalog().offers.find((o) => o.sku === sku) || null;
}

export function isValidLocation(id) {
  return loadCatalog().locations.some((l) => l.id === id);
}

export function isValidService(id) {
  return loadCatalog().services.some((s) => s.id === id);
}

export function propName(shortName) {
  const { propertyPrefix } = loadCatalog();
  return `${propertyPrefix}_${shortName}`;
}
