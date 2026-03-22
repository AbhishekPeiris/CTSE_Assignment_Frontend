import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import LocationPickerMap from "../../../components/layout/LocationPickerMap";
import { useAppContext } from "../../../app/providers/AppProvider";
import { AuthService } from "../../../services/auth.service";
import { OrderService } from "../../../services/order.service";
import { authStore } from "../../../app/store/authStore";
import {
  clientStore,
  getCartCount,
  getCartItems,
  getCartSubtotal,
  useClientStore,
} from "../clientStore";
import { formatMoney, resolveRole } from "../../../utils/helpers";
import { getDefaultRouteForRole } from "../../../utils/roleRouting";

const EMPTY_CHECKOUT = {
  address: "",
  latitude: "",
  longitude: "",
  loyaltyPointsToUse: "0",
};

function toOrderItem(item) {
  return {
    productId: item.product?.id,
    quantity: Number(item.quantity || 0),
  };
}

export default function CartPage() {
  const navigate = useNavigate();
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const isLoggedIn = Boolean(auth?.isAuthenticated);
  const isUser = role === "USER";
  const loyaltyBalance = Number(auth?.user?.loyaltyPoints || 0);

  const store = useClientStore();
  const cartItems = useMemo(() => getCartItems(store), [store]);
  const itemCount = useMemo(() => getCartCount(store), [store]);
  const subtotal = useMemo(() => getCartSubtotal(store), [store]);

  const [checkout, setCheckout] = useState(EMPTY_CHECKOUT);
  const [orderError, setOrderError] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  const loyaltyPointsToUse = Math.max(
    0,
    Number(checkout.loyaltyPointsToUse || 0),
  );
  const loyaltyDiscountValue = useMemo(
    () =>
      isLoggedIn && isUser ? Math.min(loyaltyBalance, loyaltyPointsToUse) : 0,
    [isLoggedIn, isUser, loyaltyBalance, loyaltyPointsToUse],
  );
  const estimatedTotal = useMemo(
    () => Math.max(0, subtotal - loyaltyDiscountValue),
    [subtotal, loyaltyDiscountValue],
  );

  const handleQuantity = (item, nextQuantity) => {
    const normalized = Math.max(0, Number(nextQuantity || 0));
    clientStore.setItem(item.product, normalized);
  };

  const handleCheckoutField = (event) => {
    setCheckout((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLocationChange = ({ latitude, longitude, locationName }) => {
    setCheckout((prev) => ({
      ...prev,
      latitude,
      longitude,
      address:
        typeof locationName === "string" && locationName.trim()
          ? locationName
          : prev.address,
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
      setOrderError("Your cart is empty.");
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

    setOrderLoading(true);

    try {
      await OrderService.createOrder({
        items: cartItems.map(toOrderItem),
        deliveryLocation: {
          address: checkout.address.trim(),
          latitude: Number(checkout.latitude),
          longitude: Number(checkout.longitude),
        },
        loyaltyPointsToUse,
      });

      clientStore.clearCart();
      setCheckout(EMPTY_CHECKOUT);
      setOrderSuccess("Order placed successfully.");

      try {
        const me = await AuthService.getCurrentUser();
        authStore.updateUser(me);
      } catch (refreshError) {
        console.warn(
          "Unable to refresh user after order placement",
          refreshError,
        );
      }

      navigate("/my-orders");
    } catch (error) {
      setOrderError(
        error?.friendlyMessage || error?.message || "Failed to place order",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="p-5 bg-white border shadow-sm rounded-3xl border-line">
        <h1 className="text-2xl font-semibold text-label">Cart</h1>
        <p className="mt-1 text-sm text-word">
          Review items, set location, and checkout.
        </p>
      </div>

      <ErrorMessage message={orderError} />
      <ErrorMessage
        message={
          orderSuccess ? { message: orderSuccess, severity: "success" } : ""
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <section className="p-4 space-y-3 bg-white border rounded-3xl border-line sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-label">
              Selected items
            </h2>
            <span className="rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-semibold text-primary">
              {itemCount} item(s)
            </span>
          </div>

          {cartItems.length ? (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product?.id}
                  className="p-3 bg-white border rounded-2xl border-line"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 overflow-hidden bg-white rounded-xl ">
                      <img
                        src={
                          item.product?.imageUrl ||
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={item.product?.name || "Product"}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-label">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-word">
                        {formatMoney(item.product?.price)} each
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantity(item, item.quantity - 1)
                          }
                          className="px-2.5 py-1 text-xs font-semibold border rounded-full border-line"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold text-center min-w-8">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantity(item, item.quantity + 1)
                          }
                          className="px-2.5 py-1 text-xs font-semibold border rounded-full border-line"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => clientStore.removeItem(item.product?.id)}
                      className="text-xs font-semibold text-[#b3261e]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-sm bg-white border border-dashed rounded-2xl border-line text-word">
              No items in cart.{" "}
              <Link to="/" className="font-semibold text-word">
                Go to products
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="p-4 bg-white border shadow-sm rounded-3xl border-line sm:p-5">
            <h2 className="text-lg font-semibold text-label">
              Order summary
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-word">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>

              {isLoggedIn && isUser ? (
                <>
                  <div className="flex items-center justify-between text-word">
                    <span>Loyalty discount</span>
                    <span>- {formatMoney(loyaltyDiscountValue)}</span>
                  </div>
                  <div className="px-3 py-2 text-xs bg-white border rounded-xl border-line text-success">
                    Loyalty available: {loyaltyBalance} points
                  </div>
                </>
              ) : null}

              <div className="flex items-center justify-between pt-2 text-base font-semibold border-t border-line text-label">
                <span>Estimated total</span>
                <span>{formatMoney(estimatedTotal)}</span>
              </div>
            </div>
          </section>

          <section className="p-4 bg-white border shadow-sm rounded-3xl border-line sm:p-5">
            <h2 className="text-lg font-semibold text-label">Checkout</h2>
            {isLoggedIn ? null : (
              <p className="mt-2 text-sm text-word">
                Please{" "}
                <Link to="/login" className="font-semibold text-word">
                  login
                </Link>{" "}
                to place an order.
              </p>
            )}

            <form className="mt-3 space-y-3" onSubmit={handlePlaceOrder}>
              <textarea
                name="address"
                rows={3}
                value={checkout.address}
                onChange={handleCheckoutField}
                placeholder="Delivery address"
                className="w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
              />

              <LocationPickerMap
                latitude={checkout.latitude}
                longitude={checkout.longitude}
                onChange={handleLocationChange}
              />

              {/* <p className="px-3 py-2 text-xs bg-white border rounded-xl border-line text-word">
                Selected coordinates: {checkout.latitude || "-"},{" "}
                {checkout.longitude || "-"}
              </p> */}

              {isLoggedIn && isUser ? (
                <div className="p-3 space-y-2 bg-white border rounded-2xl border-line">
                  <label
                    htmlFor="cartLoyaltyPoints"
                    className="block text-xs font-semibold tracking-wide uppercase text-word"
                  >
                    Loyalty points to use
                  </label>
                  <input
                    id="cartLoyaltyPoints"
                    name="loyaltyPointsToUse"
                    type="number"
                    min="0"
                    value={checkout.loyaltyPointsToUse}
                    onChange={handleCheckoutField}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={
                  orderLoading || !isLoggedIn || !isUser || !cartItems.length
                }
                className="w-full rounded-full bg-[#1a73e8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {orderLoading ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
