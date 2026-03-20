import Card from "../../../components/ui/Card";
import CreateOrder from "../components/CreateOrder";
import OrderList from "../components/OrderList";
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
    <div className="space-y-6">
      <Card
        title="Orders"
        subtitle="Create customer-facing orders from a POS-style market counter."
        className="overflow-hidden border-line bg-white"
      >
        {canCreateOrder ? (
          <CreateOrder onOrderCreated={handleCreateOrder} />
        ) : null}
      </Card>

      <OrderList
        title="Order Table"
        subtitle="Fetch all orders, review delivery assignment, and manage admin status changes."
      />
    </div>
  );
}
