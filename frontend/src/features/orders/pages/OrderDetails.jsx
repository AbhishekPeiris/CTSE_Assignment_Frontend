import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrders } from "../orderSlice";

export default function OrderDetails() {
  const { id } = useParams();
  const { selectedOrder, getOrder } = useOrders();

  useEffect(() => {
    getOrder(id);
  }, [id]);

  if (!selectedOrder) {
    return <p>Loading order...</p>;
  }

  return (
    <div className="order-details">
      <h2>Order #{selectedOrder._id}</h2>

      <p>User ID: {selectedOrder.userId}</p>

      <p>Status: {selectedOrder.status}</p>

      <p>Total Amount: ${selectedOrder.totalAmount}</p>

      <h4>Items</h4>

      <ul>
        {selectedOrder.items?.map((item, index) => (
          <li key={index}>
            Product: {item.productId} | Qty: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
