import { Link } from "react-router-dom";
import { useOrders } from "../orderSlice";

export default function OrderCard({ order }) {
  const { updateStatus } = useOrders();

  return (
    <div className="order-card">
      <h3>Order #{order._id}</h3>

      <p>User: {order.userId}</p>

      <p>Status: {order.status}</p>

      <p>Total: ${order.totalAmount}</p>

      <div className="order-actions">
        <Link to={`/orders/${order._id}`} className="btn-view">
          View
        </Link>

        <button
          onClick={() => updateStatus(order._id, "PROCESSING")}
          className="btn-process"
        >
          Process
        </button>

        <button
          onClick={() => updateStatus(order._id, "DELIVERED")}
          className="btn-delivered"
        >
          Deliver
        </button>
      </div>
    </div>
  );
}
