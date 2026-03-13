import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const getAllProducts = async () => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_ALL);
    return response.data;
};

const getProductById = async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
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

export const ProductService = {
    getAllProducts,
    getProductById,
    createProduct,
    reserveProduct,
    releaseProduct,
};