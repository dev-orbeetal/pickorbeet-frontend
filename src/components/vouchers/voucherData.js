export const voucherFilters = [
  { id: 'all', label: 'All Vouchers', icon: 'ticket', accent: '#FF7A12', border: '#FF7A12' },
  { id: 'available', label: 'Available', icon: 'check', accent: '#16A34A', border: '#B7E7C8' },
  { id: 'used', label: 'Used', icon: 'clock', accent: '#6B7280', border: '#D5DAE3' },
  { id: 'expired', label: 'Expired', icon: 'x', accent: '#E11D48', border: '#F6C2CB' },
];

export const vouchers = [
  {
    id: 'electronics',
    code: 'ELEC200',
    kind: 'amount',
    state: 'available',
    tone: 'orange',
    headline: '৳200',
    caption: 'OFF',
    minimum: 'Min. spend ৳1,500',
    title: 'Electronics Special',
    detail: 'Get ৳200 off on all electronics products',
    when: 'Valid till 31 Oct 2026',
    terms: 'Applies to electronics when your order is at least ৳1,500. One voucher per order.',
  },
  {
    id: 'shipping',
    code: 'SHIPFREE',
    kind: 'shipping',
    state: 'available',
    tone: 'blue',
    headline: 'FREE',
    caption: 'SHIPPING',
    minimum: 'Min. spend ৳999',
    title: 'Free Shipping Voucher',
    detail: 'Get free shipping on all products',
    when: 'Valid till 15 Nov 2026',
    terms: 'Waives delivery on any order of at least ৳999. It does not apply to cash-on-delivery charges.',
  },
  {
    id: 'all',
    code: 'ALL10',
    kind: 'percent',
    state: 'available',
    tone: 'red',
    headline: '10%',
    caption: 'OFF',
    minimum: 'Min. spend ৳2,000',
    title: 'All Categories',
    detail: 'Get 10% off on any category',
    when: 'Valid till 30 Nov 2026',
    terms: 'Takes 10% off an order of at least ৳2,000 across any category. One voucher per order.',
  },
  {
    id: 'mega',
    code: 'MEGA500',
    kind: 'amount',
    state: 'used',
    tone: 'purple',
    headline: '৳500',
    caption: 'OFF',
    minimum: 'Min. spend ৳5,000',
    title: 'Mega Sale Voucher',
    detail: 'You have already used this voucher',
    when: 'Used on 12 Oct 2026',
    terms: 'This voucher was applied on 12 Oct 2026 and cannot be used again.',
  },
  {
    id: 'weekend',
    code: 'WEEK15',
    kind: 'percent',
    state: 'expired',
    tone: 'muted',
    headline: '15%',
    caption: 'OFF',
    minimum: 'Min. spend ৳3,000',
    title: 'Weekend Special',
    detail: 'This voucher has expired',
    when: 'Expired on 01 Oct 2026',
    terms: 'This offer ended on 01 Oct 2026. It no longer applies at checkout.',
  },
  {
    id: 'welcome',
    code: 'APP100',
    kind: 'amount',
    state: 'available',
    tone: 'orange',
    headline: '৳100',
    caption: 'OFF',
    minimum: 'Min. spend ৳800',
    title: 'Welcome Offer',
    detail: 'Get ৳100 off on your next order',
    when: 'Valid till 31 Dec 2026',
    terms: 'Takes ৳100 off an order of at least ৳800. One welcome voucher per customer.',
  },
];

export const tones = {
  orange: { accent: '#FF7A12', stub: '#FFF1E6', ink: '#FF6A00', button: '#F46D07' },
  blue: { accent: '#2F6BFF', stub: '#E7F1FF', ink: '#2F6BFF', button: '#2F6BFF' },
  red: { accent: '#FF3B4E', stub: '#FFEBEE', ink: '#FF2E3F', button: '#FF2E3F' },
  purple: { accent: '#7C3AED', stub: '#F3EEFF', ink: '#7C3AED', button: '#7C3AED' },
  muted: { accent: '#9AA3B2', stub: '#F1F2F5', ink: '#8B93A3', button: '#9AA3B2' },
};

export function vouchersFor(filter) {
  if (filter === 'all') return vouchers;
  return vouchers.filter((voucher) => voucher.state === filter);
}

export function voucherCount(filter) {
  return vouchersFor(filter).length;
}
