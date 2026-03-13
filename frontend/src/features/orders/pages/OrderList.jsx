import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import OrderCard from "../components/OrderCard";
import { useAppContext } from "../../../app/providers/AppProvider";
import { OrderService } from "../../../services/order.service";
import { UserService } from "../../../services/user.service";
import { ORDER_STATUS_OPTIONS } from "../../../utils/constants";
import { asCollection, parseJsonInput, resolveEntityId, resolveRole } from "../../../utils/helpers";

export default function OrderList() {
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const userId = resolveEntityId(auth?.user);

  const canCreateOrder = role === "USER";
  const canUpdateOrderStatus = role === "ADMIN" || role === "DELIVERY";

  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [actionError, setActionError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    productId: "",
    quantity: "1",
    customPayload: "",
  });
  const [statusDrafts, setStatusDrafts] = useState({});

  const loadOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      let response;

      if (role === "ADMIN") {
        response = await OrderService.getAllOrders();
      } else if (userId) {
        response = await OrderService.getOrdersByUser(userId);
      } else {
        response = await UserService.getMyOrders();
      }

      setState({
        loading: false,
        error: "",
        items: asCollection(response, ["orders"]),
      });
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load orders",
        items: [],
      });
    }
  }, [role, userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateChange = (event) => {
    setOrderForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setActionError("");

    setCreateLoading(true);

    try {
      const customPayload = parseJsonInput(orderForm.customPayload);
      const payload =
        customPayload ||
        {
          items: [
            {
              productId: orderForm.productId,
              quantity: Number(orderForm.quantity || 1),
            },
          ],
        };

      await OrderService.createOrder(payload);

      setOrderForm({ productId: "", quantity: "1", customPayload: "" });
      await loadOrders();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Failed to create order");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = (orderId, status) => {
    setStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
  };

  const handleUpdateStatus = async (orderId, fallbackStatus) => {
    setActionError("");

    try {
      const status = statusDrafts[orderId] || fallbackStatus;
      await OrderService.updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Failed to update order status");
    }
  };

  return (
    <Card title="Orders" subtitle="GET / POST / PATCH operations against order service">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[#5f6368]">Role aware order management and status updates</p>
        <Button variant="secondary" onClick={loadOrders}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <ErrorMessage message={state.error} />
        <ErrorMessage message={actionError} />
      </div>

      {canCreateOrder ? (
        <form
          onSubmit={handleCreateOrder}
          className="mb-5 mt-5 grid gap-3 rounded-xl border border-[#edf0f7] p-4 md:grid-cols-2"
        >
          <Input
            label="Product ID"
            name="productId"
            value={orderForm.productId}
            onChange={handleCreateChange}
            required
          />

          <Input
            label="Quantity"
            name="quantity"
            type="number"
            value={orderForm.quantity}
            onChange={handleCreateChange}
            required
          />

          <div className="md:col-span-2">
            <label htmlFor="order-custom-payload" className="mb-1 block text-sm font-medium text-[#374151]">
              Custom JSON Payload (optional)
            </label>
            <textarea
              id="order-custom-payload"
              name="customPayload"
              rows={4}
              value={orderForm.customPayload}
              onChange={handleCreateChange}
              placeholder='{"items":[{"productId":"...","quantity":1}]}'
              className="w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={createLoading}>
              {createLoading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      ) : null}

      {state.loading ? <Loader text="Loading orders..." /> : null}

      {!state.loading && state.items.length === 0 ? (
        <p className="text-sm text-[#6b7280]">No orders found.</p>
      ) : null}

      {!state.loading && state.items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.items.map((order, index) => {
            const orderId = order?._id || order?.id || `order-${index}`;

            return (
              <OrderCard
                key={orderId}
                order={order}
                canUpdateStatus={canUpdateOrderStatus}
                statusOptions={ORDER_STATUS_OPTIONS}
                statusDraft={statusDrafts[orderId]}
                onStatusChange={handleStatusChange}
                onUpdateStatus={handleUpdateStatus}
              />
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
