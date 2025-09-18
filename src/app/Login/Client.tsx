"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Segmented, Tooltip } from "antd";
import Image from "next/image";
// Temporarily disable react-spring to fix stack overflow
// import { useSpring, useTrail, animated, easings } from "@react-spring/web";
import { SafeAnimatedDiv } from "EduSmart/utils/safeAnimations";

// Temporary safe replacements to prevent stack overflow
const useSpring = (config: any) => [{ y: 100, opacity: 1, transform: 'scale(1)' }, { start: () => {}, stop: () => {} }];
const useTrail = (count: number, config: any) => Array(count).fill({ opacity: 1, transform: 'translate3d(0,0,0)' });
const animated = { div: SafeAnimatedDiv };
const easings = { easeOutCubic: (t: number) => t, easeInCubic: (t: number) => t };
import BaseControlTextField from "EduSmart/components/BaseControl/BasecontrolTextField";
import { ThemeSwitch } from "EduSmart/components/Themes/Theme";
import bgQuestion from "EduSmart/assets/FPT_Logo_Background.jpg";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { isAxiosError } from "axios";
import BubbleBackground from "EduSmart/components/Bubble/BubbleBackground";
import { useRouter } from "next/navigation";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import Loading from "EduSmart/components/Loading/Loading";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";
import { Lobster } from "next/font/google";
import "./styles/login.styles.css";
import { FiArrowLeft } from "react-icons/fi";

const xmlColumns = {
  email: { id: "email", name: "Email", rules: "required" },
  password: { id: "password", name: "Mật khẩu", rules: "required" },
} as const;

type LoginFormValues = { email: string; password: string };

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
});

export default function LoginPage() {
  const messageApi = useNotification();
  const [form] = Form.useForm<LoginFormValues>();
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<"login" | "register">("login");
  const [skipMountAnim, setSkipMountAnim] = useState(false);
  const [showFormBySwipeRun, setShowFormBySwipeRun] = useState<boolean>(true);
  const [showWipe, setShowWipe] = useState(false);
  // Temporarily disable wipe animation to prevent stack overflow
  const wipeStyles = { y: 100, opacity: 1, transform: 'translate3d(0, 100%, 0)' };
  const wipeApi = { 
    start: (config?: any) => {}, 
    stop: () => {}, 
    set: (values?: any) => {} 
  };
  const didRunRef = useRef(false);

  useEffect(() => {
    const SetForm = async () => {
      const seen =
        typeof window !== "undefined" &&
        sessionStorage.getItem("authMountOnce") === "1";
      if (seen) {
        setShowFormBySwipeRun(false);
      }
      await setShowForm(true);
    };
    SetForm();
  }, []);

  useEffect(() => {
    router.prefetch("/Register"); // tải sẵn chunk của trang Register
  }, [router]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (e.persisted || nav?.type === "reload") {
        sessionStorage.removeItem("authMountOnce");
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    const seen =
      typeof window !== "undefined" &&
      sessionStorage.getItem("authMountOnce") === "1";

    setSkipMountAnim(seen);
    if (!seen || didRunRef.current) return;
    didRunRef.current = true;

    setShowWipe(true);

    requestAnimationFrame(() => {
      // Dừng animation đang chạy (nếu có) rồi set tức thời vị trí start
      wipeApi.stop();
      wipeApi.set({ y: -100 }); // <-- KHÔNG có immediate ở đây

      requestAnimationFrame(() => {
        wipeApi.start({
          to: [
            { y: 0, config: { duration: 700, easing: easings.easeOutCubic } },
            { y: 100, config: { duration: 550, easing: easings.easeInCubic } },
          ],
          onRest: () => setShowWipe(false),
        });
      });
    });
    setTimeout(() => {
      setShowFormBySwipeRun(true);
    }, 500);
  }, [wipeApi]);

  const onFinish = async (values: LoginFormValues) => {
    try {
      useLoadingStore.getState().showLoading();
      const isOK = await login(values.email, values.password);
      if (isOK) {
        messageApi.success("Đăng nhập thành công!");
        router.push("/Lecturer");
        useLoadingStore.getState().hideLoading();
        return;
      }
      messageApi.error("Đăng nhập thất bại, vui lòng kiểm tra lại email/mật khẩu");
      useLoadingStore.getState().hideLoading();
    } catch (error: unknown) {
      useLoadingStore.getState().hideLoading();
      let errorMessage =
        "Đăng nhập thất bại, vui lòng kiểm tra lại email/mật khẩu.";
      if (isAxiosError(error)) {
        const serverMsg =
          error.response?.data?.errors || error.response?.data?.error;
        if (typeof serverMsg === "string") errorMessage = serverMsg;
      }
      messageApi.error(errorMessage);
    }
  };

  // 1) Mount animation: disabled to prevent stack overflow
  const mountSprings = {
    opacity: showForm ? 1 : 0,
    transform: showForm ? "scale(1)" : "scale(0.8)",
  };

  // 2) Trail cho các input field - simplified
  const fieldKeys = ["email", "password"] as const;
  const trail = useTrail(showForm ? fieldKeys.length : 0, {
    from: { opacity: 0, transform: "translate3d(0,20px,0)" },
    to: { opacity: 1, transform: "translate3d(0,0,0)" },
    immediate: skipMountAnim || true, // Force immediate to prevent conflicts
    config: { mass: 1, tension: 200, friction: 20 },
  });

  const FormCard = (
    <animated.div
      style={mountSprings}
      className="relative w-full max-w-md isolate"
    >
      <BubbleBackground />
      <div className="relative z-10 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* <h2
          className={`${knewave.className} text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-center px-4 text-[#4a2580]`}
        >
          Welcome to EduSmart
        </h2> */}
        <div className="mx-auto mt-2 w-full">
          <Segmented
            block
            value={activeKey}
            onChange={(val) => {
              const v = val as "login" | "register";
              if (v !== activeKey) {
                setActiveKey(v);
                sessionStorage.setItem("authMountOnce", "1");
                setTimeout(() => {
                  const target = v === "login" ? "/Login" : "/Register";
                  router.push(target, { scroll: false });
                }, 220);
              }
            }}
            options={[
              {
                label: (
                  <span className="text-slate-900 dark:text-white">
                    Đăng Nhập
                  </span>
                ),
                value: "login",
              },
              {
                label: (
                  <span className="text-slate-700 dark:text-slate-300">
                    Đăng kí
                  </span>
                ),
                value: "register",
              },
            ]}
            className="auth-segmented"
          />
          <div className="mt-2 flex justify-center"></div>
        </div>

        {/* Heading thay đổi theo tab */}
        <div
          className={`${lobster.className} flex justify-center items-center h-full
              text-black text-2xl md:text-3xl font-semibold my-6 dark:text-white`}
        >
          Đăng Nhập ngay
        </div>
        <Form<LoginFormValues>
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          {trail.map((style, idx) => {
            const key = fieldKeys[idx];
            return (
              <animated.div key={key} style={style} className="mb-4">
                <BaseControlTextField
                  xmlColumn={xmlColumns[key]}
                  maxlength={50}
                  placeholder={key === "email" ? "Nhập email" : "Nhập mật khẩu"}
                  type={key === "password" ? "password" : undefined}
                />
              </animated.div>
            );
          })}
          <div className="mt-6 sm:mt-8">
            {/* Đổi hover scale sang CSS */}
            <button
              type="submit"
              className="w-full py-4 font-semibold text-white rounded-full bg-gradient-to-r from-teal-400 to-blue-500 
                         hover:scale-[1.05] transition-transform duration-200"
            >
              Đăng nhập
            </button>
          </div>
        </Form>
      </div>
    </animated.div>
  );

  const ShowSwipeEffect = (
    <animated.div
      style={mountSprings}
      className="fixed inset-0 z-[2147483647] pointer-events-none"
    >
      {showWipe && (
        <animated.div
          className="fixed inset-0 z-[2147483647] pointer-events-none"
          style={{
            transform: 'translate3d(0, 100%, 0)', // Static position to prevent animation issues
            opacity: 0, // Hide the wipe effect
          }}
        >
          <div className="relative h-dvh w-full overflow-hidden rounded-b-[80px] shadow-[0_20px_60px_rgba(16,185,129,.35)]">
            {/* Gradient động */}
            <div
              className="absolute inset-0 bg-[length:300%_300%] animate-gradient-flow 
                          bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500"
            />

            {/* Overlay cinematic */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />

            {/* Lưới chấm parallax */}
            <div
              className="absolute inset-0 opacity-25 animate-slow-move"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Shine nhiều lớp */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-y-0 -left-1/3 w-1/2 rotate-6 bg-white/10 blur-2xl animate-wipe-shine" />
              <div className="absolute inset-y-0 left-1/4 w-1/3 rotate-12 bg-white/5 blur-3xl animate-wipe-shine delay-200" />
            </div>

            {/* Wave động */}
            <svg
              className="absolute -bottom-10 left-0 w-full h-24 text-white/40 animate-wave"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill="currentColor"
                d="M0,0L120,32C240,64,480,128,720,149.3C960,171,1200,149,1320,138.7L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
              />
            </svg>
          </div>
        </animated.div>
      )}
    </animated.div>
  );

  const backButton = () => {
    sessionStorage.removeItem("authMountOnce");
    router.push("test/Navbar/home");
  };

  return (
    <>
      {/* Back floating button */}
      <div
        className="fixed left-3 top-3 md:left-6 md:top-6 z-50"
        style={{
          left: "calc(env(safe-area-inset-left, 0px) + 12px)",
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
        }}
      >
        <Tooltip title="Esc để quay lại" placement="right">
          <Button
            onClick={backButton}
            shape="round"
            size="large"
            aria-label="Quay lại"
            className={[
              "group !inline-flex !items-center gap-2 !px-3 sm:!px-4 !h-10 md:!h-11",
              "relative rounded-full overflow-hidden",
              "bg-white/70 dark:bg-slate-900/60 backdrop-blur-md",
              "ring-1 ring-black/5 dark:ring-white/10 shadow-lg hover:shadow-xl",
              "transition-all duration-200 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60",
              "before:absolute before:inset-0 before:rounded-full",
              "before:bg-gradient-to-r before:from-teal-400/20 before:via-cyan-400/20 before:to-blue-400/20",
              "before:opacity-0 hover:before:opacity-100 before:transition-opacity",
            ].join(" ")}
            icon={
              <FiArrowLeft
                className="h-[18px] w-[18px] md:h-5 md:w-5 text-slate-700 dark:text-slate-200
                     transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5"
              />
            }
          >
            {/* Ẩn label ở mobile để gọn gàng, hiện từ sm trở lên */}
            <span className="hidden sm:inline text-[13px] md:text-sm font-medium text-slate-700 dark:text-slate-200">
              Quay lại Trang Chủ
            </span>
          </Button>
        </Tooltip>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen">
        {showWipe && ShowSwipeEffect}
        <Loading />
        {/* Left: background + mobile form */}
        <div className="relative flex-1 h-screen md:h-auto overflow-hidden">
          <Image
            src={bgQuestion}
            alt="Hero"
            fill
            priority
            placeholder="blur"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-right brightness-90 dark:brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 via-cyan-300 to-blue-300 opacity-50 dark:opacity-40" />
          <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 text-white z-10">
            <p
              className={`hidden xs:block text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-2xl !m-2 lg:m-4`}
            >
              EduSmart
            </p>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl drop-shadow-lg">
              Nền tảng học tập cho sinh viên FPT{" "}
              <span className="pl-4">
                {" "}
                <ThemeSwitch />
              </span>
            </p>
          </div>
          {/* Mobile */}
          <div className="absolute inset-0 md:hidden">
            <div className="relative w-full h-screen">
              <BubbleBackground />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {showFormBySwipeRun && FormCard}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div
          className="hidden md:flex flex-1 items-center justify-center
             bg-gradient-to-br from-blue-50 to-indigo-50
             dark:from-gray-900 dark:to-gray-800"
        >
          <div className="relative w-full h-full">
            {" "}
            {/* <-- đảm bảo cao bằng màn hình */}
            <BubbleBackground /> {/* <-- chạy full vùng này */}
            <div className="absolute inset-0 flex items-center justify-center">
              {showFormBySwipeRun && FormCard}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
