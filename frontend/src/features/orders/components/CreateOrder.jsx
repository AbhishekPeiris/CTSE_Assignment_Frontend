import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import Input from "../../../components/ui/Input";
import { ProductService } from "../../../services/product.service";
import {
  asCollection,
  formatMoney,
  normalizeStatus,
  parseJsonInput,
  resolveEntityId,
  statusClasses,
} from "../../../utils/helpers";

const getProductCategory = (product) =>
  product?.category || product?.type || product?.department || "General";

const getProductStock = (product) => {
  const stock =
    product?.stock ?? product?.quantity ?? product?.availableQuantity ?? 0;
  const numericStock = Number(stock);
  return Number.isFinite(numericStock) ? numericStock : 0;
};

const getProductName = (product) =>
  product?.name || product?.title || "Unnamed Product";

const getProductDescription = (product) =>
  product?.description || "No description available.";

export default function CreateOrder({ onOrderCreated }) {
  const [catalogState, setCatalogState] = useState({
    loading: true,
    error: "",
    items: [],
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "ALL",
    availability: "ALL",
  });
  const [cartItems, setCartItems] = useState([]);
  const [customPayload, setCustomPayload] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    contactNumber: "",
    orderNote: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setCatalogState((prev) => ({ ...prev, loading: true, error: "" }));

      try {
        const response = await ProductService.getAllProducts();
        setCatalogState({
          loading: false,
          error: "",
          items: asCollection(response, ["products"]),
        });
      } catch (error) {
        setCatalogState({
          loading: false,
          error:
            error?.friendlyMessage ||
            error?.message ||
            "Failed to load products",
          items: [],
        });
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = catalogState.items
      .map((product) => getProductCategory(product))
      .filter(Boolean);

    return ["ALL", ...new Set(values)];
  }, [catalogState.items]);

  const filteredProducts = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return catalogState.items.filter((product) => {
      const status = normalizeStatus(
        product?.status || "AVAILABLE",
      ).toUpperCase();
      const category = getProductCategory(product);
      const stock = getProductStock(product);
      const haystack = [
        getProductName(product),
        getProductDescription(product),
        category,
        resolveEntityId(product),
      ]
        .join(" ")
        .toLowerCase();

      if (searchTerm && !haystack.includes(searchTerm)) {
        return false;
      }

      if (filters.category !== "ALL" && category !== filters.category) {
        return false;
      }

      if (filters.availability === "IN_STOCK" && stock <= 0) {
        return false;
      }

      if (filters.availability === "AVAILABLE_ONLY" && status !== "AVAILABLE") {
        return false;
      }

      return true;
    });
  }, [catalogState.items, filters]);

  const cartSummary = useMemo(() => {
    return cartItems.reduce(
      (summary, item) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        return {
          itemCount: summary.itemCount + 1,
          units: summary.units + quantity,
          subtotal: summary.subtotal + quantity * price,
        };
      },
      {
        itemCount: 0,
        units: 0,
        subtotal: 0,
      },
    );
  }, [cartItems]);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCustomerChange = (event) => {
    setCustomerDetails((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const addProductToCart = (product) => {
    const productId = resolveEntityId(product);

    if (!productId) {
      return;
    }

    setSuccessMessage("");
    setActionError("");
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);

      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId,
          name: getProductName(product),
          price: Number(product?.price || 0),
          stock: getProductStock(product),
          status: normalizeStatus(product?.status || "AVAILABLE"),
          category: getProductCategory(product),
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (productId, nextQuantity) => {
    const quantity = Math.max(1, Number(nextQuantity || 1));

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  };

  const removeCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearOrderDesk = () => {
    setCartItems([]);
    setCustomerDetails({
      customerName: "",
      contactNumber: "",
      orderNote: "",
    });
    setCustomPayload("");
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setActionError("");
    setSuccessMessage("");

    if (cartItems.length === 0) {
      setActionError("Select at least one product before creating the order.");
      return;
    }

    setCreateLoading(true);

    try {
      const parsedPayload = parseJsonInput(customPayload);
      const basePayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity || 1),
        })),
      };

      const trimmedName = customerDetails.customerName.trim();
      const trimmedContact = customerDetails.contactNumber.trim();
      const trimmedNote = customerDetails.orderNote.trim();

      const payload = parsedPayload
        ? {
            ...basePayload,
            ...parsedPayload,
            items: parsedPayload.items || basePayload.items,
          }
        : {
            ...basePayload,
            ...(trimmedName ? { customerName: trimmedName } : {}),
            ...(trimmedContact ? { contactNumber: trimmedContact } : {}),
            ...(trimmedNote ? { note: trimmedNote } : {}),
          };

      await onOrderCreated(payload);
      clearOrderDesk();
      setSuccessMessage("Order created successfully.");
    } catch (error) {
      setActionError(
        error?.friendlyMessage || error?.message || "Failed to create order",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="overflow-hidden rounded-[28px] border border-line bg-[linear-gradient(135deg,_#0a6cdf_0%,_#39a833_38%,_#f3c90d_38%,_#fc3613_100%)]">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_0.95fr] lg:p-6">
          <section className="rounded-[24px] bg-white p-4 backdrop-blur lg:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3c7a5e]">
                    Sales Catalog
                  </p>
                  <h3 className="mt-2 text-3xl text-label">Market Counter</h3>
                  <p className="mt-2 max-w-2xl text-sm text-[#54645d]">
                    Search the full product catalog, filter inventory fast, and
                    tap products into the order panel like a checkout workspace.
                  </p>
                </div>
                <div className="min-w-[200px] rounded-2xl border border-[#dce7d2] bg-white/85 px-4 py-3 text-sm text-[#28473a] shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#7a8b83]">
                    Visible SKUs
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#163126]">
                    {filteredProducts.length}
                  </p>
                  <p className="mt-1 text-xs text-[#6b7a73]">
                    Filtered from {catalogState.items.length} total products
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[1.5fr_repeat(2,minmax(0,0.75fr))]">
              <Input
                label="Search products"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Find by name, ID, description or category"
                inputClassName="rounded-2xl border-[#dce7d2] bg-white/90 px-4 py-3"
              />

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-[#2d3b35]"
                  htmlFor="order-category-filter"
                >
                  Category
                </label>
                <select
                  id="order-category-filter"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-[#dce7d2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#2f7d5c] focus:ring-2 focus:ring-[#d8eadf]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "ALL" ? "All categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-[#2d3b35]"
                  htmlFor="order-availability-filter"
                >
                  Availability
                </label>
                <select
                  id="order-availability-filter"
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-[#dce7d2] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#2f7d5c] focus:ring-2 focus:ring-[#d8eadf]"
                >
                  <option value="ALL">All products</option>
                  <option value="AVAILABLE_ONLY">Available only</option>
                  <option value="IN_STOCK">In stock only</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <ErrorMessage message={catalogState.error} />
              <ErrorMessage message={actionError} />
              {successMessage ? (
                <div className="rounded-2xl border border-[#cce5d5] bg-[#effaf2] px-4 py-3 text-sm text-[#146c2e]">
                  {successMessage}
                </div>
              ) : null}
            </div>

            {catalogState.loading ? (
              <div className="mt-8">
                <Loader text="Loading product catalog..." />
              </div>
            ) : null}

            {!catalogState.loading && filteredProducts.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#d5ddd7] bg-white/70 px-6 py-10 text-center text-sm text-[#66756d]">
                No products matched the current filters.
              </div>
            ) : null}

            {!catalogState.loading && filteredProducts.length > 0 ? (
              <div className="grid gap-3 mt-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredProducts.map((product, index) => {
                  const productId =
                    resolveEntityId(product) || `product-${index}`;
                  const stock = getProductStock(product);
                  const isOutOfStock = stock <= 0;
                  const status = normalizeStatus(
                    product?.status ||
                      (isOutOfStock ? "OUT OF STOCK" : "AVAILABLE"),
                  );

                  return (
                    <article
                      key={productId}
                      className="group rounded-[24px] border border-[#dde6df] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9d1c4] hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8d84]">
                            {getProductCategory(product)}
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-[#16231d]">
                            {getProductName(product)}
                          </h4>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClasses(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-3 min-h-[44px] text-sm leading-6 text-[#5c6a63]">
                        {getProductDescription(product)}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f6f3ea] p-3 text-sm text-[#30433b]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#7a8b83]">
                            Price
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#163126]">
                            {formatMoney(product?.price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#7a8b83]">
                            Stock
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#163126]">
                            {stock}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-4">
                        <p className="truncate text-xs text-[#708078]">
                          SKU: {productId}
                        </p>
                        <Button
                          onClick={() => addProductToCart(product)}
                          disabled={isOutOfStock}
                          className="rounded-2xl bg-[#215c45] px-4 py-2 text-white shadow-none hover:bg-[#194734]"
                        >
                          {isOutOfStock ? "Out of stock" : "Add to order"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>

          <aside className="rounded-[24px] bg-[#1a3227] p-4 text-white lg:p-5">
            <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9d8cf]">
                Active Ticket
              </p>
              <div className="grid gap-3 mt-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="px-4 py-3 rounded-2xl bg-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#bdd0c4]">
                    Lines
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {cartSummary.itemCount}
                  </p>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#bdd0c4]">
                    Units
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {cartSummary.units}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f3c96b] px-4 py-3 text-[#2d2413]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6b5221]">
                    Subtotal
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatMoney(cartSummary.subtotal)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Admin Order Desk</h3>
                    <p className="mt-1 text-sm text-[#c6d3cb]">
                      Build the customer order, review each selected item, then
                      submit.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearOrderDesk}
                    className="px-4 py-2 text-white border rounded-2xl border-white/15 hover:bg-white/10"
                  >
                    Clear
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[#cad7d0]">
                      No products selected yet. Add products from the catalog to
                      start the order.
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="rounded-2xl border border-white/10 bg-[#223d31] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#a7beb1]">
                              {item.category}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.productId)}
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ffb4b4] transition hover:text-white"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#cbd7d1]">
                            {item.status}
                          </div>
                          <div className="flex items-center gap-2 p-1 border rounded-full border-white/10 bg-white/5">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              }
                              className="w-8 h-8 text-lg text-white transition rounded-full hover:bg-white/10"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateCartQuantity(
                                  item.productId,
                                  event.target.value,
                                )
                              }
                              className="w-16 text-sm font-semibold text-center text-white bg-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                              className="w-8 h-8 text-lg text-white transition rounded-full hover:bg-white/10"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm text-[#c6d3cb]">
                          <span>{formatMoney(item.price)} each</span>
                          <span className="font-semibold text-white">
                            {formatMoney(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4e0d9]">
                  Customer Context
                </h4>
                <div className="grid gap-3 mt-4">
                  <Input
                    label="Customer name"
                    name="customerName"
                    value={customerDetails.customerName}
                    onChange={handleCustomerChange}
                    placeholder="Order label for staff"
                    inputClassName="rounded-2xl border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-[#9db2a6]"
                    className="[&>label]:text-[#dce7e0]"
                  />
                  <Input
                    label="Contact number"
                    name="contactNumber"
                    value={customerDetails.contactNumber}
                    onChange={handleCustomerChange}
                    placeholder="Optional contact"
                    inputClassName="rounded-2xl border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-[#9db2a6]"
                    className="[&>label]:text-[#dce7e0]"
                  />
                  <div>
                    <label
                      htmlFor="order-note"
                      className="mb-1 block text-sm font-medium text-[#dce7e0]"
                    >
                      Order note
                    </label>
                    <textarea
                      id="order-note"
                      name="orderNote"
                      rows={3}
                      value={customerDetails.orderNote}
                      onChange={handleCustomerChange}
                      placeholder="Packing notes, pickup instructions, customer purpose"
                      className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9db2a6] focus:border-[#86bf9f] focus:ring-2 focus:ring-[#284d3c]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4e0d9]">
                  Advanced Payload
                </h4>
                <p className="mt-2 text-sm text-[#c6d3cb]">
                  Optional. Add extra API fields as JSON. If you provide
                  `items`, that custom list will be used.
                </p>
                <textarea
                  id="order-custom-payload"
                  name="customPayload"
                  rows={4}
                  value={customPayload}
                  onChange={(event) => setCustomPayload(event.target.value)}
                  placeholder='{"customerId":"...", "priority":"HIGH"}'
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9db2a6] focus:border-[#86bf9f] focus:ring-2 focus:ring-[#284d3c]"
                />
              </div>

              <Button
                type="submit"
                disabled={createLoading || cartItems.length === 0}
                className="w-full rounded-2xl bg-[#f3c96b] px-5 py-3 text-sm font-semibold text-[#2d2413] shadow-none hover:bg-[#e7bb59]"
              >
                {createLoading ? "Creating order..." : "Create customer order"}
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}

CreateOrder.propTypes = {
  onOrderCreated: PropTypes.func.isRequired,
};
