"use client";

import { Form, Input, Button, Card, Empty, InputNumber } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
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
    <Card className="shadow-sm border-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Ví dụ Input/Output
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Thêm các ví dụ minh họa để giúp người dùng hiểu bài toán
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ examples: initialData.length > 0 ? initialData : [] }}
        autoComplete="off"
      >
        <Form.List name="examples">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có ví dụ nào. Thêm ví dụ đầu tiên để minh họa bài toán."
                  className="my-8"
                />
              )}

              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  className="mb-4 border-l-4 border-l-purple-500 shadow-md"
                  title={
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-bold">Ví dụ {index + 1}</span>
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
                    label="Thứ tự"
                    name={[name, "exampleOrder"]}
                    rules={[{ required: true, message: "Nhập thứ tự" }]}
                  >
                    <InputNumber min={0} className="w-full" size="large" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Input Data"
                    name={[name, "inputData"]}
                    rules={[{ required: true, message: "Nhập input" }]}
                  >
                    <Input.TextArea
                      placeholder="VD: nums = [2,7,11,15], target = 9"
                      rows={3}
                      className="font-mono"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Output Data"
                    name={[name, "outputData"]}
                    rules={[{ required: true, message: "Nhập output" }]}
                  >
                    <Input.TextArea
                      placeholder="VD: [0,1]"
                      rows={2}
                      className="font-mono"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Giải thích"
                    name={[name, "explanation"]}
                    rules={[{ required: true, message: "Nhập giải thích" }]}
                  >
                    <Input.TextArea
                      placeholder="Giải thích cách giải và lý do..."
                      rows={3}
                    />
                  </Form.Item>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add({ exampleOrder: fields.length })}
                block
                icon={<PlusOutlined />}
                size="large"
                className="border-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:text-purple-700 font-semibold"
              >
                Thêm ví dụ
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
