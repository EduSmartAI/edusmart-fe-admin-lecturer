"use client";

import { Form, Input, Button, Empty, InputNumber } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { PracticeExample } from "EduSmart/types/practice-test";

interface ExamplesStepProps {
  initialData: PracticeExample[];
  onNext: (examples: PracticeExample[]) => void;
  onBack: () => void;
}

export default function ExamplesStep({ initialData, onNext, onBack }: ExamplesStepProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: { examples: PracticeExample[] }) => {
    onNext(values.examples || []);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <BulbOutlined className="text-purple-500" />
          Ví dụ Input/Output
        </h2>
        <p className="text-gray-500">
          Thêm các ví dụ minh họa để giúp người dùng hiểu bài toán tốt hơn
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ examples: initialData.length > 0 ? initialData : [] }}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.List name="examples">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-500">Chưa có ví dụ nào. Thêm ví dụ đầu tiên để minh họa bài toán.</span>}
                  className="my-8 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                />
              )}

              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  {/* Example Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-bold text-gray-800">Ví dụ {index + 1}</span>
                    </div>
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
                    <Form.Item
                      {...restField}
                      label={<span className="text-gray-700 font-medium">Thứ tự hiển thị</span>}
                      name={[name, "exampleOrder"]}
                      rules={[{ required: true, message: "Nhập thứ tự" }]}
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        {...restField}
                        label={<span className="text-gray-700 font-medium">Input</span>}
                        name={[name, "inputData"]}
                        rules={[{ required: true, message: "Nhập input" }]}
                      >
                        <Input.TextArea
                          placeholder="VD: nums = [2,7,11,15], target = 9"
                          rows={4}
                          className="font-mono text-sm border-gray-300"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label={<span className="text-gray-700 font-medium">Output</span>}
                        name={[name, "outputData"]}
                        rules={[{ required: true, message: "Nhập output" }]}
                      >
                        <Input.TextArea
                          placeholder="VD: [0,1]"
                          rows={4}
                          className="font-mono text-sm border-gray-300"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      {...restField}
                      label={<span className="text-gray-700 font-medium">Giải thích</span>}
                      name={[name, "explanation"]}
                      rules={[{ required: true, message: "Nhập giải thích" }]}
                    >
                      <Input.TextArea
                        placeholder="Giải thích cách giải và lý do cho kết quả..."
                        rows={3}
                        className="border-gray-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              ))}

              <Button
                type="dashed"
                onClick={() => add({ exampleOrder: fields.length })}
                block
                icon={<PlusOutlined />}
                size="large"
                className="w-full border-2 border-dashed border-purple-400 text-purple-600 hover:border-purple-500 hover:text-purple-700 h-14 text-base font-semibold bg-transparent"
              >
                Thêm ví dụ mới
              </Button>
            </>
          )}
        </Form.List>

        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
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
            icon={<ArrowRightOutlined />}
            className="px-8 bg-emerald-500 border-0 hover:bg-emerald-600"
          >
            Tiếp theo
          </Button>
        </div>
      </Form>
    </div>
  );
}
