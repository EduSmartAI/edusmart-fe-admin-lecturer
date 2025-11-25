"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, Tag, Button, Collapse, Descriptions, Badge, Tabs, Row, Col, Statistic, Alert, Progress } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CodeOutlined,
  FileTextOutlined,
  BulbOutlined,
  ExperimentOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  CreatePracticeTestDto,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  DifficultyLevel,
} from "EduSmart/types/practice-test";
import { practiceTestAdminApi } from "EduSmart/api/api-practice-test-service";

// Helper to convert numeric difficulty to DifficultyLevel string
const getDifficultyLabel = (difficulty: number): DifficultyLevel => {
  const map: Record<number, DifficultyLevel> = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  };
  return map[difficulty] || 'Easy';
};

// Language icon mapping
const getLanguageIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('javascript') || lowerName.includes('node')) return '🟨';
  if (lowerName.includes('typescript')) return '🔷';
  if (lowerName.includes('python')) return '🐍';
  if (lowerName.includes('java') && !lowerName.includes('javascript')) return '☕';
  if (lowerName.includes('c++') || lowerName.includes('cpp')) return '⚙️';
  if (lowerName.includes('c#') || lowerName.includes('csharp')) return '🟣';
  if (lowerName.includes('c ') || lowerName.includes('c(')) return '🔵';
  if (lowerName.includes('go')) return '🐹';
  if (lowerName.includes('rust')) return '🦀';
  if (lowerName.includes('php')) return '🐘';
  if (lowerName.includes('ruby')) return '💎';
  if (lowerName.includes('swift')) return '🕊️';
  if (lowerName.includes('kotlin')) return '🟣';
  if (lowerName.includes('dart')) return '🎯';
  return '💻';
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
  const [languages, setLanguages] = useState<Array<{ languageId: number; name: string }>>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Load language names
  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        console.log('🔄 [ReviewStep] Loading languages...');
        const response = await practiceTestAdminApi.getCodeLanguages();
        console.log('📥 [ReviewStep] API Response:', response);
        if (response.success && response.response) {
          console.log('✅ [ReviewStep] Languages loaded:', response.response.length, 'languages');
          console.log('📋 [ReviewStep] Sample languages:', response.response.slice(0, 3));
          setLanguages(response.response);
        } else {
          console.warn('⚠️ [ReviewStep] API returned no languages');
        }
      } catch (error) {
        console.error('❌ [ReviewStep] Error loading languages:', error);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    loadLanguages();
  }, []);

  const publicTestCount = testcases?.[0]?.publicTestcases?.length || 0;
  const privateTestCount = testcases?.[0]?.privateTestcases?.length || 0;
  const totalTests = publicTestCount + privateTestCount;

  // Debug templates data
  useEffect(() => {
    if (templates && templates.length > 0) {
      console.log('🎨 [ReviewStep] Templates data:', templates);
      console.log('🎨 [ReviewStep] First template:', templates[0]);
      console.log('🎨 [ReviewStep] Template languageIds:', templates.map(t => ({ id: t.languageId, type: typeof t.languageId })));
    }
  }, [templates]);

  // Validation checks
  const validations = [
    { key: 'problem', label: 'Thông tin bài toán', valid: !!problem?.title && !!problem?.description, step: 0 },
    { key: 'examples', label: 'Ví dụ minh họa', valid: examples.length > 0, step: 1 },
    { key: 'publicTests', label: 'Public test cases', valid: publicTestCount > 0, step: 2 },
    { key: 'privateTests', label: 'Private test cases', valid: privateTestCount > 0, step: 2 },
    { key: 'templates', label: 'Code templates', valid: templates.length > 0, step: 3 },
  ];

  const validCount = validations.filter(v => v.valid).length;
  const validPercentage = Math.round((validCount / validations.length) * 100);
  // Don't allow submit if languages not loaded yet (needed for proper template validation)
  const isComplete = validCount === validations.length && !isLoadingLanguages;

  // Create a map of languageId -> name for fast lookup
  // This will re-compute only when languages array changes
  const languageMap = useMemo(() => {
    const map = new Map<number, string>();
    languages.forEach(lang => {
      map.set(lang.languageId, lang.name);
    });
    console.log('🗺️ [languageMap] Created map with', map.size, 'languages');
    return map;
  }, [languages]);

  // Get language name helper
  const getLanguageName = (languageId: number | string) => {
    // Convert to number if it's a string
    const numericId = typeof languageId === 'string' ? parseInt(languageId, 10) : languageId;

    // If languages not loaded yet, return loading placeholder
    if (languageMap.size === 0) {
      console.warn('⚠️ [getLanguageName] Languages not loaded yet! languageId:', languageId);
      return `Loading...`;
    }

    const langName = languageMap.get(numericId);

    console.log('🔍 [getLanguageName] Input:', languageId, 'Type:', typeof languageId, '| NumericId:', numericId, '| Found:', langName, '| Map size:', languageMap.size);

    return langName || `Language ${languageId} `;
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <CheckCircleOutlined className="text-green-500" />
              Xác nhận thông tin
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kiểm tra kỹ toàn bộ thông tin trước khi tạo Practice Test
            </p>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Hoàn thành: {validCount}/{validations.length} bước
            </span>
            <span className={`text - sm font - bold ${isComplete ? 'text-green-600' : 'text-orange-600'} `}>
              {validPercentage}%
            </span>
          </div>
          <Progress
            percent={validPercentage}
            status={isComplete ? 'success' : 'active'}
            strokeColor={isComplete ? '#10b981' : '#f59e0b'}
            showInfo={false}
          />
        </div>

        {/* Validation Status */}
        {!isComplete && (
          <Alert
            message="Chưa hoàn tất"
            description={
              <div className="space-y-2 mt-2">
                {validations.filter(v => !v.valid).map((v) => (
                  <div key={v.key} className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CloseCircleOutlined className="text-red-500" />
                      {v.label}
                    </span>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => onEdit(v.step)}
                      className="text-xs"
                    >
                      Thêm ngay
                    </Button>
                  </div>
                ))}
              </div>
            }
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            className="mt-4"
          />
        )}
      </Card>

      {/* Summary Statistics */}
      <Card className="shadow-md border-0">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ThunderboltOutlined className="text-yellow-500" />
          Tổng quan
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <Statistic
                title={<span className="text-purple-700 dark:text-purple-300 font-semibold">Ví dụ</span>}
                value={examples.length}
                prefix={<BulbOutlined />}
                valueStyle={{ color: '#9333ea' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <Statistic
                title={<span className="text-green-700 dark:text-green-300 font-semibold">Test Cases</span>}
                value={totalTests}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <Statistic
                title={<span className="text-blue-700 dark:text-blue-300 font-semibold">Templates</span>}
                value={templates.length}
                prefix={<CodeOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
              <div className="ant-statistic">
                <div className="ant-statistic-title">
                  <span className="text-orange-700 dark:text-orange-300 font-semibold">Độ khó</span>
                </div>
                <div className="ant-statistic-content" style={{ color: DIFFICULTY_COLORS[getDifficultyLabel(problem.difficulty)] }}>
                  <Tag color={DIFFICULTY_COLORS[getDifficultyLabel(problem.difficulty)]} className="text-lg font-bold px-4 py-1">
                    {DIFFICULTY_LABELS[getDifficultyLabel(problem.difficulty)]}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Detailed Information - Tabbed View */}
      <Card className="shadow-md border-0">
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[
            {
              key: '1',
              label: (
                <span className="flex items-center gap-2">
                  <CodeOutlined />
                  Bài toán
                  {problem?.title && <CheckCircleOutlined className="text-green-500" />}
                </span>
              ),
              children: (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Thông tin bài toán</h3>
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => onEdit(0)}
                      size="small"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label={<span className="font-semibold">Tiêu đề</span>}>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {problem.title || <span className="text-gray-400">Chưa có</span>}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="font-semibold">Mô tả</span>}>
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto">
                        {problem.description || <span className="text-gray-400">Chưa có</span>}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="font-semibold">Độ khó</span>}>
                      <Tag
                        color={DIFFICULTY_COLORS[getDifficultyLabel(problem.difficulty)]}
                        className="font-bold text-base px-4 py-1"
                      >
                        {DIFFICULTY_LABELS[getDifficultyLabel(problem.difficulty)]}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span className="flex items-center gap-2">
                  <BulbOutlined />
                  Ví dụ ({examples.length})
                  {examples.length > 0 && <CheckCircleOutlined className="text-green-500" />}
                </span>
              ),
              children: (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Ví dụ minh họa</h3>
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => onEdit(1)}
                      size="small"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>
                  {examples.length === 0 ? (
                    <Alert
                      message="Chưa có ví dụ"
                      description="Hãy thêm ít nhất 1 ví dụ để người dùng hiểu rõ bài toán."
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Collapse
                      items={examples.map((example, index) => {
                        const displayOrder = index + 1;
                        return {
                          key: index,
                          label: (
                            <span className="font-semibold flex items-center gap-2">
                              <Badge count={displayOrder} style={{ backgroundColor: '#9333ea' }} />
                              Ví dụ {displayOrder}
                            </span>
                          ),
                          children: (
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                                  <FileTextOutlined /> INPUT:
                                </div>
                                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                                  {example.inputData}
                                </pre>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                                  <CheckOutlined /> OUTPUT:
                                </div>
                                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-mono overflow-x-auto">
                                  {example.outputData}
                                </pre>
                              </div>
                              {example.explanation && (
                                <div>
                                  <div className="text-xs font-bold text-purple-600 mb-2 flex items-center gap-1">
                                    <InfoCircleOutlined /> GIẢI THÍCH:
                                  </div>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-300">
                                    {example.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          ),
                        };
                      })}
                      defaultActiveKey={[0]}
                    />
                  )}
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span className="flex items-center gap-2">
                  <ExperimentOutlined />
                  Test Cases ({totalTests})
                  {totalTests > 0 && <CheckCircleOutlined className="text-green-500" />}
                </span>
              ),
              children: (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Test Cases</h3>
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => onEdit(2)}
                      size="small"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>

                  <Row gutter={16} className="mb-6">
                    <Col span={12}>
                      <Card className="text-center bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700">
                        <Statistic
                          title={<span className="text-green-700 dark:text-green-300 font-semibold">Public Tests</span>}
                          value={publicTestCount}
                          prefix={<EyeOutlined />}
                          valueStyle={{ color: '#10b981', fontSize: '2rem' }}
                          suffix={<span className="text-sm text-gray-500">tests</span>}
                        />
                        <div className="text-xs text-gray-500 mt-2">Hiển thị cho user</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className="text-center bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                        <Statistic
                          title={<span className="text-gray-700 dark:text-gray-300 font-semibold">Private Tests</span>}
                          value={privateTestCount}
                          prefix={<FileTextOutlined />}
                          valueStyle={{ color: '#6b7280', fontSize: '2rem' }}
                          suffix={<span className="text-sm text-gray-500">tests</span>}
                        />
                        <div className="text-xs text-gray-500 mt-2">Ẩn khỏi user</div>
                      </Card>
                    </Col>
                  </Row>

                  {totalTests === 0 ? (
                    <Alert
                      message="Chưa có test cases"
                      description="Cần thêm test cases để kiểm tra code của user."
                      type="error"
                      showIcon
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Public Test Cases */}
                      {publicTestCount > 0 && (
                        <div>
                          <h4 className="text-base font-bold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                            <EyeOutlined /> Public Test Cases ({publicTestCount})
                          </h4>
                          <Collapse
                            items={testcases[0].publicTestcases.map((testcase, index) => ({
                              key: `public - ${index} `,
                              label: (
                                <span className="font-semibold flex items-center gap-2">
                                  <Badge count={index + 1} style={{ backgroundColor: '#10b981' }} />
                                  Public Test {index + 1}
                                </span>
                              ),
                              children: (
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                                      <FileTextOutlined /> INPUT:
                                    </div>
                                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-700 text-sm font-mono overflow-x-auto max-h-40">
                                      {testcase.inputData}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                                      <CheckOutlined /> EXPECTED OUTPUT:
                                    </div>
                                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-green-200 dark:border-green-700 text-sm font-mono overflow-x-auto max-h-40">
                                      {testcase.expectedOutput}
                                    </pre>
                                  </div>
                                </div>
                              ),
                            }))}
                          />
                        </div>
                      )}

                      {/* Private Test Cases */}
                      {privateTestCount > 0 && (
                        <div>
                          <h4 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                            <FileTextOutlined /> Private Test Cases ({privateTestCount})
                          </h4>
                          <Collapse
                            items={testcases[0].privateTestcases.map((testcase, index) => ({
                              key: `private - ${index} `,
                              label: (
                                <span className="font-semibold flex items-center gap-2">
                                  <Badge count={index + 1} style={{ backgroundColor: '#6b7280' }} />
                                  Private Test {index + 1}
                                </span>
                              ),
                              children: (
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                                      <FileTextOutlined /> INPUT:
                                    </div>
                                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-700 text-sm font-mono overflow-x-auto max-h-40">
                                      {testcase.inputData}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                                      <CheckOutlined /> EXPECTED OUTPUT:
                                    </div>
                                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-green-200 dark:border-green-700 text-sm font-mono overflow-x-auto max-h-40">
                                      {testcase.expectedOutput}
                                    </pre>
                                  </div>
                                </div>
                              ),
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: '4',
              label: (
                <span className="flex items-center gap-2">
                  <CodeOutlined />
                  Templates ({templates.length})
                  {templates.length > 0 && <CheckCircleOutlined className="text-green-500" />}
                </span>
              ),
              children: (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Code Templates</h3>
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => onEdit(3)}
                      size="small"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>

                  {isLoadingLanguages ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-gray-500">Đang tải danh sách ngôn ngữ...</p>
                    </div>
                  ) : templates.length === 0 ? (
                    <Alert
                      message="Chưa có templates"
                      description="Cần thêm ít nhất 1 code template cho một ngôn ngữ."
                      type="error"
                      showIcon
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {templates.map((template, index) => {
                          const langName = getLanguageName(template.languageId);
                          return (
                            <Tag
                              key={index}
                              color="blue"
                              className="px-4 py-2 text-base font-semibold"
                            >
                              <span className="mr-2 text-lg">
                                {getLanguageIcon(langName)}
                              </span>
                              {langName}
                            </Tag>
                          );
                        })}
                      </div>

                      <Collapse
                        items={templates.map((template, index) => {
                          const langName = getLanguageName(template.languageId);
                          return {
                            key: index,
                            label: (
                              <span className="font-semibold flex items-center gap-2">
                                <span className="text-xl">{getLanguageIcon(langName)}</span>
                                {langName}
                              </span>
                            ),
                            children: (
                              <div className="space-y-4">
                                {template.userTemplatePrefix && (
                                  <div>
                                    <div className="text-xs font-bold text-blue-600 mb-2">PREFIX (Code trước):</div>
                                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border-2 border-blue-200 dark:border-blue-800 text-xs font-mono overflow-x-auto max-h-40">
                                      {template.userTemplatePrefix}
                                    </pre>
                                  </div>
                                )}
                                <div>
                                  <div className="text-xs font-bold text-green-600 mb-2">STUB CODE (Code mẫu) *:</div>
                                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border-2 border-green-200 dark:border-green-800 text-xs font-mono overflow-x-auto max-h-60">
                                    {template.userStubCode || <span className="text-red-500">Chưa có stub code!</span>}
                                  </pre>
                                </div>
                                {template.userTemplateSuffix && (
                                  <div>
                                    <div className="text-xs font-bold text-purple-600 mb-2">SUFFIX (Code sau):</div>
                                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded border-2 border-purple-200 dark:border-purple-800 text-xs font-mono overflow-x-auto max-h-40">
                                      {template.userTemplateSuffix}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ),
                          };
                        })}
                      />
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Final Validation Alert */}
      {isComplete ? (
        <Alert
          message="✅ Sẵn sàng tạo Practice Test"
          description="Tất cả thông tin đã đầy đủ. Bạn có thể tạo Practice Test ngay bây giờ!"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          className="shadow-lg"
        />
      ) : (
        <Alert
          message="⚠️ Chưa thể tạo Practice Test"
          description={`Còn ${validations.length - validCount} mục chưa hoàn tất.Vui lòng kiểm tra và bổ sung đầy đủ thông tin.`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="shadow-lg"
        />
      )}

      {/* Actions */}
      <div className="flex justify-between gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <Button
          onClick={onBack}
          size="large"
          icon={<ArrowLeftOutlined />}
          className="px-8"
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
          disabled={!isComplete}
          className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 px-12 shadow-xl text-lg h-12"
        >
          {isSubmitting ? "Đang tạo Practice Test..." : "Tạo Practice Test"}
        </Button>
      </div>
    </div>
  );
}
