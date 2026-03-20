import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";
import { AuthService } from "../../../services/auth.service";
import { authStore } from "../../../app/store/authStore";

import {
  asCollection,
  formatMoney,
  resolveEntityId,
  resolveRole,
} from "../../../utils/helpers";
import { getDefaultRouteForRole } from "../../../utils/roleRouting";
import LocationPickerMap from "../components/LocationPickerMap";

const EMPTY_CHECKOUT = {
  address: "",
  latitude: "",
  longitude: "",
  loyaltyPointsToUse: "0",
};

function normalizeStock(product) {
  const stock = Number(product?.stock ?? 0);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
}

export default function StorefrontPage() {
  const navigate = useNavigate();
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const isLoggedIn = Boolean(auth?.isAuthenticated);
  const isUser = role === "USER";

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

  const [cart, setCart] = useState({});
  const [checkout, setCheckout] = useState(EMPTY_CHECKOUT);
  const [orderError, setOrderError] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

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

  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) =>
        sum + Number(item.product.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartItems]);

  const handleCartQuantityChange = (product, nextQuantity) => {
    const productId = resolveEntityId(product);

    if (!productId) {
      return;
    }

    const stock = normalizeStock(product);
    const quantity = Math.min(stock, Math.max(0, Number(nextQuantity || 0)));

    setCart((prev) => {
      if (quantity === 0) {
        const clone = { ...prev };
        delete clone[productId];
        return clone;
      }

      return {
        ...prev,
        [productId]: {
          product,
          quantity,
        },
      };
    });
  };

  const handleAddToCart = (product) => {
    const stock = normalizeStock(product);
    if (stock <= 0) {
      return;
    }

    const productId = resolveEntityId(product);
    const existingQuantity = Number(cart[productId]?.quantity || 0);
    handleCartQuantityChange(product, existingQuantity + 1);
  };

  const handleCheckoutChange = (event) => {
    setCheckout((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setOrderError("");
    setOrderSuccess("");

    if (!isLoggedIn) {
      navigate("/login", { replace: false });
      return;
    }

    if (!isUser) {
      navigate(getDefaultRouteForRole(role), { replace: true });
      return;
    }

    if (!cartItems.length) {
      setOrderError("Please add at least one product to your cart.");
      return;
    }

    if (!checkout.address.trim()) {
      setOrderError("Delivery address is required.");
      return;
    }

    if (!checkout.latitude || !checkout.longitude) {
      setOrderError("Please select your delivery location from the map.");
      return;
    }

    const loyaltyPointsToUse = Math.max(
      0,
      Number(checkout.loyaltyPointsToUse || 0),
    );

    setOrderLoading(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: resolveEntityId(item.product),
          quantity: Number(item.quantity),
        })),
        deliveryLocation: {
          address: checkout.address.trim(),
          latitude: Number(checkout.latitude),
          longitude: Number(checkout.longitude),
        },
        loyaltyPointsToUse,
      };

      const order = await OrderService.createOrder(payload);
      const orderId = resolveEntityId(order) || "new order";

      setCart({});
      setCheckout(EMPTY_CHECKOUT);
      setOrderSuccess(
        `Order ${orderId} placed successfully. +1 loyalty reward point has been applied.`,
      );

      try {
        const me = await AuthService.getCurrentUser();
        authStore.updateUser(me);
      } catch (refreshError) {
        console.warn(
          "Unable to refresh current user after order placement",
          refreshError,
        );
      }

      await loadProducts();
    } catch (error) {
      setOrderError(
        error?.friendlyMessage || error?.message || "Failed to place order",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden color-scheme text-[#1e293b]">
      <div className="absolute inset-0 pointer-events-none" />

      <main className="relative mx-auto grid w-full max-w-[1220px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:px-8">
        <section className="space-y-4">
          <div className="rounded-3xl border border-[#eedfc0] bg-white/90 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0f766e]">
              Shop for today
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#0f172a]">
              Pick groceries, confirm location, and place cash-on-delivery
              orders.
            </h1>
            <p className="mt-3 text-sm text-[#475569]">
              Products are visible without login. You only need to sign in when
              you are ready to place an order.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(180px,1fr)_180px_auto]">
              <input
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
                placeholder="Search product name"
                className="w-full rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#0ea5a4] focus:ring-2 focus:ring-[#ccfbf1]"
              />

              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#0ea5a4] focus:ring-2 focus:ring-[#ccfbf1]"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2 rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#334155]">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      inStock: event.target.checked,
                    }))
                  }
                />
                <span>In stock only</span>
              </label>
            </div>
          </div>

          <ErrorMessage message={state.error} />

          {state.loading ? <Loader text="Loading products..." /> : null}

          {state.loading ? null : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {state.products.map((product) => {
                const productId = resolveEntityId(product);
                const stock = normalizeStock(product);
                const inStock = stock > 0;
                const cartQuantity = Number(cart[productId]?.quantity || 0);

                return (
                  <article
                    key={productId}
                    className="rounded-2xl border border-[#eadfc7] bg-white p-4 shadow-[0_15px_35px_rgba(2,6,23,0.06)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl border border-[#ece6da] bg-[#fffbf4]">
                      <img
                        src={
                          product?.imageUrl ||
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                        }
                        alt={product?.name || "Product"}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-3 mt-3">
                      <div>
                        <h3 className="text-base font-semibold text-[#0f172a]">
                          {product?.name || "Unnamed product"}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-wide text-[#64748b]">
                          {product?.category || "General"}
                        </p>
                      </div>
                      <StatusPill
                        status={inStock ? "IN_STOCK" : "OUT_OF_STOCK"}
                      />
                    </div>

                    <p className="mt-3 min-h-[42px] text-sm text-[#475569]">
                      {product?.description || "No description"}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-semibold text-[#0f766e]">
                        {formatMoney(product?.price)}
                      </p>
                      <p className="text-xs text-[#475569]">Stock: {stock}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        disabled={!inStock || cartQuantity <= 0}
                        onClick={() =>
                          handleCartQuantityChange(product, cartQuantity - 1)
                        }
                        className="rounded-full border border-[#d8ccb2] px-3 py-1 text-xs font-semibold text-[#334155] disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[#0f172a]">
                        {cartQuantity}
                      </span>
                      <button
                        type="button"
                        disabled={!inStock || cartQuantity >= stock}
                        onClick={() => handleAddToCart(product)}
                        className="rounded-full border border-[#d8ccb2] px-3 py-1 text-xs font-semibold text-[#334155] disabled:opacity-40"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        disabled={!inStock}
                        onClick={() => handleAddToCart(product)}
                        className="ml-auto rounded-full bg-[#0ea5a4] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0b8e8d] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <section className="rounded-3xl border border-[#e4d6b8] bg-white p-5 shadow-[0_20px_50px_rgba(2,6,23,0.08)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0f172a]">Cart</h2>
              <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
                {cartItemCount} item(s)
              </span>
            </div>

            {cartItems.length ? (
              <div className="mt-4 space-y-3">
                {cartItems.map((item) => {
                  const id = resolveEntityId(item.product);

                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-[#e8dcc2] bg-[#fffaf0] p-3"
                    >
                      <p className="text-sm font-semibold text-[#0f172a]">
                        {item.product.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs text-[#64748b]">
                        <span>{formatMoney(item.product.price)} each</span>
                        <span>x {item.quantity}</span>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between border-t border-[#ecdcb8] pt-3">
                  <span className="text-sm text-[#334155]">Subtotal</span>
                  <span className="text-lg font-semibold text-[#0f172a]">
                    {formatMoney(cartSubtotal)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#64748b]">
                Your cart is empty. Add products from the catalog.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-[#e4d6b8] bg-white p-5 shadow-[0_20px_50px_rgba(2,6,23,0.08)]">
            <h2 className="text-xl font-semibold text-[#0f172a]">Checkout</h2>
            <p className="mt-1 text-xs text-[#64748b]">
              Payment method: Cash on Delivery
            </p>

            {isLoggedIn ? null : (
              <p className="mt-4 text-sm text-[#475569]">
                Please{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#0f766e] underline"
                >
                  login
                </Link>{" "}
                before placing your order.
              </p>
            )}

            {isLoggedIn && !isUser ? (
              <p className="mt-4 text-sm text-[#475569]">
                This storefront checkout is for USER accounts. Continue at your
                portal:{" "}
                <button
                  type="button"
                  className="font-semibold text-[#0f766e] underline"
                  onClick={() => navigate(getDefaultRouteForRole(role))}
                >
                  {getDefaultRouteForRole(role)}
                </button>
              </p>
            ) : null}

            <form className="mt-4 space-y-3" onSubmit={handlePlaceOrder}>
              <textarea
                name="address"
                rows={3}
                placeholder="Delivery address"
                value={checkout.address}
                onChange={handleCheckoutChange}
                className="w-full rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#0ea5a4] focus:ring-2 focus:ring-[#ccfbf1]"
              />

              <LocationPickerMap
                latitude={checkout.latitude}
                longitude={checkout.longitude}
                onChange={({ latitude, longitude }) =>
                  setCheckout((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                  }))
                }
              />

              <div className="grid gap-2 md:grid-cols-2">
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  value={checkout.latitude}
                  onChange={handleCheckoutChange}
                  placeholder="Latitude"
                  className="w-full rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#0ea5a4] focus:ring-2 focus:ring-[#ccfbf1]"
                />
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  value={checkout.longitude}
                  onChange={handleCheckoutChange}
                  placeholder="Longitude"
                  className="w-full rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#0ea5a4] focus:ring-2 focus:ring-[#ccfbf1]"
                />
              </div>

              <input
                name="loyaltyPointsToUse"
                type="number"
                min="0"
                value={checkout.loyaltyPointsToUse}
                onChange={handleCheckoutChange}
                placeholder="Loyalty points to use"
                className="w-full rounded-2xl border border-[#d8ccb2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#0ea5a4] focus:ring-2 focus:ring-[#ccfbf1]"
              />

              <ErrorMessage message={orderError} />
              {orderSuccess ? (
                <div className="rounded-xl border border-[#b7e4c7] bg-[#ebfff1] px-3 py-2 text-sm text-[#166534]">
                  {orderSuccess}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={orderLoading || !cartItems.length || !isUser}
                className="w-full rounded-full bg-[#ea580c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c2410c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {orderLoading
                  ? "Placing order..."
                  : "Place Cash-on-Delivery Order"}
              </button>
            </form>
          </section>
        </aside>
      </main>
    </div>
  );
}
