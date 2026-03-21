import StatusPill from "../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../utils/helpers";
import {
  DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE,
  DELIVERY_STATUS_OPTIONS,
} from "../../../../utils/constants";
import { useMemo, useState } from "react";

const DeliveryManagement = ({
  activeDeliveryView = "manage",
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
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState(null);
  const [manageTab, setManageTab] = useState("pending");

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
      return ["ASSIGNED", "OUT_FOR_DELIVERY", "PICKED_UP"].includes(status);
    }).length;
  }, [deliveries, normalizeRole]);

  const onAssignClick = async () => {
    await handleCreateDelivery();
    if (deliveryAssignForm.orderId && deliveryAssignForm.deliveryUserId) {
      setIsAssignDrawerOpen(false);
    }
  };

  const getTableTitle = () => {
    if (activeDeliveryView === "active") return "Delivery Users";
    if (activeDeliveryView === "manage") {
       return manageTab === "pending" ? "Pending Orders" : "All Deliveries";
    }
    return "Deliveries";
  };

  const userRecentDeliveries = useMemo(() => {
    if (!selectedUserForDrawer) return [];
    return deliveries.filter((d) => {
      const id1 = String(d.deliveryUserId);
      const id2 = String(resolveEntityId(selectedUserForDrawer));
      return id1 === id2;
    });
  }, [deliveries, selectedUserForDrawer]);

  return (
    <div>
      {activeDeliveryView === "manage" && (
        <>
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
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 border-b border-slate-200 w-full sm:w-auto">
              <button
                onClick={() => setManageTab("pending")}
                className={`py-2 px-4 text-sm font-semibold transition-colors border-b-2 ${
                  manageTab === "pending"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Pending Assignment
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {pendingOrders.length}
                </span>
              </button>
              <button
                onClick={() => setManageTab("all")}
                className={`py-2 px-4 text-sm font-semibold transition-colors border-b-2 ${
                  manageTab === "all"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                All Deliveries
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {deliveries.length}
                </span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setDeliveryAssignForm((prev) => ({ ...prev, orderId: "" }));
                setIsAssignDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Assign Delivery
            </button>
          </div>
        </>
      )}

      {/* Assign Drawer Overlay */}
      {isAssignDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsAssignDrawerOpen(false)}
        />
      )}

      {/* Assign Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white border-l border-slate-200 transition-transform duration-300 ease-in-out ${
          isAssignDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-800">Assign Delivery</h2>
            <button onClick={() => setIsAssignDrawerOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Order</label>
                <div className="relative">
                  <select
                    value={deliveryAssignForm.orderId}
                    onChange={(event) => setDeliveryAssignForm((prev) => ({ ...prev, orderId: event.target.value }))}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option value="">Select an order</option>
                    {pendingOrders.map((order) => {
                      const oid = resolveEntityId(order);
                      return <option key={oid} value={oid}>Order #{oid.substring(0, 6).toUpperCase()} - {order.totalAmount ? `$${order.totalAmount}` : 'Customer Order'}</option>;
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery User</label>
                <div className="relative">
                  <select
                    value={deliveryAssignForm.deliveryUserId}
                    onChange={(event) => setDeliveryAssignForm((prev) => ({ ...prev, deliveryUserId: event.target.value }))}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option value="">Select delivery user</option>
                    {deliveryUsers.map((user) => (
                      <option key={resolveEntityId(user)} value={resolveEntityId(user)}>{user.name}</option>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Additional Notes</label>
                <textarea
                  value={deliveryAssignForm.notes}
                  onChange={(event) => setDeliveryAssignForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={4}
                  placeholder="E.g., Fragile, Fast delivery..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-6">
            <button
              type="button"
              onClick={onAssignClick}
              disabled={actionLoading === "create-delivery" || !deliveryAssignForm.orderId || !deliveryAssignForm.deliveryUserId}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {actionLoading === "create-delivery" ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </div>
      </div>

      {/* View User Deliveries Drawer Overlay */}
      {selectedUserForDrawer && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedUserForDrawer(null)}
        />
      )}
      
      {/* View User Deliveries Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white border-l border-slate-200 transition-transform duration-300 ease-in-out ${
          selectedUserForDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">User Deliveries</h2>
              <p className="text-sm font-medium text-slate-500">{selectedUserForDrawer?.name || "Delivery User"}</p>
            </div>
            <button onClick={() => setSelectedUserForDrawer(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            <div className="space-y-4">
              {userRecentDeliveries.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium">No deliveries found for this user.</div>
              ) : (
                userRecentDeliveries.map((delivery) => {
                  const did = resolveEntityId(delivery);
                  return (
                    <div key={did} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                          #{String(delivery.orderId).substring(0, 8)}
                        </span>
                        <StatusPill status={normalizeRole(delivery.status)} />
                      </div>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider">Assigned Date</span>
                          <span className="text-slate-700 font-medium">{formatDate(delivery.assignedAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">{getTableTitle()}</h3>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {activeDeliveryView === "active" ? deliveryUsers.length : (manageTab === "pending" ? pendingOrders.length : deliveries.length)} Total
          </span>
        </div>
        <div className="overflow-x-auto">
          {activeDeliveryView === "active" ? (
            <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">User ID</th>
                  <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Name</th>
                  <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Contact</th>
                  <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveryUsers.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                     <span className="text-sm font-medium">No delivery users found</span>
                  </td></tr>
                ) : (
                  deliveryUsers.map((user) => {
                    const uid = resolveEntityId(user);
                    return (
                      <tr key={uid} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-600">
                           <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              #{uid.substring(0, 8)}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                           <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-xs">
                                 {user.name?.substring(0, 2).toUpperCase()}
                              </div>
                              {user.name}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{user.email || user.contactNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedUserForDrawer(user)}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                            title="View Deliveries"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            manageTab === "pending" ? (
              <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Order ID</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Customer Name</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Amount</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Date</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingOrders.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                       <span className="text-sm font-medium">No pending orders found</span>
                    </td></tr>
                  ) : (
                    pendingOrders.map((order) => {
                      const oid = resolveEntityId(order);
                      return (
                        <tr key={oid} className="transition-colors hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-700">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              #{String(oid).substring(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">{order.customerName || "Customer"}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{order.totalAmount ? `$${order.totalAmount}` : "N/A"}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-medium">{formatDate(order.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                             <button
                               onClick={() => {
                                 setDeliveryAssignForm((prev) => ({ ...prev, orderId: oid }));
                                 setIsAssignDrawerOpen(true);
                               }}
                               className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100"
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
            ) : (
              <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Order ID</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Assigned To</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Status</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Date Assigned</th>
                    <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                       <span className="text-sm font-medium">No deliveries found</span>
                    </td></tr>
                  ) : (
                    deliveries.map((delivery) => {
                      const deliveryId = resolveEntityId(delivery);
                      const status = normalizeRole(delivery.status);
                      const isTerminal = DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE.includes(status);
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
                               <span className="font-semibold text-slate-700">{delivery.deliveryUserName || delivery.deliveryUserId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><StatusPill status={status} /></td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-medium">{formatDate(delivery.assignedAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="relative">
                                 <select
                                   value={deliveryStatusDrafts[deliveryId] || ""}
                                   onChange={(event) => setDeliveryStatusDrafts((prev) => ({ ...prev, [deliveryId]: event.target.value }))}
                                   className="appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-xs font-medium text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                                 >
                                   <option value="">Status...</option>
                                   {DELIVERY_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
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
                                disabled={isTerminal || actionLoading === `delivery-status:${deliveryId}` || !deliveryStatusDrafts[deliveryId]}
                                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
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
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;
