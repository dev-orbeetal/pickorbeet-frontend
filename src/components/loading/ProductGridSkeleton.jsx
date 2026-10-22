import ProductGrid from '@/components/products/ProductGrid';
import ProductCardSkeleton from '@/components/loading/ProductCardSkeleton';

export default function ProductGridSkeleton({ count = 8, sidebar = false, className = '' }) {
  return (
    <div aria-busy="true" aria-live="polite" aria-label="Loading products">
      <ProductGrid sidebar={sidebar} className={className}>
        {Array.from({ length: count }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </ProductGrid>
    </div>
  );
}
