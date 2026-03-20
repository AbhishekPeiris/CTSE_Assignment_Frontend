import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const getAllOrders = async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_ALL, { params });
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

const getMyOrders = async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_MY);
    return response.data;
};

const getOrdersByUser = async (userId) => {
    const response = await apiClient.get(
        API_ENDPOINTS.ORDERS.GET_BY_USER(userId)
    );
    return response.data;
};

const getOrderTracking = async (orderId) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_TRACKING(orderId));
    return response.data;
};

const updatePendingOrder = async (orderId, payload) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORDERS.UPDATE_PENDING(orderId), payload);
    return response.data;
};

const cancelOrder = async (orderId, reason = "") => {
    const response = await apiClient.patch(
        API_ENDPOINTS.ORDERS.CANCEL(orderId),
        reason ? { reason } : {}
    );
    return response.data;
};

const assignDelivery = async (orderId, payload) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORDERS.ASSIGN_DELIVERY(orderId), payload);
    return response.data;
};

const updateOrderStatus = async (orderId, payload) => {
    const body = typeof payload === "string" ? { status: payload } : payload;
    const response = await apiClient.patch(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        body
    );
    return response.data;
};

const deleteOrderPermanently = async (orderId) => {
    const response = await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE(orderId));
    return response.data;
};

export const OrderService = {
    getAllOrders,
    getOrderById,
    createOrder,
    getMyOrders,
    getOrdersByUser,
    getOrderTracking,
    updatePendingOrder,
    cancelOrder,
    assignDelivery,
    updateOrderStatus,
    deleteOrderPermanently,
};