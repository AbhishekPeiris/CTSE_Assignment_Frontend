import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import CataLogHeader from "./order_create/CataLogHeader";
import FilterInputs from "./order_create/FilterInputs";
import ProductCardsInCatalog from "./order_create/ProductCardsInCatalog";
import OrderSummary from "./order_create/OrderSummary";
import { AuthService } from "../../../services/auth.service";
import { ProductService } from "../../../services/product.service";
import {
    asCollection,
    asEntity,
    formatMoney,
    normalizeStatus,
    parseJsonInput,
    resolveEntityId,
    resolveRole,
    statusClasses,
} from "../../../utils/helpers";

const CUSTOMER_ROLE_OPTIONS = ["USER", "ADMIN", "DELIVERY"];

const LOYALTY_DISCOUNT_BY_ROLE = {
    USER: 1,
    DELIVERY: 3,
    ADMIN: 5,
};

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

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const getCustomerName = (user) =>
    user?.name ||
    user?.fullName ||
    user?.customerName ||
    user?.username ||
    user?.user?.name ||
    "Unnamed customer";

const getCustomerPhone = (user) =>
    user?.phoneNumber ||
    user?.contactNumber ||
    user?.phone ||
    user?.mobile ||
    user?.user?.phoneNumber ||
    "";

const getCustomerEmail = (user) =>
    user?.email || user?.user?.email || user?.contact?.email || "";

const toFiniteNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};

const getCustomerPoints = (user) => {
    const candidates = [
        user?.points,
        user?.loyaltyPoints,
        user?.rewardPoints,
        user?.collectedPoints,
        user?.loyalty?.points,
        user?.loyalty?.balance,
        user?.loyaltyCard?.points,
        user?.wallet?.points,
    ];

    for (const candidate of candidates) {
        const numeric = toFiniteNumber(candidate);

        if (numeric !== null) {
            return Math.max(0, numeric);
        }
    }

    return 0;
};

const mapCustomer = (user) => ({
    id: resolveEntityId(user),
    name: getCustomerName(user),
    phone: getCustomerPhone(user),
    email: getCustomerEmail(user),
    role: resolveRole(user) || "USER",
    points: getCustomerPoints(user),
    raw: user,
});

const buildGeneratedEmail = (name, phone) => {
    const safeName = String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "") || "customer";
    const safePhone = normalizePhone(phone).slice(-6) || Date.now().toString().slice(-6);

    return `${safeName}.${safePhone}@loyalty.local`;
};

const buildGeneratedPassword = (phone) => {
    const safePhone = normalizePhone(phone).slice(-6) || "123456";
    return `Loyalty@${safePhone}`;
};

export default function CreateOrder({ onOrderCreated }) {
    const [catalogState, setCatalogState] = useState({
        loading: true,
        error: "",
        items: [],
    });
    const [customerDirectory, setCustomerDirectory] = useState({
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
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [loyaltyPointsInput, setLoyaltyPointsInput] = useState("");
    const [loyaltyForm, setLoyaltyForm] = useState({
        name: "",
        phone: "",
        role: "USER",
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [loyaltyCreateLoading, setLoyaltyCreateLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [loyaltyActionError, setLoyaltyActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loyaltySuccessMessage, setLoyaltySuccessMessage] = useState("");

    const loadCustomers = async () => {
        setCustomerDirectory((prev) => ({ ...prev, loading: true, error: "" }));

        try {
            const response = await AuthService.getAllUsers();
            const items = asCollection(response, ["users"]);
            setCustomerDirectory({
                loading: false,
                error: "",
                items,
            });
            return items;
        } catch (error) {
            setCustomerDirectory({
                loading: false,
                error:
                    error?.friendlyMessage ||
                    error?.message ||
                    "Failed to load registered customers",
                items: [],
            });
            return [];
        }
    };

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
        loadCustomers();
    }, []);

    const customerOptions = useMemo(
        () =>
            customerDirectory.items
                .map(mapCustomer)
                .filter((customer) => customer.id),
        [customerDirectory.items],
    );

    const selectedCustomer = useMemo(
        () =>
            customerOptions.find((customer) => customer.id === selectedCustomerId) ||
            null,
        [customerOptions, selectedCustomerId],
    );

    const filteredCustomers = useMemo(() => {
        const searchTerm = customerSearch.trim().toLowerCase();

        if (!searchTerm) {
            return customerOptions.slice(0, 8);
        }

        return customerOptions
            .filter((customer) =>
                [
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.role,
                    customer.id,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(searchTerm),
            )
            .slice(0, 8);
    }, [customerOptions, customerSearch]);

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

            if (
                filters.availability === "AVAILABLE_ONLY" &&
                status !== "AVAILABLE"
            ) {
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

    const loyaltyPreview = useMemo(() => {
        if (!selectedCustomer) {
            return {
                availablePoints: 0,
                rate: 0,
                pointsUsed: 0,
                discountPercent: 0,
                discountAmount: 0,
                total: cartSummary.subtotal,
                maxPointsByRole: 0,
            };
        }

        const rate = LOYALTY_DISCOUNT_BY_ROLE[selectedCustomer.role] || 0;
        const availablePoints = Math.max(0, Number(selectedCustomer.points || 0));
        const requestedPoints = Math.max(0, Number(loyaltyPointsInput || 0));
        const maxPointsByRole = rate > 0 ? Math.floor(100 / rate) : 0;
        const pointsUsed = Math.min(
            requestedPoints,
            availablePoints,
            maxPointsByRole || availablePoints,
        );
        const discountPercent = Math.min(pointsUsed * rate, 100);
        const discountAmount = (cartSummary.subtotal * discountPercent) / 100;
        const total = Math.max(0, cartSummary.subtotal - discountAmount);

        return {
            availablePoints,
            rate,
            pointsUsed,
            discountPercent,
            discountAmount,
            total,
            maxPointsByRole,
        };
    }, [cartSummary.subtotal, loyaltyPointsInput, selectedCustomer]);

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

    const handleLoyaltyFormChange = (event) => {
        setLoyaltyForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomerId(customer.id);
        setCustomerSearch(customer.name);
        setLoyaltyPointsInput("");
        setCustomerDetails((prev) => ({
            ...prev,
            customerName: customer.name,
            contactNumber: customer.phone,
        }));
        setLoyaltyActionError("");
        setLoyaltySuccessMessage("");
    };

    const clearSelectedCustomer = () => {
        setSelectedCustomerId("");
        setCustomerSearch("");
        setLoyaltyPointsInput("");
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
        setCustomerSearch("");
        setSelectedCustomerId("");
        setLoyaltyPointsInput("");
        setLoyaltyForm({
            name: "",
            phone: "",
            role: "USER",
        });
        setCustomPayload("");
        setLoyaltyActionError("");
        setLoyaltySuccessMessage("");
    };

    const handleCreateLoyaltyCustomer = async () => {
        const trimmedName = loyaltyForm.name.trim();
        const trimmedPhone = loyaltyForm.phone.trim();
        const normalizedNewPhone = normalizePhone(trimmedPhone);

        setLoyaltyActionError("");
        setLoyaltySuccessMessage("");

        if (!trimmedName || !trimmedPhone) {
            setLoyaltyActionError("Customer name and phone number are required.");
            return;
        }

        const existingCustomer = customerOptions.find((customer) => {
            const customerPhone = normalizePhone(customer.phone);
            return customerPhone && customerPhone === normalizedNewPhone;
        });

        if (existingCustomer) {
            handleSelectCustomer(existingCustomer);
            setLoyaltyActionError(
                "This phone number already belongs to a registered loyalty customer.",
            );
            return;
        }

        setLoyaltyCreateLoading(true);

        try {
            const generatedEmail = buildGeneratedEmail(trimmedName, trimmedPhone);
            const generatedPassword = buildGeneratedPassword(trimmedPhone);
            const response = await AuthService.register({
                name: trimmedName,
                email: generatedEmail,
                password: generatedPassword,
                role: loyaltyForm.role,
                phoneNumber: trimmedPhone,
                contactNumber: trimmedPhone,
            });
            const createdCustomer = mapCustomer(asEntity(response, ["user"]) || {});

            const refreshedCustomers = (await loadCustomers()).map(mapCustomer);
            const matchedCustomer =
                refreshedCustomers.find(
                    (customer) =>
                        normalizePhone(customer.phone) === normalizedNewPhone,
                ) || createdCustomer;

            if (matchedCustomer?.id) {
                handleSelectCustomer(matchedCustomer);
            } else if (createdCustomer.id) {
                handleSelectCustomer(createdCustomer);
            } else {
                setCustomerSearch(trimmedName);
            }

            setLoyaltyForm({
                name: "",
                phone: "",
                role: "USER",
            });
            setLoyaltySuccessMessage(
                `Loyalty customer created. Login email: ${generatedEmail} | temporary password: ${generatedPassword}`,
            );
        } catch (error) {
            setLoyaltyActionError(
                error?.friendlyMessage ||
                    error?.message ||
                    "Failed to create loyalty customer",
            );
        } finally {
            setLoyaltyCreateLoading(false);
        }
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
            const customerPayload = {
                ...(trimmedName ? { customerName: trimmedName } : {}),
                ...(trimmedContact ? { contactNumber: trimmedContact } : {}),
                ...(trimmedNote ? { note: trimmedNote } : {}),
                ...(selectedCustomer
                    ? {
                        customerId: selectedCustomer.id,
                        customerRole: selectedCustomer.role,
                        discountAmount: loyaltyPreview.discountAmount,
                        discountPercentage: loyaltyPreview.discountPercent,
                        finalAmount: loyaltyPreview.total,
                        loyalty: {
                            isRegistered: true,
                            availablePoints: loyaltyPreview.availablePoints,
                            pointsUsed: loyaltyPreview.pointsUsed,
                            discountPercentPerPoint: loyaltyPreview.rate,
                            discountPercent: loyaltyPreview.discountPercent,
                            discountAmount: loyaltyPreview.discountAmount,
                            role: selectedCustomer.role,
                        },
                    }
                    : {}),
            };

            const payload = parsedPayload
                ? {
                    ...basePayload,
                    ...customerPayload,
                    ...parsedPayload,
                    items: parsedPayload.items || basePayload.items,
                }
                : {
                    ...basePayload,
                    ...customerPayload,
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
                        <CataLogHeader
                            filteredCount={filteredProducts.length}
                            totalCount={catalogState.items.length}
                        />
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
                        customerDirectoryLoading={customerDirectory.loading}
                        customerDirectoryError={customerDirectory.error}
                        customerSearch={customerSearch}
                        setCustomerSearch={setCustomerSearch}
                        filteredCustomers={filteredCustomers}
                        selectedCustomer={selectedCustomer}
                        handleSelectCustomer={handleSelectCustomer}
                        clearSelectedCustomer={clearSelectedCustomer}
                        reloadCustomers={loadCustomers}
                        loyaltyPointsInput={loyaltyPointsInput}
                        setLoyaltyPointsInput={setLoyaltyPointsInput}
                        loyaltyPreview={loyaltyPreview}
                        loyaltyForm={loyaltyForm}
                        handleLoyaltyFormChange={handleLoyaltyFormChange}
                        handleCreateLoyaltyCustomer={handleCreateLoyaltyCustomer}
                        loyaltyCreateLoading={loyaltyCreateLoading}
                        loyaltyActionError={loyaltyActionError}
                        loyaltySuccessMessage={loyaltySuccessMessage}
                        roleOptions={CUSTOMER_ROLE_OPTIONS}
                    />
                </div>
            </div>
        </div>
    );
}

CreateOrder.propTypes = {
    onOrderCreated: PropTypes.func.isRequired,
};
