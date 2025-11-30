"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Select, Empty, Alert, Space, Spin, Tag, message } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { PracticeSolution } from "EduSmart/types/practice-test";
import { practiceTestAdminApi } from "EduSmart/api/api-practice-test-service";

const { TextArea } = Input;

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

interface SolutionsStepProps {
  initialData: PracticeSolution[];
  onNext: (solutions: PracticeSolution[]) => void;
  onBack: () => void;
}

export default function SolutionsStep({ initialData, onNext, onBack }: SolutionsStepProps) {
  const [form] = Form.useForm();
  const [languages, setLanguages] = useState<Array<{ languageId: number; name: string }>>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      console.error('❌ [SolutionsStep] Error:', error);
      setLoadError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData && initialData.length > 0 && languages.length > 0) {
      form.setFieldsValue({ solutions: initialData });
    }
  }, [initialData, languages, form]);

  const handleSubmit = (values: { solutions: PracticeSolution[] }) => {
    onNext(values.solutions || []);
  };

  const usedLanguages = Form.useWatch('solutions', form)?.map((s: PracticeSolution) => s?.languageId).filter(Boolean) || [];
  const availableLanguages = languages.filter(lang => !usedLanguages.includes(lang.languageId));

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
          <TrophyOutlined className="text-amber-500" />
          Lời giải mẫu (Solutions)
        </h2>
        <p className="text-gray-500">
          Thêm lời giải mẫu cho từng ngôn ngữ lập trình. Đã tải <span className="text-emerald-600 font-bold">{languages.length}</span> ngôn ngữ.
        </p>
      </div>

      {/* Info Alert */}
      <Alert
        message="Lưu ý về Solutions"
        description={
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Mỗi solution nên tương ứng với một template đã thêm ở bước trước</li>
            <li>Solution code nên là lời giải hoàn chỉnh và chính xác</li>
            <li>Hệ thống sẽ dùng solution để verify test cases</li>
          </ul>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ solutions: initialData.length > 0 ? initialData : [] }}
        autoComplete="off"
      >
        <Form.List name="solutions">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-500">Chưa có solution nào. Thêm lời giải mẫu cho các ngôn ngữ.</span>}
                  className="my-8 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                />
              )}

              {fields.map(({ key, name, ...restField }) => {
                const currentLanguageId = form.getFieldValue(['solutions', name, 'languageId']);
                const currentLanguage = languages.find(lang => lang.languageId === currentLanguageId);
                const languageName = currentLanguage?.name || 'Chọn ngôn ngữ';
                const languageIcon = currentLanguage ? getLanguageIcon(currentLanguage.name) : '💻';

                return (
                  <div
                    key={key}
                    className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    {/* Solution Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-amber-50">
                      <span className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <span className="text-2xl">{languageIcon}</span>
                        {languageName}
                        <Tag color="gold" className="ml-2">Solution</Tag>
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
                      {/* Language Select */}
                      <Form.Item
                        {...restField}
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
                          className="admin-solution-select"
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

                      {/* Solution Code */}
                      <Form.Item
                        {...restField}
                        label={
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">Solution Code</span>
                            <Tag color="green">Lời giải đúng</Tag>
                          </div>
                        }
                        name={[name, "solutionCode"]}
                        rules={[
                          { required: true, message: "Nhập solution code" },
                          { min: 10, message: "Solution code quá ngắn" },
                        ]}
                      >
                        <TextArea
                          placeholder="Nhập lời giải hoàn chỉnh cho bài toán..."
                          rows={14}
                          className="font-mono text-sm border-gray-300 bg-gray-50"
                          style={{ resize: 'vertical' }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                );
              })}

              {/* Add Solution Button */}
              {availableLanguages.length > 0 ? (
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  size="large"
                  className="w-full border-2 border-dashed border-amber-400 text-amber-600 hover:border-amber-500 hover:text-amber-700 h-16 text-lg font-semibold bg-transparent"
                  disabled={isLoadingLanguages}
                >
                  Thêm Solution ({availableLanguages.length} ngôn ngữ còn lại)
                </Button>
              ) : fields.length > 0 ? (
                <Alert
                  message="Đã thêm hết ngôn ngữ"
                  description={`Bạn đã tạo solutions cho tất cả ${languages.length} ngôn ngữ.`}
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
          <Space>
            <Button
              size="large"
              onClick={() => onNext([])}
              className="px-6 border-gray-300 text-gray-500"
            >
              Bỏ qua
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<ArrowRightOutlined />}
              className="px-8 bg-emerald-500 border-0 hover:bg-emerald-600"
            >
              Tiếp theo: Review
            </Button>
          </Space>
        </div>
      </Form>

      {/* Custom styles */}
      <style jsx global>{`
        .admin-solution-select .ant-select-selector {
          border-color: #d1d5db !important;
        }
        .admin-solution-select:hover .ant-select-selector {
          border-color: #f59e0b !important;
        }
      `}</style>
    </div>
  );
}
