'use client';

import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { LecturerSidebar } from 'EduSmart/components/SideBar/LecturerSidebar';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { ProfileProvider } from 'EduSmart/Provider/ProfileProvider';

const { Header, Content } = Layout;

interface LecturerLayoutProps {
  children: React.ReactNode;
}

const LecturerLayout: React.FC<LecturerLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <ProfileProvider>
      <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#111827' : '#ffffff' }}>
        <LecturerSidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
        <Layout style={{ height: '100vh', background: isDarkMode ? '#111827' : '#ffffff' }}>
          <Header className="flex items-center border-b border-gray-200 dark:border-gray-700" style={{ padding: 0, background: isDarkMode ? '#1f2937' : '#ffffff' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-xl w-16 h-16 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </Header>
          <Content style={{ overflowY: 'auto', background: isDarkMode ? '#111827' : '#f9fafb' }}>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ProfileProvider>
  );
};

export default LecturerLayout;
