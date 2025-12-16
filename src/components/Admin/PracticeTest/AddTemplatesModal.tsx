"use client";

import { useState } from "react";
import { Modal, Form, Select, Button, Card, Empty, message, Tag } from "antd";
import { PlusOutlined, MinusCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import CodeEditor from "EduSmart/components/Common/CodeEditor";
import {
  CodeTemplate,
  ProgrammingLanguage,
  LANGUAGE_NAMES,
  LANGUAGE_ICONS,
} from "EduSmart/types/practice-test";

const USER_CODE_PLACEHOLDER = "{{USER_CODE}}";

const getMonacoLanguageById = (languageId?: number): string => {
  switch (languageId) {
    case ProgrammingLanguage.TYPESCRIPT:
      return "typescript";
    case ProgrammingLanguage.JAVASCRIPT:
      return "javascript";
    case ProgrammingLanguage.PYTHON:
      return "python";
    case ProgrammingLanguage.JAVA:
      return "java";
    case ProgrammingLanguage.CSHARP:
      return "csharp";
    case ProgrammingLanguage.CPP:
      return "cpp";
    case ProgrammingLanguage.GO:
      return "go";
    case ProgrammingLanguage.PHP:
      return "php";
    case ProgrammingLanguage.RUBY:
      return "ruby";
    case ProgrammingLanguage.SWIFT:
      return "swift";
    case ProgrammingLanguage.KOTLIN:
      return "kotlin";
    default:
      return "plaintext";
  }
};

const splitTemplate = (fullTemplate: string): { prefix: string; stub: string; suffix: string } => {
  const lines = (fullTemplate || "").split("\n");
  const placeholderIndex = lines.findIndex((line) => line.includes(USER_CODE_PLACEHOLDER));

  if (placeholderIndex === -1) {
    return {
      prefix: "",
      stub: fullTemplate || "",
      suffix: "",
    };
  }

  const placeholderLine = lines[placeholderIndex];
  const stubCode = placeholderLine.replace(USER_CODE_PLACEHOLDER, "// Write your solution here");

  return {
    prefix: lines.slice(0, placeholderIndex).join("\n"),
    stub: stubCode,
    suffix: lines.slice(placeholderIndex + 1).join("\n"),
  };
};

interface AddTemplatesModalProps {
  problemId: string;
  visible: boolean;
  onClose: () => void;
  existingLanguageIds?: number[];
}

export default function AddTemplatesModal({
  problemId,
  visible,
  onClose,
  existingLanguageIds = [],
}: AddTemplatesModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTemplates } = usePracticeTestStore();

  const safeExistingLanguageIds = (existingLanguageIds || []).filter(
    (id): id is number => typeof id === "number" && Number.isFinite(id)
  );

  const handleSubmit = async (values: { templates: Array<{ languageId: number; fullTemplate: string }> }) => {
    if (!values.templates || values.templates.length === 0) {
      message.warning("Vui lòng thêm ít nhất 1 template");
      return;
    }

    const templatesPayload: CodeTemplate[] = values.templates
      .filter((t) => t && typeof t.languageId === "number")
      .map((t) => {
        const { prefix, stub, suffix } = splitTemplate(t.fullTemplate || "");
        return {
          languageId: t.languageId as unknown as ProgrammingLanguage,
          userTemplatePrefix: prefix,
          userStubCode: stub,
          userTemplateSuffix: suffix,
        };
      });

    if (templatesPayload.length === 0) {
      message.warning("Vui lòng thêm ít nhất 1 template");
      return;
    }

    setIsSubmitting(true);
    try {
      await addTemplates(problemId, { templates: templatesPayload });
      message.success(`Đã thêm ${templatesPayload.length} template mới!`);
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm template";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Get newly selected languages to prevent duplicates within the form
  const selectedLanguages: number[] = (Form.useWatch("templates", form) || [])
    .map((t: CodeTemplate | undefined | null) => t?.languageId)
    .filter((id: number | undefined): id is number => typeof id === "number" && Number.isFinite(id));

  // Available languages = all languages - existing - already selected in form
  const availableLanguages = Object.keys(LANGUAGE_NAMES)
    .map(Number)
    .filter(id => !safeExistingLanguageIds.includes(id));

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <PlusOutlined className="text-white" />
          </div>
          <span className="text-lg font-bold">Thêm Code Template</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Đã có: <span className="font-bold text-blue-600">{existingLanguageIds.length}</span> ngôn ngữ
          {" | "}
          Còn lại: <span className="font-bold text-green-600">{availableLanguages.length}</span> ngôn ngữ
        </p>
        {existingLanguageIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {safeExistingLanguageIds.map(id => (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
              >
                <span>{LANGUAGE_ICONS[id as ProgrammingLanguage]}</span>
                <span>{LANGUAGE_NAMES[id as ProgrammingLanguage]}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {availableLanguages.length === 0 ? (
        <Empty
          description="Đã có template cho tất cả các ngôn ngữ"
          className="my-8"
        />
      ) : (
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
                    description="Chưa có template mới. Thêm template bên dưới."
                    className="my-6"
                  />
                )}

                {fields.map(({ key, name, ...restField }, index) => {
                  const currentLanguageId = form.getFieldValue(['templates', name, 'languageId']);
                  const monacoLanguage = getMonacoLanguageById(
                    typeof currentLanguageId === "number" ? currentLanguageId : undefined
                  );

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
                          icon={<MinusCircleOutlined />}
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
                          {Object.entries(LANGUAGE_NAMES).map(([id, name]) => {
                            const langId = Number(id);
                            const isExisting = safeExistingLanguageIds.includes(langId);
                            const isSelected = selectedLanguages.includes(langId) && langId !== currentLanguageId;
                            const isDisabled = isExisting || isSelected;

                            return (
                              <Select.Option
                                key={id}
                                value={langId}
                                label={name}
                                disabled={isDisabled}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">{LANGUAGE_ICONS[langId as ProgrammingLanguage]}</span>
                                  <span>{name}</span>
                                  {isExisting && (
                                    <span className="text-xs text-red-500">(Đã có sẵn)</span>
                                  )}
                                  {isSelected && (
                                    <span className="text-xs text-orange-500">(Đã chọn)</span>
                                  )}
                                </span>
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label={
                          <span>
                            Code Template (1 khối)
                            <Tag color="blue" className="ml-2">
                              {USER_CODE_PLACEHOLDER}
                            </Tag>
                          </span>
                        }
                        name={[name, "fullTemplate"]}
                        tooltip={`Nhập toàn bộ code template. Dùng ${USER_CODE_PLACEHOLDER} để đánh dấu vị trí user sẽ viết code.`}
                        rules={[
                          { required: true, message: "Nhập code template" },
                          {
                            validator: async (_, value) => {
                              const v = String(value || "");
                              if (!v.includes(USER_CODE_PLACEHOLDER)) {
                                return Promise.reject(
                                  new Error(`Template phải chứa ${USER_CODE_PLACEHOLDER} để đánh dấu vị trí user code!`)
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        valuePropName="value"
                        getValueFromEvent={(v) => v}
                      >
                        <CodeEditor
                          language={monacoLanguage}
                          height={420}
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
                  disabled={fields.length >= availableLanguages.length}
                >
                  Thêm Code Template
                </Button>
              </>
            )}
          </Form.List>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              loading={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 px-6"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Template"}
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}
