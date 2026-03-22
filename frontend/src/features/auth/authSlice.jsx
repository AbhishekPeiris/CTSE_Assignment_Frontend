import { useAppContext } from "../../app/providers/AppProvider";
import { AuthService } from "../../services/auth.service";
import {
  asEntity,
  getTokenFromAuthPayload,
  getUserFromAuthPayload,
} from "../../utils/helpers";

export function useAuth() {
  const { auth, login, logout } = useAppContext();

  const loginUser = async (credentials) => {
    const payload = await AuthService.login(credentials);
    const token = getTokenFromAuthPayload(payload);

    if (!token) {
      throw new Error("Token not found in login response");
    }

    let user = getUserFromAuthPayload(payload) || { contactNumber: credentials?.contactNumber || "" };

    login({
      token,
      user,
    });

    if (!getUserFromAuthPayload(payload)) {
      try {
        const mePayload = await AuthService.getCurrentUser();
        user = asEntity(mePayload, ["user"]) || user;
        login({ token, user });
      } catch (error) {
        console.warn("Unable to hydrate current user after login", error);
      }
    }

    return payload;
  };

  const registerUser = async (userData) => {
    const payload = await AuthService.register(userData);
    const token = getTokenFromAuthPayload(payload);

    if (token) {
      const user = getUserFromAuthPayload(payload) || {
        name: userData?.name || "",
        contactNumber: userData?.contactNumber || "",
        role: "USER",
      };

      login({ token, user });
    }

    return payload;
  };

  return {
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth?.isAuthenticated),
    loginUser,
    registerUser,
    logout,
  };
}
