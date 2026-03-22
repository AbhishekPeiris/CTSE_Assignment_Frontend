import React from "react";
import PropTypes from "prop-types";
import { formatMoney, resolveEntityId } from "../../../../../../utils/helpers";

function ProductImage({ product }) {
  if (product?.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="object-cover w-20 h-20"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-white text-xs font-semibold uppercase tracking-[0.25em] text-[#94a3b8]">
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
      </div>

      <div className="grid gap-5 mt-3 sm:grid-cols-2 2xl:grid-cols-2">
        {filteredProducts.map((product) => {
          const productId = resolveEntityId(product);
          const active = productId === orderForm.selectedProductId;

          return (
            <article
              key={productId}
              className={[
                "overflow-hidden rounded-2xl border bg-white p-4 shadow-xl transition",
                active ? "gradient-border shadow-xl" : "border-line ",
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
                <div className="flex items-center gap-4">
                  <div className="h-20 overflow-hidden rounded-xl bg-white">
                    <ProductImage product={product} />
                  </div>
                  <div>
                    <p className="text- font-semibold text-[#111827]">
                      {formatMoney(product.price || 0)}
                    </p>
                    <p className="mt-1 text-xs text-word">
                      {product.stock || 0} items in stock
                    </p>
                  </div>
                </div>
              </button>

              <div className="items-end justify-between gap-4 mt-3">
                <div>
                  <h4 className="text-md font-semibold tracking-[-0.03em] text-word">
                    {product.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2 mt-2 justify-between">
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
                    className="w-16 rounded-2xl border border-line bg-white px-3 py-1 text-center text-sm font-semibold text-word"
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
                    className="rounded-full bg-danger px-2.5 py-1 text-sm font-semibold text-white transition hover:bg-warning"
                  >
                    +
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
