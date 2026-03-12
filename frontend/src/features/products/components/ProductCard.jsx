import { Link } from "react-router-dom";
import { useProducts } from "../productSlice";

export default function ProductCard({ product }) {
  const { reserveProduct, releaseProduct } = useProducts();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <p className="price">Price: ${product.price}</p>

      <p>Status: {product.status || "AVAILABLE"}</p>

      <div className="product-actions">
        <Link to={`/products/${product._id}`} className="btn-view">
          View
        </Link>

        <button
          onClick={() => reserveProduct(product._id)}
          className="btn-reserve"
        >
          Reserve
        </button>

        <button
          onClick={() => releaseProduct(product._id)}
          className="btn-release"
        >
          Release
        </button>
      </div>
    </div>
  );
}
