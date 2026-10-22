import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductGrid from '@/components/products/ProductGrid';

export default function HomeProductRow({ title, viewAllHref, viewAllLabel, products = [] }) {
  const list = Array.isArray(products) ? products : [];
  if (list.length === 0) return null;

  return (
      <section className="bg-cream-200" aria-labelledby={`home-${String(title).replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="container-custom py-2 sm:py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={`home-${String(title).replace(/\s+/g, '-').toLowerCase()}`} className="text-base font-bold text-charcoal-900 sm:text-lg">{title}</h2>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center text-sm font-semibold text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            {viewAllLabel}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ProductGrid>
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}
