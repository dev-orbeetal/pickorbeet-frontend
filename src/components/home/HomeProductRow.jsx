import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';

export default function HomeProductRow({ title, viewAllHref, viewAllLabel, products = [] }) {
  const list = Array.isArray(products) ? products : [];
  if (list.length === 0) return null;

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-3">
        <motion.div
          className="mb-4 flex items-end justify-between"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-xl font-bold text-charcoal-900 sm:text-2xl">{title}</h2>
          <Link href={viewAllHref} className="text-sm font-semibold text-blue-600 hover:underline">
            {viewAllLabel} →
          </Link>
        </motion.div>
        <div className="product-grid">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
