import Head from 'next/head';
import { useRouter } from 'next/router';
import siteConfig from '@/lib/siteConfig';

/**
 * SEO Component — handles all meta, OG, Twitter Card, and JSON-LD tags.
 *
 * @param {string} title - Page title
 * @param {string} description - Page meta description
 * @param {string} image - Absolute URL to OG image
 * @param {string} type - OG type (website, article, product, etc.)
 * @param {string} url - Canonical URL override
 * @param {boolean} noindex - Set to true to prevent indexing
 * @param {object} product - Product data for structured data
 * @param {object} jsonLd - Custom JSON-LD structured data
 */
export default function SEO({
  title,
  description,
  image,
  type = 'website',
  url,
  noindex = false,
  product = null,
  jsonLd = null,
}) {
  const router = useRouter();

  const seo = {
    title: title || siteConfig.title,
    description: description || siteConfig.description,
    image: image || `${siteConfig.siteUrl}${siteConfig.ogImage}`,
    url: url || `${siteConfig.siteUrl}${router.asPath.split('?')[0]}`,
    type,
  };

  // Build Product JSON-LD structured data
  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || product.short_description || seo.description,
        image: product.images || [seo.image],
        sku: product.sku || undefined,
        brand: {
          '@type': 'Brand',
          name: siteConfig.name,
        },
        offers: {
          '@type': 'Offer',
          url: seo.url,
          priceCurrency: siteConfig.currency,
          price: product.price,
          availability: product.in_stock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: siteConfig.name,
          },
        },
      }
    : null;

  // Organization JSON-LD (for homepage / sitewide)
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}${siteConfig.logo}`,
    sameAs: [],
  };

  const structuredData = jsonLd || productJsonLd || (router.pathname === '/' ? organizationJsonLd : null);

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook / WhatsApp / Telegram */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content={siteConfig.locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      {siteConfig.twitterHandle && (
        <meta name="twitter:site" content={siteConfig.twitterHandle} />
      )}

      {/* Product-specific OG tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={siteConfig.currency} />
          <meta
            property="product:availability"
            content={product.in_stock ? 'in stock' : 'out of stock'}
          />
          <meta property="product:brand" content={siteConfig.name} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
