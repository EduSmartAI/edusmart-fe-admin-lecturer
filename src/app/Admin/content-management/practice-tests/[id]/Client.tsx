"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Tag,
  Button,
  Collapse,
  Empty,
  Spin,
  Alert,
  Popconfirm,
  Space,
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
  CloseCircleOutlined,
} from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LANGUAGE_NAMES,
  LANGUAGE_ICONS,
  ProgrammingLanguage,
  ApiTestCase,
  ApiCodeTemplate,
} from "EduSmart/types/practice-test";
import AddExamplesModal from "EduSmart/components/Admin/PracticeTest/AddExamplesModal";
import AddTemplatesModal from "EduSmart/components/Admin/PracticeTest/AddTemplatesModal";
import AddTestCasesModal from "EduSmart/components/Admin/PracticeTest/AddTestCasesModal";

interface PracticeTestDetailClientProps {
  problemId: string;
}

export default function PracticeTestDetailClient({ problemId }: PracticeTestDetailClientProps) {
  const router = useRouter();
  const { selectedTest, isLoading, error, getPracticeTestDetail, deletePracticeTest } =
    usePracticeTestStore();

  const [showAddExamples, setShowAddExamples] = useState(false);
  const [showAddTemplates, setShowAddTemplates] = useState(false);
  const [showAddTestCases, setShowAddTestCases] = useState(false);

  useEffect(() => {
    getPracticeTestDetail(problemId);
  }, [problemId, getPracticeTestDetail]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.back()}>Quay lại</Button>
          }
        />
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Empty description="Không tìm thấy Practice Test" />
      </div>
    );
  }

  // Handle both API formats: testCases (flat array with isPublic) and legacy testcases (nested)
  const publicTestCases: ApiTestCase[] = selectedTest.testCases?.filter(tc => tc.isPublic) ||
    (selectedTest.testcases?.publicTestcases as ApiTestCase[]) ||
    [];
  const privateTestCases: ApiTestCase[] = selectedTest.testCases?.filter(tc => !tc.isPublic) ||
    (selectedTest.testcases?.privateTestcases as ApiTestCase[]) ||
    [];

  const publicTestCount = publicTestCases.length;
  const privateTestCount = privateTestCases.length;
  const exampleCount = selectedTest.totalExamples || selectedTest.examples?.length || 0;
  const templateCount = selectedTest.totalTemplates || selectedTest.templates?.length || 0;

  // Extract existing language IDs for AddTemplatesModal
  const existingLanguageIds = selectedTest.templates?.map(t => t?.languageId).filter(Boolean) || [];

  // Debug logging
  console.log('📊 Practice Test Detail Data:', {
    hasTemplates: !!selectedTest.templates,
    templateCount,
    templates: selectedTest.templates,
    hasTestCases: !!selectedTest.testCases,
    testCasesCount: selectedTest.testCases?.length,
    hasExamples: !!selectedTest.examples,
    examplesCount: selectedTest.examples?.length,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mb-8"
          >
            Quay lại
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <CodeOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTest.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Tag
                    color={DIFFICULTY_COLORS[selectedTest.difficulty]}
                    className="font-semibold px-3 py-1"
                  >
                    {DIFFICULTY_LABELS[selectedTest.difficulty]}
                  </Tag>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ID: {problemId}
                  </span>
                </div>
              </div>
            </div>

            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="bg-blue-600"
              >
                Chỉnh sửa
              </Button>
              <Popconfirm
                title="Xóa Practice Test?"
                description="Bạn có chắc muốn xóa bài test này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>

        {/* Problem Description */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-indigo-500">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CodeOutlined className="text-indigo-500" />
            Mô tả bài toán
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {selectedTest.description}
            </p>
          </div>
        </Card>

        {/* Examples Section */}
        <Card
          className="mb-6 shadow-sm border-l-4 border-l-purple-500"
          title={
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-bold">
                <BulbOutlined className="text-purple-500" />
                Ví dụ ({exampleCount})
              </span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddExamples(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 border-0"
              >
                Thêm ví dụ
              </Button>
            </div>
          }
        >
          {!selectedTest.examples || selectedTest.examples.length === 0 ? (
            <Empty description="Chưa có ví dụ nào" />
          ) : (
            <Collapse
              items={selectedTest.examples.map((example, index) => ({
                key: index,
                label: (
                  <span className="font-semibold">
                    Ví dụ {example.exampleOrder || index + 1}
                  </span>
                ),
                children: (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        INPUT:
                      </div>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                        {example.inputData}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        OUTPUT:
                      </div>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                        {example.outputData}
                      </pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">
                          GIẢI THÍCH:
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {example.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              }))}
              defaultActiveKey={[0]}
            />
          )}
        </Card>

        {/* Test Cases Section */}
        <Card
          className="mb-6 shadow-sm border-l-4 border-l-green-500"
          title={
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-bold">
                <ExperimentOutlined className="text-green-500" />
                Test Cases
              </span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddTestCases(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 border-0"
              >
                Thêm test case
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Test Cases */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleOutlined className="text-green-500" style={{ fontSize: '18px' }} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                  Public Test Cases ({publicTestCount})
                </h3>
              </div>
              {publicTestCases.length === 0 ? (
                <Empty description="Chưa có public test case" className="py-4" />
              ) : (
                <div className="space-y-3">
                  {publicTestCases.map((test: ApiTestCase, index: number) => (
                    <Card
                      key={index}
                      size="small"
                      className="border-l-4 border-l-green-500"
                      title={`Test ${index + 1}`}
                    >
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Input:</div>
                          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                            {test.inputData}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Expected:</div>
                          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                            {test.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Private Test Cases */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CloseCircleOutlined className="text-gray-400" style={{ fontSize: '18px' }} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                  Private Test Cases ({privateTestCount})
                </h3>
              </div>
              {privateTestCases.length === 0 ? (
                <Empty description="Chưa có private test case" className="py-4" />
              ) : (
                <div className="space-y-3">
                  {privateTestCases.map((test: ApiTestCase, index: number) => (
                    <Card
                      key={index}
                      size="small"
                      className="border-l-4 border-l-gray-400"
                      title={`Test ${index + 1}`}
                    >
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Input:</div>
                          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                            {test.inputData}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Expected:</div>
                          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                            {test.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Templates Section */}
        <Card
          className="mb-6 shadow-sm border-l-4 border-l-blue-500"
          title={
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-bold">
                <CodeOutlined className="text-blue-500" />
                Code Templates ({templateCount})
              </span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddTemplates(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0"
                disabled={existingLanguageIds.length >= Object.keys(LANGUAGE_NAMES).length}
              >
                Thêm template
              </Button>
            </div>
          }
        >
          {!selectedTest.templates || selectedTest.templates.length === 0 ? (
            <Empty description="Chưa có template nào" />
          ) : (
            <Collapse
              items={selectedTest.templates.map((template: ApiCodeTemplate, index) => {
                // API format uses templatePrefix/templateSuffix
                const prefix = template.templatePrefix;
                const suffix = template.templateSuffix;
                const languageName = LANGUAGE_NAMES[template.languageId as ProgrammingLanguage] ||
                  template.languageName ||
                  `Language ID: ${template.languageId}`;
                const languageIcon = LANGUAGE_ICONS[template.languageId as ProgrammingLanguage] || '';

                console.log('🔍 Template debug:', {
                  index,
                  languageId: template.languageId,
                  languageName,
                  hasPrefix: !!prefix,
                  hasSuffix: !!suffix,
                  hasStubCode: !!template.userStubCode,
                  template
                });

                return {
                  key: index,
                  label: (
                    <span className="flex items-center gap-2 font-semibold">
                      {languageIcon && <span className="text-lg">{languageIcon}</span>}
                      {languageName}
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      {prefix && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            PREFIX (Code trước):
                          </div>
                          <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                            {prefix}
                          </pre>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">
                          STUB CODE (Code mẫu):
                        </div>
                        <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                          {template.userStubCode}
                        </pre>
                      </div>
                      {suffix && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            SUFFIX (Code sau):
                          </div>
                          <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                            {suffix}
                          </pre>
                        </div>
                      )}
                    </div>
                  ),
                };
              })}
            />
          )}
        </Card>
      </div>

      {/* Modals */}
      <AddExamplesModal
        problemId={problemId}
        visible={showAddExamples}
        onClose={() => {
          setShowAddExamples(false);
          getPracticeTestDetail(problemId); // Refresh data
        }}
        existingExampleCount={exampleCount}
      />

      <AddTemplatesModal
        problemId={problemId}
        visible={showAddTemplates}
        onClose={() => {
          setShowAddTemplates(false);
          getPracticeTestDetail(problemId); // Refresh data
        }}
        existingLanguageIds={existingLanguageIds}
      />

      <AddTestCasesModal
        problemId={problemId}
        visible={showAddTestCases}
        onClose={() => {
          setShowAddTestCases(false);
          getPracticeTestDetail(problemId); // Refresh data
        }}
        existingPublicCount={publicTestCount}
        existingPrivateCount={privateTestCount}
      />
    </div>
  );
}
