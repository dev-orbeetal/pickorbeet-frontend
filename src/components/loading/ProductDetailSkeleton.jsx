export default function ProductDetailSkeleton() {
  return (
    <div className="container-custom py-16" aria-busy="true" aria-live="polite" aria-label="Loading product">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/4 rounded" />
          <div className="skeleton h-24 rounded" />
          <div className="skeleton h-11 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
