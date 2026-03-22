import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const getAllUsersOrders = async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_ALL);
    return response.data;
};

const updateOrderStatus = async (orderId, status) => {
    const response = await apiClient.patch(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        { status }
    );
    return response.data;
};

const createProduct = async (productData) => {
    const response = await apiClient.post(
        API_ENDPOINTS.PRODUCTS.CREATE,
        productData
    );
    return response.data;
};

const reserveProduct = async (productId, payload = {}) => {
    const response = await apiClient.patch(
        API_ENDPOINTS.PRODUCTS.RESERVE(productId),
        payload
    );
    return response.data;
};

const releaseProduct = async (productId, payload = {}) => {
    const response = await apiClient.patch(
        API_ENDPOINTS.PRODUCTS.RELEASE(productId),
        payload
    );
    return response.data;
};

export const AdminService = {
    getAllUsersOrders,
    updateOrderStatus,
    createProduct,
    reserveProduct,
    releaseProduct,
};