import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";
import { formatMoney, normalizeStatus } from "../../../utils/helpers";

export default function ProductCard({
  product,
  canReserve,
  actionLoadingId,
  onReserve,
  onRelease,
}) {
  const productId = product?._id || product?.id || "";
  const status = normalizeStatus(product?.status || "AVAILABLE");

  return (
    <article className="rounded-xl border border-[#edf0f7] bg-[#fcfdff] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#1f2937]">
          {product?.name || product?.title || "Unnamed Product"}
        </h3>
        <StatusPill status={status} />
      </div>

      <p className="mt-2 text-sm text-[#5f6368]">{product?.description || "No description"}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <p className="text-[#1f2937]">Price: {formatMoney(product?.price)}</p>
        <p className="text-[#5f6368]">
          Stock: {product?.stock ?? product?.quantity ?? product?.availableQuantity ?? "N/A"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/products/${productId}`}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>

        {canReserve ? (
          <>
            <Button
              size="sm"
              onClick={() => onReserve(productId)}
              disabled={actionLoadingId === `reserve:${productId}`}
            >
              Reserve
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRelease(productId)}
              disabled={actionLoadingId === `release:${productId}`}
            >
              Release
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
