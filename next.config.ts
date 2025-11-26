import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tailwindcss.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static-cse.canva.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rubicmarketing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.yarooms.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnphoto.dantri.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopaccino.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gratisography.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'analyticsstepsfiles.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    // loại console.* ở prod, cũng giúp giảm bundle
    removeConsole: process.env.NODE_ENV === "production", // chỉ loại console ở production
  },
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  // Suppress specific warnings in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
        filter: (warning: any) => {
          // Filter out Ant Design warnings
          return !warning.includes('@ant-design') &&
                 !warning.includes('antd') &&
                 !warning.includes('TabPane') &&
                 !warning.includes('deprecated');
        }
      };
    }
    return config;
  },
  async redirects() {
    return [
      { source: "/", destination: "/Login", permanent: true },
    ];
  },
};

export default nextConfig;
