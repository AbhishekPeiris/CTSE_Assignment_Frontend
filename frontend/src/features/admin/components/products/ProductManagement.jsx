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

      <div className="overflow-x-auto rounded-xl border border-[#e5edf8]">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#f8fbff]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Category
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Price
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Stock
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const id = resolveEntityId(product);

              return (
                <tr key={id} className="border-t border-[#edf2fb]">
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {product.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {product.category}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {formatMoney(product.price)}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {product.stock}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    <div className="flex items-center gap-2">
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
                        className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProductDelete(id)}
                        disabled={actionLoading === `delete-product:${id}`}
                        className="rounded-full bg-[#dc2626] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#b91c1c] disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
