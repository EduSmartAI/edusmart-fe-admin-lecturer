'use client';

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, List, Tag, Empty, Space, Divider, Progress } from "antd";
import {
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  PlusOutlined,
  EyeOutlined,
  BarChartOutlined,
  TrophyOutlined,
  FireOutlined,
  ArrowUpOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { FadeInUp } from "EduSmart/components/Animation/FadeInUp";
import { useCourseManagementStore } from "EduSmart/stores/CourseManagement/CourseManagementStore";
import { useUserProfileStore } from "EduSmart/stores/User/UserProfileStore";
import Image from "next/image";

const LecturerDashboard: React.FC = () => {
  const router = useRouter();
  const { courses, isLoading, pagination, fetchCoursesByLecturer } = useCourseManagementStore();
  const { profile, loadProfile } = useUserProfileStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
    draftCourses: 0,
    avgRating: 4.5,
    completionRate: 0
  });

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  // Fetch all courses for dashboard statistics
  useEffect(() => {
    // Fetch with large pageSize to get ALL courses for accurate stats
    // Using 1000 to ensure we get all courses (assuming no lecturer has more than 1000 courses)
    console.log('📊 Dashboard: Fetching all courses for statistics...');
    fetchCoursesByLecturer({ pageIndex: 0, pageSize: 1000 });
  }, [fetchCoursesByLecturer]);

  useEffect(() => {
    // Use pagination.totalCount for accurate total courses count from API
    const totalCourses = pagination.totalCount || 0;

    console.log('📊 Dashboard Stats Calculation:', {
      totalCoursesFromAPI: pagination.totalCount,
      coursesInArray: courses.length,
      pageSize: pagination.pageSize
    });

    if (totalCourses > 0 && courses.length > 0) {
      // Calculate stats from ALL fetched courses
      const totalStudents = courses.reduce((sum, course) => sum + (course.learnerCount || 0), 0);

      const publishedCourses = courses.filter(c => c.isActive).length;
      const draftCourses = courses.filter(c => !c.isActive).length;
      const completionRate = totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0;

      console.log('✅ Dashboard Stats:', {
        totalCourses,
        totalStudents,
        publishedCourses,
        draftCourses
      });

      setStats({
        totalCourses,
        totalStudents,
        publishedCourses,
        draftCourses,
        avgRating: 4.5,
        completionRate
      });
    }
  }, [courses, pagination.totalCount, pagination.pageSize]);

  const recentCourses = courses.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <FadeInUp>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {/* Welcome Header Section */}
          <div className="mb-8 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 rounded-3xl shadow-2xl p-6 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

            <div className="relative z-10">
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={16}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 shadow-lg">
                      👋
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 truncate">
                        {getGreeting()}, {profile?.name || 'Giảng viên'}!
                      </h1>
                      <p className="text-white/90 text-base sm:text-lg">
                        Chào mừng bạn quay trở lại với bảng điều khiển giảng viên
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => router.push('/Lecturer/courses/create-course')}
                      className="bg-white text-emerald-600 border-0 hover:bg-white/95 shadow-lg font-semibold px-6 h-12"
                    >
                      Tạo khóa học mới
                    </Button>
                    <Button
                      size="large"
                      icon={<BookOutlined />}
                      onClick={() => router.push('/Lecturer/courses')}
                      className="bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 px-6 h-12"
                    >
                      Xem tất cả
                    </Button>
                  </div>
                </Col>

                <Col xs={24} lg={8}>
                  <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                    <div className="text-center">
                      <div className="text-5xl sm:text-6xl font-bold mb-2">{stats.totalCourses}</div>
                      <div className="text-white/90 text-base sm:text-lg mb-4 font-medium">Tổng khóa học</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <span className="text-white/80">Đã xuất bản</span>
                          <span className="font-bold text-lg">{stats.publishedCourses}</span>
                        </div>
                        <Progress
                          percent={stats.completionRate}
                          strokeColor="#fff"
                          trailColor="rgba(255,255,255,0.3)"
                          strokeWidth={8}
                          showInfo={false}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChartOutlined className="text-emerald-600" />
              Thống kê tổng quan
            </h2>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Học viên</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {stats.totalStudents}
                      </div>
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <ArrowUpOutlined />
                        <span>+12% tháng này</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserOutlined className="text-white text-2xl" />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Khóa học</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {stats.publishedCourses}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {stats.draftCourses} bản nháp
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOutlined className="text-white text-2xl" />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          <Row gutter={[16, 16]}>
            {/* Recent Courses */}
            <Col xs={24} lg={16}>
              <Card
                className="shadow-lg border-0 rounded-2xl h-full hover:shadow-xl transition-shadow duration-300"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <FireOutlined className="text-white" />
                      </div>
                      <span className="font-bold text-lg">Khóa học gần đây</span>
                    </div>
                    <Button
                      type="link"
                      onClick={() => router.push('/Lecturer/courses')}
                      className="text-emerald-600 font-semibold hover:text-emerald-700"
                    >
                      Xem tất cả →
                    </Button>
                  </div>
                }
                styles={{ body: { padding: '20px' } }}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
                  </div>
                ) : recentCourses.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={recentCourses}
                    renderItem={(course) => (
                      <List.Item
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50/30 dark:hover:from-gray-800 dark:hover:to-emerald-900/10 rounded-xl px-4 py-3 transition-all duration-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                        actions={[
                          <Button
                            key="view"
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => router.push(`/Lecturer/courses/${course.courseId}`)}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 hover:from-emerald-600 hover:to-emerald-700 shadow-md h-10"
                          >
                            Xem
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-gray-700">
                              {course.courseImageUrl &&
                                course.courseImageUrl.trim() !== '' &&
                                !course.courseImageUrl.includes('example.com') ? (
                                <Image
                                  src={course.courseImageUrl}
                                  alt={course.title || 'Course'}
                                  fill
                                  className="object-cover"
                                  quality={75}
                                  sizes="96px"
                                  priority={false}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    console.log('❌ Image load error for:', course.title, course.courseImageUrl);
                                  }}
                                />
                              ) : (
                                <BookOutlined className="text-4xl text-white" />
                              )}
                              <div className="absolute top-2 right-2 z-10">
                                <Tag color={course.isActive ? 'success' : 'warning'} className="text-xs m-0 font-semibold shadow-md">
                                  {course.isActive ? 'Đã XB' : 'Nháp'}
                                </Tag>
                              </div>
                            </div>
                          }
                          title={
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                              {course.title || 'Untitled Course'}
                            </div>
                          }
                          description={
                            <div className="space-y-2">
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <UserOutlined className="text-base" /> {course.learnerCount || 0} HV
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                  <ClockCircleOutlined className="text-base" /> {course.durationHours || 0}h
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-600">
                                {(course.price || 0).toLocaleString()} VND
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    description={
                      <div className="py-8">
                        <div className="text-gray-400 text-lg mb-2">Chưa có khóa học nào</div>
                        <div className="text-gray-500 text-sm mb-4">
                          Hãy tạo khóa học đầu tiên của bạn
                        </div>
                      </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => router.push('/Lecturer/courses/create-course')}
                      className="bg-emerald-600 border-emerald-600"
                    >
                      Tạo khóa học đầu tiên
                    </Button>
                  </Empty>
                )}
              </Card>
            </Col>

            {/* Quick Actions & Stats */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" size={16} className="w-full">
                {/* Quick Actions Card */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <RiseOutlined className="text-emerald-600" />
                      <span className="font-semibold">Hành động nhanh</span>
                    </div>
                  }
                  className="shadow-md border-0 rounded-xl"
                  styles={{ body: { padding: '16px' } }}
                >
                  <Space direction="vertical" size={12} className="w-full">
                    <Button
                      block
                      size="large"
                      icon={<BookOutlined />}
                      onClick={() => router.push('/Lecturer/courses')}
                      className="h-auto py-4 text-left bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 hover:from-emerald-600 hover:to-emerald-700 shadow-md"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-semibold text-base">Quản lý khóa học</div>
                        </div>
                        <BookOutlined className="text-2xl" />
                      </div>
                    </Button>

                    <Button
                      block
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => router.push('/Lecturer/courses/create-course')}
                      className="h-auto py-4 text-left bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-semibold text-base">Tạo khóa học mới</div>
                        </div>
                        <PlusOutlined className="text-2xl" />
                      </div>
                    </Button>
                  </Space>
                </Card>

                {/* Performance Card */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                        <TrophyOutlined className="text-white" />
                      </div>
                      <span className="font-bold">Hiệu suất</span>
                    </div>
                  }
                  className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-shadow duration-300"
                  styles={{ body: { padding: '20px' } }}
                >
                  <Space direction="vertical" size={20} className="w-full">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tỷ lệ hoàn thành</span>
                        <span className="font-bold text-lg text-emerald-600">{stats.completionRate}%</span>
                      </div>
                      <Progress
                        percent={stats.completionRate}
                        strokeColor={{
                          '0%': '#10b981',
                          '100%': '#059669',
                        }}
                        strokeWidth={10}
                        className="font-semibold"
                      />
                    </div>

                    <Divider className="my-1" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{stats.publishedCourses}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Đã xuất bản</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="text-3xl font-bold text-orange-600 mb-1">{stats.draftCourses}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Bản nháp</div>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>
        </div>
      </FadeInUp>
    </div>
  );
};

export default LecturerDashboard;
