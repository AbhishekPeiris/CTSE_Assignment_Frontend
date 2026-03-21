import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import { AuthService } from "../../../services/auth.service";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";
import { DeliveryService } from "../../../services/delivery.service";
import {
  asCollection,
  formatDate,
  resolveEntityId,
} from "../../../utils/helpers";
import UserManagement from "../components/users/UserManagement";
import ProductManagement from "../components/products/ProductManagement";
import OrderManagement from "../components/orders/OrderManagement";
import DeliveryManagement from "../components/deliveries/DeliveryManagement";

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

const ADMIN_TABS = new Set([
  "dashboard",
  "customers",
  "admins",
  "deliveryUsers",
  "products",
  "orders",
  "deliveries",
]);

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

ManagementSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function AdminPortalPage() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") || "dashboard";
  const activeTab = ADMIN_TABS.has(requestedTab) ? requestedTab : "dashboard";
  const requestedOrderView = searchParams.get("orderView") || "make";
  const activeOrderView = requestedOrderView === "history" ? "history" : "make";

  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [usersByRole, setUsersByRole] = useState({
    USER: [],
    ADMIN: [],
    DELIVERY: [],
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const [roleForms, setRoleForms] = useState(INITIAL_ROLE_FORM);
  const [lookupCustomerForm, setLookupCustomerForm] = useState({
    contactNumber: "",
    name: "",
  });
  const [lookupCustomerResult, setLookupCustomerResult] = useState(null);
  const [loyaltyDrafts, setLoyaltyDrafts] = useState({});

  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [editingProduct, setEditingProduct] = useState(null);

  const [orderForm, setOrderForm] = useState(INITIAL_ORDER_FORM);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [orderAssignmentDrafts, setOrderAssignmentDrafts] = useState({});

  const [deliveryAssignForm, setDeliveryAssignForm] =
    useState(INITIAL_ASSIGN_FORM);
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
    const normalized = asCollection(response, ["orders"]).sort(
      (left, right) => {
        const leftTime = new Date(left?.createdAt || 0).getTime();
        const rightTime = new Date(right?.createdAt || 0).getTime();
        return rightTime - leftTime;
      },
    );

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
      await Promise.all([
        loadUsers(),
        loadProducts(),
        loadOrders(),
        loadDeliveries(),
      ]);
    } catch (requestError) {
      setError(
        requestError?.friendlyMessage ||
          requestError?.message ||
          "Failed to load admin portal data",
      );
    } finally {
      setLoadingAll(false);
    }
  }, [loadDeliveries, loadOrders, loadProducts, loadUsers]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const metrics = useMemo(() => {
    const pendingOrders = orders.filter(
      (order) => normalizeRole(order?.status) === "PENDING",
    ).length;
    const inProgressDeliveries = deliveries.filter((delivery) =>
      ["ASSIGNED", "OUT_FOR_DELIVERY"].includes(
        normalizeRole(delivery?.status),
      ),
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
  }, [
    deliveries,
    orders,
    products.length,
    usersByRole.ADMIN.length,
    usersByRole.DELIVERY.length,
    usersByRole.USER.length,
  ]);

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
      setError(
        actionError?.friendlyMessage || actionError?.message || "Action failed",
      );
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
    const draft = loyaltyDrafts[userId] || {
      operation: "ADD",
      points: "1",
      reason: "",
    };

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
    return (
      products.find(
        (product) => resolveEntityId(product) === orderForm.selectedProductId,
      ) || null
    );
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
      const existingIndex = prev.items.findIndex(
        (item) => item.productId === prev.selectedProductId,
      );

      if (existingIndex >= 0) {
        const nextItems = [...prev.items];
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: Math.min(
            stock,
            Number(nextItems[existingIndex].quantity || 0) + quantity,
          ),
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

    if (
      !orderForm.deliveryAddress.trim() ||
      !orderForm.latitude ||
      !orderForm.longitude
    ) {
      setError("Delivery address and map location are required.");
      return;
    }

    await runAction(
      "create-admin-order",
      async () => {
        await OrderService.createOrder({
          customerContactNumber: orderForm.customerContactNumber.trim(),
          customerName: orderForm.customerName.trim() || undefined,
          loyaltyPointsToUse: Math.max(
            0,
            Number(orderForm.loyaltyPointsToUse || 0),
          ),
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

    const deliveryUser = deliveryUsers.find(
      (user) => resolveEntityId(user) === draft.deliveryUserId,
    );

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
    if (
      !deliveryAssignForm.orderId.trim() ||
      !deliveryAssignForm.deliveryUserId.trim()
    ) {
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
      <div className="w-full py-3">
        <Loader text="Loading admin portal..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 space-y-3">
        <ErrorMessage message={error} />
        {success ? (
          <div className="rounded-xl border border-[#b7e4c7] bg-[#ebfff1] px-3 py-2 text-sm text-[#166534]">
            {success}
          </div>
        ) : null}
      </div>

      {activeTab === "dashboard" ? (
        <ManagementSection
          title="Portal Metrics"
          description="Current data snapshot from all services."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Customers
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.customers}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Admins
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.admins}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Delivery Users
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.deliveryUsers}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Products
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.products}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Orders
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.orders}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Pending Orders
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.pendingOrders}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                Deliveries
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.deliveries}
              </p>
            </div>
            <div className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">
                In Progress Deliveries
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                {metrics.inProgressDeliveries}
              </p>
            </div>
          </div>
        </ManagementSection>
      ) : null}

      {activeTab === "customers" ? (
        <ManagementSection
          title="User Management"
          description="Lookup or auto-create customers by contact number, then adjust loyalty points."
        >
          <UserManagement
            lookupCustomerForm={lookupCustomerForm}
            setLookupCustomerForm={setLookupCustomerForm}
            handleLookupOrCreateCustomer={handleLookupOrCreateCustomer}
            actionLoading={actionLoading}
            lookupCustomerResult={lookupCustomerResult}
            roleForms={roleForms}
            handleRoleFormChange={handleRoleFormChange}
            handleCreateRoleUser={handleCreateRoleUser}
            users={usersByRole.USER}
            loyaltyDrafts={loyaltyDrafts}
            setLoyaltyDrafts={setLoyaltyDrafts}
            handleAdjustLoyalty={handleAdjustLoyalty}
          />
        </ManagementSection>
      ) : null}

      {activeTab === "admins" ? (
        <ManagementSection
          title="Admin User Management"
          description="Create and view admin accounts."
        >
          <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                value={roleForms.ADMIN.name}
                onChange={(event) =>
                  handleRoleFormChange("ADMIN", "name", event.target.value)
                }
                placeholder="Name"
                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
              />
              <input
                value={roleForms.ADMIN.contactNumber}
                onChange={(event) =>
                  handleRoleFormChange(
                    "ADMIN",
                    "contactNumber",
                    event.target.value,
                  )
                }
                placeholder="Contact number"
                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
              />
              <input
                value={roleForms.ADMIN.password}
                onChange={(event) =>
                  handleRoleFormChange("ADMIN", "password", event.target.value)
                }
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
              {actionLoading === "create-user:ADMIN"
                ? "Creating..."
                : "Create ADMIN"}
            </button>
          </div>

          <div className="grid gap-3 mt-4 md:grid-cols-2 xl:grid-cols-3">
            {usersByRole.ADMIN.map((user) => (
              <article
                key={resolveEntityId(user)}
                className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4"
              >
                <p className="text-sm font-semibold text-[#0f172a]">
                  {user.name}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {user.contactNumber}
                </p>
                <p className="mt-2 text-xs text-[#64748b]">
                  Created: {formatDate(user.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </ManagementSection>
      ) : null}

      {activeTab === "deliveryUsers" ? (
        <ManagementSection
          title="Delivery User Management"
          description="Create and view delivery accounts."
        >
          <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                value={roleForms.DELIVERY.name}
                onChange={(event) =>
                  handleRoleFormChange("DELIVERY", "name", event.target.value)
                }
                placeholder="Name"
                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
              />
              <input
                value={roleForms.DELIVERY.contactNumber}
                onChange={(event) =>
                  handleRoleFormChange(
                    "DELIVERY",
                    "contactNumber",
                    event.target.value,
                  )
                }
                placeholder="Contact number"
                className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
              />
              <input
                value={roleForms.DELIVERY.password}
                onChange={(event) =>
                  handleRoleFormChange(
                    "DELIVERY",
                    "password",
                    event.target.value,
                  )
                }
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
              {actionLoading === "create-user:DELIVERY"
                ? "Creating..."
                : "Create DELIVERY"}
            </button>
          </div>

          <div className="grid gap-3 mt-4 md:grid-cols-2 xl:grid-cols-3">
            {usersByRole.DELIVERY.map((user) => (
              <article
                key={resolveEntityId(user)}
                className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4"
              >
                <p className="text-sm font-semibold text-[#0f172a]">
                  {user.name}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {user.contactNumber}
                </p>
                <p className="mt-2 text-xs text-[#64748b]">
                  Created: {formatDate(user.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </ManagementSection>
      ) : null}

      {activeTab === "products" ? (
        <ManagementSection
          title="Product Management"
          description="Create, edit, and delete products for storefront orders."
        >
          <ProductManagement
            productForm={productForm}
            setProductForm={setProductForm}
            handleProductCreate={handleProductCreate}
            actionLoading={actionLoading}
            products={products}
            setEditingProduct={setEditingProduct}
            handleProductDelete={handleProductDelete}
            editingProduct={editingProduct}
            handleProductUpdate={handleProductUpdate}
          />
        </ManagementSection>
      ) : null}

      {activeTab === "orders" ? (
        <ManagementSection
          title="Order Management"
          description="Create orders for customers, assign delivery users, update status, and delete orders."
        >
          <OrderManagement
            activeOrderView={activeOrderView}
            orderForm={orderForm}
            setOrderForm={setOrderForm}
            products={products}
            handleAddItemToOrderDraft={handleAddItemToOrderDraft}
            handleCreateOrderByAdmin={handleCreateOrderByAdmin}
            actionLoading={actionLoading}
            orders={orders}
            normalizeRole={normalizeRole}
            orderStatusDrafts={orderStatusDrafts}
            setOrderStatusDrafts={setOrderStatusDrafts}
            orderAssignmentDrafts={orderAssignmentDrafts}
            setOrderAssignmentDrafts={setOrderAssignmentDrafts}
            deliveryUsers={deliveryUsers}
            handleOrderStatusUpdate={handleOrderStatusUpdate}
            handleAssignDeliveryToOrder={handleAssignDeliveryToOrder}
            handleCancelOrderAsAdmin={handleCancelOrderAsAdmin}
            handleDeleteOrder={handleDeleteOrder}
          />
        </ManagementSection>
      ) : null}

      {activeTab === "deliveries" ? (
        <ManagementSection
          title="Delivery Management"
          description="Assign deliveries and manage delivery lifecycle statuses."
        >
          <DeliveryManagement
            deliveryAssignForm={deliveryAssignForm}
            setDeliveryAssignForm={setDeliveryAssignForm}
            deliveryUsers={deliveryUsers}
            handleCreateDelivery={handleCreateDelivery}
            actionLoading={actionLoading}
            deliveries={deliveries}
            normalizeRole={normalizeRole}
            deliveryStatusDrafts={deliveryStatusDrafts}
            setDeliveryStatusDrafts={setDeliveryStatusDrafts}
            handleDeliveryStatusUpdate={handleDeliveryStatusUpdate}
          />
        </ManagementSection>
      ) : null}
    </div>
  );
}
