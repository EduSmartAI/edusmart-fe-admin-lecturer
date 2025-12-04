"use client";

import React from "react";
import { Card, Row, Col, Typography, Tag } from "antd";
import {
  BankOutlined,
  BookOutlined,
  FormOutlined,
  ExperimentOutlined,
  CheckSquareOutlined,
  BulbOutlined,
  CodeOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  BarChartOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

/**
 * Admin Dashboard Component
 * Professional admin overview with organized sections
 */
export default function AdminDashboard() {
  const router = useRouter();

  // Quick stats data (can be fetched from API later)
  const stats = [
    { title: "Chuyên ngành", value: 14, icon: <BankOutlined />, color: "#1890ff", trend: "+2" },
    { title: "Môn học", value: 77, icon: <BookOutlined />, color: "#52c41a", trend: "+5" },
    { title: "Bài kiểm tra", value: 45, icon: <ExperimentOutlined />, color: "#722ed1", trend: "+12" },
    { title: "Khảo sát", value: 23, icon: <FormOutlined />, color: "#fa8c16", trend: "+3" },
  ];

  // Quick access sections
  const quickAccessSections = [
    {
      title: "Quản lý Học thuật",
      description: "Quản lý chuyên ngành và môn học trong hệ thống",
      color: "#1890ff",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      items: [
        { name: "Chuyên Ngành", icon: <BankOutlined />, path: "/Admin/content-management/majors", count: 14 },
        { name: "Môn Học", icon: <BookOutlined />, path: "/Admin/content-management/subjects", count: 77 },
      ],
    },
    {
      title: "Kiểm tra & Đánh giá",
      description: "Quản lý bài kiểm tra và xem kết quả sinh viên",
      color: "#722ed1",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      items: [
        { name: "Bài Kiểm Tra Đầu Vào", icon: <CheckSquareOutlined />, path: "/Admin/content-management/initial-tests", count: 15 },
        { name: "Bài Thực Hành", icon: <ExperimentOutlined />, path: "/Admin/content-management/practice-tests", count: 30 },
        { name: "Kết Quả Sinh Viên", icon: <FileSearchOutlined />, path: "/Admin/content-management/student-tests", count: 156 },
      ],
    },
    {
      title: "Khảo sát",
      description: "Tạo khảo sát và theo dõi phản hồi",
      color: "#fa8c16",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      items: [
        { name: "Quản lý Khảo Sát", icon: <FormOutlined />, path: "/Admin/content-management/surveys", count: 23 },
        { name: "Kết Quả Khảo Sát", icon: <BarChartOutlined />, path: "/Admin/content-management/student-surveys", count: 89 },
      ],
    },
    {
      title: "Nội dung Học tập",
      description: "Quản lý mục tiêu và công nghệ",
      color: "#52c41a",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      items: [
        { name: "Mục Tiêu Học Tập", icon: <BulbOutlined />, path: "/Admin/content-management/learning-goals", count: 45 },
        { name: "Công Nghệ", icon: <CodeOutlined />, path: "/Admin/content-management/technologies", count: 67 },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="!mb-1 !text-gray-900 dark:!text-white">
              Xin chào, Admin 👋
            </Title>
            <Text className="text-gray-500 dark:text-gray-400 text-base">
              Chào mừng bạn đến với trang quản trị EduSmart
            </Text>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Tag color="blue" className="px-3 py-1 text-sm">
              <TeamOutlined className="mr-1" />
              Admin
            </Tag>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <Card 
              className="shadow-sm hover:shadow-md transition-all border-0 h-full"
              styles={{ body: { padding: '20px' } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm block mb-1">
                    {stat.title}
                  </Text>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                    <Tag color="green" className="text-xs">
                      <RiseOutlined /> {stat.trend}
                    </Tag>
                  </div>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <span style={{ color: stat.color, fontSize: 24 }}>{stat.icon}</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Access Sections */}
      <div className="mb-6">
        <Title level={4} className="!text-gray-900 dark:!text-white !mb-4">
          Truy cập nhanh
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        {quickAccessSections.map((section, sectionIndex) => (
          <Col xs={24} lg={12} key={sectionIndex}>
            <Card 
              className="shadow-sm hover:shadow-md transition-all border-0 h-full"
              styles={{ body: { padding: '24px' } }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.bgColor}`}
                >
                  <span style={{ color: section.color, fontSize: 20 }}>
                    {section.items[0]?.icon}
                  </span>
                </div>
                <div>
                  <Text strong className="text-gray-900 dark:text-white text-base block">
                    {section.title}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {section.description}
                  </Text>
                </div>
              </div>

              {/* Section Items */}
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                    onClick={() => router.push(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400 text-lg">
                        {item.icon}
                      </span>
                      <Text className="text-gray-700 dark:text-gray-300">
                        {item.name}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="m-0">{item.count}</Tag>
                      <ArrowRightOutlined className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity & System Info */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Text strong className="text-gray-900 dark:text-white">
                Hoạt động gần đây
              </Text>
            }
            className="shadow-sm border-0 h-full"
            styles={{ body: { padding: '16px 24px' } }}
          >
            <div className="space-y-4">
              {[
                { action: "Thêm môn học mới", detail: "CSI105 - Advanced Programming", time: "5 phút trước", color: "#52c41a" },
                { action: "Cập nhật khảo sát", detail: "Khảo sát cuối kỳ - K17", time: "1 giờ trước", color: "#1890ff" },
                { action: "Tạo bài kiểm tra", detail: "Bài kiểm tra đầu vào - Java", time: "2 giờ trước", color: "#722ed1" },
                { action: "Thêm chuyên ngành", detail: "Cloud Computing", time: "3 giờ trước", color: "#fa8c16" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activity.color }} />
                  <div className="flex-1">
                    <Text className="text-gray-900 dark:text-white block">
                      {activity.action}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {activity.detail}
                    </Text>
                  </div>
                  <Text className="text-gray-400 text-sm">
                    {activity.time}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Text strong className="text-gray-900 dark:text-white">
                Thông tin hệ thống
              </Text>
            }
            className="shadow-sm border-0 h-full"
            styles={{ body: { padding: '16px 24px' } }}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-500 dark:text-gray-400">Phiên bản</Text>
                <Tag color="blue">v2.1.0</Tag>
              </div>
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-500 dark:text-gray-400">Trạng thái</Text>
                <Tag color="green">Hoạt động</Tag>
              </div>
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-500 dark:text-gray-400">Cập nhật cuối</Text>
                <Text className="text-gray-700 dark:text-gray-300">30/11/2025</Text>
              </div>
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-500 dark:text-gray-400">Người dùng online</Text>
                <Text className="text-gray-700 dark:text-gray-300 font-semibold">1,234</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
