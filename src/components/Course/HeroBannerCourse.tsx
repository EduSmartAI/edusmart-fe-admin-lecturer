"use client";
import React from "react";
import { Input } from "antd";

interface CourseSearchSectionProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const CourseSearchSection: React.FC<CourseSearchSectionProps> = ({
  title = "Tìm khóa học phù hợp cho bạn",
  subtitle = "Lọc theo chủ đề, ngôn ngữ, cấp độ — hoặc nhập từ khóa để bắt đầu.",
  placeholder = "VD: Python cơ bản, Web development, Data Science...",
  onSearch,
}) => {
  return (
    <section className="relative isolate overflow-hidden px-4 sm:px-6">
      <div className="mx-auto max-w-screen-2xl">
        <div
          className="
            relative rounded-3xl border border-white/10 
            bg-[radial-gradient(1200px_500px_at_-10%_-20%,rgba(144,137,252,0.25),transparent_60%),radial-gradient(900px_400px_at_110%_10%,rgba(255,128,181,0.20),transparent_60%)] 
            dark:bg-[radial-gradient(1200px_500px_at_-10%_-20%,rgba(144,137,252,0.25),transparent_60%),radial-gradient(900px_400px_at_110%_10%,rgba(255,128,181,0.20),transparent_60%)]
            bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur
            ring-1 ring-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]
            px-6 sm:px-10 py-10 sm:py-14
          "
        >
          {/* glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full blur-3xl opacity-30 bg-gradient-to-r from-[#ff80b5] to-[#9089fc]" />
            <div className="absolute -bottom-12 right-0 h-72 w-72 rounded-full blur-3xl opacity-25 bg-gradient-to-r from-[#9089fc] to-[#ff80b5]" />
          </div>

          {/* grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(80%_60%_at_50%_40%,black,transparent)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
          </div>

          {/* content */}
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/80">
              {subtitle}
            </p>

            {/* Search */}
            <div className="mt-6 sm:mt-8">
              <div className="mx-auto max-w-2xl">
                <Input.Search
                  allowClear
                  size="large"
                  enterButton="Tìm kiếm"
                  placeholder={placeholder}
                  aria-label="Tìm kiếm khóa học"
                  onSearch={onSearch}
                  className="
                    !rounded-full !px-3 
                    [&_.ant-input-affix-wrapper]:!rounded-full 
                    [&_.ant-input-search-button]:!rounded-full
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseSearchSection;
