import StatusPill from "../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../utils/helpers";
import {
  DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE,
  DELIVERY_STATUS_OPTIONS,
} from "../../../../utils/constants";
import { useMemo, useState } from "react";

const DeliveryManagement = ({
  orders = [],
  deliveryAssignForm,
  setDeliveryAssignForm,
  deliveryUsers,
  handleCreateDelivery,
  actionLoading,
  deliveries,
  normalizeRole,
  deliveryStatusDrafts,
  setDeliveryStatusDrafts,
  handleDeliveryStatusUpdate,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pendingOrders = useMemo(() => {
    const assignedOrderIds = new Set(deliveries.map((d) => String(d.orderId)));
    return orders.filter((o) => {
      const oid = String(resolveEntityId(o));
      const status = normalizeRole(o.status);
      return !assignedOrderIds.has(oid) && ["PENDING", "CONFIRMED"].includes(status);
    });
  }, [orders, deliveries, normalizeRole]);

  const inTransitCount = useMemo(() => {
    return deliveries.filter((d) => {
      const status = normalizeRole(d.status);
      return ["ASSIGNED", "OUT_FOR_DELIVERY"].includes(status);
    }).length;
  }, [deliveries, normalizeRole]);

  const onAssignClick = async () => {
    await handleCreateDelivery();
    if (deliveryAssignForm.orderId && deliveryAssignForm.deliveryUserId) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Assign
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {pendingOrders.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Transit
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {inTransitCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Deliveries
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {deliveries.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Delivery Users
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {deliveryUsers.length}
            </p>
          </div>
        </div>

       
      </div>
      <div className="item-center justify-end">
 <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex h-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-4 font-semibold text-white transition-colors hover:bg-slate-800 md:py-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Assign Delivery
        </button>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white border-l border-slate-200 transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-800">Assign Delivery</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Body (Form) */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pending Order
                </label>
                <div className="relative">
                  <select
                    value={deliveryAssignForm.orderId}
                    onChange={(event) =>
                      setDeliveryAssignForm((prev) => ({
                        ...prev,
                        orderId: event.target.value,
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400 focus:bg-white"
                  >
                    <option value="">Select an order</option>
                    {pendingOrders.map((order) => {
                      const oid = resolveEntityId(order);
                      return (
                        <option key={oid} value={oid}>
                          Order #{oid.substring(0, 6).toUpperCase()} - {order.totalAmount ? `$${order.totalAmount}` : 'Customer Order'}
                        </option>
                      );
                    })}
                    {orders.length > 0 && pendingOrders.length === 0 && (
                      <option value="" disabled>No pending orders</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Delivery User
                </label>
                <div className="relative">
                  <select
                    value={deliveryAssignForm.deliveryUserId}
                    onChange={(event) =>
                      setDeliveryAssignForm((prev) => ({
                        ...prev,
                        deliveryUserId: event.target.value,
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400 focus:bg-white"
                  >
                    <option value="">Select delivery user</option>
                    {deliveryUsers.map((user) => (
                      <option key={resolveEntityId(user)} value={resolveEntityId(user)}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Additional Notes
                </label>
                <textarea
                  value={deliveryAssignForm.notes}
                  onChange={(event) =>
                    setDeliveryAssignForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="E.g., Fragile, Fast delivery..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-100 p-6">
            <button
              type="button"
              onClick={onAssignClick}
              disabled={
                actionLoading === "create-delivery" ||
                !deliveryAssignForm.orderId ||
                !deliveryAssignForm.deliveryUserId
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {actionLoading === "create-delivery" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </>
              ) : (
                "Confirm Assignment"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Recent Deliveries</h3>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {deliveries.length} Total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                  Order ID
                </th>
                <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                  Assigned To
                </th>
                <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                  Status
                </th>
                <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                  Date Assigned
                </th>
                <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span className="text-sm font-medium">No deliveries assigned yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => {
                  const deliveryId = resolveEntityId(delivery);
                  const status = normalizeRole(delivery.status);
                  const isTerminal =
                    DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE.includes(status);

                  return (
                    <tr key={deliveryId} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          #{String(delivery.orderId).substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600 text-xs">
                            {(delivery.deliveryUserName || delivery.deliveryUserId || '?').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700">
                            {delivery.deliveryUserName || delivery.deliveryUserId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {formatDate(delivery.assignedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <select
                              value={deliveryStatusDrafts[deliveryId] || ""}
                              onChange={(event) =>
                                setDeliveryStatusDrafts((prev) => ({
                                  ...prev,
                                  [deliveryId]: event.target.value,
                                }))
                              }
                              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-slate-400 focus:bg-white"
                            >
                              <option value="">Status...</option>
                              {DELIVERY_STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeliveryStatusUpdate(delivery)}
                            disabled={
                              isTerminal ||
                              actionLoading === `delivery-status:${deliveryId}` ||
                              !deliveryStatusDrafts[deliveryId]
                            }
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
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
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;

