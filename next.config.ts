import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow all remote image hostnames - useful when users can input any image URL
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Wildcard to match any hostname
      },
      {
        protocol: 'http',
        hostname: '**', // Also allow http for development
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
