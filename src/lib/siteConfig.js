const siteConfig = {
  name: 'Zzuhana',
  title: 'Zzuhana - Premium Clothing Store',
  description: 'Your destination for premium quality clothing. Discover the latest fashion trends in Borkha, Hijab, Abaya, Niqab and more with exceptional quality.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zzuhana.com',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://server.zzuhana.com/api/v1',
  logo: '/images/logo.png',
  ogImage: '/images/og-default.jpg',
  locale: 'en_US',
  themeColor: '#8B2942',
  twitterHandle: '@zzuhana',
  currency: 'BDT',
};

/**
 * Resolve an image URL to an absolute URL for OG tags.
 * Handles: absolute URLs, relative /media paths, and local /images paths.
 */
export function getAbsoluteImageUrl(imageUrl) {
  if (!imageUrl) return `${siteConfig.siteUrl}${siteConfig.ogImage}`;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/media')) {
    const serverBase = siteConfig.apiUrl.replace('/api/v1', '');
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
  const serverBase = siteConfig.apiUrl.replace('/api/v1', '');
  return `${serverBase}${url}`;
}

export default siteConfig;
