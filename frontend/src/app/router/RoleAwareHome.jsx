import { Navigate } from "react-router-dom";
import { useAppContext } from "../providers/AppProvider";
import Loader from "../../components/ui/Loader";
import { resolveRole } from "../../utils/helpers";
import { getDefaultRouteForRole } from "../../utils/roleRouting";
import StorefrontPage from "../../features/client/pages/StorefrontPage";

export default function RoleAwareHome() {
    const { auth, isBootstrapping } = useAppContext();

    if (isBootstrapping) {
        return <Loader text="Preparing storefront..." />;
    }

    const role = resolveRole(auth?.user);

    if (auth?.isAuthenticated && (role === "ADMIN" || role === "DELIVERY")) {
        return <Navigate to={getDefaultRouteForRole(role)} replace />;
    }

    return <StorefrontPage />;
}
