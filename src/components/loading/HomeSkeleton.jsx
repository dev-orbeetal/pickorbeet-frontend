import ProductGridSkeleton from '@/components/loading/ProductGridSkeleton';

export default function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" aria-label="Loading homepage">
      <div className="container-custom py-4">
        <div className="skeleton aspect-[2/1] w-full rounded-2xl sm:aspect-[16/6]" />
        <div className="mt-4">
          <ProductGridSkeleton count={5} />
        </div>
      </div>
    </div>
  );
}
