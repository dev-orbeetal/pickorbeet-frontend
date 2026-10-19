import Link from 'next/link';
import { motion } from 'framer-motion';
import { getMediaUrl } from '@/lib/siteConfig';

function PromoLink({ href, children }) {
  const className = 'block h-full';
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('http')) return <a href={href} className={className}>{children}</a>;
  return <Link href={href} className={className}>{children}</Link>;
}

export default function PromoBanners({ banners = [] }) {
  const promos = (Array.isArray(banners) ? banners : []).slice(0, 2);
  if (promos.length === 0) return null;

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-4">
        <div className={`grid gap-4 ${promos.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {promos.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
            >
              <PromoLink href={banner.link}>
                <div className="h-[180px] sm:h-[220px] rounded-2xl overflow-hidden bg-navy-900">
                  <img
                    src={getMediaUrl(banner.image)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </PromoLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
