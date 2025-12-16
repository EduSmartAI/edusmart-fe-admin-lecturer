"use client";

import { useState, useEffect, useRef } from "react";
import { Form, Button, Select, Empty, Alert, Space, Spin, Tag, Modal, message, Input } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CodeOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  CodeTemplate,
} from "EduSmart/types/practice-test";
import { practiceTestAdminApi } from "EduSmart/api/api-practice-test-service";
import CodeEditor from "EduSmart/components/Common/CodeEditor";

// Placeholder marker that users will use to indicate where their code goes
const USER_CODE_PLACEHOLDER = '{{USER_CODE}}';

const getMonacoLanguage = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('typescript')) return 'typescript';
  if (lower.includes('javascript') || lower.includes('node')) return 'javascript';
  if (lower.includes('python')) return 'python';
  if (lower.includes('java') && !lower.includes('javascript')) return 'java';
  if (lower.includes('c#') || lower.includes('csharp')) return 'csharp';
  if (lower.includes('c++') || lower.includes('cpp')) return 'cpp';
  if (lower === 'c' || lower.startsWith('c ')) return 'c';
  if (lower.includes('go')) return 'go';
  if (lower.includes('php')) return 'php';
  if (lower.includes('ruby')) return 'ruby';
  if (lower.includes('swift')) return 'swift';
  if (lower.includes('kotlin')) return 'kotlin';
  return 'plaintext';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; code: string; language: string }>({
    visible: false,
    code: '',
    language: '',
  });

  // Load available languages from API
  const loadLanguages = async () => {
    setIsLoadingLanguages(true);
    setLoadError(null);
    try {
      const response = await practiceTestAdminApi.getCodeLanguages();
      if (response.success && response.response) {
        setLanguages(response.response);
        message.success(`Đã tải ${response.response.length} ngôn ngữ lập trình`);
      } else {
        setLoadError(response.message || 'Không thể tải danh sách ngôn ngữ');
      }
    } catch (error) {
      console.error('❌ [TemplatesStepNew] Error:', error);
      setLoadError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  // Convert initial data (prefix/stub/suffix) to full template format
  useEffect(() => {
    if (initialData && initialData.length > 0 && languages.length > 0 && !hasInitializedRef.current) {
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
      hasInitializedRef.current = true;
    }
  }, [languages.length, initialData, form]);

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
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải danh sách ngôn ngữ lập trình...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8">
        <Alert
          message="Không thể tải ngôn ngữ"
          description={
            <div className="space-y-3">
              <p>{loadError}</p>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadLanguages}
                type="primary"
                className="bg-emerald-500 border-0"
              >
                Thử lại
              </Button>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <CodeOutlined className="text-emerald-500" />
          Code Templates
        </h2>
        <p className="text-gray-500">
          Đã tải <span className="text-emerald-600 font-bold">{languages.length}</span> ngôn ngữ. 
          Sử dụng <Tag color="blue" className="mx-1">{USER_CODE_PLACEHOLDER}</Tag> để đánh dấu vị trí user sẽ code.
        </p>
      </div>

      {/* Instructional Guide */}
      <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <ThunderboltOutlined className="text-amber-500" />
          <span className="text-gray-800 font-semibold">Hướng dẫn nhanh</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-gray-600">Chọn ngôn ngữ lập trình</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-gray-600">Viết code hoàn chỉnh với <code className="text-emerald-600">{`{{USER_CODE}}`}</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-gray-600">Hệ thống tự chia thành Prefix/Stub/Suffix</span>
          </div>
        </div>
      </div>

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
                  description={<span className="text-gray-500">Chưa có template. Thêm code template cho ngôn ngữ lập trình.</span>}
                  className="my-8 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                />
              )}

              {fields.map(({ key, name, ...restField }) => {
                const currentLanguageId = form.getFieldValue(['templates', name, 'languageId']);
                const currentLanguage = languages.find(lang => lang.languageId === currentLanguageId);
                const languageName = currentLanguage?.name || 'Chọn ngôn ngữ';
                const languageIcon = currentLanguage ? getLanguageIcon(currentLanguage.name) : '💻';

                return (
                  <div
                    key={key}
                    className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    {/* Template Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <span className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <span className="text-2xl">{languageIcon}</span>
                        {languageName}
                      </span>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className="border-red-300 text-red-500 hover:bg-red-50"
                      >
                        Xóa
                      </Button>
                    </div>

                    <div className="p-4">
                      {/* Hidden templateId field */}
                      <Form.Item {...restField} name={[name, "templateId"]} hidden>
                        <Input />
                      </Form.Item>

                      {/* Language Select */}
                      <Form.Item
                        label={<span className="text-gray-700 font-medium">Ngôn ngữ lập trình</span>}
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
                          className="admin-lang-select"
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
                            className="border-gray-300 text-gray-600 hover:text-emerald-600 hover:border-emerald-500"
                          >
                            Chèn ví dụ
                          </Button>
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => showPreview(name, currentLanguage.name)}
                            className="border-gray-300 text-gray-600 hover:text-emerald-600 hover:border-emerald-500"
                          >
                            Xem preview
                          </Button>
                        </Space>
                      )}

                      {/* Full Template Code Editor */}
                      <Form.Item
                        label={
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">Complete Code Template</span>
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
                        <Form.Item
                          noStyle
                          name={[name, "fullTemplate"]}
                          valuePropName="value"
                          trigger="onChange"
                          getValueFromEvent={(v) => v}
                        >
                          <CodeEditor
                            language={currentLanguage ? getMonacoLanguage(currentLanguage.name) : 'plaintext'}
                            height={360}
                            className="bg-white"
                          />
                        </Form.Item>
                      </Form.Item>
                    </div>
                  </div>
                );
              })}

              {/* Add Template Button */}
              {availableLanguages.length > 0 ? (
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  size="large"
                  className="w-full border-2 border-dashed border-emerald-400 text-emerald-600 hover:border-emerald-500 hover:text-emerald-700 h-16 text-lg font-semibold bg-transparent"
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
        <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={onBack}
            size="large"
            icon={<ArrowLeftOutlined />}
            className="px-6 border-gray-300 text-gray-600 hover:text-emerald-600 hover:border-emerald-500"
          >
            Quay lại
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            className="px-8 bg-emerald-500 border-0 hover:bg-emerald-600"
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
        <CodeEditor
          value={previewModal.code}
          onChange={() => {}}
          readOnly
          language={getMonacoLanguage(previewModal.language || 'plaintext')}
          height={420}
        />
      </Modal>

      {/* Custom styles */}
      <style jsx global>{`
        .admin-lang-select .ant-select-selector {
          border-color: #d1d5db !important;
        }
        .admin-lang-select:hover .ant-select-selector {
          border-color: #10b981 !important;
        }
      `}</style>
    </div>
  );
}

