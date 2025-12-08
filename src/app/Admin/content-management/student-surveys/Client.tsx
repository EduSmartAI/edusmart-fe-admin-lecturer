"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Row,
  Col,
  Alert,
  Empty,
  Badge,
  Button,
  Modal,
  Descriptions,
  Spin,
  Tooltip,
  Space,
  message,
} from "antd";
import {
  FormOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useStudentSurveyStore } from "EduSmart/stores/Admin";
import { StudentSurvey, quizAdminServiceApi, StudentSurveyDetail } from "EduSmart/api/api-quiz-admin-service";
import moment from "moment";

export default function StudentSurveysClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSurveyDetail, setSelectedSurveyDetail] = useState<StudentSurveyDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const {
    surveys,
    isLoading,
    error,
    total,
    pageSize,
    fetchSurveys,
    clearError,
  } = useStudentSurveyStore();

  // Load surveys on mount and when page changes
  useEffect(() => {
    fetchSurveys(currentPage - 1, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Get survey code color
  const getSurveyCodeColor = (code: string) => {
    switch (code) {
      case "HABIT":
        return "blue";
      case "INTEREST":
        return "green";
      case "SKILL":
        return "orange";
      default:
        return "default";
    }
  };

  // Handle view detail
  const handleViewDetail = async (studentQuizId: string) => {
    setLoadingDetail(true);
    try {
      const response = await quizAdminServiceApi.getStudentSurveyDetail(studentQuizId);
      
      if (response.success && response.response) {
        setSelectedSurveyDetail(response.response);
        setDetailModalVisible(true);
      } else {
        message.error(response.message || 'Không thể tải chi tiết khảo sát');
      }
    } catch (err) {
      message.error('Lỗi khi tải chi tiết khảo sát');
      console.error('[StudentSurveysClient] Error loading detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Get question type label
  const getQuestionTypeLabel = (type: number) => {
    switch (type) {
      case 1: return 'Trắc nghiệm';
      case 2: return 'Đúng/Sai';
      case 3: return 'Số';
      case 4: return 'Lựa chọn';
      default: return 'Khác';
    }
  };

  // Table columns
  const columns = [
    {
      title: "Sinh viên",
      key: "student",
      width: "20%",
      render: (_: unknown, record: StudentSurvey) => (
        <div>
          <div className="font-medium text-gray-900">{record.studentName}</div>
          <div className="text-sm text-gray-500">{record.studentEmail}</div>
        </div>
      ),
    },
    {
      title: "Khảo sát",
      key: "survey",
      width: "25%",
      render: (_: unknown, record: StudentSurvey) => (
        <div>
          <div className="font-medium">
            {record.surveyTitle || <span className="text-gray-400">Chưa có tiêu đề</span>}
          </div>
          <Tag color={getSurveyCodeColor(record.surveyCode)} className="mt-1">
            {record.surveyCode}
          </Tag>
        </div>
      ),
    },
    {
      title: "Câu hỏi",
      dataIndex: "totalQuestions",
      key: "totalQuestions",
      width: "10%",
      align: "center" as const,
      render: (total: number) => (
        <Badge count={total} showZero style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Đã trả lời",
      dataIndex: "totalAnswers",
      key: "totalAnswers",
      width: "10%",
      align: "center" as const,
      render: (answers: number, record: StudentSurvey) => (
        <div className="flex items-center justify-center gap-2">
          <Badge count={answers} showZero style={{ backgroundColor: "#1890ff" }} />
          {answers === record.totalQuestions && (
            <CheckCircleOutlined className="text-green-600" />
          )}
        </div>
      ),
    },
    {
      title: "Ngày làm",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "13%",
      render: (date: string) => (
        <div className="text-sm">
          <div>{moment(new Date(date)).format("DD/MM/YYYY")}</div>
          <div className="text-gray-500">{moment(new Date(date)).format("HH:mm")}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: "12%",
      render: (_: unknown, record: StudentSurvey) => {
        const isComplete = record.totalAnswers === record.totalQuestions;
        return (
          <Tag color={isComplete ? "success" : "warning"} icon={isComplete ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {isComplete ? "Hoàn thành" : "Chưa xong"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "8%",
      align: "center" as const,
      render: (_: unknown, record: StudentSurvey) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record.studentQuizId)}
              loading={loadingDetail}
              className="text-blue-600 hover:text-blue-700"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FormOutlined className="text-2xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Khảo Sát Sinh Viên</h1>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchSurveys(0, 20)}
            >
              Làm mới
            </Button>
          </div>
          <p className="text-gray-600">
            Xem danh sách và chi tiết các bài khảo sát sinh viên đã hoàn thành
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng khảo sát</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {surveys?.filter((s) => s.totalAnswers === s.totalQuestions).length || 0}
                </div>
                <div className="text-gray-600 text-sm mt-1">Hoàn thành</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {surveys?.filter((s) => s.surveyCode === "HABIT").length || 0}
                </div>
                <div className="text-gray-600 text-sm mt-1">Thói quen</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {surveys?.filter((s) => s.surveyCode === "INTEREST").length || 0}
                </div>
                <div className="text-gray-600 text-sm mt-1">Sở thích</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            closable
            onClose={() => clearError()}
            className="mb-6"
          />
        )}

        {/* Table */}
        <Card className="shadow-sm">
          {!isLoading && (!surveys || surveys.length === 0) ? (
            <Empty
              description="Chưa có khảo sát nào"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={surveys}
              rowKey="studentQuizId"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} khảo sát`,
              }}
              bordered
            />
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FormOutlined className="text-blue-600" />
              <span>Chi tiết khảo sát sinh viên</span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedSurveyDetail(null);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={900}
        >
          {selectedSurveyDetail ? (
            <div className="space-y-4">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Sinh viên" span={2}>
                  <div>
                    <div className="font-medium">{selectedSurveyDetail.studentName}</div>
                    <div className="text-sm text-gray-500">{selectedSurveyDetail.studentEmail}</div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Khảo sát" span={2}>
                  <div className="flex items-center gap-2">
                    <span>{selectedSurveyDetail.surveyTitle || 'Chưa có tiêu đề'}</span>
                    <Tag color={getSurveyCodeColor(selectedSurveyDetail.surveyCode || '')}>
                      {selectedSurveyDetail.surveyCode}
                    </Tag>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedSurveyDetail.surveyDescription || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian làm">
                  {moment(selectedSurveyDetail.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Số câu hỏi">
                  <Badge count={selectedSurveyDetail.questionResults.length} showZero style={{ backgroundColor: '#52c41a' }} />
                </Descriptions.Item>
              </Descriptions>

              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Câu trả lời ({selectedSurveyDetail.questionResults.length} câu)
                </h4>
                <div className="space-y-4">
                  {selectedSurveyDetail.questionResults.map((q, index) => (
                    <Card key={q.questionId} size="small" className="bg-gray-50">
                      <div className="mb-3">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-gray-800 flex-1">
                            <span className="text-blue-600 mr-2">Câu {index + 1}:</span>
                            {q.questionText}
                          </div>
                          <Tag color="blue" className="ml-2">
                            {getQuestionTypeLabel(q.questionType)}
                          </Tag>
                        </div>
                      </div>
                      <div className="ml-4 space-y-2">
                        {q.answers.map((a, aIndex) => (
                          <div
                            key={a.answerId}
                            className={`flex items-center gap-2 p-2 rounded ${
                              a.selectedByStudent
                                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                : 'bg-white'
                            }`}
                          >
                            <span className="text-xs font-medium min-w-[20px]">
                              {String.fromCharCode(65 + aIndex)}.
                            </span>
                            <span className={a.selectedByStudent ? 'font-medium text-blue-700' : 'text-gray-600'}>
                              {a.answerText}
                            </span>
                            {a.selectedByStudent && (
                              <CheckCircleOutlined className="text-blue-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-12">
              <Spin />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
