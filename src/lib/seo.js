import siteConfig, { getAbsoluteImageUrl } from '@/lib/siteConfig';

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function schemaPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return amount.toFixed(2);
}

export function displayPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return `৳${Math.round(amount).toLocaleString('en-US')}`;
}

export function absoluteUrl(path) {
  if (!path) return siteConfig.siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  if (path === '/') return `${siteConfig.siteUrl}/`;
  return `${siteConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function productBrand(product) {
  const rows = Array.isArray(product?.specifications) ? product.specifications : [];
  const match = rows.find((row) => (
    String(row?.name || '').trim().toLowerCase() === 'brand' && String(row?.value || '').trim()
  ));
  return match ? String(match.value).trim() : '';
}

/** Distinct BDT prices for a product and its active variants. */
export function offerPrices(product) {
  const variants = Array.isArray(product?.variants)
    ? product.variants.filter((variant) => variant && variant.is_active !== false)
    : [];
  const amounts = variants.map((variant) => (
    variant.effective_price != null && variant.effective_price !== ''
      ? variant.effective_price
      : variant.price
  ));
  if (product?.price != null && product.price !== '') amounts.push(product.price);
  return [...new Set(amounts.map(schemaPrice).filter(Boolean))];
}

export function productPriceTitle(name) {
  const label = plainText(name) || 'Product';
  return `${label} Price in Bangladesh | PickOrbeet`;
}

export function categoryPriceTitle(name) {
  const label = plainText(name) || 'Products';
  return `${label} Price in Bangladesh | PickOrbeet`;
}

export function productPriceDescription({ name, price, inStock, summary }) {
  const money = displayPrice(price);
  const label = plainText(name) || 'This product';
  const lead = money
    ? `${label} price in Bangladesh is ${money}.`
    : `${label} price in Bangladesh.`;
  const availability = inStock ? 'In stock' : 'Currently unavailable';
  const extra = plainText(summary);
  return [lead, `${availability} at PickOrbeet with delivery across Bangladesh.`, extra]
    .filter(Boolean)
    .join(' ');
}

export function categoryPriceDescription(name, detail) {
  const label = plainText(name) || 'products';
  const extra = plainText(detail);
  const lead = `Compare ${label} prices in Bangladesh at PickOrbeet. Original products with delivery across Bangladesh.`;
  return extra ? `${extra} ${lead}` : lead;
}

export function catalogFiltersActive(query = {}) {
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const search = plainText(first(query.search));
  const onSale = plainText(first(query.on_sale));
  const ordering = plainText(first(query.ordering));
  return Boolean(
    search
    || onSale
    || query.category
    || query.size
    || query.min_price
    || query.max_price
    || (ordering && ordering !== '-created_at')
  );
}

function prune(value) {
  if (Array.isArray(value)) return value.map(prune);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined && entry !== null && entry !== '')
        .map(([key, entry]) => [key, prune(entry)]),
    );
  }
  return value;
}

function returnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'BD',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 3,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    merchantReturnLink: `${siteConfig.siteUrl}/returns`,
  };
}

function breadcrumbNode(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.filter((crumb) => crumb?.name).map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path || '/'),
    })),
  };
}

export function buildSiteJsonLd(contact) {
  const organization = {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.siteUrl}${siteConfig.mark}`,
      width: 512,
      height: 512,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Bangladesh',
    },
    email: contact?.contact_email_1 || undefined,
    telephone: contact?.contact_phone_1 || undefined,
    address: contact?.contact_address
      ? {
        '@type': 'PostalAddress',
        streetAddress: contact.contact_address,
        addressCountry: 'BD',
      }
      : undefined,
  };

  return prune({
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.siteUrl,
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.siteUrl}/products?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });
}

export function buildProductStructuredData(product, pageUrl) {
  const prices = (Array.isArray(product?.prices) ? product.prices : [])
    .map(schemaPrice)
    .filter(Boolean);
  const unique = [...new Set(prices)];
  const sorted = unique.slice().sort((left, right) => Number(left) - Number(right));
  const availability = product?.in_stock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  const policy = returnPolicy();
  const seller = {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
  };

  let offers;
  if (sorted.length > 1) {
    offers = {
      '@type': 'AggregateOffer',
      url: pageUrl,
      priceCurrency: siteConfig.currency,
      lowPrice: sorted[0],
      highPrice: sorted[sorted.length - 1],
      offerCount: sorted.length,
      availability,
      seller,
      hasMerchantReturnPolicy: policy,
    };
  } else if (sorted.length === 1) {
    offers = {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: siteConfig.currency,
      price: sorted[0],
      availability,
      seller,
      hasMerchantReturnPolicy: policy,
    };
  }

  const reviewCount = Number(product?.review_count) || 0;
  const rating = Number(product?.rating_average);
  const productNode = {
    '@type': 'Product',
    name: product?.name,
    description: product?.description,
    image: product?.images?.length ? product.images : undefined,
    sku: product?.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: product?.brand || siteConfig.name,
    },
    offers,
    aggregateRating: reviewCount > 0 && rating >= 1 && rating <= 5
      ? {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      }
      : undefined,
  };

  const crumbs = Array.isArray(product?.breadcrumbs) ? product.breadcrumbs : [];
  const graph = [productNode];
  if (crumbs.length) graph.push(breadcrumbNode(crumbs));

  return prune({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}

export function buildListingJsonLd({ name, path, products = [], breadcrumbs = [] }) {
  const url = absoluteUrl(path);
  const graph = [
    {
      '@type': 'CollectionPage',
      name,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.siteUrl,
      },
    },
  ];
  if (breadcrumbs.length) graph.push(breadcrumbNode(breadcrumbs));
  if (products.length) {
    graph.push({
      '@type': 'ItemList',
      name,
      itemListElement: products.slice(0, 24).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: absoluteUrl(`/product/${product.slug}`),
          image: product.primary_image ? getAbsoluteImageUrl(product.primary_image) : undefined,
          offers: schemaPrice(product.price)
            ? {
              '@type': 'Offer',
              priceCurrency: siteConfig.currency,
              price: schemaPrice(product.price),
              availability: product.is_out_of_stock
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
              url: absoluteUrl(`/product/${product.slug}`),
            }
            : undefined,
        },
      })),
    });
  }
  return prune({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}
