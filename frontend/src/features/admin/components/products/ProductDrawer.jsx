import React from "react";

const inputClass =
  "w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 placeholder:text-[#c4bfb7]";

const labelClass = "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]";

const ProductDrawer = ({
  isOpen,
  onClose,
  productForm,
  setProductForm,
  handleProductCreate,
  actionLoading,
  categories,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#fffdfa] border-l border-[#e7e5df]">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="border-b border-[#efeae2] bg-[#fcfaf6] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Products</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">Add New Product</h2>
            <p className="mt-1 text-sm text-[#8b95a7]">Fill in the details to create a new product.</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl border border-[#e4ddd2] bg-white p-2 text-[#9a8f7a] transition hover:bg-[#f5f0ea] hover:text-[#111827]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            <div className="flex flex-col gap-2">
              <label className={labelClass} htmlFor="name">Product Name</label>
              <input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Organic Apples"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass} htmlFor="category">Category</label>
              <div className="relative">
                <select
                  id="category"
                  value={productForm.category}
                  onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                  className={inputClass + " appearance-none cursor-pointer"}
                >
                  <option value="">Select a category</option>
                  {(categories || []).map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#9a8f7a]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass} htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClass} htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass} htmlFor="imageUrl">
                Image URL <span className="normal-case tracking-normal text-[#b8af9f]">(optional)</span>
              </label>
              <input
                id="imageUrl"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.png"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass} htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={4}
                value={productForm.description}
                onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short product description..."
                className={inputClass + " resize-none"}
              />
            </div>

            {/* Preview pill when ready */}
            {productForm.name && productForm.price && productForm.category && (
              <div className="rounded-[22px] border border-[#e5ede5] bg-[#f3fbf5] px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#15803d]">Ready to create</p>
                <p className="mt-1 text-sm text-[#374151]">
                  <span className="font-semibold">{productForm.name}</span> · {productForm.category} · ${productForm.price}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#efeae2] bg-[#fcfaf6] px-6 py-5">
            <button
              type="button"
              onClick={() => { handleProductCreate(); onClose(); }}
              disabled={actionLoading === "create-product" || !productForm.name || !productForm.price || !productForm.category}
              className="w-full rounded-2xl bg-[#1d4ed8] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === "create-product" ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDrawer;
