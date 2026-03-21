import { useMemo, useState } from "react";
import { OrderService } from "../../../../services/order.service";
import { resolveEntityId } from "../../../../utils/helpers";

const INITIAL_ORDER_FORM = {
  customerContactNumber: "",
  customerName: "",
  loyaltyPointsToUse: "0",
  deliveryAddress: "",
  latitude: "",
  longitude: "",
  selectedProductId: "",
  selectedQuantity: "1",
  items: [],
};

export function useOrderStore({
  runAction,
  setError,
  products,
  deliveryUsers,
  loadOrders,
  loadUsers,
  loadProducts,
  loadDeliveries,
}) {
  const [orderForm, setOrderForm] = useState(INITIAL_ORDER_FORM);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [orderAssignmentDrafts, setOrderAssignmentDrafts] = useState({});

  const selectedProductForOrder = useMemo(() => {
    return (
      products.find(
        (product) => resolveEntityId(product) === orderForm.selectedProductId,
      ) || null
    );
  }, [orderForm.selectedProductId, products]);

  const handleAddItemToOrderDraft = () => {
    if (!selectedProductForOrder) {
      setError("Select a product before adding items.");
      return;
    }

    const quantity = Math.max(1, Number(orderForm.selectedQuantity || 1));
    const stock = Number(selectedProductForOrder.stock || 0);

    if (quantity > stock) {
      setError("Requested quantity exceeds current stock.");
      return;
    }

    setOrderForm((prev) => {
      const existingIndex = prev.items.findIndex(
        (item) => item.productId === prev.selectedProductId,
      );

      if (existingIndex >= 0) {
        const nextItems = [...prev.items];
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: Math.min(
            stock,
            Number(nextItems[existingIndex].quantity || 0) + quantity,
          ),
        };

        return {
          ...prev,
          items: nextItems,
          selectedQuantity: "1",
        };
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            productId: prev.selectedProductId,
            name: selectedProductForOrder.name,
            quantity,
            stock,
          },
        ],
        selectedQuantity: "1",
      };
    });

    setError("");
  };

  const handleCreateOrderByAdmin = async () => {
    if (!orderForm.customerContactNumber.trim()) {
      setError("Customer contact number is required.");
      return;
    }

    if (!orderForm.items.length) {
      setError("Please add at least one item for the order.");
      return;
    }

    if (
      !orderForm.deliveryAddress.trim() ||
      !orderForm.latitude ||
      !orderForm.longitude
    ) {
      setError("Delivery address and map location are required.");
      return;
    }

    await runAction(
      "create-admin-order",
      async () => {
        await OrderService.createOrder({
          customerContactNumber: orderForm.customerContactNumber.trim(),
          customerName: orderForm.customerName.trim() || undefined,
          loyaltyPointsToUse: Math.max(
            0,
            Number(orderForm.loyaltyPointsToUse || 0),
          ),
          items: orderForm.items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
          })),
          deliveryLocation: {
            address: orderForm.deliveryAddress.trim(),
            latitude: Number(orderForm.latitude),
            longitude: Number(orderForm.longitude),
          },
        });

        setOrderForm(INITIAL_ORDER_FORM);
        await Promise.all([loadOrders(), loadUsers(), loadProducts()]);
      },
      "Order created for customer.",
    );
  };

  const handleAssignDeliveryToOrder = async (order) => {
    const orderId = resolveEntityId(order);
    const draft = orderAssignmentDrafts[orderId];

    if (!draft?.deliveryUserId) {
      setError("Select a delivery user before assignment.");
      return;
    }

    const deliveryUser = deliveryUsers.find(
      (user) => resolveEntityId(user) === draft.deliveryUserId,
    );

    await runAction(
      `assign-order:${orderId}`,
      async () => {
        await OrderService.assignDelivery(orderId, {
          deliveryUserId: draft.deliveryUserId,
          deliveryUserName: deliveryUser?.name,
        });

        await Promise.all([loadOrders(), loadDeliveries()]);
      },
      "Delivery assigned to order.",
    );
  };

  const handleOrderStatusUpdate = async (order) => {
    const orderId = resolveEntityId(order);
    const status = orderStatusDrafts[orderId] || "";

    if (!status) {
      setError("Select an order status before updating.");
      return;
    }

    await runAction(
      `status-order:${orderId}`,
      async () => {
        await OrderService.updateOrderStatus(orderId, { status });
        await Promise.all([loadOrders(), loadDeliveries(), loadUsers()]);
      },
      "Order status updated.",
    );
  };

  const handleCancelOrderAsAdmin = async (order) => {
    const orderId = resolveEntityId(order);
    const reason = globalThis.prompt("Cancellation reason (optional):") || "";

    await runAction(
      `cancel-order:${orderId}`,
      async () => {
        await OrderService.cancelOrder(orderId, reason);
        await Promise.all([loadOrders(), loadDeliveries(), loadUsers()]);
      },
      "Order cancelled by admin.",
    );
  };

  const handleDeleteOrder = async (orderId) => {
    await runAction(
      `delete-order:${orderId}`,
      async () => {
        await OrderService.deleteOrderPermanently(orderId);
        await Promise.all([loadOrders(), loadDeliveries(), loadUsers()]);
      },
      "Order deleted permanently.",
    );
  };

  return {
    orderForm,
    setOrderForm,
    orderStatusDrafts,
    setOrderStatusDrafts,
    orderAssignmentDrafts,
    setOrderAssignmentDrafts,
    handleAddItemToOrderDraft,
    handleCreateOrderByAdmin,
    handleAssignDeliveryToOrder,
    handleOrderStatusUpdate,
    handleCancelOrderAsAdmin,
    handleDeleteOrder,
  };
}
