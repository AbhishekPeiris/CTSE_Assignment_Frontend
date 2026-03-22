import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const login = async ({ contactNumber, password }) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
    contactNumber,
    password,
  });

  return response.data;
};

const register = async ({ name, contactNumber, password }) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
    name,
    contactNumber,
    password,
  });

  return response.data;
};

const getCurrentUser = async () => {
  const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
  return response.data;
};

const getMyOrdersFromAuth = async () => {
  const response = await apiClient.get(API_ENDPOINTS.AUTH.MY_ORDERS_FROM_AUTH);
  return response.data;
};

const getUsers = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL, { params });
  return response.data;
};

const createManagedUser = async (payload) => {
  const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE_MANAGED, payload);
  return response.data;
};

const getUserById = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.USERS.GET_BY_ID(id));
  return response.data;
};

const getUserByContact = async (contactNumber) => {
  const response = await apiClient.get(API_ENDPOINTS.USERS.GET_BY_CONTACT(contactNumber));
  return response.data;
};

const lookupOrCreateCustomer = async (payload) => {
  const response = await apiClient.post(API_ENDPOINTS.USERS.LOOKUP_OR_CREATE_CUSTOMER, payload);
  return response.data;
};

const adjustUserLoyalty = async (userId, payload) => {
  const response = await apiClient.patch(API_ENDPOINTS.USERS.ADJUST_LOYALTY(userId), payload);
  return response.data;
};

const logout = () => {
  localStorage.removeItem("ctse_auth");
};

export const AuthService = {
  login,
  register,
  getCurrentUser,
  getMyOrdersFromAuth,
  getUsers,
  createManagedUser,
  getUserById,
  getUserByContact,
  lookupOrCreateCustomer,
  adjustUserLoyalty,
  logout,
};
