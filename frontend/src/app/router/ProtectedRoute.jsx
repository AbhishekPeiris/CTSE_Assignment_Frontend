import { Navigate } from "react-router-dom";
import { useAppContext } from "../providers/AppProvider";
import Loader from "../../components/ui/Loader";

export default function ProtectedRoute({ children }) {
  const { auth, isBootstrapping } = useAppContext();

  if (isBootstrapping) {
    return <Loader text="Preparing workspace..." />;
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
