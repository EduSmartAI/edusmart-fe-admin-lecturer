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
  InputNumber,
  Switch,
  Divider,
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
  MinusCircleOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useSurveyStore, type Survey } from "EduSmart/stores/Admin";
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
        answerRules?: Array<{
          numericMin: number;
          numericMax: number;
          unit: number;
          mappedField: string;
          formula: string;
        }>;
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
          questions: values.questions || selectedSurvey.questions,
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
                  {surveys.filter((s) => s.status === "DRAFT").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Nháp</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {surveys.filter((s) => s.status === "PUBLISHED").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Đã xuất bản</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {surveys.filter((s) => s.status === "CLOSED").length}
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
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <FileTextOutlined className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white m-0">
                {modalMode === "create" ? "Tạo khảo sát mới" : "Chỉnh sửa khảo sát"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 m-0">
                {modalMode === "create" 
                  ? "Tạo khảo sát với câu hỏi và câu trả lời"
                  : "Cập nhật thông tin khảo sát"}
              </p>
            </div>
          </div>
        }
        open={modalMode !== null}
        onCancel={handleModalClose}
        footer={null}
        width={980}
        destroyOnClose
        style={{ top: 20 }}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: 16,
            marginBottom: 0,
          },
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            paddingTop: 24,
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            questions: [],
          }}
        >
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileTextOutlined className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 m-0">
                Thông tin cơ bản
              </h3>
            </div>
            
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Mã khảo sát
                    </span>
                  }
                  name="surveyCode"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã khảo sát" },
                    {
                      pattern: /^[A-Z0-9_]{2,50}$/,
                      message: "Mã phải có 2-50 chữ in hoa/số/gạch dưới",
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <span className="text-blue-500 font-mono font-semibold">#</span>
                    }
                    placeholder="VD: HABIT, INTEREST, FEEDBACK_2024"
                    size="large"
                    autoComplete="off"
                    className="rounded-lg font-mono"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tiêu đề khảo sát
                    </span>
                  }
                  name="title"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề" },
                    { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự" },
                    { max: 255, message: "Tiêu đề không được vượt quá 255 ký tự" },
                  ]}
                >
                  <Input
                    placeholder="VD: Khảo sát thói quen học tập"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Mô tả
                    </span>
                  }
                  name="description"
                  rules={[
                    { max: 1000, message: "Mô tả không được vượt quá 1000 ký tự" },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Nhập mô tả và hướng dẫn cho khảo sát..."
                    rows={3}
                    showCount
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Questions Section */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 p-6 rounded-xl mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BarsOutlined className="text-white text-sm" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                  Câu hỏi khảo sát
                </h3>
              </div>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const questions = getFieldValue("questions") || [];
                  return (
                    <Badge
                      count={questions.length}
                      showZero
                      className="shadow-sm"
                      style={{ 
                        backgroundColor: questions.length > 0 ? "#1890ff" : "#d9d9d9"
                      }}
                    />
                  );
                }}
              </Form.Item>
            </div>

            <Form.List name="questions">
              {(fields, { add, remove }) => (
                <>
                  {fields.length === 0 && (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-gray-500">
                          Chưa có câu hỏi nào. Nhấn nút bên dưới để thêm câu hỏi đầu tiên.
                        </span>
                      }
                      className="my-8"
                    />
                  )}

                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      className="mb-4 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                      styles={{
                        body: { padding: '20px' }
                      }}
                      title={
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            Câu hỏi {index + 1}
                          </span>
                        </div>
                      }
                      extra={
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          className="hover:bg-red-50"
                        >
                          Xóa câu hỏi
                        </Button>
                      }
                    >
                      <Form.Item
                        {...restField}
                        label={
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Nội dung câu hỏi
                          </span>
                        }
                        name={[name, "questionText"]}
                        rules={[
                          { required: true, message: "Vui lòng nhập câu hỏi" },
                        ]}
                      >
                        <Input.TextArea
                          placeholder="Nhập câu hỏi khảo sát..."
                          rows={2}
                          className="rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label={
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Loại câu hỏi
                          </span>
                        }
                        name={[name, "questionType"]}
                        rules={[
                          { required: true, message: "Chọn loại câu hỏi" },
                        ]}
                        initialValue={1}
                      >
                        <Select size="large" className="rounded-lg">
                          <Select.Option value={1}>
                            <span className="flex items-center gap-2">
                              <CheckOutlined className="text-green-500" />
                              Trắc nghiệm
                            </span>
                          </Select.Option>
                          <Select.Option value={2}>
                            <span className="flex items-center gap-2">
                              <FileTextOutlined className="text-blue-500" />
                              Văn bản
                            </span>
                          </Select.Option>
                          <Select.Option value={3}>
                            <span className="flex items-center gap-2">
                              <span className="text-purple-500">#</span>
                              Số
                            </span>
                          </Select.Option>
                          <Select.Option value={4}>
                            <span className="flex items-center gap-2">
                              <span className="text-orange-500">⭐</span>
                              Đánh giá
                            </span>
                          </Select.Option>
                        </Select>
                      </Form.Item>

                      {/* Answers */}
                      <Divider orientation="left" className="text-sm font-semibold my-4">
                        <span className="text-gray-700 dark:text-gray-300">Câu trả lời</span>
                      </Divider>

                      <Form.List name={[name, "answers"]}>
                        {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
                          <>
                            {answerFields.map(
                              ({ key: answerKey, name: answerName, ...answerRest }, answerIndex) => (
                                <div
                                  key={answerKey}
                                  className="bg-white dark:bg-gray-900 p-4 rounded-lg mb-3 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-1">
                                      {String.fromCharCode(65 + answerIndex)}
                                    </div>
                                    
                                    <div className="flex-1 space-y-3">
                                      <Form.Item
                                        {...answerRest}
                                        name={[answerName, "answerText"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Nhập câu trả lời",
                                          },
                                        ]}
                                        className="mb-0"
                                      >
                                        <Input 
                                          placeholder={`Câu trả lời ${String.fromCharCode(65 + answerIndex)}...`}
                                          size="large"
                                          className="rounded-lg"
                                        />
                                      </Form.Item>

                                      <div className="flex items-center gap-2">
                                        <Form.Item
                                          {...answerRest}
                                          name={[answerName, "isCorrect"]}
                                          valuePropName="checked"
                                          className="mb-0"
                                        >
                                          <Switch
                                            checkedChildren={
                                              <span className="flex items-center gap-1">
                                                <CheckOutlined /> Đúng
                                              </span>
                                            }
                                            unCheckedChildren="Sai"
                                            className="bg-gray-400"
                                          />
                                        </Form.Item>
                                        
                                        <span className="text-xs text-gray-500">
                                          Đánh dấu nếu đây là câu trả lời đúng
                                        </span>
                                      </div>
                                    </div>

                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => removeAnswer(answerName)}
                                      className="mt-1 hover:bg-red-50"
                                    />
                                  </div>

                                  {/* Answer Rules (Optional) */}
                                  <Form.List name={[answerName, "answerRules"]}>
                                    {(ruleFields, { add: addRule, remove: removeRule }) => (
                                      <>
                                        {ruleFields.map((ruleField) => (
                                          <div
                                            key={ruleField.key}
                                            className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg mt-3 border border-amber-200 dark:border-amber-700"
                                          >
                                            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
                                              ⚙️ Quy tắc số học
                                            </div>
                                            <Row gutter={8}>
                                              <Col span={6}>
                                                <Form.Item
                                                  {...ruleField}
                                                  name={[ruleField.name, "numericMin"]}
                                                  label={
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                      Giá trị Min
                                                    </span>
                                                  }
                                                  className="mb-2"
                                                >
                                                  <InputNumber
                                                    size="small"
                                                    className="w-full"
                                                    placeholder="0"
                                                  />
                                                </Form.Item>
                                              </Col>
                                              <Col span={6}>
                                                <Form.Item
                                                  {...ruleField}
                                                  name={[ruleField.name, "numericMax"]}
                                                  label={
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                      Giá trị Max
                                                    </span>
                                                  }
                                                  className="mb-2"
                                                >
                                                  <InputNumber
                                                    size="small"
                                                    className="w-full"
                                                    placeholder="100"
                                                  />
                                                </Form.Item>
                                              </Col>
                                              <Col span={6}>
                                                <Form.Item
                                                  {...ruleField}
                                                  name={[ruleField.name, "unit"]}
                                                  label={
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                      Đơn vị
                                                    </span>
                                                  }
                                                  className="mb-2"
                                                >
                                                  <InputNumber
                                                    size="small"
                                                    className="w-full"
                                                    placeholder="1"
                                                  />
                                                </Form.Item>
                                              </Col>
                                              <Col span={6}>
                                                <Form.Item
                                                  {...ruleField}
                                                  name={[ruleField.name, "mappedField"]}
                                                  label={
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                      Trường map
                                                    </span>
                                                  }
                                                  className="mb-2"
                                                >
                                                  <Input size="small" placeholder="field_name" />
                                                </Form.Item>
                                              </Col>
                                            </Row>
                                            <div className="flex justify-between items-center">
                                              <Form.Item
                                                {...ruleField}
                                                name={[ruleField.name, "formula"]}
                                                label={
                                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Công thức
                                                  </span>
                                                }
                                                className="mb-0 flex-1 mr-2"
                                              >
                                                <Input 
                                                  size="small" 
                                                  placeholder="avg, sum, count..."
                                                  className="font-mono"
                                                />
                                              </Form.Item>
                                              <Button
                                                type="text"
                                                danger
                                                size="small"
                                                onClick={() => removeRule(ruleField.name)}
                                                className="hover:bg-red-50"
                                              >
                                                Xóa quy tắc
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                        {ruleFields.length === 0 && (
                                          <Button
                                            type="dashed"
                                            size="small"
                                            onClick={() =>
                                              addRule({
                                                numericMin: 0,
                                                numericMax: 0,
                                                unit: 1,
                                                mappedField: "",
                                                formula: "",
                                              })
                                            }
                                            className="mt-2 border-amber-300 text-amber-600 hover:border-amber-400 hover:text-amber-700"
                                          >
                                            + Thêm quy tắc số học (tùy chọn)
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </Form.List>
                                </div>
                              )
                            )}

                            <Button
                              type="dashed"
                              onClick={() =>
                                addAnswer({
                                  answerText: "",
                                  isCorrect: false,
                                  answerRules: [],
                                })
                              }
                              block
                              icon={<PlusOutlined />}
                              size="large"
                              className="border-green-300 text-green-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50"
                            >
                              Thêm câu trả lời
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
                        answers: [],
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                    size="large"
                    className="border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                  >
                    <span className="text-base">+ Thêm câu hỏi mới</span>
                  </Button>
                </>
              )}
            </Form.List>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleModalClose} size="large" className="px-6">
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              icon={modalMode === "create" ? <PlusOutlined /> : <EditOutlined />}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 px-8 font-semibold shadow-lg"
            >
              {modalMode === "create" ? "Tạo khảo sát" : "Cập nhật khảo sát"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
