import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const createDelivery = async (deliveryData) => {
  const response = await apiClient.post(API_ENDPOINTS.DELIVERIES.CREATE, deliveryData);
  return response.data;
};

const getDeliveries = async () => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_ALL);
  return response.data;
};

const getDeliveryById = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_BY_ID(id));
  return response.data;
};

const updateDeliveryStatus = async (id, status) => {
  const response = await apiClient.patch(API_ENDPOINTS.DELIVERIES.UPDATE_STATUS(id), {
    status,
  });
  return response.data;
};

export const DeliveryService = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
};
