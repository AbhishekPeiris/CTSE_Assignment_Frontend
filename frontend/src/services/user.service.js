import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const getPublicProfile = async (userId) => {
    const response = await apiClient.get(
        API_ENDPOINTS.USERS.PUBLIC_PROFILE(userId)
    );
    return response.data;
};

const getMyOrders = async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.MY_ORDERS_FROM_AUTH);
    return response.data;
};

export const UserService = {
    getPublicProfile,
    getMyOrders,
};