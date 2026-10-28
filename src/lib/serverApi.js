import siteConfig from '@/lib/siteConfig';

export async function fetchApi(path) {
  const response = await fetch(`${siteConfig.apiUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    return { ok: false, status: response.status, data: null };
  }
  return { ok: true, status: response.status, data: await response.json() };
}

export function productRows(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.results) ? data.results : [];
}

export function serializable(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function loadCatalogIndex() {
  try {
    const result = await fetchApi('/products/catalog-index/');
    if (!result.ok || !result.data) return { products: [], categories: [] };
    return {
      products: Array.isArray(result.data.products) ? result.data.products : [],
      categories: Array.isArray(result.data.categories) ? result.data.categories : [],
    };
  } catch (error) {
    return { products: [], categories: [] };
  }
}
