import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const DEFAULT_STATE = {
  label: "Checking API",
  toneClass: "text-slate-500",
};

export function useApiHealth() {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        await apiClient.get(API_ENDPOINTS.HEALTH.GATEWAY);

        if (!active) {
          return;
        }

        setState({
          label: "API Online",
          toneClass: "text-emerald-600",
        });
      } catch (error) {
        console.warn("Gateway health check failed", error);

        if (!active) {
          return;
        }

        setState({
          label: "API Unreachable",
          toneClass: "text-rose-600",
        });
      }
    };

    checkHealth();

    const timer = setInterval(checkHealth, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return state;
}
