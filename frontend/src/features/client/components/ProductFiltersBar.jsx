import PropTypes from "prop-types";

export default function ProductFiltersBar({ filters, categories, onChange }) {
  return (
    <section className="p-4 shadow-sm rounded-3xl bg-success sm:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(200px,1fr)_200px_auto]">
        <input
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Search products"
                  className="w-full rounded-full border border-line bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
        />

        <select
          value={filters.category}
          onChange={(event) => onChange("category", event.target.value)}
          className="w-full rounded-full border border-line bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-3 text-sm text-[#3c4043]">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => onChange("inStock", event.target.checked)}
          />
          <span>In stock only</span>
        </label>
      </div>
    </section>
  );
}

ProductFiltersBar.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    inStock: PropTypes.bool,
  }).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
