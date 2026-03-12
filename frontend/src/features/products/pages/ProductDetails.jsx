import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "../productSlice";

export default function ProductDetails() {
  const { id } = useParams();
  const { selectedProduct, getProduct } = useProducts();

  useEffect(() => {
    getProduct(id);
  }, [id]);

  if (!selectedProduct) {
    return <p>Loading product...</p>;
  }

  return (
    <div className="product-details">
      <h2>{selectedProduct.name}</h2>

      <p>{selectedProduct.description}</p>

      <p>Price: ${selectedProduct.price}</p>

      <p>Status: {selectedProduct.status}</p>
    </div>
  );
}
