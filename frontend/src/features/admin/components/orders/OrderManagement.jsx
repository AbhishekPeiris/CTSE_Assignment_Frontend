import { NavLink } from "react-router-dom";
import MakeOrder from "./make_order/MakeOrder";
import OrderHistory from "./order_history/OrderHistory";

const OrderManagement = ({
  activeOrderView,
  orderForm,
  setOrderForm,
  products,
  handleAddItemToOrderDraft,
  handleCreateOrderByAdmin,
  actionLoading,
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
}) => {
  return (
    <>
      {/* <div className="mb-4 rounded-xl border border-[#e5edf8] bg-white p-2">
        <div className="flex flex-wrap gap-2">
          <NavLink
            to="/admin-portal?tab=orders&orderView=make"
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              activeOrderView === "make"
                ? "bg-[#1d4ed8] text-white"
                : "border border-[#d4dce9] text-[#334155] hover:bg-[#f8fbff]",
            ].join(" ")}
          >
            Make Order
          </NavLink>
          <NavLink
            to="/admin-portal?tab=orders&orderView=history"
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              activeOrderView === "history"
                ? "bg-[#1d4ed8] text-white"
                : "border border-[#d4dce9] text-[#334155] hover:bg-[#f8fbff]",
            ].join(" ")}
          >
            Order History
          </NavLink>
        </div>
      </div> */}

      {activeOrderView === "make" ? (
        <MakeOrder
          orderForm={orderForm}
          setOrderForm={setOrderForm}
          products={products}
          handleAddItemToOrderDraft={handleAddItemToOrderDraft}
          handleCreateOrderByAdmin={handleCreateOrderByAdmin}
          actionLoading={actionLoading}
        />
      ) : null}

      {activeOrderView === "history" ? (
        <OrderHistory
          orders={orders}
          normalizeRole={normalizeRole}
          orderStatusDrafts={orderStatusDrafts}
          setOrderStatusDrafts={setOrderStatusDrafts}
          orderAssignmentDrafts={orderAssignmentDrafts}
          setOrderAssignmentDrafts={setOrderAssignmentDrafts}
          deliveryUsers={deliveryUsers}
          handleOrderStatusUpdate={handleOrderStatusUpdate}
          handleAssignDeliveryToOrder={handleAssignDeliveryToOrder}
          handleCancelOrderAsAdmin={handleCancelOrderAsAdmin}
          handleDeleteOrder={handleDeleteOrder}
          actionLoading={actionLoading}
        />
      ) : null}
    </>
  );
};

export default OrderManagement;
