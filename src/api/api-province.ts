/// <reference lib="dom" />

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Cấu hình chung cho mọi API client
 */
export interface ApiConfig {
  baseUrl: string;
  customFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

/** Tham số mở rộng cho request */
export interface RequestParams {
  secure?: boolean;
  headers?: Record<string, string>;
}

export interface Ward {
  ward_name: string;
  ward_code: string;
  province_code: string;
  province_name: string;
  province_short_name: string;
  province_code_short: string;
  place_type: string;
  has_merger: boolean;
  old_units: string[];
  old_units_count: number;
  merger_details: string;
  province_is_merged: boolean;
  province_merged_with: string[];
  administrative_center: string;
}

/**
 * HttpClient base dùng fetch hoặc axiosFetch để gọi API
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
    method: "GET",
    params?: RequestParams,
    format: "json" | "text" | "blob" = "json",
  ): Promise<ResType> {
    const url = `${this.baseUrl}${path}`;
    const headers = params?.headers ?? { "Content-Type": "application/json" };
    const res = await this.customFetch(url, { method, headers, mode: "cors" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} – ${res.statusText}`);
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
 * customFetch sử dụng axios bên trong, nhưng trả về đối tượng Response để tương thích fetch API
 */
export const axiosFetch = async (
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> => {
  const url = typeof input === "string" ? input : input.toString();
  const { method, headers, body, credentials } = init ?? {};

  const config: AxiosRequestConfig = {
    url,
    method: method as AxiosRequestConfig["method"],
    headers: headers as AxiosRequestConfig["headers"],
    data: body,
    withCredentials: credentials === "include",
  };

  const res: AxiosResponse = await axios(config);
  const blob = new Blob([JSON.stringify(res.data)], {
    type: "application/json",
  });
  return new Response(blob, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers as HeadersInit,
  });
};

/** Kiểu dữ liệu tỉnh/thành */
export interface Province {
  province_code: string;
  name: string;
}

/**
 * Module gọi API thứ ba (34tinhthanh.com)
 */
export class ApiThirdModule extends HttpClient {
  constructor(config: ApiConfig) {
    super(config);
  }

  provinces = {
    getAll: (params?: RequestParams) =>
      this.request<Province[]>("/provinces", "GET", params),
  };

  wards = {
    /**
     * @description Lấy danh sách phường/xã theo province_code
     * @request GET:/wards?province_code={code}
     */
    getAll: (province_code: string, params?: RequestParams) =>
      this.request<Ward[]>(
        `/wards?province_code=${province_code}`,
        "GET",
        params,
      ),
  };
  search = {
    /**
     * @description Tìm kiếm phường/xã (theo q)
     * @request GET:/search?q={q}
     */
    getInfo: (q: string, params?: RequestParams) =>
      this.request<Ward[]>(`/search?q=${encodeURIComponent(q)}`, "GET", params),
  };
}
