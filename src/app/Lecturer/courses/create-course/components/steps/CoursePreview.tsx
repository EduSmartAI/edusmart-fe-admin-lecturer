'use client';
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useCreateCourse } from '../../hooks/useCreateCourse';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { 
  Button, 
  ConfigProvider, 
  Form, 
  InputNumber, 
  theme, 
  message, 
  Card, 
  Divider, 
  Typography, 
  Space,
  Tag,
  Spin,
  Alert
} from 'antd';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaBook, 
  FaUsers, 
  FaClock, 
  FaGraduationCap,
  FaCheck,
  FaTag,
  FaPlayCircle
} from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

const { Title, Text, Paragraph } = Typography;

const CoursePreview: FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { 
    courseInformation, 
    modules, 
    objectives, 
    requirements, 
    setCurrentStep, 
    updateCourseInformation 
  } = useCreateCourseStore();
  
  const {
    createCourseWithAuth,
    isSubmitting,
    authError,
    clearAuthError
  } = useCreateCourse();
  
  const form = Form.useFormInstance();
  const [isCreating, setIsCreating] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    form.setFieldsValue({
      basePrice: courseInformation.price || undefined,
      discountPrice: courseInformation.dealPrice,
    });
  }, [form, courseInformation]);

  const onBack = () => {
    const container = document.getElementById('create-course-content');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentStep(2);
  };

  const handleCreateCourse = async () => {
    try {
      // First validate pricing fields
      const pricingValues = await form.validateFields();
      
      // Validation: discount price should be less than base price
      if (pricingValues.discountPrice && pricingValues.basePrice && pricingValues.discountPrice >= pricingValues.basePrice) {
        message.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
        return;
      }

      // Update pricing information
      updateCourseInformation({
        price: pricingValues.basePrice,
        dealPrice: pricingValues.discountPrice,
      });

      setIsCreating(true);
      clearAuthError();

      // Create the course
      const success = await createCourseWithAuth();
      
      if (success) {
        message.success('Khóa học đã được tạo thành công!');
        // Navigate to courses list after successful creation
        setTimeout(() => {
          router.push('/Lecturer/courses');
        }, 1500); // Wait 1.5 seconds to show success message
      } else {
        message.error('Không thể tạo khóa học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      message.error('Lỗi khi tạo khóa học. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  };

  // Calculate totals
  const totalModules = modules.length;
  const totalLessons = modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  const totalDuration = modules.reduce((total, module) => total + (module.durationMinutes || 0), 0);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorText: isDarkMode ? "#E5E7EB" : "#1F2937",
          colorTextPlaceholder: isDarkMode ? "#9CA3AF" : "#6B7280",
          colorBgContainer: isDarkMode ? "#374151" : "#FFFFFF",
          colorBorder: isDarkMode ? "#4B5563" : "#D1D5DB",
        },
      }}
    >
      <FadeInUp>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Title level={2} className="!mb-2 text-gray-800 dark:text-gray-200">
              Xem trước & Tạo khóa học
            </Title>
            <Text className="text-gray-500 dark:text-gray-400">
              Xem lại tất cả thông tin và hoàn tất việc tạo khóa học của bạn.
            </Text>
          </div>
        </div>

        {/* Auth Error Alert */}
        {authError && (
          <Alert
            message="Lỗi xác thực"
            description={authError}
            type="error"
            showIcon
            closable
            onClose={clearAuthError}
            className="mb-6"
          />
        )}

        <div className="space-y-6">
          {/* Course Overview Statistics */}
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <Title level={3} className="!mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaBook className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              Tổng quan khóa học
            </Title>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{totalModules}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Chương học</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{totalLessons}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Bài học</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Thời lượng</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{objectives.length}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Mục tiêu</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{requirements.length}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Yêu cầu</div>
              </div>
            </div>
          </Card>

          {/* Course Information */}
          <Card className="border-l-4 border-l-green-500">
            <Title level={3} className="!mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaGraduationCap className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              Thông tin khóa học
            </Title>
            
            {/* Course Title & Image */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {courseInformation.courseImageUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={courseInformation.courseImageUrl} 
                      alt="Course thumbnail"
                      className="w-full md:w-48 h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Title level={4} className="!mb-2 text-gray-800 dark:text-gray-200">
                    {courseInformation.title || 'Chưa có tiêu đề'}
                  </Title>
                  <Paragraph className="text-gray-600 dark:text-gray-400 !mb-4">
                    {courseInformation.shortDescription || courseInformation.description || 'Chưa có mô tả ngắn'}
                  </Paragraph>
                </div>
              </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Mã môn học</Text>
                <Text className="text-lg">{courseInformation.subjectCode || 'Chưa chọn'}</Text>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Cấp độ</Text>
                <Tag color="blue" className="text-sm px-3 py-1">
                  {courseInformation.level === 1 ? 'Cơ bản' : 
                   courseInformation.level === 2 ? 'Trung cấp' : 
                   courseInformation.level === 3 ? 'Nâng cao' : 'Cấp độ ' + (courseInformation.level || 1)}
                </Tag>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Thời lượng</Text>
                <Text className="text-lg flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  {Math.floor((courseInformation.durationMinutes || 0) / 60)}h {(courseInformation.durationMinutes || 0) % 60}m
                </Text>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Trạng thái</Text>
                <Tag color={courseInformation.isActive ? 'green' : 'red'} className="text-sm px-3 py-1">
                  {courseInformation.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Môn học ID</Text>
                <Text className="text-lg">{courseInformation.subjectId || 'Chưa chọn'}</Text>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Giảng viên ID</Text>
                <Text className="text-lg">{courseInformation.teacherId || 'Chưa xác định'}</Text>
              </div>
            </div>

            {/* Full Description */}
            {courseInformation.description && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Text strong className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Mô tả chi tiết</Text>
                <Paragraph className="!mb-0 text-gray-700 dark:text-gray-300">
                  {courseInformation.description}
                </Paragraph>
              </div>
            )}
          </Card>

          {/* Pricing Section */}
          <Card className="border-l-4 border-l-yellow-500">
            <Title level={3} className="!mb-6 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FaTag className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
              Giá cả & Khuyến mãi
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <Text strong className="block mb-3 text-green-700 dark:text-green-300 text-lg">💰 Giá gốc *</Text>
                <Form.Item 
                  name="basePrice" 
                  rules={[{ required: true, message: 'Vui lòng nhập giá gốc!' }]}
                  className="!mb-0"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    addonAfter="VND"
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(v) => Number(v!.replace(/\s?VND|,/g, '')) as any}
                    placeholder="VD: 500,000"
                    size="large"
                    style={{ fontSize: '16px' }}
                  />
                </Form.Item>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Giá chính thức của khóa học
                </Text>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                <Text strong className="block mb-3 text-orange-700 dark:text-orange-300 text-lg">🏷️ Giá khuyến mãi (Tùy chọn)</Text>
                <Form.Item name="discountPrice" className="!mb-0">
                  <InputNumber 
                    className="w-full" 
                    min={0} 
                    addonAfter="VND" 
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                    parser={(v) => Number(v!.replace(/\s?VND|,/g, '')) as any} 
                    placeholder="VD: 299,000" 
                    size="large" 
                    style={{ fontSize: '16px' }}
                  />
                </Form.Item>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Giá ưu đãi đặc biệt cho học viên
                </Text>
              </div>
            </div>
            
            {/* Price Preview */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Title level={5} className="flex items-center gap-2 !mb-3">
                <span>💳</span> Xem trước giá
              </Title>
              <div className="flex items-center gap-4">
                {form.getFieldValue('discountPrice') && (
                  <>
                    <Text delete className="text-gray-500 text-lg">
                      {form.getFieldValue('basePrice')?.toLocaleString()} VND
                    </Text>
                    <Text strong className="text-green-600 text-xl">
                      {form.getFieldValue('discountPrice')?.toLocaleString()} VND
                    </Text>
                    <Tag color="red" className="text-sm">
                      Tiết kiệm {Math.round(((form.getFieldValue('basePrice') - form.getFieldValue('discountPrice')) / form.getFieldValue('basePrice')) * 100)}%
                    </Tag>
                  </>
                )}
                {!form.getFieldValue('discountPrice') && form.getFieldValue('basePrice') && (
                  <Text strong className="text-blue-600 text-xl">
                    {form.getFieldValue('basePrice')?.toLocaleString()} VND
                  </Text>
                )}
              </div>
            </div>
          </Card>

          {/* Learning Objectives */}
          {objectives.length > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <Title level={3} className="!mb-6 flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                Mục tiêu học tập
                <Tag color="green" className="ml-auto">{objectives.length} mục tiêu</Tag>
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/20 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Text className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {objective.content}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <Title level={3} className="!mb-6 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FaUsers className="text-orange-600 dark:text-orange-400 text-xl" />
                </div>
                Yêu cầu khóa học
                <Tag color="orange" className="ml-auto">{requirements.length} yêu cầu</Tag>
              </Title>
              <div className="space-y-3">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-800/20 rounded-lg border border-orange-200 dark:border-orange-800 shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <Text className="text-gray-800 dark:text-gray-200 leading-relaxed flex-1">
                      {requirement.content}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Course Modules */}
          {modules.length > 0 && (
            <Card className="border-l-4 border-l-purple-500">
              <Title level={3} className="!mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FaBook className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                Chương trình học
                <Tag color="purple" className="ml-auto">{modules.length} chương</Tag>
              </Title>
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const isExpanded = expandedModule === index;
                  const moduleLessons = module.lessons || [];
                  const totalLessonDuration = moduleLessons.reduce((total, lesson) => 
                    total + (lesson.videoDurationSec ? Math.round(lesson.videoDurationSec / 60) : 0), 0
                  );

                  return (
                    <div key={module.id || index} className="border border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden shadow-sm">
                      {/* Module Header */}
                      <div 
                        className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-800/20 cursor-pointer hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-800/30 dark:hover:to-indigo-700/30 transition-all"
                        onClick={() => setExpandedModule(isExpanded ? null : index)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                                {index + 1}
                              </div>
                              <Title level={4} className="!mb-0 text-purple-800 dark:text-purple-200">
                                {module.moduleName}
                              </Title>
                            </div>
                            {module.description && (
                              <Paragraph className="text-gray-600 dark:text-gray-400 !mb-0 ml-13">
                                {module.description}
                              </Paragraph>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Space>
                              <Tag color="blue" className="text-xs">
                                <FaClock className="mr-1" />
                                {module.durationMinutes || 0}m
                              </Tag>
                              <Tag color={module.isCore ? 'red' : 'default'} className="text-xs">
                                {module.isCore ? '🔥 Cốt lõi' : '📖 Tùy chọn'}
                              </Tag>
                            </Space>
                            <Tag color="green" className="text-xs text-center">
                              {moduleLessons.length} bài học
                            </Tag>
                          </div>
                        </div>
                        
                        {/* Module Statistics */}
                        <div className="mt-4 ml-13 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaPlayCircle className="text-blue-500" />
                            {moduleLessons.length} video
                          </span>
                          {totalLessonDuration > 0 && (
                            <span className="flex items-center gap-1">
                              <FaClock className="text-green-500" />
                              {totalLessonDuration} phút
                            </span>
                          )}
                          <span className="ml-auto text-purple-600 dark:text-purple-400">
                            {isExpanded ? '▲ Thu gọn' : '▼ Xem chi tiết'}
                          </span>
                        </div>
                      </div>

                      {/* Module Content - Expandable */}
                      {isExpanded && moduleLessons.length > 0 && (
                        <div className="p-6 bg-white dark:bg-gray-800 border-t border-purple-200 dark:border-purple-800">
                          <Title level={5} className="!mb-4 text-gray-700 dark:text-gray-300">
                            📚 Danh sách bài học ({moduleLessons.length})
                          </Title>
                          <div className="space-y-3">
                            {moduleLessons.map((lesson, lessonIndex) => (
                              <div 
                                key={lesson.id || lessonIndex} 
                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {lessonIndex + 1}
                                </div>
                                <FaPlayCircle className="text-blue-500 flex-shrink-0" />
                                <div className="flex-1">
                                  <Text strong className="block text-gray-800 dark:text-gray-200">
                                    {lesson.title}
                                  </Text>
                                  {lesson.videoUrl && (
                                    <Text className="text-xs text-gray-500">
                                      Video URL: {lesson.videoUrl.length > 50 ? 
                                        lesson.videoUrl.substring(0, 50) + '...' : 
                                        lesson.videoUrl}
                                    </Text>
                                  )}
                                </div>
                                {lesson.videoDurationSec && (
                                  <Tag color="blue" className="text-xs">
                                    {Math.round(lesson.videoDurationSec / 60)}m
                                  </Tag>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Module Objectives */}
                          {module.objectives && module.objectives.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <Title level={5} className="!mb-3 text-gray-700 dark:text-gray-300">
                                🎯 Mục tiêu chương ({module.objectives.length})
                              </Title>
                              <div className="space-y-2">
                                {module.objectives.map((objective, objIndex) => (
                                  <div key={objIndex} className="flex items-start gap-2 text-sm">
                                    <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <Text className="text-gray-700 dark:text-gray-300">
                                      {objective.content}
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Summary & Final Validation */}
          <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-800/20">
            <Title level={3} className="!mb-4 flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FaPaperPlane className="text-indigo-600 dark:text-indigo-400 text-xl" />
              </div>
              Sẵn sàng tạo khóa học?
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📚</div>
                <Text strong>Nội dung hoàn chỉnh</Text>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {modules.length} chương, {totalLessons} bài học
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🎯</div>
                <Text strong>Mục tiêu rõ ràng</Text>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {objectives.length} mục tiêu học tập
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">💰</div>
                <Text strong>Giá cả hợp lý</Text>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {form.getFieldValue('basePrice') ? 
                    `${form.getFieldValue('basePrice')?.toLocaleString()} VND` : 
                    'Chưa thiết lập'}
                </div>
              </div>
            </div>
            
            <Alert
              message="Lưu ý quan trọng"
              description="Sau khi tạo khóa học, bạn vẫn có thể chỉnh sửa nội dung, thêm bài học mới hoặc cập nhật thông tin. Đảm bảo tất cả thông tin đã chính xác trước khi tiếp tục."
              type="info"
              showIcon
              className="mb-6"
            />
          </Card>

          <Divider className="my-8" />

          {/* Actions */}
          <div className="flex justify-between items-center py-6 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <Button 
              icon={<FaArrowLeft />} 
              onClick={onBack} 
              size="large"
              className="h-12 px-6"
            >
              Quay lại nội dung
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                <div>Bước cuối cùng</div>
                <div className="font-medium">Tạo khóa học của bạn</div>
              </div>
              <Button 
                type="primary" 
                icon={isCreating ? <Spin size="small" /> : <FaPaperPlane />} 
                onClick={handleCreateCourse} 
                size="large"
                loading={isCreating || isSubmitting}
                disabled={isCreating || isSubmitting}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700"
              >
                {isCreating || isSubmitting ? 'Đang tạo khóa học...' : '🚀 Tạo khóa học ngay'}
              </Button>
            </div>
          </div>
        </div>
      </FadeInUp>
    </ConfigProvider>
  );
};

export default CoursePreview;