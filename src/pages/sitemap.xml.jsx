/**
 * Sitemap of public pages, categories, and every active product.
 */
import siteConfig from '@/lib/siteConfig';
import { loadCatalogIndex, xmlEscape } from '@/lib/serverApi';

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/track-order', changefreq: 'monthly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/returns', changefreq: 'yearly', priority: '0.3' },
];

function absolute(path) {
  if (path === '/') return `${siteConfig.siteUrl}/`;
  return `${siteConfig.siteUrl}${path}`;
}

function lastmod(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function urlEntry({ path, modified, changefreq, priority }) {
  const stamp = lastmod(modified);
  return `  <url>
    <loc>${xmlEscape(absolute(path))}</loc>${stamp ? `
    <lastmod>${stamp}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSiteMap(products, categories) {
  const urls = [
    ...STATIC_PAGES.map((page) => urlEntry(page)),
    ...categories.flatMap((category) => [
      urlEntry({
        path: `/category/${encodeURIComponent(category.slug)}`,
        modified: category.updated_at,
        changefreq: 'weekly',
        priority: '0.8',
      }),
      ...(category.subcategories || []).map((sub) => urlEntry({
        path: `/category/${encodeURIComponent(category.slug)}/${encodeURIComponent(sub.slug)}`,
        modified: sub.updated_at,
        changefreq: 'weekly',
        priority: '0.7',
      })),
    ]),
    ...products.map((product) => urlEntry({
      path: `/product/${encodeURIComponent(product.slug)}`,
      modified: product.updated_at,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export default function SiteMap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const { products, categories } = await loadCatalogIndex();
  const sitemap = generateSiteMap(products, categories);

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
}
