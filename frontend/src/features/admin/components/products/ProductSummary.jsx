import React from 'react';

const ProductSummary = ({ products }) => {
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
  const totalCategories = new Set(products.map(p => p.category)).size;

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4 sm:p-5">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
          Total Products
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-slate-800">{totalProducts}</span>
          <span className="text-[10px] sm:text-sm font-medium text-slate-500 leading-none">items</span>
        </p>
      </div>
      <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4 sm:p-5">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
          Total Stock
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-blue-600">{totalStock}</span>
          <span className="text-[10px] sm:text-sm font-medium text-slate-500 leading-none">units</span>
        </p>
      </div>
      <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4 sm:p-5">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
          Categories
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-emerald-600">{totalCategories}</span>
          <span className="text-[10px] sm:text-sm font-medium text-slate-500 leading-none">unique</span>
        </p>
      </div>
    </div>
  );
};

export default ProductSummary;
