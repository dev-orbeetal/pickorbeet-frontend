/**
 * Dynamic sitemap.xml generation.
 * Fetches all products and categories from the API and generates a sitemap.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zzuhana.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.zzuhana.com/api/v1';

function generateSiteMap(products, categories) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Category Pages -->
  ${categories
    .map(
      (cat) => `
  <url>
    <loc>${SITE_URL}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${
    cat.subcategories
      ?.map(
        (sub) => `
  <url>
    <loc>${SITE_URL}/category/${cat.slug}/${sub.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join('') || ''
  }`
    )
    .join('')}

  <!-- Product Pages -->
  ${products
    .map(
      (product) => `
  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
    <lastmod>${product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;
}

export default function SiteMap() {
  // getServerSideProps handles the response
}

export async function getServerSideProps({ res }) {
  let products = [];
  let categories = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products/?page_size=1000`),
      fetch(`${API_BASE_URL}/products/categories/`),
    ]);

    if (productsRes.ok) {
      const data = await productsRes.json();
      products = data.results || data || [];
    }
    if (categoriesRes.ok) {
      categories = await categoriesRes.json();
    }
  } catch (error) {
    // Silently fail — return sitemap with static pages only
  }

  const sitemap = generateSiteMap(products, categories);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
}
