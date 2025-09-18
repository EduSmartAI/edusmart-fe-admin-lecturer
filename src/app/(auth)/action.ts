// (auth)/action.ts
"use server";

import { DetailError, StudentInsertCommand, StudentInsertResponse } from "EduSmart/api/api-auth-service";
import { destroySession, exchangePassword, getAccessTokenFromCookie, getSidFromCookie, hasRefreshToken, refreshTokens, revokeRefreshLocal } from "EduSmart/lib/authServer";
const BACKEND = process.env.NEXT_PUBLIC_API_URL;
export async function loginAction({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  if (!email || !password) return { ok: false, error: "Thiếu email/password" };
  try {
    console.log("[loginAction] Starting login process...")
    const result = await exchangePassword(email, password);
    console.log("[loginAction] exchangePassword completed, result:", result)
    
    // Add a small delay to ensure the session is fully set
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const accessToken = await getAccessTokenFromCookie();
    console.log("[loginAction] Retrieved accessToken:", accessToken ? `${accessToken.slice(0, 10)}...` : 'null')
    
    if(accessToken) {
      console.log("[loginAction] Login successful!")
      return { ok: true, accessToken: accessToken};
    }
    
    // Even if we can't get the token from cookie, the login was successful
    // This might be a timing/cookie issue, so let's check if we have a session
    if (result && result.sid) {
      console.log("[loginAction] Login succeeded but token retrieval failed, attempting direct token access...")
      
      // Try to get the token directly from the session
      try {
        const { loadTokens } = await import('EduSmart/lib/sessionStore');
        const tokens = await loadTokens(result.sid);
        if (tokens?.access) {
          console.log("[loginAction] Successfully retrieved token from session store");
          return { ok: true, accessToken: tokens.access };
        }
      } catch (sessionError) {
        console.error("[loginAction] Session token retrieval failed:", sessionError);
      }
    }
    
    console.warn("[loginAction] No access token found despite successful exchange")
    return { ok: false, error: "Token retrieval failed", accessToken: null};
  } catch (e: unknown) {
    console.error("[loginAction] Login error:", e)
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Đăng nhập thất bại" };
  }
}

export async function refreshAction() {
  try {
    console.log("vao serverrrrrrrrrrrrrr")
    const sid = await getSidFromCookie();
    console.log("sid", sid)
    if (!sid) return { ok: false, error: "No session" };
    await refreshTokens(sid);                              // 👈 truyền sid vào đây
    const accessToken = await getAccessTokenFromCookie();  // lấy access mới
    console.log("new accessToken", accessToken)
    return { ok: true, accessToken };
  } catch (e: unknown) {
    const msg =
      typeof e === "object" && e && "message" in e
        ? (e as { message?: string }).message
        : undefined;
    return { ok: false, error: msg ?? "Đăng nhập thất bại" };
  }
}

export async function logoutAction() {
  const sid = await getSidFromCookie();
  if (sid) {
    await destroySession(sid);  // xóa session + cookie sid
  }
  return { ok: true };
}

async function postJsonPublic(path: string, body: unknown): Promise<Response> {
  const url = `${BACKEND}${path}`;
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    credentials: "omit",
  });
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

type ApiError = {
  message?: string | null;
  title?: string | null;
  error?: string | null;
  detailErrors?: DetailError[] | null;
};

/** Server action: Insert Student (public, no bearer, no any) */
export async function insertStudentAction(
  payload: StudentInsertCommand
): Promise<
  | { ok: true; data: StudentInsertResponse }
  | { ok: false; status?: number; error: string; detailErrors?: DetailError[] | null }
> {
  const resp = await postJsonPublic("/auth/api/v1/InsertStudent", payload);
  console.log("response", resp)
  const raw = await resp.text();
  const data = parseJson<StudentInsertResponse>(raw);

  if (resp.ok) {
    console.log("data response", data)
    if (data?.success) return { ok: true, data };
    return {
      ok: false,
      status: resp.status,
      error: data?.message ?? "Lỗi",
      detailErrors: null,
    };
  }

  const err = parseJson<ApiError>(raw) ?? {};
  return {
    ok: false,
    status: resp.status,
    error: err.message ?? err.title ?? err.error ?? "InsertStudent failed",
    detailErrors: err.detailErrors ?? null,
  };
}

export async function getAuthen(): Promise<boolean> {
  return hasRefreshToken();
}

export async function logout() {
  return await revokeRefreshLocal();
}