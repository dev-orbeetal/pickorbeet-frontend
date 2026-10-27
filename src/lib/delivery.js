/** Same areas Order.save treats as inside Dhaka. */
const DHAKA_AREAS = ['dhaka', 'mirpur', 'uttara', 'gulshan', 'banani', 'dhanmondi', 'mohammadpur'];

/** Free-text area or postal line from the product page delivery check. */
export function matchesInsideDhaka(text) {
  const value = String(text || '').trim().toLowerCase();
  if (!value) return false;
  if (isInsideDhaka(value, value)) return true;
  return value.split(/[^a-z]+/).filter(Boolean).some((word) => isInsideDhaka(word, word));
}

export function isInsideDhaka(city, district) {
  const place = String(city || '').toLowerCase();
  const area = String(district || '').toLowerCase();
  return DHAKA_AREAS.includes(place) || area === 'dhaka';
}

/** Charge the server will save, or null until a city or district is known. */
export function deliveryChargeFor({ city, district, inside, outside }) {
  if (!String(city || '').trim() && !String(district || '').trim()) return null;
  const amount = isInsideDhaka(city, district) ? inside : outside;
  const value = Number(amount);
  return Number.isFinite(value) ? value : 0;
}

export function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '0';
}
