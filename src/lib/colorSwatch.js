const SWATCHES = {
  black: '#171717',
  white: '#F7F7F7',
  red: '#E11D48',
  blue: '#3B82F6',
  green: '#16A34A',
  yellow: '#F5C518',
  orange: '#FF7A1A',
  purple: '#7C3AED',
  pink: '#EC4899',
  brown: '#8B5E3C',
  gray: '#9CA3AF',
  grey: '#9CA3AF',
  navy: '#1E3A8A',
  beige: '#E7D7C5',
  maroon: '#7F1D1D',
  olive: '#6B7C3A',
  silver: '#C5CDD8',
};

export function swatchHex(name) {
  const key = String(name || '').trim().toLowerCase();
  return SWATCHES[key] || null;
}
