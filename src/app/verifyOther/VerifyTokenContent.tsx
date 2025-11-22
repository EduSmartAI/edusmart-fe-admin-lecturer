"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

export default function VerifyTokenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const refreshTokenByUrl = useAuthStore((s) => s.refreshTokenByUrl);

  const [message, setMessage] = useState(
    "Đang xác thực token, vui lòng chờ..."
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Thiếu token xác thực trong đường dẫn.");
      return;
    }

    if (!refreshTokenByUrl) {
      setMessage("Hệ thống chưa sẵn sàng để xác thực token.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const ok = await refreshTokenByUrl(token);
        if (cancelled) return;

        if (ok) {
          setMessage("Xác thực thành công, đang chuyển hướng...");
          router.replace("/");
        } else {
          setMessage("Token không hợp lệ hoặc đã hết hạn.");
        }
      } catch (err) {
        console.error("[VerifyTokenPage] error:", err);
        if (!cancelled) {
          setMessage("Có lỗi xảy ra khi xác thực token.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, refreshTokenByUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Xác thực tài khoản</h1>
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </div>
  );
}
