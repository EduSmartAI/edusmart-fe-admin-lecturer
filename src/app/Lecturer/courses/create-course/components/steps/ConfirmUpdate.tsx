'use client';
import { FC, useState } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { useRouter, useParams } from 'next/navigation';
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
  message,
  Modal
} from 'antd';
import { 
  FaArrowLeft, 
  FaSave, 
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
const { Panel } = Collapse;

const ConfirmUpdate: FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const { 
    courseInformation, 
    modules, 
    objectives, 
    requirements, 
    setCurrentStep, 
    updateCourse
  } = useCreateCourseStore();
  
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePrevious = () => {
    setCurrentStep(3); // Go back to Pricing step
  };

  const handleConfirmUpdate = async () => {
    setIsLoading(true);
    
    try {
      const updateResult = await updateCourse();
      
      if (updateResult) {
        message.success('Cập nhật khóa học thành công!');
        
        // Navigate back to course detail page after successful update
        setTimeout(() => {
          router.push(`/Lecturer/courses/${courseId}`);
        }, 1500);
      } else {
        message.error('Có lỗi xảy ra khi cập nhật khóa học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Update course error:', error);
      message.error('Có lỗi xảy ra khi cập nhật khóa học. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Calculate completion progress
  const getCompletionProgress = () => {
    let completed = 0;
    let total = 0;

    // Check course information
    total += 4;
    if (courseInformation.title) completed++;
    if (courseInformation.description) completed++;
    if (courseInformation.courseImageUrl) completed++;
    if (courseInformation.subjectId) completed++;

    // Check objectives
    total += 1;
    if (objectives.length >= 4) completed++;

    // Check requirements
    total += 1;
    if (requirements.length >= 2) completed++;

    // Check modules and content
    total += 2;
    if (modules.length > 0) completed++;
    const hasContent = modules.some(module => 
      module.lessons && module.lessons.length > 0
    );
    if (hasContent) completed++;

    // Check pricing
    total += 1;
    if (courseInformation.price > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercent = getCompletionProgress();
  const isReadyToUpdate = completionPercent >= 80;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung cấp';
      case 3: return 'Nâng cao';
      default: return 'Cơ bản';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'red';
      default: return 'green';
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Xác nhận cập nhật</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Kiểm tra lại thông tin và cập nhật khóa học của bạn.</p>
          </div>
          
          {/* Progress indicator */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Progress
                type="circle"
                percent={completionPercent}
                size={60}
                status={isReadyToUpdate ? 'success' : 'active'}
                strokeColor={isReadyToUpdate ? '#10B981' : '#3B82F6'}
              />
              <div>
                <Text strong className={isReadyToUpdate ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                  {completionPercent}% hoàn thành
                </Text>
                <br />
                <Text type="secondary" className="text-xs">
                  {isReadyToUpdate ? 'Sẵn sàng cập nhật!' : 'Cần hoàn thiện thêm'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Course Overview */}
        <Card className="mb-6" title={
          <Space>
            <FaBook className="text-emerald-600" />
            <span>Tổng quan khóa học</span>
          </Space>
        }>
          <Row gutter={[24, 24]}>
            <Col lg={8} md={12} sm={24}>
              <div className="text-center">
                <Image
                  src={courseInformation.courseImageUrl || '/placeholder-course.jpg'}
                  alt={courseInformation.title}
                  className="rounded-lg"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                  fallback="/placeholder-course.jpg"
                />
              </div>
            </Col>
            
            <Col lg={16} md={12} sm={24}>
              <div className="space-y-4">
                <div>
                  <Title level={3} className="mb-2">{courseInformation.title || 'Chưa có tiêu đề'}</Title>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Tag color={getLevelColor(courseInformation.level)} icon={<FaGraduationCap />}>
                      {getLevelText(courseInformation.level)}
                    </Tag>
                    {courseInformation.subjectId && (
                      <Tag color="blue" icon={<FaBook />}>
                        {courseInformation.subjectCode || 'Subject'}
                      </Tag>
                    )}
                  </div>
                  
                  <Paragraph className="text-gray-600 dark:text-gray-300 mb-4">
                    {courseInformation.shortDescription || 'Chưa có mô tả ngắn'}
                  </Paragraph>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" />
                    <div>
                      <Text type="secondary">Giá khóa học:</Text>
                      <br />
                      <Text strong className="text-lg text-green-600 dark:text-green-400">
                        {courseInformation.price ? formatPrice(courseInformation.price) : 'Chưa thiết lập'}
                      </Text>
                      {courseInformation.dealPrice && courseInformation.dealPrice < courseInformation.price && (
                        <>
                          <br />
                          <Text type="secondary" delete className="text-sm">
                            {formatPrice(courseInformation.dealPrice)}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-500" />
                    <div>
                      <Text type="secondary">Thời lượng:</Text>
                      <br />
                      <Text strong>
                        {courseInformation.durationMinutes 
                          ? `${Math.floor(courseInformation.durationMinutes / 60)}h ${courseInformation.durationMinutes % 60}m`
                          : 'Chưa tính toán'
                        }
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Content Summary */}
        <Collapse className="mb-6" ghost>
          <Panel 
            header={
              <Space>
                <FaFileAlt className="text-blue-600" />
                <span>Chi tiết nội dung khóa học</span>
                <Tag color="blue">{modules.length} chương</Tag>
              </Space>
            } 
            key="content"
          >
            <div className="space-y-4">
              {/* Objectives */}
              <div>
                <Title level={5} className="flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-500" />
                  Mục tiêu học tập ({objectives.length}/10)
                </Title>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  {objectives.slice(0, 3).map((obj, index) => (
                    <li key={index}>{obj.content}</li>
                  ))}
                  {objectives.length > 3 && (
                    <li className="text-gray-500">... và {objectives.length - 3} mục tiêu khác</li>
                  )}
                </ul>
              </div>

              <Divider />

              {/* Modules */}
              <div>
                <Title level={5} className="flex items-center gap-2 mb-3">
                  <FaBook className="text-purple-500" />
                  Chương trình học
                </Title>
                {modules.map((module, index) => (
                  <div key={module.id} className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Title level={5} className="mb-1">
                        Chương {index + 1}: {module.title}
                      </Title>
                      <Tag color="purple">
                        {module.lessons?.length || 0} bài học
                      </Tag>
                    </div>
                    {module.description && (
                      <Text type="secondary" className="text-sm">
                        {module.description}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </Collapse>

        {/* Ready to update status */}
        <Card className={`mb-6 ${isReadyToUpdate ? 'border-green-300' : 'border-yellow-300'}`}>
          <div className="flex items-start gap-4">
            {isReadyToUpdate ? (
              <FaCheckCircle className="text-green-500 text-2xl mt-1" />
            ) : (
              <FaExclamationTriangle className="text-yellow-500 text-2xl mt-1" />
            )}
            
            <div className="flex-1">
              <Title level={4} className={isReadyToUpdate ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                {isReadyToUpdate ? 'Khóa học sẵn sàng để cập nhật!' : 'Cần hoàn thiện một số thông tin'}
              </Title>
              <Paragraph className="text-gray-600 dark:text-gray-300">
                {isReadyToUpdate 
                  ? 'Tất cả thông tin cần thiết đã được cung cấp. Bạn có thể cập nhật khóa học ngay bây giờ.'
                  : 'Vui lòng kiểm tra và bổ sung thêm thông tin để đảm bảo chất lượng khóa học.'
                }
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            size="large" 
            htmlType="button"
            icon={<FaArrowLeft />} 
            onClick={handlePrevious}
            disabled={isLoading}
          >
            Quay lại: Giá khóa học
          </Button>
          
          <Button 
            type="primary" 
            size="large"
            htmlType="button"
            icon={<FaSave />}
            onClick={() => setShowConfirmModal(true)}
            loading={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-none"
          >
            Cập nhật khóa học
          </Button>
        </div>

        {/* Confirmation Modal */}
        <Modal
          title="Xác nhận cập nhật khóa học"
          open={showConfirmModal}
          onOk={handleConfirmUpdate}
          onCancel={() => setShowConfirmModal(false)}
          okText="Xác nhận cập nhật"
          cancelText="Hủy"
          confirmLoading={isLoading}
          okButtonProps={{
            className: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-none"
          }}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-500 text-xl mt-1" />
              <div>
                <Paragraph>
                  Bạn có chắc chắn muốn cập nhật khóa học <strong>"{courseInformation.title}"</strong>?
                </Paragraph>
                <Paragraph type="secondary" className="text-sm">
                  Các thay đổi sẽ được áp dụng ngay lập tức và có thể ảnh hưởng đến học viên đang học khóa học này.
                </Paragraph>
              </div>
            </div>
          </div>
        </Modal>
      </FadeInUp>
    </ConfigProvider>
  );
};

export default ConfirmUpdate;