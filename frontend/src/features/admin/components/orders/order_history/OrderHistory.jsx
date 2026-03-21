import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AuthService } from "../../../../../services/auth.service";
import { OrderService } from "../../../../../services/order.service";
import { resolveEntityId } from "../../../../../utils/helpers";
import ClientOrders from "./components/ClientOrders";
import SelectedOrder from "./components/SelectedOrder";

export default function OrderHistory({
  orders,
  normalizeRole,
  orderStatusDrafts,
  setOrderStatusDrafts,
  handleOrderStatusUpdate,
  handleCancelOrderAsAdmin,
  handleDeleteOrder,
  actionLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [trackingState, setTrackingState] = useState({
    loading: false,
    error: "",
    data: null,
  });
  const [customerNamesByOrderId, setCustomerNamesByOrderId] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadCustomerNames = async () => {
      const namesByOrderId = {};
      const namesByCustomerId = new Map();
      const namesByContact = new Map();

      await Promise.all(
        orders.map(async (order) => {
          const orderId = resolveEntityId(order);

          if (!orderId) {
            return;
          }

          const directName = String(order?.customerName || order?.user?.name || "").trim();

          if (directName) {
            namesByOrderId[orderId] = directName;
            return;
          }

          const customerId =
            order?.userId || order?.customerId || order?.user?._id || order?.user?.id || "";
          const contactNumber = String(
            order?.userContactNumber || order?.customerContactNumber || "",
          ).trim();

          if (customerId && namesByCustomerId.has(customerId)) {
            namesByOrderId[orderId] = namesByCustomerId.get(customerId);
            return;
          }

          if (contactNumber && namesByContact.has(contactNumber)) {
            namesByOrderId[orderId] = namesByContact.get(contactNumber);
            return;
          }

          let resolvedName = "";

          try {
            if (customerId) {
              const userResponse = await AuthService.getUserById(customerId);
              const user = userResponse?.user || userResponse?.data || userResponse;
              resolvedName = String(user?.name || "").trim();
            }

            if (!resolvedName && contactNumber) {
              const contactResponse = await AuthService.getUserByContact(contactNumber);
              const user = contactResponse?.user || contactResponse?.data || contactResponse;
              resolvedName = String(user?.name || "").trim();
            }
          } catch (_error) {
            resolvedName = "";
          }

          const finalName = resolvedName || "Walk-in Customer";

          if (customerId) {
            namesByCustomerId.set(customerId, finalName);
          }

          if (contactNumber) {
            namesByContact.set(contactNumber, finalName);
          }

          namesByOrderId[orderId] = finalName;
        }),
      );

      if (!cancelled) {
        setCustomerNamesByOrderId(namesByOrderId);
      }
    };

    loadCustomerNames();

    return () => {
      cancelled = true;
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatches =
        statusFilter === "ALL" || normalizeRole(order?.status) === statusFilter;

      if (!statusMatches) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        resolveEntityId(order),
        order?.userContactNumber,
        order?.customerName,
        order?.user?.name,
        order?.paymentMethod,
        order?.deliveryLocation?.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [normalizeRole, orders, searchTerm, statusFilter]);

  useEffect(() => {
    if (!filteredOrders.length) {
      setSelectedOrderId("");
      return;
    }

    if (
      !filteredOrders.some(
        (order) => resolveEntityId(order) === selectedOrderId,
      )
    ) {
      setSelectedOrderId(resolveEntityId(filteredOrders[0]));
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = useMemo(() => {
    return (
      orders.find((order) => resolveEntityId(order) === selectedOrderId) || null
    );
  }, [orders, selectedOrderId]);

  useEffect(() => {
    let cancelled = false;

    const loadTracking = async () => {
      if (!selectedOrderId) {
        setTrackingState({
          loading: false,
          error: "",
          data: null,
        });
        return;
      }

      setTrackingState((prev) => ({
        ...prev,
        loading: true,
        error: "",
      }));

      try {
        const tracking = await OrderService.getOrderTracking(selectedOrderId);

        if (cancelled) {
          return;
        }

        setTrackingState({
          loading: false,
          error: "",
          data: tracking,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTrackingState({
          loading: false,
          error:
            error?.friendlyMessage ||
            error?.message ||
            "Unable to load delivery tracking details",
          data: null,
        });
      }
    };

    loadTracking();

    return () => {
      cancelled = true;
    };
  }, [selectedOrderId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
      <div className="grid min-h-[760px] gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <ClientOrders
          filteredOrders={filteredOrders}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          normalizeRole={normalizeRole}
          customerNamesByOrderId={customerNamesByOrderId}
        />

        <SelectedOrder
          selectedOrder={selectedOrder}
          trackingState={trackingState}
          orderStatusDrafts={orderStatusDrafts}
          setOrderStatusDrafts={setOrderStatusDrafts}
          handleOrderStatusUpdate={handleOrderStatusUpdate}
          handleCancelOrderAsAdmin={handleCancelOrderAsAdmin}
          handleDeleteOrder={handleDeleteOrder}
          actionLoading={actionLoading}
          customerNamesByOrderId={customerNamesByOrderId}
        />
      </div>
    </div>
  );
}

OrderHistory.propTypes = {
  orders: PropTypes.array.isRequired,
  normalizeRole: PropTypes.func.isRequired,
  orderStatusDrafts: PropTypes.object.isRequired,
  setOrderStatusDrafts: PropTypes.func.isRequired,
  handleOrderStatusUpdate: PropTypes.func.isRequired,
  handleCancelOrderAsAdmin: PropTypes.func.isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};
