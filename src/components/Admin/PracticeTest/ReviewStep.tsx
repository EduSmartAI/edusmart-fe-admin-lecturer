"use client";

import { Button, Tag, Empty, Collapse } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CodeOutlined,
  BulbOutlined,
  ExperimentOutlined,
  UnlockOutlined,
  LockOutlined,
  RocketOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  CreatePracticeTestDto,
  LANGUAGE_NAMES,
  LANGUAGE_ICONS,
  ProgrammingLanguage,
  DifficultyLevel,
} from "EduSmart/types/practice-test";

// Language icon mapping (fallback for dynamic languageIds)
const getLanguageIcon = (languageId: number, name?: string): string => {
  // First check static mapping
  if (LANGUAGE_ICONS[languageId as ProgrammingLanguage]) {
    return LANGUAGE_ICONS[languageId as ProgrammingLanguage];
  }
  // Fallback based on name if provided
  if (name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('javascript') || lowerName.includes('node')) return '🟨';
    if (lowerName.includes('typescript')) return '🔷';
    if (lowerName.includes('python')) return '🐍';
    if (lowerName.includes('java') && !lowerName.includes('javascript')) return '☕';
    if (lowerName.includes('c++') || lowerName.includes('cpp')) return '⚙️';
    if (lowerName.includes('c#') || lowerName.includes('csharp')) return '🟣';
    if (lowerName.includes('go')) return '🐹';
    if (lowerName.includes('rust')) return '🦀';
  }
  return '💻';
};

// LeetCode-style difficulty colors
const DIFFICULTY_STYLES: Record<DifficultyLevel, { color: string; bg: string; text: string }> = {
  Easy: { color: "#00b8a3", bg: "rgba(0, 184, 163, 0.15)", text: "Easy" },
  Medium: { color: "#ffc01e", bg: "rgba(255, 192, 30, 0.15)", text: "Medium" },
  Hard: { color: "#ff375f", bg: "rgba(255, 55, 95, 0.15)", text: "Hard" },
};

// Helper to convert numeric difficulty to DifficultyLevel string
const getDifficultyLabel = (difficulty: number): DifficultyLevel => {
  const map: Record<number, DifficultyLevel> = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  };
  return map[difficulty] || 'Easy';
};

interface ReviewStepProps {
  formData: CreatePracticeTestDto;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export default function ReviewStep({
  formData,
  onBack,
  onEdit,
  onSubmit,
  isSubmitting,
  isEditMode = false,
}: ReviewStepProps) {
  const { problem, examples, testcases, templates, solutions } = formData;

  // Handle both old array format and new object format
  const publicTestCount = Array.isArray(testcases) 
    ? testcases?.[0]?.publicTestcases?.length || 0
    : testcases?.publicTestcases?.length || 0;
  const privateTestCount = Array.isArray(testcases)
    ? testcases?.[0]?.privateTestcases?.length || 0
    : testcases?.privateTestcases?.length || 0;
  const totalTestCount = publicTestCount + privateTestCount;

  const difficultyStyle = DIFFICULTY_STYLES[getDifficultyLabel(problem.difficulty)];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <CheckCircleOutlined className="text-emerald-500" />
          {isEditMode ? 'Xác nhận cập nhật' : 'Review & Tạo Practice Test'}
        </h2>
        <p className="text-gray-500">
          {isEditMode ? 'Xem lại các thay đổi trước khi cập nhật. Bạn có thể chỉnh sửa từng phần.' : 'Xem lại toàn bộ thông tin trước khi tạo. Bạn có thể chỉnh sửa từng phần.'}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{examples.length}</div>
          <div className="text-xs text-gray-500">Ví dụ</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{totalTestCount}</div>
          <div className="text-xs text-gray-500">Test Cases</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{templates.length}</div>
          <div className="text-xs text-gray-500">Templates</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-600">{solutions?.length || 0}</div>
          <div className="text-xs text-gray-500">Solutions</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <span
            className="text-lg font-bold px-3 py-1 rounded-full"
            style={{ color: difficultyStyle.color, backgroundColor: difficultyStyle.bg }}
          >
            {difficultyStyle.text}
          </span>
          <div className="text-xs text-gray-500 mt-1">Độ khó</div>
        </div>
      </div>

      {/* Problem Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="flex items-center gap-2 text-gray-800 font-semibold">
            <CodeOutlined className="text-indigo-500" />
            Thông tin bài toán
          </span>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(0)}
            className="text-emerald-500 hover:text-emerald-600"
          >
            Sửa
          </Button>
        </div>
        <div className="p-4">
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Tiêu đề</div>
            <div className="text-lg font-semibold text-gray-800">{problem.title}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Mô tả</div>
            <div className="text-gray-600 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto border border-gray-200">
              {problem.description}
            </div>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="flex items-center gap-2 text-gray-800 font-semibold">
            <BulbOutlined className="text-purple-500" />
            Ví dụ ({examples.length})
          </span>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(1)}
            className="text-emerald-500 hover:text-emerald-600"
          >
            Sửa
          </Button>
        </div>
        <div className="p-4">
          {examples.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">Chưa có ví dụ nào</span>}
            />
          ) : (
            <Collapse
              ghost
              className="admin-review-collapse"
              items={examples.map((example, index) => ({
                key: index,
                label: (
                  <span className="text-gray-700 font-medium">
                    Example {example.exampleOrder || index + 1}
                  </span>
                ),
                children: (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Input: </span>
                      <code className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{example.inputData}</code>
                    </div>
                    <div>
                      <span className="text-gray-500">Output: </span>
                      <code className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{example.outputData}</code>
                    </div>
                    {example.explanation && (
                      <div className="text-gray-500 text-xs">{example.explanation}</div>
                    )}
                  </div>
                ),
              }))}
            />
          )}
        </div>
      </div>

      {/* Test Cases */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="flex items-center gap-2 text-gray-800 font-semibold">
            <ExperimentOutlined className="text-green-500" />
            Test Cases
          </span>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(2)}
            className="text-emerald-500 hover:text-emerald-600"
          >
            Sửa
          </Button>
        </div>
        <div className="p-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <UnlockOutlined className="text-green-500 text-xl" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{publicTestCount}</div>
                <div className="text-xs text-gray-500">Public Tests</div>
              </div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <LockOutlined className="text-orange-500 text-xl" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{privateTestCount}</div>
                <div className="text-xs text-gray-500">Private Tests</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="flex items-center gap-2 text-gray-800 font-semibold">
            <CodeOutlined className="text-blue-500" />
            Code Templates ({templates.length})
          </span>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(3)}
            className="text-emerald-500 hover:text-emerald-600"
          >
            Sửa
          </Button>
        </div>
        <div className="p-4">
          {templates.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">Chưa có template nào</span>}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {templates.map((template, index) => (
                <Tag
                  key={index}
                  className="px-3 py-1 font-medium text-sm bg-blue-50 border-blue-200 text-blue-600"
                >
                  <span className="mr-1">
                    {getLanguageIcon(template.languageId)}
                  </span>
                  {LANGUAGE_NAMES[template.languageId as ProgrammingLanguage] || `Lang ${template.languageId}`}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Solutions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-amber-50">
          <span className="flex items-center gap-2 text-gray-800 font-semibold">
            <TrophyOutlined className="text-amber-500" />
            Solutions ({solutions?.length || 0})
          </span>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(4)}
            className="text-emerald-500 hover:text-emerald-600"
          >
            Sửa
          </Button>
        </div>
        <div className="p-4">
          {!solutions || solutions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">Chưa có solution nào (có thể bỏ qua)</span>}
            />
          ) : (
            <Collapse
              ghost
              className="admin-review-collapse"
              items={solutions.map((solution, index) => ({
                key: index,
                label: (
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <span>{getLanguageIcon(solution.languageId)}</span>
                    {LANGUAGE_NAMES[solution.languageId as ProgrammingLanguage] || `Language ${solution.languageId}`}
                    <Tag color="gold" className="ml-2">Solution</Tag>
                  </span>
                ),
                children: (
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto max-h-40">
                    {solution.solutionCode}
                  </pre>
                ),
              }))}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
        <Button
          onClick={onBack}
          size="large"
          icon={<ArrowLeftOutlined />}
          className="px-6 border-gray-300 text-gray-600 hover:text-emerald-600 hover:border-emerald-500"
          disabled={isSubmitting}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          onClick={onSubmit}
          size="large"
          icon={isEditMode ? <CheckCircleOutlined /> : <RocketOutlined />}
          loading={isSubmitting}
          className="px-8 bg-gradient-to-r from-emerald-500 to-teal-500 border-0 hover:opacity-90 h-12 text-base font-semibold"
        >
          {isSubmitting ? (isEditMode ? "Đang cập nhật..." : "Đang tạo...") : (isEditMode ? "Cập nhật Practice Test" : "Tạo Practice Test")}
        </Button>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .admin-review-collapse .ant-collapse-header {
          color: #374151 !important;
          padding: 8px 0 !important;
        }
        .admin-review-collapse .ant-collapse-content {
          background: transparent !important;
          border-top: none !important;
        }
        .admin-review-collapse .ant-collapse-content-box {
          padding: 0 0 8px 24px !important;
        }
        .admin-review-collapse .ant-collapse-arrow {
          color: #6b7280 !important;
        }
      `}</style>
    </div>
  );
}
