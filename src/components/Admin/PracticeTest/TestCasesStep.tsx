"use client";

import { Form, Input, Button, Tabs, Empty, Badge } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  UnlockOutlined,
  LockOutlined,
  ExperimentOutlined,
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

  // Watch form values for badge counts
  const publicTestcases = Form.useWatch('publicTestcases', form) || [];
  const privateTestcases = Form.useWatch('privateTestcases', form) || [];

  const tabItems = [
    {
      key: "public",
      label: (
        <span className="flex items-center gap-2 px-2">
          <UnlockOutlined className="text-green-400" />
          <span>Public Tests</span>
          <Badge
            count={publicTestcases.length}
            style={{
              backgroundColor: publicTestcases.length > 0 ? "#00b8a3" : "#6b7280",
              fontSize: "11px",
            }}
          />
        </span>
      ),
      children: (
        <Form.List name="publicTestcases">
          {(fields, { add, remove }) => (
            <div className="p-4">
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-500">Chưa có public test case. User sẽ thấy được những test này.</span>}
                  className="my-8 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fields.map(({ key, name, ...restField }, index) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-400 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-green-50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-green-700">Public Test {index + 1}</span>
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className="text-red-500 hover:text-red-600"
                      />
                    </div>
                    <div className="p-3 space-y-3">
                      <Form.Item
                        {...restField}
                        label={<span className="text-xs text-gray-500">Input</span>}
                        name={[name, "inputData"]}
                        rules={[{ required: true, message: "Nhập input" }]}
                        className="mb-0"
                      >
                        <Input.TextArea
                          placeholder="[2,7,11,15]\n9"
                          rows={3}
                          className="font-mono text-sm border-gray-300"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label={<span className="text-xs text-gray-500">Expected Output</span>}
                        name={[name, "expectedOutput"]}
                        rules={[{ required: true, message: "Nhập expected output" }]}
                        className="mb-0"
                      >
                        <Input.TextArea
                          placeholder="[0,1]"
                          rows={2}
                          className="font-mono text-sm border-gray-300"
                        />
                      </Form.Item>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                size="large"
                className="mt-4 w-full border-2 border-dashed border-green-400 text-green-600 hover:border-green-500 hover:text-green-700 h-12 font-semibold bg-transparent"
              >
                Thêm Public Test Case
              </Button>
            </div>
          )}
        </Form.List>
      ),
    },
    {
      key: "private",
      label: (
        <span className="flex items-center gap-2 px-2">
          <LockOutlined className="text-orange-400" />
          <span>Private Tests</span>
          <Badge
            count={privateTestcases.length}
            style={{
              backgroundColor: privateTestcases.length > 0 ? "#f97316" : "#6b7280",
              fontSize: "11px",
            }}
          />
        </span>
      ),
      children: (
        <Form.List name="privateTestcases">
          {(fields, { add, remove }) => (
            <div className="p-4">
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-500">Chưa có private test case. Những test này ẩn và dùng để chấm điểm.</span>}
                  className="my-8 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fields.map(({ key, name, ...restField }, index) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-400 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-orange-50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-orange-700">Private Test {index + 1}</span>
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className="text-red-500 hover:text-red-600"
                      />
                    </div>
                    <div className="p-3 space-y-3">
                      <Form.Item
                        {...restField}
                        label={<span className="text-xs text-gray-500">Input</span>}
                        name={[name, "inputData"]}
                        rules={[{ required: true, message: "Nhập input" }]}
                        className="mb-0"
                      >
                        <Input.TextArea
                          placeholder="[3,2,4]\n6"
                          rows={3}
                          className="font-mono text-sm border-gray-300"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label={<span className="text-xs text-gray-500">Expected Output</span>}
                        name={[name, "expectedOutput"]}
                        rules={[{ required: true, message: "Nhập expected output" }]}
                        className="mb-0"
                      >
                        <Input.TextArea
                          placeholder="[1,2]"
                          rows={2}
                          className="font-mono text-sm border-gray-300"
                        />
                      </Form.Item>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                size="large"
                className="mt-4 w-full border-2 border-dashed border-orange-400 text-orange-600 hover:border-orange-500 hover:text-orange-700 h-12 font-semibold bg-transparent"
              >
                Thêm Private Test Case
              </Button>
            </div>
          )}
        </Form.List>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <ExperimentOutlined className="text-green-500" />
          Test Cases
        </h2>
        <p className="text-gray-500">
          Thêm public test cases (user xem được) và private test cases (ẩn, dùng để chấm điểm)
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
        requiredMark={false}
      >
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
          <Tabs
            items={tabItems}
            className="admin-testcases-tabs"
            tabBarStyle={{
              backgroundColor: "#f9fafb",
              marginBottom: 0,
              borderBottom: "1px solid #e5e7eb",
              padding: "0 16px",
            }}
          />
        </div>

        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
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

      {/* Custom styles */}
      <style jsx global>{`
        .admin-testcases-tabs .ant-tabs-tab {
          color: #6b7280 !important;
          padding: 12px 0 !important;
        }
        .admin-testcases-tabs .ant-tabs-tab:hover {
          color: #374151 !important;
        }
        .admin-testcases-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #374151 !important;
        }
        .admin-testcases-tabs .ant-tabs-ink-bar {
          background: #10b981 !important;
        }
      `}</style>
    </div>
  );
}
