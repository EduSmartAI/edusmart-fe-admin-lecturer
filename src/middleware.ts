// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/", // landing
  "/Login",
  "/register",
  "/forgot-password",
  "/_error", // phòng khi lỗi
  "/api/public", // ví dụ
];

const PROTECTED_PREFIXES = [
  "/User",
];

/** Kiểm tra xem pathname có nằm trong PUBLIC_PATHS không */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

/** Kiểm tra xem pathname có cần login không */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function getSidFromReq(req: NextRequest): string | null {
  return (
    req.cookies.get("__Host-sid")?.value ??
    req.cookies.get("sid")?.value ??
    null
  );
}

function getIdTokenFromReq(req: NextRequest): string | null {
  return (
    req.cookies.get("__Host-idt")?.value ??
    null
  );
}

function decodeJwtPayload(jwt: string) {
  const part = jwt.split(".")[1];
  if (!part) return null;
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const json = atob(b64 + pad);
  return JSON.parse(json);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";
  // Allow well-known link preview bots to bypass auth redirects
  // so they can fetch Open Graph/Twitter metadata to render rich previews
  const isCrawler =
    /(facebookexternalhit|Facebot|Twitterbot|Slackbot|TelegramBot|LinkedInBot|Pinterest|Discordbot|WhatsApp|zalo|ZaloOA)/i.test(
      userAgent,
    );

  // Lấy cookie
  const sid = getSidFromReq(req);
  const idt = getIdTokenFromReq(req);
  const claims = idt ? decodeJwtPayload(idt) : null;


  // Nếu đã login rồi mà truy cập /login → redirect về /Admin
  if (isPublicPath(pathname)) {
    if (sid && (pathname.toLowerCase() === "/login" || pathname === "/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/Lecturer";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 1) Bots/crawlers → cho qua to read metadata for link previews
  if (isCrawler) {
    return NextResponse.next();
  }

  // 2) Public paths → cho qua
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 3) Nếu không phải protected → cho qua
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // 4) Protected path mà chưa login → redirect về /login
  if (!sid) {
    const url = req.nextUrl.clone();
    url.pathname = "/404"; // hoặc "/login" tùy UX của bạn
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 5) Đã login, path được phép → cho qua
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
