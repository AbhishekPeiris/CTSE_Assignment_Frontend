import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import NotFoundPage from "./NotFoundPage";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import RoleAwareHome from "./RoleAwareHome";
import UserOrdersPage from "../../features/client/pages/UserOrdersPage";
import UserOrderTrackingPage from "../../features/client/pages/UserOrderTrackingPage";
import { useAppContext } from "../../app/providers/AppProvider";
import { resolveRole } from "../../utils/helpers";
import AdminPortalPage from "../../features/admin/pages/AdminPortalPage";
import DeliveryPortalPage from "../../features/deliveries/pages/DeliveryPortalPage";
import ClientNavBar from "../../components/layout/client/ClientNavBar";
import AdminLayout from "../../components/layout/admin/AdminLayout";

export default function AppRouter() {
  const { auth, logout } = useAppContext();
  const role = resolveRole(auth?.user);
  const isLoggedIn = Boolean(auth?.isAuthenticated);
  const isUser = role === "USER";
  const showClientNav = role !== "ADMIN" && role !== "DELIVERY";

  const renderWithClientNav = (element) => {
    return (
      <>
        {showClientNav ? (
          <ClientNavBar
            isUser={isUser}
            role={role}
            isLoggedIn={isLoggedIn}
            auth={auth}
            logout={logout}
          />
        ) : null}
        {element}
      </>
    );
  };

  return (
    <Routes>
      <Route path="/" element={renderWithClientNav(<RoleAwareHome />)} />

      <Route
        path="/my-orders"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            {renderWithClientNav(<UserOrdersPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id/tracking"
        element={
          <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
            {renderWithClientNav(<UserOrderTrackingPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout>
              <AdminPortalPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery-portal"
        element={
          <ProtectedRoute allowedRoles={["DELIVERY"]}>
            <DeliveryPortalPage />
          </ProtectedRoute>
        }
      />

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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
