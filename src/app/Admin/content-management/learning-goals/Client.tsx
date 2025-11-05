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
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useLearningGoalStore, type LearningGoal, type LearningGoalType } from "EduSmart/stores/Admin";
import {
  validateGoalName,
} from "EduSmart/utils/adminValidation";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";
import { TableSkeleton, StatCardSkeleton } from "EduSmart/components/Skeleton/SkeletonLoaders";

type ModalMode = "create" | "edit" | null;

const GOAL_TYPES: { label: string; value: LearningGoalType; color: string }[] = [
  { label: "Học thuật", value: "ACADEMIC", color: "blue" },
  { label: "Chuyên môn", value: "PROFESSIONAL", color: "green" },
  { label: "Kỹ năng", value: "SKILL", color: "orange" },
];

export default function LearningGoalsClient() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);

  const {
    goals,
    isLoading,
    error,
    total,
    pageSize,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    clearError,
  } = useLearningGoalStore();

  // Load goals on mount and when search/page changes
  useEffect(() => {
    fetchGoals(currentPage, 20, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchGoals]);

  // Handle create/edit submission
  const handleSubmit = async (values: { name: string; description?: string; type: LearningGoalType; isActive?: boolean }) => {
    try {
      // Validate goal name
      const nameError = validateGoalName(values.name);
      if (nameError) {
        message.error(nameError);
        return;
      }

      if (modalMode === "create") {
        const result = await createGoal({
          name: values.name.trim(),
          description: values.description?.trim() || "",
          type: values.type,
        });

        if (result) {
          message.success("Tạo mục tiêu học tập thành công!");
          form.resetFields();
          setModalMode(null);
        } else {
          message.error("Tạo mục tiêu học tập thất bại");
        }
      } else if (modalMode === "edit" && selectedGoal) {
        const result = await updateGoal({
          id: selectedGoal.id,
          name: values.name.trim(),
          description: values.description?.trim() || "",
          type: values.type,
          isActive: values.isActive ?? true,
        });

        if (result) {
          message.success("Cập nhật mục tiêu học tập thành công!");
          form.resetFields();
          setModalMode(null);
          setSelectedGoal(null);
        } else {
          message.error("Cập nhật mục tiêu học tập thất bại");
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteGoal(id);
      if (success) {
        message.success("Xóa mục tiêu học tập thành công!");
        // Refetch if on last page and deleting last item
        if (goals.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchGoals(currentPage, pageSize, debouncedSearch);
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  // Handle edit modal open
  const handleEdit = (goal: LearningGoal) => {
    setSelectedGoal(goal);
    setModalMode("edit");
    form.setFieldsValue({
      name: goal.name,
      description: goal.description || "",
      type: goal.type,
      isActive: goal.isActive,
    });
  };

  // Handle create modal open
  const handleCreate = () => {
    form.resetFields();
    setSelectedGoal(null);
    setModalMode("create");
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalMode(null);
    setSelectedGoal(null);
    form.resetFields();
  };

  // Get type color for badge
  const getTypeColor = (type: LearningGoalType) => {
    return GOAL_TYPES.find((t) => t.value === type)?.color || "default";
  };

  const getTypeLabel = (type: LearningGoalType) => {
    return GOAL_TYPES.find((t) => t.value === type)?.label || type;
  };

  // Table columns
  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: "50%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: "20%",
      render: (type: LearningGoalType) => (
        <Badge color={getTypeColor(type)} text={getTypeLabel(type)} />
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
      width: "15%",
      render: (_: unknown, record: LearningGoal) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-600 hover:text-blue-700"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa mục tiêu học tập?"
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
              <FileTextOutlined className="text-2xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Mục Tiêu Học Tập</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Tạo và quản lý mục tiêu học tập cho các khóa học của bạn
          </p>
        </div>

        {/* Stats Cards */}
        {isLoading && goals.length === 0 ? (
          <StatCardSkeleton count={4} />
        ) : (
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
                  <div className="text-3xl font-bold text-green-600">
                    {goals.filter((g) => g.type === "ACADEMIC").length}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Học thuật</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {goals.filter((g) => g.type === "PROFESSIONAL").length}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Chuyên môn</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {goals.filter((g) => g.type === "SKILL").length}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">Kỹ năng</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

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
              placeholder="Tìm kiếm mục tiêu học tập..."
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
                  onClick={() => fetchGoals(currentPage, pageSize, debouncedSearch)}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tạo mục tiêu
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && goals.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
          ) : goals.length === 0 ? (
            <Empty
              description="Chưa có mục tiêu học tập nào"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              <Button
                type="primary"
                onClick={handleCreate}
                icon={<PlusOutlined />}
              >
                Tạo mục tiêu đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={goals}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} to ${range[1]} of ${total} learning goals`,
              }}
              bordered
            />
          )}
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === "create" ? "Tạo mục tiêu mới" : "Chỉnh sửa mục tiêu"}
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
            label="Tên mục tiêu"
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên mục tiêu",
              },
              {
                min: 3,
                message: "Tên phải có ít nhất 3 ký tự",
              },
              {
                max: 255,
                message: "Tên không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: Thành thạo các nguyên lý cơ bản của React"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select size="large" placeholder="Chọn loại mục tiêu">
              {GOAL_TYPES.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  <Badge color={type.color} text={type.label} />
                </Select.Option>
              ))}
            </Select>
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                {modalMode === "create" ? "Tạo" : "Cập nhật"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
