const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  USER_PUBLIC_PROFILE: (id) => `/auth/${id}/public`,
  MY_ORDERS_FROM_AUTH: "/auth/me/orders",
};

const PRODUCTS = {
  GET_ALL: "/products",
  GET_BY_ID: (id) => `/products/${id}`,
  CREATE: "/products",
  RESERVE: (id) => `/products/${id}/reserve`,
  RELEASE: (id) => `/products/${id}/release`,
};

const ORDERS = {
  GET_ALL: "/orders",
  GET_BY_ID: (id) => `/orders/${id}`,
  CREATE: "/orders",
  GET_BY_USER: (userId) => `/orders/by-user/${userId}`,
  UPDATE_STATUS: (id) => `/orders/${id}/status`,
};

const DELIVERIES = {
  GET_ALL: "/deliveries",
  GET_BY_ID: (id) => `/deliveries/${id}`,
  CREATE: "/deliveries",
  UPDATE_STATUS: (id) => `/deliveries/${id}/status`,
};

const HEALTH = {
  GATEWAY: "/health",
};

export const API_ENDPOINTS = {
  AUTH,
  PRODUCTS,
  ORDERS,
  DELIVERIES,
  HEALTH,
};
