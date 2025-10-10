'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Card, 
  Button, 
  Descriptions, 
  Tag, 
  Space, 
  Statistic, 
  Row, 
  Col, 
  Tabs, 
  
  
  message, 
  Rate, 
  Breadcrumb,
  Typography,
  Dropdown,
  Empty
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DollarOutlined,
  ShareAltOutlined,
  MoreOutlined,
  
  
  
  PlusOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';
import { useCourseManagementStore } from 'EduSmart/stores/CourseManagement/CourseManagementStore';
import { CourseDto } from 'EduSmart/api/api-course-service';

const { Title, Text } = Typography;

// Helper function to map API course data to UI format
const mapCourseForUI = (course: CourseDto) => {
  return {
    ...course,
    // Add backward compatibility fields
    id: course.courseId, // Map courseId to id for UI compatibility
    studentCount: course.learnerCount,
    currency: 'VND', // Default currency as API doesn't provide this
    duration: course.durationHours,
    lecturerName: 'Instructor',
    status: course.isActive ? 'published' : 'draft' as const,
    rating: 0,
    reviewCount: 0,
    coverImage: course.courseImageUrl, // Map courseImageUrl to coverImage
    category: course.subjectCode || 'General', // Use subjectCode as category
  };
};



const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { courses, selectedCourse, fetchCourseById, error, clearError } = useCourseManagementStore();
  
  const [course, setCourse] = useState<ReturnType<typeof mapCourseForUI> | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const loadCourseData = useCallback(async () => {
    setLoading(true);
    
    // Try to fetch specific course by ID first
    await fetchCourseById(courseId);
    
    // Don't handle selectedCourse here - let the separate useEffect handle it
    setLoading(false);
  }, [courseId, fetchCourseById]);

  // Handle selectedCourse updates separately
  useEffect(() => {
    if (selectedCourse && selectedCourse.courseId === courseId) {
      // Convert CourseDetailDto to UI format
      const uiCourse = {
        ...selectedCourse,
        id: selectedCourse.courseId,
        studentCount: selectedCourse.learnerCount || 0,
        currency: 'VND',
        duration: selectedCourse.durationHours,
        lecturerName: 'Instructor Name', // TODO: Get from teacher API
        status: selectedCourse.isActive ? 'published' : 'draft' as const,
        rating: 4.5, // TODO: Get from reviews API
        reviewCount: 0, // TODO: Get from reviews API
        coverImage: selectedCourse.courseImageUrl,
        category: selectedCourse.subjectCode || 'General',
      };
      setCourse(uiCourse);
    } else if (!selectedCourse) {
      // Fallback to finding from courses list
      const foundCourse = courses.find(c => c.courseId === courseId);
      setCourse(foundCourse ? mapCourseForUI(foundCourse) : null);
    }
  }, [selectedCourse, courseId, courses]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Handle error display
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  if (!course) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOutlined className="text-2xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Khóa học không tồn tại
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Khóa học với ID &quot;{courseId}&quot; không được tìm thấy hoặc bạn không có quyền truy cập.
            </p>
          </div>
          <div className="space-x-3">
            <Button onClick={() => router.back()}>
              Quay lại
            </Button>
            <Button type="primary" onClick={() => router.push('/Lecturer/courses')}>
              Danh sách khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // At this point, course is guaranteed to be non-null

  // Note: Delete functionality not available in current API version

  const statusColors: Record<string, string> = {
    published: '#52c41a',
    draft: '#faad14',
    archived: '#f5222d'
  };

  const statusTexts: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    archived: 'Đã lưu trữ'
  };

  const levelTexts: Record<number, string> = {
    1: 'Cơ bản',
    2: 'Trung cấp',
    3: 'Nâng cao'
  };

  const actionItems = [
    {
      key: 'edit',
      label: 'Chỉnh sửa khóa học',
      icon: <EditOutlined />,
      onClick: () => router.push(`/Lecturer/courses/edit/${course.courseId}`)
    },
    {
      key: 'preview',
      label: 'Xem trước',
      icon: <EyeOutlined />,
      onClick: () => router.push(`/course/${course.courseId}`)
    },
    {
      key: 'share',
      label: 'Chia sẻ',
      icon: <ShareAltOutlined />,
      onClick: () => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(`${window.location.origin}/course/${course.courseId}`);
        }
      }
    }
  ];

  // Future use: Content and progress columns for analytics
  // const contentColumns = [...];
  // const progressColumns = [...];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
      <FadeInUp className="w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div>
              <Breadcrumb 
                className="mb-2"
                items={[
                  {
                    title: (
                      <Link href="/Lecturer/courses" className="text-emerald-600 hover:text-emerald-700">
                        Quản lý khóa học
                      </Link>
                    )
                  },
                  {
                    title: course.title || 'Untitled Course'
                  }
                ]}
              />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Chi tiết khóa học</h1>
            </div>
            <div className="flex items-center gap-3">
              <Dropdown
                menu={{ items: actionItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />}>
                  Hành động
                </Button>
              </Dropdown>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Course Preview & Quick Stats */}
            <div className="xl:col-span-3 xl:sticky top-24 space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thông tin khóa học</h2>
                
                {/* Course Image */}
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.title || 'Course image'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Tag color={statusColors[course.status]} className="font-medium">
                      {statusTexts[course.status]}
                    </Tag>
                  </div>
                </div>

                {/* Course Basic Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Tag color="blue">{course.category}</Tag>
                    <Tag color="green">{levelTexts[course.level || 1]}</Tag>
                    {course.duration && <Tag color="orange">{course.duration}h</Tag>}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {course.description}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thống kê nhanh</h3>
                <div className="space-y-4">
                  <Statistic
                    title="Học viên"
                    value={course.studentCount}
                    prefix={<UserOutlined />}
                  />
                  <Statistic
                    title="Đánh giá"
                    value={course.rating || 0}
                    suffix={`(${course.reviewCount || 0})`}
                    prefix={<StarOutlined />}
                  />
                  <Statistic
                    title="Giá"
                    value={course.price}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                  <Statistic
                    title="Doanh thu"
                    value={course.price * course.studentCount}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <Title level={2} className="!mb-2">
                  {course.title || 'Untitled Course'}
                </Title>
                <Text className="text-gray-600 dark:text-gray-400">
                  Ngày tạo: {new Date(course.createdAt).toLocaleDateString('vi-VN')} • 
                  Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                </Text>
              </div>

              {/* Tabs Content */}
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'overview',
                    label: 'Tổng quan',
                    children: (
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thông tin cơ bản</h3>
                          <Descriptions column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Ngày tạo">
                              {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật cuối">
                              {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảng viên">
                              {course.lecturerName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                              <Tag color={statusColors[course.status]}>
                                {statusTexts[course.status]}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                              {course.category}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cấp độ">
                              {levelTexts[course.level || 1]}
                            </Descriptions.Item>
                          </Descriptions>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Hành động nhanh</h3>
                          <Space wrap>
                            <Button 
                              type="primary" 
                              icon={<EditOutlined />}
                              onClick={() => router.push(`/Lecturer/courses/edit/${course.courseId}`)}
                            >
                              Chỉnh sửa khóa học
                            </Button>
                            <Button 
                              icon={<EyeOutlined />}
                              onClick={() => router.push(`/course/${course.courseId}`)}
                            >
                              Xem trước
                            </Button>
                            <Button 
                              icon={<BarChartOutlined />}
                              onClick={() => setActiveTab('analytics')}
                            >
                              Xem thống kê
                            </Button>
                            <Button 
                              icon={<ShareAltOutlined />}
                              onClick={() => {
                                if (typeof window !== 'undefined' && navigator.clipboard) {
                                  navigator.clipboard.writeText(`${window.location.origin}/course/${course.courseId}`);
                                }
                              }}
                            >
                              Chia sẻ
                            </Button>
                          </Space>
                        </div>
                      </div>
                    )
                  },
                {
                  key: 'content',
                  label: 'Nội dung',
                  children: (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Title level={4}>Danh sách bài học</Title>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => router.push(`/Lecturer/courses/edit/${course.courseId}`)}
                        >
                          Thêm nội dung
                        </Button>
                      </div>
                      <Empty 
                        description="Chưa có nội dung bài học"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )
                },
                {
                  key: 'students',
                  label: 'Học viên',
                  children: (
                    <div className="space-y-4">
                      <Title level={4}>Tiến độ học viên</Title>
                      <Empty 
                        description="Chưa có học viên đăng ký"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )
                },
                {
                  key: 'reviews',
                  label: 'Đánh giá',
                  children: (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Title level={4}>Đánh giá từ học viên</Title>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {course.rating} / 5.0
                          </div>
                          <Rate disabled value={course.rating} className="text-sm" />
                          <div className="text-sm text-gray-500">
                            {course.reviewCount} đánh giá
                          </div>
                        </div>
                      </div>
                      <Empty 
                        description="Chưa có đánh giá nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )
                },
                {
                  key: 'analytics',
                  label: 'Thống kê',
                  children: (
                    <div className="space-y-6">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                          <Card>
                            <Statistic
                              title="Tổng số học viên"
                              value={course.studentCount}
                              prefix={<UserOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card>
                            <Statistic
                              title="Tỷ lệ hoàn thành"
                              value={75}
                              suffix="%"
                              prefix={<BookOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card>
                            <Statistic
                              title="Thời gian học TB"
                              value={28}
                              suffix="phút/ngày"
                              prefix={<ClockCircleOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card>
                            <Statistic
                              title="Doanh thu"
                              value={course.price * course.studentCount}
                              prefix={<DollarOutlined />}
                              formatter={(value) => `${Number(value).toLocaleString()} VND`}
                            />
                          </Card>
                        </Col>
                      </Row>

                      {/* Learning Progress Chart Placeholder */}
                      <Card title="Thống kê tiến độ học tập">
                        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-center text-gray-500">
                            <BarChartOutlined className="text-4xl mb-2" />
                            <div>Biểu đồ thống kê sẽ được hiển thị tại đây</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                }
              ]}
              />
            </div>

            {/* Mobile Preview (for mobile) */}
            <div className="xl:hidden mt-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thông tin khóa học</h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.title || 'Course image'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Tag color={statusColors[course.status]} className="font-medium">
                      {statusTexts[course.status]}
                    </Tag>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Statistic
                    title="Học viên"
                    value={course.studentCount}
                    prefix={<UserOutlined />}
                  />
                  <Statistic
                    title="Đánh giá"
                    value={course.rating || 0}
                    suffix={`(${course.reviewCount || 0})`}
                    prefix={<StarOutlined />}
                  />
                  <Statistic
                    title="Giá"
                    value={course.price}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                  <Statistic
                    title="Doanh thu"
                    value={course.price * course.studentCount}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

export default CourseDetailPage;
