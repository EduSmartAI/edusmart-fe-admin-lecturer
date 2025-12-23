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
  Select,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  BookOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSyllabusStore } from "EduSmart/stores/Admin";
import type { Subject, SubjectCreatePayload, SubjectUpdatePayload } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

type ModalMode = "create" | "edit" | "view";

export default function SubjectsClient() {
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [form] = Form.useForm();

  const {
    subjects,
    subjectsLoading,
    subjectsError,
    subjectsTotalCount,
    subjectsPageSize,
    fetchSubjects,
    getSubjectDetail,
    createSubject,
    updateSubject,
    deleteSubject,
    clearSubjectError,
  } = useSyllabusStore();

  // Load subjects on mount and when page or search changes
  useEffect(() => {
    // Always use server-side search with pagination
    fetchSubjects(currentPage, subjectsPageSize, debouncedSearch || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  // Reset to first page when search changes
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  // Get subject options for prerequisite selection (exclude current subject if editing)
  const getPrerequisiteOptions = () => {
    return subjects
      .filter((s) => !selectedSubject || s.subjectId !== selectedSubject.subjectId)
      .map((s) => ({
        label: `${s.subjectCode} - ${s.subjectName}`,
        value: s.subjectId,
      }));
  };

  // Open modal for create
  const handleCreate = () => {
    setModalMode("create");
    setSelectedSubject(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open modal for view
  const handleView = async (subject: Subject) => {
    setModalMode("view");
    const detail = await getSubjectDetail(subject.subjectId);
    if (detail) {
      setSelectedSubject(detail);
      form.setFieldsValue({
        subjectCode: detail.subjectCode,
        subjectName: detail.subjectName,
        prerequisiteSubjectIds: detail.prerequisiteSubjectIds || [],
      });
      setIsModalOpen(true);
    }
  };

  // Open modal for edit
  const handleEdit = async (subject: Subject) => {
    setModalMode("edit");
    const detail = await getSubjectDetail(subject.subjectId);
    if (detail) {
      setSelectedSubject(detail);
      form.setFieldsValue({
        subjectCode: detail.subjectCode,
        subjectName: detail.subjectName,
        prerequisiteSubjectIds: detail.prerequisiteSubjectIds || [],
      });
      setIsModalOpen(true);
    }
  };

  // Handle modal submit
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === "create") {
        const payload: SubjectCreatePayload = {
          subjectCode: values.subjectCode.trim().toUpperCase(),
          subjectName: values.subjectName.trim(),
          prerequisiteSubjectIds: values.prerequisiteSubjectIds || [],
        };

        const result = await createSubject(payload);
        if (result) {
          message.success("Tạo môn học thành công!");
          setIsModalOpen(false);
          form.resetFields();
        }
      } else if (modalMode === "edit" && selectedSubject) {
        const payload: SubjectUpdatePayload = {
          subjectId: selectedSubject.subjectId,
          subjectCode: values.subjectCode.trim().toUpperCase(),
          subjectName: values.subjectName.trim(),
          prerequisiteSubjectIds: values.prerequisiteSubjectIds || [],
        };

        const result = await updateSubject(payload);
        if (result) {
          message.success("Cập nhật môn học thành công!");
          setIsModalOpen(false);
          form.resetFields();
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  // Handle delete
  const handleDelete = async (subjectId: string) => {
    try {
      const success = await deleteSubject(subjectId);
      if (success) {
        message.success("Xóa môn học thành công!");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  // Get prerequisite subject names for display
  const getPrerequisiteNames = (prerequisiteIds: string[] | undefined): string[] => {
    if (!prerequisiteIds || prerequisiteIds.length === 0) return [];
    return prerequisiteIds
      .map((id) => {
        const subject = subjects.find((s) => s.subjectId === id);
        return subject ? subject.subjectCode : id;
      })
      .filter(Boolean);
  };

  const columns = [
    {
      title: "Mã môn học",
      dataIndex: "subjectCode",
      key: "subjectCode",
      width: "15%",
      render: (text: string) => (
        <span className="font-mono bg-green-50 px-2 py-1 rounded text-sm text-green-600 font-semibold">
          {text}
        </span>
      ),
    },
    {
      title: "Tên môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      width: "35%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Môn tiên quyết",
      dataIndex: "prerequisiteSubjectIds",
      key: "prerequisiteSubjectIds",
      width: "30%",
      render: (ids: string[] | undefined) => {
        const names = getPrerequisiteNames(ids);
        if (names.length === 0) {
          return <span className="text-gray-400 italic">Không có</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {names.map((name, index) => (
              <Tag key={index} color="blue">
                {name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "20%",
      render: (_: unknown, record: Subject) => (
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
            title="Xóa môn học?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.subjectId)}
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
                loading={subjectsLoading}
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
              <BookOutlined className="text-2xl text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Môn Học</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Quản lý các môn học và môn tiên quyết trong hệ thống
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{subjectsTotalCount}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số môn học</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {subjectsError && (
          <Alert
            message="Lỗi"
            description={subjectsError}
            type="error"
            closable
            onClose={() => clearSubjectError()}
            className="mb-6"
          />
        )}

        {/* Toolbar */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <Input
              placeholder="Tìm kiếm môn học theo mã hoặc tên..."
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
                  loading={subjectsLoading}
                  onClick={() => {
                    setSearchValue("");
                    setCurrentPage(1);
                    fetchSubjects(1, subjectsPageSize, undefined);
                  }}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-green-600 hover:bg-green-700 border-0"
              >
                Tạo môn học
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {subjectsLoading && subjects.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : subjects.length === 0 ? (
            <Empty
              description={debouncedSearch ? "Không tìm thấy môn học nào" : "Chưa có môn học nào"}
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              {!debouncedSearch && (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  icon={<PlusOutlined />}
                  className="bg-green-600 hover:bg-green-700 border-0"
                >
                  Tạo môn học đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={subjects}
              rowKey="subjectId"
              loading={subjectsLoading}
              pagination={{
                current: currentPage,
                pageSize: subjectsPageSize,
                total: subjectsTotalCount,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} môn học${debouncedSearch ? ' (đang tìm kiếm)' : ''}`,
              }}
              bordered
            />
          )}
        </Card>

        {/* Create/Edit/View Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <BookOutlined className="text-green-600" />
              <span>
                {modalMode === "create"
                  ? "Tạo môn học mới"
                  : modalMode === "edit"
                  ? "Chỉnh sửa môn học"
                  : "Chi tiết môn học"}
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
                    className="bg-green-600 hover:bg-green-700 border-0"
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
                    loading={subjectsLoading}
                    className="bg-green-600 hover:bg-green-700 border-0"
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
              name="subjectCode"
              label="Mã môn học"
              rules={[
                { required: true, message: "Vui lòng nhập mã môn học" },
                { max: 20, message: "Mã môn học không quá 20 ký tự" },
              ]}
            >
              <Input
                placeholder="VD: CSI104, DBI202, CSD201..."
                className="font-mono"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>

            <Form.Item
              name="subjectName"
              label="Tên môn học"
              rules={[
                { required: true, message: "Vui lòng nhập tên môn học" },
                { max: 200, message: "Tên môn học không quá 200 ký tự" },
              ]}
            >
              <Input placeholder="VD: Introduction to Computing, Database Systems..." />
            </Form.Item>

            <Form.Item
              name="prerequisiteSubjectIds"
              label="Môn tiên quyết"
              tooltip="Chọn các môn học mà sinh viên cần hoàn thành trước khi học môn này"
            >
              <Select
                mode="multiple"
                placeholder="Chọn các môn tiên quyết (nếu có)..."
                options={getPrerequisiteOptions()}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
