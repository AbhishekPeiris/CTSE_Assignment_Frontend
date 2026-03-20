import { resolveRole } from "./helpers";

export const ROLE_LANDING_PATHS = {
    USER: "/",
    ADMIN: "/admin-portal",
    DELIVERY: "/delivery-portal",
};

export const getDefaultRouteForRole = (userOrRole) => {
    const normalizedRole =
        typeof userOrRole === "string" ? String(userOrRole).toUpperCase() : resolveRole(userOrRole);

    return ROLE_LANDING_PATHS[normalizedRole] || "/";
};

export const canAccessRole = (user, allowedRoles = []) => {
    if (!allowedRoles?.length) {
        return true;
    }

    const role = resolveRole(user);
    return allowedRoles.includes(role);
};
