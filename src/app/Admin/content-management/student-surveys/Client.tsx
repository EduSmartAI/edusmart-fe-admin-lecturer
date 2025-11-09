"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Space,
  Tooltip,
  Row,
  Col,
  Alert,
  Empty,
  Badge,
  Button,
} from "antd";
import {
  FormOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useStudentSurveyStore } from "EduSmart/stores/Admin";
import { StudentSurvey } from "EduSmart/api/api-quiz-admin-service";
import moment from "moment";

export default function StudentSurveysClient() {
  const [currentPage, setCurrentPage] = useState(1);

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
  }, [currentPage, fetchSurveys]);

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
      width: "15%",
      render: (_: unknown, record: StudentSurvey) => {
        const isComplete = record.totalAnswers === record.totalQuestions;
        return (
          <Tag color={isComplete ? "success" : "warning"} icon={isComplete ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {isComplete ? "Hoàn thành" : "Chưa xong"}
          </Tag>
        );
      },
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
      </div>
    </div>
  );
}
