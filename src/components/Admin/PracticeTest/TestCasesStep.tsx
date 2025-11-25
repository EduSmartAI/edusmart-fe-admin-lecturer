"use client";

import { Form, Input, Button, Card, Tabs, Empty } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { TestCases, TestCase } from "EduSmart/types/practice-test";

interface TestCasesStepProps {
  initialData: TestCases[];
  onNext: (testcases: TestCases[]) => void;
  onBack: () => void;
}

export default function TestCasesStep({ initialData, onNext, onBack }: TestCasesStepProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: { publicTestcases: TestCase[]; privateTestcases: TestCase[] }) => {
    const testcases: TestCases[] = [{
      publicTestcases: values.publicTestcases || [],
      privateTestcases: values.privateTestcases || [],
    }];
    onNext(testcases);
  };

  const initialPublic = initialData[0]?.publicTestcases || [];
  const initialPrivate = initialData[0]?.privateTestcases || [];

  const tabItems = [
    {
      key: "public",
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Public Test Cases
        </span>
      ),
      children: (
        <Form.List name="publicTestcases">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có public test case. Thêm test case cho người dùng xem."
                  className="my-8"
                />
              )}

              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  className="mb-4 border-l-4 border-l-green-500 shadow-md"
                  title={
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-bold">Public Test {index + 1}</span>
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
                    label={<span className="font-semibold">Input</span>}
                    name={[name, "inputData"]}
                    rules={[{ required: true, message: "Nhập input" }]}
                    tooltip="Nhập dữ liệu đầu vào. Mỗi dòng là một tham số (format: tên = giá trị)"
                  >
                    <Input.TextArea
                      placeholder="nums = [2,7,11,15]&#10;target = 9"
                      rows={4}
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label={<span className="font-semibold">Output</span>}
                    name={[name, "expectedOutput"]}
                    rules={[{ required: true, message: "Nhập expected output" }]}
                    tooltip="Kết quả mong đợi khi chạy với input trên"
                  >
                    <Input.TextArea
                      placeholder="[0,1]"
                      rows={3}
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </Form.Item>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                size="large"
                className="border-2 border-green-300 text-green-600 hover:border-green-400 hover:text-green-700 font-semibold"
              >
                Thêm Public Test Case
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "private",
      label: (
        <span className="flex items-center gap-2">
          <CloseCircleOutlined />
          Private Test Cases
        </span>
      ),
      children: (
        <Form.List name="privateTestcases">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có private test case. Thêm test case ẩn để chấm bài."
                  className="my-8"
                />
              )}

              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  className="mb-4 border-l-4 border-l-gray-500 shadow-md"
                  title={
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-bold">Private Test {index + 1}</span>
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
                    label="Input Data"
                    name={[name, "inputData"]}
                    rules={[{ required: true, message: "Nhập input" }]}
                  >
                    <Input.TextArea
                      placeholder="VD: [3,2,4]\n6"
                      rows={4}
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Expected Output"
                    name={[name, "expectedOutput"]}
                    rules={[{ required: true, message: "Nhập expected output" }]}
                  >
                    <Input.TextArea
                      placeholder="VD: [1,2]"
                      rows={3}
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </Form.Item>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                size="large"
                className="border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 font-semibold"
              >
                Thêm Private Test Case
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
  ];

  return (
    <Card className="shadow-sm border-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Test Cases
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Thêm public test cases (người dùng thấy) và private test cases (ẩn, dùng để chấm điểm)
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          publicTestcases: initialPublic,
          privateTestcases: initialPrivate,
        }}
        autoComplete="off"
      >
        <Tabs items={tabItems} className="mb-6" />

        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
