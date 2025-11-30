"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Popconfirm,
  message,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  EyeOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useInitialTestStore } from "EduSmart/stores/Admin";
import { InitialTestListItem } from "EduSmart/types/initial-test";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

export default function InitialTestsClient() {
  const router = useRouter();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    tests,
    isLoading,
    error,
    total,
    pageSize,
    fetchTests,
    deleteTest,
    duplicateTest,
    clearError,
  } = useInitialTestStore();

  // Load tests on mount and when filters change
  useEffect(() => {
    fetchTests(currentPage, pageSize, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, pageSize]);

  const handleDelete = async (testId: string) => {
    try {
      const success = await deleteTest(testId);
      if (success) {
        message.success("Xóa bài kiểm tra thành công!");
        if (tests.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchTests(currentPage, pageSize, debouncedSearch);
        }
      } else {
        message.error("Không thể xóa bài kiểm tra");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleDuplicate = async (testId: string) => {
    try {
      await duplicateTest(testId);
      message.success("Sao chép bài kiểm tra thành công!");
      fetchTests(currentPage, pageSize, debouncedSearch);
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleRefresh = () => {
    fetchTests(currentPage, pageSize, debouncedSearch);
  };

  // Calculate stats from tests
  const stats = {
    total: total,
    totalQuizzes: tests.reduce((sum, test) => sum + test.totalQuizzes, 0),
    totalQuestions: tests.reduce((sum, test) => sum + test.totalQuestions, 0),
  };

  const columns = [
    {
      title: "Tên bài kiểm tra",
      dataIndex: "testName",
      key: "testName",
      width: "30%",
      render: (text: string, record: InitialTestListItem) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {text}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Số Quiz",
      dataIndex: "totalQuizzes",
      key: "totalQuizzes",
      width: "12%",
      align: "center" as const,
      render: (count: number) => (
        <div className="flex items-center justify-center gap-2">
          <BookOutlined className="text-blue-500" />
          <span className="font-semibold text-blue-600">{count}</span>
        </div>
      ),
    },
    {
      title: "Số câu hỏi",
      dataIndex: "totalQuestions",
      key: "totalQuestions",
      width: "12%",
      align: "center" as const,
      render: (count: number) => (
        <div className="flex items-center justify-center gap-2">
          <QuestionCircleOutlined className="text-green-500" />
          <span className="font-semibold text-green-600">{count}</span>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "18%",
      render: (date: string) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "20%",
      render: (_: unknown, record: InitialTestListItem) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/Admin/content-management/initial-tests/${record.testId}`)}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => router.push(`/Admin/content-management/initial-tests/${record.testId}/edit`)}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Sao chép">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleDuplicate(record.testId)}
              className="text-green-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài kiểm tra?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.testId)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileTextOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bài Kiểm Tra Đầu Vào
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý bài kiểm tra đầu vào cho học viên
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            closable
            onClose={clearError}
            className="mb-4"
            showIcon
          />
        )}

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tổng số bài test
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FileTextOutlined className="text-2xl text-blue-600" />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tổng số Quiz
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {stats.totalQuizzes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <BookOutlined className="text-2xl text-purple-600" />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tổng số câu hỏi
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.totalQuestions}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <QuestionCircleOutlined className="text-2xl text-green-600" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Input
              placeholder="Tìm kiếm bài kiểm tra..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full md:w-64"
              allowClear
            />

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/Admin/content-management/initial-tests/create")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 flex-1 md:flex-none"
              >
                Tạo bài kiểm tra
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && tests.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : tests.length === 0 ? (
            <Empty
              description="Chưa có bài kiểm tra nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/Admin/content-management/initial-tests/create")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
              >
                Tạo bài kiểm tra đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={tests}
              rowKey="testId"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                showTotal: (total) => `Tổng ${total} bài kiểm tra`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
