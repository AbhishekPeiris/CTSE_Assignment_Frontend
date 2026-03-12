import { useEffect } from "react";
import { useProducts } from "../productSlice";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";

export default function ProductList() {
  const { products, loadProducts } = useProducts();

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="product-page">
      <h2>Products</h2>

      <ProductForm />

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
