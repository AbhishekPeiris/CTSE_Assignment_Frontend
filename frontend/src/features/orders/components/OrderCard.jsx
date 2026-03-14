import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, formatMoney } from "../../../utils/helpers";

export default function OrderCard({
  order,
  canUpdateStatus,
  statusOptions,
  statusDraft,
  onStatusChange,
  onUpdateStatus,
}) {
  const orderId = order?._id || order?.id || "";
  const currentStatus = String(order?.status || "PENDING").toUpperCase();

  return (
    <article className="rounded-xl border border-[#edf0f7] bg-[#fcfdff] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-[#1f2937]">{orderId || "Order"}</p>
        <StatusPill status={currentStatus} />
      </div>

      <p className="mt-2 text-sm text-[#4b5563]">
        User: {order?.userId || order?.user?._id || order?.user?.id || "N/A"}
      </p>
      <p className="mt-1 text-sm text-[#1f2937]">
        Total:{" "}
        {formatMoney(order?.totalAmount || order?.amount || order?.total)}
      </p>
      <p className="mt-1 text-xs text-[#6b7280]">
        Created: {formatDate(order?.createdAt)}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        <Link to={`/orders/${orderId}`}>
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </Link>
      </div>

      {canUpdateStatus ? (
        <div className="flex items-center gap-2 mt-3">
          <select
            value={statusDraft || currentStatus}
            onChange={(event) => onStatusChange(orderId, event.target.value)}
            className="rounded-lg border border-[#d9dde8] bg-white px-2.5 py-1.5 text-xs text-[#1f2937] outline-none focus:border-[#1a73e8]"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={() => onUpdateStatus(orderId, currentStatus)}
          >
            Update
          </Button>
        </div>
      ) : null}
    </article>
  );
}
