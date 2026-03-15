import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { DeliveryService } from "../../../services/delivery.service";
import { OrderService } from "../../../services/order.service";
import { UserService } from "../../../services/user.service";
import { ORDER_STATUS_FLOW } from "../../../utils/constants";
import {
  asCollection,
  asEntity,
  formatDate,
  formatMoney,
  resolveEntityId,
  resolveRole,
  toPrettyJSON,
} from "../../../utils/helpers";

const TERMINAL_ORDER_STATUSES = new Set(["DELIVERED", "CANCELLED"]);

const getOrderStatus = (order) => String(order?.status || "PENDING").toUpperCase();

const getOrderTransitionOptions = (currentStatus) => {
  const normalizedStatus = String(currentStatus || "PENDING").toUpperCase();

  if (TERMINAL_ORDER_STATUSES.has(normalizedStatus)) {
    return [];
  }

  if (normalizedStatus === "PENDING") {
    return ["CONFIRMED", "CANCELLED"];
  }

  if (normalizedStatus === "CONFIRMED") {
    return ["SHIPPED", "CANCELLED"];
  }

  if (normalizedStatus === "SHIPPED") {
    return ["DELIVERED", "CANCELLED"];
  }

  return ORDER_STATUS_FLOW.filter(
    (status) => !TERMINAL_ORDER_STATUSES.has(status) && status !== normalizedStatus,
  );
};

const getDeliveryOrderId = (delivery) =>
  delivery?.orderId || delivery?.order?._id || delivery?.order?.id || "";

const getCourierId = (delivery) =>
  delivery?.courierId ||
  delivery?.courier?._id ||
  delivery?.courier?.id ||
  delivery?.deliveryPerson?._id ||
  delivery?.deliveryPerson?.id ||
  "";

const getCourierLabel = (delivery, courierProfile) =>
  courierProfile?.name ||
  courierProfile?.email ||
  delivery?.courier?.name ||
  delivery?.courier?.email ||
  delivery?.deliveryPerson?.name ||
  delivery?.deliveryPerson?.email ||
  delivery?.courierId ||
  delivery?.courier ||
  delivery?.deliveryPerson ||
  "Not assigned";

const getOrderCustomerLabel = (order) =>
  order?.customerName ||
  order?.user?.name ||
  order?.user?.email ||
  order?.contactNumber ||
  order?.userId ||
  "Walk-in Customer";

const getOrderTotal = (order) =>
  Number(
    order?.finalAmount ??
      order?.totalAmount ??
      order?.amount ??
      order?.total ??
      0,
  ) || 0;

export default function OrderDetails() {
  const { id } = useParams();
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const canUpdateOrderStatus = role === "ADMIN";
  const canLoadDeliveries = role === "ADMIN";

  const [state, setState] = useState({ loading: true, error: "", order: null });
  const [deliveryState, setDeliveryState] = useState({
    loading: false,
    error: "",
    delivery: null,
    courierProfile: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadOrder = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    setDeliveryState((prev) => ({ ...prev, loading: canLoadDeliveries, error: "" }));

    try {
      const response = await OrderService.getOrderById(id);
      const order = asEntity(response, ["order"]);
      const orderId = resolveEntityId(order);

      setState({ loading: false, error: "", order });

      if (canLoadDeliveries && orderId) {
        try {
          const deliveriesResponse = await DeliveryService.getDeliveries();
          const deliveries = asCollection(deliveriesResponse, ["deliveries"]);
          const matchedDelivery =
            deliveries.find((delivery) => getDeliveryOrderId(delivery) === orderId) ||
            null;

          if (matchedDelivery) {
            const courierId = getCourierId(matchedDelivery);

            if (courierId) {
              try {
                const courierResponse = await UserService.getPublicProfile(courierId);
                setDeliveryState({
                  loading: false,
                  error: "",
                  delivery: matchedDelivery,
                  courierProfile: asEntity(courierResponse, ["user"]),
                });
              } catch (profileError) {
                setDeliveryState({
                  loading: false,
                  error:
                    profileError?.friendlyMessage ||
                    profileError?.message ||
                    "Failed to load courier profile",
                  delivery: matchedDelivery,
                  courierProfile: null,
                });
              }
            } else {
              setDeliveryState({
                loading: false,
                error: "",
                delivery: matchedDelivery,
                courierProfile: null,
              });
            }
          } else {
            setDeliveryState({
              loading: false,
              error: "",
              delivery: null,
              courierProfile: null,
            });
          }
        } catch (deliveryError) {
          setDeliveryState({
            loading: false,
            error:
              deliveryError?.friendlyMessage ||
              deliveryError?.message ||
              "Failed to load delivery tracking",
            delivery: null,
            courierProfile: null,
          });
        }
      } else {
        setDeliveryState({
          loading: false,
          error: "",
          delivery: null,
          courierProfile: null,
        });
      }
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load order",
        order: null,
      });
      setDeliveryState({
        loading: false,
        error: "",
        delivery: null,
        courierProfile: null,
      });
    }
  }, [canLoadDeliveries, id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const currentStatus = getOrderStatus(state.order);
  const nextStatusOptions = useMemo(
    () => getOrderTransitionOptions(currentStatus),
    [currentStatus],
  );

  const handleUpdateStatus = async (nextStatus) => {
    if (!nextStatusOptions.includes(nextStatus)) {
      setActionError(`Invalid status transition from ${currentStatus}.`);
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await OrderService.updateOrderStatus(id, nextStatus);
      await loadOrder();
    } catch (error) {
      setActionError(
        error?.friendlyMessage || error?.message || "Failed to update order status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (state.loading) {
    return <Loader text="Loading order..." />;
  }

  return (
    <div className="space-y-6">
      <Card
        title="Order Details"
        subtitle="Full order information, admin status flow, and delivery tracking."
      >
        <div className="mb-5">
          <NavLink to="/orders/history">
            <Button variant="secondary" size="sm">
              Back to Orders
            </Button>
          </NavLink>
        </div>

        <ErrorMessage message={state.error} />
        <ErrorMessage message={actionError} />
        <ErrorMessage message={deliveryState.error} />

        {state.order ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2937]">
                  {resolveEntityId(state.order) || "Order"}
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Created on {formatDate(state.order?.createdAt)}
                </p>
              </div>
              <StatusPill status={currentStatus} />
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#edf0f7] bg-[#fcfdff] p-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Customer
                </p>
                <p className="mt-2 text-sm font-medium text-[#1f2937]">
                  {getOrderCustomerLabel(state.order)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Contact
                </p>
                <p className="mt-2 text-sm font-medium text-[#1f2937]">
                  {state.order?.contactNumber || state.order?.user?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Total
                </p>
                <p className="mt-2 text-sm font-medium text-[#1f2937]">
                  {formatMoney(getOrderTotal(state.order))}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Items
                </p>
                <p className="mt-2 text-sm font-medium text-[#1f2937]">
                  {state.order?.items?.length || 0}
                </p>
              </div>
            </div>

            {canUpdateOrderStatus ? (
              <div className="rounded-2xl border border-[#edf0f7] bg-[#fafcff] p-4">
                <p className="text-sm font-semibold text-[#1f2937]">
                  Admin Status Flow
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Orders can only move forward. Previous statuses cannot be selected again.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ORDER_STATUS_FLOW.map((status) => {
                    const isCurrent = status === currentStatus;
                    const isAllowed = nextStatusOptions.includes(status);

                    return (
                      <Button
                        key={status}
                        type="button"
                        variant={isCurrent ? "primary" : "secondary"}
                        size="sm"
                        disabled={!isAllowed || actionLoading}
                        onClick={() => handleUpdateStatus(status)}
                      >
                        {isCurrent ? `${status} (Current)` : status}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-[#edf0f7] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-[#1f2937]">
                    Delivery Tracking
                  </h4>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Track which delivery user took this order and its current shipment status.
                  </p>
                </div>
                {deliveryState.loading ? <Loader text="Loading delivery..." /> : null}
              </div>

              {deliveryState.delivery ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-[#f8fafd] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                      Delivery ID
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#1f2937]">
                      {resolveEntityId(deliveryState.delivery) || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f8fafd] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                      Delivery Status
                    </p>
                    <div className="mt-2">
                      <StatusPill status={deliveryState.delivery?.status || "PENDING"} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f8fafd] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                      Delivery User
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#1f2937]">
                      {getCourierLabel(
                        deliveryState.delivery,
                        deliveryState.courierProfile,
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f8fafd] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                      Address
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#1f2937]">
                      {deliveryState.delivery?.deliveryAddress || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#6b7280]">
                  No delivery tracking record is assigned to this order yet.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[#edf0f7] bg-white p-4">
              <h4 className="text-lg font-semibold text-[#1f2937]">Order Items</h4>
              {state.order?.items?.length ? (
                <div className="mt-4 overflow-x-auto rounded-xl border border-[#edf0f7]">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#f8fafd]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.order.items.map((item, index) => (
                        <tr
                          key={item?.productId || item?._id || `item-${index}`}
                          className="border-t border-[#edf0f7]"
                        >
                          <td className="px-4 py-3 text-sm text-[#374151]">
                            {item?.productName || item?.name || item?.productId || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#374151]">
                            {item?.quantity || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#374151]">
                            {formatMoney(item?.price || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#6b7280]">No order items available.</p>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-1">
              <div className="rounded-2xl border border-[#edf0f7] bg-white p-4">
                <h4 className="text-lg font-semibold text-[#1f2937]">Customer & Loyalty</h4>
                <div className="mt-4 space-y-3 text-sm text-[#374151]">
                  <p>Customer ID: {state.order?.customerId || state.order?.userId || "N/A"}</p>
                  <p>Customer Role: {state.order?.customerRole || state.order?.user?.role || "N/A"}</p>
                  <p>Loyalty Points Used: {state.order?.loyalty?.pointsUsed || 0}</p>
                  <p>
                    Loyalty Discount:{" "}
                    {formatMoney(
                      state.order?.loyalty?.discountAmount ||
                        state.order?.discountAmount ||
                        0,
                    )}
                  </p>
                  <p>Note: {state.order?.note || "N/A"}</p>
                </div>
              </div>

              {/* <div className="rounded-2xl border border-[#edf0f7] bg-white p-4">
                <h4 className="text-lg font-semibold text-[#1f2937]">Raw Payload</h4>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-[#fafcff] p-3 text-xs text-[#334155]">
                  {toPrettyJSON(state.order)}
                </pre>
              </div> */}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
