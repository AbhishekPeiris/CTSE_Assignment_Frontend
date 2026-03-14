import React from "react";
import PropTypes from "prop-types";

const CataLogHeader = ({ filteredCount, totalCount }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex gap-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3c7a5e]">
          Sales Catalog
        </p>
        <h3 className="mt-2 text-3xl text-label">Market Counter</h3>
        <p className="mt-2 max-w-2xl text-sm text-[#54645d]">
          Search the full product catalog, filter inventory fast, and tap
          products into the order panel like a checkout workspace.
        </p>
      </div>
      <div className="min-w-[200px] rounded-2xl border border-[#dce7d2] bg-white/85 px-4 py-3 text-sm text-[#28473a] shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-[#7a8b83]">
          Visible SKUs
        </p>
        <p className="mt-2 text-3xl font-semibold text-[#163126]">
          {filteredCount}
        </p>
        <p className="mt-1 text-xs text-[#6b7a73]">
          Filtered from {totalCount} total products
        </p>
      </div>
    </div>
  </div>
);

CataLogHeader.propTypes = {
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
};

export default CataLogHeader;
