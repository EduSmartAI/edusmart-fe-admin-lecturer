"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Spin,
  Alert,
  Button,
  Descriptions,
  Tabs,
  Tag,
  Space,
  Collapse,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useInitialTestStore } from "EduSmart/stores/Admin";

const { TabPane } = Tabs;
const { Panel } = Collapse;

export default function InitialTestDetailClient() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const { selectedTest, isLoading, error, getTestDetail, clearError } = useInitialTestStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (testId) {
      getTestDetail(testId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "green";
      case 2:
        return "orange";
      case 3:
        return "red";
      default:
        return "default";
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Dễ";
      case 2:
        return "Trung bình";
      case 3:
        return "Khó";
      default:
        return "Không xác định";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            closable
            onClose={clearError}
            showIcon
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Empty description="Không tìm thấy bài kiểm tra" />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mb-4"
          >
            Quay lại
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FileTextOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedTest.testName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {selectedTest.description}
                </p>
              </div>
            </div>

            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => router.push(`/Admin/content-management/initial-tests/${testId}/edit`)}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng số Quiz</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {selectedTest.totalQuizzes}
                </p>
              </div>
              <BookOutlined className="text-4xl text-blue-500" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng câu hỏi</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {selectedTest.totalQuestions}
                </p>
              </div>
              <QuestionCircleOutlined className="text-4xl text-green-500" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Học viên hoàn thành</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {selectedTest.totalStudentsCompleted || 0}
                </p>
              </div>
              <CheckCircleOutlined className="text-4xl text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Tổng quan" key="overview">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Tên bài kiểm tra" span={2}>
                  {selectedTest.testName}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedTest.description}
                </Descriptions.Item>
                <Descriptions.Item label="Số Quiz">
                  {selectedTest.totalQuizzes}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng câu hỏi">
                  {selectedTest.totalQuestions}
                </Descriptions.Item>
                <Descriptions.Item label="Học viên hoàn thành">
                  {selectedTest.totalStudentsCompleted || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(selectedTest.createdAt).toLocaleDateString("vi-VN")}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={`Quizzes (${selectedTest.quizzes?.length || 0})`} key="quizzes">
              <Collapse accordion>
                {selectedTest.quizzes?.map((quiz) => (
                  <Panel
                    header={
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{quiz.title}</span>
                          <p className="text-xs text-gray-500 mt-1">{quiz.description}</p>
                        </div>
                        <Space>
                          <Tag color="blue">{quiz.totalQuestions} câu hỏi</Tag>
                          <Tag color="purple">{quiz.subjectCodeName}</Tag>
                        </Space>
                      </div>
                    }
                    key={quiz.quizId}
                  >
                    <div className="space-y-4">
                      <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="Môn học" span={2}>
                          {quiz.subjectCodeName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả" span={2}>
                          {quiz.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số câu hỏi">
                          {quiz.totalQuestions}
                        </Descriptions.Item>
                      </Descriptions>

                      <div className="mt-4">
                        <h4 className="font-semibold mb-3">
                          Câu hỏi ({quiz.questions?.length || 0})
                        </h4>
                        <div className="space-y-4">
                          {quiz.questions?.map((question, qIndex) => (
                            <Card key={question.questionId} size="small" className="bg-gray-50">
                              <div className="mb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span className="font-medium text-blue-600 mr-2">
                                      Câu {qIndex + 1}:
                                    </span>
                                    <span>{question.questionText}</span>
                                  </div>
                                  <Space>
                                    <Tag color={getDifficultyColor(question.difficultyLevel)}>
                                      {getDifficultyLabel(question.difficultyLevel)}
                                    </Tag>
                                    <Tag>{question.questionTypeName}</Tag>
                                  </Space>
                                </div>
                              </div>

                              <div className="ml-6 space-y-2">
                                {question.answers?.map((answer, aIndex) => (
                                  <div
                                    key={answer.answerId}
                                    className={`flex items-center gap-2 p-2 rounded ${
                                      answer.isCorrect
                                        ? "bg-green-50 border-l-4 border-l-green-500"
                                        : "bg-white"
                                    }`}
                                  >
                                    <span className="text-xs font-medium min-w-[20px]">
                                      {String.fromCharCode(65 + aIndex)}.
                                    </span>
                                    <span
                                      className={
                                        answer.isCorrect
                                          ? "font-medium text-green-700"
                                          : "text-gray-600"
                                      }
                                    >
                                      {answer.answerText}
                                    </span>
                                    {answer.isCorrect ? (
                                      <CheckCircleOutlined className="text-green-600 ml-auto" />
                                    ) : (
                                      <CloseCircleOutlined className="text-gray-400 ml-auto" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
