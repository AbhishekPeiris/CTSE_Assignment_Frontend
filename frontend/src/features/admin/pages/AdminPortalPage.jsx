import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { AuthService } from "../../../services/auth.service";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";
import { DeliveryService } from "../../../services/delivery.service";
import {
    asCollection,
    formatDate,
    formatMoney,
    resolveEntityId,
    resolveRole,
} from "../../../utils/helpers";
import {
    DELIVERY_STATUS_OPTIONS,
    DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE,
} from "../../../utils/constants";
import LocationPickerMap from "../../client/components/LocationPickerMap";

const ORDER_STATUS_OPTIONS_ADMIN = [
    "ASSIGNED",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED_BY_ADMIN",
    "CANCELLED_BY_DELIVERY",
];

const INITIAL_PRODUCT_FORM = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
};

const INITIAL_ORDER_FORM = {
    customerContactNumber: "",
    customerName: "",
    loyaltyPointsToUse: "0",
    deliveryAddress: "",
    latitude: "",
    longitude: "",
    selectedProductId: "",
    selectedQuantity: "1",
    items: [],
};

const INITIAL_ASSIGN_FORM = {
    orderId: "",
    deliveryUserId: "",
    notes: "",
};

const INITIAL_ROLE_FORM = {
    USER: { name: "", contactNumber: "", password: "" },
    ADMIN: { name: "", contactNumber: "", password: "" },
    DELIVERY: { name: "", contactNumber: "", password: "" },
};

function normalizeUsersResponse(response) {
    return asCollection(response, ["users"]);
}

function normalizeRole(role) {
    return String(role || "").toUpperCase();
}

function ManagementSection({ title, description, children }) {
    return (
        <section className="rounded-2xl border border-[#e0e7f5] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-[#0f172a]">{title}</h2>
            <p className="mt-1 text-sm text-[#64748b]">{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export default function AdminPortalPage() {
    const navigate = useNavigate();
    const { auth, logout } = useAppContext();

    const [activeTab, setActiveTab] = useState("dashboard");

    const [loadingAll, setLoadingAll] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoading, setActionLoading] = useState("");

    const [usersByRole, setUsersByRole] = useState({ USER: [], ADMIN: [], DELIVERY: [] });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [deliveries, setDeliveries] = useState([]);

    const [roleForms, setRoleForms] = useState(INITIAL_ROLE_FORM);
    const [lookupCustomerForm, setLookupCustomerForm] = useState({ contactNumber: "", name: "" });
    const [lookupCustomerResult, setLookupCustomerResult] = useState(null);
    const [loyaltyDrafts, setLoyaltyDrafts] = useState({});

    const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
    const [editingProduct, setEditingProduct] = useState(null);

    const [orderForm, setOrderForm] = useState(INITIAL_ORDER_FORM);
    const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
    const [orderAssignmentDrafts, setOrderAssignmentDrafts] = useState({});

    const [deliveryAssignForm, setDeliveryAssignForm] = useState(INITIAL_ASSIGN_FORM);
    const [deliveryStatusDrafts, setDeliveryStatusDrafts] = useState({});

    const deliveryUsers = usersByRole.DELIVERY;

    const loadUsers = useCallback(async () => {
        const [users, admins, deliveries] = await Promise.all([
            AuthService.getUsers({ role: "USER" }),
            AuthService.getUsers({ role: "ADMIN" }),
            AuthService.getUsers({ role: "DELIVERY" }),
        ]);

        setUsersByRole({
            USER: normalizeUsersResponse(users),
            ADMIN: normalizeUsersResponse(admins),
            DELIVERY: normalizeUsersResponse(deliveries),
        });
    }, []);

    const loadProducts = useCallback(async () => {
        const response = await ProductService.getAllProducts();
        setProducts(asCollection(response, ["products"]));
    }, []);

    const loadOrders = useCallback(async () => {
        const response = await OrderService.getAllOrders();
        const normalized = asCollection(response, ["orders"]).sort((left, right) => {
            const leftTime = new Date(left?.createdAt || 0).getTime();
            const rightTime = new Date(right?.createdAt || 0).getTime();
            return rightTime - leftTime;
        });

        setOrders(normalized);
    }, []);

    const loadDeliveries = useCallback(async () => {
        const response = await DeliveryService.getDeliveries();
        setDeliveries(asCollection(response, ["deliveries"]));
    }, []);

    const reloadAll = useCallback(async () => {
        setLoadingAll(true);
        setError("");

        try {
            await Promise.all([loadUsers(), loadProducts(), loadOrders(), loadDeliveries()]);
        } catch (requestError) {
            setError(requestError?.friendlyMessage || requestError?.message || "Failed to load admin portal data");
        } finally {
            setLoadingAll(false);
        }
    }, [loadDeliveries, loadOrders, loadProducts, loadUsers]);

    useEffect(() => {
        reloadAll();
    }, [reloadAll]);

    const metrics = useMemo(() => {
        const pendingOrders = orders.filter((order) => normalizeRole(order?.status) === "PENDING").length;
        const inProgressDeliveries = deliveries.filter((delivery) =>
            ["ASSIGNED", "OUT_FOR_DELIVERY"].includes(normalizeRole(delivery?.status)),
        ).length;

        return {
            customers: usersByRole.USER.length,
            admins: usersByRole.ADMIN.length,
            deliveryUsers: usersByRole.DELIVERY.length,
            products: products.length,
            orders: orders.length,
            pendingOrders,
            deliveries: deliveries.length,
            inProgressDeliveries,
        };
    }, [deliveries, orders, products.length, usersByRole.ADMIN.length, usersByRole.DELIVERY.length, usersByRole.USER.length]);

    const resetMessages = () => {
        setError("");
        setSuccess("");
    };

    const runAction = async (loadingKey, handler, successMessage) => {
        resetMessages();
        setActionLoading(loadingKey);

        try {
            await handler();
            if (successMessage) {
                setSuccess(successMessage);
            }
        } catch (actionError) {
            setError(actionError?.friendlyMessage || actionError?.message || "Action failed");
        } finally {
            setActionLoading("");
        }
    };

    const handleRoleFormChange = (role, field, value) => {
        setRoleForms((prev) => ({
            ...prev,
            [role]: {
                ...prev[role],
                [field]: value,
            },
        }));
    };

    const handleCreateRoleUser = async (role) => {
        const form = roleForms[role];

        if (!form.name.trim() || !form.contactNumber.trim()) {
            setError("Name and contact number are required.");
            return;
        }

        await runAction(
            `create-user:${role}`,
            async () => {
                await AuthService.createManagedUser({
                    name: form.name.trim(),
                    contactNumber: form.contactNumber.trim(),
                    password: form.password.trim() || form.contactNumber.trim(),
                    role,
                });

                setRoleForms((prev) => ({
                    ...prev,
                    [role]: { name: "", contactNumber: "", password: "" },
                }));

                await loadUsers();
            },
            `${role} account created successfully.`,
        );
    };

    const handleLookupOrCreateCustomer = async () => {
        if (!lookupCustomerForm.contactNumber.trim()) {
            setError("Customer contact number is required.");
            return;
        }

        await runAction(
            "lookup-customer",
            async () => {
                const response = await AuthService.lookupOrCreateCustomer({
                    contactNumber: lookupCustomerForm.contactNumber.trim(),
                    name: lookupCustomerForm.name.trim() || undefined,
                });

                setLookupCustomerResult(response?.user || response);
                await loadUsers();
            },
            "Customer lookup/create completed.",
        );
    };

    const handleAdjustLoyalty = async (user) => {
        const userId = resolveEntityId(user);
        const draft = loyaltyDrafts[userId] || { operation: "ADD", points: "1", reason: "" };

        await runAction(
            `loyalty:${userId}`,
            async () => {
                await AuthService.adjustUserLoyalty(userId, {
                    operation: draft.operation,
                    points: Number(draft.points || 0),
                    reason: draft.reason || undefined,
                });

                await loadUsers();
            },
            "Loyalty points updated.",
        );
    };

    const handleProductCreate = async () => {
        if (!productForm.name.trim() || !productForm.description.trim()) {
            setError("Product name and description are required.");
            return;
        }

        await runAction(
            "create-product",
            async () => {
                await ProductService.createProduct({
                    name: productForm.name.trim(),
                    description: productForm.description.trim(),
                    price: Number(productForm.price || 0),
                    stock: Number(productForm.stock || 0),
                    category: productForm.category.trim(),
                    imageUrl: productForm.imageUrl.trim() || undefined,
                });

                setProductForm(INITIAL_PRODUCT_FORM);
                await loadProducts();
            },
            "Product created.",
        );
    };

    const handleProductUpdate = async () => {
        if (!editingProduct) {
            return;
        }

        const productId = resolveEntityId(editingProduct);

        await runAction(
            `update-product:${productId}`,
            async () => {
                await ProductService.updateProduct(productId, {
                    name: editingProduct.name,
                    description: editingProduct.description,
                    price: Number(editingProduct.price),
                    stock: Number(editingProduct.stock),
                    category: editingProduct.category,
                    imageUrl: editingProduct.imageUrl || undefined,
                });

                setEditingProduct(null);
                await loadProducts();
            },
            "Product updated.",
        );
    };

    const handleProductDelete = async (productId) => {
        await runAction(
            `delete-product:${productId}`,
            async () => {
                await ProductService.deleteProduct(productId);
                await loadProducts();
            },
            "Product deleted.",
        );
    };

    const selectedProductForOrder = useMemo(() => {
        return products.find((product) => resolveEntityId(product) === orderForm.selectedProductId) || null;
    }, [orderForm.selectedProductId, products]);

    const handleAddItemToOrderDraft = () => {
        if (!selectedProductForOrder) {
            setError("Select a product before adding items.");
            return;
        }

        const quantity = Math.max(1, Number(orderForm.selectedQuantity || 1));
        const stock = Number(selectedProductForOrder.stock || 0);

        if (quantity > stock) {
            setError("Requested quantity exceeds current stock.");
            return;
        }

        setOrderForm((prev) => {
            const existingIndex = prev.items.findIndex((item) => item.productId === prev.selectedProductId);

            if (existingIndex >= 0) {
                const nextItems = [...prev.items];
                nextItems[existingIndex] = {
                    ...nextItems[existingIndex],
                    quantity: Math.min(stock, Number(nextItems[existingIndex].quantity || 0) + quantity),
                };

                return {
                    ...prev,
                    items: nextItems,
                    selectedQuantity: "1",
                };
            }

            return {
                ...prev,
                items: [
                    ...prev.items,
                    {
                        productId: prev.selectedProductId,
                        name: selectedProductForOrder.name,
                        quantity,
                        stock,
                    },
                ],
                selectedQuantity: "1",
            };
        });

        setError("");
    };

    const handleCreateOrderByAdmin = async () => {
        if (!orderForm.customerContactNumber.trim()) {
            setError("Customer contact number is required.");
            return;
        }

        if (!orderForm.items.length) {
            setError("Please add at least one item for the order.");
            return;
        }

        if (!orderForm.deliveryAddress.trim() || !orderForm.latitude || !orderForm.longitude) {
            setError("Delivery address and map location are required.");
            return;
        }

        await runAction(
            "create-admin-order",
            async () => {
                await OrderService.createOrder({
                    customerContactNumber: orderForm.customerContactNumber.trim(),
                    customerName: orderForm.customerName.trim() || undefined,
                    loyaltyPointsToUse: Math.max(0, Number(orderForm.loyaltyPointsToUse || 0)),
                    items: orderForm.items.map((item) => ({
                        productId: item.productId,
                        quantity: Number(item.quantity),
                    })),
                    deliveryLocation: {
                        address: orderForm.deliveryAddress.trim(),
                        latitude: Number(orderForm.latitude),
                        longitude: Number(orderForm.longitude),
                    },
                });

                setOrderForm(INITIAL_ORDER_FORM);
                await Promise.all([loadOrders(), loadUsers(), loadProducts()]);
            },
            "Order created for customer.",
        );
    };

    const handleAssignDeliveryToOrder = async (order) => {
        const orderId = resolveEntityId(order);
        const draft = orderAssignmentDrafts[orderId];

        if (!draft?.deliveryUserId) {
            setError("Select a delivery user before assignment.");
            return;
        }

        const deliveryUser = deliveryUsers.find((user) => resolveEntityId(user) === draft.deliveryUserId);

        await runAction(
            `assign-order:${orderId}`,
            async () => {
                await OrderService.assignDelivery(orderId, {
                    deliveryUserId: draft.deliveryUserId,
                    deliveryUserName: deliveryUser?.name,
                });

                await Promise.all([loadOrders(), loadDeliveries()]);
            },
            "Delivery assigned to order.",
        );
    };

    const handleOrderStatusUpdate = async (order) => {
        const orderId = resolveEntityId(order);
        const status = orderStatusDrafts[orderId] || "";

        if (!status) {
            setError("Select an order status before updating.");
            return;
        }

        await runAction(
            `status-order:${orderId}`,
            async () => {
                await OrderService.updateOrderStatus(orderId, { status });
                await Promise.all([loadOrders(), loadDeliveries(), loadUsers()]);
            },
            "Order status updated.",
        );
    };

    const handleCancelOrderAsAdmin = async (order) => {
        const orderId = resolveEntityId(order);
        const reason = globalThis.prompt("Cancellation reason (optional):") || "";

        await runAction(
            `cancel-order:${orderId}`,
            async () => {
                await OrderService.cancelOrder(orderId, reason);
                await Promise.all([loadOrders(), loadDeliveries(), loadUsers()]);
            },
            "Order cancelled by admin.",
        );
    };

    const handleDeleteOrder = async (orderId) => {
        await runAction(
            `delete-order:${orderId}`,
            async () => {
                await OrderService.deleteOrderPermanently(orderId);
                await Promise.all([loadOrders(), loadDeliveries(), loadUsers()]);
            },
            "Order deleted permanently.",
        );
    };

    const handleCreateDelivery = async () => {
        if (!deliveryAssignForm.orderId.trim() || !deliveryAssignForm.deliveryUserId.trim()) {
            setError("Order ID and delivery user are required.");
            return;
        }

        const deliveryUser = deliveryUsers.find(
            (user) => resolveEntityId(user) === deliveryAssignForm.deliveryUserId,
        );

        await runAction(
            "create-delivery",
            async () => {
                await DeliveryService.assignDelivery({
                    orderId: deliveryAssignForm.orderId.trim(),
                    deliveryUserId: deliveryAssignForm.deliveryUserId,
                    deliveryUserName: deliveryUser?.name,
                    notes: deliveryAssignForm.notes.trim() || undefined,
                });

                setDeliveryAssignForm(INITIAL_ASSIGN_FORM);
                await Promise.all([loadDeliveries(), loadOrders()]);
            },
            "Delivery assignment created.",
        );
    };

    const handleDeliveryStatusUpdate = async (delivery) => {
        const deliveryId = resolveEntityId(delivery);
        const status = deliveryStatusDrafts[deliveryId];

        if (!status) {
            setError("Select a delivery status before update.");
            return;
        }

        await runAction(
            `delivery-status:${deliveryId}`,
            async () => {
                await DeliveryService.updateDeliveryStatus(deliveryId, {
                    status,
                });

                await Promise.all([loadDeliveries(), loadOrders(), loadUsers()]);
            },
            "Delivery status updated.",
        );
    };

    if (loadingAll) {
        return (
            <div className="mx-auto w-full max-w-[1260px] px-4 py-6 sm:px-6 lg:px-8">
                <Loader text="Loading admin portal..." />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1260px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 rounded-2xl border border-[#dbe5f7] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Admin workspace</p>
                        <h1 className="text-2xl font-semibold text-[#0f172a]">Admin Portal</h1>
                        <p className="mt-1 text-sm text-[#64748b]">
                            Signed in as {auth?.user?.name || auth?.user?.contactNumber} ({resolveRole(auth?.user)})
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/"
                            className="rounded-full border border-[#d4dce9] px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
                        >
                            Client Site
                        </Link>
                        <button
                            type="button"
                            onClick={reloadAll}
                            className="rounded-full border border-[#d4dce9] px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
                        >
                            Refresh all
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                            className="rounded-full bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#b91c1c]"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {[
                    ["dashboard", "Dashboard"],
                    ["customers", "Customers"],
                    ["admins", "Admin Users"],
                    ["deliveryUsers", "Delivery Users"],
                    ["products", "Products"],
                    ["orders", "Orders"],
                    ["deliveries", "Deliveries"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={[
                            "rounded-full px-4 py-2 text-xs font-semibold transition",
                            activeTab === key
                                ? "bg-[#1d4ed8] text-white"
                                : "border border-[#d4dce9] bg-white text-[#334155] hover:bg-[#f8fbff]",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mb-4 space-y-3">
                <ErrorMessage message={error} />
                {success ? (
                    <div className="rounded-xl border border-[#b7e4c7] bg-[#ebfff1] px-3 py-2 text-sm text-[#166534]">
                        {success}
                    </div>
                ) : null}
            </div>

            {activeTab === "dashboard" ? (
                <ManagementSection title="Portal Metrics" description="Current data snapshot from all services.">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Customers</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.customers}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Admins</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.admins}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Delivery Users</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.deliveryUsers}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Products</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.products}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Orders</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.orders}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Pending Orders</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.pendingOrders}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Deliveries</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.deliveries}</p>
                        </div>
                        <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">In Progress Deliveries</p>
                            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metrics.inProgressDeliveries}</p>
                        </div>
                    </div>
                </ManagementSection>
            ) : null}

            {activeTab === "customers" ? (
                <ManagementSection
                    title="Customer (USER) Management"
                    description="Lookup or auto-create customers by contact number, then adjust loyalty points."
                >
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                            <p className="text-sm font-semibold text-[#0f172a]">Lookup or create customer</p>
                            <div className="grid gap-2 mt-3 sm:grid-cols-2">
                                <input
                                    value={lookupCustomerForm.contactNumber}
                                    onChange={(event) =>
                                        setLookupCustomerForm((prev) => ({ ...prev, contactNumber: event.target.value }))
                                    }
                                    placeholder="Customer contact number"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                                />
                                <input
                                    value={lookupCustomerForm.name}
                                    onChange={(event) =>
                                        setLookupCustomerForm((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    placeholder="Customer name (optional)"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleLookupOrCreateCustomer}
                                disabled={actionLoading === "lookup-customer"}
                                className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                            >
                                {actionLoading === "lookup-customer" ? "Processing..." : "Lookup or Create"}
                            </button>

                            {lookupCustomerResult ? (
                                <div className="mt-3 rounded-xl border border-[#d4e9d7] bg-[#effef2] p-3 text-sm text-[#14532d]">
                                    <p className="font-semibold">Customer result</p>
                                    <p>Name: {lookupCustomerResult.name}</p>
                                    <p>Contact: {lookupCustomerResult.contactNumber}</p>
                                    <p>Loyalty: {lookupCustomerResult.loyaltyPoints || 0}</p>
                                    <p>Card: {lookupCustomerResult.loyaltyCardNumber || "N/A"}</p>
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                            <p className="text-sm font-semibold text-[#0f172a]">Create USER account manually</p>
                            <div className="mt-3 space-y-2">
                                <input
                                    value={roleForms.USER.name}
                                    onChange={(event) => handleRoleFormChange("USER", "name", event.target.value)}
                                    placeholder="Name"
                                    className="w-full rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                                />
                                <input
                                    value={roleForms.USER.contactNumber}
                                    onChange={(event) => handleRoleFormChange("USER", "contactNumber", event.target.value)}
                                    placeholder="Contact number"
                                    className="w-full rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                                />
                                <input
                                    value={roleForms.USER.password}
                                    onChange={(event) => handleRoleFormChange("USER", "password", event.target.value)}
                                    placeholder="Password (optional, defaults to contact number)"
                                    className="w-full rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCreateRoleUser("USER")}
                                    disabled={actionLoading === "create-user:USER"}
                                    className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115e59] disabled:opacity-50"
                                >
                                    {actionLoading === "create-user:USER" ? "Creating..." : "Create USER"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5edf8]">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-[#f8fbff]">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Contact</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Loyalty</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Card</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Adjust loyalty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersByRole.USER.map((user) => {
                                    const id = resolveEntityId(user);
                                    const draft = loyaltyDrafts[id] || { operation: "ADD", points: "1", reason: "" };

                                    return (
                                        <tr key={id} className="border-t border-[#edf2fb]">
                                            <td className="px-3 py-2 text-sm text-[#334155]">{user.name}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{user.contactNumber}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{user.loyaltyPoints || 0}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{user.loyaltyCardNumber || "N/A"}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">
                                                <div className="grid gap-2 md:grid-cols-[120px_90px_minmax(160px,1fr)_auto]">
                                                    <select
                                                        value={draft.operation}
                                                        onChange={(event) =>
                                                            setLoyaltyDrafts((prev) => ({
                                                                ...prev,
                                                                [id]: {
                                                                    ...draft,
                                                                    operation: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs outline-none focus:border-[#1d4ed8]"
                                                    >
                                                        <option value="ADD">ADD</option>
                                                        <option value="DEDUCT">DEDUCT</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={draft.points}
                                                        onChange={(event) =>
                                                            setLoyaltyDrafts((prev) => ({
                                                                ...prev,
                                                                [id]: {
                                                                    ...draft,
                                                                    points: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs outline-none focus:border-[#1d4ed8]"
                                                    />
                                                    <input
                                                        value={draft.reason}
                                                        onChange={(event) =>
                                                            setLoyaltyDrafts((prev) => ({
                                                                ...prev,
                                                                [id]: {
                                                                    ...draft,
                                                                    reason: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        placeholder="Reason"
                                                        className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs outline-none focus:border-[#1d4ed8]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAdjustLoyalty(user)}
                                                        disabled={actionLoading === `loyalty:${id}`}
                                                        className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ManagementSection>
            ) : null}

            {activeTab === "admins" ? (
                <ManagementSection title="Admin User Management" description="Create and view admin accounts.">
                    <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                        <div className="grid gap-2 sm:grid-cols-3">
                            <input
                                value={roleForms.ADMIN.name}
                                onChange={(event) => handleRoleFormChange("ADMIN", "name", event.target.value)}
                                placeholder="Name"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                value={roleForms.ADMIN.contactNumber}
                                onChange={(event) => handleRoleFormChange("ADMIN", "contactNumber", event.target.value)}
                                placeholder="Contact number"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                value={roleForms.ADMIN.password}
                                onChange={(event) => handleRoleFormChange("ADMIN", "password", event.target.value)}
                                placeholder="Password"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCreateRoleUser("ADMIN")}
                            disabled={actionLoading === "create-user:ADMIN"}
                            className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                        >
                            {actionLoading === "create-user:ADMIN" ? "Creating..." : "Create ADMIN"}
                        </button>
                    </div>

                    <div className="grid gap-3 mt-4 md:grid-cols-2 xl:grid-cols-3">
                        {usersByRole.ADMIN.map((user) => (
                            <article key={resolveEntityId(user)} className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                                <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
                                <p className="mt-1 text-sm text-[#64748b]">{user.contactNumber}</p>
                                <p className="mt-2 text-xs text-[#64748b]">Created: {formatDate(user.createdAt)}</p>
                            </article>
                        ))}
                    </div>
                </ManagementSection>
            ) : null}

            {activeTab === "deliveryUsers" ? (
                <ManagementSection title="Delivery User Management" description="Create and view delivery accounts.">
                    <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                        <div className="grid gap-2 sm:grid-cols-3">
                            <input
                                value={roleForms.DELIVERY.name}
                                onChange={(event) => handleRoleFormChange("DELIVERY", "name", event.target.value)}
                                placeholder="Name"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                value={roleForms.DELIVERY.contactNumber}
                                onChange={(event) => handleRoleFormChange("DELIVERY", "contactNumber", event.target.value)}
                                placeholder="Contact number"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                value={roleForms.DELIVERY.password}
                                onChange={(event) => handleRoleFormChange("DELIVERY", "password", event.target.value)}
                                placeholder="Password"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCreateRoleUser("DELIVERY")}
                            disabled={actionLoading === "create-user:DELIVERY"}
                            className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                        >
                            {actionLoading === "create-user:DELIVERY" ? "Creating..." : "Create DELIVERY"}
                        </button>
                    </div>

                    <div className="grid gap-3 mt-4 md:grid-cols-2 xl:grid-cols-3">
                        {usersByRole.DELIVERY.map((user) => (
                            <article key={resolveEntityId(user)} className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                                <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
                                <p className="mt-1 text-sm text-[#64748b]">{user.contactNumber}</p>
                                <p className="mt-2 text-xs text-[#64748b]">Created: {formatDate(user.createdAt)}</p>
                            </article>
                        ))}
                    </div>
                </ManagementSection>
            ) : null}

            {activeTab === "products" ? (
                <ManagementSection title="Product Management" description="Create, edit, and delete products for storefront orders.">
                    <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                        <div className="grid gap-2 md:grid-cols-2">
                            <input
                                value={productForm.name}
                                onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                                placeholder="Product name"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                value={productForm.category}
                                onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
                                placeholder="Category"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                type="number"
                                min="0"
                                value={productForm.price}
                                onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                                placeholder="Price"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                type="number"
                                min="0"
                                value={productForm.stock}
                                onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
                                placeholder="Stock"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <input
                                value={productForm.imageUrl}
                                onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                                placeholder="Image URL (optional)"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] md:col-span-2"
                            />
                            <textarea
                                rows={2}
                                value={productForm.description}
                                onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                                placeholder="Description"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] md:col-span-2"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleProductCreate}
                            disabled={actionLoading === "create-product"}
                            className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                        >
                            {actionLoading === "create-product" ? "Creating..." : "Create Product"}
                        </button>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5edf8]">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-[#f8fbff]">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Category</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Price</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Stock</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const id = resolveEntityId(product);

                                    return (
                                        <tr key={id} className="border-t border-[#edf2fb]">
                                            <td className="px-3 py-2 text-sm text-[#334155]">{product.name}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{product.category}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{formatMoney(product.price)}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{product.stock}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingProduct({
                                                                ...product,
                                                                price: String(product.price ?? ""),
                                                                stock: String(product.stock ?? ""),
                                                                imageUrl: product.imageUrl || "",
                                                            })
                                                        }
                                                        className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleProductDelete(id)}
                                                        disabled={actionLoading === `delete-product:${id}`}
                                                        className="rounded-full bg-[#dc2626] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#b91c1c] disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {editingProduct ? (
                        <div className="mt-4 rounded-xl border border-[#e7d7c1] bg-[#fff8f1] p-4">
                            <p className="text-sm font-semibold text-[#0f172a]">Edit product</p>
                            <div className="grid gap-2 mt-3 md:grid-cols-2">
                                <input
                                    value={editingProduct.name}
                                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, name: event.target.value }))}
                                    placeholder="Name"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                                />
                                <input
                                    value={editingProduct.category}
                                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, category: event.target.value }))}
                                    placeholder="Category"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, price: event.target.value }))}
                                    placeholder="Price"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={editingProduct.stock}
                                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, stock: event.target.value }))}
                                    placeholder="Stock"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                                />
                                <input
                                    value={editingProduct.imageUrl}
                                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, imageUrl: event.target.value }))}
                                    placeholder="Image URL"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm md:col-span-2"
                                />
                                <textarea
                                    rows={2}
                                    value={editingProduct.description}
                                    onChange={(event) =>
                                        setEditingProduct((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Description"
                                    className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm md:col-span-2"
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={handleProductUpdate}
                                    disabled={actionLoading.startsWith("update-product")}
                                    className="rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white"
                                >
                                    Save changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="rounded-full border border-[#d4dce9] px-4 py-2 text-xs font-semibold text-[#334155]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : null}
                </ManagementSection>
            ) : null}

            {activeTab === "orders" ? (
                <ManagementSection title="Order Management" description="Create orders for customers, assign delivery users, update status, and delete orders.">
                    <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                        <p className="text-sm font-semibold text-[#0f172a]">Create order as admin</p>

                        <div className="grid gap-2 mt-3 md:grid-cols-2">
                            <input
                                value={orderForm.customerContactNumber}
                                onChange={(event) =>
                                    setOrderForm((prev) => ({ ...prev, customerContactNumber: event.target.value }))
                                }
                                placeholder="Customer contact number"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />
                            <input
                                value={orderForm.customerName}
                                onChange={(event) => setOrderForm((prev) => ({ ...prev, customerName: event.target.value }))}
                                placeholder="Customer name (optional)"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="mt-3 grid gap-2 md:grid-cols-[minmax(220px,1fr)_120px_auto]">
                            <select
                                value={orderForm.selectedProductId}
                                onChange={(event) =>
                                    setOrderForm((prev) => ({ ...prev, selectedProductId: event.target.value }))
                                }
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            >
                                <option value="">Select product</option>
                                {products.map((product) => (
                                    <option key={resolveEntityId(product)} value={resolveEntityId(product)}>
                                        {product.name} (stock: {product.stock})
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                min="1"
                                value={orderForm.selectedQuantity}
                                onChange={(event) =>
                                    setOrderForm((prev) => ({ ...prev, selectedQuantity: event.target.value }))
                                }
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />

                            <button
                                type="button"
                                onClick={handleAddItemToOrderDraft}
                                className="rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white"
                            >
                                Add item
                            </button>
                        </div>

                        {orderForm.items.length ? (
                            <div className="mt-3 rounded-xl border border-[#e5edf8] bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-[#64748b]">Draft items</p>
                                <div className="mt-2 space-y-2">
                                    {orderForm.items.map((item, index) => (
                                        <div key={`${item.productId}-${index}`} className="grid gap-2 md:grid-cols-[1fr_120px_auto]">
                                            <p className="text-sm text-[#334155]">{item.name}</p>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.stock}
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    setOrderForm((prev) => ({
                                                        ...prev,
                                                        items: prev.items.map((entry) =>
                                                            entry.productId === item.productId
                                                                ? { ...entry, quantity: Math.max(1, Number(event.target.value || 1)) }
                                                                : entry,
                                                        ),
                                                    }))
                                                }
                                                className="rounded-lg border border-[#d4dce9] px-2 py-1 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOrderForm((prev) => ({
                                                        ...prev,
                                                        items: prev.items.filter((entry) => entry.productId !== item.productId),
                                                    }))
                                                }
                                                className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155]"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="grid gap-2 mt-3 md:grid-cols-2">
                            <textarea
                                rows={2}
                                value={orderForm.deliveryAddress}
                                onChange={(event) =>
                                    setOrderForm((prev) => ({ ...prev, deliveryAddress: event.target.value }))
                                }
                                placeholder="Delivery address"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm md:col-span-2"
                            />

                            <input
                                type="number"
                                step="any"
                                value={orderForm.latitude}
                                onChange={(event) => setOrderForm((prev) => ({ ...prev, latitude: event.target.value }))}
                                placeholder="Latitude"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />
                            <input
                                type="number"
                                step="any"
                                value={orderForm.longitude}
                                onChange={(event) => setOrderForm((prev) => ({ ...prev, longitude: event.target.value }))}
                                placeholder="Longitude"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="mt-3">
                            <LocationPickerMap
                                latitude={orderForm.latitude}
                                longitude={orderForm.longitude}
                                onChange={({ latitude, longitude }) =>
                                    setOrderForm((prev) => ({
                                        ...prev,
                                        latitude,
                                        longitude,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <input
                                type="number"
                                min="0"
                                value={orderForm.loyaltyPointsToUse}
                                onChange={(event) =>
                                    setOrderForm((prev) => ({ ...prev, loyaltyPointsToUse: event.target.value }))
                                }
                                placeholder="Loyalty points to use"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />

                            <button
                                type="button"
                                onClick={handleCreateOrderByAdmin}
                                disabled={actionLoading === "create-admin-order"}
                                className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115e59] disabled:opacity-50"
                            >
                                {actionLoading === "create-admin-order" ? "Creating..." : "Create Order"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {orders.map((order) => {
                            const orderId = resolveEntityId(order);
                            const status = normalizeRole(order.status);
                            const isTerminal = ["COMPLETED", "CANCELLED_BY_USER", "CANCELLED_BY_ADMIN", "CANCELLED_BY_DELIVERY"].includes(status);

                            return (
                                <article key={orderId} className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-[#0f172a]">Order {orderId}</p>
                                            <p className="mt-1 text-xs text-[#64748b]">
                                                Customer: {order.userContactNumber} · Created: {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <StatusPill status={status} />
                                    </div>

                                    <div className="mt-3 grid gap-2 text-sm text-[#334155] md:grid-cols-3">
                                        <p>Items: {order.items?.length || 0}</p>
                                        <p>Total: {formatMoney(order.totalAmount)}</p>
                                        <p>Loyalty used: {order.loyaltyPointsUsed || 0}</p>
                                    </div>

                                    <div className="grid gap-2 mt-3 md:grid-cols-3">
                                        <select
                                            value={orderStatusDrafts[orderId] || ""}
                                            onChange={(event) =>
                                                setOrderStatusDrafts((prev) => ({ ...prev, [orderId]: event.target.value }))
                                            }
                                            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-xs"
                                        >
                                            <option value="">Set status...</option>
                                            {ORDER_STATUS_OPTIONS_ADMIN.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={orderAssignmentDrafts[orderId]?.deliveryUserId || ""}
                                            onChange={(event) =>
                                                setOrderAssignmentDrafts((prev) => ({
                                                    ...prev,
                                                    [orderId]: {
                                                        ...prev[orderId],
                                                        deliveryUserId: event.target.value,
                                                    },
                                                }))
                                            }
                                            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-xs"
                                        >
                                            <option value="">Assign delivery user...</option>
                                            {deliveryUsers.map((user) => (
                                                <option key={resolveEntityId(user)} value={resolveEntityId(user)}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOrderStatusUpdate(order)}
                                                disabled={isTerminal || actionLoading === `status-order:${orderId}`}
                                                className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                            >
                                                Update status
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAssignDeliveryToOrder(order)}
                                                disabled={isTerminal || actionLoading === `assign-order:${orderId}`}
                                                className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155] disabled:opacity-50"
                                            >
                                                Assign delivery
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleCancelOrderAsAdmin(order)}
                                            disabled={isTerminal || actionLoading === `cancel-order:${orderId}`}
                                            className="rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                        >
                                            Cancel by admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteOrder(orderId)}
                                            disabled={actionLoading === `delete-order:${orderId}`}
                                            className="rounded-full bg-[#dc2626] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                        >
                                            Delete permanently
                                        </button>
                                        <NavLink to={`/orders/${orderId}/tracking`} className="text-xs font-semibold text-[#0f766e] underline">
                                            Track
                                        </NavLink>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </ManagementSection>
            ) : null}

            {activeTab === "deliveries" ? (
                <ManagementSection title="Delivery Management" description="Assign deliveries and manage delivery lifecycle statuses.">
                    <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                        <p className="text-sm font-semibold text-[#0f172a]">Create assignment</p>
                        <div className="grid gap-2 mt-3 md:grid-cols-3">
                            <input
                                value={deliveryAssignForm.orderId}
                                onChange={(event) =>
                                    setDeliveryAssignForm((prev) => ({ ...prev, orderId: event.target.value }))
                                }
                                placeholder="Order ID"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />
                            <select
                                value={deliveryAssignForm.deliveryUserId}
                                onChange={(event) =>
                                    setDeliveryAssignForm((prev) => ({
                                        ...prev,
                                        deliveryUserId: event.target.value,
                                    }))
                                }
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            >
                                <option value="">Select delivery user</option>
                                {deliveryUsers.map((user) => (
                                    <option key={resolveEntityId(user)} value={resolveEntityId(user)}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={deliveryAssignForm.notes}
                                onChange={(event) =>
                                    setDeliveryAssignForm((prev) => ({ ...prev, notes: event.target.value }))
                                }
                                placeholder="Notes"
                                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleCreateDelivery}
                            disabled={actionLoading === "create-delivery"}
                            className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                        >
                            {actionLoading === "create-delivery" ? "Assigning..." : "Assign delivery"}
                        </button>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5edf8]">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-[#f8fbff]">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Order</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Delivery User</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Assigned</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map((delivery) => {
                                    const deliveryId = resolveEntityId(delivery);
                                    const status = normalizeRole(delivery.status);
                                    const isTerminal = DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE.includes(status);

                                    return (
                                        <tr key={deliveryId} className="border-t border-[#edf2fb]">
                                            <td className="px-3 py-2 text-sm text-[#334155]">{delivery.orderId}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{delivery.deliveryUserName || delivery.deliveryUserId}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]"><StatusPill status={status} /></td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">{formatDate(delivery.assignedAt)}</td>
                                            <td className="px-3 py-2 text-sm text-[#334155]">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={deliveryStatusDrafts[deliveryId] || ""}
                                                        onChange={(event) =>
                                                            setDeliveryStatusDrafts((prev) => ({
                                                                ...prev,
                                                                [deliveryId]: event.target.value,
                                                            }))
                                                        }
                                                        className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs"
                                                    >
                                                        <option value="">Set status...</option>
                                                        {DELIVERY_STATUS_OPTIONS.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeliveryStatusUpdate(delivery)}
                                                        disabled={isTerminal || actionLoading === `delivery-status:${deliveryId}`}
                                                        className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ManagementSection>
            ) : null}
        </div>
    );
}
