"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";
import { Lobster } from "next/font/google";
import {
  DashboardOutlined,
  LogoutOutlined,
  BankOutlined,
  BookOutlined,
  FormOutlined,
  ExperimentOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  BulbOutlined,
  CodeOutlined,
  UserOutlined,
  FileSearchOutlined,
  TeamOutlined,
  ScheduleOutlined,
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
  type?: "group" | "divider";
};

const getItem = (
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: NavMenuItem[],
  path?: string,
  type?: "group" | "divider",
): NavMenuItem => ({ label, key, icon, children, path, type });

/**
 * Navigation items organized by functional groups:
 * 1. Dashboard - Overview & Analytics
 * 2. Academic Management - Majors & Subjects (Syllabus)
 * 3. Assessment - Tests & Surveys
 * 4. Content - Learning Goals & Technologies
 * 5. User Management - Users & Subscriptions
 */
const navItems: NavMenuItem[] = [
  // ========== DASHBOARD ==========
  getItem(
    "Dashboard",
    "dashboard-group",
    null,
    [
      getItem(
        "Tổng quan",
        "dashboard",
        <DashboardOutlined />,
        undefined,
        "/Admin",
      ),
      getItem(
        "Người dùng",
        "dashboard-user",
        <TeamOutlined />,
        undefined,
        "/Admin/profiles",
      ),
    ],
    undefined,
    "group",
  ),
  
  // ========== ACADEMIC MANAGEMENT ==========
  getItem(
    "Quản lý Học thuật",
    "academic-group",
    null,
    [
      getItem(
        "Chương trình Đào tạo",
        "syllabus-management",
        <ScheduleOutlined />,
        undefined,
        "/Admin/syllabus-management",
      ),
      getItem(
        "Chuyên Ngành",
        "majors",
        <BankOutlined />,
        undefined,
        "/Admin/content-management/majors",
      ),
      getItem(
        "Môn Học",
        "subjects",
        <BookOutlined />,
        undefined,
        "/Admin/content-management/subjects",
      ),
    ],
    undefined,
    "group",
  ),

  // ========== ASSESSMENT ==========
  getItem(
    "Kiểm tra & Đánh giá",
    "assessment-group",
    null,
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
        "Kết Quả Sinh Viên",
        "student-tests",
        <FileSearchOutlined />,
        undefined,
        "/Admin/content-management/student-tests",
      ),
    ],
    undefined,
    "group",
  ),

  // ========== SURVEYS ==========
  getItem(
    "Khảo sát",
    "survey-group",
    null,
    [
      getItem(
        "Quản lý Khảo Sát",
        "surveys",
        <FormOutlined />,
        undefined,
        "/Admin/content-management/surveys",
      ),
      getItem(
        "Kết Quả Khảo Sát",
        "student-surveys",
        <BarChartOutlined />,
        undefined,
        "/Admin/content-management/student-surveys",
      ),
    ],
    undefined,
    "group",
  ),

  // ========== CONTENT ==========
  getItem(
    "Nội dung Học tập",
    "content-group",
    null,
    [
      getItem(
        "Mục Tiêu Học Tập",
        "learning-goals",
        <BulbOutlined />,
        undefined,
        "/Admin/content-management/learning-goals",
      ),
      getItem(
        "Công Nghệ",
        "technologies",
        <CodeOutlined />,
        undefined,
        "/Admin/content-management/technologies",
      ),
    ],
    undefined,
    "group",
  ),

  // ========== USER & SYSTEM ==========
  getItem(
    "Hệ thống",
    "system-group",
    null,
    [
      getItem(
        "Đăng ký gói",
        "subscriptions",
        <UserOutlined />,
        undefined,
        "/Admin/subscriptions",
      ),
    ],
    undefined,
    "group",
  ),

  // ========== LOGOUT ==========
  getItem("Đăng xuất", "logout", <LogoutOutlined />),
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

function getOpenKeys(): string[] {
  // No submenu groups to expand with the new flat structure
  return [];
}

const toAntdItems = (items: NavMenuItem[]): MenuItem[] =>
  items.map((it) => {
    if (it.type === "group") {
      return {
        key: it.key,
        label: it.label,
        type: "group",
        children: it.children ? toAntdItems(it.children) : undefined,
      };
    }
    return {
      key: it.key,
      icon: it.icon,
      label: it.label,
      children: it.children ? toAntdItems(it.children) : undefined,
    };
  }) as MenuItem[];

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
      const initialOpenKeys = getOpenKeys();
      setOpenKeys(initialOpenKeys);
    }
  }, [mounted]);
  
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
      const { showLoading } = useLoadingStore.getState();
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

        {/* Theme Switch - centered */}
        <div className="flex justify-center py-3 flex-shrink-0">
          <ThemeSwitch />
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
