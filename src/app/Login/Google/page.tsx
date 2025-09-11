"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function LoginPage() {
  const onGoogleSuccess = async (resp: CredentialResponse) => {
    const idToken = resp?.credential; // JWT ID Token từ Google One Tap/Button
    console.log("idToken ở đây",idToken)
    // thành công: điều hướng về app
    // window.location.href = "/";
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>
        {/* Nút có sẵn từ Google */}
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => alert("Google login lỗi")}
          useOneTap // tuỳ chọn: bật One Tap popup
        />
      </div>
    </main>
  );
}
