/** Areas treated as inside Dhaka when an address has no district. Matches is_inside_dhaka on the server. */
const DHAKA_AREAS = ['dhaka', 'mirpur', 'uttara', 'gulshan', 'banani', 'dhanmondi', 'mohammadpur'];

/** Free-text area or postal line from the product page delivery check. */
export function matchesInsideDhaka(text) {
  const value = String(text || '').trim().toLowerCase();
  if (!value) return false;
  return DHAKA_AREAS.includes(value) || value.split(/[^a-z]+/).some((word) => DHAKA_AREAS.includes(word));
}

/** Only Dhaka district ships at the inside rate; the division never decides. */
export function isInsideDhaka(city, district) {
  const area = String(district || '').trim().toLowerCase();
  if (area) return area === 'dhaka';
  return DHAKA_AREAS.includes(String(city || '').trim().toLowerCase());
}

/** Charge the server will save, or null until a district or city is known. */
export function deliveryChargeFor({ city, district, inside, outside }) {
  if (!String(city || '').trim() && !String(district || '').trim()) {
    return null;
  }
  const amount = isInsideDhaka(city, district) ? inside : outside;
  const value = Number(amount);
  return Number.isFinite(value) ? value : 0;
}

export function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '0';
}
