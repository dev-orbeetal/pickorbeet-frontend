import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

const TILE_LIMIT = 4;

function ordered(items) {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function hasProducts(item) {
  if (!item) return false;
  if (typeof item.product_count === 'number') return item.product_count > 0;
  return true;
}

function tilesFor(category) {
  const subs = ordered(category.subcategories || [])
    .filter((sub) => sub && sub.is_active !== false && hasProducts(sub))
    .slice(0, TILE_LIMIT)
    .map((sub) => ({
      key: sub.id,
      href: `/category/${category.slug}/${sub.slug}`,
      name: sub.name,
      image: sub.image,
    }));
  if (subs.length > 0) return subs;
  if (!hasProducts(category) || !category.image) return [];
  return [{
    key: category.id,
    href: `/category/${category.slug}`,
    name: category.name,
    image: category.image,
  }];
}

/**
 * Every card is one column. The photos sit in a 2×2 square that is always full,
 * so 1, 2, 3, or 4 tiles cannot change the card's width or leave a gap.
 */
function mosaicCell(count, index) {
  if (count <= 1) return 'col-span-2 row-span-2';
  if (count === 2) return 'row-span-2';
  if (count === 3 && index === 2) return 'col-span-2';
  return '';
}

function CategoryTile({ href, name, image, showName, className }) {
  const [failed, setFailed] = useState(false);
  const src = image && !failed ? getMediaUrl(image) : '';
  const nameOnTile = showName || !src;

  return (
    <Link
      href={href}
      title={name}
      className={`group/tile relative block h-full min-h-0 min-w-0 overflow-hidden rounded-lg bg-[#F4F7FC] ring-1 ring-inset ring-[#E4E9F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-contain p-1.5 transition-transform duration-200 group-hover/tile:scale-[1.04]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs font-semibold text-charcoal-600">
          {name}
        </span>
      )}
      {showName && src && (
        <span className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded-md bg-white/95 px-1.5 py-0.5 text-center text-[11px] font-medium leading-tight text-charcoal-900 shadow-sm sm:text-xs">
          {name}
        </span>
      )}
      {!nameOnTile && <span className="sr-only">{name}</span>}
    </Link>
  );
}

export default function CategoryIconRow({ categories = [] }) {
  const cards = ordered(Array.isArray(categories) ? categories : [])
    .filter(hasProducts)
    .map((category) => ({ category, tiles: tilesFor(category) }))
    .filter((card) => card.tiles.length > 0);

  if (cards.length === 0) return null;

  return (
    <section className="bg-ice" aria-labelledby="home-shop-by-category">
      <div className="container-custom pb-6 pt-1 sm:py-4">
        <h2 id="home-shop-by-category" className="mb-3 text-base font-bold text-charcoal-900 sm:mb-4 sm:text-lg">
          Shop by category
        </h2>
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {cards.map(({ category, tiles }) => {
            const named = !(tiles.length === 1 && tiles[0].name === category.name);
            return (
              <article
                key={category.id}
                className="flex h-full min-w-0 flex-col rounded-xl border border-[#E4E9F2] bg-white p-3 shadow-[0_1px_2px_rgba(23,32,51,0.04)]"
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-[15px] font-bold leading-snug text-charcoal-900" title={category.name}>
                    {category.name}
                  </h3>
                  <Link
                    href={`/category/${category.slug}`}
                    className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-md px-1 text-xs font-semibold text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="relative aspect-square w-full">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5">
                    {tiles.map((tile, index) => (
                      <CategoryTile
                        key={tile.key}
                        {...tile}
                        showName={named}
                        className={mosaicCell(tiles.length, index)}
                      />
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
