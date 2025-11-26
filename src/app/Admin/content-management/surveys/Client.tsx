"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
  Popconfirm,
  message,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useSurveyStore } from "EduSmart/stores/Admin";
import type { Survey, SurveyQuestion } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

type ModalMode = "create" | "edit" | null;

export default function SurveysClient() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const {
    surveys,
    isLoading,
    error,
    total,
    pageSize,
    fetchSurveys,
    createSurvey,
    updateSurvey,
    publishSurvey,
    deleteSurvey,
    clearError,
  } = useSurveyStore();

  // Load surveys on mount and when search/page changes
  useEffect(() => {
    fetchSurveys(currentPage, 20, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchSurveys]);

  const handleSubmit = async (values: {
    surveyCode: string;
    title: string;
    description?: string;
    questions?: Array<{
      questionText: string;
      questionType: number;
      answers: Array<{
        answerText: string;
        isCorrect: boolean;
      }>;
    }>;
  }) => {
    try {
      if (modalMode === "create") {
        // Match the exact API structure from curl
        const payload = {
          title: values.title.trim(),
          description: values.description?.trim() || "",
          surveyCode: values.surveyCode.trim().toUpperCase(),
          questions: values.questions || [],
        };

        const result = await createSurvey(payload);

        if (result) {
          message.success("Tạo khảo sát thành công!");
          form.resetFields();
          setModalMode(null);
        } else {
          message.error("Không thể tạo khảo sát");
        }
      } else if (modalMode === "edit" && selectedSurvey) {
        const result = await updateSurvey({
          id: selectedSurvey.id,
          code: values.surveyCode.trim().toUpperCase(),
          title: values.title.trim(),
          description: values.description?.trim() || "",
          status: selectedSurvey.status,
          questions: (values.questions || selectedSurvey.questions) as SurveyQuestion[],
        });

        if (result) {
          message.success("Cập nhật khảo sát thành công!");
          form.resetFields();
          setModalMode(null);
          setSelectedSurvey(null);
        } else {
          message.error("Không thể cập nhật khảo sát");
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handlePublish = async (surveyId: string) => {
    try {
      const result = await publishSurvey(surveyId);
      if (result) {
        message.success("Xuất bản khảo sát thành công!");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteSurvey(id);
      if (success) {
        message.success("Xóa khảo sát thành công!");
        if (surveys.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchSurveys(currentPage, pageSize, debouncedSearch);
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setModalMode("edit");
    form.setFieldsValue({
      surveyCode: survey.code,
      title: survey.title,
      description: survey.description || "",
      questions: survey.questions || [],
    });
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedSurvey(null);
    setModalMode("create");
  };

  const handleModalClose = () => {
    setModalMode(null);
    setSelectedSurvey(null);
    form.resetFields();
  };

  const getStatusColor = (
    status: string
  ): "success" | "processing" | "default" | "error" => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PUBLISHED":
        return "success";
      case "CLOSED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Nháp";
      case "PUBLISHED":
        return "Đã xuất bản";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: "15%",
      render: (text: string) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
          {text}
        </span>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "30%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status: string) => (
        <Badge
          status={getStatusColor(status)}
          text={getStatusLabel(status)}
        />
      ),
    },
    {
      title: "Câu hỏi",
      dataIndex: "questionCount",
      key: "questionCount",
      width: "12%",
      render: (count: number) => (
        <span className="font-semibold text-blue-600">{count || 0}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "20%",
      render: (_: unknown, record: Survey) => (
        <Space size="small" wrap>
          {record.status === "DRAFT" && (
            <Tooltip title="Xuất bản">
              <Button
                type="text"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handlePublish(record.id)}
                className="text-green-600"
              />
            </Tooltip>
          )}
          {record.status === "PUBLISHED" && (
            <Tooltip title="Đóng">
              <Button
                type="text"
                icon={<StopOutlined />}
                size="small"
                onClick={() => {
                  message.info("Tính năng đóng sẽ có sớm");
                }}
                className="text-orange-600"
              />
            </Tooltip>
          )}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="text-blue-600"
              disabled={record.status !== "DRAFT"}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa khảo sát?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
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
              <FileTextOutlined className="text-2xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Khảo Sát</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Tạo và quản lý khảo sát phản hồi khóa học
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {(surveys || []).filter((s) => s.status === "DRAFT").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Nháp</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(surveys || []).filter((s) => s.status === "PUBLISHED").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Đã xuất bản</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {(surveys || []).filter((s) => s.status === "CLOSED").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Đã đóng</div>
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

        {/* Toolbar */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <Input
              placeholder="Tìm kiếm khảo sát theo tiêu đề hoặc mã..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
              className="w-full md:w-64"
            />
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading}
                  onClick={() => fetchSurveys(currentPage, pageSize, debouncedSearch)}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tạo khảo sát
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && surveys.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : surveys.length === 0 ? (
            <Empty
              description="Chưa có khảo sát nào"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              <Button
                type="primary"
                onClick={handleCreate}
                icon={<PlusOutlined />}
              >
                Tạo khảo sát đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={surveys}
              rowKey="id"
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

      {/* Create/Edit Modal */}
      <Modal
        title={null}
        open={modalMode !== null}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        destroyOnClose
        centered
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
            {modalMode === "create" ? "Tạo khảo sát mới" : "Chỉnh sửa khảo sát"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-0">
            {modalMode === "create" 
              ? "Tạo khảo sát phản hồi nội dung học viên về khóa học" 
              : "Chỉnh sửa thông tin khảo sát"}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            questions: [],
            description: "1", // Default points value
          }}
        >
          <div className="px-6 py-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Basic Information - Compact inline layout */}
            <Form.Item
              label={<span className="text-sm">Nhập câu hỏi</span>}
              name="title"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề" },
                { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự" },
              ]}
              className="mb-4"
            >
              <Input.TextArea
                placeholder="Nhập câu hỏi..."
                rows={3}
                className="resize-none"
              />
            </Form.Item>

            {/* Question Type - Full width, no points field */}
            <Form.Item
              label={<span className="text-sm flex items-center gap-1">
                <span className="text-red-500">*</span> Loại câu hỏi
              </span>}
              name="surveyCode"
              rules={[
                { required: true, message: "Chọn loại câu hỏi" },
              ]}
              className="mb-4"
            >
              <Select placeholder="Trắc nghiệm">
                <Select.Option value="MULTIPLE_CHOICE">
                  Trắc nghiệm
                </Select.Option>
                <Select.Option value="TEXT">
                  Văn bản
                </Select.Option>
                <Select.Option value="NUMBER">
                  Số
                </Select.Option>
                <Select.Option value="RATING">
                  Đánh giá
                </Select.Option>
              </Select>
            </Form.Item>

            {/* Questions Section */}
            <Form.List name="questions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} className="mb-6">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Câu hỏi {index + 1}
                          </span>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                        />
                      </div>

                      {/* Question Text */}
                      <Form.Item
                        {...restField}
                        label={<span className="text-sm">Nội dung câu hỏi</span>}
                        name={[name, "questionText"]}
                        rules={[
                          { required: true, message: "Vui lòng nhập câu hỏi" },
                        ]}
                        className="mb-3"
                      >
                        <Input.TextArea
                          placeholder="Nhập câu hỏi..."
                          rows={2}
                          className="resize-none"
                        />
                      </Form.Item>

                      {/* Answers Section */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Các lựa chọn
                          </label>
                          <Form.Item noStyle shouldUpdate>
                            {({ getFieldValue }) => {
                              const answers = getFieldValue(["questions", name, "answers"]) || [];
                              return (
                                <span className="text-xs text-gray-500">
                                  {answers.length} lựa chọn
                                </span>
                              );
                            }}
                          </Form.Item>
                        </div>
                        
                        <Form.List name={[name, "answers"]}>
                          {(
                            answerFields,
                            { add: addAnswer, remove: removeAnswer }
                          ) => (
                            <>
                              {answerFields.map(
                                (
                                  { key: answerKey, name: answerName, ...answerRest },
                                  answerIndex
                                ) => (
                                  <div
                                    key={answerKey}
                                    className="flex items-start gap-3 mb-2"
                                  >
                                    {/* Radio button for correct answer */}
                                    <Form.Item
                                      {...answerRest}
                                      name={[answerName, "isCorrect"]}
                                      valuePropName="checked"
                                      className="mb-0 pt-2"
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${name}-correct`}
                                        className="w-4 h-4 text-blue-600 cursor-pointer"
                                      />
                                    </Form.Item>
                                    
                                    <Form.Item
                                      {...answerRest}
                                      name={[answerName, "answerText"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Nhập nội dung",
                                        },
                                      ]}
                                      className="mb-0 flex-1"
                                    >
                                      <Input 
                                        placeholder={`Lựa chọn ${answerIndex + 1}`}
                                      />
                                    </Form.Item>

                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => removeAnswer(answerName)}
                                      className="mt-1"
                                    />
                                  </div>
                                )
                              )}

                              <Button
                                type="dashed"
                                onClick={() =>
                                  addAnswer({
                                    answerText: "",
                                    isCorrect: false,
                                  })
                                }
                                block
                                icon={<PlusOutlined />}
                                size="small"
                                className="mt-2"
                              >
                                Thêm lựa chọn
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </div>

                      {/* Explanation */}
                      <Form.Item
                        {...restField}
                        label={<span className="text-sm">Giải thích (tùy chọn)</span>}
                        name={[name, "explanation"]}
                        className="mb-0"
                      >
                        <Input.TextArea
                          placeholder="Giải thích đáp án..."
                          rows={2}
                          className="resize-none"
                        />
                      </Form.Item>
                    </div>
                  ))}

                  {/* Add Question Button */}
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        questionText: "",
                        questionType: 1,
                        answers: [
                          { answerText: "", isCorrect: false },
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <Button
              onClick={handleModalClose}
              size="large"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<PlusOutlined />}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {modalMode === "create" ? "Tạo khảo sát" : "Cập nhật"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
