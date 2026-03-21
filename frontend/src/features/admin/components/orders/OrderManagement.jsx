import MakeOrder from "./make_order/MakeOrder";
import OrderHistory from "./order_history/OrderHistory";

const OrderManagement = ({
  activeOrderView,
  orderForm,
  setOrderForm,
  orderCustomer,
  setOrderCustomer,
  products,
  handleAddItemToOrderDraft,
  handleLookupOrCreateOrderCustomer,
  handleCreateOrderByAdmin,
  actionLoading,
  orders,
  normalizeRole,
  orderStatusDrafts,
  setOrderStatusDrafts,
  handleOrderStatusUpdate,
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
          orderCustomer={orderCustomer}
          setOrderCustomer={setOrderCustomer}
          products={products}
          handleAddItemToOrderDraft={handleAddItemToOrderDraft}
          handleLookupOrCreateOrderCustomer={handleLookupOrCreateOrderCustomer}
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
          handleOrderStatusUpdate={handleOrderStatusUpdate}
          handleCancelOrderAsAdmin={handleCancelOrderAsAdmin}
          handleDeleteOrder={handleDeleteOrder}
          actionLoading={actionLoading}
        />
      ) : null}
    </>
  );
};

export default OrderManagement;
