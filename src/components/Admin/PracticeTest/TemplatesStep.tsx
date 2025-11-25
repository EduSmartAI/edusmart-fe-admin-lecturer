"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Select, Empty, Tabs, Collapse, Alert, Space, Typography, Spin } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import {
  CodeTemplate,
} from "EduSmart/types/practice-test";
import { practiceTestAdminApi } from "EduSmart/api/api-practice-test-service";

const { Text } = Typography;

// Language icon mapping based on common language patterns
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
  if (lowerName.includes('r ') || lowerName.includes('r(')) return '📊';
  if (lowerName.includes('scala')) return '🔴';
  if (lowerName.includes('sql')) return '🗄️';
  return '💻';
};

interface TemplatesStepProps {
  initialData: CodeTemplate[];
  onNext: (templates: CodeTemplate[]) => void;
  onBack: () => void;
}

export default function TemplatesStep({ initialData, onNext, onBack }: TemplatesStepProps) {
  const [form] = Form.useForm();
  const [previewCode, setPreviewCode] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [languages, setLanguages] = useState<Array<{ languageId: number; name: string }>>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Load available languages from API
  useEffect(() => {
    const loadLanguages = async () => {
      console.log('🔄 [TemplatesStep] Starting to load languages...');
      setIsLoadingLanguages(true);
      try {
        console.log('📡 [TemplatesStep] Calling practiceTestAdminApi.getCodeLanguages()...');
        const response = await practiceTestAdminApi.getCodeLanguages();
        console.log('📥 [TemplatesStep] API Response:', response);
        
        if (response.success && response.response) {
          console.log('✅ [TemplatesStep] Loaded', response.response.length, 'programming languages');
          console.log('📋 [TemplatesStep] Sample languages:', response.response.slice(0, 5));
          setLanguages(response.response);
        } else {
          console.error('❌ [TemplatesStep] Failed to load languages:', response.message);
          console.error('❌ [TemplatesStep] Full response:', response);
        }
      } catch (error) {
        console.error('❌ [TemplatesStep] Error loading languages:', error);
        if (error instanceof Error) {
          console.error('❌ [TemplatesStep] Error message:', error.message);
          console.error('❌ [TemplatesStep] Error stack:', error.stack);
        }
      } finally {
        console.log('🏁 [TemplatesStep] Finished loading languages. isLoading set to false');
        setIsLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

  const handleSubmit = (values: { templates: CodeTemplate[] }) => {
    onNext(values.templates || []);
  };

  // Debug: Log languages state
  useEffect(() => {
    console.log('🎨 [TemplatesStep] Languages state updated:', {
      count: languages.length,
      isLoading: isLoadingLanguages,
      sample: languages.slice(0, 3)
    });
  }, [languages, isLoadingLanguages]);

  // Get already used languages to prevent duplicates
  const usedLanguages = Form.useWatch('templates', form)?.map((t: CodeTemplate) => t?.languageId).filter(Boolean) || [];
  
  // Get available languages (not yet used)
  const availableLanguages = languages.filter(lang => !usedLanguages.includes(lang.languageId));
  
  console.log('🔍 [TemplatesStep Render] Languages:', languages.length, '| Used:', usedLanguages.length, '| Available:', availableLanguages.length, '| isLoading:', isLoadingLanguages);

  // Generate preview of complete code
  const generatePreview = (name: number) => {
    const prefix = form.getFieldValue(['templates', name, 'userTemplatePrefix']) || '';
    const stub = form.getFieldValue(['templates', name, 'userStubCode']) || '';
    const suffix = form.getFieldValue(['templates', name, 'userTemplateSuffix']) || '';
    
    return `${prefix}\n${stub}\n${suffix}`;
  };

  // Copy example code
  const copyExample = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Show loading spinner while languages are loading
  if (isLoadingLanguages) {
    return (
      <Card className="shadow-sm border-0">
        <div className="flex flex-col items-center justify-center py-20">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách ngôn ngữ lập trình...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              <CodeOutlined className="mr-2" />
              Code Templates
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Thiết lập code templates cho {languages.length} ngôn ngữ lập trình. Mỗi ngôn ngữ chỉ có 1 template.
            </p>
          </div>
        </div>

        {/* Instructional Guide */}
        <Alert
          message="Hướng dẫn tạo Code Template"
          description={
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[120px]">1. Prefix:</span>
                <span>Code chạy TRƯỚC - imports, class/namespace declarations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-green-600 dark:text-green-400 min-w-[120px]">2. Stub Code:</span>
                <span>Code MẪU cho user - function signature + body template (REQUIRED)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-[120px]">3. Suffix:</span>
                <span>Code chạy SAU - main function, test runner</span>
              </div>
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                <Text strong>💡 Tip: </Text>
                <Text>Complete Code = Prefix + Stub Code + Suffix. Preview để xem code hoàn chỉnh!</Text>
              </div>
            </div>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          className="mb-6"
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ templates: Array.isArray(initialData) && initialData.length > 0 ? initialData : [] }}
        autoComplete="off"
      >
        <Form.List name="templates">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có template nào. Thêm code template cho ngôn ngữ lập trình."
                  className="my-8"
                />
              )}

              {fields.map(({ key, name, ...restField }, index) => {
                const currentLanguageId = form.getFieldValue(['templates', name, 'languageId']);
                const currentLanguage = languages.find(lang => lang.languageId === currentLanguageId);
                const languageName = currentLanguage?.name || 'Chọn ngôn ngữ';
                const languageIcon = currentLanguage ? getLanguageIcon(currentLanguage.name) : '💻';
                
                return (
                  <Card
                    key={key}
                    className="mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow"
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {languageIcon}
                          </div>
                          <div>
                            <div className="font-bold text-lg">Template {index + 1}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                              {languageName}
                            </div>
                          </div>
                        </div>
                        <Space>
                          <Button
                            icon={<PlayCircleOutlined />}
                            onClick={() => {
                              const preview = generatePreview(name);
                              setPreviewCode(preview);
                              setShowPreview(true);
                            }}
                            className="border-green-400 text-green-600 hover:bg-green-50"
                          >
                            Preview
                          </Button>
                          <Button
                            type="text"
                            danger
                            onClick={() => remove(name)}
                          >
                            Xóa
                          </Button>
                        </Space>
                      </div>
                    }
                  >
                    {/* Hidden field to preserve templateId for updates */}
                    <Form.Item
                      {...restField}
                      name={[name, "templateId"]}
                      hidden
                    >
                      <Input />
                    </Form.Item>

                    {/* Language Selection */}
                    <Form.Item
                      {...restField}
                      label={<span className="text-base font-semibold">Ngôn ngữ lập trình</span>}
                      name={[name, "languageId"]}
                      rules={[{ required: true, message: "Chọn ngôn ngữ" }]}
                      className="mb-6"
                    >
                      <Select
                        size="large"
                        placeholder={isLoadingLanguages ? "Đang tải ngôn ngữ..." : "Chọn ngôn ngữ lập trình..."}
                        showSearch
                        loading={isLoadingLanguages}
                        disabled={isLoadingLanguages}
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          const label = String(option?.label || '');
                          return label.toLowerCase().includes(input.toLowerCase());
                        }}
                      >
                        {languages.map((lang) => {
                          const isUsed = usedLanguages.includes(lang.languageId) && lang.languageId !== currentLanguageId;
                          return (
                            <Select.Option
                              key={lang.languageId}
                              value={lang.languageId}
                              label={lang.name}
                              disabled={isUsed}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-lg">{getLanguageIcon(lang.name)}</span>
                                <span>{lang.name}</span>
                                {isUsed && (
                                  <span className="text-xs text-red-500">(Đã sử dụng)</span>
                                )}
                              </span>
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    {/* Tabbed Code Sections */}
                    <Tabs
                      defaultActiveKey="1"
                      type="card"
                      className="template-tabs"
                      items={[
                        {
                          key: '1',
                          label: (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Prefix (Optional)
                            </span>
                          ),
                          children: (
                            <div className="space-y-3">
                              <Alert
                                message="Code chạy TRƯỚC code của user"
                                description="Imports, namespace declarations, class definitions, helper functions..."
                                type="info"
                                showIcon
                                className="mb-3"
                              />
                              
                              <Collapse
                                items={[{
                                  key: '1',
                                  label: '📋 Ví dụ - C++ (Two Sum)',
                                  children: (
                                    <div>
                                      <div className="flex justify-end mb-2">
                                        <Button
                                          size="small"
                                          icon={<CopyOutlined />}
                                          onClick={() => copyExample(`#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:`)}
                                        >
                                          Copy
                                        </Button>
                                      </div>
                                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:`}
                                      </pre>
                                    </div>
                                  )
                                }]}
                                size="small"
                                className="mb-3"
                              />

                              <Form.Item
                                {...restField}
                                name={[name, "userTemplatePrefix"]}
                                className="mb-0"
                              >
                                <Input.TextArea
                                  placeholder="// Nhập code prefix tại đây..."
                                  rows={8}
                                  className="font-mono text-sm bg-white dark:bg-gray-900 border-2"
                                />
                              </Form.Item>
                            </div>
                          ),
                        },
                        {
                          key: '2',
                          label: (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Stub Code (Required)
                            </span>
                          ),
                          children: (
                            <div className="space-y-3">
                              <Alert
                                message="Code MẪU mà user sẽ thấy và implement"
                                description="Function signature, method template với comments hướng dẫn. Đây là code user sẽ edit."
                                type="success"
                                showIcon
                                className="mb-3"
                              />
                              
                              <Collapse
                                items={[{
                                  key: '1',
                                  label: '📋 Ví dụ - C++ (Two Sum)',
                                  children: (
                                    <div>
                                      <div className="flex justify-end mb-2">
                                        <Button
                                          size="small"
                                          icon={<CopyOutlined />}
                                          onClick={() => copyExample(`    vector<int> twoSum(vector<int>& nums, int target) {\n        // TODO: Implement your solution here\n        // Return indices of two numbers that add up to target\n        \n    }`)}
                                        >
                                          Copy
                                        </Button>
                                      </div>
                                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: Implement your solution here
        // Return indices of two numbers that add up to target
        
    }`}
                                      </pre>
                                    </div>
                                  )
                                }]}
                                size="small"
                                className="mb-3"
                              />

                              <Form.Item
                                {...restField}
                                name={[name, "userStubCode"]}
                                rules={[{ required: true, message: "Stub code là bắt buộc!" }]}
                                className="mb-0"
                              >
                                <Input.TextArea
                                  placeholder="// Nhập stub code tại đây..."
                                  rows={10}
                                  className="font-mono text-sm bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800"
                                />
                              </Form.Item>
                            </div>
                          ),
                        },
                        {
                          key: '3',
                          label: (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              Suffix (Optional)
                            </span>
                          ),
                          children: (
                            <div className="space-y-3">
                              <Alert
                                message="Code chạy SAU code của user"
                                description="Main function, test runner, output formatting, cleanup code..."
                                type="warning"
                                showIcon
                                className="mb-3"
                              />
                              
                              <Collapse
                                items={[{
                                  key: '1',
                                  label: '📋 Ví dụ - C++ (Two Sum)',
                                  children: (
                                    <div>
                                      <div className="flex justify-end mb-2">
                                        <Button
                                          size="small"
                                          icon={<CopyOutlined />}
                                          onClick={() => copyExample(`};\n\nint main() {\n    Solution solution;\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    vector<int> result = solution.twoSum(nums, target);\n    \n    cout << "[" << result[0] << "," << result[1] << "]" << endl;\n    return 0;\n}`)}
                                        >
                                          Copy
                                        </Button>
                                      </div>
                                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`};

int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`}
                                      </pre>
                                    </div>
                                  )
                                }]}
                                size="small"
                                className="mb-3"
                              />

                              <Form.Item
                                {...restField}
                                name={[name, "userTemplateSuffix"]}
                                className="mb-0"
                              >
                                <Input.TextArea
                                  placeholder="// Nhập code suffix tại đây..."
                                  rows={10}
                                  className="font-mono text-sm bg-white dark:bg-gray-900 border-2"
                                />
                              </Form.Item>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </Card>
                );
              })}

              {/* Add Template Button - Only show if there are available languages */}
              {availableLanguages.length > 0 ? (
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  size="large"
                  className="border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 font-semibold"
                  disabled={isLoadingLanguages}
                  loading={isLoadingLanguages}
                >
                  Thêm Code Template ({availableLanguages.length} ngôn ngữ còn lại)
                </Button>
              ) : fields.length > 0 ? (
                <Alert
                  message="Đã thêm hết ngôn ngữ có sẵn"
                  description={`Bạn đã tạo templates cho tất cả ${languages.length} ngôn ngữ. Mỗi ngôn ngữ chỉ có thể có 1 template.`}
                  type="info"
                  showIcon
                  className="text-center"
                />
              ) : null}
            </>
          )}
        </Form.List>

        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <Button
            onClick={onBack}
            size="large"
            icon={<ArrowLeftOutlined />}
            className="px-6"
          >
            Quay lại
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 px-8 shadow-lg"
          >
            Tiếp theo
          </Button>
        </div>
      </Form>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <PlayCircleOutlined className="text-green-500 text-xl" />
                <h3 className="text-lg font-bold">Code Preview - Complete Template</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(previewCode);
                  }}
                >
                  Copy All
                </Button>
                <Button onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <Alert
                message="Complete Code = Prefix + Stub Code + Suffix"
                description="Đây là code hoàn chỉnh mà hệ thống sẽ chạy khi test solution của user."
                type="info"
                showIcon
                className="mb-4"
              />
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono overflow-x-auto border-2 border-gray-300 dark:border-gray-600">
                {previewCode || '// Preview will show here...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
