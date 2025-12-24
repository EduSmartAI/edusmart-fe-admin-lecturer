/// <reference lib="dom" />
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import { useValidateStore } from 'EduSmart/stores/Validate/ValidateStore';

/**
 * Payment API Configuration
 */
export interface ApiConfig {
  baseUrl: string;
  customFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

/** Request parameters */
export interface RequestParams {
  secure?: boolean;
  headers?: Record<string, string>;
}

/**
 * HttpClient base for Payment API
 */
export abstract class HttpClient {
  protected baseUrl: string;
  protected customFetch: (
    input: RequestInfo,
    init?: RequestInit,
  ) => Promise<Response>;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.customFetch = config.customFetch ?? fetch;
  }

  protected async request<ResType>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
    params?: RequestParams,
    format: "json" | "text" | "blob" = "json",
  ): Promise<ResType> {
    const url = `${this.baseUrl}${path}`;
    const headers = params?.headers ?? { "Content-Type": "application/json" };

    const requestInit: RequestInit = {
      method,
      headers,
      mode: "cors",
    };

    if (body && (method === "POST" || method === "PUT")) {
      if (body instanceof FormData) {
        delete headers["Content-Type"];
        requestInit.body = body;
      } else {
        requestInit.body = JSON.stringify(body);
      }
    }

    const res = await this.customFetch(url, requestInit);
    if (!res.ok) {
      let errorDetails = '';
      try {
        const errorBody = await res.clone().text();
        console.error('❌ Payment API Error Response:', errorBody);
        errorDetails = errorBody;
        } catch {
          // Ignore
        }
      throw new Error(`HTTP ${res.status} – ${res.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
    if (format === "text") {
      const text = await res.text();
      return text as unknown as ResType;
    }
    if (format === "blob") {
      const blob = await res.blob();
      return blob as unknown as ResType;
    }
    return (await res.json()) as ResType;
  }
}

/**
 * Custom fetch with axios for Payment API
 */
export const paymentAxiosFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = typeof input === "string" ? input : input.toString();
  const { method, headers, body, credentials } = init ?? {};

  // Get access token
  let accessToken: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        accessToken = parsedAuth?.state?.accessToken;
      }
    } catch {
      // Silent error handling
    }

    if (!accessToken) {
      const authState = useAuthStore.getState();
      accessToken = authState.token || null;
    }
  }

  // Prepare headers with access token
  let requestHeaders = headers as Record<string, string> || {};

  if (accessToken) {
    requestHeaders = {
      ...requestHeaders,
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  // Add ngrok headers if needed
  const baseURL = resolvePaymentBaseUrl();
  if (baseURL.includes('ngrok') || url.includes('ngrok')) {
    requestHeaders['ngrok-skip-browser-warning'] = 'true';
  }

  const config: AxiosRequestConfig = {
    url,
    method: method as AxiosRequestConfig["method"],
    headers: requestHeaders,
    data: body,
    withCredentials: credentials === "include",
  };

  const axiosInstance = axios.create({
    baseURL: resolvePaymentBaseUrl(),
  });

  axiosInstance.interceptors.request.use((cfg) => {
    const h = axios.AxiosHeaders.from(cfg.headers);
    const base = cfg.baseURL ?? resolvePaymentBaseUrl();
    const reqUrl = cfg.url ?? '';

    if (base.includes('ngrok') || reqUrl.includes('ngrok')) {
      h.set('ngrok-skip-browser-warning', 'true');
    }

    const currentToken = useAuthStore.getState().token;
    const existingAuth = h.get('Authorization');

    if (currentToken && !existingAuth) {
      h.set('Authorization', `Bearer ${currentToken}`);
    }

    cfg.headers = h;
    return cfg;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: any) => {
      const status = error.response?.status;
      const originalRequest = error.config;

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshAction } = await import('EduSmart/app/(auth)/action');
          const refreshResult = await refreshAction();

          if (refreshResult.ok && refreshResult.accessToken) {
            originalRequest.headers = {
              ...originalRequest.headers,
              'Authorization': `Bearer ${refreshResult.accessToken}`,
            };

            return axiosInstance.request(originalRequest);
          }
        } catch {
          useAuthStore.getState().logout();
          useValidateStore.getState().setInValid(true);
        }
      }

      if ((status === 403 || status === 418) && !originalRequest._retry) {
        useAuthStore.getState().logout();
        useValidateStore.getState().setInValid(true);
      }

      return Promise.reject(error);
    },
  );

  const res: AxiosResponse = await axiosInstance(config);
  const blob = new Blob([JSON.stringify(res.data)], {
    type: "application/json",
  });
  return new Response(blob, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers as HeadersInit,
  });
};

/**
 * Resolve Payment Base URL
 */
function resolvePaymentBaseUrl(): string {
  // Use hardcoded URL as per the provided API
  return 'https://api.edusmart.pro.vn/payment';
}

// Payment DTOs
export enum PaymentStatus {
  Pending = 1,
  Paid = 2,
  Failed = 3,
  SystemError = 4
}

export interface OrderItemDto {
  orderItemId: string;
  courseId: string;
  courseTitleSnapshot: string;
  courseImageUrlSnapshot: string;
  priceSnapshot: number;
  dealPriceSnapshot: number;
  finalPrice: number;
  quantity: number;
}

export interface DetailError {
  field?: string;
  messageId?: string;
  errorMessage?: string;
}

export interface OrderInfoDto {
  subtotalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paidAt: string | null;
  orderItems: OrderItemDto[];
}

export interface PaymentHistoryItemDto {
  paymentId: string;
  orderId: string;
  gateway: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  statusName: string;
  returnCode: string | null;
  returnMessage: string | null;
  createdAt: string;
  updatedAt: string;
  orderInfo: OrderInfoDto;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: DetailError[] | null;
}

export type GetTotalAmountsResponse = ApiResponse<number>;
export type GetPaymentHistoryResponse = ApiResponse<PaginatedResult<PaymentHistoryItemDto>>;

export interface GetPaymentHistoryQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: PaymentStatus;
  fromDate?: string; // Format: yyyy-MM-dd
  toDate?: string; // Format: yyyy-MM-dd
}

/**
 * Payment API Module
 */
export class ApiPaymentModule extends HttpClient {
  constructor(config: ApiConfig) {
    super(config);
  }

  payment = {
    /**
     * @description Lấy tổng số tiền thanh toán
     * @request GET:/api/v1/Payment/SelectAmounts
     */
    getTotalAmounts: (params?: RequestParams) => {
      return this.request<GetTotalAmountsResponse>(
        '/api/v1/Payment/SelectAmounts',
        "GET",
        undefined,
        params
      );
    },

    /**
     * @description Lấy lịch sử thanh toán với phân trang và bộ lọc
     * @request GET:/api/v1/Payment/SelectPaymentHistory
     */
    getPaymentHistory: (query?: GetPaymentHistoryQuery, params?: RequestParams) => {
      const queryParams: Record<string, any> = {
        pageNumber: query?.pageNumber || 1,
        pageSize: query?.pageSize || 10,
      };

      if (query?.status !== undefined) {
        queryParams.status = query.status;
      }
      if (query?.fromDate) {
        queryParams.fromDate = query.fromDate;
      }
      if (query?.toDate) {
        queryParams.toDate = query.toDate;
      }

      const queryString = new URLSearchParams(
        Object.entries(queryParams)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString();

      const path = `/api/v1/Payment/SelectPaymentHistory?${queryString}`;
      return this.request<GetPaymentHistoryResponse>(path, "GET", undefined, params);
    },
  };
}

// Create payment service instance
const paymentService = new ApiPaymentModule({
  baseUrl: resolvePaymentBaseUrl(),
  customFetch: paymentAxiosFetch,
});

// Export service
export const paymentServiceAPI = {
  getTotalAmounts: paymentService.payment.getTotalAmounts,
  getPaymentHistory: paymentService.payment.getPaymentHistory,
  payment: paymentService.payment,
};

