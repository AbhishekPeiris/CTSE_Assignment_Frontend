import React from "react";
import PropTypes from "prop-types";

const CategorySection = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div>
      <p className="text-sm font-medium text-word">Choose</p>
      <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-label">
        Category
      </h3>
      <div className="mt-3 space-y-3">
        {categories.map((category) => {
          const active = category.name === selectedCategory;
          return (
            <button
              key={category.name}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-4 py-2 text-left transition",
                active
                  ? "border-line bg-success text-white shadow-xl"
                  : "border-line bg-white text-word hover:bg-line/10",
              ].join(" ")}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {category.name}
                </p>
                <p
                  className={[
                    "text-xs",
                    active ? "text-white/75" : "text-[#9ca3af]",
                  ].join(" ")}
                >
                  {category.count} product{category.count === 1 ? "" : "s"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

CategorySection.propTypes = {
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  setSelectedCategory: PropTypes.func.isRequired,
};

export default CategorySection;
