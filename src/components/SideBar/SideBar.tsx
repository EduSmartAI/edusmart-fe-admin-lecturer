"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";
import { Lobster } from "next/font/google";
import {
  PieChartOutlined,
  DesktopOutlined,
  LogoutOutlined,
  SolutionOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  BulbOutlined,
  FormOutlined,
  UserOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Layout, theme } from "antd";
import imageEmoLogo from "EduSmart/assets/logo.png";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { ThemeSwitch } from "../Themes/Theme";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";
import { UserTitle } from "./UserTitle";

const { Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

interface CSSVarProperties extends CSSProperties {
  "--ant-primary-color"?: string;
}

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
});

type NavMenuItem = {
  label: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  children?: NavMenuItem[];
  path?: string;
};

const getItem = (
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: NavMenuItem[],
  path?: string,
): NavMenuItem => ({ label, key, icon, children, path });

const navItems: NavMenuItem[] = [
  getItem(
    "Dashboard Doanh Thu",
    "dashboard",
    <PieChartOutlined />,
    undefined,
    "/Admin",
  ),
  getItem(
    "Dashboard Người dùng",
    "dashboard-user",
    <DesktopOutlined />,
    undefined,
    "/Admin/profiles",
  ),
  getItem(
    "Đăng ký",
    "subscriptions",
    <SolutionOutlined />,
    undefined,
    "/Admin/subscriptions",
  ),
  getItem(
    "Quản lý Nội dung",
    "content-management",
    <FileTextOutlined />,
    [
      getItem(
        "Bài Kiểm Tra Đầu Vào",
        "initial-tests",
        <CheckSquareOutlined />,
        undefined,
        "/Admin/content-management/initial-tests",
      ),
      getItem(
        "Bài Thực Hành",
        "practice-tests",
        <ExperimentOutlined />,
        undefined,
        "/Admin/content-management/practice-tests",
      ),
      getItem(
        "Mục Tiêu Học Tập",
        "learning-goals",
        <BulbOutlined />,
        undefined,
        "/Admin/content-management/learning-goals",
      ),
      getItem(
        "Khảo Sát",
        "surveys",
        <FormOutlined />,
        undefined,
        "/Admin/content-management/surveys",
      ),
      getItem(
        "Khảo Sát Sinh Viên",
        "student-surveys",
        <BarChartOutlined />,
        undefined,
        "/Admin/content-management/student-surveys",
      ),
      getItem(
        "Bài Test Sinh Viên",
        "student-tests",
        <UserOutlined />,
        undefined,
        "/Admin/content-management/student-tests",
      ),
      getItem(
        "Công Nghệ",
        "technologies",
        <CodeOutlined />,
        undefined,
        "/Admin/content-management/technologies",
      ),
    ],
  ),
  getItem("Đăng xuất", "logout", <LogoutOutlined />),
  getItem("", "", <ThemeSwitch />),
];

/* ---------- HELPERS ---------- */
function flatten(items: NavMenuItem[], acc: Record<string, string> = {}) {
  for (const it of items) {
    if (it.path) acc[it.key] = it.path;
    if (it.children) flatten(it.children, acc);
  }
  return acc;
}
const keyPathMap = flatten(navItems);

const pathKeyMap = Object.entries(keyPathMap).reduce<Record<string, string>>(
  (m, [k, p]) => ((m[p] = k), m),
  {},
);

function getSelectedKeys(pathname: string): string[] {
  if (pathKeyMap[pathname]) return [pathKeyMap[pathname]];
  // fallback: tìm path dài nhất là prefix
  let matchKey = "";
  let matchLen = -1;
  for (const [k, p] of Object.entries(keyPathMap)) {
    if (pathname.startsWith(p) && p.length > matchLen) {
      matchKey = k;
      matchLen = p.length;
    }
  }
  return matchKey ? [matchKey] : [];
}

function getOpenKeys(pathname: string): string[] {
  // Auto-open Content Management submenu if viewing any of its pages
  if (pathname.startsWith('/Admin/content-management')) {
    return ['content-management'];
  }
  return [];
}

const toAntdItems = (items: NavMenuItem[]): MenuItem[] =>
  items.map((it) => ({
    key: it.key,
    icon: it.icon,
    label: it.label,
    children: it.children ? toAntdItems(it.children) : undefined,
  })) as MenuItem[];

/* ---------- COMPONENT ---------- */
interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  menuItems?: NavMenuItem[]; // cho phép override
  defaultSelectedKeys?: string[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onCollapse,
  menuItems = navItems,
  defaultSelectedKeys,
}) => {
  const [mounted, setMounted] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { isDarkMode } = useTheme();
  const {
    token: { colorPrimary, colorBorderSecondary },
  } = theme.useToken();
  const messageApi = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => setMounted(true), []);
  
  // Set initial open keys based on current path
  useEffect(() => {
    if (mounted) {
      const initialOpenKeys = getOpenKeys(pathname);
      setOpenKeys(initialOpenKeys);
    }
  }, [pathname, mounted]);
  
  if (!mounted) return <div style={{ width: collapsed ? 80 : 240 }} />;

  const siderStyle: CSSVarProperties = {
    backgroundColor: isDarkMode ? "#021526" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    "--ant-primary-color": colorPrimary,
  };

  const antItems = toAntdItems(menuItems);
  const selectedKeys = defaultSelectedKeys ?? getSelectedKeys(pathname);

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      const { showLoading, hideLoading } = useLoadingStore.getState();
      showLoading();
      await logout();
      messageApi.success("Đăng xuất thành công!");
      useAuthStore.persist.clearStorage();
      // Force full page reload to clear all states
      window.location.href = "/Login";
      return;
    }
    const path = keyPathMap[key];
    if (path) {
      router.push(path);
    }
  };

  return (
    <Sider
      style={siderStyle}
      className="!flex !flex-col !h-screen !sticky !top-0 !left-0"
      breakpoint="md"
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      trigger={null}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Logo */}
        <div
          style={{
            height: 48,
            margin: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            <Image
              src={imageEmoLogo}
              alt="EduSmart Logo"
              width={32}
              height={32}
              priority
              placeholder="empty"
              className="object-cover"
            />
          ) : (
            <div
              className={`${lobster.className} text-black dark:text-white text-3xl font-light tracking-widest ml-9`}
            >
              EduSmart
            </div>
          )}
        </div>

        {/* Menu - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            items={antItems}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleMenuClick}
            style={{
              border: "none",
              background: "transparent",
              marginTop: 16,
            }}
          />
        </div>
        
        {/* User Title - fixed at bottom */}
        <div
          className={`mt-auto px-3 py-3 border-t border-dashed flex-shrink-0 ${isDarkMode ? "border-white/10" : ""}`}
          style={{ borderColor: isDarkMode ? "" : colorBorderSecondary }}
        >
          <UserTitle collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  );
};
