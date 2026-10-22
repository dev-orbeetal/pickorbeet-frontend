import Link from 'next/link';
import { getMediaUrl } from '@/lib/siteConfig';

function PromoLink({ href, children, label }) {
  const className = 'group block h-full overflow-hidden rounded-md bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action min-[960px]:rounded-2xl';
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('http')) return <a href={href} className={className} aria-label={label}>{children}</a>;
  return <Link href={href} className={className} aria-label={label}>{children}</Link>;
}

export default function PromoBanners({ banners = [] }) {
  const promos = (Array.isArray(banners) ? banners : []).filter((banner) => banner?.image).slice(0, 2);
  if (promos.length === 0) return null;

  return (
    <section className="bg-ice" aria-label="Promotions">
      <div className="container-custom pb-3 pt-2 sm:py-3">
        <div className={`grid gap-2 sm:gap-3 ${promos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {promos.map((banner) => (
            <PromoLink key={banner.id} href={banner.link || '/products'} label={banner.title || 'Promotion'}>
              <div className="aspect-[3/1]">
                <img
                  src={getMediaUrl(banner.image)}
                  alt={banner.title || 'Promotion'}
                  width={640}
                  height={214}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </PromoLink>
          ))}
        </div>
      </div>
    </section>
  );
}
