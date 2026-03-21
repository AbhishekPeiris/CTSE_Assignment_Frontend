import { useState } from "react";
import { formatMoney, resolveEntityId } from "../../../../utils/helpers";
import ProductSummary from "./ProductSummary";
import ProductDrawer from "./ProductDrawer";
import EditProductDrawer from "./EditProductDrawer";

const ProductManagement = ({
  productForm,
  setProductForm,
  handleProductCreate,
  actionLoading,
  products,
  setEditingProduct,
  handleProductDelete,
  editingProduct,
  handleProductUpdate,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <ProductSummary products={products} />

      <div className="mb-4 mt-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0f172a]">Products List</h2>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
        >
          + Add Product
        </button>
      </div>

      <ProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        productForm={productForm}
        setProductForm={setProductForm}
        handleProductCreate={handleProductCreate}
        actionLoading={actionLoading}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse bg-white text-left text-sm text-slate-800">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Product</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-600 border-none">Price</th>
                <th className="px-6 py-4 font-semibold text-slate-600 border-none">Stock</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const id = resolveEntityId(product);
                const isLowStock = parseInt(product.stock) < 10 && parseInt(product.stock) > 0;
                const isOutOfStock = parseInt(product.stock) === 0;

                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-transform group-hover:scale-105">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-lg font-bold text-slate-400">
                              {product.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-[220px] mt-0.5">
                            {product.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-[15px]">
                      {formatMoney(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="font-semibold text-slate-800">{product.stock} units</span>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-red-600 shadow-sm ring-1 ring-inset ring-red-500/10">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center rounded-full bg-orange-50 py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 shadow-sm ring-1 ring-inset ring-orange-500/20">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 shadow-sm ring-1 ring-inset ring-emerald-500/10">
                            In Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...product,
                              price: String(product.price ?? ""),
                              stock: String(product.stock ?? ""),
                              imageUrl: product.imageUrl || "",
                            })
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
                          title="Edit Product"
                        >
                          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProductDelete(id)}
                          disabled={actionLoading === `delete-product:${id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 disabled:opacity-50"
                          title="Delete Product"
                        >
                          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-300 mb-5 shadow-inner">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">No products found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Get started by adding a new product to your inventory list. It will appear here once created.</p>
            </div>
          )}
        </div>
      </div>

      <EditProductDrawer
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        handleProductUpdate={handleProductUpdate}
        actionLoading={actionLoading}
      />
    </>
  );
};

export default ProductManagement;
