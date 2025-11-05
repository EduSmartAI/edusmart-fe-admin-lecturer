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
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
  Popconfirm,
  Cascader,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useTechnologyStore, type Technology, type TechnologyType, type TechnologyCategory } from "EduSmart/stores/Admin";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import {
  validateTechName,
} from "EduSmart/utils/adminValidation";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";

type ModalMode = "create" | "edit" | null;

const TECH_TYPES: { label: string; value: TechnologyType; color: string }[] = [
  { label: "Framework", value: "FRAMEWORK", color: "blue" },
  { label: "Thư viện", value: "LIBRARY", color: "green" },
  { label: "Công cụ", value: "TOOL", color: "orange" },
  { label: "Nền tảng", value: "PLATFORM", color: "purple" },
];

const CATEGORIES = [
  {
    label: "Frontend",
    value: "FRONTEND",
    children: [
      { label: "Frameworks", value: "FRONTEND_FRAMEWORKS" },
      { label: "Libraries", value: "FRONTEND_LIBRARIES" },
      { label: "Tools", value: "FRONTEND_TOOLS" },
    ],
  },
  {
    label: "Backend",
    value: "BACKEND",
    children: [
      { label: "Frameworks", value: "BACKEND_FRAMEWORKS" },
      { label: "Databases", value: "BACKEND_DATABASES" },
      { label: "Tools", value: "BACKEND_TOOLS" },
    ],
  },
  {
    label: "Mobile",
    value: "MOBILE",
    children: [
      { label: "iOS", value: "MOBILE_IOS" },
      { label: "Android", value: "MOBILE_ANDROID" },
      { label: "Cross-Platform", value: "MOBILE_CROSS" },
    ],
  },
  {
    label: "DevOps",
    value: "DEVOPS",
    children: [
      { label: "CI/CD", value: "DEVOPS_CICD" },
      { label: "Containers", value: "DEVOPS_CONTAINERS" },
      { label: "Infrastructure", value: "DEVOPS_INFRA" },
    ],
  },
];

export default function TechnologiesClient() {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const messageApi = useNotification();

  const {
    technologies,
    isLoading,
    error,
    total,
    pageSize,
    fetchTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology,
    clearError,
  } = useTechnologyStore();

  // Load technologies on mount and when search/page changes
  useEffect(() => {
    fetchTechnologies(currentPage, 20, searchText);
  }, [currentPage, searchText, fetchTechnologies]);

  // Handle create/edit submission
  const handleSubmit = async (values: { name: string; description?: string; type: TechnologyType; category?: TechnologyCategory[]; isActive?: boolean }) => {
    try {
      // Validate tech name
      const nameError = validateTechName(values.name);
      if (nameError) {
        messageApi.error(nameError);
        return;
      }

      if (modalMode === "create") {
        const result = await createTechnology({
          name: values.name.trim(),
          description: values.description?.trim() || "",
          type: values.type,
          category: values.category?.[0] || "FRONTEND",
        });

        if (result) {
          messageApi.success("Tạo công nghệ thành công!");
          form.resetFields();
          setModalMode(null);
        } else {
          messageApi.error("Không thể tạo công nghệ");
        }
      } else if (modalMode === "edit" && selectedTech) {
        const result = await updateTechnology({
          id: selectedTech.id,
          name: values.name.trim(),
          description: values.description?.trim() || "",
          type: values.type,
          category: values.category?.[0] || selectedTech.category,
          isActive: values.isActive ?? true,
        });

        if (result) {
          messageApi.success("Cập nhật công nghệ thành công!");
          form.resetFields();
          setModalMode(null);
          setSelectedTech(null);
        } else {
          messageApi.error("Không thể cập nhật công nghệ");
        }
      }
    } catch (err) {
      messageApi.error(formatErrorMessage(err));
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTechnology(id);
      if (success) {
        messageApi.success("Xóa công nghệ thành công!");
        if (technologies.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchTechnologies(currentPage, pageSize, searchText);
        }
      }
    } catch (err) {
      messageApi.error(formatErrorMessage(err));
    }
  };

  // Handle edit modal open
  const handleEdit = (tech: Technology) => {
    setSelectedTech(tech);
    setModalMode("edit");
    form.setFieldsValue({
      name: tech.name,
      description: tech.description || "",
      type: tech.type,
      category: [tech.category],
      isActive: tech.isActive,
    });
  };

  // Handle create modal open
  const handleCreate = () => {
    form.resetFields();
    setSelectedTech(null);
    setModalMode("create");
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalMode(null);
    setSelectedTech(null);
    form.resetFields();
  };

  const getTypeColor = (type: TechnologyType) => {
    return TECH_TYPES.find((t) => t.value === type)?.color || "default";
  };

  const getTypeLabel = (type: TechnologyType) => {
    return TECH_TYPES.find((t) => t.value === type)?.label || type;
  };

  // Table columns
  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: "15%",
      render: (type: TechnologyType) => (
        <Badge color={getTypeColor(type)} text={getTypeLabel(type)} />
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: "20%",
      render: (category: TechnologyCategory) => (
        <Badge color="cyan" text={category} />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "15%",
      render: (isActive: boolean) => (
        <Badge status={isActive ? "success" : "default"} text={isActive ? "Hoạt động" : "Ngưng"} />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "20%",
      render: (_: unknown, record: Technology) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa công nghệ?"
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
              <AppstoreOutlined className="text-2xl text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Công Nghệ</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Quản lý công nghệ, framework và công cụ
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {technologies.filter((t) => t.category === "FRONTEND").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Frontend</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {technologies.filter((t) => t.category === "BACKEND").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Backend</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {technologies.filter((t) => t.category === "DEVOPS").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">DevOps</div>
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
              placeholder="Tìm kiếm công nghệ..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
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
                  onClick={() => fetchTechnologies(currentPage, pageSize, searchText)}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-green-600 hover:bg-green-700"
              >
                Thêm công nghệ
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && technologies.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : technologies.length === 0 ? (
            <Empty
              description="Chưa có công nghệ nào"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              <Button
                type="primary"
                onClick={handleCreate}
                icon={<PlusOutlined />}
              >
                Thêm công nghệ đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={technologies}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} công nghệ`,
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
            ? "Thêm công nghệ"
            : "Chỉnh sửa công nghệ"
        }
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
            label="Tên công nghệ"
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên công nghệ",
              },
              {
                min: 2,
                message: "Tên phải có ít nhất 2 ký tự",
              },
              {
                max: 255,
                message: "Tên không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: React, Node.js, Docker"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select size="large" placeholder="Chọn loại công nghệ">
              {TECH_TYPES.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  <Badge color={type.color} text={type.label} />
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Cascader
              options={CATEGORIES}
              placeholder="Chọn danh mục chính"
              changeOnSelect={false}
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
              placeholder="Nhập mô tả chi tiết về công nghệ này..."
              rows={4}
              showCount
            />
          </Form.Item>

          {modalMode === "edit" && (
            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <div className="flex items-center gap-2">
                <Badge status={form.getFieldValue("isActive") ? "success" : "default"} />
                <span>
                  {form.getFieldValue("isActive")
                    ? "Hoạt động"
                    : "Ngưng"}
                </span>
              </div>
            </Form.Item>
          )}

          <Form.Item className="mb-0">
            <Space className="w-full justify-end gap-2">
              <Button onClick={handleModalClose}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {modalMode === "create" ? "Thêm" : "Cập nhật"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
