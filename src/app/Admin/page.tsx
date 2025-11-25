"use client";

import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Badge } from "antd";
import {
  FileTextOutlined,
  AppstoreOutlined,
  AimOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  useSurveyStore,
  useStudentSurveyStore,
  useStudentTestStore,
  useInitialTestStore,
  usePracticeTestStore,
  useTechnologyStore,
  useLearningGoalStore,
} from "EduSmart/stores/Admin";

/**
 * Admin Dashboard Component
 * Hiển thị tổng quan quản trị và các công cụ quản lý
 */
export default function AdminDashboard() {
  const router = useRouter();

  // Get data from stores
  const { total: surveysTotal, fetchSurveys } = useSurveyStore();
  const { total: studentSurveysTotal, fetchSurveys: fetchStudentSurveys } = useStudentSurveyStore();
  const { total: studentTestsTotal, fetchTests: fetchStudentTests } = useStudentTestStore();
  const { total: initialTestsTotal, fetchTests: fetchInitialTests } = useInitialTestStore();
  const { total: practiceTestsTotal, fetchPracticeTests } = usePracticeTestStore();
  const { total: technologiesTotal, fetchTechnologies } = useTechnologyStore();
  const { total: learningGoalsTotal, fetchGoals } = useLearningGoalStore();

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchSurveys(1, 10),
          fetchStudentSurveys(1, 10),
          fetchStudentTests(0, 10), // Student tests uses 0-based page
          fetchInitialTests(1, 10),
          fetchPracticeTests(1, 10),
          fetchTechnologies(1, 10),
          fetchGoals(1, 10),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchAllData();
  }, [fetchSurveys, fetchStudentSurveys, fetchStudentTests, fetchInitialTests, fetchPracticeTests, fetchTechnologies, fetchGoals]);

  // Menu items với thông tin đầy đủ
  const managementCards = [
    {
      title: "Mục tiêu Học tập",
      description: "Quản lý định hướng nghề nghiệp và mục tiêu học tập của học viên",
      icon: AimOutlined,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      route: "/Admin/content-management/learning-goals",
      stats: { label: "Mục tiêu", value: learningGoalsTotal },
    },
    {
      title: "Công nghệ",
      description: "Quản lý ngôn ngữ lập trình, framework, database và công cụ",
      icon: CodeOutlined,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      route: "/Admin/content-management/technologies",
      stats: { label: "Công nghệ", value: technologiesTotal },
    },
    {
      title: "Khảo sát",
      description: "Tạo và quản lý khảo sát phản hồi về khóa học từ học viên",
      icon: FileTextOutlined,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      route: "/Admin/content-management/surveys",
      stats: { label: "Khảo sát", value: surveysTotal },
    },
    {
      title: "Kết quả Khảo sát",
      description: "Xem và phân tích kết quả khảo sát từ học viên",
      icon: BarChartOutlined,
      color: "cyan",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      borderColor: "border-cyan-200",
      route: "/Admin/content-management/student-surveys",
      stats: { label: "Phản hồi", value: studentSurveysTotal },
    },
    {
      title: "Kết quả Bài kiểm tra",
      description: "Xem điểm số và phân tích chi tiết kết quả kiểm tra",
      icon: CheckCircleOutlined,
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      route: "/Admin/content-management/student-tests",
      stats: { label: "Bài kiểm tra", value: studentTestsTotal },
    },
    {
      title: "Bài kiểm tra Đầu vào",
      description: "Quản lý bài kiểm tra đánh giá trình độ ban đầu",
      icon: FormOutlined,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      route: "/Admin/content-management/initial-tests",
      stats: { label: "Bài test", value: initialTestsTotal },
    },
    {
      title: "Bài tập Thực hành",
      description: "Quản lý bài tập coding và thực hành lập trình",
      icon: AppstoreOutlined,
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200",
      route: "/Admin/content-management/practice-tests",
      stats: { label: "Bài tập", value: practiceTestsTotal },
    },
  ];

  // Statistics overview
  const overviewStats = [
    {
      title: "Tổng Mục tiêu",
      value: learningGoalsTotal,
      icon: AimOutlined,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Tổng Công nghệ",
      value: technologiesTotal,
      icon: CodeOutlined,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Khảo sát Đã tạo",
      value: surveysTotal,
      icon: FileTextOutlined,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Bài test Đầu vào",
      value: initialTestsTotal,
      icon: FormOutlined,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Bảng điều khiển Quản trị
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Chào mừng đến với Hệ thống Quản lý EduSmart
              </p>
            </div>
            <Badge.Ribbon text="Admin" color="blue">
              <Card className="shadow-sm border-0">
                <div className="text-center px-6">
                  <p className="text-sm text-gray-500 mb-1">Quyền truy cập</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quản trị viên
                  </p>
                </div>
              </Card>
            </Badge.Ribbon>
          </div>
        </div>

        {/* Overview Statistics */}
        <Row gutter={[16, 16]} className="mb-8">
          {overviewStats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                className="shadow-sm hover:shadow-md transition-all border-0 h-full"
                styles={{ body: { padding: '20px' } }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <Statistic
                      value={stat.value}
                      valueStyle={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                      }}
                    />
                  </div>
                  <div className={`w - 14 h - 14 rounded - lg ${stat.bgColor} flex items - center justify - center`}>
                    <stat.icon className={`text - 3xl ${stat.iconColor} `} />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý Nội dung
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý mục tiêu học tập, công nghệ, khảo sát và bài kiểm tra
          </p>
        </div>

        {/* Management Cards Grid */}
        <Row gutter={[24, 24]} className="mb-8">
          {managementCards.map((card, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                className={`shadow - sm hover: shadow - xl transition - all cursor - pointer h - full border - l - 4 ${card.borderColor} hover: scale - 105`}
                styles={{ body: { padding: '24px' } }}
                onClick={() => router.push(card.route)}
              >
                <div className="flex flex-col h-full">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w - 14 h - 14 rounded - xl ${card.bgColor} flex items - center justify - center`}>
                      <card.icon className={`text - 3xl ${card.iconColor} `} />
                    </div>
                    <Badge
                      count={card.stats.value}
                      showZero
                      style={{
                        backgroundColor: card.color === 'blue' ? '#3b82f6' :
                          card.color === 'green' ? '#10b981' :
                            card.color === 'orange' ? '#f97316' :
                              card.color === 'cyan' ? '#06b6d4' :
                                card.color === 'emerald' ? '#059669' :
                                  card.color === 'purple' ? '#a855f7' :
                                    '#6366f1',
                      }}
                    />
                  </div>

                  {/* Title and Description */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Stats Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {card.stats.label}
                      </span>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm">
                        <span>Quản lý</span>
                        <ArrowRightOutlined className="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Info Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <BarChartOutlined className="text-blue-600" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Thống kê Chi tiết
                  </span>
                </div>
              }
              className="shadow-sm border-0 h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Khảo sát đã tạo
                  </span>
                  <span className="text-lg font-bold text-blue-600">{surveysTotal}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Công nghệ quản lý
                  </span>
                  <span className="text-lg font-bold text-green-600">{technologiesTotal}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phản hồi khảo sát
                  </span>
                  <span className="text-lg font-bold text-orange-600">{studentSurveysTotal}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bài tập thực hành
                  </span>
                  <span className="text-lg font-bold text-purple-600">{practiceTestsTotal}</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-green-600" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Hệ thống
                  </span>
                </div>
              }
              className="shadow-sm border-0 h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng thái hệ thống
                  </span>
                  <Badge status="success" text="Hoạt động tốt" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phiên bản
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    v1.0.0
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cơ sở dữ liệu
                  </span>
                  <Badge status="success" text="Đã kết nối" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
