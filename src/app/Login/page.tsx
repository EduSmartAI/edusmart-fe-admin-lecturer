export const dynamic = "force-dynamic";

import { Metadata } from "next";
import LoginPage from "./Client";
export const metadata: Metadata = {
  title: "EduSmart – Đăng nhập",
  description:
    "Đăng nhập vào EduSmart để tiếp tục hành trình chăm sóc tinh thần của bạn.",
  openGraph: {
    title: "EduSmart",
    description: "EduSmart",
    url: "https://EduSmart-frontend.vercel.app/Login",
    images: [
      {
        url: "https://EduSmart-frontend.vercel.app/emo.png",
        width: 1200,
        height: 630,
        alt: "EduSmart logo",
      },
    ],
    siteName: "EduSmart",
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/emo.png",
        href: "/emo.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/emo.png",
        href: "/emo.png",
      },
    ],
  },
};
export default function Page() {
  return <LoginPage />;
}
