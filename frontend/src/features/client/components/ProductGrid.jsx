import PropTypes from "prop-types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, getProductProps }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const props = getProductProps(product);

        return (
          <ProductCard key={props.productId} {...props} product={product} />
        );
      })}
    </section>
  );
}

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  getProductProps: PropTypes.func.isRequired,
};
