"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Spin,
  Alert,
  Button,
  Descriptions,
  Tag,
  Collapse,
  Space,
  Row,
  Col,
  Empty,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useStudentTestStore } from "EduSmart/stores/Admin/StudentTestStore";
import dayjs from "dayjs";

const { Panel } = Collapse;

export default function StudentTestDetailClient() {
  const params = useParams();
  const router = useRouter();
  const studentTestId = params.id as string;

  const {
    selectedTestDetail,
    isLoadingDetail,
    error,
    fetchTestDetail,
    clearDetail,
    clearError,
  } = useStudentTestStore();

  useEffect(() => {
    if (studentTestId) {
      fetchTestDetail(studentTestId);
    }

    return () => {
      clearDetail();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentTestId]);

  if (isLoadingDetail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spin size="large">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Error Loading Test Detail"
            description={error}
            type="error"
            closable
            onClose={() => {
              clearError();
              router.back();
            }}
          />
        </div>
      </div>
    );
  }

  if (!selectedTestDetail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Empty description="No test detail found" />
          <div className="text-center mt-4">
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const { testName, testDescription, startedAt, finishedAt, quizResults } = selectedTestDetail;

  const formatDuration = (totalMinutes: number) => {
    const safeMinutes = Number.isFinite(totalMinutes) ? Math.max(0, Math.floor(totalMinutes)) : 0;
    const days = Math.floor(safeMinutes / (24 * 60));
    const hours = Math.floor((safeMinutes % (24 * 60)) / 60);
    const minutes = safeMinutes % 60;

    if (days > 0) return `${days} ngày ${hours} giờ ${minutes} phút`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  // Calculate totals
  const totalQuestions = quizResults.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
  const totalCorrect = quizResults.reduce((sum, quiz) => sum + quiz.totalCorrectAnswers, 0);
  const percentage = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;

  const getScoreColor = () => {
    const score = parseFloat(percentage as string);
    if (score >= 80) return "green";
    if (score >= 60) return "orange";
    return "red";
  };

  const getDifficultyLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: "Dễ",
      2: "Trung bình",
      3: "Khó",
    };
    return labels[level] || `Mức ${level}`;
  };

  const getDifficultyColor = (level: number) => {
    const colors: Record<number, string> = {
      1: "green",
      2: "orange",
      3: "red",
    };
    return colors[level] || "default";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mb-4"
          >
            Quay lại danh sách
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileTextOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {testName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Chi tiết kết quả làm bài
              </p>
            </div>
          </div>
        </div>

        {/* Test Info Card */}
        <Card className="mb-6 shadow-sm border-0">
          <Descriptions title="Thông tin bài kiểm tra" column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Tên bài kiểm tra">
              <span className="font-semibold">{testName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Bắt đầu">
              <Space>
                <ClockCircleOutlined />
                {dayjs(startedAt).format("DD/MM/YYYY HH:mm")}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Hoàn thành">
              <Space>
                <CheckCircleOutlined className="text-green-500" />
                {dayjs(finishedAt).format("DD/MM/YYYY HH:mm")}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng">
              {formatDuration(dayjs(finishedAt).diff(dayjs(startedAt), "minute"))}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng số quiz">
              <Tag color="blue">{quizResults.length}</Tag>
            </Descriptions.Item>
          </Descriptions>

          {testDescription && (
            <>
              <Divider />
              <div>
                <strong>Mô tả:</strong>
                <p className="mt-2 text-gray-600">{testDescription}</p>
              </div>
            </>
          )}
        </Card>

        {/* Score Summary */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <Tag color={getScoreColor()} className="text-2xl font-bold px-4 py-2">
                  {percentage}%
                </Tag>
                <div className="text-gray-600 text-sm mt-2">Điểm tổng</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalCorrect}</div>
                <div className="text-gray-600 text-sm mt-2">Số câu đúng</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-gray-600 text-sm mt-2">Tổng câu hỏi</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quiz Results */}
        <Card className="shadow-sm border-0" title={`Kết quả từng quiz (${quizResults.length})`}>
          <Collapse accordion>
            {quizResults.map((quiz, quizIndex) => {
              const quizPercentage = ((quiz.totalCorrectAnswers / quiz.totalQuestions) * 100).toFixed(1);
              const subjectLabel = String(quiz.subjectCodeName || "").trim();
              
              return (
                <Panel
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{quiz.title}</span>
                        {subjectLabel && <Tag color="purple">{subjectLabel}</Tag>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag color={parseFloat(quizPercentage) >= 60 ? "green" : "red"}>
                          {quiz.totalCorrectAnswers}/{quiz.totalQuestions} ({quizPercentage}%)
                        </Tag>
                      </div>
                    </div>
                  }
                  key={quizIndex}
                >
                  {quiz.description && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <strong>Mô tả:</strong> {quiz.description}
                    </div>
                  )}

                  <div className="space-y-4">
                    {quiz.questionResults.map((question, qIndex) => {
                      const isCorrect = question.answers.some(
                        (a) => a.selectedByStudent && a.isCorrectAnswer
                      );
                      const hasAnswer = question.answers.some((a) => a.selectedByStudent);

                      return (
                        <Card
                          key={qIndex}
                          size="small"
                          className={`border-l-4 ${
                            isCorrect
                              ? "border-l-green-500"
                              : hasAnswer
                              ? "border-l-red-500"
                              : "border-l-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-semibold">
                              {qIndex + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{question.questionText}</span>
                                <Tag color={getDifficultyColor(question.difficultyLevel)}>
                                  {getDifficultyLabel(question.difficultyLevel)}
                                </Tag>
                                {isCorrect ? (
                                  <CheckCircleOutlined className="text-green-500 text-lg" />
                                ) : hasAnswer ? (
                                  <CloseCircleOutlined className="text-red-500 text-lg" />
                                ) : (
                                  <QuestionCircleOutlined className="text-gray-400 text-lg" />
                                )}
                              </div>

                              <div className="space-y-2 mt-3">
                                {question.answers.map((answer, aIndex) => (
                                  <div
                                    key={aIndex}
                                    className={`p-2 rounded flex items-center gap-2 ${
                                      answer.isCorrectAnswer
                                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
                                        : answer.selectedByStudent
                                        ? "bg-red-50 dark:bg-red-900/20 border border-red-200"
                                        : "bg-gray-50 dark:bg-gray-800"
                                    }`}
                                  >
                                    {answer.isCorrectAnswer && (
                                      <CheckCircleOutlined className="text-green-600" />
                                    )}
                                    {!answer.isCorrectAnswer && answer.selectedByStudent && (
                                      <CloseCircleOutlined className="text-red-600" />
                                    )}
                                    <span>{answer.answerText}</span>
                                    {answer.selectedByStudent && (
                                      <Tag color="blue" className="ml-auto">
                                        Đã chọn
                                      </Tag>
                                    )}
                                    {answer.isCorrectAnswer && !answer.selectedByStudent && (
                                      <Tag color="green" className="ml-auto">
                                        Đáp án đúng
                                      </Tag>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200">
                                  <strong className="text-blue-700 dark:text-blue-300">
                                    Giải thích:
                                  </strong>
                                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                                    {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Panel>
              );
            })}
          </Collapse>
        </Card>
      </div>
    </div>
  );
}
