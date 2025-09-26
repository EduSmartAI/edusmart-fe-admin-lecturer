'use client';
import React, { FC, useEffect, useState, useMemo } from 'react';
import { useSuppressAntdWarnings } from 'EduSmart/hooks/useSuppressAntdWarnings';
import { useRouter } from 'next/navigation';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { 
  Button, 
  Card, 
  ConfigProvider, 
  theme, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  List,
  Tag,
  Space,
  Tabs,
  Alert,
  Timeline,
  message,
  Modal
} from 'antd';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaChartLine,
  FaBook, 
  FaClock, 
  FaUsers, 
  FaPlay, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaBullseye,
  FaGraduationCap,
  FaRocket
} from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

const { Title, Text, Paragraph } = Typography;

const Analytics: FC = () => {
  // Suppress Ant Design warnings
  useSuppressAntdWarnings();

  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { 
    courseInformation,
    modules,
    objectives,
    setCurrentStep,
    createCourse
  } = useCreateCourseStore();
  
  // Analytics calculations
  const analytics = useMemo(() => {
    const totalModules = modules.length;
    const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const totalDuration = modules.reduce((acc, module) => 
      acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.videoDurationSec || 0), 0), 0
    );
    const totalObjectives = objectives.length;
    const avgLessonsPerModule = totalModules > 0 ? Math.round(totalLessons / totalModules * 10) / 10 : 0;
    
        // Calculate quality score based on course criteria
    let qualityScore = 0;
    if (courseInformation.title && courseInformation.title.length > 10) qualityScore += 15;
    if (courseInformation.description && courseInformation.description.length > 50) qualityScore += 15;
    if (totalModules >= 3) qualityScore += 20;
    // Each module has at least 1 video lesson
    const modulesWithVideoLessons = modules.filter(module => 
      module.lessons && 
      module.lessons.length > 0 && 
      module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
    ).length;
    if (modulesWithVideoLessons === totalModules && totalModules > 0) qualityScore += 15;
    if (totalDuration >= 120) qualityScore += 15;
    if (totalObjectives >= 3) qualityScore += 10;
    if (courseInformation.price > 0) qualityScore += 10;
    
    // Market predictions
    const estimatedStudents = Math.round(qualityScore * 2 + totalLessons * 5);
    const estimatedRevenue = estimatedStudents * (courseInformation.price || 0) * 0.7; // 70% conversion rate
    
    return {
      totalModules,
      totalLessons,
      totalDuration,
      totalObjectives,
      avgLessonsPerModule,
      qualityScore: Math.min(qualityScore, 100),
      estimatedStudents,
      estimatedRevenue
    };
  }, [modules, objectives, courseInformation]);

  // Readiness checks
  const readinessChecks = [
    {
      name: "Tiêu đề khóa học",
      passed: courseInformation.title && courseInformation.title.length >= 10,
      required: true
    },
    {
      name: "Mô tả chi tiết",
      passed: courseInformation.description && courseInformation.description.length >= 50,
      required: true
    },
    {
      name: "Ít nhất 3 chương",
      passed: modules.length >= 3,
      required: true
    },
    {
      name: "Mỗi chương có ít nhất 1 video bài học",
      passed: modules.every(module => 
        module.lessons && 
        module.lessons.length > 0 && 
        module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
      ),
      required: true
    },
    {
      name: "Ít nhất 2 giờ nội dung",
      passed: analytics.totalDuration >= 120,
      required: false
    },
    {
      name: "Mục tiêu học tập rõ ràng",
      passed: objectives.length >= 3,
      required: true
    },
    {
      name: "Định giá khóa học",
      passed: courseInformation.price > 0,
      required: false
    }
  ];

  const requiredChecksPassed = readinessChecks.filter(check => check.required && check.passed).length;
  const totalRequiredChecks = readinessChecks.filter(check => check.required).length;
  const readinessPercentage = Math.round((requiredChecksPassed / totalRequiredChecks) * 100);
  const isReadyToPublish = requiredChecksPassed === totalRequiredChecks;

  const [showPublishModal, setShowPublishModal] = useState(false);

  const handlePublish = () => {
    if (!isReadyToPublish) {
      message.warning('Vui lòng hoàn thành tất cả yêu cầu bắt buộc trước khi xuất bản!');
      return;
    }
    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    setShowPublishModal(false);
    
    try {
      const success = await createCourse();
      
      if (success) {
        message.success('Khóa học đã được xuất bản thành công!');
        setTimeout(() => {
          router.push('/Lecturer/courses');
        }, 1500);
      } else {
        message.error('Không thể xuất bản khóa học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error during course creation:', error);
      message.error('Lỗi khi xuất bản khóa học. Vui lòng thử lại.');
    }
  };

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <FaChartLine />
          Thống kê khóa học
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24} sm={8}>
              <Card>
                <Statistic 
                  title="Chương học" 
                  value={analytics.totalModules} 
                  prefix={<FaBook className="text-blue-500" />}
                />
              </Card>
            </Col>
            <Col span={24} sm={8}>
              <Card>
                <Statistic 
                  title="Bài học" 
                  value={analytics.totalLessons} 
                  prefix={<FaPlay className="text-green-500" />}
                />
              </Card>
            </Col>
            <Col span={24} sm={8}>
              <Card>
                <Statistic 
                  title="Thời lượng (phút)" 
                  value={analytics.totalDuration} 
                  prefix={<FaClock className="text-orange-500" />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24} sm={8}>
              <Card>
                <Statistic 
                  title="Mục tiêu học tập" 
                  value={analytics.totalObjectives} 
                  prefix={<FaBullseye className="text-purple-500" />}
                />
              </Card>
            </Col>
            <Col span={24} sm={8}>
              <Card>
                <Statistic 
                  title="TB bài/chương" 
                  value={analytics.avgLessonsPerModule} 
                  prefix={<FaGraduationCap className="text-indigo-500" />}
                />
              </Card>
            </Col>
            <Col span={24} sm={8}>
              <Card>
                <Statistic 
                  title="Điểm chất lượng" 
                  value={analytics.qualityScore} 
                  suffix="/100"
                  prefix={<FaRocket className="text-red-500" />}
                />
              </Card>
            </Col>
          </Row>
        </>
      )
    },
    {
      key: "2",
      label: (
        <span>
          <FaUsers />
          Phân tích thị trường
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <Card title="Dự báo học viên">
              <Statistic 
                title="Học viên tiềm năng" 
                value={analytics.estimatedStudents} 
                prefix={<FaUsers className="text-blue-500" />}
                suffix="người"
              />
              <div className="mt-4">
                <Text className="text-gray-600">
                  Dựa trên số lượng chương, bài học và chất lượng nội dung
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card title="Dự báo doanh thu">
              <Statistic 
                title="Doanh thu ước tính" 
                value={analytics.estimatedRevenue} 
                prefix={<FaMoneyBillWave className="text-green-500" />}
                suffix="đ"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
              <div className="mt-4">
                <Text className="text-gray-600">
                  Trong 6 tháng đầu (dự kiến)
                </Text>
              </div>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Phân tích cạnh tranh" className="mt-4">
              <Row gutter={[16, 16]}>
                <Col span={24} md={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">Cao</div>
                    <Text className="text-gray-600">Tiềm năng thị trường</Text>
                  </div>
                </Col>
                <Col span={24} md={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">Trung bình</div>
                    <Text className="text-gray-600">Mức độ cạnh tranh</Text>
                  </div>
                </Col>
                <Col span={24} md={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">Tốt</div>
                    <Text className="text-gray-600">Khả năng thành công</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: "3",
      label: (
        <span>
          <FaLightbulb />
          Đề xuất cải thiện
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <Card title="Gợi ý nội dung">
              <Timeline
                items={[
                  {
                    color: analytics.totalModules >= 5 ? 'green' : 'blue',
                    dot: analytics.totalModules >= 5 ? <FaCheckCircle /> : <FaExclamationTriangle />,
                    children: (
                      <>
                        <Text strong>Số lượng chương</Text>
                        <br />
                        <Text className="text-gray-600">
                          {analytics.totalModules >= 5 ? 
                            'Số lượng chương đã đủ tốt' : 
                            `Nên có thêm ${5 - analytics.totalModules} chương nữa`
                          }
                        </Text>
                      </>
                    )
                  },
                  {
                    color: modules.every(module => 
                      module.lessons && 
                      module.lessons.length > 0 && 
                      module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
                    ) ? 'green' : 'orange',
                    dot: modules.every(module => 
                      module.lessons && 
                      module.lessons.length > 0 && 
                      module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
                    ) ? <FaCheckCircle /> : <FaExclamationTriangle />,
                    children: (
                      <>
                        <Text strong>Video bài học cho từng chương</Text>
                        <br />
                        <Text className="text-gray-600">
                          {modules.every(module => 
                            module.lessons && 
                            module.lessons.length > 0 && 
                            module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
                          ) ? 
                            'Mỗi chương đã có ít nhất 1 video bài học' : 
                            'Một số chương chưa có video bài học'
                          }
                        </Text>
                      </>
                    )
                  },
                  {
                    color: analytics.totalDuration >= 180 ? 'green' : 'blue',
                    dot: analytics.totalDuration >= 180 ? <FaCheckCircle /> : <FaExclamationTriangle />,
                    children: (
                      <>
                        <Text strong>Thời lượng nội dung</Text>
                        <br />
                        <Text className="text-gray-600">
                          {analytics.totalDuration >= 180 ? 
                            'Thời lượng đã đủ phong phú' : 
                            `Nên có thêm ${Math.ceil((180 - analytics.totalDuration) / 60)} giờ nữa`
                          }
                        </Text>
                      </>
                    )
                  }
                ]}
              />
            </Card>
          </Col>

          <Col span={24} md={12}>
            <Card title="Khuyến nghị SEO">
              <List
                dataSource={[
                  'Thêm từ khóa phổ biến vào tiêu đề',
                  'Viết mô tả thu hút và chi tiết hơn',
                  'Thêm tags phù hợp với nội dung',
                  'Tạo video giới thiệu khóa học',
                  'Thêm chứng chỉ hoàn thành khóa học'
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{index + 1}</Tag>
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <FadeInUp>
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Title level={2} className="mb-2">
              📊 Phân tích và Xuất bản
            </Title>
            <Paragraph className="text-gray-600 mb-6">
              Xem lại thống kê khóa học và chuẩn bị xuất bản
            </Paragraph>
          </div>

          {/* Readiness Status */}
          <Card className="mb-6">
            <Title level={4} className="mb-4">
              Trạng thái sẵn sàng xuất bản
            </Title>
            
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={24} sm={12}>
                <div className="text-center">
                  <Progress 
                    type="circle"
                    percent={readinessPercentage}
                    status={isReadyToPublish ? 'success' : 'active'}
                    strokeColor={isReadyToPublish ? '#52c41a' : '#1890ff'}
                  />
                  <div className="mt-2">
                    <Text strong className={isReadyToPublish ? 'text-green-600' : 'text-blue-600'}>
                      {isReadyToPublish ? 'Sẵn sàng xuất bản' : 'Cần hoàn thiện'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={24} sm={12}>
                <List
                  size="small"
                  dataSource={readinessChecks.filter(check => check.required)}
                  renderItem={check => (
                    <List.Item>
                      <Space>
                        {check.passed ? 
                          <FaCheckCircle className="text-green-500" /> : 
                          <FaExclamationTriangle className="text-orange-500" />
                        }
                        <Text className={check.passed ? 'text-green-600' : 'text-gray-500'}>
                          {check.name}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>

            {/* New requirement alert */}
            <Alert
              message="Yêu cầu mới về nội dung"
              description="Từ nay, mỗi chương chỉ cần có ít nhất 1 video bài học thay vì yêu cầu tổng cộng 10 bài học. Điều này giúp bạn tạo khóa học nhanh chóng và hiệu quả hơn."
              type="info"
              showIcon
              className="mb-4"
            />

            {!isReadyToPublish && (
              <Alert
                message="Khóa học chưa sẵn sàng"
                description="Vui lòng hoàn thành tất cả yêu cầu bắt buộc được đánh dấu bên trên."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            <List
              size="small"
              dataSource={readinessChecks}
              renderItem={(check) => (
                <List.Item>
                  <Space>
                    {check.passed ? 
                      <FaCheckCircle className="text-green-500" /> : 
                      <FaExclamationTriangle className="text-orange-500" />
                    }
                    <Text className={check.passed ? 'text-green-600' : 'text-gray-500'}>
                      {check.name}
                    </Text>
                    {check.required && <Tag color="red">Bắt buộc</Tag>}
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          <Tabs defaultActiveKey="1" items={tabItems} />

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button 
              size="large" 
              icon={<FaArrowLeft />}
              onClick={() => {
                const container = document.getElementById('create-course-content');
                if (container) {
                  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setCurrentStep(3);
              }}
            >
              Quay lại
            </Button>
            
            <Space>
              <Button 
                size="large"
                onClick={() => router.push('/Lecturer/courses/create-course?step=1')}
              >
                Chỉnh sửa
              </Button>
              <Button 
                type="primary" 
                size="large"
                icon={<FaPaperPlane />}
                onClick={handlePublish}
                disabled={!isReadyToPublish}
              >
                Xuất bản khóa học
              </Button>
            </Space>
          </div>

          {/* Publish Confirmation Modal */}
          <Modal
            title="Xác nhận xuất bản"
            open={showPublishModal}
            onOk={confirmPublish}
            onCancel={() => setShowPublishModal(false)}
            okText="Xuất bản"
            cancelText="Hủy"
          >
            <p>Bạn có chắc chắn muốn xuất bản khóa học này không?</p>
            <p>Sau khi xuất bản, học viên sẽ có thể tìm thấy và đăng ký khóa học của bạn.</p>
          </Modal>
        </div>
      </FadeInUp>
    </ConfigProvider>
  );
};

export default Analytics;