import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

export default function HomeProductRow({ title, viewAllHref, viewAllLabel, products = [] }) {
  const scroller = useRef(null);
  const list = Array.isArray(products) ? products : [];
  if (list.length === 0) return null;

  const scrollByCards = (direction) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * (node.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-3">
        <motion.div
          className="flex items-end justify-between mb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">{title}</h2>
          <Link href={viewAllHref} className="text-sm font-semibold text-gold-600 hover:text-gold-500">
            {viewAllLabel} →
          </Link>
        </motion.div>
        <div className="relative">
          <div
            ref={scroller}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
          >
            {list.map((product, index) => (
              <motion.div
                key={product.id}
                className="snap-start shrink-0 w-[200px] sm:w-[220px] lg:w-[230px]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          {list.length > 4 && (
            <>
              <motion.button
                type="button"
                aria-label={`Previous ${title}`}
                onClick={() => scrollByCards(-1)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="hidden md:flex absolute -left-3 top-1/3 w-9 h-9 rounded-full bg-white border border-cream-400 shadow items-center justify-center text-navy-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                type="button"
                aria-label={`Next ${title}`}
                onClick={() => scrollByCards(1)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="hidden md:flex absolute -right-3 top-1/3 w-9 h-9 rounded-full bg-white border border-cream-400 shadow items-center justify-center text-navy-900"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
