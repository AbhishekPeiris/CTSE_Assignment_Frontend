import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const createDelivery = async (deliveryData) => {
  const response = await apiClient.post(API_ENDPOINTS.DELIVERIES.CREATE, deliveryData);
  return response.data;
};

const assignDelivery = async (deliveryData) => {
  const response = await apiClient.post(API_ENDPOINTS.DELIVERIES.ASSIGN, deliveryData);
  return response.data;
};

const getDeliveries = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_ALL, { params });
  return response.data;
};

const getMyTodayDeliveries = async () => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_MY_TODAY);
  return response.data;
};

const getDeliveryById = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_BY_ID(id));
  return response.data;
};

const getDeliveryByOrderId = async (orderId) => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_BY_ORDER(orderId));
  return response.data;
};

const updateDeliveryStatus = async (id, payload) => {
  const body = typeof payload === "string" ? { status: payload } : payload;
  const response = await apiClient.patch(API_ENDPOINTS.DELIVERIES.UPDATE_STATUS(id), {
    ...body,
  });
  return response.data;
};

export const DeliveryService = {
  createDelivery,
  assignDelivery,
  getDeliveries,
  getMyTodayDeliveries,
  getDeliveryById,
  getDeliveryByOrderId,
  updateDeliveryStatus,
};
