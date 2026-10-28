export const config = {
  api: {
    bodyParser: { sizeLimit: '32kb' },
  },
};

function header(req, name) {
  const value = req.headers[name];
  if (Array.isArray(value)) return value[0] || '';
  return typeof value === 'string' ? value : '';
}

function djangoCollectUrl() {
  const origin = (process.env.BACKEND_ORIGIN || '').replace(/\/$/, '');
  if (origin) return `${origin}/api/v1/analytics/collect/`;
  const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!api) return '';
  return `${api}/analytics/collect/`;
}

function clientIp(req) {
  const forwarded = header(req, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return header(req, 'x-real-ip').trim().slice(0, 64);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();
    return;
  }

  const target = djangoCollectUrl();
  if (!target) {
    res.status(204).end();
    return;
  }

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? { ...req.body }
    : null;
  if (!body) {
    res.status(400).end();
    return;
  }

  delete body.country;
  delete body.region;
  delete body.city;
  delete body.ip;
  delete body.ip_address;

  const country = header(req, 'x-vercel-ip-country').trim();
  const region = header(req, 'x-vercel-ip-country-region').trim();
  let city = header(req, 'x-vercel-ip-city').trim();
  try {
    city = decodeURIComponent(city);
  } catch {
    // Keep the raw header when it is not encoded.
  }
  if (country) body.country = country.slice(0, 8);
  if (region) body.region = region.slice(0, 120);
  if (city) body.city = city.slice(0, 120);

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': header(req, 'user-agent') || 'pickorbeet-analytics',
    'X-Original-User-Agent': header(req, 'user-agent'),
    'X-Analytics-Secret': process.env.ANALYTICS_INGEST_SECRET || '',
    'X-Visitor-Ip': clientIp(req),
  };
  const authorization = header(req, 'authorization');
  if (authorization.toLowerCase().startsWith('bearer ')) {
    headers.Authorization = authorization;
  }
  ['purpose', 'sec-purpose', 'x-purpose', 'x-moz'].forEach((name) => {
    const value = header(req, name);
    if (value) headers[name] = value;
  });

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    res.status(upstream.status === 400 || upstream.status === 403 ? upstream.status : 204).end();
  } catch {
    res.status(204).end();
  }
}
