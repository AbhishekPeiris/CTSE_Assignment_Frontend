/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authStore } from "../store/authStore";
import apiClient from "../../api/apiClient";
import { API_ENDPOINTS } from "../../api/endpoints";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [auth, setAuth] = useState(authStore.getState());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setAuth(authStore.getState());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      authStore.clearAuth();
    };

    globalThis.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      globalThis.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = authStore.getToken();

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
        const user =
          response?.data?.user ?? response?.data?.data ?? response?.data ?? null;

        authStore.setAuth({
          token,
          user,
        });
      } catch (error) {
        console.warn("Auth bootstrap failed, clearing local session", error);
        authStore.clearAuth();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = ({ user, token }) => {
    authStore.setAuth({ user, token });
  };

  const logout = () => {
    authStore.clearAuth();
  };

  const value = useMemo(
    () => ({
      auth,
      isBootstrapping,
      login,
      logout,
    }),
    [auth, isBootstrapping],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
