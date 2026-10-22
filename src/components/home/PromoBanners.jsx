import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function PromoLink({ href, children, label }) {
  const className = 'group block h-full overflow-hidden rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action';
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('http')) return <a href={href} className={className} aria-label={label}>{children}</a>;
  return <Link href={href} className={className} aria-label={label}>{children}</Link>;
}

export default function PromoBanners({ banners = [] }) {
  const promos = (Array.isArray(banners) ? banners : []).filter((banner) => banner?.image).slice(0, 2);
  if (promos.length === 0) return null;

  return (
    <section className="bg-cream-200" aria-label="Promotions">
      <div className="container-custom py-2 sm:py-3">
        <div className={`grid gap-2.5 sm:gap-3 ${promos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {promos.map((banner) => (
            <PromoLink key={banner.id} href={banner.link || '/products'} label={`${banner.title || 'Promotion'}. Shop now`}>
              <div className="aspect-[2/1] bg-navy-900 sm:aspect-[3/1]">
                <img
                  src={getMediaUrl(banner.image)}
                  alt={banner.title || 'Promotion'}
                  width={640}
                  height={214}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-left sm:object-contain"
                />
              </div>
              <span className="flex items-center justify-between gap-1 bg-white px-2 py-1.5 text-[11px] font-bold text-navy-900">
                {banner.button_label || 'Shop Now'}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </PromoLink>
          ))}
        </div>
      </div>
    </section>
  );
}
