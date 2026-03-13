import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const getAllOrders = async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_ALL);
    return response.data;
};

const getOrderById = async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
    return response.data;
};

const createOrder = async (orderData) => {
    const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.CREATE,
        orderData
    );
    return response.data;
};

const getOrdersByUser = async (userId) => {
    const response = await apiClient.get(
        API_ENDPOINTS.ORDERS.GET_BY_USER(userId)
    );
    return response.data;
};

const updateOrderStatus = async (orderId, status) => {
    const response = await apiClient.patch(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        { status }
    );
    return response.data;
};

export const OrderService = {
    getAllOrders,
    getOrderById,
    createOrder,
    getOrdersByUser,
    updateOrderStatus,
};