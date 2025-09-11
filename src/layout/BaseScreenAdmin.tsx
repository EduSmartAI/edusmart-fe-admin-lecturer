"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Layout, Breadcrumb, theme, Spin } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AdminSidebar } from "EduSmart/components/SideBar/SideBar";
import Loading from "EduSmart/components/Loading/Loading";
import { FadeInUp } from "EduSmart/components/Animation/FadeInUp";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";
import NotFound from "EduSmart/app/404/page";
import { useSidebarStore } from "EduSmart/stores/SideBar/SideBarStore";

const { Header, Content, Footer } = Layout;

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
        {/* 3️⃣ Nút thu/vô nằm trong Header */}
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              onClick={() => setCollapsed(false)}
              style={{ fontSize: 20, cursor: "pointer", marginRight: 16 }}
            />
          ) : (
            <MenuFoldOutlined
              onClick={() => setCollapsed(true)}
              style={{ fontSize: 20, cursor: "pointer", marginRight: 16 }}
            />
          )}
          {breadcrumbItems.length === 0 ? (
            <h3 style={{ margin: 0 }}>EduSmart Admin</h3>
          ) : (
            <Breadcrumb
              items={breadcrumbItems.map((item) => ({
                title: item.title,
              }))}
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
              }}
            />
          )}
        </Header>

        <Loading />
        <FadeInUp>
          <Content style={{ margin: "16px 24px" }}>
            <div
              className="p-6 min-h-[360px] h-full rounded-lg"
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </div>
          </Content>
        </FadeInUp>

        <Footer style={{ textAlign: "center" }}>
          EmoEasse ©{new Date().getFullYear()} Created by SOLTECH
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BaseScreenAdmin;
