import { useAuth as useFeatureAuth } from "../features/auth/authSlice";

export const useAuth = () => {
    return useFeatureAuth();
};