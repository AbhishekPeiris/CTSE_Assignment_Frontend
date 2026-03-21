import React from "react";
import PropTypes from "prop-types";
import { formatMoney, resolveEntityId } from "../../../../../../utils/helpers";

function ProductImage({ product }) {
  if (product?.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="object-cover w-full h-full"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#fff5d8,_#f3f4f6_65%)] text-xs font-semibold uppercase tracking-[0.25em] text-[#94a3b8]">
      {String(product?.category || "Item").slice(0, 10)}
    </div>
  );
}

ProductImage.propTypes = {
  product: PropTypes.object.isRequired,
};

const SelectProducts = ({
  filteredProducts,
  selectedProduct,
  orderForm,
  setOrderForm,
  handleAddItemToOrderDraft,
}) => {
  return (
    <section className="border-b border-line bg-white p-5 xl:border-b-0 xl:border-r xl:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-word">Admin make order</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-label">
            Select products
          </h3>
        </div>

        {selectedProduct ? (
          <div className="rounded-2xl border border-[#efe7dc] bg-[#fff6ea] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a16207]">
              Current pick
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1f2937]">
              {selectedProduct.name}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 mt-6 sm:grid-cols-2 2xl:grid-cols-3">
        {filteredProducts.map((product) => {
          const productId = resolveEntityId(product);
          const active = productId === orderForm.selectedProductId;

          return (
            <article
              key={productId}
              className={[
                "overflow-hidden rounded-[28px] border bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition",
                active
                  ? "border-[#d8c3a5] ring-2 ring-[#f6d9b0]"
                  : "border-[#efebe5] hover:-translate-y-0.5 hover:border-[#e5d8c2]",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() =>
                  setOrderForm((prev) => ({
                    ...prev,
                    selectedProductId: productId,
                  }))
                }
                className="block w-full text-left"
              >
                <div className="h-40 overflow-hidden rounded-[24px] bg-[#f3f4f6]">
                  <ProductImage product={product} />
                </div>
                <div className="mt-4">
                  <h4 className="text-[22px] font-semibold tracking-[-0.03em] text-[#111827]">
                    {product.name}
                  </h4>
                  <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#6b7280]">
                    {product.description || "No description available."}
                  </p>
                </div>
              </button>

              <div className="flex items-end justify-between gap-4 mt-5">
                <div>
                  <p className="text-[18px] font-semibold text-[#111827]">
                    {formatMoney(product.price || 0)}
                  </p>
                  <p className="mt-1 text-sm text-[#9ca3af]">
                    {product.stock || 0} items in stock
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={active ? orderForm.selectedQuantity : "1"}
                    onChange={(event) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        selectedProductId: productId,
                        selectedQuantity: event.target.value,
                      }))
                    }
                    className="w-16 rounded-2xl border border-[#e7ded3] bg-[#fffdfa] px-3 py-2 text-center text-sm font-semibold text-[#1f2937] outline-none focus:border-[#d8b37a] focus:ring-2 focus:ring-[#fde7c5]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const quantity =
                        active && orderForm.selectedQuantity
                          ? orderForm.selectedQuantity
                          : "1";

                      setOrderForm((prev) => ({
                        ...prev,
                        selectedProductId: productId,
                        selectedQuantity: quantity,
                      }));

                      handleAddItemToOrderDraft(productId, quantity);
                    }}
                    className="rounded-2xl bg-[#1f2937] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111827]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

SelectProducts.propTypes = {
  filteredProducts: PropTypes.array.isRequired,
  selectedProduct: PropTypes.object,
  orderForm: PropTypes.object.isRequired,
  setOrderForm: PropTypes.func.isRequired,
  handleAddItemToOrderDraft: PropTypes.func.isRequired,
};

SelectProducts.defaultProps = {
  selectedProduct: null,
};

export default SelectProducts;
