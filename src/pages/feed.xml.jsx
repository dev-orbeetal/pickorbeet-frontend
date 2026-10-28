/**
 * Google Merchant product feed for Bangladesh prices.
 */
import siteConfig, { getAbsoluteImageUrl } from '@/lib/siteConfig';
import { loadCatalogIndex, xmlEscape } from '@/lib/serverApi';

function plain(value, max) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trim();
}

function feedItem(product) {
  if (!product.image || !product.price || !product.slug) return '';
  const title = plain(product.name, 150);
  const description = plain(
    product.short_description || `${product.name} price in Bangladesh at PickOrbeet.`,
    5000,
  );
  const link = `${siteConfig.siteUrl}/product/${encodeURIComponent(product.slug)}`;
  return `    <item>
      <g:id>${xmlEscape(product.slug)}</g:id>
      <g:title>${xmlEscape(title)}</g:title>
      <g:description>${xmlEscape(description)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(getAbsoluteImageUrl(product.image))}</g:image_link>
      <g:availability>${product.in_stock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${xmlEscape(product.price)} BDT</g:price>
      <g:brand>${xmlEscape(product.brand || siteConfig.name)}</g:brand>
      <g:condition>new</g:condition>
    </item>`;
}

function generateFeed(products) {
  const items = products.map(feedItem).filter(Boolean);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(siteConfig.name)}</title>
    <link>${xmlEscape(siteConfig.siteUrl)}</link>
    <description>Product prices in Bangladesh from ${xmlEscape(siteConfig.name)}</description>
${items.join('\n')}
  </channel>
</rss>`;
}

export default function ProductFeed() {
  return null;
}

export async function getServerSideProps({ res }) {
  const { products } = await loadCatalogIndex();
  const feed = generateFeed(products);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(feed);
  res.end();

  return { props: {} };
}
