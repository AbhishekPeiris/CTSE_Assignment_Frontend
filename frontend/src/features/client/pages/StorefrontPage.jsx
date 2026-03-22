import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import { useAppContext } from "../../../app/providers/AppProvider";
import { ProductService } from "../../../services/product.service";
import { asCollection, resolveEntityId } from "../../../utils/helpers";
import HeroSection from "../components/HeroSection";
import ProductFiltersBar from "../components/ProductFiltersBar";
import ProductGrid from "../components/ProductGrid";
import {
  clientStore,
  getCartCount,
  getCartSubtotal,
  useClientStore,
} from "../clientStore";

function normalizeStock(product) {
  const stock = Number(product?.stock ?? 0);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
}

export default function StorefrontPage() {
  const { auth } = useAppContext();
  const loyaltyBalance = Number(auth?.user?.loyaltyPoints || 0);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    inStock: false,
  });

  const [state, setState] = useState({
    loading: true,
    error: "",
    products: [],
  });

  const clientState = useClientStore();

  const loadProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const params = {
        ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.inStock ? { inStock: "true" } : {}),
      };

      const response = await ProductService.getAllProducts(params);
      setState({
        loading: false,
        error: "",
        products: asCollection(response, ["products"]),
      });
    } catch (error) {
      setState({
        loading: false,
        error:
          error?.friendlyMessage || error?.message || "Unable to load products",
        products: [],
      });
    }
  }, [filters.category, filters.inStock, filters.search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const values = new Set();

    state.products.forEach((product) => {
      if (product?.category) {
        values.add(product.category);
      }
    });

    return [...values].sort((left, right) => left.localeCompare(right));
  }, [state.products]);

  const cartSubtotal = useMemo(
    () => getCartSubtotal(clientState),
    [clientState],
  );
  const cartItemCount = useMemo(() => getCartCount(clientState), [clientState]);

  const handleCartQuantityChange = (product, nextQuantity) => {
    const productId = resolveEntityId(product);

    if (!productId) {
      return;
    }

    const stock = normalizeStock(product);
    const quantity = Math.min(stock, Math.max(0, Number(nextQuantity || 0)));

    clientStore.setItem(
      {
        id: productId,
        ...product,
      },
      quantity,
    );
  };

  const handleAddToCart = (product) => {
    const stock = normalizeStock(product);
    if (stock <= 0) {
      return;
    }

    const productId = resolveEntityId(product);
    const existingQuantity = Number(clientState.cart[productId]?.quantity || 0);
    handleCartQuantityChange(product, existingQuantity + 1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getProductProps = (product) => {
    const productId = resolveEntityId(product);
    const stock = normalizeStock(product);
    const inStock = stock > 0;
    const quantityInCart = Number(clientState.cart[productId]?.quantity || 0);

    return {
      productId,
      stock,
      inStock,
      quantityInCart,
      onDecrease: () => handleCartQuantityChange(product, quantityInCart - 1),
      onIncrease: () => handleCartQuantityChange(product, quantityInCart + 1),
      onAdd: () => handleAddToCart(product),
    };
  };

  return (
    <div className="mx-auto w-full max-w-[1220px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <HeroSection
          cartCount={cartItemCount}
          subtotal={cartSubtotal}
          loyaltyBalance={loyaltyBalance}
        />

        <ProductFiltersBar
          filters={filters}
          categories={categories}
          onChange={handleFilterChange}
        />

        <div className="rounded-3xl border border-[#d9e2ec] bg-white px-4 py-3 text-sm text-[#5f6368]">
          Cart is saved in local storage. Continue checkout in{" "}
          <Link to="/cart" className="font-semibold text-[#1967d2]">
            Cart
          </Link>
          .
        </div>

        <ErrorMessage message={state.error} />

        {state.loading ? <Loader text="Loading products..." /> : null}

        {state.loading ? null : (
          <ProductGrid
            products={state.products}
            getProductProps={getProductProps}
          />
        )}
      </div>
    </div>
  );
}
