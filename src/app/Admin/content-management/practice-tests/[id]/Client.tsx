"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Empty,
  Spin,
  Alert,
  Popconfirm,
  Tabs,
  Tooltip,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CodeOutlined,
  BulbOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  CopyOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import {
  LANGUAGE_NAMES,
  LANGUAGE_ICONS,
  ProgrammingLanguage,
  ApiTestCase,
  ApiCodeTemplate,
  DifficultyLevel,
} from "EduSmart/types/practice-test";
import AddExamplesModal from "EduSmart/components/Admin/PracticeTest/AddExamplesModal";
import AddTemplatesModal from "EduSmart/components/Admin/PracticeTest/AddTemplatesModal";
import AddTestCasesModal from "EduSmart/components/Admin/PracticeTest/AddTestCasesModal";

type ApiSolution = {
  languageId?: number | null;
  language?: {
    languageId?: number | null;
    languageName?: string | null;
  } | null;
  solutionCode?: string | null;
};

interface PracticeTestDetailClientProps {
  problemId: string;
}

// Admin-style difficulty colors
const DIFFICULTY_STYLES: Record<DifficultyLevel, { color: string; bg: string; text: string }> = {
  Easy: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", text: "Dễ" },
  Medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", text: "Trung bình" },
  Hard: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", text: "Khó" },
};

export default function PracticeTestDetailClient({ problemId }: PracticeTestDetailClientProps) {
  const router = useRouter();
  const { selectedTest, isLoading, error, getPracticeTestDetail, deletePracticeTest } =
    usePracticeTestStore();

  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  const [selectedSolutionLanguage, setSelectedSolutionLanguage] = useState<number | null>(null);
  const [showAddExamples, setShowAddExamples] = useState(false);
  const [showAddTemplates, setShowAddTemplates] = useState(false);
  const [showAddTestCases, setShowAddTestCases] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    getPracticeTestDetail(problemId);
  }, [problemId, getPracticeTestDetail]);

  // Set default selected language when templates load
  useEffect(() => {
    if (selectedTest?.templates && selectedTest.templates.length > 0 && !selectedLanguage) {
      setSelectedLanguage(selectedTest.templates[0].languageId);
    }
  }, [selectedTest?.templates, selectedLanguage]);

  // Set default selected language when solutions load
  useEffect(() => {
    const firstSolution = (selectedTest?.solutions?.[0] ?? null) as ApiSolution | null;
    const firstLangId = firstSolution?.languageId ?? firstSolution?.language?.languageId ?? null;
    if (firstLangId && !selectedSolutionLanguage) {
      setSelectedSolutionLanguage(firstLangId);
    }
  }, [selectedTest?.solutions, selectedSolutionLanguage]);

  const handleDelete = async () => {
    try {
      await deletePracticeTest(problemId);
      router.push("/Admin/content-management/practice-tests");
    } catch {
      // Error already handled by store
    }
  };

  const handleEdit = () => {
    router.push(`/Admin/content-management/practice-tests/${problemId}/edit`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={() => router.back()}>Quay lại</Button>}
        />
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Empty description={<span className="text-gray-500">Không tìm thấy Practice Test</span>} />
      </div>
    );
  }

  // Handle both API formats
  const publicTestCases: ApiTestCase[] =
    selectedTest.testCases?.filter((tc) => tc.isPublic) ||
    (selectedTest.testcases?.publicTestcases as ApiTestCase[]) ||
    [];
  const privateTestCases: ApiTestCase[] =
    selectedTest.testCases?.filter((tc) => !tc.isPublic) ||
    (selectedTest.testcases?.privateTestcases as ApiTestCase[]) ||
    [];

  const publicTestCount = publicTestCases.length;
  const privateTestCount = privateTestCases.length;
  const totalTestCount = publicTestCount + privateTestCount;
  const exampleCount = selectedTest.totalExamples || selectedTest.examples?.length || 0;
  const templateCount = selectedTest.totalTemplates || selectedTest.templates?.length || 0;
  const solutionCount = selectedTest.solutions?.length || 0;
  const existingLanguageIds = selectedTest.templates?.map((t) => t?.languageId).filter(Boolean) || [];

  const difficultyStyle = DIFFICULTY_STYLES[selectedTest.difficulty] || DIFFICULTY_STYLES.Easy;

  // Get current template
  const currentTemplate = selectedTest.templates?.find((t) => t.languageId === selectedLanguage);

  const getSolutionLanguageId = (solution: ApiSolution | null | undefined): number | null => {
    return solution?.languageId ?? solution?.language?.languageId ?? null;
  };

  const currentSolution = (selectedTest.solutions as unknown as ApiSolution[] | undefined)?.find(
    (s) => getSolutionLanguageId(s) === selectedSolutionLanguage
  );

  // Tab items
  const tabItems = [
    {
      key: "description",
      label: (
        <span className="flex items-center gap-2 px-1">
          <FileTextOutlined />
          Mô tả
        </span>
      ),
      children: (
        <div className="p-6">
          {/* Problem Description */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 text-[15px] leading-relaxed">
              {selectedTest.description}
            </div>
          </div>

          {/* Examples Section */}
          {selectedTest.examples && selectedTest.examples.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ví dụ</h3>
              <div className="space-y-6">
                {selectedTest.examples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Ví dụ {example.exampleOrder || index + 1}:
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 text-sm">Input: </span>
                        <code className="text-gray-800 bg-white px-2 py-1 rounded text-sm border border-gray-200">
                          {example.inputData}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Output: </span>
                        <code className="text-gray-800 bg-white px-2 py-1 rounded text-sm border border-gray-200">
                          {example.outputData}
                        </code>
                      </div>
                      {example.explanation && (
                        <div className="pt-2 border-t border-gray-200">
                          <span className="text-gray-500 text-sm">Giải thích: </span>
                          <span className="text-gray-600 text-sm">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Example Button */}
          <div className="mt-6">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setShowAddExamples(true)}
              className="border-dashed border-gray-300 text-gray-500 hover:text-emerald-600 hover:border-emerald-500"
            >
              Thêm ví dụ mới
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "testcases",
      label: (
        <span className="flex items-center gap-2 px-1">
          <ExperimentOutlined />
          Test Cases
          <Badge
            count={totalTestCount}
            style={{
              backgroundColor: totalTestCount > 0 ? "#10b981" : "#9ca3af",
              fontSize: "11px",
              minWidth: "18px",
              height: "18px",
              lineHeight: "18px",
            }}
          />
        </span>
      ),
      children: (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <UnlockOutlined className="text-emerald-500" />
                <span className="text-gray-700 text-sm">Public: {publicTestCount}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                <LockOutlined className="text-orange-500" />
                <span className="text-gray-700 text-sm">Private: {privateTestCount}</span>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddTestCases(true)}
              className="bg-emerald-500 border-0 hover:bg-emerald-600"
            >
              Thêm Test Case
            </Button>
          </div>

          {/* Public Test Cases */}
          {publicTestCases.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UnlockOutlined className="text-emerald-500" />
                Public Test Cases
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {publicTestCases.map((test: ApiTestCase, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-emerald-600">
                        Case {index + 1}
                      </span>
                      <CheckCircleOutlined className="text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Input</div>
                        <pre className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto border border-gray-200">
                          {test.inputData}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Expected Output</div>
                        <pre className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto border border-gray-200">
                          {test.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Private Test Cases */}
          {privateTestCases.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LockOutlined className="text-orange-500" />
                Private Test Cases
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {privateTestCases.map((test: ApiTestCase, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-orange-600">
                        Case {index + 1}
                      </span>
                      <LockOutlined className="text-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Input</div>
                        <pre className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto border border-gray-200">
                          {test.inputData}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Expected Output</div>
                        <pre className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto border border-gray-200">
                          {test.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalTestCount === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">Chưa có test case nào</span>}
            />
          )}
        </div>
      ),
    },
    {
      key: "templates",
      label: (
        <span className="flex items-center gap-2 px-1">
          <CodeOutlined />
          Code Templates
          <Badge
            count={templateCount}
            style={{
              backgroundColor: templateCount > 0 ? "#10b981" : "#9ca3af",
              fontSize: "11px",
              minWidth: "18px",
              height: "18px",
              lineHeight: "18px",
            }}
          />
        </span>
      ),
      children: (
        <div className="p-0">
          {templateCount === 0 ? (
            <div className="p-6">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-gray-500">Chưa có template nào</span>}
              />
              <div className="text-center mt-4">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddTemplates(true)}
                  className="bg-emerald-500 border-0 hover:bg-emerald-600"
                >
                  Thêm Template đầu tiên
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[600px]">
              {/* Language Tabs */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-gray-50">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {selectedTest.templates?.map((template: ApiCodeTemplate) => {
                    const langName =
                      LANGUAGE_NAMES[template.languageId as ProgrammingLanguage] ||
                      template.languageName ||
                      `ID: ${template.languageId}`;
                    const langIcon = LANGUAGE_ICONS[template.languageId as ProgrammingLanguage] || "💻";
                    const isActive = selectedLanguage === template.languageId;

                    return (
                      <button
                        key={template.languageId}
                        onClick={() => setSelectedLanguage(template.languageId)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <span>{langIcon}</span>
                        <span>{langName}</span>
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddTemplates(true)}
                  className="text-gray-500 hover:text-emerald-600"
                >
                  Thêm
                </Button>
              </div>

              {/* Code Display */}
              {currentTemplate && (
                <div className="flex-1 overflow-auto bg-gray-900">
                  {/* Prefix Section */}
                  {currentTemplate.templatePrefix && (
                    <div className="border-b border-gray-700">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Prefix Code
                        </span>
                        <Tooltip title={copiedCode ? "Copied!" : "Copy code"}>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(currentTemplate.templatePrefix)}
                            className="text-gray-400 hover:text-white"
                          />
                        </Tooltip>
                      </div>
                      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto m-0 bg-gray-900">
                        {currentTemplate.templatePrefix}
                      </pre>
                    </div>
                  )}

                  {/* Stub Code Section */}
                  <div className="border-b border-gray-700">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                        ✨ User Stub Code (Code mẫu)
                      </span>
                      <Tooltip title={copiedCode ? "Copied!" : "Copy code"}>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(currentTemplate.userStubCode)}
                          className="text-gray-400 hover:text-white"
                        />
                      </Tooltip>
                    </div>
                    <pre className="p-4 text-sm font-mono text-white overflow-x-auto m-0 bg-gray-900">
                      {currentTemplate.userStubCode}
                    </pre>
                  </div>

                  {/* Suffix Section */}
                  {currentTemplate.templateSuffix && (
                    <div>
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Suffix Code
                        </span>
                        <Tooltip title={copiedCode ? "Copied!" : "Copy code"}>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(currentTemplate.templateSuffix)}
                            className="text-gray-400 hover:text-white"
                          />
                        </Tooltip>
                      </div>
                      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto m-0 bg-gray-900">
                        {currentTemplate.templateSuffix}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "solutions",
      label: (
        <span className="flex items-center gap-2 px-1">
          <CheckCircleOutlined />
          Solutions
          <Badge
            count={solutionCount}
            style={{
              backgroundColor: solutionCount > 0 ? "#10b981" : "#9ca3af",
              fontSize: "11px",
              minWidth: "18px",
              height: "18px",
              lineHeight: "18px",
            }}
          />
        </span>
      ),
      children: (
        <div className="p-0">
          {solutionCount === 0 ? (
            <div className="p-6">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-gray-500">Chưa có solution nào</span>}
              />
            </div>
          ) : (
            <div className="flex flex-col h-[600px]">
              {/* Language Tabs */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-gray-50">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {(selectedTest.solutions as unknown as ApiSolution[] | undefined)?.map((solution) => {
                    const langId = getSolutionLanguageId(solution);
                    if (!langId) return null;

                    const langName =
                      LANGUAGE_NAMES[langId as ProgrammingLanguage] ||
                      solution?.language?.languageName ||
                      `ID: ${langId}`;
                    const langIcon = LANGUAGE_ICONS[langId as ProgrammingLanguage] || "💻";
                    const isActive = selectedSolutionLanguage === langId;

                    return (
                      <button
                        key={langId}
                        onClick={() => setSelectedSolutionLanguage(langId)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <span>{langIcon}</span>
                        <span>{langName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solution Display */}
              {currentSolution && (
                <div className="flex-1 overflow-auto bg-gray-900">
                  <div className="border-b border-gray-700">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                        ✅ Solution Code
                      </span>
                      <Tooltip title={copiedCode ? "Copied!" : "Copy code"}>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(String(currentSolution.solutionCode ?? ""))}
                          className="text-gray-400 hover:text-white"
                        />
                      </Tooltip>
                    </div>
                    <pre className="p-4 text-sm font-mono text-white overflow-x-auto m-0 bg-gray-900">
                      {String(currentSolution.solutionCode ?? "")}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/Admin/content-management/practice-tests")}
              className="text-gray-500 hover:text-emerald-600"
            >
              Danh sách
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <span className="text-gray-800 font-semibold text-lg">{selectedTest.title}</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  color: difficultyStyle.color,
                  backgroundColor: difficultyStyle.bg,
                }}
              >
                {difficultyStyle.text}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="bg-emerald-500 border-0 hover:bg-emerald-600"
            >
              Chỉnh sửa
            </Button>
            <Popconfirm
              title="Xóa Practice Test?"
              description="Bạn có chắc muốn xóa bài test này?"
              onConfirm={handleDelete}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BulbOutlined className="text-purple-500 text-lg" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{exampleCount}</div>
                <div className="text-xs text-gray-500">Ví dụ</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ExperimentOutlined className="text-emerald-500 text-lg" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalTestCount}</div>
                <div className="text-xs text-gray-500">Test Cases</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CodeOutlined className="text-blue-500 text-lg" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{templateCount}</div>
                <div className="text-xs text-gray-500">Ngôn ngữ</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <ClockCircleOutlined className="text-orange-500 text-lg" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {selectedTest.totalSubmissions || 0}
                </div>
                <div className="text-xs text-gray-500">Submissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="admin-tabs"
            tabBarStyle={{
              backgroundColor: "#f9fafb",
              marginBottom: 0,
              borderBottom: "1px solid #e5e7eb",
              padding: "0 16px",
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <AddExamplesModal
        problemId={problemId}
        visible={showAddExamples}
        onClose={() => {
          setShowAddExamples(false);
          getPracticeTestDetail(problemId);
        }}
        existingExampleCount={exampleCount}
      />

      <AddTemplatesModal
        problemId={problemId}
        visible={showAddTemplates}
        onClose={() => {
          setShowAddTemplates(false);
          getPracticeTestDetail(problemId);
        }}
        existingLanguageIds={existingLanguageIds}
      />

      <AddTestCasesModal
        problemId={problemId}
        visible={showAddTestCases}
        onClose={() => {
          setShowAddTestCases(false);
          getPracticeTestDetail(problemId);
        }}
        existingPublicCount={publicTestCount}
        existingPrivateCount={privateTestCount}
      />

      {/* Custom styles for light theme tabs */}
      <style jsx global>{`
        .admin-tabs .ant-tabs-tab {
          color: #6b7280 !important;
          padding: 12px 0 !important;
        }
        .admin-tabs .ant-tabs-tab:hover {
          color: #374151 !important;
        }
        .admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #10b981 !important;
        }
        .admin-tabs .ant-tabs-ink-bar {
          background: #10b981 !important;
        }
        .admin-tabs .ant-tabs-content {
          background: white;
        }
      `}</style>
    </div>
  );
}
