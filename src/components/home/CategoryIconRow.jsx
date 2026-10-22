import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function ordered(items) {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function SubcategoryTile({ href, name, image }) {
  const src = image ? getMediaUrl(image) : '';

  return (
    <Link href={href} className="group/tile block min-w-0 rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action">
      <span className="block aspect-square overflow-hidden rounded-lg bg-[#F5F7FC]">
        {src ? (
          <img
            src={src}
            alt=""
            width={160}
            height={160}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
      <span className="mt-1.5 block text-[11px] font-medium leading-tight text-charcoal-900 line-clamp-3 min-[400px]:text-xs">
        {name}
      </span>
    </Link>
  );
}

export default function CategoryIconRow({ categories = [] }) {
  const list = ordered(Array.isArray(categories) ? categories : []);
  if (list.length === 0) return null;

  return (
    <section className="bg-cream-200" aria-label="Shop by category">
      <div className="container-custom grid grid-cols-1 items-start gap-3 py-2 sm:grid-cols-2 sm:gap-4 sm:py-3">
        {list.map((category) => {
          const subcategories = ordered(
            (category.subcategories || []).filter((sub) => sub && sub.is_active !== false)
          ).slice(0, 4);

          return (
            <article
              key={category.id}
              className="flex w-full min-w-0 flex-col rounded-xl border border-[#E4E9F2] bg-white p-3 shadow-[0_1px_2px_rgba(23,32,51,0.04)] sm:p-4"
            >
              <div className={`flex items-center justify-between gap-2 ${subcategories.length > 0 ? 'mb-3' : ''}`}>
                <h2 className="min-w-0 text-[15px] font-bold leading-snug text-charcoal-900">
                  {category.name}
                </h2>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  View All
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {subcategories.length > 0 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {subcategories.map((sub) => (
                    <SubcategoryTile
                      key={sub.id}
                      href={`/category/${category.slug}/${sub.slug}`}
                      name={sub.name}
                      image={sub.image}
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
