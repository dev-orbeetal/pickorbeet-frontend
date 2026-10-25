export default function CatalogControls({ ordering, onSale, onOrdering, onSaleChange }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <label className="text-sm text-charcoal-600">
        <span className="sr-only">Sort</span>
        <select
          value={ordering}
          onChange={(event) => onOrdering(event.target.value)}
          className="input"
        >
          <option value="-created_at">Newest</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </label>
      <label className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-700">
        <input
          type="checkbox"
          checked={onSale}
          onChange={(event) => onSaleChange(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600"
        />
        On sale
      </label>
    </div>
  );
}

export function catalogQuery({ categorySlug, subcategorySlug, ordering, onSale }) {
  const params = {};
  if (subcategorySlug) params.subcategory_slug = subcategorySlug;
  else if (categorySlug) params.category_slug = categorySlug;
  params.ordering = ordering || '-created_at';
  if (onSale) params.on_sale = 'true';
  return params;
}
