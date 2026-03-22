import PropTypes from "prop-types";
import StatusPill from "../../../components/ui/StatusPill";
import { formatMoney } from "../../../utils/helpers";

export default function ProductCard({
  product,
  stock,
  inStock,
  quantityInCart,
  onDecrease,
  onIncrease,
  onAdd,
}) {
  return (
    <article className="p-4 transition bg-white border shadow-sm rounded-3xl border-line hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl">
        <img
          src={
            product?.imageUrl ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
          }
          alt={product?.name || "Product"}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex items-start justify-between gap-3 mt-3">
        <div>
          <h3 className="text-base font-semibold text-label">
            {product?.name || "Unnamed product"}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-[#5f6368]">
            {product?.category || "General"}
          </p>
        </div>
        <StatusPill status={inStock ? "IN_STOCK" : "OUT_OF_STOCK"} />
      </div>

      <p className="mt-2 min-h-[40px] text-sm text-[#5f6368]">
        {product?.description || "No description"}
      </p>

      <div className="flex items-center justify-between mt-3">
        <p className="text-lg font-bold text-label">
          {formatMoney(product?.price)}
        </p>
        <p className="text-xs text-[#5f6368]">Stock: {stock}</p>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          disabled={!inStock || quantityInCart <= 0}
          onClick={onDecrease}
          className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-label disabled:opacity-40"
        >
          -
        </button>
        <span className="text-sm font-semibold text-center min-w-8 text-label">
          {quantityInCart}
        </span>
        <button
          type="button"
          disabled={!inStock || quantityInCart >= stock}
          onClick={onIncrease}
          className="rounded-full border border-line px-2.5 py-1.5 text-xs font-semibold text-label disabled:opacity-40"
        >
          +
        </button>

        <button
          type="button"
          disabled={!inStock}
          onClick={onAdd}
          className="ml-auto rounded-full bg-danger px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-warning disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  stock: PropTypes.number.isRequired,
  inStock: PropTypes.bool.isRequired,
  quantityInCart: PropTypes.number.isRequired,
  onDecrease: PropTypes.func.isRequired,
  onIncrease: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};
