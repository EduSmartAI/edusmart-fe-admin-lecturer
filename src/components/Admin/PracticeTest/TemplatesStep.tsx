"use client";

import { Form, Input, Button, Card, Select, Empty } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  CodeTemplate,
  ProgrammingLanguage,
  LANGUAGE_NAMES,
  LANGUAGE_ICONS,
} from "EduSmart/types/practice-test";

interface TemplatesStepProps {
  initialData: CodeTemplate[];
  onNext: (templates: CodeTemplate[]) => void;
  onBack: () => void;
}

export default function TemplatesStep({ initialData, onNext, onBack }: TemplatesStepProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: { templates: CodeTemplate[] }) => {
    onNext(values.templates || []);
  };

  // Get already used languages to prevent duplicates
  const usedLanguages = Form.useWatch('templates', form)?.map((t: CodeTemplate) => t?.languageId).filter(Boolean) || [];

  return (
    <Card className="shadow-sm border-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Code Templates
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Thêm code templates cho các ngôn ngữ lập trình. Mỗi ngôn ngữ chỉ có 1 template.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ templates: initialData.length > 0 ? initialData : [] }}
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
                
                return (
                  <Card
                    key={key}
                    className="mb-4 border-l-4 border-l-blue-500 shadow-md"
                    title={
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                          {currentLanguageId !== undefined ? LANGUAGE_ICONS[currentLanguageId as ProgrammingLanguage] : '💻'}
                        </div>
                        <span className="font-bold">
                          Template {index + 1}
                          {currentLanguageId !== undefined && ` - ${LANGUAGE_NAMES[currentLanguageId as ProgrammingLanguage]}`}
                        </span>
                      </div>
                    }
                    extra={
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(name)}
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Form.Item
                      {...restField}
                      label="Ngôn ngữ lập trình"
                      name={[name, "languageId"]}
                      rules={[{ required: true, message: "Chọn ngôn ngữ" }]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn ngôn ngữ..."
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          const label = String(option?.label || '');
                          return label.toLowerCase().includes(input.toLowerCase());
                        }}
                      >
                        {Object.entries(LANGUAGE_NAMES).map(([id, name]) => (
                          <Select.Option
                            key={id}
                            value={Number(id)}
                            label={name}
                            disabled={usedLanguages.includes(Number(id)) && Number(id) !== currentLanguageId}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{LANGUAGE_ICONS[Number(id) as ProgrammingLanguage]}</span>
                              <span>{name}</span>
                              {usedLanguages.includes(Number(id)) && Number(id) !== currentLanguageId && (
                                <span className="text-xs text-red-500">(Đã sử dụng)</span>
                              )}
                            </span>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Template Prefix (Code trước)"
                      name={[name, "userTemplatePrefix"]}
                      tooltip="Code được chạy trước code của user"
                    >
                      <Input.TextArea
                        placeholder="VD: class Solution:\n"
                        rows={3}
                        className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Stub Code (Code khởi đầu cho user)"
                      name={[name, "userStubCode"]}
                      rules={[{ required: true, message: "Nhập stub code" }]}
                      tooltip="Code mẫu mà user sẽ thấy và chỉnh sửa"
                    >
                      <Input.TextArea
                        placeholder="VD:     def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass"
                        rows={6}
                        className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Template Suffix (Code sau)"
                      name={[name, "userTemplateSuffix"]}
                      tooltip="Code được chạy sau code của user"
                    >
                      <Input.TextArea
                        placeholder="VD: # Test code here..."
                        rows={3}
                        className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                      />
                    </Form.Item>
                  </Card>
                );
              })}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                size="large"
                className="border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 font-semibold"
                disabled={fields.length >= Object.keys(LANGUAGE_NAMES).length}
              >
                Thêm Code Template
              </Button>
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
    </Card>
  );
}
