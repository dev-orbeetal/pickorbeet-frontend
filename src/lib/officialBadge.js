export const OFFICIAL_BADGE = {
  size: 'medium',
  color: '#2864E8',
  position: 'top-left',
};

const SIZES = ['small', 'medium', 'large'];
const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export function officialBadgeStyle(settings) {
  const size = SIZES.includes(settings?.official_badge_size) ? settings.official_badge_size : OFFICIAL_BADGE.size;
  const raw = String(settings?.official_badge_color || '');
  const color = /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw.toUpperCase() : OFFICIAL_BADGE.color;
  const position = POSITIONS.includes(settings?.official_badge_position) ? settings.official_badge_position : OFFICIAL_BADGE.position;
  return { size, color, position };
}

const CARD_CORNER = {
  'top-left': 'left-1.5 top-1.5',
  'top-right': 'right-1.5 top-1.5',
  'bottom-left': 'left-1.5 bottom-1.5',
  'bottom-right': 'right-1.5 bottom-1.5',
};

const PAGE_CORNER = {
  'top-left': 'left-3 top-3',
  'top-right': 'right-3 top-3',
  'bottom-left': 'left-3 bottom-3',
  'bottom-right': 'right-3 bottom-3',
};

const CARD_BELOW = { small: 'top-7', medium: 'top-8', large: 'top-11' };
const PAGE_BELOW = { small: 'top-10', medium: 'top-12', large: 'top-16' };

export function officialPlacement(style, compact, official = false) {
  const corner = (compact ? CARD_CORNER : PAGE_CORNER)[style.position] || CARD_CORNER['top-left'];
  const below = (compact ? CARD_BELOW : PAGE_BELOW)[style.size] || (compact ? CARD_BELOW.medium : PAGE_BELOW.medium);
  const inset = compact ? 'top-1.5' : 'top-3';
  return {
    badgeClass: `absolute z-10 ${corner}`,
    discountTop: official && style.position === 'top-left' ? below : inset,
    heartTop: official && style.position === 'top-right' ? below : inset,
  };
}

export function checkInk(color) {
  const value = Number.parseInt(color.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 170 ? '#172033' : '#ffffff';
}
