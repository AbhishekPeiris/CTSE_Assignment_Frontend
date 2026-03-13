import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

const register = async (data) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return response.data;
};

const getCurrentUser = async (token) => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;

  const response = await apiClient.get(API_ENDPOINTS.AUTH.ME, config);
  return response.data;
};

const logout = () => {
  localStorage.removeItem("ctse_auth");
};

export const AuthService = {
  login,
  register,
  getCurrentUser,
  logout,
};
