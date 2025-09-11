import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "tailwindcss.com",
      "static-cse.canva.com",
      "rubicmarketing.com",
      "www.yarooms.com",
      "randomuser.me",
      "via.placeholder.com",
      "cdnphoto.dantri.com.vn",
      "cdn.shopaccino.com",
      "gratisography.com",
      "media.istockphoto.com",
      "res.cloudinary.com",
      "i.pravatar.cc",
    ],
  },
  compiler: {
    // loại console.* ở prod, cũng giúp giảm bundle
    removeConsole: process.env.NODE_ENV === "production", // chỉ loại console ở production
  },
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  async redirects() {
    return [
      { source: "/", destination: "/Login", permanent: true },
    ];
  },
};

export default nextConfig;
