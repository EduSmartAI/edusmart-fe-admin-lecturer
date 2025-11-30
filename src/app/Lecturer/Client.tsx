'use client';

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, List, Tag, Empty, Space, Divider, Progress } from "antd";
import { 
  BookOutlined, 
  UserOutlined, 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
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
  const { courses, isLoading, fetchCoursesByLecturer } = useCourseManagementStore();
  const { profile, loadProfile } = useUserProfileStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalVideos: 0,
    totalRevenue: 0,
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

  useEffect(() => {
    fetchCoursesByLecturer();
  }, [fetchCoursesByLecturer]);

  useEffect(() => {
    if (courses.length > 0) {
      const totalStudents = courses.reduce((sum, course) => sum + (course.learnerCount || 0), 0);
      const totalVideos = courses.length * 5;
      const totalRevenue = courses.reduce((sum, course) => sum + (course.price * (course.learnerCount || 0)), 0);
      const publishedCourses = courses.filter(c => c.isActive).length;
      const draftCourses = courses.filter(c => !c.isActive).length;
      const completionRate = publishedCourses > 0 ? Math.round((publishedCourses / courses.length) * 100) : 0;

      setStats({
        totalCourses: courses.length,
        totalStudents,
        totalVideos,
        totalRevenue,
        publishedCourses,
        draftCourses,
        avgRating: 4.5,
        completionRate
      });
    }
  }, [courses]);

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
          <div className="mb-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={18}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                      👋
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 truncate">
                        {getGreeting()}, {profile?.name || 'Giảng viên'}!
                      </h1>
                      <p className="text-white/90 text-sm sm:text-base">
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
                      className="bg-white text-emerald-600 border-0 hover:bg-white/90 shadow-lg font-semibold"
                    >
                      Tạo khóa học mới
                    </Button>
                    <Button 
                      size="large"
                      icon={<BookOutlined />}
                      onClick={() => router.push('/Lecturer/courses')}
                      className="bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30"
                    >
                      Xem tất cả
                    </Button>
                  </div>
                </Col>
                
                <Col xs={24} lg={6}>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-bold mb-1">{stats.totalCourses}</div>
                      <div className="text-white/80 text-sm sm:text-base mb-3">Tổng khóa học</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-white/70">Đã xuất bản</span>
                          <span className="font-semibold">{stats.publishedCourses}</span>
                        </div>
                        <Progress 
                          percent={stats.completionRate} 
                          strokeColor="#fff"
                          trailColor="rgba(255,255,255,0.2)"
                          size="small"
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
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Học viên</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stats.totalStudents}
                      </div>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <ArrowUpOutlined />
                        <span>+12% tháng này</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <UserOutlined className="text-white text-xl" />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card 
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Khóa học</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stats.publishedCourses}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {stats.draftCourses} bản nháp
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOutlined className="text-white text-xl" />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card 
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Video bài học</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stats.totalVideos}
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 text-sm">
                        <PlayCircleOutlined />
                        <span>Đã tải lên</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <PlayCircleOutlined className="text-white text-xl" />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card 
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Doanh thu</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {(stats.totalRevenue / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-gray-500 text-sm">VND</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarOutlined className="text-white text-xl" />
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
                className="shadow-md border-0 rounded-xl h-full"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FireOutlined className="text-orange-500" />
                      <span className="font-semibold">Khóa học gần đây</span>
                    </div>
                    <Button 
                      type="link" 
                      onClick={() => router.push('/Lecturer/courses')}
                      className="text-emerald-600"
                    >
                      Xem tất cả →
                    </Button>
                  </div>
                }
                styles={{ body: { padding: '16px' } }}
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
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-4 transition-all duration-200"
                        actions={[
                          <Button 
                            key="view" 
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => router.push(`/Lecturer/courses/${course.courseId}`)}
                            className="bg-emerald-600 border-emerald-600"
                          >
                            Xem
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                              {course.courseImageUrl && 
                               course.courseImageUrl.trim() !== '' && 
                               !course.courseImageUrl.includes('example.com') ? (
                                <Image
                                  src={course.courseImageUrl}
                                  alt={course.title || 'Course'}
                                  fill
                                  className="object-cover"
                                  quality={75}
                                  sizes="80px"
                                  priority={false}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    console.log('❌ Image load error for:', course.title, course.courseImageUrl);
                                  }}
                                />
                              ) : (
                                <BookOutlined className="text-3xl text-white" />
                              )}
                              <div className="absolute top-1 right-1 z-10">
                                <Tag color={course.isActive ? 'success' : 'warning'} className="text-xs m-0">
                                  {course.isActive ? 'Đã XB' : 'Nháp'}
                                </Tag>
                              </div>
                            </div>
                          }
                          title={
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
                              {course.title || 'Untitled Course'}
                            </div>
                          }
                          description={
                            <div className="space-y-1">
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <UserOutlined /> {course.learnerCount || 0} HV
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClockCircleOutlined /> {course.durationHours || 0}h
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                                  {(course.price || 0).toLocaleString()} VND
                                </span>
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
                      className="h-auto py-4 text-left bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-semibold text-base">Quản lý khóa học</div>
                        </div>
                        <BookOutlined className="text-xl" />
                      </div>
                    </Button>
                    
                    <Button 
                      block 
                      size="large"
                      icon={<BarChartOutlined />}
                      onClick={() => router.push('/Lecturer/courses/analytics')}
                      className="h-auto py-4 text-left bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-semibold text-base">Thống kê & Phân tích</div>
                        </div>
                        <BarChartOutlined className="text-xl" />
                      </div>
                    </Button>
                  </Space>
                </Card>

                {/* Performance Card */}
                <Card 
                  title={
                    <div className="flex items-center gap-2">
                      <TrophyOutlined className="text-yellow-500" />
                      <span className="font-semibold">Hiệu suất</span>
                    </div>
                  }
                  className="shadow-md border-0 rounded-xl"
                  styles={{ body: { padding: '16px' } }}
                >
                  <Space direction="vertical" size={16} className="w-full">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Tỷ lệ hoàn thành</span>
                        <span className="font-semibold text-emerald-600">{stats.completionRate}%</span>
                      </div>
                      <Progress 
                        percent={stats.completionRate} 
                        strokeColor={{
                          '0%': '#10b981',
                          '100%': '#059669',
                        }}
                        size="small"
                      />
                    </div>
                    
                    <Divider className="my-2" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.publishedCourses}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Đã xuất bản</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.draftCourses}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bản nháp</div>
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
