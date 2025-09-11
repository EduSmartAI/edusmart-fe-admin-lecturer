// src/lib/apiServer.ts
// Wrapper cho client swagger-typescript-api (fetch-based)

import { Agent, setGlobalDispatcher } from "undici";
import {
  Api as AuthApi,
} from "EduSmart/api/api-auth-service"; // <-- đường dẫn tới file đã gen
import {
  getAuthHeaderFromCookie,
  getSidFromCookie,
  refreshTokens,
} from "./authServer"; // file cậu đã dán ở trên

const BACKEND = process.env.API_URL!;

// Dev: tạm bỏ verify TLS self-signed
if (process.env.NODE_ENV !== "production") {
  const agent = new Agent({ connect: { rejectUnauthorized: false } });
  setGlobalDispatcher(agent);
}

// customFetch: nếu 401 -> refresh -> retry 1 lần
const with401Retry: typeof fetch = async (input, init) => {
  const resp = await fetch(input, { cache: "no-store", ...init });
  if (resp.status !== 401) return resp;

  const sid = await getSidFromCookie();
  if (!sid) return resp;

  try {
    await refreshTokens(sid);
    const auth = await getAuthHeaderFromCookie();
    return fetch(input, {
      ...init,
      headers: { ...(init?.headers || {}), ...(auth || {}) },
      cache: "no-store",
    });
  } catch {
    return resp;
  }
};

// Tạo 2 instance: 
//  - authService: baseUrl = `${BACKEND}/auth` (token, session, logout)
//  - rootService: baseUrl = `${BACKEND}` (các route /api/..., ví dụ InsertStudent)

export const authService = new AuthApi({
  baseUrl: `${BACKEND}/auth`,
  customFetch: with401Retry,
  baseApiParams: { credentials: "include" },
  securityWorker: async () => {
    const auth = await getAuthHeaderFromCookie();
    return { headers: auth ?? {} };
  },
});

export const rootService = new AuthApi({
  baseUrl: `${BACKEND}/auth`,
  customFetch: with401Retry,
  baseApiParams: { credentials: "include" },
  securityWorker: async () => {
    const auth = await getAuthHeaderFromCookie();
    return { headers: auth ?? {} };
  },
});
