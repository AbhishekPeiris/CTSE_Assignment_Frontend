import { useContext } from "react";
import { AuthProvider } from "../features/auth/authSlice";

export const useAuth = () => {
    return useContext(AuthProvider);
};