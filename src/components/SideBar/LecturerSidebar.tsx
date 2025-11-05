"use client";

import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Knewave } from "next/font/google";
import {
  PieChartOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Layout, theme, Avatar } from "antd";
import imageEmoLogo from 'EduSmart/assets/emo.webp';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { ThemeSwitch } from '../Themes/Theme';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import { useNotification } from 'EduSmart/Provider/NotificationProvider';
import { useLoadingStore } from 'EduSmart/stores/Loading/LoadingStore';
import { useUserProfileStore } from 'EduSmart/stores/User/UserProfileStore';

const { Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

interface CSSVarProperties extends CSSProperties {
  "--ant-primary-color"?: string;
}

const knewave = Knewave({
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
  getItem("Dashboard", "dashboard", <PieChartOutlined />, undefined, "/Lecturer/dashboard"),
  getItem("Audience", "audience", <TeamOutlined />, undefined, "/Lecturer/audience"),
  getItem("Posts", "posts", <FileTextOutlined />, undefined, "/Lecturer/posts"),
  getItem("Schedules", "schedules", <CalendarOutlined />, undefined, "/Lecturer/schedules"),
  getItem("Quản lý khóa học", "course-management", <BarChartOutlined />, [
    getItem("Xem khóa học", "view-courses", undefined, undefined, "/Lecturer/courses"),
    getItem("Tạo khóa học", "create-course", undefined, undefined, "/Lecturer/courses/create-course"),
    getItem("Declines", "declines", undefined, undefined, "/Lecturer/courses/declines"),
    getItem("Payouts", "payouts", undefined, undefined, "/Lecturer/courses/payouts"),
  ]),
  getItem("Notification", "notification", <BellOutlined />, undefined, "/Lecturer/notification"),
  getItem("Settings", "settings", <SettingOutlined />, undefined, "/Lecturer/settings"),
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



const parentMap = (() => {
  const m: Record<string, string> = {};
  function build(items: NavMenuItem[], parent?: NavMenuItem) {
    for (const it of items) {
      if (parent) m[it.key] = parent.key;
      if (it.children) build(it.children, it);
    }
  }
  build(navItems);
  return m;
})();



function getSelectedKeys(pathname: string): string[] {
    const key = pathKeyMap[pathname];
    return key ? [key] : [];
}

const toAntdItems = (items: NavMenuItem[]): MenuItem[] =>
  items.map((it) => ({
    key: it.key,
    icon: it.icon,
    label: it.label,
    children: it.children ? toAntdItems(it.children) : undefined,
  })) as MenuItem[];

/* ---------- COMPONENT ---------- */
interface LecturerSidebarProps {
  collapsed: boolean;
  onCollapse?: (collapsed: boolean) => void;
  menuItems?: NavMenuItem[];
  defaultSelectedKeys?: string[];
}

export const LecturerSidebar: React.FC<LecturerSidebarProps> = ({
  collapsed,
  onCollapse,
  menuItems = navItems,
  defaultSelectedKeys,
}) => {
  const [mounted, setMounted] = useState(false);
  const { isDarkMode } = useTheme();
  const { token: { colorPrimary } } = theme.useToken();
  const messageApi = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUserProfileStore();
  const selectedKeys = defaultSelectedKeys ?? getSelectedKeys(pathname);
  const defaultOpenKeys = useMemo(() => {
    const cur = selectedKeys[0];
    if (!cur) return [];
    const p = parentMap[cur];
    return p ? [p] : [];
  }, [selectedKeys]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: collapsed ? 80 : 240 }} />;

  const siderStyle: CSSVarProperties = {
    backgroundColor: isDarkMode ? "#030a14" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    "--ant-primary-color": colorPrimary,
    position: 'sticky',
    top: 0,
    left: 0,
  };

  const antItems = toAntdItems(menuItems);

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      const { showLoading, hideLoading } = useLoadingStore.getState();
      showLoading();
      useAuthStore.getState().logout();
      useAuthStore.persist.clearStorage();
      messageApi.success("Đăng xuất thành công!");
      router.push("/Login");
      hideLoading();
      return;
    }
    
    const path = keyPathMap[key];
    if (path) {
      // Use router.push for navigation
      router.push(path);
    }
  };

  return (
    <Sider
      style={siderStyle}
      breakpoint="md"
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}

      width={240}
      trigger={null}
      className="flex flex-col h-screen"
    >
      {/* Logo */}
      <div
        style={{
          height: 48,
          margin: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          overflow: "hidden",
        }}
      >
        {collapsed ? (
          <Image
            src={imageEmoLogo}
            alt="EmoEase Logo"
            width={32}
            height={32}
            priority
            placeholder="empty"
            className="object-cover"
          />
        ) : (
          <div
            className={`${knewave.className} text-[#4a2580] text-3xl font-light tracking-widest ml-9`}
          >
            EmoEase
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme={isDarkMode ? "dark" : "light"}
        mode="inline"
        items={antItems}
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        onClick={handleMenuClick}
        className="flex-grow"
        style={{
          border: "none",
          background: "transparent",
        }}
      />

      {/* User Profile & Theme Switch */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && (
            <div className="flex items-center mb-4">
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                <div className="ml-3">
                    <p className="font-semibold text-sm">{profile?.name}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
            </div>
        )}
        <ThemeSwitch />
      </div>
    </Sider>
  );
};
