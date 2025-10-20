// src/components/HomePage/MoreSection.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import studentPNG from "EduSmart/assets/student.png";
import teacherPNG from "EduSmart/assets/teacher.png";
import { FiAward, FiGrid, FiUsers } from "react-icons/fi";
import girlImage from "EduSmart/assets/HeroSectionImage.png";

export default function MoreSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <>
      <section className="container mx-auto px-6 mt-32">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" data-speed="0.9">
          <p className="text-4xl md:text-5xl font-bold mb-6 gsap-text-zoom">
            <span className="text-teal-500 dark:text-teal-400">EduSmart</span>
            <span className="text-gray-700 dark:text-gray-300"> là gì ?</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed gsap-text-zoom">
            EduSmart là nền tảng cho sinh viên FPT cung cấp khóa học bằng AI
            thông minh cho sinh viên, cho phép sinh tìm kiếm được khóa học phù
            hợp cho bản thân họ. Hệ thống EduSmart còn đồng thời cho phép giảng
            viên tham gia trong việc cung cấp khóa học.
          </p>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* Card 1: Giảng viên */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl h-96">
            <Image
              src={teacherPNG}
              alt="Giảng viên"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-white dark:bg-gray-800 opacity-40 backdrop-blur-sm"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <p className="text-3xl font-bold text-gray-800 dark:text-white mb-6 ">
                Với giảng viên
              </p>
              <button className="px-8 py-3 border-2 border-gray-800 dark:border-gray-200 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-800 transition-colors duration-300 font-medium">
                Hãy đăng một khóa
              </button>
            </div>
          </div>

          {/* Card 2: Sinh viên */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl h-96">
            <Image
              src={studentPNG}
              alt="Sinh viên"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <div className="text-3xl font-bold text-white mb-6">
                Với sinh viên
              </div>
              <button className="px-8 py-3 bg-teal-500 dark:bg-teal-600 text-white rounded-full hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors duration-300 font-medium">
                Hãy chọn một khóa
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 h-[200px] relative overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0">
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-teal-200 to-teal-300 rounded-lg opacity-60 gsap-rotate"></div>
            <div
              className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-60 gsap-float"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 transform rotate-45 opacity-60 gsap-scale"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-60 gsap-bounce"></div>
            <div
              className="absolute bottom-20 right-20 w-14 h-14 bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg opacity-60 gsap-rotate"
              style={{ animationDelay: "1s" }}
            ></div>

            {/* Animated lines */}
            <div className="absolute top-1/4 left-0 w-32 h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-40 gsap-slide-right"></div>
            <div
              className="absolute bottom-1/3 right-0 w-24 h-1 bg-gradient-to-l from-transparent via-blue-300 to-transparent opacity-40 gsap-slide-left"
              style={{ animationDelay: "0.3s" }}
            ></div>

            {/* Particle effects */}
            <div className="absolute top-16 right-16 w-2 h-2 bg-teal-400 rounded-full opacity-60 gsap-pulse"></div>
            <div
              className="absolute top-32 left-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-60 gsap-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="absolute bottom-24 right-1/3 w-2 h-2 bg-green-400 rounded-full opacity-60 gsap-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
            <div
              className="absolute top-2/3 left-16 w-2 h-2 bg-purple-400 rounded-full opacity-60 gsap-pulse"
              style={{ animationDelay: "0.6s" }}
            ></div>

            {/* Wave effects */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-teal-100 to-transparent opacity-30 gsap-wave"></div>
            <div
              className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-blue-100 to-transparent opacity-30 gsap-wave"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          {/* Central animated element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Main circle */}
              <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full opacity-80 gsap-pulse"></div>

              {/* Orbiting elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full opacity-80 gsap-orbit"></div>
              <div
                className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full opacity-80 gsap-orbit"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-purple-400 rounded-full opacity-80 gsap-orbit"
                style={{ animationDelay: "0.6s" }}
              ></div>
              <div
                className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-pink-400 rounded-full opacity-80 gsap-orbit"
                style={{ animationDelay: "0.9s" }}
              ></div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-12 h-12 border-2 border-teal-300 rounded-lg opacity-40 gsap-rotate"></div>
          <div
            className="absolute top-8 right-8 w-12 h-12 border-2 border-blue-300 rounded-lg opacity-40 gsap-rotate"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-8 left-8 w-12 h-12 border-2 border-green-300 rounded-lg opacity-40 gsap-rotate"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-8 right-8 w-12 h-12 border-2 border-purple-300 rounded-lg opacity-40 gsap-rotate"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
        {/* Feature + Video */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          data-speed="0.8"
        >
          {/* Text block */}
          <div className="relative">
            <div className="absolute -left-4 top-0 w-16 h-16 bg-green-400 rounded-full -z-10"></div>
            <p className="text-3xl md:text-4xl font-bold mb-6 leading-tight gsap-zoom z-10 text-gray-900 dark:text-white">
              Mọi thứ bạn có thể làm ở lớp,{" "}
              <span className="text-teal-500 dark:text-teal-400">
                bạn có thể làm nó với EduSmart
              </span>
            </p>
            <div className="relative z-10">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed gsap-zoom">
                EduSmart&apos;s school management software helps traditional and
                online schools manage scheduling, attendance, payments and
                virtual classrooms all in one secure cloud-based system.
              </p>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full"></div>
            </div>
            <a
              href="#"
              className="text-teal-500 dark:text-teal-400 underline hover:text-teal-600 dark:hover:text-teal-300 font-medium text-lg"
            >
              View Function
            </a>
          </div>

          {/* Video card */}
          <div className="relative">
            {/* Decorative border */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-teal-400 rounded-br-3xl"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-teal-400 rounded-tl-3xl"></div>
            <div className="absolute top-8 -right-2 w-8 h-8 bg-teal-400 rounded-full"></div>
            <div className="absolute -bottom-2 left-8 w-6 h-6 bg-teal-400 rounded-full"></div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl gsap-text-zoom">
              {/* Responsive 16:9 wrapper */}
              <div className="relative h-0 pb-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/DpcJEegKCx8"
                  title="TOTC Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative container mx-auto px-6 mt-32 overflow-hidden z-20">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-4xl md:text-5xl font-bold gsap-text-zoom">
            <span className="text-teal-500 dark:text-teal-400">Tính năng</span>{" "}
            <span className="text-gray-800 dark:text-gray-200">chúng tôi</span>
          </p>
          <p className="relative mt-4 text-gray-600 dark:text-gray-400 z-50">
            This very extraordinary feature can make learning activities more
            efficient
          </p>
        </div>

        {/* Content */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          data-speed="0.7"
        >
          {/* Left: Illustration */}
          <div className="w-full relative">
            {/* Bạn có thể giữ nguyên các hình nền động phía sau nếu cần */}
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-teal-300 rounded-full opacity-60"></div>
            <div className="absolute top-0 right-10 w-40 h-40 bg-sky-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-2/4 left-52 w-72 h-72 bg-red-200 rounded-full opacity-60 z-10"></div>
            <div className="absolute bottom-0 right-4 w-48 h-48 bg-indigo-500 rounded-full opacity-50"></div>
            <Image
              src={girlImage}
              alt="Features Illustration"
              className="rounded-2xl mx-auto relative z-20"
              width={600}
              height={400}
            />
          </div>

          {/* Right: Features list */}
          <div className="space-y-8 gsap-text-zoom">
            {/* Tiêu đề 2 dòng, mỗi dòng 1 màu */}
            <div>
              <p className="text-3xl font-bold text-teal-400 dark:text-teal-300">
                Giao diện người dùng
              </p>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-200">
                được thiết thân thiện
              </p>
            </div>

            {/* Danh sách tính năng */}
            <div className="space-y-6">
              {[
                {
                  icon: <FiGrid className="w-6 h-6" />,
                  desc: "Teachers don’t get lost in the grid view and have a dedicated Podium space.",
                },
                {
                  icon: <FiUsers className="w-6 h-6" />,
                  desc: "TA’s and presenters can be moved to the front of the class.",
                },
                {
                  icon: <FiAward className="w-6 h-6" />,
                  desc: "Teachers can easily see all students and class data at one time.",
                },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  {/* Container icon trắng, shadow */}
                  <div className="flex-none w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  {/* Nội dung text */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
