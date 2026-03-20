/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";
import { OrderService } from "../../services/order.service";
import { asCollection, asEntity } from "../../utils/helpers";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    const data = await OrderService.getAllOrders();
    setOrders(asCollection(data, ["orders"]));
  };

  const getOrder = async (id) => {
    const data = await OrderService.getOrderById(id);
    setSelectedOrder(asEntity(data, ["order"]));
  };

  const createOrder = async (orderData) => {
    const data = await OrderService.createOrder(orderData);
    await loadOrders();
    return data;
  };

  const updateStatus = async (id, status) => {
    await OrderService.updateOrderStatus(id, status);
    await loadOrders();
  };

  const getOrdersByUser = async (userId) => {
    const data = await OrderService.getOrdersByUser(userId);
    setOrders(asCollection(data, ["orders"]));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        selectedOrder,
        loadOrders,
        getOrder,
        createOrder,
        updateStatus,
        getOrdersByUser,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
