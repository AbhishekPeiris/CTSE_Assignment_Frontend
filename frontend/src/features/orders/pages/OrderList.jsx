import { useEffect } from "react";
import { useOrders } from "../orderSlice";
import OrderCard from "../components/OrderCard";

export default function OrderList() {
  const { orders, loadOrders } = useOrders();

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="orders-page">
      <h2>Orders</h2>

      <div className="orders-grid">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}
