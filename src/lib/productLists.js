import { productsAPI } from '@/lib/api';

const EVENT = 'pickorbeet-product-lists';
const WISHLIST_CAP = 50;

export const WISHLIST_KEY = 'pickorbeet-wishlist';
export const COMPARE_KEY = 'pickorbeet-compare';

export function readList(key) {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, ids) {
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function pushWishlist() {
  if (typeof window === 'undefined') return;
  const ids = readList(WISHLIST_KEY).slice(0, WISHLIST_CAP);
  if (!localStorage.getItem('access_token')) return;
  productsAPI.replaceWishlist(ids).catch(() => {});
}

export function toggleList(key, id, max) {
  const current = readList(key);
  const exists = current.includes(id);
  const limit = key === WISHLIST_KEY ? WISHLIST_CAP : max;
  if (!exists && limit && current.length >= limit) {
    return { ok: false, added: false, ids: current };
  }
  const ids = exists ? current.filter((item) => item !== id) : [...current, id];
  writeList(key, ids);
  if (key === WISHLIST_KEY) pushWishlist();
  return { ok: true, added: !exists, ids };
}

export function subscribeLists(listener) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
