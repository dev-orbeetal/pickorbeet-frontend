export default function ProductCardSkeleton() {
  return (
    <article aria-hidden="true" className="flex h-full min-w-0 flex-col rounded-xl border border-[#E4E9F2] bg-white p-2">
      <div className="skeleton aspect-square rounded-md" />
      <div className="skeleton mt-2 h-4 rounded" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      <div className="skeleton mt-2 h-4 w-1/3 rounded" />
      <div className="skeleton mt-3 h-7 rounded-md" />
    </article>
  );
}
