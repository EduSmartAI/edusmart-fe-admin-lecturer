"use client";

import { Button, Card, Descriptions, Tag, Empty, Divider, Collapse } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CodeOutlined,
  FileTextOutlined,
  BulbOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import {
  CreatePracticeTestDto,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LANGUAGE_NAMES,
  LANGUAGE_ICONS,
  ProgrammingLanguage,
  DifficultyLevel,
} from "EduSmart/types/practice-test";

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
}

export default function ReviewStep({
  formData,
  onBack,
  onEdit,
  onSubmit,
  isSubmitting,
}: ReviewStepProps) {
  const { problem, examples, testcases, templates } = formData;

  const publicTestCount = testcases?.[0]?.publicTestcases?.length || 0;
  const privateTestCount = testcases?.[0]?.privateTestcases?.length || 0;

  return (
    <Card className="shadow-sm border-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <CheckCircleOutlined className="text-green-500" />
          Kiểm tra lại thông tin
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Xem lại toàn bộ thông tin trước khi tạo Practice Test.
        </p>
      </div>

      {/* Problem Information */}
      <Card
        className="mb-4 border-l-4 border-l-indigo-500 shadow-md"
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CodeOutlined className="text-indigo-500" />
              <span className="font-bold">Thông tin bài toán</span>
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(0)}
              className="text-indigo-600"
            >
              Chỉnh sửa
            </Button>
          </div>
        }
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tiêu đề">
            <span className="font-semibold text-gray-900 dark:text-white">
              {problem.title}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {problem.description}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Độ khó">
            <Tag
              color={DIFFICULTY_COLORS[getDifficultyLabel(problem.difficulty)]}
              className="font-semibold px-3 py-1"
            >
              {DIFFICULTY_LABELS[getDifficultyLabel(problem.difficulty)]}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Examples */}
      <Card
        className="mb-4 border-l-4 border-l-purple-500 shadow-md"
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BulbOutlined className="text-purple-500" />
              <span className="font-bold">Ví dụ ({examples.length})</span>
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(1)}
              className="text-purple-600"
            >
              Chỉnh sửa
            </Button>
          </div>
        }
      >
        {examples.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có ví dụ nào"
          />
        ) : (
          <Collapse
            items={examples.map((example, index) => ({
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
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono">
                      {example.inputData}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      OUTPUT:
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono">
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

      {/* Test Cases */}
      <Card
        className="mb-4 border-l-4 border-l-green-500 shadow-md"
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ExperimentOutlined className="text-green-500" />
              <span className="font-bold">Test Cases</span>
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(2)}
              className="text-green-600"
            >
              Chỉnh sửa
            </Button>
          </div>
        }
      >
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-500 text-xl" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {publicTestCount}
              </div>
              <div className="text-xs text-gray-500">Public Tests</div>
            </div>
          </div>
          <Divider type="vertical" className="h-12" />
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-gray-400 text-xl" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {privateTestCount}
              </div>
              <div className="text-xs text-gray-500">Private Tests</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Templates */}
      <Card
        className="mb-4 border-l-4 border-l-blue-500 shadow-md"
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CodeOutlined className="text-blue-500" />
              <span className="font-bold">Code Templates ({templates.length})</span>
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(3)}
              className="text-blue-600"
            >
              Chỉnh sửa
            </Button>
          </div>
        }
      >
        {templates.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có template nào"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {templates.map((template, index) => (
              <Tag
                key={index}
                color="blue"
                className="px-3 py-1 font-semibold text-sm"
              >
                <span className="mr-1">
                  {LANGUAGE_ICONS[template.languageId as ProgrammingLanguage]}
                </span>
                {LANGUAGE_NAMES[template.languageId as ProgrammingLanguage]}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
        <Button
          onClick={onBack}
          size="large"
          icon={<ArrowLeftOutlined />}
          className="px-6"
          disabled={isSubmitting}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          onClick={onSubmit}
          size="large"
          icon={<CheckCircleOutlined />}
          loading={isSubmitting}
          className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 px-8 shadow-lg"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo Practice Test"}
        </Button>
      </div>
    </Card>
  );
}
