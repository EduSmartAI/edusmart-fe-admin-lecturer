"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Popconfirm,
  message,
  Collapse,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useInitialTestStore } from "EduSmart/stores/Admin";
import { useSubjectStore } from "EduSmart/stores/SubjectStore";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import {
  InsertQuizDto,
  InsertQuizQuestionDto,
  Question,
  Quiz,
} from "EduSmart/types/initial-test";

const { Panel } = Collapse;
const { TextArea } = Input;

interface QuizFormValues {
  title: string;
  description: string;
  subjectCode: string;
  questions: {
    questionText: string;
    questionType: number;
    difficultyLevel: number;
    answers: {
      answerText: string;
      isCorrect: boolean;
    }[];
  }[];
}

interface QuestionFormValues {
  questions: {
    questionText: string;
    questionType: number;
    difficultyLevel: number;
    answers: {
      answerText: string;
      isCorrect: boolean;
    }[];
  }[];
}

export default function InitialTestsClient() {
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Record<string, string[]>>({});
  const [quizForm] = Form.useForm();
  const [questionForm] = Form.useForm();

  const {
    selectedTest,
    isLoading,
    error,
    getTestDetail,
    insertTestQuiz,
    insertTestQuizQuestions,
    deleteTestQuiz,
    deleteTestQuizQuestions,
    clearError,
  } = useInitialTestStore();

  const {
    subjects,
    isLoading: isLoadingSubjects,
    fetchSubjects,
  } = useSubjectStore();

  // Load the initial test on mount
  useEffect(() => {
    getTestDetail("");
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    getTestDetail("");
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!selectedTest) return;

    try {
      console.log("[Client] Deleting quiz:", quizId);
      const success = await deleteTestQuiz(selectedTest.testId, quizId);
      if (success) {
        message.success("Xóa quiz thành công!");
      } else {
        message.error("Không thể xóa quiz");
      }
    } catch (err) {
      console.error("[Client] Error deleting quiz:", err);
      message.error(formatErrorMessage(err));
    }
  };

  const handleDeleteQuestions = async (quizId: string) => {
    if (!selectedTest) return;

    const questionIds = selectedQuestionIds[quizId] || [];
    if (questionIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một câu hỏi để xóa");
      return;
    }

    try {
      console.log("[Client] Deleting questions:", questionIds);
      const success = await deleteTestQuizQuestions(
        selectedTest.testId,
        quizId,
        questionIds
      );
      if (success) {
        message.success(`Xóa ${questionIds.length} câu hỏi thành công!`);
        setSelectedQuestionIds((prev) => ({ ...prev, [quizId]: [] }));
      } else {
        message.error("Không thể xóa câu hỏi");
      }
    } catch (err) {
      console.error("[Client] Error deleting questions:", err);
      message.error(formatErrorMessage(err));
    }
  };

  const handleAddQuiz = async (values: QuizFormValues) => {
    if (!selectedTest) return;

    console.log("[Client] Adding quiz with values:", values);

    const quizDto: InsertQuizDto = {
      subjectCode: values.subjectCode,
      title: values.title,
      description: values.description,
      questions: values.questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        difficultyLevel: q.difficultyLevel,
        answers: q.answers,
      })),
    };

    console.log("[Client] Quiz DTO:", quizDto);

    try {
      const success = await insertTestQuiz(selectedTest.testId, [quizDto]);
      if (success) {
        message.success("Thêm quiz thành công!");
        setIsAddQuizModalOpen(false);
        quizForm.resetFields();
      } else {
        message.error("Không thể thêm quiz");
      }
    } catch (err) {
      console.error("[Client] Error adding quiz:", err);
      message.error(formatErrorMessage(err));
    }
  };

  const handleAddQuestions = async (values: QuestionFormValues) => {
    if (!selectedTest || !selectedQuizId) return;

    console.log("[Client] Adding questions with values:", values);

    const questions: InsertQuizQuestionDto[] = values.questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      difficultyLevel: q.difficultyLevel,
      answers: q.answers,
    }));

    console.log("[Client] Questions DTO:", questions);

    try {
      const success = await insertTestQuizQuestions(
        selectedTest.testId,
        selectedQuizId,
        questions
      );
      if (success) {
        message.success("Thêm câu hỏi thành công!");
        setIsAddQuestionModalOpen(false);
        setSelectedQuizId(null);
        questionForm.resetFields();
      } else {
        message.error("Không thể thêm câu hỏi");
      }
    } catch (err) {
      console.error("[Client] Error adding questions:", err);
      message.error(formatErrorMessage(err));
    }
  };

  const openAddQuestionModal = (quizId: string) => {
    setSelectedQuizId(quizId);
    setIsAddQuestionModalOpen(true);
  };

  const handleQuestionSelect = (quizId: string, questionId: string, checked: boolean) => {
    setSelectedQuestionIds((prev) => {
      const current = prev[quizId] || [];
      if (checked) {
        return { ...prev, [quizId]: [...current, questionId] };
      } else {
        return { ...prev, [quizId]: current.filter((id) => id !== questionId) };
      }
    });
  };

  const getDifficultyTag = (level: number) => {
    const labels: Record<number, string> = {
      0: "Không xác định",
      1: "Dễ",
      2: "Trung bình",
      3: "Khó",
    };
    const colors: Record<number, string> = {
      0: "default",
      1: "green",
      2: "orange",
      3: "red",
    };
    return (
      <Tag color={colors[level] || "default"}>
        {labels[level] || `Level ${level}`}
      </Tag>
    );
  };

  const renderQuestionCard = (question: Question, quizId: string) => {
    const isSelected = (selectedQuestionIds[quizId] || []).includes(
      question.questionId
    );
    return (
      <Card
        key={question.questionId}
        size="small"
        className={`mb-2 ${isSelected ? "border-blue-500 border-2" : ""}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onChange={(e) =>
              handleQuestionSelect(quizId, question.questionId, e.target.checked)
            }
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getDifficultyTag(question.difficultyLevel)}
              <Tag color="blue">{question.questionTypeName}</Tag>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {question.questionText}
            </p>
            <div className="mt-2 space-y-1">
              {question.answers.map((answer) => (
                <div
                  key={answer.answerId}
                  className={`flex items-center gap-2 p-2 rounded ${
                    answer.isCorrect
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  {answer.isCorrect ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <CloseCircleOutlined className="text-red-500" />
                  )}
                  <span
                    className={
                      answer.isCorrect
                        ? "text-green-700 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    {answer.answerText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderQuizPanel = (quiz: Quiz) => {
    const selectedCount = (selectedQuestionIds[quiz.quizId] || []).length;
    return (
      <Panel
        key={quiz.quizId}
        header={
          <div className="flex items-center justify-between w-full pr-4">
            <div>
              <span className="font-semibold text-lg">{quiz.title}</span>
              <div className="text-sm text-gray-500 mt-1">
                <Tag color="purple">{quiz.subjectCodeName}</Tag>
                <span className="ml-2">
                  <QuestionCircleOutlined className="mr-1" />
                  {quiz.totalQuestions} câu hỏi
                </span>
              </div>
            </div>
          </div>
        }
        extra={
          <Space onClick={(e) => e.stopPropagation()}>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openAddQuestionModal(quiz.quizId)}
            >
              Thêm câu hỏi
            </Button>
            {selectedCount > 0 && (
              <Popconfirm
                title={`Xóa ${selectedCount} câu hỏi đã chọn?`}
                onConfirm={() => handleDeleteQuestions(quiz.quizId)}
                okText="Có"
                cancelText="Không"
                okButtonProps={{ danger: true }}
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  Xóa ({selectedCount})
                </Button>
              </Popconfirm>
            )}
            <Popconfirm
              title="Xóa quiz này?"
              description="Tất cả câu hỏi trong quiz sẽ bị xóa."
              onConfirm={() => handleDeleteQuiz(quiz.quizId)}
              okText="Có"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                Xóa Quiz
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {quiz.description}
        </p>
        {quiz.questions.length === 0 ? (
          <Empty
            description="Chưa có câu hỏi nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openAddQuestionModal(quiz.quizId)}
            >
              Thêm câu hỏi đầu tiên
            </Button>
          </Empty>
        ) : (
          quiz.questions.map((q) => renderQuestionCard(q, quiz.quizId))
        )}
      </Panel>
    );
  };

  // Calculate stats
  const stats = {
    totalQuizzes: selectedTest?.quizzes.length || 0,
    totalQuestions: selectedTest?.totalQuestions || 0,
    totalStudents: selectedTest?.totalStudentsCompleted || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileTextOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedTest?.testName || "Bài Kiểm Tra Đầu Vào"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedTest?.description ||
                  "Quản lý bài kiểm tra đầu vào cho học viên"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            closable
            onClose={clearError}
            className="mb-4"
            showIcon
          />
        )}

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tổng số Quiz
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {stats.totalQuizzes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <BookOutlined className="text-2xl text-purple-600" />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tổng số câu hỏi
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.totalQuestions}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <QuestionCircleOutlined className="text-2xl text-green-600" />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Học viên đã làm
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stats.totalStudents}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <UserOutlined className="text-2xl text-blue-600" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400">
              Quản lý các quiz và câu hỏi trong bài kiểm tra đầu vào
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddQuizModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 flex-1 md:flex-none"
              >
                Thêm Quiz mới
              </Button>
            </div>
          </div>
        </Card>

        {/* Quizzes List */}
        <Card className="shadow-sm">
          {isLoading && !selectedTest ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : !selectedTest || selectedTest.quizzes.length === 0 ? (
            <Empty
              description="Chưa có quiz nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddQuizModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
              >
                Thêm Quiz đầu tiên
              </Button>
            </Empty>
          ) : (
            <Collapse accordion className="bg-transparent">
              {selectedTest.quizzes.map((quiz) => renderQuizPanel(quiz))}
            </Collapse>
          )}
        </Card>
      </div>

      {/* Add Quiz Modal */}
      <Modal
        title="Thêm Quiz mới"
        open={isAddQuizModalOpen}
        onCancel={() => {
          setIsAddQuizModalOpen(false);
          quizForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={quizForm}
          layout="vertical"
          onFinish={handleAddQuiz}
          initialValues={{
            questions: [
              {
                questionText: "",
                questionType: 1,
                difficultyLevel: 1,
                answers: [
                  { answerText: "", isCorrect: true },
                  { answerText: "", isCorrect: false },
                  { answerText: "", isCorrect: false },
                  { answerText: "", isCorrect: false },
                ],
              },
            ],
          }}
        >
          <Form.Item
            name="title"
            label="Tên Quiz"
            rules={[{ required: true, message: "Vui lòng nhập tên quiz" }]}
          >
            <Input placeholder="Nhập tên quiz" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={2} placeholder="Nhập mô tả quiz" />
          </Form.Item>

          <Form.Item
            name="subjectCode"
            label="Môn học"
            rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
          >
            <Select
              placeholder="Chọn môn học"
              loading={isLoadingSubjects}
              showSearch
              optionFilterProp="children"
            >
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                <div className="mb-2 font-medium">Câu hỏi:</div>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="mb-4"
                    title={`Câu hỏi ${index + 1}`}
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        >
                          Xóa
                        </Button>
                      )
                    }
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "questionText"]}
                      label="Nội dung câu hỏi"
                      rules={[
                        { required: true, message: "Vui lòng nhập câu hỏi" },
                      ]}
                    >
                      <TextArea rows={2} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "questionType"]}
                          label="Loại câu hỏi"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Select.Option value={1}>Nhiều lựa chọn</Select.Option>
                            <Select.Option value={2}>Đúng/Sai</Select.Option>
                            <Select.Option value={3}>Điền vào chỗ trống</Select.Option>
                            <Select.Option value={4}>Một lựa chọn</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "difficultyLevel"]}
                          label="Độ khó"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Select.Option value={1}>Dễ</Select.Option>
                            <Select.Option value={2}>Trung bình</Select.Option>
                            <Select.Option value={3}>Khó</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.List name={[field.name, "answers"]}>
                      {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
                        <>
                          <div className="mb-2 font-medium">Đáp án:</div>
                          {answerFields.map((answerField, answerIndex) => (
                            <div
                              key={answerField.key}
                              className="flex items-center gap-2 mb-2"
                            >
                              <Form.Item
                                {...answerField}
                                name={[answerField.name, "isCorrect"]}
                                valuePropName="checked"
                                noStyle
                              >
                                <Checkbox />
                              </Form.Item>
                              <Form.Item
                                {...answerField}
                                name={[answerField.name, "answerText"]}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Nhập đáp án",
                                  },
                                ]}
                              >
                                <Input
                                  placeholder={`Đáp án ${answerIndex + 1}`}
                                  className="flex-1"
                                />
                              </Form.Item>
                              {answerFields.length > 2 && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeAnswer(answerField.name)}
                                />
                              )}
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() =>
                              addAnswer({ answerText: "", isCorrect: false })
                            }
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm đáp án
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      questionText: "",
                      questionType: 1,
                      difficultyLevel: 1,
                      answers: [
                        { answerText: "", isCorrect: true },
                        { answerText: "", isCorrect: false },
                        { answerText: "", isCorrect: false },
                        { answerText: "", isCorrect: false },
                      ],
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                  className="mb-4"
                >
                  Thêm câu hỏi
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item className="mb-0 mt-4">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsAddQuizModalOpen(false);
                  quizForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Thêm Quiz
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Questions Modal */}
      <Modal
        title="Thêm câu hỏi vào Quiz"
        open={isAddQuestionModalOpen}
        onCancel={() => {
          setIsAddQuestionModalOpen(false);
          setSelectedQuizId(null);
          questionForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={questionForm}
          layout="vertical"
          onFinish={handleAddQuestions}
          initialValues={{
            questions: [
              {
                questionText: "",
                questionType: 1,
                difficultyLevel: 1,
                answers: [
                  { answerText: "", isCorrect: true },
                  { answerText: "", isCorrect: false },
                  { answerText: "", isCorrect: false },
                  { answerText: "", isCorrect: false },
                ],
              },
            ],
          }}
        >
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="mb-4"
                    title={`Câu hỏi ${index + 1}`}
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        >
                          Xóa
                        </Button>
                      )
                    }
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "questionText"]}
                      label="Nội dung câu hỏi"
                      rules={[
                        { required: true, message: "Vui lòng nhập câu hỏi" },
                      ]}
                    >
                      <TextArea rows={2} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "questionType"]}
                          label="Loại câu hỏi"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Select.Option value={1}>Nhiều lựa chọn</Select.Option>
                            <Select.Option value={2}>Đúng/Sai</Select.Option>
                            <Select.Option value={3}>Điền vào chỗ trống</Select.Option>
                            <Select.Option value={4}>Một lựa chọn</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "difficultyLevel"]}
                          label="Độ khó"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Select.Option value={1}>Dễ</Select.Option>
                            <Select.Option value={2}>Trung bình</Select.Option>
                            <Select.Option value={3}>Khó</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.List name={[field.name, "answers"]}>
                      {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
                        <>
                          <div className="mb-2 font-medium">Đáp án:</div>
                          {answerFields.map((answerField, answerIndex) => (
                            <div
                              key={answerField.key}
                              className="flex items-center gap-2 mb-2"
                            >
                              <Form.Item
                                {...answerField}
                                name={[answerField.name, "isCorrect"]}
                                valuePropName="checked"
                                noStyle
                              >
                                <Checkbox />
                              </Form.Item>
                              <Form.Item
                                {...answerField}
                                name={[answerField.name, "answerText"]}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Nhập đáp án",
                                  },
                                ]}
                              >
                                <Input
                                  placeholder={`Đáp án ${answerIndex + 1}`}
                                  className="flex-1"
                                />
                              </Form.Item>
                              {answerFields.length > 2 && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeAnswer(answerField.name)}
                                />
                              )}
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() =>
                              addAnswer({ answerText: "", isCorrect: false })
                            }
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm đáp án
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      questionText: "",
                      questionType: 1,
                      difficultyLevel: 1,
                      answers: [
                        { answerText: "", isCorrect: true },
                        { answerText: "", isCorrect: false },
                        { answerText: "", isCorrect: false },
                        { answerText: "", isCorrect: false },
                      ],
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                  className="mb-4"
                >
                  Thêm câu hỏi
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item className="mb-0 mt-4">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsAddQuestionModalOpen(false);
                  setSelectedQuizId(null);
                  questionForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Thêm câu hỏi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
