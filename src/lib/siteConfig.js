const siteConfig = {
  name: 'PickOrbeet',
  title: 'PickOrbeet - Shop Smarter, Live Better',
  description: 'Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products, fast delivery, and secure payment across Bangladesh.',
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pickorbeet.com').replace(/\/+$/, ''),
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://pickorbeet.com/api/v1',
  logo: '/images/logo.png',
  mark: '/android-chrome-512x512.png',
  ogImage: '/og.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: 'PickOrbeet — Shop Smarter, Live Better',
  locale: 'en_US',
  themeColor: '#141B4D',
  twitterHandle: '@pickorbeet',
  currency: 'BDT',
};

const SHARE_IMAGE_SPECS = {
  '/og.jpg': {
    width: siteConfig.ogImageWidth,
    height: siteConfig.ogImageHeight,
    type: siteConfig.ogImageType,
  },
  '/images/og-default.jpg': {
    width: siteConfig.ogImageWidth,
    height: siteConfig.ogImageHeight,
    type: 'image/jpeg',
  },
  '/api/og': {
    width: siteConfig.ogImageWidth,
    height: siteConfig.ogImageHeight,
    type: 'image/jpeg',
  },
};

function clipText(value, max) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text || text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const breakAt = sliced.lastIndexOf(' ');
  return `${(breakAt > max * 0.6 ? sliced.slice(0, breakAt) : sliced).trim()}…`;
}

function isFetchableImageUrl(image) {
  try {
    const url = new URL(image);
    if (image.length >= 800) return false;
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const siteIsPublic = siteConfig.siteUrl.startsWith('https://');
    if (local) return !siteIsPublic && url.protocol === 'http:';
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Absolute URL for a share image. Pages with their own title or photo get a
 * 1200×630 card from /api/og. Everything else uses the static brand card.
 */
export function buildOgImageUrl({ title, eyebrow, price, image } = {}) {
  const params = new URLSearchParams();
  const safeTitle = clipText(title, 90);
  const safeEyebrow = clipText(eyebrow, 40);
  const safePrice = clipText(price, 16);

  if (safeTitle) params.set('title', safeTitle);
  if (safeEyebrow) params.set('eyebrow', safeEyebrow);
  if (safePrice) params.set('price', safePrice);
  if (image && isFetchableImageUrl(image)) params.set('image', image);

  if ([...params.keys()].length === 0) {
    return `${siteConfig.siteUrl}${siteConfig.ogImage}`;
  }

  return `${siteConfig.siteUrl}/api/og?${params.toString()}`;
}

export function shareImageSpec(imageUrl) {
  try {
    return SHARE_IMAGE_SPECS[new URL(imageUrl).pathname] || null;
  } catch {
    return null;
  }
}

/**
 * Resolve an image URL to an absolute URL for OG tags.
 * Handles: absolute URLs, relative /media paths, and local /images paths.
 */
export function getAbsoluteImageUrl(imageUrl) {
  if (!imageUrl) return `${siteConfig.siteUrl}${siteConfig.ogImage}`;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/media')) {
    const serverBase = siteConfig.apiUrl.replace(/\/api\/v1\/?$/, '');
    return `${serverBase}${imageUrl}`;
  }
  return `${siteConfig.siteUrl}${imageUrl}`;
}

/**
 * Build a full media URL from an image path returned by the API.
 * Handles: absolute URLs (returned as-is), relative /media paths, and missing values.
 */
export function getMediaUrl(url, placeholder) {
  if (!url) return placeholder || '/images/placeholder-product.png';
  if (url.startsWith('http')) return url;
  const serverBase = siteConfig.apiUrl.replace(/\/api\/v1\/?$/, '');
  return `${serverBase}${url}`;
}

export default siteConfig;
