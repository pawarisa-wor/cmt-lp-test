import { loadCatalogFor } from './pages.js';

export function findOffer(catalog, sku) {
  if (!catalog || typeof sku !== 'string') return null;
  return catalog.offers.find((o) => o.sku === sku) || null;
}

export const isValidLocation = (catalog, id) =>
  Boolean(catalog?.locations?.some((l) => l.id === id));

export const isValidService = (catalog, id) =>
  Boolean(catalog?.services?.some((s) => s.id === id));

export const propName = (catalog, short) =>
  `${catalog.propertyPrefix}_${short}`;

export { loadCatalogFor };
