import { useState } from "react";
import { formatMoney, resolveEntityId } from "../../../../utils/helpers";
import ProductSummary from "./ProductSummary";
import ProductDrawer from "./ProductDrawer";
import EditProductDrawer from "./EditProductDrawer";
import ProductDetailsDrawer from "./ProductDetailsDrawer";

const ProductManagement = ({
  productForm,
  setProductForm,
  handleProductCreate,
  actionLoading,
  products,
  categories,
  setEditingProduct,
  handleProductDelete,
  editingProduct,
  handleProductUpdate,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  return (
    <>
      <ProductSummary products={products} />

      <div className="mb-4 mt-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-label">Products List</h2>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
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
        categories={categories}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse bg-white text-left text-sm text-label">
            <thead className=" border-b border-line">
              <tr>
                <th className="px-6 py-4 font-bold text-primary/70 uppercase tracking-wider text-[10px]">Product Details</th>
                <th className="px-6 py-4 font-bold text-primary/70 uppercase tracking-wider text-[10px]">Category</th>
                <th className="px-6 py-4 font-bold text-primary/70 uppercase tracking-wider text-[10px]">Price</th>
                <th className="px-6 py-4 font-bold text-primary/70 uppercase tracking-wider text-[10px]">Stock Status</th>
                <th className="px-6 py-4 font-bold text-primary/70 uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30">
              {products.map((product) => {
                const id = resolveEntityId(product);
                const isLowStock = parseInt(product.stock) < 10 && parseInt(product.stock) > 0;
                const isOutOfStock = parseInt(product.stock) === 0;

                return (
                  <tr key={id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-[#f0f7ff]/50 shadow-sm transition-transform group-hover:scale-105">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#f0f7ff]/50 text-lg font-bold text-primary/20">
                              {product.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-label">{product.name}</p>
                          <p className="text-xs text-word/60 line-clamp-1 max-w-[220px] mt-0.5">
                            {product.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-semibold text-primary/70 shadow-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-label text-[15px]">
                      {formatMoney(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="font-semibold text-label">{product.stock} units</span>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center rounded-full bg-danger/5 py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-danger shadow-sm border border-danger/10">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center rounded-full bg-warning/5 py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-warning shadow-sm border border-warning/10">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-success/5 py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-success shadow-sm border border-success/10">
                            In Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingProduct(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-line text-word shadow-sm transition-all hover:bg-white hover:text-label hover:border-primary/40 active:scale-95"
                          title="View Details"
                        >
                          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
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
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-line text-word shadow-sm transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/40 active:scale-95"
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
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-line text-word shadow-sm transition-all hover:bg-danger/5 hover:text-danger hover:border-danger/40 active:scale-95 disabled:opacity-50"
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
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fcfaf6] border border-line text-word/20 mb-5 shadow-inner">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-label">No products found</h3>
              <p className="mt-2 text-sm text-word/50 max-w-sm mx-auto">Get started by adding a new product to your inventory list. It will appear here once created.</p>
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
        categories={categories}
      />

      <ProductDetailsDrawer
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
      />
    </>
  );
};

export default ProductManagement;
