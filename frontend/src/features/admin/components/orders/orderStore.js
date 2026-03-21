import { useState } from "react";
import { AuthService } from "../../../../services/auth.service";
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
  const [orderCustomer, setOrderCustomer] = useState(null);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [orderAssignmentDrafts, setOrderAssignmentDrafts] = useState({});

  const handleAddItemToOrderDraft = (
    productIdOverride = "",
    quantityOverride = "",
  ) => {
    const productIdToAdd = productIdOverride || orderForm.selectedProductId;
    const productToAdd =
      products.find((product) => resolveEntityId(product) === productIdToAdd) ||
      null;

    if (!productToAdd) {
      setError("Select a product before adding items.");
      return;
    }

    const quantity = Math.max(
      1,
      Number(quantityOverride || orderForm.selectedQuantity || 1),
    );
    const stock = Number(productToAdd.stock || 0);

    if (quantity > stock) {
      setError("Requested quantity exceeds current stock.");
      return;
    }

    setOrderForm((prev) => {
      const existingIndex = prev.items.findIndex(
        (item) => item.productId === productIdToAdd,
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
          selectedProductId: productIdToAdd,
          selectedQuantity: "1",
        };
      }

      return {
        ...prev,
        selectedProductId: productIdToAdd,
        items: [
          ...prev.items,
          {
            productId: productIdToAdd,
            name: productToAdd.name,
            quantity,
            stock,
            price: Number(productToAdd.price || 0),
            imageUrl: productToAdd.imageUrl || "",
            category: productToAdd.category || "",
          },
        ],
        selectedQuantity: "1",
      };
    });

    setError("");
  };

  const handleLookupOrCreateOrderCustomer = async () => {
    const contactNumber = orderForm.customerContactNumber.trim();

    if (!contactNumber) {
      setError("Customer contact number is required.");
      return;
    }

    await runAction(
      "order-customer-lookup",
      async () => {
        const response = await AuthService.lookupOrCreateCustomer({
          contactNumber,
          name: orderForm.customerName.trim() || undefined,
        });

        const customer = response?.user || response;

        setOrderCustomer(customer);
        setOrderForm((prev) => ({
          ...prev,
          customerContactNumber:
            customer?.contactNumber || prev.customerContactNumber,
          customerName: customer?.name || prev.customerName,
        }));

        await loadUsers();
      },
      "Customer is ready for order placement.",
    );
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
      !orderCustomer ||
      orderCustomer.contactNumber !== orderForm.customerContactNumber.trim()
    ) {
      setError("Lookup or create the customer before placing the order.");
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
        setOrderCustomer(null);
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
    orderCustomer,
    setOrderCustomer,
    orderStatusDrafts,
    setOrderStatusDrafts,
    orderAssignmentDrafts,
    setOrderAssignmentDrafts,
    handleAddItemToOrderDraft,
    handleLookupOrCreateOrderCustomer,
    handleCreateOrderByAdmin,
    handleAssignDeliveryToOrder,
    handleOrderStatusUpdate,
    handleCancelOrderAsAdmin,
    handleDeleteOrder,
  };
}
