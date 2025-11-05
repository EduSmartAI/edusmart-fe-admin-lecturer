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
  Drawer,
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
import { useSurveyStore, type Survey } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { InlineQuestionEditor } from "EduSmart/components/InlineQuestionEditor/InlineQuestionEditor";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

type ModalMode = "create" | "edit" | null;
type DrawerMode = "questions" | "preview" | null;

export default function SurveysClient() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
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

  const handleSubmit = async (values: { code: string; title: string; description?: string }) => {
    try {
      if (modalMode === "create") {
        const result = await createSurvey({
          code: values.code.trim().toUpperCase(),
          title: values.title.trim(),
          description: values.description?.trim() || "",
        });

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
          code: values.code.trim().toUpperCase(),
          title: values.title.trim(),
          description: values.description?.trim() || "",
          status: selectedSurvey.status,
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
      code: survey.code,
      title: survey.title,
      description: survey.description || "",
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

  const handleDrawerClose = () => {
    setDrawerMode(null);
    setSelectedSurvey(null);
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
      width: "28%",
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
                  // TODO: Add close functionality
                  message.info("Tính năng đóng sẽ có sớm");
                }}
                className="text-orange-600"
              />
            </Tooltip>
          )}
          <Tooltip title="Câu hỏi">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              size="small"
              onClick={() => {
                setSelectedSurvey(record);
                setDrawerMode("questions");
              }}
              className="text-blue-600"
            />
          </Tooltip>
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
        title={modalMode === "create" ? "Tạo khảo sát mới" : "Chỉnh sửa khảo sát"}
        open={modalMode !== null}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="mt-6"
        >
          <Form.Item
            label="Mã khảo sát"
            name="code"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mã khảo sát",
              },
              {
                pattern: /^[A-Z0-9_]{3,20}$/,
                message: "Mã phải có 3-20 chữ in hoa/số/gạch dưới",
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: FEEDBACK_Q4_2024"
              size="large"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="Tiêu đề khảo sát"
            name="title"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tiêu đề khảo sát",
              },
              {
                min: 3,
                message: "Tiêu đề phải có ít nhất 3 ký tự",
              },
              {
                max: 255,
                message: "Tiêu đề không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: Khảo sát phản hồi khóa học Q4 2024"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              {
                max: 1000,
                message: "Mô tả không được vượt quá 1000 ký tự",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả và hướng dẫn cho khảo sát..."
              rows={4}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end gap-2">
              <Button onClick={handleModalClose}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {modalMode === "create" ? "Tạo" : "Cập nhật"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Questions Drawer */}
      <Drawer
        title={`Câu hỏi khảo sát: ${selectedSurvey?.title}`}
        placement="right"
        width={600}
        onClose={handleDrawerClose}
        open={drawerMode === "questions"}
      >
        {selectedSurvey ? (
          <div className="space-y-4">
            <Alert
              message="Quản lý câu hỏi"
              description="Thêm, chỉnh sửa và sắp xếp lại câu hỏi cho khảo sát này. Câu hỏi có thể được thêm khi khảo sát đang ở trạng thái Nháp."
              type="info"
              showIcon
              className="mb-4"
            />

            <InlineQuestionEditor
              questions={selectedSurvey.questions || []}
              onQuestionsChange={(updatedQuestions) => {
                setSelectedSurvey({
                  ...selectedSurvey,
                  questions: updatedQuestions,
                });
              }}
              isEditable={selectedSurvey.status === "DRAFT"}
              isLoading={isLoading}
            />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
