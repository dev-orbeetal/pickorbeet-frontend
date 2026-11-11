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

function spanClass(count) {
  if (count >= 2) return 'col-span-2';
  return 'col-span-1';
}

function gridClass(count) {
  if (count >= 4) return 'grid-cols-2 sm:grid-cols-4';
  if (count === 3) return 'grid-cols-3';
  if (count === 2) return 'grid-cols-2';
  return 'grid-cols-1';
}

function CategoryTile({ href, name, image, showName }) {
  const src = image ? getMediaUrl(image) : '';

  return (
    <Link href={href} className="group/tile block min-w-0 rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action">
      <span className="block aspect-square overflow-hidden rounded-lg bg-[#F4F7FC]">
        {src ? (
          <img
            src={src}
            alt=""
            width={160}
            height={160}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        ) : null}
      </span>
      {showName && (
        <span className="mt-1.5 block text-[11px] font-medium leading-tight text-charcoal-900 line-clamp-2 min-[400px]:text-xs">
          {name}
        </span>
      )}
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
      <div className="container-custom pb-4 pt-1 sm:py-3">
        <h2 id="home-shop-by-category" className="mb-2.5 text-base font-bold text-charcoal-900 sm:mb-3 sm:text-lg">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 items-start gap-3 lg:grid-cols-4">
          {cards.map(({ category, tiles }) => {
            const named = !(tiles.length === 1 && tiles[0].name === category.name);
            return (
              <article
                key={category.id}
                className={`flex min-w-0 flex-col rounded-xl border border-[#E4E9F2] bg-white p-3 shadow-[0_1px_2px_rgba(23,32,51,0.04)] ${spanClass(tiles.length)}`}
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h3 className="min-w-0 text-[15px] font-bold leading-snug text-charcoal-900">
                    {category.name}
                  </h3>
                  <Link
                    href={`/category/${category.slug}`}
                    className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className={`grid gap-2 ${gridClass(tiles.length)}`}>
                  {tiles.map((tile) => (
                    <CategoryTile key={tile.key} {...tile} showName={named} />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
