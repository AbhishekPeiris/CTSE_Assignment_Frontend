import React from 'react';
import { resolveEntityId } from "../../../../../utils/helpers";

const inputClass =
  "w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-[#1d4ed8] cursor-pointer";

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

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Delivery</p>
              <h2 className="text-lg font-bold text-slate-800">Assign Delivery</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Order</label>
              <div className="relative">
                <select
                  value={deliveryAssignForm.orderId}
                  onChange={(e) => setDeliveryAssignForm((prev) => ({ ...prev, orderId: e.target.value }))}
                  className={inputClass}
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery User</label>
              <div className="relative">
                <select
                  value={deliveryAssignForm.deliveryUserId}
                  onChange={(e) => setDeliveryAssignForm((prev) => ({ ...prev, deliveryUserId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select delivery user</option>
                  {deliveryUsers.map((user) => (
                    <option key={resolveEntityId(user)} value={resolveEntityId(user)}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes (optional)</label>
              <textarea
                value={deliveryAssignForm.notes}
                onChange={(e) => setDeliveryAssignForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                placeholder="e.g. Fragile, leave at door..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-[#1d4ed8] placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onAssignClick}
              disabled={actionLoading === "create-delivery" || !deliveryAssignForm.orderId || !deliveryAssignForm.deliveryUserId}
              className="w-full rounded-lg bg-[#1d4ed8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
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
