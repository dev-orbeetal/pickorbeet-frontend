import Head from 'next/head';
import { useRouter } from 'next/router';
import siteConfig, { shareImageSpec } from '@/lib/siteConfig';
import { buildProductStructuredData, buildSiteJsonLd, schemaPrice } from '@/lib/seo';

function cleanText(value, max) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const breakAt = sliced.lastIndexOf(' ');
  return `${(breakAt > max * 0.6 ? sliced.slice(0, breakAt) : sliced).trim()}…`;
}

function absoluteShareImage(image) {
  if (!image) return `${siteConfig.siteUrl}${siteConfig.ogImage}`;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return `${siteConfig.siteUrl}${image}`;
  return `${siteConfig.siteUrl}${siteConfig.ogImage}`;
}

/**
 * SEO — title, description, Open Graph, Twitter, and JSON-LD.
 * Share images are absolute https URLs with dimensions only when the file
 * actually matches those dimensions.
 */
export default function SEO({
  title,
  description,
  image,
  imageAlt,
  type = 'website',
  url,
  noindex = false,
  product = null,
  jsonLd = null,
}) {
  const router = useRouter();
  const path = router.asPath.split('?')[0];
  const canonicalPath = path === '/' ? '/' : path.replace(/\/+$/, '') || '/';

  const seo = {
    title: cleanText(title || siteConfig.title, 90),
    description: cleanText(description || siteConfig.description, 200),
    image: absoluteShareImage(image),
    url: url || `${siteConfig.siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}`,
    type,
  };
  const alt = cleanText(imageAlt || seo.title || siteConfig.ogImageAlt, 120);
  const spec = shareImageSpec(seo.image);
  const secureImage = seo.image.startsWith('https://') ? seo.image : null;

  const priceAmount = product ? schemaPrice(product.price) : null;
  const productJsonLd = product
    ? buildProductStructuredData({
      ...product,
      description: product.description || product.short_description || seo.description,
      images: product.images?.length ? product.images : [seo.image],
      prices: product.prices?.length ? product.prices : [product.price],
    }, seo.url)
    : null;

  const structuredData = jsonLd || productJsonLd || (router.pathname === '/' ? buildSiteJsonLd() : null);

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      <meta
        name="robots"
        content={noindex
          ? 'noindex,nofollow'
          : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}
      />

      <meta property="og:type" content={seo.type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      {secureImage && <meta property="og:image:secure_url" content={secureImage} />}
      {spec?.type && <meta property="og:image:type" content={spec.type} />}
      {spec?.width && <meta property="og:image:width" content={String(spec.width)} />}
      {spec?.height && <meta property="og:image:height" content={String(spec.height)} />}
      <meta property="og:image:alt" content={alt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content={alt} />
      {siteConfig.twitterHandle && (
        <meta name="twitter:site" content={siteConfig.twitterHandle} />
      )}

      {product && (
        <>
          {priceAmount && <meta property="product:price:amount" content={priceAmount} />}
          <meta property="product:price:currency" content={siteConfig.currency} />
          <meta
            property="product:availability"
            content={product.in_stock ? 'in stock' : 'out of stock'}
          />
          <meta property="product:brand" content={product.brand || siteConfig.name} />
        </>
      )}

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
