'use client';
/* eslint-disable */
import { FC, useState } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { clearLocalStorage } from '../../../create-course/utils/autoSave';
import { 
  Button, 
  Card, 
  ConfigProvider, 
  theme, 
  Typography, 
  Tag, 
  Space, 
  Divider, 
  Row, 
  Col, 
  Image, 
  Progress,
  Collapse,
  App,
  Modal
} from 'antd';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaBook, 
  FaClock, 
  FaTag, 
  FaGraduationCap, 
  FaUsers, 
  FaPlay, 
  FaFileAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

const { Title, Text, Paragraph } = Typography;

const Publish: FC = () => {
  const { message } = App.useApp();
  const { 
    courseInformation, 
    modules, 
    objectives, 
    requirements, 
    setCurrentStep, 
    createCourse,
    resetForm 
  } = useCreateCourseStore();
  const { isDarkMode } = useTheme();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const onBack = () => {
    const container = document.getElementById('create-course-content');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentStep(3);
  };

  const handlePublishClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    setShowConfirmModal(false);
    
    try {
      const success = await createCourse();
      if (success) {
        message.success({
          content: 'Khóa học đã được xuất bản thành công!',
          duration: 3,
        });
        
        // Show success notification with additional info
        setTimeout(() => {
          message.info({
            content: 'Tất cả thông tin đã được làm mới để tạo khóa học mới.',
            duration: 3,
          });
        }, 1000);
        
        // Reset all form data and clear auto-save after a short delay
        setTimeout(() => {
          // Clear auto-saved data from localStorage
          clearLocalStorage();
          
          // Reset the form store
          resetForm();
          
          // Go back to step 0
          setCurrentStep(0);
          
          // Scroll to top
          const container = document.getElementById('create-course-content');
          if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 2000);
        
      } else {
        message.error('Không thể xuất bản khóa học. Vui lòng thử lại.');
      }
    } catch {
      message.error('Đã xảy ra lỗi khi xuất bản khóa học.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Calculate course statistics
  const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
  const totalDuration = modules.reduce((acc, module) => acc + (module.durationMinutes || 0), 0);
  const totalModules = modules.length;
  
  // Check completion status
  const isBasicInfoComplete = courseInformation.title && courseInformation.description;
  const hasModules = modules.length > 0;
  const hasObjectives = objectives.length > 0;
  const hasPricing = courseInformation.price && courseInformation.price > 0;
  
  const completionItems = [
    { label: 'Thông tin cơ bản', completed: isBasicInfoComplete },
    { label: 'Mục tiêu học tập', completed: hasObjectives },
    { label: 'Chương trình học', completed: hasModules },
    { 
      label: 'Nội dung bài học', 
      completed: modules.length > 0 && modules.every(module => 
        module.lessons && 
        module.lessons.length > 0 && 
        module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
      )
    },
    { label: 'Giá khóa học', completed: hasPricing },
  ];
  
  const completionRate = Math.round((completionItems.filter(item => item.completed).length / completionItems.length) * 100);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <FadeInUp>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="text-gray-800 dark:text-gray-200 mb-2">
              <FaPaperPlane className="inline mr-3" />
              Xuất bản khóa học
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-lg">
              Xem lại toàn bộ thông tin khóa học trước khi xuất bản
            </Text>
          </div>

          {/* Completion Status */}
          <Card className="mb-6" title="Tình trạng hoàn thành">
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={24}>
                <Progress 
                  percent={completionRate} 
                  strokeColor={completionRate === 100 ? '#52c41a' : '#1890ff'}
                  size={40}
                />
              </Col>
            </Row>
            <Row gutter={[16, 8]}>
              {completionItems.map((item, index) => (
                <Col key={index} span={12} md={8}>
                  <div className="flex items-center">
                    {item.completed ? (
                      <FaCheckCircle className="text-green-500 mr-2" />
                    ) : (
                      <FaExclamationTriangle className="text-orange-500 mr-2" />
                    )}
                    <Text className={item.completed ? 'text-green-600' : 'text-orange-600'}>
                      {item.label}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Course Overview */}
          <Card className="mb-6" title={
            <Space>
              <FaBook />
              <span>Tổng quan khóa học</span>
            </Space>
          }>
            <Row gutter={[24, 16]}>
              <Col span={24} md={16}>
                <Title level={3} className="mb-2">{courseInformation.title || 'Chưa có tiêu đề'}</Title>
                <Paragraph className="text-gray-600 dark:text-gray-400 mb-4">
                  {courseInformation.description || 'Chưa có mô tả'}
                </Paragraph>
                <Space wrap>
                  {courseInformation.subjectCode && (
                    <Tag icon={<FaTag />} color="blue">
                      {courseInformation.subjectCode}
                    </Tag>
                  )}
                  <Tag icon={<FaGraduationCap />} color="green">
                    Cấp độ {courseInformation.level || 1}
                  </Tag>
                  {courseInformation.isActive && (
                    <Tag icon={<FaCheckCircle />} color="success">
                      Hoạt động
                    </Tag>
                  )}
                </Space>
              </Col>
              <Col span={24} md={8}>
                {courseInformation.courseImageUrl && (
                  <Image
                    src={courseInformation.courseImageUrl}
                    alt="Course Cover"
                    className="w-full rounded-lg"
                    placeholder={
                      <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FaBook className="text-4xl text-gray-400" />
                      </div>
                    }
                  />
                )}
              </Col>
            </Row>
          </Card>

          {/* Course Statistics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24} sm={8}>
              <Card className="text-center">
                <FaBook className="text-3xl text-blue-500 mb-2" />
                <Title level={3} className="mb-1">{totalModules}</Title>
                <Text className="text-gray-600">Chương học</Text>
              </Card>
            </Col>
            <Col span={24} sm={8}>
              <Card className="text-center">
                <FaPlay className="text-3xl text-green-500 mb-2" />
                <Title level={3} className="mb-1">{totalLessons}</Title>
                <Text className="text-gray-600">Bài học</Text>
              </Card>
            </Col>
            <Col span={24} sm={8}>
              <Card className="text-center">
                <FaClock className="text-3xl text-orange-500 mb-2" />
                <Title level={3} className="mb-1">{Math.round(totalDuration / 60) || 0}h</Title>
                <Text className="text-gray-600">Thời lượng</Text>
              </Card>
            </Col>
          </Row>

          {/* Pricing Information */}
          <Card className="mb-6" title={
            <Space>
              <FaMoneyBillWave />
              <span>Thông tin giá</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col span={24} md={12}>
                <div className="text-center p-4 border rounded-lg">
                  <Text className="text-gray-600">Giá gốc</Text>
                  <Title level={2} className="text-blue-600 mb-0">
                    {courseInformation.price?.toLocaleString('vi-VN')} đ
                  </Title>
                </div>
              </Col>
              {courseInformation.dealPrice && (
                <Col span={24} md={12}>
                  <div className="text-center p-4 border rounded-lg border-orange-300 bg-orange-50 dark:bg-orange-900/20">
                    <Text className="text-orange-600">Giá khuyến mãi</Text>
                    <Title level={2} className="text-orange-600 mb-0">
                      {courseInformation.dealPrice?.toLocaleString('vi-VN')} đ
                    </Title>
                    <Text className="text-xs text-gray-500">
                      Tiết kiệm {((courseInformation.price! - courseInformation.dealPrice) / courseInformation.price! * 100).toFixed(0)}%
                    </Text>
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Learning Objectives */}
          {objectives.length > 0 && (
            <Card className="mb-6" title={
              <Space>
                <FaGraduationCap />
                <span>Mục tiêu học tập ({objectives.length})</span>
              </Space>
            }>
              <Row gutter={[16, 8]}>
                {objectives.map((objective, index) => (
                  <Col key={index} span={24}>
                    <div className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <Text>{objective.content}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <Card className="mb-6" title={
              <Space>
                <FaFileAlt />
                <span>Yêu cầu ({requirements.length})</span>
              </Space>
            }>
              <Row gutter={[16, 8]}>
                {requirements.map((requirement, index) => (
                  <Col key={index} span={24}>
                    <div className="flex items-start">
                      <FaUsers className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <Text>{requirement.content}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Course Modules */}
          {modules.length > 0 && (
            <Card className="mb-6" title={
              <Space>
                <FaBook />
                <span>Chương trình học ({modules.length} chương)</span>
              </Space>
            }>
              <Collapse
                items={modules.map((module, index) => ({
                  key: module.id || index.toString(),
                  label: (
                    <div className="flex justify-between items-center">
                      <span>
                        <strong>Chương {index + 1}:</strong> {module.moduleName}
                      </span>
                      <Space>
                        <Tag icon={<FaClock />}>
                          {module.durationMinutes || 0} phút
                        </Tag>
                        <Tag icon={<FaPlay />}>
                          {module.lessons?.length || 0} bài
                        </Tag>
                      </Space>
                    </div>
                  ),
                  children: (
                    <>
                      {module.description && (
                        <Paragraph className="text-gray-600 mb-3">
                          {module.description}
                        </Paragraph>
                      )}
                      
                      {module.lessons && module.lessons.length > 0 && (
                        <div>
                          <Title level={5}>Bài học:</Title>
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id || lessonIndex} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              <div className="flex items-center">
                                <FaPlay className="text-blue-500 mr-2" />
                                <span>{lesson.title}</span>
                              </div>
                              <Text className="text-gray-500">
                                {lesson.videoDurationSec ? Math.round(lesson.videoDurationSec / 60) : 0} phút
                              </Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )
                }))}
              />
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              icon={<FaArrowLeft />} 
              onClick={onBack} 
              size="large"
            >
              Quay lại
            </Button>
            <Button 
              type="primary" 
              icon={<FaPaperPlane />} 
              onClick={handlePublishClick}
              size="large"
              loading={isPublishing}
              disabled={completionRate < 80}
            >
              {isPublishing ? 'Đang xuất bản...' : 'Xuất bản khóa học'}
            </Button>
          </div>

          {/* Confirmation Modal */}
          <Modal
            title="Xác nhận xuất bản khóa học"
            open={showConfirmModal}
            onOk={handleConfirmPublish}
            onCancel={() => setShowConfirmModal(false)}
            okText="Xuất bản"
            cancelText="Hủy"
            okButtonProps={{ loading: isPublishing }}
          >
            <div className="py-4">
              <Text>
                Bạn có chắc chắn muốn xuất bản khóa học "<strong>{courseInformation.title}</strong>" không?
              </Text>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Text className="text-blue-700 dark:text-blue-300">
                  Sau khi xuất bản, khóa học sẽ có thể được xem bởi học viên và bạn có thể tiếp tục chỉnh sửa nội dung.
                </Text>
              </div>
            </div>
          </Modal>
        </div>
      </FadeInUp>
    </ConfigProvider>
  );
};

export default Publish;

