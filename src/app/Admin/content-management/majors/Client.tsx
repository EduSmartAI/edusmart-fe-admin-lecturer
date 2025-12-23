"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Input,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Form,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  BankOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSyllabusStore } from "EduSmart/stores/Admin";
import type { Major, MajorCreatePayload, MajorUpdatePayload } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

const { Text } = Typography;

export default function MajorsClient() {
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [form] = Form.useForm();

  const {
    majors,
    majorsLoading,
    majorsError,
    majorsTotalCount,
    majorsPageSize,
    fetchMajors,
    getMajorDetail,
    createMajor,
    updateMajor,
    deleteMajor,
    clearMajorError,
  } = useSyllabusStore();

  // Load majors on mount and when page or search changes
  useEffect(() => {
    // Always use server-side search with pagination
    fetchMajors(currentPage, majorsPageSize, debouncedSearch || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  // Reset to first page when search changes
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  // Open modal for create
  const handleCreate = () => {
    setModalMode("create");
    setSelectedMajor(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open modal for view
  const handleView = async (major: Major) => {
    setModalMode("view");
    const detail = await getMajorDetail(major.majorId);
    if (detail) {
      setSelectedMajor(detail);
      form.setFieldsValue({
        majorCode: detail.majorCode,
        majorName: detail.majorName,
        description: detail.description || "",
      });
      setIsModalOpen(true);
    }
  };

  // Open modal for edit
  const handleEdit = async (major: Major) => {
    setModalMode("edit");
    const detail = await getMajorDetail(major.majorId);
    if (detail) {
      setSelectedMajor(detail);
      form.setFieldsValue({
        majorCode: detail.majorCode,
        majorName: detail.majorName,
        description: detail.description || "",
      });
      setIsModalOpen(true);
    }
  };

  // Handle modal submit
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === "create") {
        const payload: MajorCreatePayload = {
          majorCode: values.majorCode.trim().toUpperCase(),
          majorName: values.majorName.trim(),
          description: values.description?.trim() || "",
        };

        const result = await createMajor(payload);
        if (result) {
          message.success("Tạo chuyên ngành thành công!");
          setIsModalOpen(false);
          form.resetFields();
        }
      } else if (modalMode === "edit" && selectedMajor) {
        const payload: MajorUpdatePayload = {
          majorId: selectedMajor.majorId,
          majorCode: values.majorCode.trim().toUpperCase(),
          majorName: values.majorName.trim(),
          description: values.description?.trim() || "",
        };

        const result = await updateMajor(payload);
        if (result) {
          message.success("Cập nhật chuyên ngành thành công!");
          setIsModalOpen(false);
          form.resetFields();
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  // Handle delete
  const handleDelete = async (majorId: string) => {
    try {
      const success = await deleteMajor(majorId);
      if (success) {
        message.success("Xóa chuyên ngành thành công!");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const columns = [
    {
      title: "Mã chuyên ngành",
      dataIndex: "majorCode",
      key: "majorCode",
      width: "15%",
      render: (text: string) => (
        <span className="font-mono bg-blue-50 px-2 py-1 rounded text-sm text-blue-600 font-semibold">
          {text}
        </span>
      ),
    },
    {
      title: "Tên chuyên ngành",
      dataIndex: "majorName",
      key: "majorName",
      width: "30%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text: string | null) => (
        <Text ellipsis={{ tooltip: text || "" }} className="text-gray-600">
          {text || <span className="text-gray-400 italic">Chưa có mô tả</span>}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "20%",
      render: (_: unknown, record: Major) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="text-green-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa chuyên ngành?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.majorId)}
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
                loading={majorsLoading}
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
              <BankOutlined className="text-2xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Chuyên Ngành</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Quản lý các chuyên ngành trong hệ thống
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{majorsTotalCount}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số chuyên ngành</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {majorsError && (
          <Alert
            message="Lỗi"
            description={majorsError}
            type="error"
            closable
            onClose={() => clearMajorError()}
            className="mb-6"
          />
        )}

        {/* Toolbar */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <Input
              placeholder="Tìm kiếm chuyên ngành theo mã hoặc tên..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              allowClear
              className="w-full md:w-80"
            />
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  loading={majorsLoading}
                  onClick={() => {
                    setSearchValue("");
                    setCurrentPage(1);
                    fetchMajors(1, majorsPageSize, undefined);
                  }}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-blue-600 hover:bg-blue-700 border-0"
              >
                Tạo chuyên ngành
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {majorsLoading && majors.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : majors.length === 0 ? (
            <Empty
              description={debouncedSearch ? "Không tìm thấy chuyên ngành nào" : "Chưa có chuyên ngành nào"}
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              {!debouncedSearch && (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  icon={<PlusOutlined />}
                  className="bg-blue-600 hover:bg-blue-700 border-0"
                >
                  Tạo chuyên ngành đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={majors}
              rowKey="majorId"
              loading={majorsLoading}
              pagination={{
                current: currentPage,
                pageSize: majorsPageSize,
                total: majorsTotalCount,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} chuyên ngành${debouncedSearch ? ' (đang tìm kiếm)' : ''}`,
              }}
              bordered
            />
          )}
        </Card>

        {/* Create/Edit/View Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <BankOutlined className="text-blue-600" />
              <span>
                {modalMode === "create"
                  ? "Tạo chuyên ngành mới"
                  : modalMode === "edit"
                  ? "Chỉnh sửa chuyên ngành"
                  : "Chi tiết chuyên ngành"}
              </span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={
            modalMode === "view"
              ? [
                  <Button key="close" onClick={() => setIsModalOpen(false)}>
                    Đóng
                  </Button>,
                  <Button
                    key="edit"
                    type="primary"
                    onClick={() => setModalMode("edit")}
                    className="bg-blue-600 hover:bg-blue-700 border-0"
                  >
                    Chỉnh sửa
                  </Button>,
                ]
              : [
                  <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleModalSubmit}
                    loading={majorsLoading}
                    className="bg-blue-600 hover:bg-blue-700 border-0"
                  >
                    {modalMode === "create" ? "Tạo mới" : "Cập nhật"}
                  </Button>,
                ]
          }
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            disabled={modalMode === "view"}
            className="mt-4"
          >
            <Form.Item
              name="majorCode"
              label="Mã chuyên ngành"
              rules={[
                { required: true, message: "Vui lòng nhập mã chuyên ngành" },
                { max: 20, message: "Mã chuyên ngành không quá 20 ký tự" },
              ]}
            >
              <Input
                placeholder="VD: AI, KHDL, JAVA..."
                className="font-mono"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>

            <Form.Item
              name="majorName"
              label="Tên chuyên ngành"
              rules={[
                { required: true, message: "Vui lòng nhập tên chuyên ngành" },
                { max: 200, message: "Tên chuyên ngành không quá 200 ký tự" },
              ]}
            >
              <Input placeholder="VD: Artificial Intelligence, Data Science..." />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ max: 500, message: "Mô tả không quá 500 ký tự" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Mô tả về chuyên ngành (tùy chọn)..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
