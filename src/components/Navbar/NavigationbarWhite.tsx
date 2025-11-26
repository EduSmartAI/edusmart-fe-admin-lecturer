"use client";
import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "antd";
import { useSpring, useTransition, animated } from "@react-spring/web";
import { ThemeSwitch } from "../Themes/Theme";
import { usePathname, useRouter } from "next/navigation";
import { Kaushan_Script } from "next/font/google";
// import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import UserMenu from "./UserMenu";
import "@ant-design/v5-patch-for-react-19";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

const kaushan = Kaushan_Script({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default function Navigationbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthed = useAuthStore((s) => s.isAuthen);
  const getAuthen = useAuthStore((s) => s.getAuthen);

  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getAuthen();
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getAuthen]);

  const { logout } = useAuthStore();

  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const [elevated, setElevated] = useState(false);

  const menuItems = [
    { key: "home", label: "Trang chủ", href: "/home" },
    { key: "jobs", label: "Khóa học", href: "/course" },
    { key: "contact", label: "Liên hệ chúng tôi", href: "/contact" },
    { key: "match", label: "Công việc phù hợp cho bạn", href: "/my-job" },
    { key: "quiz", label: "Quiz", href: "/quiz" },
    { key: "login", label: "Đăng nhập", button: true, type: "link" },
    { key: "signup", label: "Đăng Ký", button: true, type: "primary" },
  ];

  const activeItem =
    menuItems
      .slice(0, 5)
      .find((item) => pathname.startsWith(item.href ?? "")) || menuItems[0];
  const currentKey = activeItem.key;

  const [underline, api] = useSpring(() => ({
    x: 0,
    width: 0,
    config: { mass: 1, tension: 400, friction: 20 },
  }));

  useLayoutEffect(() => {
    if (!showNav) return;
    const el = document.querySelector<HTMLElement>(
      `a[data-key="${currentKey}"]`,
    );
    if (!el) return;
    const targetX = el.offsetLeft;
    const targetW = el.offsetWidth;
    api.start({
      to: async (next) => {
        await next({ width: 0, x: targetX + targetW / 2, immediate: true });
        await next({ x: targetX, width: targetW });
      },
    });
  }, [currentKey, showNav, api]);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10); // >2px coi như đã cuộn
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick =
    (href: string, key: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      const el = document.querySelector<HTMLElement>(`a[data-key="${key}"]`);
      if (!el) {
        router.push(href);
        return;
      }
      const targetX = el.offsetLeft;
      const targetW = el.offsetWidth;
      api.start({
        to: async (next) => {
          next({ width: 0, x: targetX + targetW / 2 });
          await router.push(href);
        },
        config: { mass: 1, tension: 400, friction: 20 },
      });
    };

  const transitions = useTransition(isOpen ? menuItems : [], {
    keys: (item) => item.key,
    from: { opacity: 0, transform: "translate3d(0,-10px,0)" },
    enter: { opacity: 1, transform: "translate3d(0,0px,0)" },
    leave: { opacity: 0, transform: "translate3d(0,-10px,0)" },
    trail: 100,
    config: { tension: 300, friction: 20 },
  });
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setShowNav(currentY <= lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linksRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // 3) HÀM đo lại underline (giữ nguyên như cậu đang có):
  const recalcUnderline = React.useCallback(() => {
    const el = linkRefs.current[currentKey];
    const wrap = linksRef.current;
    if (!el || !wrap) return;

    const elRect = el.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const x = elRect.left - wrapRect.left;
    const w = elRect.width;

    api.start({
      to: async (next) => {
        await next({ width: 0, x: x + w / 2, immediate: true });
        await next({ x, width: w });
      },
    });
  }, [currentKey, api]);

  // 4) Re-calc khi mount / resize / fonts:
  useLayoutEffect(() => {
    recalcUnderline();
    const ro = new ResizeObserver(recalcUnderline);
    if (linksRef.current) ro.observe(linksRef.current);
    window.addEventListener("resize", recalcUnderline);
    document.fonts?.ready?.then(() => recalcUnderline());
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalcUnderline);
    };
  }, [recalcUnderline, isAuthed, showNav]);

  const setLinkRef = React.useCallback(
    (key: string) => (el: HTMLAnchorElement | null) => {
      linkRefs.current[key] = el;
    },
    [],
  );

  useEffect(() => {
    if (!navRef.current) return;
    const navHeight = navRef.current.getBoundingClientRect().height;
    const SCROLL_THRESHOLD = 5;

    const onMouseMove = (e: MouseEvent) => {
      const y = window.scrollY;
      const cursorY = e.clientY;

      if (y <= SCROLL_THRESHOLD) {
        setShowNav(true);
      } else if (cursorY <= navHeight) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const DesktopAuthSkeleton = () => (
    <div className="hidden xl:block">
      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
  );

  return (
    <nav
      suppressHydrationWarning
      onMouseEnter={() => setShowNav(true)}
      ref={navRef}
      className={[
        "fixed top-0 left-0 w-full z-50 transition-transform duration-300",
        showNav ? "translate-y-0" : "-translate-y-full",
        // nền
        "bg-zinc-50/95 dark:bg-[#0b1220]/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
        "border-b border-zinc-200/80 dark:border-zinc-800/70",

        // viền hairline đồng bộ card/filter
        "border-b border-zinc-200/80 dark:border-zinc-800/70",

        // bóng dịu khi ở top, đậm hơn khi scroll
        elevated
          ? "shadow-[0_8px_20px_-12px_rgba(17,24,39,0.25)] ring-1 ring-black/5"
          : "shadow-[0_1px_0_0_rgba(17,24,39,0.06)]",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Image
              src="https://rubicmarketing.com/wp-content/uploads/2022/07/y-nghia-logo-fpt-lan-3.jpg"
              alt="Logo"
              width={28}
              height={28}
              className="!w-auto !h-auto"
            />
            <span
              className={`${kaushan.className} text-3xl cursor-pointer dark:text-white`}
            >
              EduSmart
            </span>
          </div>
          <div
            ref={linksRef}
            className="hidden xl:flex flex-1 justify-center items-center relative mx-20"
          >
            {menuItems.slice(0, 5).map((item) => {
              const isActive = item.key === currentKey;
              return (
                <a
                  ref={setLinkRef(item.key)}
                  key={item.key}
                  href={item.href}
                  data-key={item.key}
                  onClick={handleNavClick(item.href!, item.key)}
                  className={`inline-block mx-4 pb-2 text-base tracking-wide transition-all duration-500 whitespace-nowrap ${
                    isActive
                      ? "text-black dark:text-white font-semibold"
                      : "text-black dark:text-white hover:font-bold"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <animated.div
              className="absolute bottom-0 left-0 h-0.5 bg-blue-500 rounded pointer-events-none"
              style={{ left: underline.x, width: underline.width }}
            />
          </div>
          {!authReady ? ( // (tuỳ chọn) skeleton trong lúc chờ xác thực
            <DesktopAuthSkeleton />
          ) : isAuthed ? (
            <div className="hidden xl:block">
              {" "}
              <UserMenu />{" "}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3 ml-8">
              <ThemeSwitch />
              <button
                onClick={() => router.push("/Login")}
                className="flex items-center justify-center h-12 px-6 border-2 border-white text-white font-medium text-base whitespace-nowrap rounded-full transition-all duration-300 hover:bg-white hover:text-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white "
              >
                Đăng nhập
              </button>
              <button
                onClick={() => router.push("/Signup")}
                className="flex items-center justify-center h-12 px-6 bg-gradient-to-r from-[#5da38f] to-[#4a8a7a] text-white font-medium text-base whitespace-nowrap rounded-full shadow-lg transition-all duration-300 hover:from-[#4a8a7a] hover:to-[#5da38f] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5da38f]"
              >
                Đăng Ký
              </button>
            </div>
          )}
          {/* Hamburger menu for mobile view */}
          <div className="xl:hidden">
            <button
              suppressHydrationWarning
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="xl:hidden px-3 py-4">
          <div
            className="
        rounded-2xl border shadow-xl backdrop-blur-md
        bg-white/80 dark:bg-slate-900/80
        border-slate-200/70 dark:border-slate-700/60
        max-h-[70vh] overflow-auto overscroll-contain
      "
          >
            {/* Header tài khoản + ThemeSwitch (nếu đã đăng nhập) */}
            {isAuthed ? (
              <>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://i.pravatar.cc/100?img=3"
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="leading-tight">
                      <div className="text-slate-900 dark:text-white font-semibold">
                        Duy Anh Trần
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        @duyanh15104
                      </div>
                    </div>
                  </div>

                  {/* Switch nằm trong “chip” để đồng bộ 2 theme */}
                  <div
                    className="rounded-lg px-2 py-1 ring-1
                            bg-slate-100 dark:bg-slate-800
                            ring-slate-200 dark:ring-slate-700"
                  >
                    <ThemeSwitch />
                  </div>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
              </>
            ) : (
              <div className="flex justify-center p-3">
                <ThemeSwitch />
              </div>
            )}

            {/* Danh sách điều hướng */}
            <div className="px-2 py-2">
              {transitions((style, item) => {
                const isActive = item.key === currentKey;

                // Ẩn nút Login/Signup khi đã đăng nhập
                if (isAuthed && item.button) return null;

                if (item.button) {
                  // UI nút khi chưa đăng nhập (giữ nguyên logic)
                  const btnProps = {
                    className:
                      item.type === "link"
                        ? `p-0 text-base transition-colors duration-200
                      ${
                        isActive
                          ? "text-emerald-400 font-semibold"
                          : "text-emerald-500 hover:text-emerald-400"
                      }`
                        : `w-full text-base transition-colors duration-200
                      ${
                        isActive
                          ? "bg-emerald-600 font-semibold"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      } text-white rounded-xl`,
                    onClick: () => {
                      closeMenu();
                      router.push(item.key === "login" ? "/Login" : "/Signup");
                    },
                  };
                  return (
                    <animated.div key={item.key} style={style} className="mb-2">
                      <Button
                        type={item.type === "link" ? "link" : "primary"}
                        {...btnProps}
                      >
                        {item.label}
                      </Button>
                    </animated.div>
                  );
                }

                // Link thường
                return (
                  <animated.div key={item.key} style={style} className="mb-1.5">
                    <button
                      onClick={() => {
                        closeMenu();
                        router.push(item.href!);
                      }}
                      className={[
                        "w-full text-left px-3 py-2 rounded-lg transition-colors",
                        "!text-slate-700 dark:text-slate-300",
                        "hover:!bg-slate-100 dark:hover:bg-slate-800/60",
                        isActive &&
                          "bg-slate-100 dark:bg-slate-800 !text-slate-900 dark:text-white " +
                            "font-semibold ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  </animated.div>
                );
              })}
            </div>

            {/* Action nhóm cuối khi đã đăng nhập */}
            {isAuthed && (
              <>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-3" />
                <div className="grid grid-cols-3 gap-2 p-3">
                  <button
                    onClick={() => {
                      closeMenu();
                      router.push("/account");
                    }}
                    className="h-10 rounded-full px-4 text-sm font-medium
                         !text-slate-700 dark:!text-slate-200
                         border border-slate-300 dark:border-slate-700
                         hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Tài khoản
                  </button>
                  <button
                    onClick={() => {
                      closeMenu();
                      router.push("/settings");
                    }}
                    className="h-10 rounded-full px-4 text-sm font-medium
                         !text-slate-700 dark:!text-slate-200
                         border border-slate-300 dark:border-slate-700
                         hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cài đặt
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      closeMenu();
                      window.location.href = "/Login";
                    }}
                    className="h-10 rounded-full px-4 text-sm font-semibold text-white
                         bg-rose-500 hover:bg-rose-600 shadow-sm transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
