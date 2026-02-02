import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';

export default function CategoryProducts({ categoryProducts }) {
  // Ensure categoryProducts is always an array
  const categoryProductsArray = Array.isArray(categoryProducts) ? categoryProducts : [];

  if (categoryProductsArray.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {categoryProductsArray.map((categoryData, categoryIndex) => (
          <div key={categoryData.category.id} className="mb-16 last:mb-0">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-secondary-900 mb-2">
                  {categoryData.category.name}
                </h2>
                <p className="text-secondary-600">
                  Explore our {categoryData.category.name.toLowerCase()} collection
                </p>
              </div>
              <Link
                href={`/category/${categoryData.category.slug}`}
                className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 mt-4 md:mt-0 group"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryData.products.map((product, productIndex) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: productIndex * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
