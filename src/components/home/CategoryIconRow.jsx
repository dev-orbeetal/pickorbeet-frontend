import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function ordered(items) {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function SubcategoryTile({ href, name, image }) {
  const src = image ? getMediaUrl(image) : '';

  return (
    <Link href={href} className="group/tile block min-w-0 text-center">
      <span className="block aspect-square overflow-hidden rounded-lg bg-navy-50 transition-colors duration-200 group-hover/tile:bg-navy-100">
        {src ? (
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-smooth group-hover/tile:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
      </span>
      <span className="mt-2 block text-[13px] font-medium leading-tight text-charcoal-800 line-clamp-2 transition-colors duration-200 group-hover/tile:text-navy-800">
        {name}
      </span>
    </Link>
  );
}

export default function CategoryIconRow({ categories = [] }) {
  const list = ordered(Array.isArray(categories) ? categories : []);
  if (list.length === 0) return null;

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-4">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {list.map((category) => {
            const subcategories = ordered(
              (category.subcategories || []).filter((sub) => sub && sub.is_active !== false)
            ).slice(0, 4);

            return (
              <article
                key={category.id}
                className="flex w-full flex-col rounded-xl border border-cream-400 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-elegant"
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={`group/title flex items-center justify-between gap-2 ${subcategories.length > 0 ? 'mb-3' : ''}`}
                >
                  <h2 className="text-[15px] font-bold leading-snug text-charcoal-900 line-clamp-2 transition-colors duration-200 group-hover/title:text-navy-800">
                    {category.name}
                  </h2>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-charcoal-800 transition-transform duration-200 group-hover/title:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                {subcategories.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {subcategories.map((sub) => (
                      <div key={sub.id} className="min-w-0 snap-start">
                        <SubcategoryTile
                          href={`/category/${category.slug}/${sub.slug}`}
                          name={sub.name}
                          image={sub.image}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
