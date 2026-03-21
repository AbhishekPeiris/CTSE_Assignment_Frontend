import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import StatusPill from "../../../../../components/ui/StatusPill";
import { formatDate, formatMoney } from "../../../../../utils/helpers";

const ORDER_STATUS_OPTIONS_ADMIN = [
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_DELIVERY",
];

const OrderHistory = ({
  orders,
  normalizeRole,
  orderStatusDrafts,
  setOrderStatusDrafts,
  orderAssignmentDrafts,
  setOrderAssignmentDrafts,
  deliveryUsers,
  handleOrderStatusUpdate,
  handleAssignDeliveryToOrder,
  handleCancelOrderAsAdmin,
  handleDeleteOrder,
  actionLoading,
}) => {
  return (
    <div className="mt-4 space-y-3">
      {orders.map((order) => {
        const orderId = order._id || order.id;
        const status = normalizeRole(order.status);
        const isTerminal = [
          "COMPLETED",
          "CANCELLED_BY_USER",
          "CANCELLED_BY_ADMIN",
          "CANCELLED_BY_DELIVERY",
        ].includes(status);
        return (
          <article
            key={orderId}
            className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">
                  Order {orderId}
                </p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Customer: {order.userContactNumber} · Created:{" "}
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusPill status={status} />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-[#334155] md:grid-cols-3">
              <p>Items: {order.items?.length || 0}</p>
              <p>Total: {formatMoney(order.totalAmount)}</p>
              <p>Loyalty used: {order.loyaltyPointsUsed || 0}</p>
            </div>
            <div className="grid gap-2 mt-3 md:grid-cols-3">
              <select
                value={orderStatusDrafts[orderId] || ""}
                onChange={(event) =>
                  setOrderStatusDrafts((prev) => ({
                    ...prev,
                    [orderId]: event.target.value,
                  }))
                }
                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-xs"
              >
                <option value="">Set status...</option>
                {ORDER_STATUS_OPTIONS_ADMIN.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={orderAssignmentDrafts[orderId]?.deliveryUserId || ""}
                onChange={(event) =>
                  setOrderAssignmentDrafts((prev) => ({
                    ...prev,
                    [orderId]: {
                      ...prev[orderId],
                      deliveryUserId: event.target.value,
                    },
                  }))
                }
                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-xs"
              >
                <option value="">Assign delivery user...</option>
                {deliveryUsers.map((user) => (
                  <option key={user._id || user.id} value={user._id || user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOrderStatusUpdate(order)}
                  disabled={
                    isTerminal || actionLoading === `status-order:${orderId}`
                  }
                  className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Update status
                </button>
                <button
                  type="button"
                  onClick={() => handleAssignDeliveryToOrder(order)}
                  disabled={
                    isTerminal || actionLoading === `assign-order:${orderId}`
                  }
                  className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155] disabled:opacity-50"
                >
                  Assign delivery
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleCancelOrderAsAdmin(order)}
                disabled={
                  isTerminal || actionLoading === `cancel-order:${orderId}`
                }
                className="rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Cancel by admin
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOrder(orderId)}
                disabled={actionLoading === `delete-order:${orderId}`}
                className="rounded-full bg-[#dc2626] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Delete permanently
              </button>
              <NavLink
                to={`/orders/${orderId}/tracking`}
                className="text-xs font-semibold text-[#0f766e] underline"
              >
                Track
              </NavLink>
            </div>
          </article>
        );
      })}
    </div>
  );
};

OrderHistory.propTypes = {
  orders: PropTypes.array.isRequired,
  normalizeRole: PropTypes.func.isRequired,
  orderStatusDrafts: PropTypes.object.isRequired,
  setOrderStatusDrafts: PropTypes.func.isRequired,
  orderAssignmentDrafts: PropTypes.object.isRequired,
  setOrderAssignmentDrafts: PropTypes.func.isRequired,
  deliveryUsers: PropTypes.array.isRequired,
  handleOrderStatusUpdate: PropTypes.func.isRequired,
  handleAssignDeliveryToOrder: PropTypes.func.isRequired,
  handleCancelOrderAsAdmin: PropTypes.func.isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};

export default OrderHistory;
