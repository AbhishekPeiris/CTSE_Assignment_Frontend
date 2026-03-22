import React from 'react';

const ProductSummary = ({ products }) => {
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
  const totalCategories = new Set(products.map(p => p.category)).size;

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-primary/10  p-4 sm:p-5 transition hover:border-primary/20 hover:bg-white shadow-sm">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary/70 line-clamp-1">
          Total Products
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-label">{totalProducts}</span>
          <span className="text-[10px] sm:text-sm font-medium text-word/40 leading-none">items</span>
        </p>
      </div>
      <div className="rounded-2xl border border-primary/20  p-4 sm:p-5 transition hover:bg-white shadow-sm">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary/80 line-clamp-1">
          Total Stock
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-primary">{totalStock}</span>
          <span className="text-[10px] sm:text-sm font-medium text-word/40 leading-none">units</span>
        </p>
      </div>
      <div className="rounded-2xl border border-primary/10  p-4 sm:p-5 transition hover:border-primary/20 hover:bg-white shadow-sm">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary/70 line-clamp-1">
          Categories
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-label">{totalCategories}</span>
          <span className="text-[10px] sm:text-sm font-medium text-word/40 leading-none">unique</span>
        </p>
      </div>
    </div>
  );
};

export default ProductSummary;
