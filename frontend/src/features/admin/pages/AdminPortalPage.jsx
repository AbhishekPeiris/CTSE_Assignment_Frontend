import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";
import Loader from "../../../components/ui/Loader";
import { AuthService } from "../../../services/auth.service";
import { ProductService } from "../../../services/product.service";
import { CategoryService } from "../../../services/category.service";
import { OrderService } from "../../../services/order.service";
import { DeliveryService } from "../../../services/delivery.service";
import { asCollection } from "../../../utils/helpers";
import UserManagement from "../components/users/UserManagement";
import OverviewDashboard from "../components/dashbaord/OverviewDashboard";
import AdminUserManagement from "../components/users/AdminUserManagement";
import DeliveryUserManagement from "../components/users/DeliveryUserManagement";
import ProductManagement from "../components/products/ProductManagement";
import CategoryManagement from "../components/products/CategoryManagement";
import OrderManagement from "../components/orders/OrderManagement";
import DeliveryManagement from "../components/deliveries/DeliveryManagement";
import { useUserStore } from "../components/users/userStore";
import { useProductStore } from "../components/products/productStore";
import { useOrderStore } from "../components/orders/orderStore";
import { useDeliveryStore } from "../components/deliveries/deliveryStore";

const ADMIN_TABS = new Set([
  "dashboard",
  "customers",
  "admins",
  "deliveryUsers",
  "products",
  "categories",
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
    <section className="p-5 bg-white">
      <h2 className="text-xl font-semibold text-label">{title}</h2>
      <p className="mt-1 text-sm text-word">{description}</p>
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
  const requestedDeliveryView = searchParams.get("deliveryView") || "manage";
  const activeDeliveryView = ["manage", "active"].includes(
    requestedDeliveryView,
  )
    ? requestedDeliveryView
    : "manage";

  const [loadingAll, setLoadingAll] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [usersByRole, setUsersByRole] = useState({
    USER: [],
    ADMIN: [],
    DELIVERY: [],
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const deliveryUsers = usersByRole.DELIVERY;

  const showNotification = useCallback((severity, message) => {
    if (!message) {
      return;
    }

    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const setErrorMessage = useCallback(
    (message) => {
      showNotification("error", message);
    },
    [showNotification],
  );

  const handleNotificationClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

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

  const loadCategories = useCallback(async () => {
    const response = await CategoryService.getAllCategories();
    setCategories(Array.isArray(response) ? response : []);
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

    try {
      await Promise.all([
        loadUsers(),
        loadProducts(),
        loadCategories(),
        loadOrders(),
        loadDeliveries(),
      ]);
    } catch (requestError) {
      setErrorMessage(
        requestError?.friendlyMessage ||
          requestError?.message ||
          "Failed to load admin portal data",
      );
    } finally {
      setLoadingAll(false);
    }
  }, [
    loadDeliveries,
    loadOrders,
    loadProducts,
    loadCategories,
    loadUsers,
    setErrorMessage,
  ]);

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

  const runAction = async (loadingKey, handler, successMessage) => {
    setActionLoading(loadingKey);

    try {
      await handler();
      if (successMessage) {
        showNotification("success", successMessage);
      }
    } catch (actionError) {
      showNotification(
        "error",
        actionError?.friendlyMessage || actionError?.message || "Action failed",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleCategoryCreate = async (form) => {
    await runAction(
      "create-category",
      async () => {
        await CategoryService.createCategory({
          name: form.name.trim(),
          description: form.description.trim(),
        });
        await loadCategories();
      },
      "Category created successfully",
    );
  };

  const handleCategoryUpdate = async (id, form) => {
    await runAction(
      `update-category:${id}`,
      async () => {
        await CategoryService.updateCategory(id, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
        await loadCategories();
      },
      "Category updated successfully",
    );
  };

  const handleCategoryDelete = async (id) => {
    await runAction(
      `delete-category:${id}`,
      async () => {
        await CategoryService.deleteCategory(id);
        await loadCategories();
      },
      "Category deleted successfully",
    );
  };

  const {
    roleForms,
    lookupCustomerForm,
    setLookupCustomerForm,
    lookupCustomerResult,
    loyaltyDrafts,
    setLoyaltyDrafts,
    handleRoleFormChange,
    handleCreateRoleUser,
    handleLookupOrCreateCustomer,
    handleAdjustLoyalty,
  } = useUserStore({ runAction, setError: setErrorMessage, loadUsers });

  const {
    productForm,
    setProductForm,
    editingProduct,
    setEditingProduct,
    handleProductCreate,
    handleProductUpdate,
    handleProductDelete,
  } = useProductStore({ runAction, setError: setErrorMessage, loadProducts });

  const {
    orderForm,
    setOrderForm,
    orderCustomer,
    setOrderCustomer,
    orderStatusDrafts,
    setOrderStatusDrafts,
    handleAddItemToOrderDraft,
    handleLookupOrCreateOrderCustomer,
    handleCreateOrderByAdmin,
    handleOrderStatusUpdate,
    handleCancelOrderAsAdmin,
    handleDeleteOrder,
  } = useOrderStore({
    runAction,
    setError: setErrorMessage,
    products,
    deliveryUsers,
    loadOrders,
    loadUsers,
    loadProducts,
    loadDeliveries,
  });

  const {
    deliveryAssignForm,
    setDeliveryAssignForm,
    deliveryStatusDrafts,
    setDeliveryStatusDrafts,
    handleCreateDelivery,
    handleDeliveryStatusUpdate,
  } = useDeliveryStore({
    runAction,
    setError: setErrorMessage,
    deliveryUsers,
    loadDeliveries,
    loadOrders,
    loadUsers,
  });

  if (loadingAll) {
    return (
      <div className="w-full py-3">
        <Loader text="Loading admin portal..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {activeTab === "dashboard" ? (
        <ManagementSection
          title="Overview Dashboard"
          description="Dashboard metrics providing a quick overview of customers, products, orders, and deliveries."
        >
          <OverviewDashboard metrics={metrics} />
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
          <AdminUserManagement
            roleForms={roleForms}
            handleRoleFormChange={handleRoleFormChange}
            handleCreateRoleUser={handleCreateRoleUser}
            actionLoading={actionLoading}
            users={usersByRole.ADMIN}
          />
        </ManagementSection>
      ) : null}

      {activeTab === "deliveryUsers" ? (
        <ManagementSection
          title="Delivery User Management"
          description="Create and view delivery accounts."
        >
          <DeliveryUserManagement
            roleForms={roleForms}
            handleRoleFormChange={handleRoleFormChange}
            handleCreateRoleUser={handleCreateRoleUser}
            actionLoading={actionLoading}
            users={usersByRole.DELIVERY}
          />
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
            categories={categories}
            setEditingProduct={setEditingProduct}
            handleProductDelete={handleProductDelete}
            editingProduct={editingProduct}
            handleProductUpdate={handleProductUpdate}
          />
        </ManagementSection>
      ) : null}

      {activeTab === "categories" ? (
        <ManagementSection
          title="Category Management"
          description="Add, update, and view product categories."
        >
          <CategoryManagement
            categories={categories}
            onCategoryCreate={handleCategoryCreate}
            onCategoryUpdate={handleCategoryUpdate}
            onCategoryDelete={handleCategoryDelete}
            actionLoading={actionLoading}
          />
        </ManagementSection>
      ) : null}

      {activeTab === "orders" ? (
        <ManagementSection
          title="Order Management"
          description="Create orders for customers and manage their orders"
        >
          <OrderManagement
            activeOrderView={activeOrderView}
            orderForm={orderForm}
            setOrderForm={setOrderForm}
            orderCustomer={orderCustomer}
            setOrderCustomer={setOrderCustomer}
            products={products}
            handleAddItemToOrderDraft={handleAddItemToOrderDraft}
            handleLookupOrCreateOrderCustomer={
              handleLookupOrCreateOrderCustomer
            }
            handleCreateOrderByAdmin={handleCreateOrderByAdmin}
            actionLoading={actionLoading}
            orders={orders}
            normalizeRole={normalizeRole}
            orderStatusDrafts={orderStatusDrafts}
            setOrderStatusDrafts={setOrderStatusDrafts}
            handleOrderStatusUpdate={handleOrderStatusUpdate}
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
            activeDeliveryView={activeDeliveryView}
            orders={orders}
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
