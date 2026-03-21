import React from "react";
import PropTypes from "prop-types";
import ErrorMessage from "../../../../../../components/ui/ErrorMessage";
import Loader from "../../../../../../components/ui/Loader";
import StatusPill from "../../../../../../components/ui/StatusPill";
import {
  formatMoney,
  normalizeStatus,
  resolveEntityId,
} from "../../../../../../utils/helpers";

const ORDER_STATUS_OPTIONS_ADMIN = [
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_DELIVERY",
];

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED_BY_USER",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_DELIVERY",
]);

const TRACKING_STEPS = ["PENDING", "ASSIGNED", "OUT_FOR_DELIVERY", "COMPLETED"];

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDisplayName(order) {
  return (
    order?.customerName ||
    order?.user?.name ||
    order?.deliveryAssignment?.deliveryUserName ||
    "Walk-in Customer"
  );
}

function getDeliveryAssignment(order, tracking) {
  return tracking?.deliveryAssignment || order?.deliveryAssignment || null;
}

function getDeliveryStatus(order, tracking) {
  return String(
    tracking?.delivery?.status ||
      tracking?.orderStatus ||
      order?.status ||
      "PENDING",
  ).toUpperCase();
}

function getItemName(item) {
  return item?.name || item?.product?.name || item?.productName || "Product";
}

const SelectedOrder = ({
  selectedOrder,
  trackingState,
  orderStatusDrafts,
  setOrderStatusDrafts,
  handleOrderStatusUpdate,
  handleCancelOrderAsAdmin,
  handleDeleteOrder,
  actionLoading,
}) => {
  if (!selectedOrder) {
    return (
      <section className="bg-white p-5 xl:p-7">
        <div className="flex min-h-[520px] items-center justify-center rounded-[28px] border border-dashed border-[#ddd4c7] bg-[#fcfaf6] p-8 text-center text-sm text-[#8b95a7]">
          Select an order from the left side to view full details and delivery
          tracking.
        </div>
      </section>
    );
  }

  const selectedOrderStatus = String(selectedOrder?.status || "").toUpperCase();
  const isTerminal = TERMINAL_STATUSES.has(selectedOrderStatus);
  const deliveryAssignment = getDeliveryAssignment(
    selectedOrder,
    trackingState.data,
  );
  const deliveryStatus = getDeliveryStatus(selectedOrder, trackingState.data);
  const selectedOrderId = resolveEntityId(selectedOrder);

  return (
    <section className="bg-white p-5 xl:p-7">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#9a8f7a]">Selected order</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h3 className="text-[32px] font-semibold tracking-[-0.03em] text-[#111827]">
                {getDisplayName(selectedOrder)}
              </h3>
              <StatusPill status={selectedOrder.status} />
            </div>
            <p className="mt-2 text-sm text-[#6b7280]">
              Order ID #{selectedOrderId} • Created{" "}
              {formatDateTime(selectedOrder.createdAt)}
            </p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Customer phone:{" "}
              {selectedOrder.userContactNumber || "Not available"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-[24px] border border-[#efe7dc] bg-[#fff8ee] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a16207]">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#111827]">
                {formatMoney(selectedOrder.totalAmount || 0)}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#e5efe8] bg-[#f3fbf5] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                Loyalty used
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#111827]">
                {selectedOrder.loyaltyPointsUsed || 0}
              </p>
            </div>
          </div>
        </div>

        <ErrorMessage message={trackingState.error} />

        <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#ece6dc] bg-[#fdfaf5] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8f7a]">
                    Status timeline
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#111827]">
                    Order and delivery progress
                  </p>
                </div>
                {trackingState.loading ? (
                  <Loader text="Loading tracking..." />
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                {TRACKING_STEPS.map((step, index) => {
                  const currentIndex = TRACKING_STEPS.indexOf(deliveryStatus);
                  const active = currentIndex >= index;
                  const timestamp =
                    step === "PENDING"
                      ? selectedOrder.createdAt
                      : step === "ASSIGNED"
                        ? deliveryAssignment?.assignedAt
                        : step === "OUT_FOR_DELIVERY"
                          ? trackingState.data?.delivery?.updatedAt
                          : selectedOrder.completedAt ||
                            trackingState.data?.delivery?.updatedAt;

                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={[
                            "flex h-4 w-4 rounded-full border-2",
                            active
                              ? "border-[#22c55e] bg-[#22c55e]"
                              : "border-[#d8d3ca] bg-white",
                          ].join(" ")}
                        />
                        {index === TRACKING_STEPS.length - 1 ? null : (
                          <span
                            className={[
                              "mt-1 h-10 w-px",
                              active ? "bg-[#9ad7ae]" : "bg-[#e5e7eb]",
                            ].join(" ")}
                          />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-base font-semibold text-[#111827]">
                          {normalizeStatus(step)}
                        </p>
                        <p className="mt-1 text-sm text-[#8b95a7]">
                          {formatDateTime(timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {selectedOrderStatus.startsWith("CANCELLED") ? (
                  <div className="rounded-2xl border border-[#fee2e2] bg-[#fff1f2] px-4 py-3">
                    <p className="text-sm font-semibold text-[#b91c1c]">
                      {normalizeStatus(selectedOrderStatus)}
                    </p>
                    <p className="mt-1 text-sm text-[#7f1d1d]">
                      This order is in a terminal state.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ece6dc] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8f7a]">
                    Order items
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#111827]">
                    {selectedOrder.items?.length || 0} items in this order
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#475569]">
                  {selectedOrder.paymentMethod || "CASH_ON_DELIVERY"}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    key={`${item.productId || item._id || index}`}
                    className="flex items-center justify-between gap-3 rounded-[22px] border border-[#efe7dc] bg-[#fffdfa] px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#111827]">
                        {getItemName(item)}
                      </p>
                      <p className="mt-1 text-sm text-[#8b95a7]">
                        Qty {item.quantity || 0}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#374151]">
                      {formatMoney(
                        Number(item.price || 0) * Number(item.quantity || 0),
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-[#efeae2] pt-4 text-sm text-[#6b7280]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111827]">
                    {formatMoney(selectedOrder.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Loyalty discount</span>
                  <span className="font-semibold text-[#166534]">
                    - {formatMoney(selectedOrder.loyaltyDiscount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#efeae2] pt-3">
                  <span className="text-base font-semibold text-[#374151]">
                    Final total
                  </span>
                  <span className="text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                    {formatMoney(selectedOrder.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#ece6dc] bg-[#fdfaf5] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8f7a]">
                Delivery details
              </p>
              <div className="mt-4 grid gap-4">
                <div className="rounded-[22px] border border-[#e8e0d5] bg-white p-4">
                  <p className="text-sm font-semibold text-[#111827]">
                    Delivery address
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                    {selectedOrder.deliveryLocation?.address ||
                      "No address provided"}
                  </p>
                  <p className="mt-2 text-xs text-[#94a3b8]">
                    {selectedOrder.deliveryLocation?.latitude || "-"},{" "}
                    {selectedOrder.deliveryLocation?.longitude || "-"}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#e8e0d5] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#111827]">
                      Delivery tracking
                    </p>
                    <StatusPill status={deliveryStatus} />
                  </div>

                  {deliveryAssignment?.deliveryUserId ? (
                    <div className="mt-3 space-y-2 text-sm text-[#6b7280]">
                      <p>
                        Rider:{" "}
                        <span className="font-semibold text-[#111827]">
                          {deliveryAssignment.deliveryUserName ||
                            "Assigned delivery user"}
                        </span>
                      </p>
                      <p>
                        Delivery user ID: {deliveryAssignment.deliveryUserId}
                      </p>
                      <p>
                        Assigned at:{" "}
                        {formatDateTime(deliveryAssignment.assignedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#8b95a7]">
                      No delivery assignment is attached to this order yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ece6dc] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8f7a]">
                Admin actions
              </p>
              <div className="mt-4 space-y-3">
                <select
                  value={orderStatusDrafts[selectedOrderId] || ""}
                  onChange={(event) =>
                    setOrderStatusDrafts((prev) => ({
                      ...prev,
                      [selectedOrderId]: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#e4ddd2] bg-[#fffdfa] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
                >
                  <option value="">Set new status</option>
                  {ORDER_STATUS_OPTIONS_ADMIN.map((option) => (
                    <option key={option} value={option}>
                      {normalizeStatus(option)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleOrderStatusUpdate(selectedOrder)}
                  disabled={
                    isTerminal ||
                    actionLoading === `status-order:${selectedOrderId}`
                  }
                  className="w-full rounded-2xl bg-[#8f8a83] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7e786f] disabled:opacity-50"
                >
                  {actionLoading === `status-order:${selectedOrderId}`
                    ? "Updating status..."
                    : "Update order status"}
                </button>

                <button
                  type="button"
                  onClick={() => handleCancelOrderAsAdmin(selectedOrder)}
                  disabled={
                    isTerminal ||
                    actionLoading === `cancel-order:${selectedOrderId}`
                  }
                  className="w-full rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-50"
                >
                  {actionLoading === `cancel-order:${selectedOrderId}`
                    ? "Cancelling order..."
                    : "Cancel order as admin"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrderId)}
                  disabled={actionLoading === `delete-order:${selectedOrderId}`}
                  className="w-full rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6] disabled:opacity-50"
                >
                  {actionLoading === `delete-order:${selectedOrderId}`
                    ? "Deleting..."
                    : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

SelectedOrder.propTypes = {
  selectedOrder: PropTypes.object,
  trackingState: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    data: PropTypes.object,
  }).isRequired,
  orderStatusDrafts: PropTypes.object.isRequired,
  setOrderStatusDrafts: PropTypes.func.isRequired,
  handleOrderStatusUpdate: PropTypes.func.isRequired,
  handleCancelOrderAsAdmin: PropTypes.func.isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};

SelectedOrder.defaultProps = {
  selectedOrder: null,
};

export default SelectedOrder;
