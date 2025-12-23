'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Button, 
  Tag, 
  Space, 
  Card, 
  Tabs, 
  Input, 
  Select, 
  Dropdown, 
  Radio,
  Statistic,
  Empty,
  App,
  Pagination
} from 'antd';
import { 
  EditOutlined, 
  PlusOutlined, 
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  MoreOutlined,
  DeleteOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ExclamationCircleFilled,
  DollarOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useCourseManagementStore } from 'EduSmart/stores/CourseManagement/CourseManagementStore';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useUserProfileStore } from 'EduSmart/stores/User/UserProfileStore';
import { CourseSortBy } from 'EduSmart/api/api-course-service';
import BaseControlTable from 'EduSmart/components/Table/BaseControlTable';
import { Course, CourseDto } from 'EduSmart/types/course';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';
import Image from 'next/image';
/* eslint-disable react-hooks/exhaustive-deps */

type CourseWithKey = Course & { key: React.Key };

const CourseManagementPage: React.FC = () => {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const {
    courses,
    isLoading,
    error,
    pagination,
    fetchCoursesByLecturer,
    deleteCourse,
    clearError,
  } = useCourseManagementStore();

  const { /* resetForm, */ forceResetForCreateMode, setCreateMode } = useCreateCourseStore();
  const { profile, loadProfile } = useUserProfileStore();

  // State for view and filters
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<CourseSortBy>(CourseSortBy.CreatedAt);
  const [currentPage, setCurrentPage] = useState(1); // Client-side pagination state
  
  // Load user profile on mount
  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  // Fetch ALL courses for accurate statistics on course management page
  useEffect(() => {
    // Fetch with large pageSize to get all courses for stats
    // The pagination component will handle display properly
    fetchCoursesByLecturer({ pageIndex: 0, pageSize: 1000 });
  }, []); // Remove fetchCoursesByLecturer from dependencies to prevent infinite loop

  // Fetch courses when sort changes (with ALL courses)
  useEffect(() => {
    fetchCoursesByLecturer({ sortBy, pageIndex: 0, pageSize: 1000 });
    setCurrentPage(1); // Reset to page 1 when sort changes
  }, [sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, selectedLevel, selectedCategory]);

  // Handle error display
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]); // Remove clearError from dependencies to prevent infinite loop

  // Handle navigation to create course
  const handleCreateCourse = () => {
    console.log('🔄 Resetting course creation form...');
    
    // Set create mode and force reset
    setCreateMode(true);
    forceResetForCreateMode();
    
    // Small delay to ensure reset completes before navigation
    setTimeout(() => {
      router.push('/Lecturer/courses/create-course');
    }, 100);
  };

  const showDeleteConfirm = (course: Course) => {
    modal.confirm({
      title: 'Xóa khóa học',
      icon: <ExclamationCircleFilled className="text-red-500" />,
      content: `Bạn có chắc chắn muốn xóa khóa học "${course.title}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        const success = await deleteCourse(course.id);
        if (success) {
          message.success('Đã xóa khóa học thành công');
        }
      },
    });
  };



  // Helper function to map CourseDto to UI format
  const mapCourseForUI = (course: CourseDto): Course => ({
    id: course.courseId,
    title: course.title || 'Untitled Course',
    description: course.description || '',
    status: course.isActive ? 'published' : 'draft',
    price: course.price,
    dealPrice: course.dealPrice,
    currency: 'VND',
    studentCount: course.learnerCount || 0,
    category: course.subjectCode || 'General',
    level: course.level === 1 ? 'beginner' : course.level === 2 ? 'intermediate' : 'advanced',
    coverImage: course.courseImageUrl,
    createdAt: new Date(course.createdAt),
    updatedAt: new Date(course.updatedAt),
    lecturerId: course.teacherId,
    lecturerName: profile?.name || 'Giảng viên',
    duration: course.durationHours,
    rating: 0,
    reviewCount: 0,
  });

  // Filter courses based on active filters
  const allFilteredCourses = courses.map(mapCourseForUI).filter(course => {
    const matchesTab = activeTab === 'all' || course.status === activeTab;
    const matchesSearch = course.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level?.toString() === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesLevel && matchesCategory;
  });

  // Paginate filtered courses for display (12 per page)
  const pageSize = 12;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = allFilteredCourses.slice(startIndex, endIndex);

  // Calculate statistics from ALL courses
  const mappedCourses = courses.map(mapCourseForUI);
  const stats = {
    total: pagination.totalCount || mappedCourses.length, // Total from API
    published: mappedCourses.filter(c => c.status === 'published').length,
    draft: mappedCourses.filter(c => c.status === 'draft').length,
    archived: mappedCourses.filter(c => c.status === 'archived').length,
    totalStudents: mappedCourses.reduce((sum, c) => sum + (c.studentCount || 0), 0)
  };

  // Debug stats
  console.log('📊 Course Stats:', {
    coursesInArray: courses.length,
    totalFromAPI: pagination.totalCount,
    published: stats.published,
    totalStudents: stats.totalStudents,
    currentPage,
    paginatedCoursesCount: paginatedCourses.length
  });

  // Course card component
  const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const statusColors = {
      published: '#52c41a',
      draft: '#faad14', 
      archived: '#f5222d'
    };

    const statusTexts = {
      published: 'Đã xuất bản',
      draft: 'Bản nháp',
      archived: 'Đã lưu trữ'
    };

    const levelTexts = {
      beginner: 'Cơ bản',
      intermediate: 'Trung cấp',
      advanced: 'Nâng cao'
    };

    const actions: Array<{
      key: string;
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      danger?: boolean;
    }> = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <EyeOutlined />,
        onClick: () => router.push(`/Lecturer/courses/${course.id}`)
      },
      {
        key: 'edit',
        label: 'Chỉnh sửa',
        icon: <EditOutlined />,
        onClick: () => router.push(`/Lecturer/courses/edit/${course.id}`)
      },
      {
        key: 'delete',
        label: 'Xóa khóa học',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => showDeleteConfirm(course)
      },
    ];

    return (
      <Card
        hoverable
        className="w-full h-full border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
        cover={
          <div className="relative h-48 overflow-hidden">
            <Image
              src={course.coverImage && 
                   !course.coverImage.includes('example.com') && 
                   !course.coverImage.includes('cdn.example.com')
                ? course.coverImage 
                : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
              }
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
              }}
            />
            <div className="absolute top-3 left-3">
              <Tag color={statusColors[course.status]} className="font-medium">
                {statusTexts[course.status]}
              </Tag>
            </div>
            <div className="absolute top-3 right-3">
              <Dropdown
                menu={{
                  items: actions.map(action => ({
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    danger: action.danger,
                    onClick: () => {
                      action.onClick();
                    }
                  })),
                  onClick: (e) => {
                    e.domEvent?.stopPropagation();
                  }
                }}
                placement="bottomLeft"
                trigger={['click']}
              >
                <Button 
                  type="text" 
                  size="small"
                  icon={<MoreOutlined />} 
                  className="bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 shadow-sm"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </div>
        }
        styles={{ body: { padding: '20px' } }}
        onClick={() => router.push(`/Lecturer/courses/${course.id}`)}
      >
        <div className="flex flex-col h-full">
          {/* Course Header */}
          <div className="flex-grow">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 line-clamp-2 leading-tight mb-2 transition-colors duration-200">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {course.category} • {levelTexts[course.level]}
              </p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <UserOutlined className="text-xs flex-shrink-0" />
                <span>{course.studentCount} học viên</span>
              </div>
              {course.duration && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <ClockCircleOutlined className="text-xs flex-shrink-0" />
                  <span>{course.duration}h</span>
                </div>
              )}
              {course.rating && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <StarOutlined className="text-xs text-yellow-500 flex-shrink-0" />
                  <span>{course.rating} ({course.reviewCount})</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <DollarOutlined className="text-xs flex-shrink-0" />
                <div className="flex items-center gap-2">
                  {course.dealPrice && course.dealPrice < course.price ? (
                    <>
                      <span className="line-through text-sm text-gray-500">
                        {course.price.toLocaleString()} {course.currency}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                        {course.dealPrice.toLocaleString()} {course.currency}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {course.price.toLocaleString()} {course.currency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Course Footer */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Nhấn để xem chi tiết →
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const columns: TableColumnsType<CourseWithKey> = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link href={`/Lecturer/courses/edit/${record.id}`} className="font-semibold text-primary hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Course['status']) => {
        let color = 'default';
        if (status === 'published') color = 'success';
        if (status === 'archived') color = 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => {
        if (record.dealPrice && record.dealPrice < price) {
          return (
            <div className="space-y-1">
              <div className="line-through text-gray-500 text-sm">
                {price.toLocaleString()} {record.currency}
              </div>
              <div className="font-bold text-emerald-600">
                {record.dealPrice.toLocaleString()} {record.currency}
              </div>
            </div>
          );
        }
        return `${price.toLocaleString()} ${record.currency}`;
      },
    },
    {
      title: 'Số học viên',
      dataIndex: 'studentCount',
      key: 'studentCount',
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => router.push(`/Lecturer/courses/${record.id}`)}>
            Xem
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => router.push(`/Lecturer/courses/edit/${record.id}`)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FadeInUp>
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Quản lý khóa học
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Quản lý và theo dõi tất cả khóa học của bạn
                </p>
              </div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="large"
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                onClick={handleCreateCourse}
              >
                Tạo khóa học mới
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="border-l-4 border-l-blue-500">
                <Statistic
                  title="Tổng khóa học"
                  value={stats.total}
                  prefix={<BookOutlined className="text-blue-500" />}
                />
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <Statistic
                  title="Đã xuất bản"
                  value={stats.published}
                  prefix={<BookOutlined className="text-green-500" />}
                />
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <Statistic
                  title="Tổng học viên"
                  value={stats.totalStudents}
                  prefix={<UserOutlined className="text-orange-500" />}
                />
              </Card>
            </div>
          </div>

          {/* Filters and Controls */}
          <Card className="mb-6">
            <div className="space-y-4">
              {/* Tabs for status filtering */}
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  { key: 'all', label: `Tất cả (${stats.total})` },
                  { key: 'published', label: `Đã xuất bản (${stats.published})` },
                  { key: 'draft', label: `Bản nháp (${stats.draft})` },
                  { key: 'archived', label: `Lưu trữ (${stats.archived})` }
                ]}
              />

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <Input
                    placeholder="Tìm kiếm khóa học..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="max-w-sm"
                    allowClear
                  />
                  <Select
                    placeholder="Sắp xếp"
                    value={sortBy}
                    onChange={setSortBy}
                    className="min-w-[140px]"
                  >
                    <Select.Option value={CourseSortBy.CreatedAt}>Mới nhất tạo</Select.Option>
                    <Select.Option value={CourseSortBy.UpdatedAt}>Mới nhất cập nhật</Select.Option>
                    <Select.Option value={CourseSortBy.Title}>Tên khóa học</Select.Option>
                    <Select.Option value={CourseSortBy.Price}>Giá</Select.Option>
                  </Select>
                  <Select
                    placeholder="Cấp độ"
                    value={selectedLevel}
                    onChange={setSelectedLevel}
                    className="min-w-[120px]"
                    allowClear
                  >
                    <Select.Option value="all">Tất cả cấp độ</Select.Option>
                    <Select.Option value="beginner">Cơ bản</Select.Option>
                    <Select.Option value="intermediate">Trung cấp</Select.Option>
                    <Select.Option value="advanced">Nâng cao</Select.Option>
                  </Select>
                  <Select
                    placeholder="Danh mục"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    className="min-w-[120px]"
                    allowClear
                  >
                    <Select.Option value="all">Tất cả danh mục</Select.Option>
                    <Select.Option value="Javascript">Javascript</Select.Option>
                    <Select.Option value="Java">Java</Select.Option>
                    <Select.Option value="CSharp">C#</Select.Option>
                    <Select.Option value="Database">Database</Select.Option>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <Radio.Group
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="card">
                    <AppstoreOutlined /> Thẻ
                  </Radio.Button>
                  <Radio.Button value="table">
                    <UnorderedListOutlined /> Bảng
                  </Radio.Button>
                </Radio.Group>
              </div>
            </div>
          </Card>


          {/* Content Area */}
          <Card>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Đang tải khóa học...</p>
                </div>
              </div>
            ) : allFilteredCourses.length === 0 ? (
              <Empty
                description="Không tìm thấy khóa học nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCourse}>
                  Tạo khóa học đầu tiên
                </Button>
              </Empty>
            ) : viewMode === 'card' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {paginatedCourses.map((course) => (
                    <div key={course.id} className="h-full">
                      <CourseCard course={course} />
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {allFilteredCourses.length > pageSize && (
                  <div className="mt-8 flex flex-col items-center border-t pt-6 gap-4">
                    <Pagination
                      current={currentPage}
                      total={allFilteredCourses.length}
                      pageSize={pageSize}
                      onChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      showSizeChanger={false}
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} của ${total} khóa học`
                      }
                      disabled={isLoading}
                      className="text-center"
                    />
                  </div>
                )}
              </>
            ) : (
              <BaseControlTable
                columns={columns}
                data={allFilteredCourses.map(c => ({...c, key: c.id}))}
                loading={isLoading}
                total={allFilteredCourses.length}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  total: allFilteredCourses.length,
                }}
              />
            )}
          </Card>
        </div>
      </FadeInUp>
    </div>
  );
};

export default CourseManagementPage;

