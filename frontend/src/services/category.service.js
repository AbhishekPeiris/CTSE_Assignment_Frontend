import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const getAllCategories = async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
    return response.data;
};

const createCategory = async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return response.data;
};

const updateCategory = async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return response.data;
};

export const CategoryService = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
