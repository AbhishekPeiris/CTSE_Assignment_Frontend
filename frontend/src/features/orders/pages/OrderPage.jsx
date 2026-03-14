import Card from "../../../components/ui/Card";
import CreateOrder from "../components/CreateOrder";
import { useAppContext } from "../../../app/providers/AppProvider";
import { OrderService } from "../../../services/order.service";
import {
  resolveRole,
} from "../../../utils/helpers";

export default function OrderPage() {
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const canCreateOrder = role === "ADMIN";

  const handleCreateOrder = async (payload) => {
    await OrderService.createOrder(payload);
  };

  return (
    <Card
      title="Orders"
      subtitle="Create customer-facing orders from a POS-style market counter."
      className="overflow-hidden bg-white border-line"
    >
      {canCreateOrder ? (
        <CreateOrder onOrderCreated={handleCreateOrder} />
      ) : null}
    </Card>
  );
}
