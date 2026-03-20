import { Navigate } from "react-router-dom";
import { useAppContext } from "../providers/AppProvider";
import Loader from "../../components/ui/Loader";
import { canAccessRole, getDefaultRouteForRole } from "../../utils/roleRouting";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { auth, isBootstrapping } = useAppContext();

  if (isBootstrapping) {
    return <Loader text="Preparing workspace..." />;
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRole(auth?.user, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(auth?.user)} replace />;
  }

  return children;
}
