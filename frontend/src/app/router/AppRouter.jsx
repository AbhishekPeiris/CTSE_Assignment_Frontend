import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../providers/AppProvider";
import apiClient from "../../api/apiClient";
import { API_ENDPOINTS } from "../../api/endpoints";

function Layout({ children }) {
  const { auth, logout } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white border-b">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div>
            <h1 className="text-xl font-semibold">CTSE Assignment</h1>
            <p className="text-sm text-slate-500">
              Professional React Frontend
            </p>
          </div>

          <nav className="flex items-center gap-3">
            <Link className="text-sm font-medium hover:text-blue-600" to="/">
              Dashboard
            </Link>
            <Link
              className="text-sm font-medium hover:text-blue-600"
              to="/products"
            >
              Products
            </Link>
            <Link
              className="text-sm font-medium hover:text-blue-600"
              to="/orders"
            >
              Orders
            </Link>
            <Link
              className="text-sm font-medium hover:text-blue-600"
              to="/deliveries"
            >
              Deliveries
            </Link>

            {auth.isAuthenticated ? (
              <>
                <span className="px-3 py-1 text-sm rounded bg-slate-100">
                  {auth?.user?.name || auth?.user?.email || "User"}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="px-4 py-2 text-sm font-medium border rounded hover:bg-slate-50"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="px-6 py-8 mx-auto max-w-7xl">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { auth, isBootstrapping } = useAppContext();

  if (isBootstrapping) {
    return <PageLoader text="Checking session..." />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { auth, isBootstrapping } = useAppContext();

  if (isBootstrapping) {
    return <PageLoader text="Loading..." />;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PageLoader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="px-6 py-4 bg-white border shadow-sm rounded-xl">
        {text}
      </div>
    </div>
  );
}

function DashboardPage() {
  const { auth } = useAppContext();

  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Authentication"
          value={auth.isAuthenticated ? "Active" : "Guest"}
        />
        <DashboardCard title="Products Module" value="Ready" />
        <DashboardCard title="Orders Module" value="Ready" />
        <DashboardCard title="Deliveries Module" value="Ready" />
      </div>

      <div className="p-6 mt-8 bg-white border shadow-sm rounded-2xl">
        <h2 className="text-lg font-semibold">Welcome</h2>
        <p className="mt-2 text-sm text-slate-600">
          This router is already prepared for login, register, products, orders,
          deliveries, and protected pages.
        </p>
      </div>
    </Layout>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    </div>
  );
}

function LoginPage() {
  const { login } = useAppContext();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, form);
      const data = response?.data ?? {};
      const token = data?.token || data?.data?.token;
      const user = data?.user || data?.data?.user || data?.data || null;

      if (!token) {
        throw new Error("Token not found in login response");
      }

      login({ user, token });
    } catch (err) {
      setError(err?.friendlyMessage || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AuthCard title="Login" subtitle="Sign in to access your account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </AuthCard>
    </Layout>
  );
}

function RegisterPage() {
  const { login } = useAppContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, form);
      const data = response?.data ?? {};
      const token = data?.token || data?.data?.token || null;
      const user = data?.user || data?.data?.user || data?.data || null;

      if (token) {
        login({ user, token });
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      setError(err?.friendlyMessage || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AuthCard title="Register" subtitle="Create a new account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DELIVERY">DELIVERY</option>
            </select>
          </div>

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </AuthCard>
    </Layout>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="max-w-md p-6 mx-auto bg-white border shadow-sm rounded-2xl">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
      />
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="px-3 py-2 text-sm text-red-700 rounded-lg bg-red-50">
      {message}
    </div>
  );
}

function ProductsPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    items: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_ALL);
        const data = response?.data;
        const items = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];
        setState({ loading: false, error: "", items });
      } catch (err) {
        setState({
          loading: false,
          error: err?.friendlyMessage || "Failed to load products",
          items: [],
        });
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      <SectionCard title="Products">
        {state.loading && <p>Loading products...</p>}
        {state.error && <ErrorMessage message={state.error} />}

        {!state.loading && !state.error && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.items.length > 0 ? (
              state.items.map((item) => (
                <div
                  key={item._id || item.id}
                  className="p-4 border rounded-xl"
                >
                  <h3 className="font-semibold">
                    {item.name || item.title || "Unnamed Product"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.description || "No description available"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No products found.</p>
            )}
          </div>
        )}
      </SectionCard>
    </Layout>
  );
}

function OrdersPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    items: [],
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_ALL);
        const data = response?.data;
        const items = Array.isArray(data)
          ? data
          : data?.orders || data?.data || [];
        setState({ loading: false, error: "", items });
      } catch (err) {
        setState({
          loading: false,
          error: err?.friendlyMessage || "Failed to load orders",
          items: [],
        });
      }
    };

    fetchOrders();
  }, []);

  return (
    <Layout>
      <SectionCard title="Orders">
        {state.loading && <p>Loading orders...</p>}
        {state.error && <ErrorMessage message={state.error} />}

        {!state.loading && !state.error && (
          <div className="space-y-3">
            {state.items.length > 0 ? (
              state.items.map((item) => (
                <div
                  key={item._id || item.id}
                  className="p-4 border rounded-xl"
                >
                  <h3 className="font-semibold">
                    Order #{item._id || item.id}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Status: {item.status || "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No orders found.</p>
            )}
          </div>
        )}
      </SectionCard>
    </Layout>
  );
}

function DeliveriesPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    items: [],
  });

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.DELIVERIES.GET_ALL);
        const data = response?.data;
        const items = Array.isArray(data)
          ? data
          : data?.deliveries || data?.data || [];
        setState({ loading: false, error: "", items });
      } catch (err) {
        setState({
          loading: false,
          error: err?.friendlyMessage || "Failed to load deliveries",
          items: [],
        });
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <Layout>
      <SectionCard title="Deliveries">
        {state.loading && <p>Loading deliveries...</p>}
        {state.error && <ErrorMessage message={state.error} />}

        {!state.loading && !state.error && (
          <div className="space-y-3">
            {state.items.length > 0 ? (
              state.items.map((item) => (
                <div
                  key={item._id || item.id}
                  className="p-4 border rounded-xl"
                >
                  <h3 className="font-semibold">
                    Delivery #{item._id || item.id}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Status: {item.status || "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No deliveries found.</p>
            )}
          </div>
        )}
      </SectionCard>
    </Layout>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="p-6 bg-white border shadow-sm rounded-2xl">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <div className="p-8 text-center bg-white border shadow-sm rounded-2xl">
        <h2 className="text-2xl font-semibold">404</h2>
        <p className="mt-2 text-slate-500">Page not found.</p>
      </div>
    </Layout>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/deliveries"
        element={
          <ProtectedRoute>
            <DeliveriesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
