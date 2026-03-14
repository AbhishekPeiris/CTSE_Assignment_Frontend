import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import Input from "../../../components/ui/Input";
import CataLogHeader from "./order_create/CataLogHeader";
import FilterInputs from "./order_create/FilterInputs";
import ProductCardsInCatalog from "./order_create/ProductCardsInCatalog";
import OrderSummary from "./order_create/OrderSummary";
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
                        <CataLogHeader filteredCount={filteredProducts.length} totalCount={catalogState.items.length} />
                        {/* Filter Inputs */}
                        <FilterInputs
                            filters={filters}
                            categories={categories}
                            onChange={handleFilterChange}
                        />

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
                            <ProductCardsInCatalog
                                products={filteredProducts}
                                addProductToCart={addProductToCart}
                                getProductCategory={getProductCategory}
                                getProductName={getProductName}
                                getProductDescription={getProductDescription}
                                getProductStock={getProductStock}
                                statusClasses={statusClasses}
                                normalizeStatus={normalizeStatus}
                                formatMoney={formatMoney}
                                resolveEntityId={resolveEntityId}
                            />
                        ) : null}
                    </section>

                    <OrderSummary
                        cartSummary={cartSummary}
                        cartItems={cartItems}
                        formatMoney={formatMoney}
                        removeCartItem={removeCartItem}
                        updateCartQuantity={updateCartQuantity}
                        customerDetails={customerDetails}
                        handleCustomerChange={handleCustomerChange}
                        customPayload={customPayload}
                        setCustomPayload={setCustomPayload}
                        handleCreateOrder={handleCreateOrder}
                        clearOrderDesk={clearOrderDesk}
                        createLoading={createLoading}
                    />
                </div>
            </div>
        </div>
    );
}

CreateOrder.propTypes = {
    onOrderCreated: PropTypes.func.isRequired,
};
