import React from 'react';
import { resolveEntityId } from "../../../../../utils/helpers";

const selectClass =
  "w-full appearance-none rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 cursor-pointer";

const inputClass =
  "w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 placeholder:text-[#c4bfb7]";

const labelClass = "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]";

const PRIORITY_CONFIG = {
  NORMAL: { label: "Normal",  color: "text-[#6b7280] bg-slate-100 border-slate-200" },
  HIGH:   { label: "High",    color: "text-amber-700 bg-amber-50 border-amber-200" },
  URGENT: { label: "Urgent",  color: "text-rose-700 bg-rose-50 border-rose-200" },
};

const AssignDeliveryDrawer = ({
  isOpen,
  onClose,
  pendingOrders,
  deliveryUsers,
  deliveryAssignForm,
  setDeliveryAssignForm,
  onAssignClick,
  actionLoading
}) => {
  if (!isOpen) return null;

  const priority = deliveryAssignForm.priority || "NORMAL";
  const priorityStyle = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.NORMAL;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#fffdfa] border-l border-[#e7e5df]">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="border-b border-[#efeae2] bg-[#fcfaf6] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Delivery</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">Assign Delivery</h2>
            <p className="mt-1 text-sm text-[#8b95a7]">Link a pending order to a delivery user.</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl border border-[#e4ddd2] bg-white p-2 text-[#9a8f7a] transition hover:bg-[#f5f0ea] hover:text-[#111827]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            {/* Order Select */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Pending Order</label>
              <div className="relative">
                <select
                  value={deliveryAssignForm.orderId}
                  onChange={(e) => setDeliveryAssignForm((p) => ({ ...p, orderId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select an order</option>
                  {pendingOrders.map((order) => {
                    const oid = resolveEntityId(order);
                    return (
                      <option key={oid} value={oid}>
                        #{oid.substring(0, 6).toUpperCase()} — {order.customerName || 'Customer'}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#9a8f7a]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Driver Select */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Delivery User</label>
              <div className="relative">
                <select
                  value={deliveryAssignForm.deliveryUserId}
                  onChange={(e) => setDeliveryAssignForm((p) => ({ ...p, deliveryUserId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select delivery user</option>
                  {deliveryUsers.map((user) => (
                    <option key={resolveEntityId(user)} value={resolveEntityId(user)}>{user.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#9a8f7a]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {["NORMAL", "HIGH", "URGENT"].map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDeliveryAssignForm((prev) => ({ ...prev, priority: p }))}
                      className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition ${
                        active ? cfg.color + " ring-2 ring-offset-1 ring-[#1d4ed8]/20" : "border-[#e4ddd2] bg-white text-[#9a8f7a] hover:bg-[#f5f0ea]"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Estimated Delivery Time <span className="normal-case tracking-normal text-[#b8af9f]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={deliveryAssignForm.estimatedDeliveryTime}
                onChange={(e) => setDeliveryAssignForm((p) => ({ ...p, estimatedDeliveryTime: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Notes <span className="normal-case tracking-normal text-[#b8af9f]">(optional)</span>
              </label>
              <textarea
                value={deliveryAssignForm.notes}
                onChange={(e) => setDeliveryAssignForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                placeholder="e.g. Fragile, leave at door..."
                className={inputClass + " resize-none"}
              />
            </div>

            {/* Ready Preview */}
            {deliveryAssignForm.orderId && deliveryAssignForm.deliveryUserId && (
              <div className="rounded-[22px] border border-[#e5ede5] bg-[#f3fbf5] px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#15803d]">Ready to assign</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-[#374151]">
                    Order <span className="font-semibold">#{deliveryAssignForm.orderId.substring(0, 6).toUpperCase()}</span>
                  </p>
                  <span className={`rounded-xl border px-2 py-0.5 text-[10px] font-semibold ${priorityStyle.color}`}>
                    {priorityStyle.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#efeae2] bg-[#fcfaf6] px-6 py-5">
            <button
              type="button"
              onClick={onAssignClick}
              disabled={actionLoading === "create-delivery" || !deliveryAssignForm.orderId || !deliveryAssignForm.deliveryUserId}
              className="w-full rounded-2xl bg-[#1d4ed8] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === "create-delivery" ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignDeliveryDrawer;
