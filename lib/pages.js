import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;

function pageRoots() {
  return [
    join(process.cwd(), 'public_pages'),
    join(here, '..', 'public_pages'),
    join('/var/task', 'public_pages'),
  ];
}

const cache = new Map();

export function loadCatalogFor(page) {
  if (!SLUG_RE.test(String(page || ''))) return null;
  if (cache.has(page)) return cache.get(page);
  for (const root of pageRoots()) {
    const p = join(root, page, 'catalog.json');
    if (existsSync(p)) {
      const catalog = JSON.parse(readFileSync(p, 'utf8'));
      cache.set(page, catalog);
      return catalog;
    }
  }
  console.error(`[pages] ไม่พบ catalog ของ "${page}"`);
  return null;
}
