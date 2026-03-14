import React from "react";
import PropTypes from "prop-types";
import Button from "../../../../components/ui/Button";

const ProductCardsInCatalog = ({
  products,
  addProductToCart,
  getProductCategory,
  getProductName,
  getProductDescription,
  getProductStock,
  statusClasses,
  normalizeStatus,
  formatMoney,
  resolveEntityId,
}) => (
  <div className="grid gap-3 mt-5 md:grid-cols-2 2xl:grid-cols-3">
    {products.map((product, index) => {
      const productId = resolveEntityId(product) || `product-${index}`;
      const stock = getProductStock(product);
      const isOutOfStock = stock <= 0;
      const status = normalizeStatus(
        product?.status || (isOutOfStock ? "OUT OF STOCK" : "AVAILABLE"),
      );
      return (
        <article
          key={productId}
          className="group rounded-md border border-line bg-white p-4 shadow-lg hover:border-[#b9d1c4] hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8d84]">
                {getProductCategory(product)}
              </p>
              <h4 className="mt-1 text-lg font-semibold text-[#16231d]">
                {getProductName(product)}
              </h4>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClasses(status)}`}
            >
              {status}
            </span>
          </div>
          <p className="min-h-[30px] text-sm leading-6 text-[#5c6a63]">
            {getProductDescription(product)}
          </p>
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f6f3ea] p-3 text-sm text-[#30433b]">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#7a8b83]">
                Price
              </p>
              <p className="mt-1 text-lg font-semibold text-[#163126]">
                {formatMoney(product?.price)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#7a8b83]">
                Stock
              </p>
              <p className="mt-1 text-lg font-semibold text-[#163126]">
                {stock}
              </p>
            </div>
          </div>
          <div className="flex items-center mt-3">
            {/* <p className="truncate text-xs text-[#708078]">SKU: {productId}</p> */}
            <Button
              onClick={() => addProductToCart(product)}
              disabled={isOutOfStock}
              className="rounded-2xl bg-primary] px-4 py-2 text-white shadow-lg hover:bg-primary/80 w-full"
            >
              {isOutOfStock ? "Out of stock" : "Add to order"}
            </Button>
          </div>
        </article>
      );
    })}
  </div>
);

ProductCardsInCatalog.propTypes = {
  products: PropTypes.array.isRequired,
  addProductToCart: PropTypes.func.isRequired,
  getProductCategory: PropTypes.func.isRequired,
  getProductName: PropTypes.func.isRequired,
  getProductDescription: PropTypes.func.isRequired,
  getProductStock: PropTypes.func.isRequired,
  statusClasses: PropTypes.func.isRequired,
  normalizeStatus: PropTypes.func.isRequired,
  formatMoney: PropTypes.func.isRequired,
  resolveEntityId: PropTypes.func.isRequired,
};

export default ProductCardsInCatalog;
