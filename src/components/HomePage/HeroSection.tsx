// src/components/HeroSection.tsx
"use client";
import React from "react";
import Image from "next/image";
import girlImage from "EduSmart/assets/HeroSectionImage.png";
import { FiCalendar, FiMail, FiBarChart } from "react-icons/fi";

export default function HeroSection() {
  return (
    <section className="relative bg-[#49BBBD] dark:bg-[#1a4a4c] overflow-hidden min-h-[60vh] lg:min-h-[70vh] xl:min-h-[80vh] 2xl:min-h-[90vh] md:min-h-[60vh] max-h-[800px]">
      <div className="max-w-[2000px] mx-auto px-6 flex flex-col md:flex-row items-center">
        {/* LEFT */}
        <div className="md:w-1/3 text-white flex flex-col justify-center ml-20">
          <div className="text-4xl md:text-5xl font-bold mb-4 leading-snug">
            <span className="text-orange-400 dark:text-orange-300">
              Học tập
            </span>{" "}
            với AI, tương lai
            <br />
            để tôi lo.
          </div>
          <p className="mb-6">
            Học thông minh cùng AI – Không mất phương hướng
          </p>
          <button className="bg-white/20 dark:bg-white/10 backdrop-blur px-6 py-3 rounded-full hover:bg-opacity-30 dark:hover:bg-opacity-20 transition">
            Làm bài test ngay
          </button>
        </div>

        {/* RIGHT: IMAGE + BADGES */}
        <div className="md:w-2/3 flex justify-center items-center">
          <div className="relative w-72 md:w-96 lg:w-[30rem] xxl:w-[50rem] aspect-[3/4] flex-shrink-0">
            <Image
              src={girlImage}
              alt="Student"
              fill
              sizes="100%"
              className="object-contain"
            />

            {/* 250k */}
            <div className="hero-badge absolute top-[5%] left-[60%] bg-white/80 dark:bg-gray-800/80 backdrop-blur p-3 rounded-lg shadow-lg dark:shadow-gray-900/50 w-44 flex items-center">
              <FiCalendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <div className="ml-2">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  250k
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Assisted Student
                </p>
              </div>
            </div>

            {/* Congratulations */}
            <div className="hero-badge absolute top-[20%] left-[65%] bg-white/80 dark:bg-gray-800/80 backdrop-blur p-3 rounded-lg shadow-lg dark:shadow-gray-900/50 w-52 flex items-center z-10">
              <FiMail className="w-6 h-6 text-orange-400 dark:text-orange-300" />
              <div className="ml-2">
                <p className="font-semibold text-gray-800 dark:text-white">
                  Congratulations
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your admission completed
                </p>
              </div>
            </div>

            {/* Pink icon */}
            <div className="hero-badge absolute top-[50%] left-[70%] w-10 h-10 bg-white/30 dark:bg-gray-800/30 backdrop-blur rounded-lg shadow dark:shadow-gray-900/50 flex items-center justify-center z-20">
              <FiBarChart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>

            {/* UX Class */}
            <div className="hero-badge absolute bottom-24 left-0 z-20 w-64 flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur p-4 rounded-2xl shadow-xl dark:shadow-gray-900/50">
              <Image
                src="https://cdnphoto.dantri.com.vn/oYNwg7DmSO7kCq8Y5lE7wIQFERE=/thumb_w/960/2019/12/20/diem-danh-12-hot-boy-noi-bat-nhat-1-nam-quadocx-1576851098388.jpeg"
                alt="Instructor"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  User Experience Class
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Today at 12.00 PM
                </p>
              </div>
              <button className="bg-pink-500 dark:bg-pink-600 text-white px-4 py-2 rounded-full text-sm">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CURVE */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-72"
        >
          <path
            d="M0,100 C360,40 1080,40 1440,100 L1440,0 L0,0 Z"
            fill="#ffffff"
            className="dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}
