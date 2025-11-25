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
  "/Lecturer",
  "/Admin",
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
    req.cookies.get("idt")?.value ??
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
  console.log('Token claims:', claims);

  // Nếu truy cập root "/" mà chưa có token hoặc không có role → redirect về /Login
  if (pathname === "/" && (!sid || !idt || !claims?.role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/Login";
    return NextResponse.redirect(url);
  }

  // Nếu đã login với role hợp lệ mà truy cập /login hoặc / → redirect về home based on role
  if (sid && idt && claims?.role && (pathname.toLowerCase() === "/login" || pathname === "/")) {
    const url = req.nextUrl.clone();
    const role = claims.role;
    const roleLower = typeof role === 'string' ? role.toLowerCase() : '';
    
    console.log('Redirecting user with role:', role, '(lowercase:', roleLower + ')');
    
    if (roleLower === 'lecturer' || roleLower === 'teacher') {
      url.pathname = "/Lecturer";
    } else if (roleLower === 'admin') {
      url.pathname = "/Admin";
    } else {
      // Only Admin and Lecturer allowed - invalid role, redirect to login
      console.log('Unknown role, redirecting to login:', role);
      url.pathname = "/Login";
    }
    
    return NextResponse.redirect(url);
  }

  // 1) Bots/crawlers → cho qua to read metadata for link previews
  if (isCrawler) {
    return NextResponse.next();
  }

  // 2) Public paths → cho qua
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 3) Protected path mà chưa login → redirect về /Login
  if (isProtectedPath(pathname) && !sid) {
    const url = req.nextUrl.clone();
    url.pathname = "/Login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4) Check role-based access for protected paths - Only Admin and Lecturer allowed
  if (isProtectedPath(pathname) && sid && claims) {
    const role = claims.role;
    const roleLower = typeof role === 'string' ? role.toLowerCase() : '';
    
    // Only allow Lecturer and Admin roles
    if (roleLower !== "lecturer" && roleLower !== "admin" && roleLower !== "teacher") {
      const url = req.nextUrl.clone();
      url.pathname = "/Login";
      return NextResponse.redirect(url);
    }
    
    // Lecturer can access Lecturer pages, Admin can access both
    if (pathname.startsWith("/Lecturer") && roleLower !== "lecturer" && roleLower !== "admin" && roleLower !== "teacher") {
      const url = req.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.redirect(url);
    }
    
    // Only Admin can access Admin pages
    if (pathname.startsWith("/Admin") && roleLower !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.redirect(url);
    }
  }

  // 5) Đã login, path được phép → cho qua
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
