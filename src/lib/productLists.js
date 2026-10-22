const EVENT = 'pickorbeet-product-lists';

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

export function toggleList(key, id, max) {
  const current = readList(key);
  const exists = current.includes(id);
  if (!exists && max && current.length >= max) {
    return { ok: false, added: false, ids: current };
  }
  const ids = exists ? current.filter((item) => item !== id) : [...current, id];
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
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
