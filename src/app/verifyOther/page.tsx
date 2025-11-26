import { Suspense } from "react";
import VerifyTokenContent from "./VerifyTokenContent";

export default function VerifyTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Xác thực tài khoản</h1>
            <p className="text-sm text-slate-300">
              Đang tải trang xác thực...
            </p>
          </div>
        </div>
      }
    >
      <VerifyTokenContent />
    </Suspense>
  );
}
