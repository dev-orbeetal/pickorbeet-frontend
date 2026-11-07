export const voucherFilters = [
  { id: 'all', label: 'All Vouchers', icon: 'ticket', accent: '#FF7A12', border: '#FF7A12' },
  { id: 'available', label: 'Available', icon: 'check', accent: '#16A34A', border: '#B7E7C8' },
  { id: 'used', label: 'Used', icon: 'clock', accent: '#6B7280', border: '#D5DAE3' },
  { id: 'expired', label: 'Expired', icon: 'x', accent: '#E11D48', border: '#F6C2CB' },
];

export const tones = {
  orange: { accent: '#FF7A12', stub: '#FFF1E6', ink: '#FF6A00', button: '#F46D07' },
  blue: { accent: '#2F6BFF', stub: '#E7F1FF', ink: '#2F6BFF', button: '#2F6BFF' },
  red: { accent: '#FF3B4E', stub: '#FFEBEE', ink: '#FF2E3F', button: '#FF2E3F' },
  purple: { accent: '#7C3AED', stub: '#F3EEFF', ink: '#7C3AED', button: '#7C3AED' },
  muted: { accent: '#9AA3B2', stub: '#F1F2F5', ink: '#8B93A3', button: '#9AA3B2' },
};

const availableTones = ['orange', 'red', 'purple', 'blue'];

function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '৳0';
  return `৳${amount.toLocaleString('en-BD', { maximumFractionDigits: amount % 1 ? 2 : 0 })}`;
}

function dateLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function mapWalletRow(row, index) {
  const state = row.state === 'used' || row.state === 'expired' ? row.state : 'available';
  const percent = row.discount_type === 'percentage';
  const offer = percent ? `${money(row.discount_value).replace('৳', '')}%` : money(row.discount_value);
  const minimumAmount = Number(row.minimum_order_amount) || 0;
  const description = String(row.description || '').trim();
  const until = dateLabel(row.valid_until);
  const used = dateLabel(row.used_at);
  const when = state === 'used'
    ? `Used on ${used || 'a previous order'}`
    : state === 'expired'
      ? `Expired on ${until || 'an earlier date'}`
      : `Valid till ${until || 'no end date'}`;
  const detail = state === 'used'
    ? 'You have already used this voucher'
    : state === 'expired'
      ? 'This voucher has expired'
      : row.reason || description || (percent ? `Get ${offer} off your order` : `Get ${offer} off your order`);
  return {
    id: row.id,
    code: row.code,
    kind: percent ? 'percent' : 'amount',
    state,
    tone: state === 'expired' ? 'muted' : state === 'used' ? 'purple' : availableTones[index % availableTones.length],
    headline: percent ? offer : money(row.discount_value),
    caption: 'OFF',
    minimum: minimumAmount > 0 ? `Min. spend ${money(minimumAmount)}` : 'No minimum spend',
    title: row.name || row.code,
    detail,
    when,
    terms: description || detail,
    applies: row.applies,
    reason: row.reason,
  };
}
