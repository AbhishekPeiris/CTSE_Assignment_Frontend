import { useState } from "react";
import { DeliveryService } from "../../../../services/delivery.service";
import { resolveEntityId } from "../../../../utils/helpers";

const INITIAL_ASSIGN_FORM = {
  orderId: "",
  deliveryUserId: "",
  notes: "",
  priority: "NORMAL",
  estimatedDeliveryTime: "",
};

export function useDeliveryStore({
  runAction,
  setError,
  deliveryUsers,
  loadDeliveries,
  loadOrders,
  loadUsers,
}) {
  const [deliveryAssignForm, setDeliveryAssignForm] = useState(INITIAL_ASSIGN_FORM);
  const [deliveryStatusDrafts, setDeliveryStatusDrafts] = useState({});

  const handleCreateDelivery = async () => {
    if (!deliveryAssignForm.orderId.trim() || !deliveryAssignForm.deliveryUserId.trim()) {
      setError("Order ID and delivery user are required.");
      return;
    }

    const deliveryUser = deliveryUsers.find(
      (user) => resolveEntityId(user) === deliveryAssignForm.deliveryUserId,
    );

    await runAction(
      "create-delivery",
      async () => {
        await DeliveryService.assignDelivery({
          orderId:               deliveryAssignForm.orderId.trim(),
          deliveryUserId:        deliveryAssignForm.deliveryUserId,
          deliveryUserName:      deliveryUser?.name,
          notes:                 deliveryAssignForm.notes.trim() || undefined,
          priority:              deliveryAssignForm.priority || "NORMAL",
          estimatedDeliveryTime: deliveryAssignForm.estimatedDeliveryTime || undefined,
        });

        setDeliveryAssignForm(INITIAL_ASSIGN_FORM);
        await Promise.all([loadDeliveries(), loadOrders()]);
      },
      "Delivery assignment created.",
    );
  };

  const handleDeliveryStatusUpdate = async (delivery) => {
    const deliveryId = resolveEntityId(delivery);
    const status = deliveryStatusDrafts[deliveryId];

    if (!status) {
      setError("Select a delivery status before update.");
      return;
    }

    await runAction(
      `delivery-status:${deliveryId}`,
      async () => {
        await DeliveryService.updateDeliveryStatus(deliveryId, { status });
        await Promise.all([loadDeliveries(), loadOrders(), loadUsers()]);
      },
      "Delivery status updated.",
    );
  };

  return {
    deliveryAssignForm,
    setDeliveryAssignForm,
    deliveryStatusDrafts,
    setDeliveryStatusDrafts,
    handleCreateDelivery,
    handleDeliveryStatusUpdate,
  };
}
