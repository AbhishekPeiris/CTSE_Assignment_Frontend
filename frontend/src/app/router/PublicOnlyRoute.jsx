import { Navigate } from "react-router-dom";
import { useAppContext } from "../providers/AppProvider";
import Loader from "../../components/ui/Loader";
import { getDefaultRouteForRole } from "../../utils/roleRouting";

export default function PublicOnlyRoute({ children }) {
  const { auth, isBootstrapping } = useAppContext();

  if (isBootstrapping) {
    return <Loader text="Loading..." />;
  }

  if (auth?.isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(auth?.user)} replace />;
  }

  return children;
}
