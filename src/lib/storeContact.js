export const STORE_PHONE = '+8801819217424';
export const STORE_EMAIL = 'support@pickorbeet.com';

const DUMMY_PHONES = new Set(['+880 1234-567890', '+880 1234-567891']);
const DUMMY_EMAILS = new Set(['contact@pickorbeet.com']);

function isDummy(value, dummies) {
  const text = String(value || '').trim();
  return !text || dummies.has(text.toLowerCase()) || dummies.has(text);
}

export function storePhone(value) {
  return isDummy(value, DUMMY_PHONES) ? STORE_PHONE : String(value).trim();
}

export function storeEmail(value) {
  return isDummy(value, DUMMY_EMAILS) ? STORE_EMAIL : String(value).trim();
}

function listed(primary, secondary, normalize, dummies) {
  const first = normalize(primary);
  const extra = String(secondary || '').trim();
  if (!extra || isDummy(extra, dummies) || extra.toLowerCase() === first.toLowerCase()) {
    return [first];
  }
  return [first, extra];
}

export function storePhones(primary, secondary) {
  return listed(primary, secondary, storePhone, DUMMY_PHONES);
}

export function storeEmails(primary, secondary) {
  return listed(primary, secondary, storeEmail, DUMMY_EMAILS);
}
