import { Route, Routes } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import NotFoundPage from "./NotFoundPage";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import Dashboard from "../../features/dashboard/pages/Dashboard";
import ProductList from "../../features/products/pages/ProductList";
import ProductDetails from "../../features/products/pages/ProductDetails";
import OrderDetails from "../../features/orders/pages/OrderDetails";
import DeliveryList from "../../features/deliveries/pages/DeliveryList";
import OrderPage from "../../features/orders/pages/OrderPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/deliveries" element={<DeliveryList />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
    </Routes>
  );
}
