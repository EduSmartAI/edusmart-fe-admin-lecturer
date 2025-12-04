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
  Badge,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CodeOutlined,
  EyeOutlined,
  FireOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import { 
  DifficultyLevel, 
  PracticeTestListItem,
} from "EduSmart/types/practice-test";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";

// LeetCode-inspired difficulty colors
const getDifficultyConfig = (difficulty: DifficultyLevel) => {
  const configs = {
    Easy: { 
      color: '#00b8a3', 
      bgColor: 'rgba(0, 184, 163, 0.1)', 
      label: 'Dễ',
    },
    Medium: { 
      color: '#ffc01e', 
      bgColor: 'rgba(255, 192, 30, 0.1)', 
      label: 'Trung bình',
    },
    Hard: { 
      color: '#ff375f', 
      bgColor: 'rgba(255, 55, 95, 0.1)', 
      label: 'Khó',
    },
  };
  return configs[difficulty] || configs.Easy;
};

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

  useEffect(() => {
    fetchPracticeTests(currentPage, pageSize, debouncedSearch, selectedDifficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, selectedDifficulty, pageSize]);

  const handleDelete = async (problemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  // Calculate stats
  const easyCount = (practiceTests || []).filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = (practiceTests || []).filter((p) => p.difficulty === 'Medium').length;
  const hardCount = (practiceTests || []).filter((p) => p.difficulty === 'Hard').length;

  const columns = [
    {
      title: "Bài toán",
      dataIndex: "title",
      key: "title",
      width: "35%",
      render: (text: string, record: PracticeTestListItem) => (
        <div className="cursor-pointer group">
          <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-2">
            <CodeOutlined className="text-gray-400" />
            {text}
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono">
            #{record.problemId.substring(0, 8).toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      width: "12%",
      render: (difficulty: DifficultyLevel) => {
        const config = getDifficultyConfig(difficulty);
        return (
          <Tag 
            style={{ 
              color: config.color, 
              backgroundColor: config.bgColor, 
              border: 'none',
              fontWeight: 600,
              borderRadius: '12px',
              padding: '4px 12px',
            }}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Test Cases",
      key: "testcases",
      width: "15%",
      render: (_: unknown, record: PracticeTestListItem) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircleOutlined className="text-green-500" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {record.totalTestCases}
            </div>
            <div className="text-xs text-gray-400">test cases</div>
          </div>
        </div>
      ),
    },
    {
      title: "Templates",
      dataIndex: "totalTemplates",
      key: "totalTemplates",
      width: "12%",
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <CodeOutlined className="text-blue-500" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{count}</div>
            <div className="text-xs text-gray-400">ngôn ngữ</div>
          </div>
        </div>
      ),
    },
    {
      title: "Ví dụ",
      dataIndex: "totalExamples",
      key: "totalExamples",
      width: "10%",
      render: (count: number) => (
        <Badge 
          count={count} 
          style={{ backgroundColor: '#8b5cf6' }}
          showZero
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: "16%",
      render: (_: unknown, record: PracticeTestListItem) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/Admin/content-management/practice-tests/${record.problemId}`);
              }}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/Admin/content-management/practice-tests/${record.problemId}/edit`);
              }}
              className="hover:bg-orange-50 hover:text-orange-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài thực hành?"
            description="Hành động này không thể hoàn tác."
            onConfirm={(e) => handleDelete(record.problemId, e)}
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
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <FireOutlined className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Practice Problems
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý bài tập lập trình với test cases tự động
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/Admin/content-management/practice-tests/create")}
              size="large"
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
            >
              Tạo bài mới
            </Button>
          </div>
        </div>

        {/* Stats Cards - LeetCode Style */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{total}</div>
                    <div className="text-white/80 text-sm mt-1">Tổng số bài</div>
                  </div>
                  <TrophyOutlined className="text-4xl text-white/30" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 184, 163, 0.1)' }}>
                  <span className="text-2xl">🟢</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#00b8a3' }}>{easyCount}</div>
                  <div className="text-gray-500 text-sm">Dễ</div>
                </div>
                <Progress 
                  percent={total ? Math.round((easyCount / total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#00b8a3"
                  className="flex-1"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 192, 30, 0.1)' }}>
                  <span className="text-2xl">🟡</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#ffc01e' }}>{mediumCount}</div>
                  <div className="text-gray-500 text-sm">Trung bình</div>
                </div>
                <Progress 
                  percent={total ? Math.round((mediumCount / total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#ffc01e"
                  className="flex-1"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 55, 95, 0.1)' }}>
                  <span className="text-2xl">🔴</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#ff375f' }}>{hardCount}</div>
                  <div className="text-gray-500 text-sm">Khó</div>
                </div>
                <Progress 
                  percent={total ? Math.round((hardCount / total) * 100) : 0} 
                  showInfo={false}
                  strokeColor="#ff375f"
                  className="flex-1"
                />
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

        {/* Search & Filter Bar */}
        <Card className="mb-6 border-0 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <Input
                placeholder="Tìm kiếm bài toán..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
                className="flex-1 max-w-md h-11"
              />
              <Select
                placeholder="Độ khó"
                value={selectedDifficulty}
                onChange={(value) => {
                  setSelectedDifficulty(value);
                  setCurrentPage(1);
                }}
                allowClear
                className="w-44"
                size="large"
              >
                <Select.Option value="Easy">
                  <span className="flex items-center gap-2">
                    <span style={{ color: '#00b8a3' }}>●</span> Dễ
                  </span>
                </Select.Option>
                <Select.Option value="Medium">
                  <span className="flex items-center gap-2">
                    <span style={{ color: '#ffc01e' }}>●</span> Trung bình
                  </span>
                </Select.Option>
                <Select.Option value="Hard">
                  <span className="flex items-center gap-2">
                    <span style={{ color: '#ff375f' }}>●</span> Khó
                  </span>
                </Select.Option>
              </Select>
            </div>
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                loading={isLoading}
                onClick={() => fetchPracticeTests(currentPage, pageSize, debouncedSearch, selectedDifficulty)}
                size="large"
                className="h-11"
              />
            </Tooltip>
          </div>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {isLoading && (practiceTests || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spin size="large" />
              <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (practiceTests || []).length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Chưa có bài thực hành nào</p>
                  <Button
                    type="primary"
                    onClick={() => router.push("/Admin/content-management/practice-tests/create")}
                    icon={<PlusOutlined />}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
                  >
                    Tạo bài đầu tiên
                  </Button>
                </div>
              }
              className="py-16"
            />
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
                  `${range[0]}-${range[1]} / ${total} bài`,
                className: "px-4 py-3",
              }}
              rowClassName="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
              onRow={(record) => ({
                onClick: () => router.push(`/Admin/content-management/practice-tests/${record.problemId}`),
              })}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
