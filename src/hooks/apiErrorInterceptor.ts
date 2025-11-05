import axios from "axios";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

// Setup axios interceptor for better error logging
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log all requests in dev mode
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[API ✓] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      console.error(`[API ✗] Error:`, {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
};
