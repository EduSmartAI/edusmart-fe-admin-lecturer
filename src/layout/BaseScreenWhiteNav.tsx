// File: src/components/BaseScreen.tsx
import React, { ReactNode, FC } from "react";
import NavigationbarWhite from "EduSmart/components/Navbar/NavigationbarWhite";
import Footer from "EduSmart/components/Footer/Footer";

interface BaseScreenProps {
  children: ReactNode;
}

const BaseScreenWhiteNav: FC<BaseScreenProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-clip md:scroll-smooth">
      <NavigationbarWhite />
      <main className="relative isolate flex-grow pt-24 text-slate-900 dark:text-slate-100 overflow-x-clip">
        {/* BASE */}
        <div className="absolute inset-0 -z-50">
          {/* Light: xanh lam dịu */}
          <div className="absolute inset-0 dark:hidden">
            {/* nền xanh rất nhạt */}
            <div className="absolute inset-0 bg-[radial-gradient(140%_100%_at_50%_-10%,#ffffff_0%,#f8fbff_40%,#eef5ff_75%,#e9f2ff_100%)]" />
            {/* phủ thêm lớp làm sáng vùng trên  */}
            <div className="absolute inset-0 bg-[radial-gradient(90rem_50rem_at_50%_-10%,rgba(255,255,255,0.75),transparent_60%)]" />
          </div>
          {/* Dark: giữ nguyên */}
          <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(180deg,#0a0f1e_0%,#0b1330_32%,#0d1642_100%)]" />
        </div>

        {/* GLOWS */}
        <div className="absolute inset-0 -z-40 pointer-events-none">
          {/* Light glows: xanh lam/xanh ngọc, KHÔNG dùng multiply để tránh xám */}
          <div className="dark:hidden">
            <div className="absolute -top-32 -left-24 h-[40rem] w-[64rem] blur-[90px] opacity-70 bg-[radial-gradient(65rem_32rem_at_0%_0%,rgba(99,102,241,0.18),transparent_65%)]" />
            <div className="absolute -top-6 -right-20 h-[36rem] w-[58rem] blur-[100px] opacity-70 bg-[radial-gradient(60rem_28rem_at_110%_10%,rgba(56,189,248,0.18),transparent_65%)]" />
            <div className="absolute bottom-[-18rem] left-1/2 -translate-x-1/2 h-[30rem] w-[60rem] blur-[110px] opacity-60 bg-[radial-gradient(55rem_26rem_at_50%_100%,rgba(37,99,235,0.22),transparent_70%)]" />
          </div>

          {/* Dark glows: như cũ */}
          <div className="hidden dark:block filter saturate-[1.35] contrast-110">
            <div
              className="absolute -top-40 -left-28 h-[48rem] w-[72rem] blur-[100px] opacity-90
                    bg-[radial-gradient(80rem_40rem_at_0%_0%,hsl(255_95%_70%/.45),transparent_70%)]
                    mix-blend-screen"
            />
            <div
              className="absolute -top-4 -right-16 h-[42rem] w-[64rem] blur-[110px] opacity-90
                    bg-[radial-gradient(70rem_34rem_at_110%_10%,hsl(332_95%_70%/.40),transparent_65%)]
                    mix-blend-screen"
            />
            <div
              className="absolute bottom-[-18rem] left-1/2 -translate-x-1/2 h-[38rem] w-[72rem] blur-[120px]
                    bg-[radial-gradient(60rem_30rem_at_50%_100%,hsl(215_100%_65%/.22),transparent_70%)]
                    mix-blend-screen"
            />
          </div>
        </div>

        {/* GRID */}
        <div className="fixed inset-0 -z-30 pointer-events-none">
          {/* LIGHT */}
          <div
            className="
                  absolute inset-0 dark:hidden opacity-90 bg-[#96e6ffad]
                  bg-[linear-gradient(to_right,#918d8d23_1px,transparent_1px),linear-gradient(to_bottom,#918d8d23_1px,transparent_1px)]
                  bg-[size:36px_36px]
                  [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]
                  [-webkit-mask-image:radial-gradient(ellipse_120%_85%_at_50%_-20%,#000_75%,transparent_100%)]"
          />
          <div
            className="absolute inset-0 hidden dark:block opacity-25
                  [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]
                  bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)]
                  [background-size:36px_36px]"
          />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default BaseScreenWhiteNav;
