import React from 'react';
import { resolveEntityId } from "../../../../../utils/helpers";

const selectClass =
  "w-full appearance-none rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 cursor-pointer";

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

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#fffdfa] border-l border-[#e7e5df]">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="border-b border-[#efeae2] bg-[#fcfaf6] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Delivery</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">Assign Delivery</h2>
            <p className="mt-1 text-sm text-[#8b95a7]">Link a pending order to a delivery user.</p>
          </div>

          {/* Close button */}
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
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">
                Pending Order
              </label>
              <div className="relative">
                <select
                  value={deliveryAssignForm.orderId}
                  onChange={(e) => setDeliveryAssignForm((prev) => ({ ...prev, orderId: e.target.value }))}
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
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Driver Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">
                Delivery User
              </label>
              <div className="relative">
                <select
                  value={deliveryAssignForm.deliveryUserId}
                  onChange={(e) => setDeliveryAssignForm((prev) => ({ ...prev, deliveryUserId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select delivery user</option>
                  {deliveryUsers.map((user) => (
                    <option key={resolveEntityId(user)} value={resolveEntityId(user)}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#9a8f7a]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">
                Notes <span className="normal-case tracking-normal text-[#b8af9f]">(optional)</span>
              </label>
              <textarea
                value={deliveryAssignForm.notes}
                onChange={(e) => setDeliveryAssignForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                placeholder="e.g. Fragile, leave at door..."
                className="w-full resize-none rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 placeholder:text-[#c4bfb7]"
              />
            </div>

            {/* Preview Card — shown when both fields selected */}
            {deliveryAssignForm.orderId && deliveryAssignForm.deliveryUserId && (
              <div className="rounded-[22px] border border-[#e5ede5] bg-[#f3fbf5] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d]">Ready to assign</p>
                <p className="mt-1 text-sm text-[#374151]">
                  Order <span className="font-semibold">#{deliveryAssignForm.orderId.substring(0, 6).toUpperCase()}</span> will be assigned to the selected driver.
                </p>
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
