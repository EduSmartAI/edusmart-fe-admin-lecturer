"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
  Popconfirm,
  message,
  InputNumber,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useQuestionStore, type Question, type QuestionType, type QuestionAnswer, type NumericRules } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { APIErrorDisplay } from "EduSmart/components/APIErrorDisplay";

type ModalMode = "create" | "edit" | null;

const QUESTION_TYPES: { label: string; value: QuestionType; color: string }[] = [
  { label: "Short Text", value: "SHORT_TEXT", color: "blue" },
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE", color: "green" },
  { label: "Checkbox", value: "CHECKBOX", color: "orange" },
  { label: "Numeric", value: "NUMERIC", color: "purple" },
];

export default function QuestionsClient() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<QuestionType | "ALL">("ALL");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const {
    questions,
    isLoading,
    error,
    total,
    pageSize,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearError,
  } = useQuestionStore();

  // Load questions on mount and when search/page/filter changes
  useEffect(() => {
    const type = filterType === "ALL" ? undefined : filterType;
    fetchQuestions(currentPage, 20, searchText, type);
  }, [currentPage, searchText, filterType, fetchQuestions]);

  const handleSubmit = async (values: { 
    text: string; 
    type: QuestionType; 
    explanation?: string; 
    options?: string; 
    min?: number; 
    max?: number;
    unit?: string;
    formula?: string;
  }) => {
    try {
      if (modalMode === "create") {
        const questionData: {
          questionText: string;
          questionType: QuestionType;
          explanation: string;
          answers?: QuestionAnswer[];
          numericRules?: NumericRules;
        } = {
          questionText: values.text.trim(),
          questionType: values.type,
          explanation: values.explanation || "",
        };

        // Type-specific fields
        if (values.type === "MULTIPLE_CHOICE" || values.type === "CHECKBOX") {
          const answers = values.options
            ?.split("\n")
            .filter((o: string) => o.trim())
            .map((o: string, index: number) => ({ 
              id: `temp-${index}`, 
              answerText: o.trim(), 
              isCorrect: false 
            })) || [];

          if (answers.length < 2) {
            message.error("Please provide at least 2 options");
            return;
          }

          questionData.answers = answers;
        }

        if (values.type === "NUMERIC") {
          questionData.numericRules = {
            minValue: values.min || 0,
            maxValue: values.max || 100,
            unit: values.unit || "",
            formula: values.formula || undefined,
          };
        }

        const result = await createQuestion(questionData);

        if (result) {
          message.success("Question created successfully!");
          form.resetFields();
          setModalMode(null);
        } else {
          message.error("Failed to create question");
        }
      } else if (modalMode === "edit" && selectedQuestion) {
        const questionData: {
          id: string;
          questionText: string;
          questionType: QuestionType;
          explanation: string;
          isActive: boolean;
          answers?: QuestionAnswer[];
          numericRules?: NumericRules;
        } = {
          id: selectedQuestion.id,
          questionText: values.text.trim(),
          questionType: values.type,
          explanation: values.explanation || "",
          isActive: true,
        };

        // Type-specific fields
        if (values.type === "MULTIPLE_CHOICE" || values.type === "CHECKBOX") {
          const answers = values.options
            ?.split("\n")
            .filter((o: string) => o.trim())
            .map((o: string, index: number) => ({ 
              id: selectedQuestion.answers?.[index]?.id || `temp-${index}`, 
              answerText: o.trim(), 
              isCorrect: false 
            })) || [];

          if (answers.length < 2) {
            message.error("Please provide at least 2 options");
            return;
          }

          questionData.answers = answers;
        }

        if (values.type === "NUMERIC") {
          questionData.numericRules = {
            minValue: values.min || 0,
            maxValue: values.max || 100,
            unit: values.unit || "",
            formula: values.formula || undefined,
          };
        }

        const result = await updateQuestion(questionData);

        if (result) {
          message.success("Question updated successfully!");
          form.resetFields();
          setModalMode(null);
          setSelectedQuestion(null);
        } else {
          message.error("Failed to update question");
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteQuestion(id);
      if (success) {
        message.success("Question deleted successfully!");
        if (questions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchQuestions(
            currentPage,
            pageSize,
            searchText,
            filterType === "ALL" ? undefined : filterType
          );
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setModalMode("edit");

    const options =
      question.answers?.map((o: { answerText: string }) => o.answerText).join("\n") || "";
    const formula = question.numericRules?.formula || "";

    form.setFieldsValue({
      text: question.questionText,
      type: question.questionType,
      isRequired: false,
      order: 0,
      options,
      min: question.numericRules?.minValue || 0,
      max: question.numericRules?.maxValue || 100,
      unit: question.numericRules?.unit || "",
      formula,
    });

    setShowOptions(
      question.questionType === "MULTIPLE_CHOICE" || question.questionType === "CHECKBOX"
    );
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedQuestion(null);
    setModalMode("create");
    setShowOptions(false);
  };

  const handleModalClose = () => {
    setModalMode(null);
    setSelectedQuestion(null);
    form.resetFields();
    setShowOptions(false);
  };

  const getTypeColor = (type: QuestionType) => {
    return QUESTION_TYPES.find((t) => t.value === type)?.color || "default";
  };

  const getTypeLabel = (type: QuestionType) => {
    return QUESTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "questionText",
      key: "questionText",
      width: "30%",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-medium">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "questionType",
      key: "questionType",
      width: "15%",
      render: (type: QuestionType) => (
        <Badge color={getTypeColor(type)} text={getTypeLabel(type)} />
      ),
    },
    {
      title: "Answers",
      dataIndex: "answers",
      key: "answers",
      width: "10%",
      render: (answers: Array<{ answerText: string }>, record: Question) => {
        if (record.questionType === "NUMERIC") {
          return (
            <span className="text-gray-600">
              {record.numericRules?.minValue || 0} - {record.numericRules?.maxValue || 100}
            </span>
          );
        }
        return (
          <span className="font-semibold text-blue-600">
            {answers?.length || 0}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "10%",
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? "success" : "default"}
          text={isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Used In",
      dataIndex: "usedInSurveys",
      key: "usedInSurveys",
      width: "8%",
      render: (count: number) => <span className="text-gray-600">{count || 0}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: "27%",
      render: (_: unknown, record: Question) => (
        <Space size="small" wrap>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Delete question?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                loading={isLoading}
              />
            </Tooltip>
          </Popconfirm>
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
              <BarsOutlined className="text-2xl text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Create and manage reusable survey questions
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Total Questions</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {questions.filter((q) => q.questionType === "SHORT_TEXT").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Short Text</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {
                    questions.filter(
                      (q) =>
                        q.questionType === "MULTIPLE_CHOICE" || q.questionType === "CHECKBOX"
                    ).length
                  }
                </div>
                <div className="text-gray-600 text-sm mt-1">Choice</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {questions.filter((q) => q.questionType === "NUMERIC").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Numeric</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        <APIErrorDisplay error={error} onDismiss={clearError} />

        {/* Toolbar */}
        <Card className="mb-6 shadow-sm">
          <div className="space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <Input
                placeholder="Search questions..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
                className="w-full md:w-64"
              />
              <Select
                value={filterType}
                onChange={setFilterType}
                className="w-full md:w-40"
                options={[
                  { label: "All Types", value: "ALL" },
                  ...QUESTION_TYPES.map((t) => ({
                    label: t.label,
                    value: t.value,
                  })),
                ]}
              />
            </div>
            <Space>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading}
                  onClick={() =>
                    fetchQuestions(
                      currentPage,
                      pageSize,
                      searchText,
                      filterType === "ALL" ? undefined : filterType
                    )
                  }
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Question
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && questions.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : questions.length === 0 ? (
            <Empty
              description="No questions yet"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              <Button
                type="primary"
                onClick={handleCreate}
                icon={<PlusOutlined />}
              >
                Create Your First Question
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={questions}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} to ${range[1]} of ${total} questions`,
              }}
              bordered
            />
          )}
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={
          modalMode === "create"
            ? "Create New Question"
            : "Edit Question"
        }
        open={modalMode !== null}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        destroyOnClose
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="mt-6"
          onValuesChange={(_, values) => {
            setShowOptions(
              values.type === "MULTIPLE_CHOICE" ||
                values.type === "CHECKBOX"
            );
          }}
        >
          <Form.Item
            label="Question Text"
            name="text"
            rules={[
              {
                required: true,
                message: "Please enter question text",
              },
              {
                min: 5,
                message: "Question must be at least 5 characters",
              },
              {
                max: 1000,
                message: "Question must not exceed 1000 characters",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Enter your survey question..."
              rows={3}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Question Type"
                name="type"
                rules={[
                  { required: true, message: "Please select a type" },
                ]}
              >
                <Select size="large" placeholder="Select question type">
                  {QUESTION_TYPES.map((type) => (
                    <Select.Option
                      key={type.value}
                      value={type.value}
                    >
                      <Badge
                        color={type.color}
                        text={type.label}
                      />
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Explanation (Optional)"
                name="explanation"
              >
                <Input
                  size="large"
                  placeholder="Provide explanation if needed"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Options for Multiple Choice and Checkbox */}
          {showOptions && (
            <Form.Item
              label="Options (one per line)"
              name="options"
              rules={[
                {
                  required: true,
                  message: "Please enter at least 2 options",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
              />
            </Form.Item>
          )}

          {/* Numeric fields */}
          {form.getFieldValue("type") === "NUMERIC" && (
            <>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Minimum Value"
                    name="min"
                    initialValue={0}
                  >
                    <InputNumber
                      min={-1000}
                      max={1000}
                      size="large"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Maximum Value"
                    name="max"
                    initialValue={100}
                  >
                    <InputNumber
                      min={-1000}
                      max={1000}
                      size="large"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Unit"
                    name="unit"
                  >
                    <Input
                      placeholder="e.g., %"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Formula (Optional)"
                name="formula"
              >
                <Input
                  placeholder="e.g., x * 0.85"
                  size="large"
                />
              </Form.Item>
            </>
          )}

          <Form.Item name="isRequired" valuePropName="checked">
            <Checkbox>Required question</Checkbox>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end gap-2">
              <Button onClick={handleModalClose}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {modalMode === "create" ? "Create" : "Update"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
