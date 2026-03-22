const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  MY_ORDERS_FROM_AUTH: "/auth/me/orders",
};

const USERS = {
  GET_ALL: "/users",
  CREATE_MANAGED: "/users",
  GET_BY_ID: (id) => `/users/${id}`,
  GET_BY_CONTACT: (contactNumber) => `/users/by-contact/${encodeURIComponent(contactNumber)}`,
  LOOKUP_OR_CREATE_CUSTOMER: "/users/customers/lookup-or-create",
  ADJUST_LOYALTY: (id) => `/users/${id}/loyalty`,
  PUBLIC_PROFILE: (id) => `/users/${id}/public`,
};

const PRODUCTS = {
  GET_ALL: "/products",
  GET_BY_ID: (id) => `/products/${id}`,
  CREATE: "/products",
  UPDATE: (id) => `/products/${id}`,
  DELETE: (id) => `/products/${id}`,
  RESERVE: (id) => `/products/${id}/reserve`,
  RELEASE: (id) => `/products/${id}/release`,
};

const CATEGORIES = {
  GET_ALL: "/products/categories",
  CREATE: "/products/categories",
  UPDATE: (id) => `/products/categories/${id}`,
  DELETE: (id) => `/products/categories/${id}`,
};

const ORDERS = {
  GET_ALL: "/orders",
  GET_MY: "/orders/my",
  GET_BY_ID: (id) => `/orders/${id}`,
  GET_TRACKING: (id) => `/orders/${id}/tracking`,
  CREATE: "/orders",
  GET_BY_USER: (userId) => `/orders/by-user/${userId}`,
  UPDATE_PENDING: (id) => `/orders/${id}`,
  CANCEL: (id) => `/orders/${id}/cancel`,
  ASSIGN_DELIVERY: (id) => `/orders/${id}/assign-delivery`,
  UPDATE_STATUS: (id) => `/orders/${id}/status`,
  DELETE: (id) => `/orders/${id}`,
};

const DELIVERIES = {
  GET_ALL: "/deliveries",
  GET_MY_TODAY: "/deliveries/my/today",
  GET_BY_ID: (id) => `/deliveries/${id}`,
  GET_BY_ORDER: (orderId) => `/deliveries/order/${orderId}`,
  CREATE: "/deliveries",
  ASSIGN: "/deliveries/assign",
  UPDATE_STATUS: (id) => `/deliveries/${id}/status`,
};

const HEALTH = {
  GATEWAY: "/health",
};

export const API_ENDPOINTS = {
  AUTH,
  USERS,
  PRODUCTS,
  CATEGORIES,
  ORDERS,
  DELIVERIES,
  HEALTH,
};
