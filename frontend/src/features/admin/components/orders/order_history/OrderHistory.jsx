import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import ErrorMessage from "../../../../../components/ui/ErrorMessage";
import Loader from "../../../../../components/ui/Loader";
import StatusPill from "../../../../../components/ui/StatusPill";
import { OrderService } from "../../../../../services/order.service";
import {
  formatDate,
  formatMoney,
  normalizeStatus,
  resolveEntityId,
} from "../../../../../utils/helpers";

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

const TRACKING_STEPS = [
  "PENDING",
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

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
  return (
    String(
      tracking?.delivery?.status || tracking?.orderStatus || order?.status || "PENDING",
    ).toUpperCase()
  );
}

function getItemName(item) {
  return item?.name || item?.product?.name || item?.productName || "Product";
}

export default function OrderHistory({
  orders,
  normalizeRole,
  orderStatusDrafts,
  setOrderStatusDrafts,
  handleOrderStatusUpdate,
  handleCancelOrderAsAdmin,
  handleDeleteOrder,
  actionLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [trackingState, setTrackingState] = useState({
    loading: false,
    error: "",
    data: null,
  });

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatches =
        statusFilter === "ALL" || normalizeRole(order?.status) === statusFilter;

      if (!statusMatches) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        resolveEntityId(order),
        order?.userContactNumber,
        order?.customerName,
        order?.user?.name,
        order?.paymentMethod,
        order?.deliveryLocation?.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [normalizeRole, orders, searchTerm, statusFilter]);

  useEffect(() => {
    if (!filteredOrders.length) {
      setSelectedOrderId("");
      return;
    }

    if (!filteredOrders.some((order) => resolveEntityId(order) === selectedOrderId)) {
      setSelectedOrderId(resolveEntityId(filteredOrders[0]));
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = useMemo(() => {
    return (
      orders.find((order) => resolveEntityId(order) === selectedOrderId) || null
    );
  }, [orders, selectedOrderId]);

  useEffect(() => {
    let cancelled = false;

    const loadTracking = async () => {
      if (!selectedOrderId) {
        setTrackingState({
          loading: false,
          error: "",
          data: null,
        });
        return;
      }

      setTrackingState((prev) => ({
        ...prev,
        loading: true,
        error: "",
      }));

      try {
        const tracking = await OrderService.getOrderTracking(selectedOrderId);

        if (cancelled) {
          return;
        }

        setTrackingState({
          loading: false,
          error: "",
          data: tracking,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTrackingState({
          loading: false,
          error:
            error?.friendlyMessage ||
            error?.message ||
            "Unable to load delivery tracking details",
          data: null,
        });
      }
    };

    loadTracking();

    return () => {
      cancelled = true;
    };
  }, [selectedOrderId]);

  const selectedOrderStatus = String(selectedOrder?.status || "").toUpperCase();
  const isTerminal = TERMINAL_STATUSES.has(selectedOrderStatus);
  const deliveryAssignment = getDeliveryAssignment(
    selectedOrder,
    trackingState.data,
  );
  const deliveryStatus = getDeliveryStatus(selectedOrder, trackingState.data);

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#e7e5df] bg-[#fffdfa] shadow-[0_22px_80px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[760px] gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-[#efeae2] bg-[#fcfaf6] p-5 xl:border-b-0 xl:border-r">
          <div>
            <p className="text-sm font-medium text-[#9a8f7a]">Client orders</p>
            <h3 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-[#111827]">
              Order history
            </h3>
            <p className="mt-2 text-sm text-[#8b95a7]">
              Search by order id, customer phone number, or delivery address.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search orders"
              className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="OUT_FOR_DELIVERY">Out for delivery</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED_BY_USER">Cancelled by user</option>
              <option value="CANCELLED_BY_ADMIN">Cancelled by admin</option>
              <option value="CANCELLED_BY_DELIVERY">Cancelled by delivery</option>
            </select>
          </div>

          <div className="mt-5 space-y-3">
            {filteredOrders.length ? (
              filteredOrders.map((order) => {
                const orderId = resolveEntityId(order);
                const active = orderId === selectedOrderId;
                const status = normalizeRole(order?.status);

                return (
                  <button
                    key={orderId}
                    type="button"
                    onClick={() => setSelectedOrderId(orderId)}
                    className={[
                      "flex w-full items-start gap-3 rounded-[24px] border px-4 py-4 text-left transition",
                      active
                        ? "border-[#d7c1a1] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                        : "border-[#ece6dd] bg-[#fffdfa] hover:border-[#dccdb7] hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#ede6dc,_#f8f5ef)] text-sm font-semibold text-[#7c6f60]">
                      #{String(orderId).slice(-2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-base font-semibold text-[#111827]">
                          {getDisplayName(order)}
                        </p>
                        <StatusPill status={status} />
                      </div>
                      <p className="mt-1 truncate text-sm text-[#6b7280]">
                        {order?.userContactNumber || "No contact number"}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#94a3b8]">
                        <span>{formatDate(order?.createdAt)}</span>
                        <span>{formatMoney(order?.totalAmount || 0)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#ddd4c7] bg-white p-5 text-sm text-[#8b95a7]">
                No orders match the current search or filter.
              </div>
            )}
          </div>
        </aside>

        <section className="bg-white p-5 xl:p-7">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#9a8f7a]">
                    Selected order
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-[32px] font-semibold tracking-[-0.03em] text-[#111827]">
                      {getDisplayName(selectedOrder)}
                    </h3>
                    <StatusPill status={selectedOrder.status} />
                  </div>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    Order ID #{resolveEntityId(selectedOrder)} • Created{" "}
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
                          {selectedOrder.deliveryLocation?.address || "No address provided"}
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
                                {deliveryAssignment.deliveryUserName || "Assigned delivery user"}
                              </span>
                            </p>
                            <p>
                              Delivery user ID: {deliveryAssignment.deliveryUserId}
                            </p>
                            <p>
                              Assigned at: {formatDateTime(deliveryAssignment.assignedAt)}
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
                        value={orderStatusDrafts[resolveEntityId(selectedOrder)] || ""}
                        onChange={(event) =>
                          setOrderStatusDrafts((prev) => ({
                            ...prev,
                            [resolveEntityId(selectedOrder)]: event.target.value,
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
                          actionLoading ===
                            `status-order:${resolveEntityId(selectedOrder)}`
                        }
                        className="w-full rounded-2xl bg-[#8f8a83] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7e786f] disabled:opacity-50"
                      >
                        {actionLoading ===
                        `status-order:${resolveEntityId(selectedOrder)}`
                          ? "Updating status..."
                          : "Update order status"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancelOrderAsAdmin(selectedOrder)}
                        disabled={
                          isTerminal ||
                          actionLoading ===
                            `cancel-order:${resolveEntityId(selectedOrder)}`
                        }
                        className="w-full rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-50"
                      >
                        {actionLoading ===
                        `cancel-order:${resolveEntityId(selectedOrder)}`
                          ? "Cancelling order..."
                          : "Cancel order as admin"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(resolveEntityId(selectedOrder))}
                        disabled={
                          actionLoading ===
                          `delete-order:${resolveEntityId(selectedOrder)}`
                        }
                        className="w-full rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6] disabled:opacity-50"
                      >
                        {actionLoading ===
                        `delete-order:${resolveEntityId(selectedOrder)}`
                          ? "Deleting..."
                          : "Delete permanently"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-[28px] border border-dashed border-[#ddd4c7] bg-[#fcfaf6] p-8 text-center text-sm text-[#8b95a7]">
              Select an order from the left side to view full details and delivery tracking.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

OrderHistory.propTypes = {
  orders: PropTypes.array.isRequired,
  normalizeRole: PropTypes.func.isRequired,
  orderStatusDrafts: PropTypes.object.isRequired,
  setOrderStatusDrafts: PropTypes.func.isRequired,
  handleOrderStatusUpdate: PropTypes.func.isRequired,
  handleCancelOrderAsAdmin: PropTypes.func.isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};
