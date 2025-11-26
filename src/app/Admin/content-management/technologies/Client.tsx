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
  Popconfirm,
  message,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CodeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useTechnologyStore, type Technology, type TechnologyTypeValue } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

type ModalMode = "create" | "edit" | null;

// Technology Types based on API specification
const TECH_TYPES: { label: string; value: TechnologyTypeValue; color: string }[] = [
  { label: "Ngôn ngữ lập trình", value: 1, color: "blue" },
  { label: "Framework", value: 2, color: "green" },
  { label: "Cơ sở dữ liệu", value: 3, color: "orange" },
  { label: "Công cụ", value: 4, color: "purple" },
];

const getTechnologyTypeInfo = (type: TechnologyTypeValue) => {
  return TECH_TYPES.find((t) => t.value === type) || TECH_TYPES[0];
};

export default function TechnologiesClient() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [filterType, setFilterType] = useState<TechnologyTypeValue | undefined>(undefined);

  const {
    technologies,
    isLoading,
    error,
    total,
    pageSize,
    totalPages,
    fetchTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology,
    clearError,
  } = useTechnologyStore();

  // Load technologies on mount and when search/page/filter changes
  useEffect(() => {
    fetchTechnologies(currentPage, 10, debouncedSearch, filterType);
  }, [currentPage, debouncedSearch, filterType, fetchTechnologies]);

  const handleSubmit = async (values: {
    technologyName: string;
    description: string;
    technologyType: TechnologyTypeValue;
  }) => {
    try {
      if (modalMode === "create") {
        const success = await createTechnology({
          technologyName: values.technologyName.trim(),
          description: values.description?.trim() || "",
          technologyType: values.technologyType,
        });

        if (success) {
          message.success("Tạo công nghệ thành công!");
          form.resetFields();
          setModalMode(null);
        } else {
          message.error("Không thể tạo công nghệ");
        }
      } else if (modalMode === "edit" && selectedTech) {
        const success = await updateTechnology({
          technologyId: selectedTech.technologyId,
          technologyName: values.technologyName.trim(),
          description: values.description?.trim() || "",
          technologyType: values.technologyType,
        });

        if (success) {
          message.success("Cập nhật công nghệ thành công!");
          form.resetFields();
          setModalMode(null);
          setSelectedTech(null);
        } else {
          message.error("Không thể cập nhật công nghệ");
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTechnology(id);
      if (success) {
        message.success("Xóa công nghệ thành công!");
        // If we're on a page that no longer has items, go back one page
        if (technologies.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        message.error("Không thể xóa công nghệ");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleEdit = (tech: Technology) => {
    setSelectedTech(tech);
    setModalMode("edit");
    form.setFieldsValue({
      technologyName: tech.technologyName,
      description: tech.description,
      technologyType: tech.technologyType,
    });
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedTech(null);
    setModalMode("create");
  };

  const handleModalClose = () => {
    setModalMode(null);
    setSelectedTech(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Tên công nghệ",
      dataIndex: "technologyName",
      key: "technologyName",
      width: "25%",
      render: (text: string) => (
        <span className="font-semibold text-gray-900">{text}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text: string) => (
        <span className="text-gray-600 text-sm">{text || "Không có mô tả"}</span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "technologyType",
      key: "technologyType",
      width: "20%",
      render: (type: TechnologyTypeValue, record: Technology) => {
        const typeInfo = getTechnologyTypeInfo(type);
        return (
          <Tag color={typeInfo.color} className="font-medium">
            {record.technologyTypeName}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      render: (date: string) => (
        <span className="text-gray-500 text-sm">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "10%",
      fixed: "right" as const,
      render: (_: unknown, record: Technology) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa công nghệ?"
            description={`Bạn có chắc muốn xóa "${record.technologyName}"?`}
            onConfirm={() => handleDelete(record.technologyId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: total,
    programmingLanguage: technologies.filter((t) => t.technologyType === 1).length,
    framework: technologies.filter((t) => t.technologyType === 2).length,
    database: technologies.filter((t) => t.technologyType === 3).length,
    tool: technologies.filter((t) => t.technologyType === 4).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <CodeOutlined className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 m-0">Quản lý Công nghệ</h1>
                <p className="text-gray-600 text-sm m-0">
                  Quản lý ngôn ngữ lập trình, framework, database và công cụ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.programmingLanguage}</div>
                <div className="text-gray-600 text-sm mt-1">Ngôn ngữ lập trình</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.framework}</div>
                <div className="text-gray-600 text-sm mt-1">Framework</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-orange-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.database}</div>
                <div className="text-gray-600 text-sm mt-1">Cơ sở dữ liệu</div>
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
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Input
                placeholder="Tìm kiếm theo tên công nghệ..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
                className="w-full sm:w-64"
              />
              <Select
                placeholder="Lọc theo loại"
                allowClear
                value={filterType}
                onChange={(value) => {
                  setFilterType(value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48"
                suffixIcon={<FilterOutlined />}
              >
                {TECH_TYPES.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading}
                  onClick={() => fetchTechnologies(currentPage, pageSize, debouncedSearch, filterType)}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
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
              description={
                debouncedSearch || filterType
                  ? "Không tìm thấy công nghệ nào"
                  : "Chưa có công nghệ nào"
              }
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              {!debouncedSearch && !filterType && (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  icon={<PlusOutlined />}
                >
                  Thêm công nghệ đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={technologies}
              rowKey="technologyId"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong tổng số ${total} công nghệ`,
                showQuickJumper: totalPages > 5,
              }}
              bordered
              scroll={{ x: 1000 }}
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
        width={600}
        destroyOnClose
        centered
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <CodeOutlined className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 m-0">
                {modalMode === "create" ? "Thêm công nghệ mới" : "Chỉnh sửa công nghệ"}
              </h2>
              <p className="text-sm text-gray-600 m-0">
                {modalMode === "create"
                  ? "Thêm ngôn ngữ lập trình, framework hoặc công cụ mới"
                  : "Cập nhật thông tin công nghệ"}
              </p>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="px-6 py-6"
        >
          <Form.Item
            label={<span className="font-medium">Tên công nghệ</span>}
            name="technologyName"
            rules={[
              { required: true, message: "Vui lòng nhập tên công nghệ" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
              { max: 100, message: "Tên không được quá 100 ký tự" },
            ]}
          >
            <Input
              placeholder="VD: JavaScript, React, MySQL..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Loại công nghệ</span>}
            name="technologyType"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại công nghệ" size="large">
              {TECH_TYPES.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Mô tả</span>}
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
              { max: 500, message: "Mô tả không được quá 500 ký tự" },
            ]}
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về công nghệ này..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button onClick={handleModalClose} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {modalMode === "create" ? "Thêm công nghệ" : "Cập nhật"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
