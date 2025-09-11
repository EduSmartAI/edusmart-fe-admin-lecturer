// File: src/components/Footer.jsx
import React from "react";
import Image from "next/image";
import logoImg from "EduSmart/assets/Flearning.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6 lg:px-0">
        {/* Top: logo + description */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-12">
          <div className="flex items-center mb-8 lg:mb-0">
            <Image
              src={logoImg}
              alt="TOTC logo"
              width={40} // bắt buộc
              height={40} // bắt buộc
              className="mr-3"
            />
            <span className="text-white text-lg font-semibold">
              Virtual Class for Zoom
            </span>
          </div>

          {/* Newsletter subscription */}
          <div className="w-full lg:w-auto">
            <h3 className="text-white text-xl mb-4">
              Subscribe to get our Newsletter
            </h3>
            <form className="flex flex-col sm:flex-row items-stretch sm:items-center">
              <input
                suppressHydrationWarning
                type="email"
                placeholder="Your Email"
                className="flex-grow px-4 py-3 rounded-l-md bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                suppressHydrationWarning
                type="submit"
                className="mt-3 sm:mt-0 sm:ml-3 px-6 py-3 rounded-md bg-gradient-to-r from-teal-400 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom nav links */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">
              Careers
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </a>
          </div>
          <div className="text-gray-500">© 2021 Class Technologies Inc.</div>
        </div>
      </div>
    </footer>
  );
}
