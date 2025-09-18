// src/apiClient.ts
import axios, {
  AxiosInstance,
  Method,
  AxiosRequestConfig,
  AxiosError,
} from "axios";
import { Api as AuthEduClientApi } from "EduSmart/api/api-auth-service";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";

// 1) Tạo axios instance chung
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ví dụ: "https://api.emoease.vn"
});

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

axiosInstance.interceptors.request.use((cfg) => {
  const h = axios.AxiosHeaders.from(cfg.headers);
  const base = cfg.baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? '';
  const url = cfg.url ?? '';
  if (base.includes('ngrok') || url.includes('ngrok')) {
    h.set('ngrok-skip-browser-warning', 'true');
  }
  const { token } = useAuthStore.getState();
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
  }
  cfg.headers = h;
  return cfg;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: RetryConfig }) => {
    const status = error.response?.status;
    const originalRequest = error.config!;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 👈 THÊM DÒNG NÀY
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          originalRequest.headers = axios.AxiosHeaders.from(originalRequest.headers);
          (originalRequest.headers).set('Authorization', `Bearer ${newToken}`);
          (originalRequest.headers).set('ngrok-skip-browser-warning', "true");
        }
        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        useValidateStore.getState().setInValid(true);
      }
    }
    if ((status === 403 || status === 418) && !originalRequest._retry) {
      useAuthStore.getState().logout();
      // useAuthStore.persist.clearStorage();
      useValidateStore.getState().setInValid(true);
    }
    return Promise.reject(error);
  },
);
// 2) Adapter để Swagger-client gọi qua axios
const axiosFetch: typeof fetch = async (input, init = {}) => {
  const url = input.toString();

  // Chuẩn hóa headers từ HeadersInit → Record<string,string>
  let headers: Record<string, string> = {};
  if (init.headers instanceof Headers) {
    headers = Object.fromEntries(init.headers.entries());
  } else if (Array.isArray(init.headers)) {
    headers = Object.fromEntries(init.headers);
  } else if (init.headers && typeof init.headers === "object") {
    headers = init.headers as Record<string, string>;
  }

  const params = (init as unknown as { params?: Record<string, unknown> })
    .params;

  const config: AxiosRequestConfig = {
    url,
    method: (init.method as Method) ?? "GET",
    headers,
    data: init.body,
    params,
  };

  const res = await axiosInstance.request(config);

  // Chuyển axios headers thành HeadersInit (Headers)
  const responseHeaders = new Headers();
  Object.entries(res.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => responseHeaders.append(key, String(v)));
    } else if (value != null) {
      responseHeaders.set(key, String(value));
    }
  });

  // Trả về Response giống Fetch API
  return new Response(JSON.stringify(res.data), {
    status: res.status,
    headers: responseHeaders,
  });
};

export const AuthEduClient = new AuthEduClientApi({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
  customFetch: axiosFetch,
});

const apiClient = {
  authEduService: AuthEduClient
};

export default apiClient;
