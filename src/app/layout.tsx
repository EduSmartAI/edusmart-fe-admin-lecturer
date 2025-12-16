// Early warning suppression - must be first import
import "EduSmart/utils/earlyWarningSuppression";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "plyr/dist/plyr.css";
import { AntdThemeProvider } from "EduSmart/components/Themes/AntdThemeProvider";
import { ThemeProvider } from "EduSmart/Provider/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ChartThemeProvider } from "EduSmart/Provider/ChartThemeProvider";
import { NotificationProvider } from "EduSmart/Provider/NotificationProvider";
import "@ant-design/v5-patch-for-react-19";
import GoogleProvider from "EduSmart/Provider/GoogleProvider";
import GlobalWarningSuppression from "EduSmart/components/GlobalWarningSuppression";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.edusmart.pro.vn"),
  title: { default: "EduSmart – Học cùng AI cho học sinh", template: "%s | EduSmart" },
  description:
    "Học thông minh cùng AI: gợi ý khóa học phù hợp, theo dõi tiến độ và bài kiểm tra cá nhân hoá trên EduSmart.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    title: "EduSmart",
    description: "Học thông minh cùng AI cho học sinh",
    siteName: "EduSmart",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "EduSmart logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduSmart",
    description: "Học thông minh cùng AI cho học sinh",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index,follow"/>
        <meta name="google-site-verification" content="zHUQms0K0yncnzbqCtw9XTpot7mSQqw2npsCYfi8S84" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://api.edusmart.vn" />
        <link rel="dns-prefetch" href="https://api.edusmart.vn" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preload" as="image" href="/logo.png" />
        <link rel="preload" as="image" href="/hero-bg.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <GlobalWarningSuppression>
          <AntdRegistry>
            <ThemeProvider>
              <AntdThemeProvider>
                <ChartThemeProvider>
                  <NotificationProvider>
                    <GoogleProvider>{children}</GoogleProvider>
                  </NotificationProvider>
                </ChartThemeProvider>
              </AntdThemeProvider>
            </ThemeProvider>
          </AntdRegistry>
        </GlobalWarningSuppression>
      </body>
    </html>
  );
}
