import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';

export default function FeaturedProducts({ products }) {
  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  if (productsArray.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="section-title mb-4">Featured Products</h2>
            <p className="text-secondary-600 max-w-xl">
              Handpicked selections of our most popular and trending items
            </p>
          </div>
          <Link
            href="/products?featured=true"
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 mt-4 md:mt-0 group"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsArray.slice(0, 8).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
