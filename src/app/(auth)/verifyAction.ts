"use server";

import { rootService } from "EduSmart/lib/apiServer";
import {
  AccountVerifyCommand,
  AccountVerifyResponse,
  DetailError,
} from "EduSmart/api/api-auth-service";

export type VerifyAccountResult =
  | { ok: true; data: AccountVerifyResponse }
  | {
      ok: false;
      status?: number;
      error: string;
      detailErrors?: DetailError[] | null;
    };

export async function verifyAccountAction(
  key: string,
): Promise<VerifyAccountResult> {
  const payload: AccountVerifyCommand = { key: key.trim() };
  try {
    const resp = await rootService.api.v1VerifyAccountCreate(payload);
    const api = resp.data;
    console.log("api response",api)
    if (api?.success === true) {
      return { ok: true, data: api };
    }
    const msg =
      (typeof api?.message === "string" && api.message.trim()) ||
      (api?.messageId ? `Lỗi ${api.messageId}` : "Xác minh tài khoản thất bại");
    return {
      ok: false,
      status: resp?.status ?? 200,
      error: msg,
      detailErrors: api?.detailErrors ?? null,
    };

  } catch (err: unknown) {
    const errorObj = err as { status?: number; error?: unknown; data?: unknown };
    const body = errorObj.error ?? errorObj.data;

    const message =
      (typeof body === "string" && body) ||
      (typeof (body as { message?: string })?.message === "string" && (body as { message?: string }).message) ||
      (body as { title?: string })?.title ||
      "Xác minh tài khoản thất bại";
    return {
      ok: false,
      status: errorObj.status,
      error: message,
      detailErrors: Array.isArray((body as { detailErrors?: DetailError[] })?.detailErrors)
        ? (body as { detailErrors: DetailError[] }).detailErrors
        : null,
    };
  }
}
