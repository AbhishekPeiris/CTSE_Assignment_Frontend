import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import { AuthService } from "../../../services/auth.service";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";
import { DeliveryService } from "../../../services/delivery.service";
import { asCollection } from "../../../utils/helpers";
import UserManagement from "../components/users/UserManagement";
import OverviewDashboard from "../components/dashbaord/OverviewDashboard";
import AdminUserManagement from "../components/users/AdminUserManagement";
import DeliveryUserManagement from "../components/users/DeliveryUserManagement";
import ProductManagement from "../components/products/ProductManagement";
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
  } = useUserStore({ runAction, setError, loadUsers });

  const {
    productForm,
    setProductForm,
    editingProduct,
    setEditingProduct,
    handleProductCreate,
    handleProductUpdate,
    handleProductDelete,
  } = useProductStore({ runAction, setError, loadProducts });

  const {
    orderForm,
    setOrderForm,
    orderStatusDrafts,
    setOrderStatusDrafts,
    orderAssignmentDrafts,
    setOrderAssignmentDrafts,
    handleAddItemToOrderDraft,
    handleCreateOrderByAdmin,
    handleAssignDeliveryToOrder,
    handleOrderStatusUpdate,
    handleCancelOrderAsAdmin,
    handleDeleteOrder,
  } = useOrderStore({
    runAction,
    setError,
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
    setError,
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
          description="Create orders for customers and manage their orders"
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
