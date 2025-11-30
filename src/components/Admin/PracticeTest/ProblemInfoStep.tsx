"use client";

import { Form, Input, Select, Button } from "antd";
import {
  FileTextOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FileTextOutlined className="text-emerald-500" />
          Thông tin bài toán
        </h2>
        <p className="text-gray-500">
          Nhập tiêu đề, mô tả chi tiết và chọn độ khó cho bài thực hành
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData || { difficulty: 1 }}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">Tiêu đề bài toán</span>}
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
            className="border-gray-300 hover:border-emerald-500 focus:border-emerald-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Mô tả bài toán</span>}
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
          ]}
        >
          <Input.TextArea
            placeholder="Mô tả chi tiết bài toán, yêu cầu, ràng buộc..."
            rows={12}
            showCount
            className="border-gray-300 hover:border-emerald-500 focus:border-emerald-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Độ khó</span>}
          name="difficulty"
          rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}
        >
          <Select
            size="large"
            className="admin-difficulty-select"
          >
            <Select.Option value={1}>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00b8a3]" />
                <span style={{ color: "#00b8a3" }}>Easy</span>
              </span>
            </Select.Option>
            <Select.Option value={2}>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ffc01e]" />
                <span style={{ color: "#ffc01e" }}>Medium</span>
              </span>
            </Select.Option>
            <Select.Option value={3}>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff375f]" />
                <span style={{ color: "#ff375f" }}>Hard</span>
              </span>
            </Select.Option>
          </Select>
        </Form.Item>

        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
          <Button
            onClick={onCancel}
            size="large"
            icon={<CloseOutlined />}
            className="px-6 border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-400"
          >
            Hủy bỏ
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
        .admin-difficulty-select .ant-select-selector {
          border-color: #d1d5db !important;
        }
        .admin-difficulty-select:hover .ant-select-selector {
          border-color: #10b981 !important;
        }
      `}</style>
    </div>
  );
}
