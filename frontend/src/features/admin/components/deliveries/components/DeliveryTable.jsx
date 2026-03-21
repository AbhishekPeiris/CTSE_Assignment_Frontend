import React from 'react';
import StatusPill from "../../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../../utils/helpers";
import {
  DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE,
  DELIVERY_STATUS_OPTIONS
} from "../../../../../utils/constants";

const th = "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400";
const td = "px-5 py-4 text-sm text-slate-700";

const PRIORITY_BADGE = {
  URGENT: "bg-rose-50 text-rose-700 border border-rose-200",
  HIGH:   "bg-amber-50 text-amber-700 border border-amber-200",
  NORMAL: "bg-slate-100 text-slate-500 border border-slate-200",
};

const DeliveryTable = ({
  viewMode,
  manageTab,
  pendingOrders,
  deliveries = [],
  deliveryUsers = [],
  normalizeRole,
  deliveryStatusDrafts,
  setDeliveryStatusDrafts,
  handleDeliveryStatusUpdate,
  onAssignOrder,
  onViewUserDetails,
  actionLoading
}) => {
  const getTitle = () => {
    if (viewMode === "active") return "Delivery Users";
    return manageTab === "pending" ? "Pending Orders" : "All Deliveries";
  };

  const count = viewMode === "active"
    ? deliveryUsers.length
    : (manageTab === "pending" ? pendingOrders.length : deliveries.length);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-800">{getTitle()}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {count} total
        </span>
      </div>

      <div className="overflow-x-auto">
        {/* ── Active Delivery Users ── */}
        {viewMode === "active" ? (
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={th}>User ID</th>
                <th className={th}>Name</th>
                <th className={th}>Contact</th>
                <th className={th}>Points</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveryUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-400">No delivery users found</td>
                </tr>
              ) : (
                deliveryUsers.map((user) => {
                  const uid = resolveEntityId(user);
                  return (
                    <tr key={uid} className="hover:bg-slate-50 transition-colors">
                      <td className={td}>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-500">
                          #{uid.substring(0, 8)}
                        </span>
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] text-xs font-bold">
                            {user.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className={`${td} text-slate-500`}>{user.email || user.contactNumber || 'N/A'}</td>
                      <td className={td}>
                        <span className="font-semibold text-[#1d4ed8]">{user.loyaltyPoints ?? 0}</span>
                        <span className="ml-1 text-xs text-slate-400">pts</span>
                      </td>
                      <td className={td}>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className={`${td} text-right`}>
                        <button
                          onClick={() => onViewUserDetails(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        /* ── Pending Orders ── */
        ) : manageTab === "pending" ? (
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={th}>Order ID</th>
                <th className={th}>Customer</th>
                <th className={th}>Address</th>
                <th className={th}>Items</th>
                <th className={th}>Payment</th>
                <th className={th}>Total</th>
                <th className={th}>Date</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-sm text-slate-400">No pending orders found</td>
                </tr>
              ) : (
                pendingOrders.map((order) => {
                  const oid = resolveEntityId(order);
                  return (
                    <tr key={oid} className="hover:bg-slate-50 transition-colors">
                      <td className={td}>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-500">
                          #{String(oid).substring(0, 8)}
                        </span>
                      </td>
                      <td className={`${td} font-medium text-slate-800`}>{order.customerName || "Customer"}</td>
                      <td className={`${td} max-w-xs truncate text-slate-500`}>{order.deliveryLocation?.address || "No address"}</td>
                      <td className={td}>
                        <span className="font-medium">{order.items?.length || 0}</span>
                        <span className="ml-1 text-xs text-slate-400">items</span>
                      </td>
                      <td className={td}>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 uppercase">
                          {order.paymentMethod?.replace(/_/g, ' ') || "N/A"}
                        </span>
                      </td>
                      <td className={td}>
                        <span className="font-semibold text-[#1d4ed8]">{order.totalAmount ? `$${order.totalAmount}` : "N/A"}</span>
                      </td>
                      <td className={`${td} text-slate-400 text-xs`}>{formatDate(order.createdAt)}</td>
                      <td className={`${td} text-right`}>
                        <button
                          onClick={() => onAssignOrder(oid)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1e40af]"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        /* ── All Deliveries ── */
        ) : (
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={th}>Order ID</th>
                <th className={th}>Priority</th>
                <th className={th}>Address</th>
                <th className={th}>Assigned To</th>
                <th className={th}>Status</th>
                <th className={th}>Est. Delivery</th>
                <th className={th}>Assigned</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-sm text-slate-400">No deliveries found</td>
                </tr>
              ) : (
                deliveries.map((delivery) => {
                  const deliveryId = resolveEntityId(delivery);
                  const status = normalizeRole(delivery.status);
                  const isTerminal = DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE.includes(status);
                  const priorityKey = (delivery.priority || "NORMAL").toUpperCase();
                  return (
                    <tr key={deliveryId} className="hover:bg-slate-50 transition-colors">
                      <td className={td}>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-500">
                          #{String(delivery.orderId).substring(0, 8)}
                        </span>
                      </td>
                      <td className={td}>
                        <span className={`rounded-xl px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_BADGE[priorityKey] || PRIORITY_BADGE.NORMAL}`}>
                          {priorityKey}
                        </span>
                      </td>
                      <td className={`${td} max-w-xs truncate text-slate-500`}>{delivery.deliveryLocation?.address || "N/A"}</td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                            {(delivery.deliveryUserName || delivery.deliveryUserId || '?').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700">{delivery.deliveryUserName || delivery.deliveryUserId}</span>
                        </div>
                      </td>
                      <td className={td}><StatusPill status={status} /></td>
                      <td className={`${td} text-slate-400 text-xs`}>
                        {delivery.estimatedDeliveryTime ? formatDate(delivery.estimatedDeliveryTime) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className={`${td} text-slate-400 text-xs`}>{formatDate(delivery.assignedAt)}</td>
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={deliveryStatusDrafts[deliveryId] || ""}
                            onChange={(e) => setDeliveryStatusDrafts((prev) => ({ ...prev, [deliveryId]: e.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-[#1d4ed8]"
                          >
                            <option value="">Status...</option>
                            {DELIVERY_STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeliveryStatusUpdate(delivery)}
                            disabled={isTerminal || actionLoading === `delivery-status:${deliveryId}` || !deliveryStatusDrafts[deliveryId]}
                            className="rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeliveryTable;
