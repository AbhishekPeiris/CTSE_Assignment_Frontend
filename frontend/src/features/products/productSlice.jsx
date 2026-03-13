/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";
import { ProductService } from "../../services/product.service";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    const data = await ProductService.getAllProducts();
    setProducts(data.products || data);
  };

  const getProduct = async (id) => {
    const data = await ProductService.getProductById(id);
    setSelectedProduct(data.product || data);
  };

  const createProduct = async (productData) => {
    const data = await ProductService.createProduct(productData);
    await loadProducts();
    return data;
  };

  const reserveProduct = async (id) => {
    await ProductService.reserveProduct(id);
    await loadProducts();
  };

  const releaseProduct = async (id) => {
    await ProductService.releaseProduct(id);
    await loadProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        selectedProduct,
        loadProducts,
        getProduct,
        createProduct,
        reserveProduct,
        releaseProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
