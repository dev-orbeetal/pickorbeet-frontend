export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-full bg-[#F4F7FC]" aria-busy="true" aria-live="polite" aria-label="Loading product">
      {/* Mobile Flutter-shaped skeleton */}
      <div className="px-4 pb-7 pt-2 lg:hidden">
        <div className="rounded-2xl bg-white p-2 shadow-[0_8px_24px_rgba(23,32,51,0.05)]">
          <div className="skeleton aspect-[1.42] rounded-xl" />
          <div className="mt-2 flex gap-2">
            <div className="skeleton h-16 w-[72px] rounded-[10px]" />
            <div className="skeleton h-16 w-[72px] rounded-[10px]" />
          </div>
        </div>
        <div className="mt-3.5 space-y-3">
          <div className="skeleton h-7 w-4/5 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-9 w-48 rounded" />
          <div className="skeleton h-9 w-full rounded-[10px]" />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="skeleton h-12 rounded-[10px]" />
            <div className="skeleton h-12 rounded-[10px]" />
          </div>
          <div className="skeleton h-16 w-full rounded-2xl" />
        </div>
        <div className="mt-4 skeleton h-40 rounded-2xl" />
      </div>

      {/* Desktop skeleton */}
      <div className="hidden lg:block">
        <div className="container-custom py-4">
          <div className="skeleton mb-4 h-4 w-64 rounded" />
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.17fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-[#E6ECF5] bg-white p-3">
              <div className="skeleton aspect-[4/3] rounded-xl" />
              <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                <div className="skeleton h-[72px] rounded-[10px]" />
                <div className="skeleton h-[72px] rounded-[10px]" />
                <div className="skeleton h-[72px] rounded-[10px]" />
                <div className="skeleton h-[72px] rounded-[10px]" />
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-[#E6ECF5] bg-white p-6">
              <div className="skeleton h-3 w-40 rounded" />
              <div className="skeleton h-8 w-4/5 rounded" />
              <div className="skeleton h-4 w-36 rounded" />
              <div className="skeleton h-4 w-52 rounded" />
              <div className="skeleton h-10 w-48 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton h-12 rounded-[10px]" />
                <div className="skeleton h-12 rounded-[10px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[#E6ECF5] bg-white">
          <div className="container-custom grid gap-6 py-5 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="skeleton h-8 w-80 rounded" />
              <div className="skeleton h-28 rounded" />
            </div>
            <div className="skeleton h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
