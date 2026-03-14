import React from "react";
import PropTypes from "prop-types";
import Input from "../../../../components/ui/Input";

const FilterInputs = ({ filters, categories, onChange }) => (
  <div className="mt-5 grid gap-3 xl:grid-cols-[1.5fr_repeat(2,minmax(0,0.75fr))]">
    <Input
      label="Search"
      type="text"
      name="search"
      value={filters.search}
      onChange={onChange}
      placeholder="Find by name, ID, description or category"
      className="rounded-2xl border-[#dce7d2] bg-white/90"
    />
    <div>
      <label
        className="block text-sm font-medium text-[#2d3b35]"
        htmlFor="order-category-filter"
      >
        Category
      </label>
      <select
        id="order-category-filter"
        name="category"
        value={filters.category}
        onChange={onChange}
        className="w-full rounded-md border border-[#dce7d2] bg-white px-4 py-2.5 mt-1 text-sm text-[#1f2937] outline-none transition focus:border-[#2f7d5c] focus:ring-2 focus:ring-[#d8eadf]"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category === "ALL" ? "All categories" : category}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label
        className="mb-1 block text-sm font-medium text-[#2d3b35]"
        htmlFor="order-availability-filter"
      >
        Availability
      </label>
      <select
        id="order-availability-filter"
        name="availability"
        value={filters.availability}
        onChange={onChange}
        className="w-full rounded-md border border-[#dce7d2] bg-white px-4 py-2.5  text-sm text-[#1f2937] outline-none transition focus:border-[#2f7d5c] focus:ring-2 focus:ring-[#d8eadf]"
      >
        <option value="ALL">All products</option>
        <option value="AVAILABLE_ONLY">Available only</option>
        <option value="IN_STOCK">In stock only</option>
      </select>
    </div>
  </div>
);

FilterInputs.propTypes = {
  filters: PropTypes.object.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FilterInputs;
