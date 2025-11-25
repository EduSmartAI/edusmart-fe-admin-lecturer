"use client";

import { Form, Input, Select, Button, Card } from "antd";
import { DIFFICULTY_LABELS } from "EduSmart/types/practice-test";
import type { PracticeProblem } from "EduSmart/types/practice-test";

interface ProblemInfoStepProps {
  initialData?: PracticeProblem;
  onNext: (data: PracticeProblem) => void;
  onCancel: () => void;
}

export default function ProblemInfoStep({ initialData, onNext, onCancel }: ProblemInfoStepProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: PracticeProblem) => {
    onNext(values);
  };

  return (
    <Card className="shadow-sm border-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thông tin bài toán
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Nhập tiêu đề, mô tả và chọn độ khó cho bài thực hành
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData || { difficulty: 1 }}
        autoComplete="off"
      >
        <Form.Item
          label={
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Tiêu đề bài toán
            </span>
          }
          name="title"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề" },
            { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự" },
            { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự" },
          ]}
        >
          <Input
            placeholder="VD: Two Sum, Reverse String, Binary Search..."
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Mô tả bài toán
            </span>
          }
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
          ]}
        >
          <Input.TextArea
            placeholder="Mô tả chi tiết bài toán, yêu cầu, ràng buộc..."
            rows={10}
            showCount
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Độ khó
            </span>
          }
          name="difficulty"
          rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}
        >
          <Select size="large" className="rounded-lg">
            <Select.Option value={1}>
              <span className="flex items-center gap-2">
                🟢 {DIFFICULTY_LABELS['Easy']}
              </span>
            </Select.Option>
            <Select.Option value={2}>
              <span className="flex items-center gap-2">
                🟡 {DIFFICULTY_LABELS['Medium']}
              </span>
            </Select.Option>
            <Select.Option value={3}>
              <span className="flex items-center gap-2">
                🔴 {DIFFICULTY_LABELS['Hard']}
              </span>
            </Select.Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onCancel}
            size="large"
            className="px-6"
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 px-8 shadow-lg"
          >
            Tiếp theo
          </Button>
        </div>
      </Form>
    </Card>
  );
}
