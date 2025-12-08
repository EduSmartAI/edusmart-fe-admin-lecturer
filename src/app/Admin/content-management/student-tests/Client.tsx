"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Empty,
  Button,
  Table,
  Tag,
  Tooltip,
  Row,
  Col,
  Spin,
  Alert,
  Input,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useStudentTestStore } from "EduSmart/stores/Admin/StudentTestStore";
import { StudentTest } from "EduSmart/api/api-quiz-admin-service";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";
import dayjs from "dayjs";

export default function StudentTestsClient() {
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
    clearError,
  } = useStudentTestStore();

  // Load student tests on mount and when filters change
  useEffect(() => {
    fetchTests(currentPage - 1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const getScoreColor = (correct: number, total: number) => {
    const percentage = (correct / total) * 100;
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "orange";
    return "red";
  };

  const getLevelTag = (level: number) => {
    const levelMap: Record<number, { label: string; color: string }> = {
      1: { label: "Beginner", color: "blue" },
      2: { label: "Intermediate", color: "cyan" },
      3: { label: "Advanced", color: "purple" },
      4: { label: "Expert", color: "gold" },
    };
    const levelInfo = levelMap[level] || { label: `Level ${level}`, color: "default" };
    return <Tag color={levelInfo.color}>{levelInfo.label}</Tag>;
  };

  const formatDuration = (duration: string) => {
    // Duration format: "HH:MM:SS" or similar
    if (!duration) return "N/A";
    const parts = duration.split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    }
    return duration;
  };

  const columns = [
    {
      title: "Sinh viên",
      key: "student",
      width: "20%",
      render: (_: unknown, record: StudentTest) => (
        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          {record.studentName}
        </div>
      ),
    },
    {
      title: "Bài kiểm tra",
      dataIndex: "testName",
      key: "testName",
      width: "25%",
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: "Điểm",
      key: "score",
      width: "15%",
      render: (_: unknown, record: StudentTest) => {
        const percentage = ((record.totalCorrectAnswers / record.totalQuestions) * 100).toFixed(1);
        return (
          <div className="flex items-center gap-2">
            <Tag color={getScoreColor(record.totalCorrectAnswers, record.totalQuestions)} className="font-bold">
              {record.totalCorrectAnswers}/{record.totalQuestions}
            </Tag>
            <span className="text-sm text-gray-600">({percentage}%)</span>
          </div>
        );
      },
    },
    {
      title: "Cấp độ",
      dataIndex: "studentLevel",
      key: "studentLevel",
      width: "12%",
      render: (level: number) => getLevelTag(level),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: "10%",
      render: (duration: string) => (
        <span className="font-medium">{formatDuration(duration)}</span>
      ),
    },
    {
      title: "Hoàn thành",
      dataIndex: "finishedAt",
      key: "finishedAt",
      width: "15%",
      render: (date: string) => (
        <div className="text-sm">
          {dayjs(date).format("DD/MM/YYYY")}
          <div className="text-xs text-gray-500">{dayjs(date).format("HH:mm")}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "8%",
      render: (_: unknown, record: StudentTest) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/Admin/content-management/student-tests/${record.studentTestId}`)}
            className="text-blue-600"
          />
        </Tooltip>
      ),
    },
  ];

  // Filter tests based on search
  const filteredTests = (tests || []).filter((test) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      test.studentName.toLowerCase().includes(searchLower) ||
      test.studentEmail.toLowerCase().includes(searchLower) ||
      test.testName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <UserOutlined className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Kết quả bài kiểm tra
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Theo dõi kết quả và hiệu suất của sinh viên
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
                <div className="text-3xl font-bold text-blue-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng bài làm</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(tests || []).filter((t) => {
                    const percentage = (t.totalCorrectAnswers / t.totalQuestions) * 100;
                    return percentage >= 80;
                  }).length}
                </div>
                <div className="text-gray-600 text-sm mt-1">✅ Đạt (≥80%)</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {(tests || []).filter((t) => {
                    const percentage = (t.totalCorrectAnswers / t.totalQuestions) * 100;
                    return percentage >= 60 && percentage < 80;
                  }).length}
                </div>
                <div className="text-gray-600 text-sm mt-1">⚠️ Trung bình (60-79%)</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {(tests || []).filter((t) => {
                    const percentage = (t.totalCorrectAnswers / t.totalQuestions) * 100;
                    return percentage < 60;
                  }).length}
                </div>
                <div className="text-gray-600 text-sm mt-1">❌ Chưa đạt (&lt;60%)</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
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
            <Input
              placeholder="Tìm kiếm theo tên sinh viên hoặc tên bài kiểm tra..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
              className="flex-1 max-w-md"
              size="large"
            />
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                loading={isLoading}
                onClick={() => fetchTests(currentPage - 1, pageSize)}
                size="large"
              />
            </Tooltip>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm border-0">
          {isLoading && (tests || []).length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : filteredTests.length === 0 ? (
            <Empty
              description="No student test submissions found"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredTests}
              rowKey="studentTestId"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} to ${range[1]} of ${total} submissions`,
              }}
              bordered
            />
          )}
        </Card>
      </div>
    </div>
  );
}
