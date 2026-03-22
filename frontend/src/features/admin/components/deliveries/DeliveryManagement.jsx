import { resolveEntityId } from "../../../../utils/helpers";
import { useMemo, useState } from "react";

import DeliveryStats from "./components/DeliveryStats";
import AssignDeliveryDrawer from "./components/AssignDeliveryDrawer";
import UserDeliveriesDrawer from "./components/UserDeliveriesDrawer";
import DeliveryTable from "./components/DeliveryTable";
import PerformanceInsights from "./components/PerformanceInsights";

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

  const userRecentDeliveries = useMemo(() => {
    if (!selectedUserForDrawer) return [];
    return deliveries.filter((d) => {
      const id1 = String(d.deliveryUserId);
      const id2 = String(resolveEntityId(selectedUserForDrawer));
      return id1 === id2;
    });
  }, [deliveries, selectedUserForDrawer]);

  return (
    <div className="flex flex-col gap-5">
      {activeDeliveryView === "manage" && (
        <>
          <DeliveryStats
            pendingCount={pendingOrders.length}
            inTransitCount={inTransitCount}
            totalCount={deliveries.length}
            usersCount={deliveryUsers.length}
          />

          <PerformanceInsights
            deliveries={deliveries}
            deliveryUsers={deliveryUsers}
          />

          {/* Tab Bar + Action */}
          <div className="flex items-center justify-between border-b border-line mt-4">
            <div className="flex">
              <button
                onClick={() => setManageTab("pending")}
                className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
                  manageTab === "pending"
                    ? "text-primary"
                    : "text-word hover:text-label"
                }`}
              >
                Pending Orders
                <span className="ml-2 rounded-full bg-white border border-line px-2 py-0.5 text-xs font-semibold text-word">
                  {pendingOrders.length}
                </span>
                {manageTab === "pending" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                )}
              </button>
              <button
                onClick={() => setManageTab("all")}
                className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
                  manageTab === "all"
                    ? "text-primary"
                    : "text-word hover:text-label"
                }`}
              >
                All History
                <span className="ml-2 rounded-full bg-white border border-line px-2 py-0.5 text-xs font-semibold text-word">
                  {deliveries.length}
                </span>
                {manageTab === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setDeliveryAssignForm((prev) => ({ ...prev, orderId: "" }));
                setIsAssignDrawerOpen(true);
              }}
              className="mb-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Assign Delivery
            </button>
          </div>
        </>
      )}

      <DeliveryTable
        viewMode={activeDeliveryView}
        manageTab={manageTab}
        pendingOrders={pendingOrders}
        deliveries={deliveries}
        deliveryUsers={deliveryUsers}
        normalizeRole={normalizeRole}
        deliveryStatusDrafts={deliveryStatusDrafts}
        setDeliveryStatusDrafts={setDeliveryStatusDrafts}
        handleDeliveryStatusUpdate={handleDeliveryStatusUpdate}
        onAssignOrder={(oid) => {
          setDeliveryAssignForm((prev) => ({ ...prev, orderId: oid }));
          setIsAssignDrawerOpen(true);
        }}
        onViewUserDetails={(user) => setSelectedUserForDrawer(user)}
        actionLoading={actionLoading}
      />

      <AssignDeliveryDrawer
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        pendingOrders={pendingOrders}
        deliveryUsers={deliveryUsers}
        deliveryAssignForm={deliveryAssignForm}
        setDeliveryAssignForm={setDeliveryAssignForm}
        onAssignClick={onAssignClick}
        actionLoading={actionLoading}
      />

      <UserDeliveriesDrawer
        isOpen={!!selectedUserForDrawer}
        user={selectedUserForDrawer}
        deliveries={userRecentDeliveries}
        normalizeRole={normalizeRole}
        onClose={() => setSelectedUserForDrawer(null)}
      />
    </div>
  );
};

export default DeliveryManagement;
