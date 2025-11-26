// (auth)/action.ts
"use server";

import { DetailError, StudentInsertCommand, StudentInsertResponse } from "EduSmart/api/api-auth-service";
import { destroySession, exchangePassword, getAccessTokenFromCookie, getSidFromCookie, hasRefreshToken, refreshTokens, refreshTokensByUrl, revokeRefreshLocal } from "EduSmart/lib/authServer";
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
    await exchangePassword(email, password);
    const accessToken = await getAccessTokenFromCookie();
    if(accessToken) return { ok: true, accessToken: accessToken};
    return { ok: false, accessToken: null};
  } catch (e: unknown) {
    console.error("lỗi")
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Đăng nhập thất bại" };
  }
}

export async function refreshAction() {
  try {
    const sid = await getSidFromCookie();
    if (!sid) return { ok: false, error: "No session" };
    await refreshTokens(sid);                              // 👈 truyền sid vào đây
    const accessToken = await getAccessTokenFromCookie();  // lấy access mới
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
  try {
    const sid = await getSidFromCookie();
    if (sid) {
      await destroySession(sid);
    }
    return { ok: true };
  } catch (e: unknown) {
    console.error("logoutAction error:", e);
    return { ok: false, error: "Logout failed" };
  }
}

export async function getCurrentTokenAction() {
  try {
    const accessToken = await getAccessTokenFromCookie();
    if (accessToken) {
      return { ok: true, accessToken };
    }
    return { ok: false, error: "No token found" };
  } catch (e: unknown) {
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Failed to get token" };
  }
}

export async function initializeAuthAction() {
  try {
    const accessToken = await getAccessTokenFromCookie();
    const isAuthenticated = await hasRefreshToken();
    
    return {
      ok: true,
      accessToken: accessToken || null,
      isAuthenticated
    };
  } catch (e: unknown) {
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Failed to initialize auth" };
  }
}

export async function getUserIdFromTokenAction() {
  try {
    const { getIdTokenFromCookie } = await import('EduSmart/lib/authServer');
    const idToken = await getIdTokenFromCookie();
    
    if (idToken) {
      // Decode JWT token to get user info
      const tokenParts = idToken.split('.');
      
      if (tokenParts.length === 3) {
        const decodeJwtSegment = (segment: string) => {
          const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
          const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');

          const globalAtob = typeof globalThis.atob === 'function' ? globalThis.atob : undefined;

          if (globalAtob) {
            return globalAtob(padded);
          }

          return Buffer.from(padded, 'base64').toString('utf-8');
        };

        const payload = JSON.parse(decodeJwtSegment(tokenParts[1]));
        
        // Try to find the lecturer/account ID from available fields
        const lecturerAccountId = payload.oi_au_id || payload.accountId || payload.account_id;
        const userId = payload.sub;
        const userRole = payload.role;
        const userName = payload.name;
        const userEmail = payload.email;
        
        
        // CRITICAL FIX: Use the stable 'sub' field that matches the actual Account ID
        // This will make courses created with one session retrievable in future sessions
        const finalLecturerId = userId; // Use stable Account ID from sub field
        
        if (!finalLecturerId) {
          return { ok: false, error: "No lecturer ID found in token" };
        }
        
        return {
          ok: true,
          userId: finalLecturerId,  // This will be used as lecturer ID
          userRole,
          userName,
          userEmail,
          originalUserId: userId,   // Keep original for reference
          accountId: lecturerAccountId,
          idToken: idToken  // Return the actual token for API calls
        };
      } else {
        return { ok: false, error: "Invalid token format" };
      }
    } else {
      return { ok: false, error: "No ID token found - user may need to log in again" };
    }
  } catch (e: unknown) {
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Failed to get user ID from token" };
  }
}

export async function getIdTokenAction() {
  try {
    const { getIdTokenFromCookie } = await import('EduSmart/lib/authServer');
    const idToken = await getIdTokenFromCookie();
    
    if (idToken) {
      return { ok: true, idToken };
    }
    
    return { ok: false, error: "No ID token found" };
  } catch (e: unknown) {
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Failed to get ID token" };
  }
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
  const raw = await resp.text();
  const data = parseJson<StudentInsertResponse>(raw);

  if (resp.ok) {
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

export async function getAccessTokenAction() {
  try {
    const accessToken = await getAccessTokenFromCookie();
    
    if (accessToken) {
      return {
        ok: true,
        accessToken: accessToken
      };
    }
    
    return { ok: false, error: "No access token found" };
  } catch (e: unknown) {
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? (e as { message?: string }).message : undefined;
    return { ok: false, error: errorMessage ?? "Failed to get access token" };
  }
}

export async function getAuthen(): Promise<boolean> {
  return hasRefreshToken();
}

export async function logout() {
  return await revokeRefreshLocal();
}


export async function refreshTokensByUrlAction(refreshToken: string) {
  try {
    
    await refreshTokensByUrl(refreshToken);

    const accessToken = await getAccessTokenFromCookie();
    if (!accessToken) {
      return { ok: false, error: "No access token found after refresh" };
    }

    return { ok: true, accessToken };
  } catch (e: unknown) {
    const errorMessage =
      typeof e === "object" && e !== null && "message" in e
        ? (e as { message?: string }).message
        : undefined;

    return {
      ok: false,
      error: errorMessage ?? "Refresh by URL failed",
    };
  }
}
