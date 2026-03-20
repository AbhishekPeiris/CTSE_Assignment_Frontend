import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { DeliveryService } from "../../../services/delivery.service";
import { OrderService } from "../../../services/order.service";
import { UserService } from "../../../services/user.service";
import { ORDER_STATUS_FLOW } from "../../../utils/constants";
import {
  asCollection,
  formatDate,
  formatMoney,
  resolveEntityId,
  resolveRole,
} from "../../../utils/helpers";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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

const getDeliveryOrderId = (delivery) =>
  delivery?.orderId || delivery?.order?._id || delivery?.order?.id || "";

const getDeliveryCourierLabel = (delivery) =>
  delivery?.courier?.name ||
  delivery?.courier?.email ||
  delivery?.deliveryPerson?.name ||
  delivery?.deliveryPerson?.email ||
  delivery?.courierId ||
  delivery?.courier ||
  delivery?.deliveryPerson ||
  "Not assigned";

export default function OrderList({
  title = "All Orders",
  subtitle = "Review every order, update status, and open full delivery tracking.",
}) {
  const navigate = useNavigate();
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const userId = resolveEntityId(auth?.user);
  const canUpdateOrderStatus = role === "ADMIN";
  const canSeeDeliveryTracking = role === "ADMIN";

  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [deliveriesState, setDeliveriesState] = useState({
    loading: false,
    error: "",
    items: [],
  });
  const [actionError, setActionError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    pageSize: 10,
    page: 1,
  });

  const loadOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      let ordersResponse;

      if (role === "ADMIN") {
        ordersResponse = await OrderService.getAllOrders();
      } else if (userId) {
        ordersResponse = await OrderService.getOrdersByUser(userId);
      } else {
        ordersResponse = await UserService.getMyOrders();
      }

      setState({
        loading: false,
        error: "",
        items: asCollection(ordersResponse, ["orders"]),
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

  const loadDeliveries = useCallback(async () => {
    if (!canSeeDeliveryTracking) {
      setDeliveriesState({ loading: false, error: "", items: [] });
      return;
    }

    setDeliveriesState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await DeliveryService.getDeliveries();
      setDeliveriesState({
        loading: false,
        error: "",
        items: asCollection(response, ["deliveries"]),
      });
    } catch (error) {
      setDeliveriesState({
        loading: false,
        error:
          error?.friendlyMessage ||
          error?.message ||
          "Failed to load delivery tracking",
        items: [],
      });
    }
  }, [canSeeDeliveryTracking]);

  useEffect(() => {
    loadOrders();
    loadDeliveries();
  }, [loadDeliveries, loadOrders]);

  const deliveriesByOrderId = useMemo(() => {
    return deliveriesState.items.reduce((accumulator, delivery) => {
      const orderId = getDeliveryOrderId(delivery);

      if (orderId && !accumulator[orderId]) {
        accumulator[orderId] = delivery;
      }

      return accumulator;
    }, {});
  }, [deliveriesState.items]);

  const filteredOrders = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return [...state.items]
      .sort((left, right) => {
        const leftTime = new Date(left?.createdAt || 0).getTime();
        const rightTime = new Date(right?.createdAt || 0).getTime();
        return rightTime - leftTime;
      })
      .filter((order) => {
        const orderId = resolveEntityId(order);
        const currentStatus = getOrderStatus(order);
        const customerLabel = getOrderCustomerLabel(order);
        const delivery = deliveriesByOrderId[orderId];
        const haystack = [
          orderId,
          customerLabel,
          order?.contactNumber,
          order?.customerRole,
          currentStatus,
          getDeliveryCourierLabel(delivery),
        ]
          .join(" ")
          .toLowerCase();

        if (filters.status !== "ALL" && currentStatus !== filters.status) {
          return false;
        }

        if (searchTerm && !haystack.includes(searchTerm)) {
          return false;
        }

        return true;
      });
  }, [deliveriesByOrderId, filters.search, filters.status, state.items]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / Number(filters.pageSize || 10)),
  );

  const paginatedOrders = useMemo(() => {
    const currentPage = Math.min(filters.page, totalPages);
    const pageSize = Number(filters.pageSize || 10);
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, filters.page, filters.pageSize, totalPages]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [filters.search, filters.status, filters.pageSize]);

  useEffect(() => {
    if (filters.page > totalPages) {
      setFilters((prev) => ({ ...prev, page: totalPages }));
    }
  }, [filters.page, totalPages]);

  const handleStatusChange = (orderId, status) => {
    setStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const allowedStatuses = getOrderTransitionOptions(currentStatus);
    const nextStatus = statusDrafts[orderId] || allowedStatuses[0];

    if (!allowedStatuses.includes(nextStatus)) {
      setActionError(
        `Invalid status transition. ${currentStatus} can only move forward.`,
      );
      return;
    }

    setActionError("");
    setActionLoadingId(orderId);

    try {
      await OrderService.updateOrderStatus(orderId, nextStatus);
      await loadOrders();
    } catch (error) {
      setActionError(
        error?.friendlyMessage ||
          error?.message ||
          "Failed to update order status",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <Card title={title} subtitle={subtitle}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(220px,_1.4fr)_180px_120px]">
          <div>
            <label
              htmlFor="order-search"
              className="mb-1 block text-sm font-medium text-[#374151]"
            >
              Search orders
            </label>
            <input
              id="order-search"
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              placeholder="Search by order id, customer, phone, or courier"
              className="w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
            />
          </div>
          <div>
            <label
              htmlFor="order-status-filter"
              className="mb-1 block text-sm font-medium text-[#374151]"
            >
              Status
            </label>
            <select
              id="order-status-filter"
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
              className="w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
            >
              <option value="ALL">ALL</option>
              {ORDER_STATUS_FLOW.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="order-page-size"
              className="mb-1 block text-sm font-medium text-[#374151]"
            >
              Rows
            </label>
            <select
              id="order-page-size"
              value={filters.pageSize}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  pageSize: Number(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            loadOrders();
            loadDeliveries();
          }}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <ErrorMessage message={state.error} />
        <ErrorMessage message={deliveriesState.error} />
        <ErrorMessage message={actionError} />
      </div>

      {state.loading ? <Loader text="Loading orders..." /> : null}

      {!state.loading && filteredOrders.length === 0 ? (
        <p className="text-sm text-[#6b7280]">No orders found.</p>
      ) : null}

      {!state.loading && filteredOrders.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[#e7ebf3]">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#f8fafd]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, index) => {
                  const orderId = resolveEntityId(order) || `order-${index}`;
                  const currentStatus = getOrderStatus(order);
                  const transitionOptions = getOrderTransitionOptions(currentStatus);
                  const delivery = deliveriesByOrderId[orderId];
                  const selectedDraft =
                    statusDrafts[orderId] || transitionOptions[0] || currentStatus;

                  return (
                    <tr
                      key={orderId}
                      onClick={() => navigate(`/orders/${orderId}`)}
                      className="cursor-pointer border-t border-[#edf0f7] transition hover:bg-[#fafcff]"
                    >
                      <td className="px-4 py-3 text-sm text-[#1f2937]">
                        <div className="font-semibold">{orderId}</div>
                        <div className="mt-1 text-xs text-[#6b7280]">
                          {order?.customerRole || order?.user?.role || "CUSTOMER"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        <div>{getOrderCustomerLabel(order)}</div>
                        <div className="mt-1 text-xs text-[#6b7280]">
                          {order?.contactNumber || order?.user?.email || "No contact"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {order?.items?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1f2937]">
                        {formatMoney(getOrderTotal(order))}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        <StatusPill status={currentStatus} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {delivery ? (
                          <div>
                            <StatusPill status={delivery?.status || "PENDING"} />
                            <p className="mt-1 text-xs text-[#6b7280]">
                              {getDeliveryCourierLabel(delivery)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94a3b8]">
                            No delivery assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {formatDate(order?.createdAt)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-[#374151]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/orders/${orderId}`)}
                          >
                            Details
                          </Button>

                          {canUpdateOrderStatus ? (
                            transitionOptions.length > 0 ? (
                              <>
                                <select
                                  value={selectedDraft}
                                  onChange={(event) =>
                                    handleStatusChange(orderId, event.target.value)
                                  }
                                  className="rounded-lg border border-[#d9dde8] bg-white px-2.5 py-1.5 text-xs text-[#1f2937] outline-none focus:border-[#1a73e8]"
                                >
                                  {transitionOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(orderId, currentStatus)
                                  }
                                  disabled={actionLoadingId === orderId}
                                >
                                  {actionLoadingId === orderId
                                    ? "Updating..."
                                    : "Update"}
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs font-medium text-[#94a3b8]">
                                Locked
                              </span>
                            )
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6b7280]">
              Showing {(Math.min(filters.page, totalPages) - 1) * filters.pageSize + 1}
              {" "}to{" "}
              {Math.min(
                Math.min(filters.page, totalPages) * filters.pageSize,
                filteredOrders.length,
              )}{" "}
              of {filteredOrders.length} orders
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={filters.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-[#374151]">
                Page {Math.min(filters.page, totalPages)} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(totalPages, prev.page + 1),
                  }))
                }
                disabled={filters.page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}

OrderList.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
