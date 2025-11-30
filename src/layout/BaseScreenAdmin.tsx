"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Layout, Breadcrumb, theme, Spin, Typography, Button, Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { AdminSidebar } from "EduSmart/components/SideBar/SideBar";
import Loading from "EduSmart/components/Loading/Loading";
import { FadeInUp } from "EduSmart/components/Animation/FadeInUp";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";
import NotFound from "EduSmart/app/404/page";
import { useSidebarStore } from "EduSmart/stores/SideBar/SideBarStore";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

interface BaseScreenAdminProps {
  children: ReactNode;
  menuItems?: React.ComponentProps<typeof AdminSidebar>["menuItems"];
  defaultSelectedKeys?: React.ComponentProps<
    typeof AdminSidebar
  >["defaultSelectedKeys"];
  breadcrumbItems?: { title: string }[];
}

const BaseScreenAdmin: React.FC<BaseScreenAdminProps> = ({
  children,
  menuItems,
  defaultSelectedKeys,
  breadcrumbItems = [],
}) => {
  // 1️⃣ collapsed được quản lý ở đây
  const [mounted, setMounted] = useState(false);
  const invalid = useValidateStore.getState().inValid;
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (invalid) {
    return <NotFound />;
  }

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colorBgContainer,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 2️⃣ Truyền collapsed & onCollapse xuống Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        menuItems={menuItems}
        defaultSelectedKeys={defaultSelectedKeys}
      />

      <Layout>
        {/* 3️⃣ Modern Header with better styling */}
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 64,
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, width: 40, height: 40 }}
            />
            {breadcrumbItems.length === 0 ? (
              <div className="flex items-center gap-2">
                <Text strong style={{ fontSize: 18 }}>
                  EduSmart Admin
                </Text>
              </div>
            ) : (
              <Breadcrumb
                items={breadcrumbItems.map((item) => ({
                  title: item.title,
                }))}
                style={{
                  margin: 0,
                  fontSize: "16px",
                }}
              />
            )}
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            <Tooltip title="Trợ giúp">
              <Button type="text" icon={<QuestionCircleOutlined />} style={{ width: 40, height: 40 }} />
            </Tooltip>
            <Tooltip title="Thông báo">
              <Button type="text" icon={<BellOutlined />} style={{ width: 40, height: 40 }} />
            </Tooltip>
          </div>
        </Header>

        <Loading />
        <FadeInUp>
          <Content 
            style={{ 
              margin: "24px", 
              minHeight: "calc(100vh - 64px - 70px - 48px)",
            }}
          >
            <div
              className="p-6 min-h-full rounded-xl"
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </div>
          </Content>
        </FadeInUp>

        <Footer 
          style={{ 
            textAlign: "center",
            padding: "16px 24px",
            background: "transparent",
          }}
        >
          <Text type="secondary" className="text-sm">
            EduSmart © {new Date().getFullYear()} • Phát triển bởi SOLTECH
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BaseScreenAdmin;
