"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Tag, Spin } from "antd";
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
  ClockCircleOutlined,
  SafetyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import adminStatsService, { DashboardStats } from "EduSmart/api/api-admin-stats";

const { Title, Text } = Typography;

/**
 * Admin Dashboard Component
 * Professional admin overview with real-time statistics
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalMajors: 0,
    totalSubjects: 0,
    totalTests: 0,
    totalSurveys: 0,
    majorsTrend: '+0',
    subjectsTrend: '+0',
    testsTrend: '+0',
    surveysTrend: '+0',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const stats = await adminStatsService.getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats with real data
  const stats = [
    { title: "Chuyên ngành", value: dashboardStats.totalMajors, icon: <BankOutlined />, color: "#1890ff", trend: dashboardStats.majorsTrend },
    { title: "Môn học", value: dashboardStats.totalSubjects, icon: <BookOutlined />, color: "#52c41a", trend: dashboardStats.subjectsTrend },
    { title: "Bài kiểm tra", value: dashboardStats.totalTests, icon: <ExperimentOutlined />, color: "#722ed1", trend: dashboardStats.testsTrend },
    { title: "Khảo sát", value: dashboardStats.totalSurveys, icon: <FormOutlined />, color: "#fa8c16", trend: dashboardStats.surveysTrend },
  ];

  // Quick access sections with dynamic counts
  const quickAccessSections = [
    {
      title: "Quản lý Học thuật",
      description: "Quản lý chuyên ngành và môn học trong hệ thống",
      color: "#1890ff",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      items: [
        { name: "Chuyên Ngành", icon: <BankOutlined />, path: "/Admin/content-management/majors", count: dashboardStats.totalMajors },
        { name: "Môn Học", icon: <BookOutlined />, path: "/Admin/content-management/subjects", count: dashboardStats.totalSubjects },
      ],
    },
    {
      title: "Kiểm tra & Đánh giá",
      description: "Quản lý bài kiểm tra và xem kết quả sinh viên",
      color: "#722ed1",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      items: [
        { name: "Bài Kiểm Tra Đầu Vào", icon: <CheckSquareOutlined />, path: "/Admin/content-management/initial-tests", count: 1 },
        { name: "Bài Thực Hành", icon: <ExperimentOutlined />, path: "/Admin/content-management/practice-tests", count: dashboardStats.totalTests },
        { name: "Kết Quả Sinh Viên", icon: <FileSearchOutlined />, path: "/Admin/content-management/student-tests" },
      ],
    },
    {
      title: "Khảo sát",
      description: "Tạo khảo sát và theo dõi phản hồi",
      color: "#fa8c16",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      items: [
        { name: "Quản lý Khảo Sát", icon: <FormOutlined />, path: "/Admin/content-management/surveys", count: dashboardStats.totalSurveys },
        { name: "Kết Quả Khảo Sát", icon: <BarChartOutlined />, path: "/Admin/content-management/student-surveys" },
      ],
    },
    {
      title: "Nội dung Học tập",
      description: "Quản lý mục tiêu và công nghệ",
      color: "#52c41a",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      items: [
        { name: "Mục Tiêu Học Tập", icon: <BulbOutlined />, path: "/Admin/content-management/learning-goals" },
        { name: "Công Nghệ", icon: <CodeOutlined />, path: "/Admin/content-management/technologies" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

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
                      {item.count !== undefined && <Tag className="m-0">{item.count}</Tag>}
                      <ArrowRightOutlined className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* System Overview & Quick Stats */}
      <Row gutter={[16, 16]} className="mt-6">
        {/* Content Statistics */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <BarChartOutlined className="text-blue-500" />
                <Text strong className="text-gray-900 dark:text-white">
                  Thống kê nội dung
                </Text>
              </div>
            }
            className="shadow-sm border-0 h-full"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <BankOutlined className="text-blue-500" />
                  <Text className="text-gray-700 dark:text-gray-300">Chuyên ngành</Text>
                </div>
                <Text strong className="text-2xl text-blue-600">{dashboardStats.totalMajors}</Text>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <BookOutlined className="text-green-500" />
                  <Text className="text-gray-700 dark:text-gray-300">Môn học</Text>
                </div>
                <Text strong className="text-2xl text-green-600">{dashboardStats.totalSubjects}</Text>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FormOutlined className="text-orange-500" />
                  <Text className="text-gray-700 dark:text-gray-300">Khảo sát</Text>
                </div>
                <Text strong className="text-2xl text-orange-600">{dashboardStats.totalSurveys}</Text>
              </div>

              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <ExperimentOutlined className="text-purple-500" />
                  <Text className="text-gray-700 dark:text-gray-300">Bài tập</Text>
                </div>
                <Text strong className="text-2xl text-purple-600">{dashboardStats.totalTests}</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* System Info */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-purple-500" />
                <Text strong className="text-gray-900 dark:text-white">
                  Thông tin hệ thống
                </Text>
              </div>
            }
            className="shadow-sm border-0 h-full"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-gray-600 dark:text-gray-400">Phiên bản</Text>
                <Tag color="blue" className="font-mono">v2.1.0</Tag>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-gray-600 dark:text-gray-400">Trạng thái</Text>
                <Tag color="green" icon={<SafetyOutlined />}>Hoạt động</Tag>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-gray-600 dark:text-gray-400">Cập nhật cuối</Text>
                <Text className="text-gray-700 dark:text-gray-300">08/12/2025</Text>
              </div>
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-600 dark:text-gray-400">Uptime</Text>
                <Tag color="cyan">99.8%</Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-green-500" />
                <Text strong className="text-gray-900 dark:text-white">
                  Tác vụ nhanh
                </Text>
              </div>
            }
            className="shadow-sm border-0 h-full"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="space-y-3">
              <div 
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors border border-blue-200 dark:border-blue-800"
                onClick={() => router.push('/Admin/content-management/majors')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BankOutlined className="text-blue-500" />
                    <Text className="text-gray-700 dark:text-gray-300">Tạo chuyên ngành</Text>
                  </div>
                  <ArrowRightOutlined className="text-blue-500" />
                </div>
              </div>

              <div 
                className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors border border-green-200 dark:border-green-800"
                onClick={() => router.push('/Admin/content-management/subjects')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOutlined className="text-green-500" />
                    <Text className="text-gray-700 dark:text-gray-300">Tạo môn học</Text>
                  </div>
                  <ArrowRightOutlined className="text-green-500" />
                </div>
              </div>

              <div 
                className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors border border-purple-200 dark:border-purple-800"
                onClick={() => router.push('/Admin/content-management/surveys')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FormOutlined className="text-purple-500" />
                    <Text className="text-gray-700 dark:text-gray-300">Tạo khảo sát</Text>
                  </div>
                  <ArrowRightOutlined className="text-purple-500" />
                </div>
              </div>

              <div 
                className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer transition-colors border border-orange-200 dark:border-orange-800"
                onClick={() => router.push('/Admin/syllabus-management')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSearchOutlined className="text-orange-500" />
                    <Text className="text-gray-700 dark:text-gray-300">Quản lý syllabus</Text>
                  </div>
                  <ArrowRightOutlined className="text-orange-500" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
