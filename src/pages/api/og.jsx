import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: {
    responseLimit: '8mb',
  },
};

const NAVY = '#141B4D';
const ORANGE = '#FF7D16';
const ICE = '#F4F7FE';
const MUTED = '#C9D4EE';

let assetsPromise;

function loadAssets() {
  if (!assetsPromise) {
    assetsPromise = Promise.all([
      readFile(path.join(process.cwd(), 'public/fonts/Inter-Regular.ttf')),
      readFile(path.join(process.cwd(), 'public/fonts/Inter-Bold.ttf')),
      readFile(path.join(process.cwd(), 'public/images/logo.png')),
    ]).then(([regular, bold, logo]) => ({
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
      logo: `data:image/png;base64,${logo.toString('base64')}`,
    }));
  }
  return assetsPromise;
}

function one(value) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function plain(value, max) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function isAllowedImageUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  const local = host === 'localhost' || host === '127.0.0.1';
  if (url.protocol === 'http:' && local) return true;
  if (url.protocol !== 'https:') return false;
  return host === 'pickorbeet.com' || host.endsWith('.pickorbeet.com');
}

async function loadRemoteImage(raw) {
  if (!raw || !isAllowedImageUrl(raw)) return null;
  let current = raw;

  for (let hop = 0; hop < 2; hop += 1) {
    if (!isAllowedImageUrl(current)) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
          'User-Agent': 'PickOrbeetShareImage/1.0',
        },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) return null;
        current = new URL(location, current).toString();
        continue;
      }
      if (response.status !== 200) return null;
      const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type)) return null;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 5_000_000) return null;
      return `data:${type};base64,${bytes.toString('base64')}`;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

function formatPrice(value) {
  const numeric = Number(String(value || '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  const digits = Number.isInteger(numeric) ? 0 : 2;
  const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(numeric);
  return `Tk ${amount}`;
}

function Wordmark({ size = 34 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: size, fontWeight: 700, letterSpacing: -1 }}>
      <span style={{ color: '#FFFFFF' }}>Pick</span>
      <span style={{ color: ORANGE }}>Orbeet</span>
    </div>
  );
}

function BrandCard({ logo, title, eyebrow, priceLabel }) {
  const headline = title || 'Shop smarter, live better.';
  const kicker = (eyebrow || 'Online store').toUpperCase();

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        background: NAVY,
        color: '#FFFFFF',
        fontFamily: 'Inter',
      }}
    >
      <div style={{ width: 12, height: 630, background: ORANGE }} />
      <div style={{ width: 1188, height: 630, display: 'flex', alignItems: 'center', padding: '0 64px' }}>
        <div
          style={{
            width: 392,
            height: 392,
            borderRadius: 42,
            background: ICE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={logo} alt="" width={320} height={376} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 56, width: 600 }}>
          <div style={{ display: 'flex', color: ORANGE, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
            {kicker}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              fontSize: headline.length > 42 ? 48 : 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: '#FFFFFF',
            }}
          >
            {headline}
          </div>
          {priceLabel ? (
            <div style={{ display: 'flex', marginTop: 28, fontSize: 42, fontWeight: 700, color: ORANGE }}>
              {priceLabel}
            </div>
          ) : (
            <div style={{ display: 'flex', marginTop: 24, fontSize: 26, color: MUTED }}>
              Original products. Fast delivery across Bangladesh.
            </div>
          )}
          <div style={{ display: 'flex', marginTop: 36, fontSize: 22, color: MUTED }}>
            www.pickorbeet.com
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ logo, photo, title, eyebrow, priceLabel }) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        background: NAVY,
        color: '#FFFFFF',
        fontFamily: 'Inter',
      }}
    >
      <div style={{ width: 12, height: 630, background: ORANGE }} />
      <div
        style={{
          width: 536,
          height: 630,
          background: ICE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={photo} alt="" width={480} height={540} style={{ objectFit: 'contain' }} />
      </div>
      <div
        style={{
          width: 652,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 52px 48px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: ICE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <img src={logo} alt="" width={48} height={56} />
          </div>
          <Wordmark />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {eyebrow ? (
            <div style={{ display: 'flex', color: ORANGE, fontSize: 18, fontWeight: 700, letterSpacing: 1.5 }}>
              {eyebrow.toUpperCase()}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              marginTop: eyebrow ? 14 : 0,
              fontSize: title.length > 48 ? 40 : 48,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: -1,
              color: '#FFFFFF',
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {priceLabel ? (
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: ORANGE }}>{priceLabel}</div>
          ) : null}
          <div style={{ display: 'flex', marginTop: 12, fontSize: 22, color: MUTED }}>www.pickorbeet.com</div>
        </div>
      </div>
    </div>
  );
}

async function renderCard(element, fonts) {
  const image = new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts,
  });
  const png = Buffer.from(await image.arrayBuffer());
  return sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

function send(res, body, type) {
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline');
  res.status(200).send(body);
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).end();
    return;
  }

  const fallbackPath = path.join(process.cwd(), 'public/og.jpg');
  const title = plain(one(req.query.title), 90);
  const eyebrow = plain(one(req.query.eyebrow), 40);
  const priceLabel = formatPrice(one(req.query.price));
  const imageUrl = plain(one(req.query.image), 800);

  if (!title && !eyebrow && !priceLabel && !imageUrl) {
    send(res, await readFile(fallbackPath), 'image/jpeg');
    return;
  }

  try {
    const assets = await loadAssets();
    const photo = imageUrl ? await loadRemoteImage(imageUrl) : null;
    const element = photo
      ? (
        <ProductCard
          logo={assets.logo}
          photo={photo}
          title={title || 'PickOrbeet'}
          eyebrow={eyebrow}
          priceLabel={priceLabel}
        />
      )
      : (
        <BrandCard
          logo={assets.logo}
          title={title}
          eyebrow={eyebrow}
          priceLabel={priceLabel}
        />
      );

    const jpeg = await renderCard(element, assets.fonts);
    if (req.method === 'HEAD') {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', String(jpeg.length));
      res.status(200).end();
      return;
    }
    send(res, jpeg, 'image/jpeg');
  } catch (error) {
    console.error('og image failed', error);
    try {
      send(res, await readFile(fallbackPath), 'image/jpeg');
    } catch {
      res.status(500).end();
    }
  }
}
