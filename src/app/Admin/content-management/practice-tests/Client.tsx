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
  Select,
  Tag,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CodeOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import { 
  DifficultyLevel, 
  DIFFICULTY_LABELS, 
  DIFFICULTY_COLORS,
  PracticeTestListItem,
} from "EduSmart/types/practice-test";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

export default function PracticeTestsClient() {
  const router = useRouter();
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | undefined>();

  const {
    practiceTests,
    isLoading,
    error,
    total,
    pageSize,
    fetchPracticeTests,
    deletePracticeTest,
    clearError,
  } = usePracticeTestStore();

  // Load practice tests on mount and when filters change
  useEffect(() => {
    fetchPracticeTests(currentPage, pageSize, debouncedSearch, selectedDifficulty);
  }, [currentPage, debouncedSearch, selectedDifficulty, fetchPracticeTests, pageSize]);

  const handleDelete = async (problemId: string) => {
    try {
      const success = await deletePracticeTest(problemId);
      if (success) {
        message.success("Xóa bài thực hành thành công!");
        if ((practiceTests || []).length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchPracticeTests(currentPage, pageSize, debouncedSearch, selectedDifficulty);
        }
      } else {
        message.error("Không thể xóa bài thực hành");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const getDifficultyBadge = (difficulty: DifficultyLevel) => {
    const color = DIFFICULTY_COLORS[difficulty];
    const label = DIFFICULTY_LABELS[difficulty];
    const icon = difficulty === 'Easy' ? '🟢' : difficulty === 'Medium' ? '🟡' : '🔴';
    
    return (
      <Tag color={color} className="font-medium">
        {icon} {label}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "30%",
      render: (text: string, record: PracticeTestListItem) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white mb-1">
            {text}
          </div>
          <div className="text-xs text-gray-500">
            ID: {record.problemId.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      width: "12%",
      render: (difficulty: DifficultyLevel) => getDifficultyBadge(difficulty),
    },
    {
      title: "Test Cases",
      key: "testcases",
      width: "15%",
      render: (_: unknown, record: PracticeTestListItem) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CodeOutlined className="text-green-500" />
            <span className="text-sm">
              <span className="font-semibold">{record.totalTestCases}</span> Total
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Templates",
      dataIndex: "totalTemplates",
      key: "totalTemplates",
      width: "10%",
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <CodeOutlined className="text-blue-500" />
          <span className="font-semibold text-blue-600">{count}</span>
        </div>
      ),
    },
    {
      title: "Ví dụ",
      dataIndex: "totalExamples",
      key: "totalExamples",
      width: "10%",
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-purple-500" />
          <span className="font-semibold text-purple-600">{count}</span>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "23%",
      render: (_: unknown, record: PracticeTestListItem) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/Admin/content-management/practice-tests/${record.problemId}`)}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => router.push(`/Admin/content-management/practice-tests/${record.problemId}/edit`)}
              className="text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài thực hành?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.problemId)}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CodeOutlined className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Bài Thực Hành
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Quản lý bài tập lập trình với test cases
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(practiceTests || []).filter((p) => p.difficulty === 'Easy').length}
                </div>
                <div className="text-gray-600 text-sm mt-1">🟢 Dễ</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {(practiceTests || []).filter((p) => p.difficulty === 'Medium').length}
                </div>
                <div className="text-gray-600 text-sm mt-1">🟡 Trung bình</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {(practiceTests || []).filter((p) => p.difficulty === 'Hard').length}
                </div>
                <div className="text-gray-600 text-sm mt-1">🔴 Khó</div>
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
        <Card className="mb-6 shadow-sm border-0">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <Input
                placeholder="Tìm kiếm bài thực hành..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
                className="flex-1 max-w-md"
                size="large"
              />
              <Select
                placeholder="Độ khó"
                value={selectedDifficulty}
                onChange={(value) => {
                  setSelectedDifficulty(value);
                  setCurrentPage(1);
                }}
                allowClear
                className="w-40"
                size="large"
              >
                <Select.Option value="Easy">
                  🟢 Dễ
                </Select.Option>
                <Select.Option value="Medium">
                  🟡 Trung bình
                </Select.Option>
                <Select.Option value="Hard">
                  🔴 Khó
                </Select.Option>
              </Select>
            </div>
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading}
                  onClick={() => fetchPracticeTests(currentPage, pageSize, debouncedSearch, selectedDifficulty)}
                  size="large"
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/Admin/content-management/practice-tests/create")}
                size="large"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-lg hover:shadow-xl"
              >
                Tạo bài thực hành
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm border-0">
          {isLoading && (practiceTests || []).length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : (practiceTests || []).length === 0 ? (
            <Empty
              description="Chưa có bài thực hành nào"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              <Button
                type="primary"
                onClick={() => router.push("/Admin/content-management/practice-tests/create")}
                icon={<PlusOutlined />}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
              >
                Tạo bài thực hành đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={practiceTests || []}
              rowKey="problemId"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} bài`,
              }}
              bordered
            />
          )}
        </Card>
      </div>
    </div>
  );
}
