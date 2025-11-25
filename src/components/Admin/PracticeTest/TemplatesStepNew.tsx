"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Select, Empty, Alert, Space, Typography, Spin, Tag, Modal } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CodeOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  CodeTemplate,
} from "EduSmart/types/practice-test";
import { practiceTestAdminApi } from "EduSmart/api/api-practice-test-service";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Placeholder marker that users will use to indicate where their code goes
const USER_CODE_PLACEHOLDER = '{{USER_CODE}}';

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

// Get example template for a language
const getExampleTemplate = (languageName: string): string => {
  const lower = languageName.toLowerCase();

  if (lower.includes('c++') || lower.includes('cpp')) {
    return `#include <iostream>
#include <vector>
using namespace std;

{{USER_CODE}}

int main() {
    // Test code here
    Solution solution;
    vector<int> result = solution.solve();
    return 0;
}`;
  }

  if (lower.includes('python')) {
    return `# Python Solution Template

{{USER_CODE}}

# Test code
if __name__ == "__main__":
    solution = Solution()
    result = solution.solve()
    print(result)`;
  }

  if (lower.includes('java')) {
    return `import java.util.*;

public class Solution {
    
    {{USER_CODE}}
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        // Test code here
    }
}`;
  }

  if (lower.includes('javascript')) {
    return `// JavaScript Solution Template

{{USER_CODE}}

// Test code
const solution = new Solution();
const result = solution.solve();
console.log(result);`;
  }

  // Default template
  return `// Write your code template here
// Use ${USER_CODE_PLACEHOLDER} to mark where users will write their solution

${USER_CODE_PLACEHOLDER}

// Add any setup or test code below`;
};

// Split template into prefix, stub, suffix based on placeholder
const splitTemplate = (fullTemplate: string): { prefix: string; stub: string; suffix: string } => {
  const lines = fullTemplate.split('\n');
  const placeholderIndex = lines.findIndex(line => line.includes(USER_CODE_PLACEHOLDER));

  if (placeholderIndex === -1) {
    // No placeholder found - treat entire content as stub code
    return {
      prefix: '',
      stub: fullTemplate,
      suffix: '',
    };
  }

  // Get the placeholder line to use as stub template
  const placeholderLine = lines[placeholderIndex];
  const stubCode = placeholderLine.replace(USER_CODE_PLACEHOLDER, '// Write your solution here');

  return {
    prefix: lines.slice(0, placeholderIndex).join('\n'),
    stub: stubCode,
    suffix: lines.slice(placeholderIndex + 1).join('\n'),
  };
};

// Combine prefix, stub, suffix back into full template
const combineTemplate = (prefix: string, stub: string, suffix: string): string => {
  const parts: string[] = [];

  if (prefix) parts.push(prefix);
  if (stub) {
    // Replace any placeholder-like text with our standard placeholder
    parts.push(USER_CODE_PLACEHOLDER);
  } else {
    parts.push(USER_CODE_PLACEHOLDER);
  }
  if (suffix) parts.push(suffix);

  return parts.join('\n');
};

interface TemplatesStepProps {
  initialData: CodeTemplate[];
  onNext: (templates: CodeTemplate[]) => void;
  onBack: () => void;
}

export default function TemplatesStepNew({ initialData, onNext, onBack }: TemplatesStepProps) {
  const [form] = Form.useForm();
  const [languages, setLanguages] = useState<Array<{ languageId: number; name: string }>>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; code: string; language: string }>({
    visible: false,
    code: '',
    language: '',
  });

  // Load available languages from API
  useEffect(() => {
    const loadLanguages = async () => {
      console.log('🔄 [TemplatesStepNew] Loading languages...');
      setIsLoadingLanguages(true);
      try {
        const response = await practiceTestAdminApi.getCodeLanguages();
        if (response.success && response.response) {
          console.log('✅ [TemplatesStepNew] Loaded', response.response.length, 'languages');
          setLanguages(response.response);
        }
      } catch (error) {
        console.error('❌ [TemplatesStepNew] Error:', error);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    loadLanguages();
  }, []);

  // Convert initial data (prefix/stub/suffix) to full template format
  // Use ref to track if we've already initialized to prevent infinite loops
  const hasInitialized = useState(false);

  useEffect(() => {
    if (initialData && initialData.length > 0 && languages.length > 0 && !hasInitialized[0]) {
      const convertedTemplates = initialData.map(template => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        templateId: (template as any).templateId,
        languageId: template.languageId,
        fullTemplate: combineTemplate(
          template.userTemplatePrefix || '',
          template.userStubCode || '',
          template.userTemplateSuffix || ''
        ),
      }));

      form.setFieldsValue({ templates: convertedTemplates });
      hasInitialized[1](true);
      console.log('🔄 [TemplatesStepNew] Converted initial data to full templates:', convertedTemplates);
    }
    // Only depend on languages length (when it changes from 0 to N)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages.length]);

  const handleSubmit = (values: { templates: Array<{ languageId: number; fullTemplate: string; templateId?: string }> }) => {
    // Convert full templates back to prefix/stub/suffix format for API
    const convertedTemplates: CodeTemplate[] = (values.templates || []).map(template => {
      const { prefix, stub, suffix } = splitTemplate(template.fullTemplate || '');

      return {
        ...(template.templateId && { templateId: template.templateId }),
        languageId: template.languageId,
        userTemplatePrefix: prefix,
        userStubCode: stub,
        userTemplateSuffix: suffix,
      } as CodeTemplate;
    });

    console.log('📤 [TemplatesStepNew] Submitting templates:', convertedTemplates);
    onNext(convertedTemplates);
  };

  const usedLanguages = Form.useWatch('templates', form)?.map((t: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (t as any)?.languageId;
  }).filter(Boolean) || [];
  const availableLanguages = languages.filter(lang => !usedLanguages.includes(lang.languageId));

  // Insert example template
  const insertExample = (fieldName: number, languageName: string) => {
    const example = getExampleTemplate(languageName);
    form.setFieldValue(['templates', fieldName, 'fullTemplate'], example);
  };

  // Show preview
  const showPreview = (fieldName: number, languageName: string) => {
    const fullTemplate = form.getFieldValue(['templates', fieldName, 'fullTemplate']) || '';
    const { prefix, stub, suffix } = splitTemplate(fullTemplate);

    const previewCode = `// ===== CODE BEFORE (Prefix) =====\n${prefix}\n\n// ===== USER CODE AREA (Stub) =====\n${stub}\n\n// ===== CODE AFTER (Suffix) =====\n${suffix}`;

    setPreviewModal({
      visible: true,
      code: previewCode,
      language: languageName,
    });
  };

  if (isLoadingLanguages) {
    return (
      <Card className="shadow-sm border-0">
        <div className="flex flex-col items-center justify-center py-20">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách ngôn ngữ...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <CodeOutlined />
          Code Templates - Simplified ✨
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Nhập code template một lần duy nhất. Sử dụng <Tag color="blue">{USER_CODE_PLACEHOLDER}</Tag> để đánh dấu vị trí user sẽ code.
        </p>
      </div>

      {/* Instructional Guide */}
      <Alert
        message={
          <span className="flex items-center gap-2">
            <ThunderboltOutlined />
            <strong>Cách tạo Template đơn giản</strong>
          </span>
        }
        description={
          <div className="space-y-3">
            <Paragraph className="mb-2">
              <strong>Bước 1:</strong> Viết code hoàn chỉnh của bạn (imports, class, main function, etc.)
            </Paragraph>
            <Paragraph className="mb-2">
              <strong>Bước 2:</strong> Đặt <Tag color="blue">{USER_CODE_PLACEHOLDER}</Tag> ở vị trí mà user sẽ viết code
            </Paragraph>
            <Paragraph className="mb-2">
              <strong>Bước 3:</strong> Hệ thống tự động chia thành <Text code>Prefix</Text> + <Text code>Stub</Text> + <Text code>Suffix</Text>
            </Paragraph>

            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <Text strong className="text-blue-700 dark:text-blue-300">💡 Ví dụ (C++):</Text>
              <pre className="mt-2 text-xs bg-white dark:bg-gray-900 p-2 rounded border">
                {`#include <vector>
using namespace std;

${USER_CODE_PLACEHOLDER}  ← User sẽ code ở đây

int main() {
    // Test code
    return 0;
}`}
              </pre>
            </div>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        className="mb-6"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ templates: [] }}
        autoComplete="off"
      >
        <Form.List name="templates">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có template. Thêm code template cho ngôn ngữ lập trình."
                  className="my-8"
                />
              )}

              {fields.map(({ key, name, ...restField }) => {
                const currentLanguageId = form.getFieldValue(['templates', name, 'languageId']);
                const currentLanguage = languages.find(lang => lang.languageId === currentLanguageId);
                const languageName = currentLanguage?.name || 'Chọn ngôn ngữ';
                const languageIcon = currentLanguage ? getLanguageIcon(currentLanguage.name) : '💻';

                return (
                  <Card
                    key={key}
                    className="mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                    title={
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold flex items-center gap-2">
                          <span className="text-2xl">{languageIcon}</span>
                          {languageName}
                        </span>
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        >
                          Xóa
                        </Button>
                      </div>
                    }
                  >
                    {/* Hidden templateId field */}
                    <Form.Item {...restField} name={[name, "templateId"]} hidden>
                      <Input />
                    </Form.Item>

                    {/* Language Select */}
                    <Form.Item
                      label={<span className="text-base font-semibold">Ngôn ngữ lập trình</span>}
                      name={[name, "languageId"]}
                      rules={[{ required: true, message: "Chọn ngôn ngữ" }]}
                      className="mb-4"
                    >
                      <Select
                        placeholder="Chọn ngôn ngữ..."
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                          String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
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
                                {isUsed && <Tag color="red">Đã dùng</Tag>}
                              </span>
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    {/* Action Buttons */}
                    {currentLanguage && (
                      <Space className="mb-4 w-full" direction="horizontal" size="small">
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => insertExample(name, currentLanguage.name)}
                          type="dashed"
                        >
                          Chèn ví dụ
                        </Button>
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => showPreview(name, currentLanguage.name)}
                          type="default"
                        >
                          Xem preview
                        </Button>
                      </Space>
                    )}

                    {/* Full Template Code Editor */}
                    <Form.Item
                      label={
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold">Complete Code Template</span>
                          <Tag color="blue">{USER_CODE_PLACEHOLDER}</Tag>
                        </div>
                      }
                      name={[name, "fullTemplate"]}
                      rules={[
                        { required: true, message: "Nhập code template" },
                        {
                          validator: (_, value) => {
                            if (value && !value.includes(USER_CODE_PLACEHOLDER)) {
                              return Promise.reject(new Error(`Template phải chứa ${USER_CODE_PLACEHOLDER} để đánh dấu vị trí user code!`));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      tooltip={`Nhập toàn bộ code template. Dùng ${USER_CODE_PLACEHOLDER} để chỉ vị trí user viết code.`}
                    >
                      <TextArea
                        placeholder={currentLanguage ? getExampleTemplate(currentLanguage.name) : `Nhập code template...\n\nVí dụ:\n#include <iostream>\nusing namespace std;\n\n${USER_CODE_PLACEHOLDER}\n\nint main() {\n    return 0;\n}`}
                        rows={20}
                        className="font-mono text-sm"
                        style={{ resize: 'vertical' }}
                      />
                    </Form.Item>
                  </Card>
                );
              })}

              {/* Add Template Button */}
              {availableLanguages.length > 0 ? (
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  size="large"
                  className="w-full border-2 border-blue-400 text-blue-600 hover:border-blue-600 hover:text-blue-700 h-16 text-lg font-semibold"
                  disabled={isLoadingLanguages}
                >
                  Thêm Code Template ({availableLanguages.length} ngôn ngữ còn lại)
                </Button>
              ) : fields.length > 0 ? (
                <Alert
                  message="Đã thêm hết ngôn ngữ"
                  description={`Bạn đã tạo templates cho tất cả ${languages.length} ngôn ngữ.`}
                  type="success"
                  showIcon
                  className="text-center"
                />
              ) : null}
            </>
          )}
        </Form.List>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
            className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Tiếp theo: Review
          </Button>
        </div>
      </Form>

      {/* Preview Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <EyeOutlined />
            Preview - {previewModal.language}
          </span>
        }
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ ...previewModal, visible: false })}
        footer={[
          <Button key="close" onClick={() => setPreviewModal({ ...previewModal, visible: false })}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 text-sm font-mono">
          {previewModal.code}
        </pre>
      </Modal>
    </Card>
  );
}

