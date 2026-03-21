import React from "react";

const EditProductDrawer = ({
  isOpen,
  onClose,
  editingProduct,
  setEditingProduct,
  handleProductUpdate,
  actionLoading,
}) => {
  if (!isOpen || !editingProduct) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out sm:rounded-l-[2rem]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-xl font-bold text-slate-800">Edit Product</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="edit-name">
                  Product Name
                </label>
                <input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(event) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter product name"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="edit-category">
                  Category
                </label>
                <input
                  id="edit-category"
                  value={editingProduct.category}
                  onChange={(event) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Enter category"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="edit-price">
                    Price
                  </label>
                  <input
                    id="edit-price"
                    type="number"
                    min="0"
                    value={editingProduct.price}
                    onChange={(event) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="edit-stock">
                    Stock
                  </label>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(event) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        stock: event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="edit-imageUrl">
                  Image URL
                </label>
                <input
                  id="edit-imageUrl"
                  value={editingProduct.imageUrl}
                  onChange={(event) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="Enter image URL (optional)"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={editingProduct.description}
                  onChange={(event) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Enter product description"
                  className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => {
                handleProductUpdate();
                onClose();
              }}
              disabled={actionLoading.startsWith("update-product") || !editingProduct.name || !editingProduct.price || !editingProduct.category}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {actionLoading.startsWith("update-product") ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProductDrawer;
