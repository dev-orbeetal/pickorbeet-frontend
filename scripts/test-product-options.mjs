/**
 * Lightweight checks for galleryForSelection (no Jest in this package).
 * Run: node scripts/test-product-options.mjs
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modPath = path.join(root, 'src/lib/productOptions.js');
const { galleryForSelection, galleryMediaForSelection, candidateVariants, matchedVariant } = await import(pathToFileURL(modPath).href);

const white = { id: 'v-white', is_active: true, options: [{ name: 'Color', label: 'White' }] };
const black = { id: 'v-black', is_active: true, options: [{ name: 'Color', label: 'Black' }] };
const whiteM = {
  id: 'v-white-m',
  is_active: true,
  options: [
    { name: 'Size', label: 'M' },
    { name: 'Color', label: 'White' },
  ],
};
const whiteL = {
  id: 'v-white-l',
  is_active: true,
  options: [
    { name: 'Size', label: 'L' },
    { name: 'Color', label: 'White' },
  ],
};
const blackM = {
  id: 'v-black-m',
  is_active: true,
  options: [
    { name: 'Size', label: 'M' },
    { name: 'Color', label: 'Black' },
  ],
};

const shared = { id: 'i-shared', image: '/shared.png', variant: null };
const whiteImg = { id: 'i-white', image: '/white.png', variant: 'v-white' };
const blackImg = { id: 'i-black', image: '/black.png', variant: 'v-black' };
const whiteMImg = { id: 'i-white-m', image: '/white-m.png', variant: 'v-white-m' };
const whiteLImg = { id: 'i-white-l', image: '/white-l.png', variant: 'v-white-l' };

{
  const product = { images: [shared, whiteImg, blackImg], variants: [white, black] };
  const gallery = galleryForSelection(product, white, { Color: 'White' });
  assert.deepEqual(gallery.map((i) => i.id), ['i-white']);
}

{
  const product = {
    images: [shared, whiteMImg, whiteLImg, { id: 'i-black-m', image: '/black-m.png', variant: 'v-black-m' }],
    variants: [whiteM, whiteL, blackM],
  };
  // Color only — no full SKU match yet.
  const gallery = galleryForSelection(product, null, { Color: 'White' });
  assert.deepEqual(gallery.map((i) => i.id).sort(), ['i-white-l', 'i-white-m']);
}

{
  const product = { images: [shared, whiteImg, blackImg], variants: [white, black] };
  const gallery = galleryForSelection(product, null, {});
  assert.deepEqual(gallery.map((i) => i.id), ['i-shared']);
}

{
  const product = { images: [shared], variants: [white, black] };
  const gallery = galleryForSelection(product, white, { Color: 'White' });
  assert.deepEqual(gallery.map((i) => i.id), ['i-shared']);
}

{
  const matches = candidateVariants(
    { variants: [whiteM, whiteL, blackM] },
    { Color: 'White' },
  );
  assert.deepEqual(matches.map((v) => v.id).sort(), ['v-white-l', 'v-white-m']);
}

{
  const product = {
    images: [shared, whiteImg],
    videos: [
      { id: 'vid-1', youtube_id: 'dQw4w9WgXcQ', youtube_url: 'https://youtu.be/dQw4w9WgXcQ', variant: null },
      { id: 'vid-white', youtube_id: 'abcdefghijk', youtube_url: 'https://youtu.be/abcdefghijk', variant: 'v-white' },
    ],
    variants: [white, black],
  };
  const media = galleryMediaForSelection(product, white, { Color: 'White' });
  assert.deepEqual(media.map((item) => `${item.type}:${item.id || item.youtube_id}`), [
    'image:i-white',
    'video:vid-white',
  ]);
}

{
  // An in-stock match wins over an out-of-stock duplicate; an out-of-stock option stays selectable.
  const groups = [{ name: 'Color', required: true, values: [] }];
  const soldOut = { id: 'sold-out', is_active: true, availability: 'out_of_stock', options: [{ name: 'Color', label: 'White' }] };
  const inStock = { id: 'in-stock', is_active: true, availability: 'in_stock', options: [{ name: 'Color', label: 'White' }] };
  assert.equal(matchedVariant(groups, [soldOut, inStock], { Color: 'White' }).id, 'in-stock');
  assert.equal(matchedVariant(groups, [soldOut], { Color: 'White' }).id, 'sold-out');
}

console.log('productOptions gallery checks passed');
