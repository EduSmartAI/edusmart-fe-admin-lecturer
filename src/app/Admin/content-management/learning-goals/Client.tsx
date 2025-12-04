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
  Popconfirm,
  message,
  Tag,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  AimOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useLearningGoalStore, type LearningGoal, type LearningGoalTypeValue } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

type ModalMode = "create" | "edit" | null;

// Learning Goal Types based on API response
const GOAL_TYPES: { label: string; value: LearningGoalTypeValue; color: string }[] = [
  { label: "Chưa có định hướng", value: 0, color: "default" },
  { label: "Web Developer", value: 1, color: "blue" },
  { label: "Frontend Developer", value: 2, color: "cyan" },
  { label: "Backend Developer", value: 3, color: "green" },
  { label: "Fullstack Developer", value: 4, color: "purple" },
  { label: "Mobile Developer", value: 5, color: "magenta" },
  { label: "DevOps Engineer", value: 6, color: "orange" },
  { label: "Data Scientist", value: 7, color: "red" },
  { label: "AI Engineer", value: 8, color: "volcano" },
  { label: "Cloud Computing Engineer", value: 9, color: "geekblue" },
  { label: "Cyber Security Specialist", value: 10, color: "gold" },
];

const getGoalTypeInfo = (type: LearningGoalTypeValue) => {
  return GOAL_TYPES.find((t) => t.value === type) || GOAL_TYPES[0];
};

export default function LearningGoalsClient() {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [filterType, setFilterType] = useState<LearningGoalTypeValue | undefined>(undefined);

  const {
    goals,
    isLoading,
    error,
    total,
    pageSize,
    totalPages,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    clearError,
  } = useLearningGoalStore();

  // Load goals on mount and when search/page/filter changes
  useEffect(() => {
    fetchGoals(currentPage, 10, debouncedSearch, filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, filterType]);

  const handleSubmit = async (values: {
    goalName: string;
    description: string;
    learningGoalType: LearningGoalTypeValue;
  }) => {
    try {
      if (modalMode === "create") {
        const success = await createGoal({
          goalName: values.goalName.trim(),
          description: values.description?.trim() || "",
          learningGoalType: values.learningGoalType,
        });

        if (success) {
          message.success("Tạo mục tiêu học tập thành công!");
          form.resetFields();
          setModalMode(null);
        } else {
          message.error("Không thể tạo mục tiêu học tập");
        }
      } else if (modalMode === "edit" && selectedGoal) {
        const success = await updateGoal({
          goalId: selectedGoal.goalId,
          goalName: values.goalName.trim(),
          description: values.description?.trim() || "",
          learningGoalType: values.learningGoalType,
        });

        if (success) {
          message.success("Cập nhật mục tiêu học tập thành công!");
          form.resetFields();
          setModalMode(null);
          setSelectedGoal(null);
        } else {
          message.error("Không thể cập nhật mục tiêu học tập");
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteGoal(id);
      if (success) {
        message.success("Xóa mục tiêu học tập thành công!");
        // If we're on a page that no longer has items, go back one page
        if (goals.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        message.error("Không thể xóa mục tiêu học tập");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleEdit = (goal: LearningGoal) => {
    setSelectedGoal(goal);
    setModalMode("edit");
    form.setFieldsValue({
      goalName: goal.goalName,
      description: goal.description,
      learningGoalType: goal.learningGoalType,
    });
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedGoal(null);
    setModalMode("create");
  };

  const handleModalClose = () => {
    setModalMode(null);
    setSelectedGoal(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Tên mục tiêu",
      dataIndex: "goalName",
      key: "goalName",
      width: "25%",
      render: (text: string) => (
        <span className="font-semibold text-gray-900">{text}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (text: string) => (
        <span className="text-gray-600 text-sm">{text || "Không có mô tả"}</span>
      ),
    },
    {
      title: "Loại định hướng",
      dataIndex: "learningGoalType",
      key: "learningGoalType",
      width: "20%",
      render: (type: LearningGoalTypeValue) => {
        const typeInfo = getGoalTypeInfo(type);
        return (
          <Tag color={typeInfo.color} className="font-medium">
            {typeInfo.label}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
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
      render: (_: unknown, record: LearningGoal) => (
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
            title="Xóa mục tiêu học tập?"
            description={`Bạn có chắc muốn xóa "${record.goalName}"?`}
            onConfirm={() => handleDelete(record.goalId)}
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
    frontend: goals.filter((g) => g.learningGoalType === 2).length,
    backend: goals.filter((g) => g.learningGoalType === 3).length,
    fullstack: goals.filter((g) => g.learningGoalType === 4).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AimOutlined className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 m-0">Quản lý Mục tiêu Học tập</h1>
                <p className="text-gray-600 text-sm m-0">
                  Quản lý các định hướng nghề nghiệp và mục tiêu học tập
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
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-cyan-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600">{stats.frontend}</div>
                <div className="text-gray-600 text-sm mt-1">Frontend Developer</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.backend}</div>
                <div className="text-gray-600 text-sm mt-1">Backend Developer</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.fullstack}</div>
                <div className="text-gray-600 text-sm mt-1">Fullstack Developer</div>
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
                placeholder="Tìm kiếm theo tên mục tiêu..."
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
                className="w-full sm:w-56"
                suffixIcon={<FilterOutlined />}
              >
                {GOAL_TYPES.map((type) => (
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
                  onClick={() => fetchGoals(currentPage, pageSize, debouncedSearch, filterType)}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Thêm mục tiêu
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && goals.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : goals.length === 0 ? (
            <Empty
              description={
                debouncedSearch || filterType !== undefined
                  ? "Không tìm thấy mục tiêu nào"
                  : "Chưa có mục tiêu học tập nào"
              }
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              {!debouncedSearch && filterType === undefined && (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  icon={<PlusOutlined />}
                >
                  Thêm mục tiêu đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={goals}
              rowKey="goalId"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong tổng số ${total} mục tiêu`,
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
              <AimOutlined className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 m-0">
                {modalMode === "create" ? "Thêm mục tiêu học tập mới" : "Chỉnh sửa mục tiêu học tập"}
              </h2>
              <p className="text-sm text-gray-600 m-0">
                {modalMode === "create"
                  ? "Tạo định hướng nghề nghiệp mới cho học viên"
                  : "Cập nhật thông tin mục tiêu học tập"}
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
            label={<span className="font-medium">Tên mục tiêu</span>}
            name="goalName"
            rules={[
              { required: true, message: "Vui lòng nhập tên mục tiêu" },
              { min: 3, message: "Tên phải có ít nhất 3 ký tự" },
              { max: 200, message: "Tên không được quá 200 ký tự" },
            ]}
          >
            <Input
              placeholder="VD: Frontend Developer, Data Scientist..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Loại định hướng</span>}
            name="learningGoalType"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại định hướng" size="large">
              {GOAL_TYPES.map((type) => (
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
              { max: 1000, message: "Mô tả không được quá 1000 ký tự" },
            ]}
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về mục tiêu học tập này, các kỹ năng cần thiết..."
              rows={5}
              showCount
              maxLength={1000}
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
              {modalMode === "create" ? "Thêm mục tiêu" : "Cập nhật"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
