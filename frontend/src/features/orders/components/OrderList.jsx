import { useCallback, useState } from "react";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import OrderCard from "../components/OrderCard";
import { useAppContext } from "../../../app/providers/AppProvider";
import { OrderService } from "../../../services/order.service";
import { UserService } from "../../../services/user.service";
import { ORDER_STATUS_OPTIONS } from "../../../utils/constants";
import {
  asCollection,
  resolveEntityId,
  resolveRole,
} from "../../../utils/helpers";

export default function OrderList() {
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const userId = resolveEntityId(auth?.user);

  const canUpdateOrderStatus = role === "ADMIN" || role === "DELIVERY";

  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [actionError, setActionError] = useState("");
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
        error:
          error?.friendlyMessage || error?.message || "Failed to load orders",
        items: [],
      });
    }
  }, [role, userId]);

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
      setActionError(
        error?.friendlyMessage ||
          error?.message ||
          "Failed to update order status",
      );
    }
  };

  return (
    <Card title="All Orders" subtitle="View and manage all orders from here">


      <div className="space-y-3">
        <ErrorMessage message={state.error} />
        <ErrorMessage message={actionError} />
      </div>

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
