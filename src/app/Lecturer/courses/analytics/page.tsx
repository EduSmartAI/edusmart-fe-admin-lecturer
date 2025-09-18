'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  DatePicker, 
  Button,
  Table,
  Progress,
  Breadcrumb,
  Tabs,
  List,
  Avatar,
  Badge
} from 'antd';
import {
  ArrowUpOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  StarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';
import { useCourseManagementStore } from 'EduSmart/stores/CourseManagement/CourseManagementStore';

const { RangePicker } = DatePicker;
// Remove unused Typography destructuring

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalStudents: number;
  studentGrowth: number;
  totalCourses: number;
  avgRating: number;
  completionRate: number;
  watchTime: number;
}

interface TopCourse {
  id: string;
  title: string;
  students: number;
  revenue: number;
  rating: number;
  completionRate: number;
  thumbnail: string;
}

interface StudentActivity {
  id: string;
  name: string;
  avatar?: string;
  coursesEnrolled: number;
  completionRate: number;
  lastActive: string;
  totalSpent: number;
}

const AnalyticsPage: React.FC = () => {
  const { courses } = useCourseManagementStore();
  const [dateRange, setDateRange] = useState<string>('30days');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data - in a real app, this would come from API
  const analyticsData: AnalyticsData = {
    totalRevenue: 15750000,
    revenueGrowth: 12.5,
    totalStudents: 1248,
    studentGrowth: 8.3,
    totalCourses: courses.length,
    avgRating: 4.7,
    completionRate: 78,
    watchTime: 285
  };

  const topCourses: TopCourse[] = [
    {
      id: '1',
      title: 'Lập trình ReactJS cho người mới bắt đầu',
      students: 156,
      revenue: 46644000,
      rating: 4.8,
      completionRate: 85,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200'
    },
    {
      id: '2',
      title: 'Java Spring Boot Fundamentals',
      students: 203,
      revenue: 81097000,
      rating: 4.6,
      completionRate: 72,
      thumbnail: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=200'
    },
    {
      id: '4',
      title: 'C# và .NET Core Development',
      students: 87,
      revenue: 39063000,
      rating: 4.9,
      completionRate: 91,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'
    }
  ];

  const studentActivities: StudentActivity[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      coursesEnrolled: 3,
      completionRate: 92,
      lastActive: '2 giờ trước',
      totalSpent: 1197000
    },
    {
      id: '2',
      name: 'Trần Thị B',
      coursesEnrolled: 2,
      completionRate: 75,
      lastActive: '1 ngày trước',
      totalSpent: 698000
    },
    {
      id: '3',
      name: 'Lê Minh C',
      coursesEnrolled: 4,
      completionRate: 88,
      lastActive: '3 giờ trước',
      totalSpent: 1596000
    }
  ];

  const revenueData = [
    { month: 'Tháng 1', revenue: 2500000, students: 45 },
    { month: 'Tháng 2', revenue: 3200000, students: 62 },
    { month: 'Tháng 3', revenue: 2800000, students: 51 },
    { month: 'Tháng 4', revenue: 4100000, students: 78 },
    { month: 'Tháng 5', revenue: 3700000, students: 69 },
    { month: 'Tháng 6', revenue: 4500000, students: 89 }
  ];

  const topCoursesColumns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: TopCourse) => (
        <div className="flex items-center gap-3">
          <Image 
            src={record.thumbnail} 
            alt={title} 
            width={48}
            height={32}
            className="object-cover rounded"
          />
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-gray-500">
              <StarOutlined className="text-yellow-500" /> {record.rating}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students',
      render: (students: number) => (
        <div className="text-center">
          <div className="font-medium">{students}</div>
          <div className="text-xs text-gray-500">người học</div>
        </div>
      )
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <div className="text-center">
          <div className="font-medium text-emerald-600">
            {revenue.toLocaleString()} VND
          </div>
        </div>
      )
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <div className="text-center">
          <Progress 
            type="circle" 
            size={50} 
            percent={rate} 
            format={(percent) => `${percent}%`}
          />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FadeInUp>
        <div className="p-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <Link href="/Lecturer/courses" className="text-emerald-600 hover:text-emerald-700">
                Quản lý khóa học
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Thống kê & Phân tích</Breadcrumb.Item>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Thống kê & Phân tích
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Theo dõi hiệu suất và phân tích dữ liệu khóa học
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={dateRange} onChange={setDateRange} className="w-40">
                <Select.Option value="7days">7 ngày qua</Select.Option>
                <Select.Option value="30days">30 ngày qua</Select.Option>
                <Select.Option value="90days">3 tháng qua</Select.Option>
                <Select.Option value="1year">1 năm qua</Select.Option>
              </Select>
              <RangePicker />
              <Button type="primary" icon={<DownloadOutlined />}>
                Xuất báo cáo
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={analyticsData.totalRevenue}
                  formatter={(value) => `${Number(value).toLocaleString()} VND`}
                  prefix={<DollarOutlined className="text-emerald-500" />}
                  suffix={
                    <div className="flex items-center text-sm">
                      <ArrowUpOutlined className="text-green-500" />
                      <span className="text-green-500 ml-1">{analyticsData.revenueGrowth}%</span>
                    </div>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng học viên"
                  value={analyticsData.totalStudents}
                  prefix={<UserOutlined className="text-blue-500" />}
                  suffix={
                    <div className="flex items-center text-sm">
                      <ArrowUpOutlined className="text-green-500" />
                      <span className="text-green-500 ml-1">{analyticsData.studentGrowth}%</span>
                    </div>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Khóa học đã tạo"
                  value={analyticsData.totalCourses}
                  prefix={<BookOutlined className="text-purple-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đánh giá trung bình"
                  value={analyticsData.avgRating}
                  precision={1}
                  prefix={<StarOutlined className="text-yellow-500" />}
                  suffix={
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* Additional KPIs */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={analyticsData.completionRate}
                  suffix="%"
                  prefix={<TrophyOutlined className="text-orange-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Thời gian xem TB"
                  value={analyticsData.watchTime}
                  suffix="phút"
                  prefix={<ClockCircleOutlined className="text-indigo-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Khóa học mới</div>
                    <div className="text-2xl font-bold">2</div>
                  </div>
                  <Badge count="NEW" color="green">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOutlined className="text-green-600 text-xl" />
                    </div>
                  </Badge>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Lượt xem hôm nay</div>
                    <div className="text-2xl font-bold">1,234</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <EyeOutlined className="text-blue-600 text-xl" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Detailed Analytics Tabs */}
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'overview',
                  label: (
                    <span>
                      <BarChartOutlined /> Tổng quan
                    </span>
                  ),
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={16}>
                        <Card title="Doanh thu theo tháng" className="h-full">
                          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-center text-gray-500">
                              <LineChartOutlined className="text-4xl mb-2" />
                              <div>Biểu đồ doanh thu sẽ hiển thị tại đây</div>
                              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                {revenueData.slice(-4).map((item, index) => (
                                  <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded">
                                    <div className="font-medium">{item.month}</div>
                                    <div className="text-emerald-600">{item.revenue.toLocaleString()} VND</div>
                                    <div className="text-gray-500">{item.students} học viên</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} lg={8}>
                        <Card title="Hoạt động học viên gần đây" className="h-full">
                          <List
                            dataSource={studentActivities}
                            renderItem={(student) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<Avatar icon={<UserOutlined />} />}
                                  title={student.name}
                                  description={
                                    <div className="space-y-1">
                                      <div className="text-xs">
                                        {student.coursesEnrolled} khóa học • {student.completionRate}% hoàn thành
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        Hoạt động: {student.lastActive}
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </Card>
                      </Col>
                    </Row>
                  )
                },
                {
                  key: 'courses',
                  label: (
                    <span>
                      <BookOutlined /> Khóa học
                    </span>
                  ),
                  children: (
                    <div className="space-y-6">
                      <Card title="Top khóa học hiệu suất cao">
                        <Table
                          dataSource={topCourses}
                          columns={topCoursesColumns}
                          pagination={false}
                          rowKey="id"
                        />
                      </Card>
                      
                      <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                          <Card title="Phân bố theo danh mục">
                            <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="text-center text-gray-500">
                                <PieChartOutlined className="text-4xl mb-2" />
                                <div>Biểu đồ phân bố danh mục</div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Card title="Xu hướng đăng ký">
                            <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="text-center text-gray-500">
                                <LineChartOutlined className="text-4xl mb-2" />
                                <div>Biểu đồ xu hướng đăng ký</div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'students',
                  label: (
                    <span>
                      <UserOutlined /> Học viên
                    </span>
                  ),
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={8}>
                        <Card title="Thống kê học viên">
                          <div className="space-y-4">
                            <Statistic
                              title="Học viên mới (tháng này)"
                              value={125}
                              prefix={<UserOutlined />}
                              suffix={
                                <span className="text-green-500 text-sm">
                                  <ArrowUpOutlined /> 15%
                                </span>
                              }
                            />
                            <Statistic
                              title="Tỷ lệ giữ chân"
                              value={89.5}
                              suffix="%"
                              prefix={<TrophyOutlined />}
                            />
                            <Statistic
                              title="Thời gian học TB/ngày"
                              value={45}
                              suffix="phút"
                              prefix={<ClockCircleOutlined />}
                            />
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} lg={16}>
                        <Card title="Top học viên tích cực">
                          <Table
                            dataSource={studentActivities}
                            columns={[
                              {
                                title: 'Học viên',
                                dataIndex: 'name',
                                render: (name: string) => (
                                  <div className="flex items-center gap-2">
                                    <Avatar icon={<UserOutlined />} />
                                    <span className="font-medium">{name}</span>
                                  </div>
                                )
                              },
                              {
                                title: 'Khóa học',
                                dataIndex: 'coursesEnrolled',
                                render: (count: number) => `${count} khóa học`
                              },
                              {
                                title: 'Hoàn thành',
                                dataIndex: 'completionRate',
                                render: (rate: number) => (
                                  <Progress percent={rate} size="small" />
                                )
                              },
                              {
                                title: 'Tổng chi tiêu',
                                dataIndex: 'totalSpent',
                                render: (amount: number) => (
                                  <span className="text-emerald-600 font-medium">
                                    {amount.toLocaleString()} VND
                                  </span>
                                )
                              }
                            ]}
                            pagination={false}
                            rowKey="id"
                          />
                        </Card>
                      </Col>
                    </Row>
                  )
                },
                {
                  key: 'revenue',
                  label: (
                    <span>
                      <DollarOutlined /> Doanh thu
                    </span>
                  ),
                  children: (
                    <div className="space-y-6">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} lg={8}>
                          <Card>
                            <Statistic
                              title="Doanh thu hôm nay"
                              value={450000}
                              formatter={(value) => `${Number(value).toLocaleString()} VND`}
                              prefix={<DollarOutlined className="text-emerald-500" />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Card>
                            <Statistic
                              title="Doanh thu tháng này"
                              value={12500000}
                              formatter={(value) => `${Number(value).toLocaleString()} VND`}
                              prefix={<DollarOutlined className="text-blue-500" />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Card>
                            <Statistic
                              title="Dự kiến tháng sau"
                              value={15000000}
                              formatter={(value) => `${Number(value).toLocaleString()} VND`}
                              prefix={<DollarOutlined className="text-purple-500" />}
                            />
                          </Card>
                        </Col>
                      </Row>
                      
                      <Card title="Doanh thu theo khóa học">
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="text-center text-gray-500">
                            <BarChartOutlined className="text-4xl mb-2" />
                            <div>Biểu đồ doanh thu theo khóa học</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>
      </FadeInUp>
    </div>
  );
};

export default AnalyticsPage;


