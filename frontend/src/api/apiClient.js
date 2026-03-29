import axios from "axios";
import { authStore } from "../app/store/authStore";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    if (status === 401) {
      authStore.clearAuth();
      globalThis.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject({
      ...error,
      friendlyMessage: message,
    });
  },
);

export default apiClient;
