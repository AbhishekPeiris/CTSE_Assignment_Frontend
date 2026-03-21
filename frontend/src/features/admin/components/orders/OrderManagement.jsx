import { NavLink } from "react-router-dom";
import StatusPill from "../../../../components/ui/StatusPill";
import LocationPickerMap from "../../../client/components/LocationPickerMap";
import {
  formatDate,
  formatMoney,
  resolveEntityId,
} from "../../../../utils/helpers";

const ORDER_STATUS_OPTIONS_ADMIN = [
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_DELIVERY",
];

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
      <div className="mb-4 rounded-xl border border-[#e5edf8] bg-white p-2">
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
      </div>

      {activeOrderView === "make" ? (
        <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
          <p className="text-sm font-semibold text-[#0f172a]">
            Create order as admin
          </p>

          <div className="grid gap-2 mt-3 md:grid-cols-2">
            <input
              value={orderForm.customerContactNumber}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  customerContactNumber: event.target.value,
                }))
              }
              placeholder="Customer contact number"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            />
            <input
              value={orderForm.customerName}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  customerName: event.target.value,
                }))
              }
              placeholder="Customer name (optional)"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-[minmax(220px,1fr)_120px_auto]">
            <select
              value={orderForm.selectedProductId}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  selectedProductId: event.target.value,
                }))
              }
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option
                  key={resolveEntityId(product)}
                  value={resolveEntityId(product)}
                >
                  {product.name} (stock: {product.stock})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={orderForm.selectedQuantity}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  selectedQuantity: event.target.value,
                }))
              }
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={handleAddItemToOrderDraft}
              className="rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white"
            >
              Add item
            </button>
          </div>

          {orderForm.items.length ? (
            <div className="mt-3 rounded-xl border border-[#e5edf8] bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Draft items
              </p>
              <div className="mt-2 space-y-2">
                {orderForm.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="grid gap-2 md:grid-cols-[1fr_120px_auto]"
                  >
                    <p className="text-sm text-[#334155]">{item.name}</p>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          items: prev.items.map((entry) =>
                            entry.productId === item.productId
                              ? {
                                  ...entry,
                                  quantity: Math.max(
                                    1,
                                    Number(event.target.value || 1),
                                  ),
                                }
                              : entry,
                          ),
                        }))
                      }
                      className="rounded-lg border border-[#d4dce9] px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOrderForm((prev) => ({
                          ...prev,
                          items: prev.items.filter(
                            (entry) => entry.productId !== item.productId,
                          ),
                        }))
                      }
                      className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 mt-3 md:grid-cols-2">
            <textarea
              rows={2}
              value={orderForm.deliveryAddress}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  deliveryAddress: event.target.value,
                }))
              }
              placeholder="Delivery address"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm md:col-span-2"
            />

            <input
              type="number"
              step="any"
              value={orderForm.latitude}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  latitude: event.target.value,
                }))
              }
              placeholder="Latitude"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="any"
              value={orderForm.longitude}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  longitude: event.target.value,
                }))
              }
              placeholder="Longitude"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3">
            <LocationPickerMap
              latitude={orderForm.latitude}
              longitude={orderForm.longitude}
              onChange={({ latitude, longitude }) =>
                setOrderForm((prev) => ({
                  ...prev,
                  latitude,
                  longitude,
                }))
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <input
              type="number"
              min="0"
              value={orderForm.loyaltyPointsToUse}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  loyaltyPointsToUse: event.target.value,
                }))
              }
              placeholder="Loyalty points to use"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={handleCreateOrderByAdmin}
              disabled={actionLoading === "create-admin-order"}
              className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115e59] disabled:opacity-50"
            >
              {actionLoading === "create-admin-order"
                ? "Creating..."
                : "Create Order"}
            </button>
          </div>
        </div>
      ) : null}

      {activeOrderView === "history" ? (
        <div className="mt-4 space-y-3">
          {orders.map((order) => {
            const orderId = resolveEntityId(order);
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
                      <option
                        key={resolveEntityId(user)}
                        value={resolveEntityId(user)}
                      >
                        {user.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOrderStatusUpdate(order)}
                      disabled={
                        isTerminal ||
                        actionLoading === `status-order:${orderId}`
                      }
                      className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Update status
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAssignDeliveryToOrder(order)}
                      disabled={
                        isTerminal ||
                        actionLoading === `assign-order:${orderId}`
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
      ) : null}
    </>
  );
};

export default OrderManagement;
