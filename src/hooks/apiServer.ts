// // src/apiClient.server.ts
// 'use server';

// import axios, { AxiosInstance, Method, AxiosRequestConfig, AxiosError } from "axios";
// import { Api as PaymentApi } from "EduSmart/api/api-payment-service";
// import { Api as ProfileApi } from "EduSmart/api/api-profile-service";
// import { Api as AuthApi } from "EduSmart/api/api";
// import { Api as SubscriptionApi } from "EduSmart/api/api-subscription-service";
// import { Api as AuthEduClientApi } from "EduSmart/api/api-auth-service";

// // CHỈ import module server ở đây
// import { getAuthHeaderFromCookie, refreshTokens, getBearerForSid } from "EduSmart/lib/authServer";
// import { cookies } from "next/headers";

// type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

// const BASE = process.env.API_URL || "";

// function makeAxios(): AxiosInstance {
//   return axios.create({ baseURL: BASE, withCredentials: true });
// }
// const axiosServer = makeAxios();

// axiosServer.interceptors.request.use(async (cfg) => {
//   if (!cfg.headers?.Authorization) {
//     const header = await getAuthHeaderFromCookie();
//     if (header) cfg.headers = { ...(cfg.headers || {}), ...header };
//   }
//   return cfg;
// });

// axiosServer.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError & { config?: RetryConfig }) => {
//     const status = error.response?.status;
//     const original = error.config!;
//     if (status === 401 && !original._retry) {
//       try {
//         const sid = (await cookies()).get("__Host-sid")?.value;
//         if (sid) {
//           await refreshTokens(sid);
//           const bearer = await getBearerForSid(sid);
//           if (bearer) {
//             original._retry = true;
//             original.headers = { ...(original.headers || {}), Authorization: bearer };
//             return axiosServer(original);
//           }
//         }
//       } catch { /* fallthrough */ }
//     }
//     return Promise.reject(error);
//   }
// );

// const axiosFetch: typeof fetch = async (input, init = {}) => {
//   const url = input.toString();
//   let headers: Record<string, string> = {};
//   if (init.headers instanceof Headers) headers = Object.fromEntries(init.headers.entries());
//   else if (Array.isArray(init.headers)) headers = Object.fromEntries(init.headers);
//   else if (init.headers && typeof init.headers === "object") headers = init.headers as Record<string, string>;

//   const params = (init as any).params as Record<string, unknown> | undefined;
//   const res = await axiosServer.request({
//     url,
//     method: (init.method as Method) ?? "GET",
//     headers,
//     data: init.body,
//     params,
//   });

//   const responseHeaders = new Headers();
//   Object.entries(res.headers).forEach(([k, v]) => {
//     if (Array.isArray(v)) v.forEach((x) => responseHeaders.append(k, String(x)));
//     else if (v != null) responseHeaders.set(k, String(v));
//   });

//   return new Response(typeof res.data === "string" ? res.data : JSON.stringify(res.data), {
//     status: res.status,
//     headers: responseHeaders,
//   });
// };

// const base = BASE || "";
// export const paymentClient = new PaymentApi<null>({ baseUrl: `${base}/payment-service`, customFetch: axiosFetch });
// export const authService   = new AuthApi({ baseUrl: `${base}/auth-service`, customFetch: axiosFetch });
// export const profileClient = new ProfileApi({ baseUrl: `${base}/profile-service`, customFetch: axiosFetch });
// export const subscriptionClient = new SubscriptionApi({ baseUrl: `${base}/subscription-service`, customFetch: axiosFetch });
// export const authEduService = new AuthEduClientApi({ baseUrl: `${base}/auth`, customFetch: axiosFetch });

// const apiClient = { paymentService: paymentClient, authService, profileService: profileClient, subscriptionService, authEduService };
// export default apiClient;
