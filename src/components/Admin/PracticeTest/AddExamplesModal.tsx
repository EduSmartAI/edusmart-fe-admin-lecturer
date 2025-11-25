"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, Card, Empty, InputNumber, App } from "antd";
import { PlusOutlined, MinusCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import { PracticeExample } from "EduSmart/types/practice-test";

interface AddExamplesModalProps {
  problemId: string;
  visible: boolean;
  onClose: () => void;
  existingExampleCount?: number;
}

export default function AddExamplesModal({
  problemId,
  visible,
  onClose,
  existingExampleCount = 0,
}: AddExamplesModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();
  const { addExamples } = usePracticeTestStore();

  const handleSubmit = async (values: { examples: PracticeExample[] }) => {
    if (!values.examples || values.examples.length === 0) {
      message.warning("Vui lòng thêm ít nhất 1 ví dụ");
      return;
    }

    setIsSubmitting(true);
    try {
      await addExamples(problemId, { examples: values.examples });
      message.success(`Đã thêm ${values.examples.length} ví dụ mới!`);
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm ví dụ";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <PlusOutlined className="text-white" />
          </div>
          <span className="text-lg font-bold">Thêm Ví Dụ Mới</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Hiện tại: <span className="font-bold text-purple-600">{existingExampleCount}</span> ví dụ
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ examples: [] }}
        autoComplete="off"
      >
        <Form.List name="examples">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có ví dụ nào. Thêm ví dụ mới bên dưới."
                  className="my-6"
                />
              )}

              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  className="mb-4 border-l-4 border-l-purple-500 shadow-md"
                  title={
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {existingExampleCount + index + 1}
                      </div>
                      <span className="font-bold">Ví dụ mới {index + 1}</span>
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
                    label="Thứ tự ví dụ"
                    name={[name, "exampleOrder"]}
                    initialValue={existingExampleCount + index + 1}
                    rules={[
                      { required: true, message: "Nhập thứ tự" },
                      { type: "number", min: 1, message: "Thứ tự phải >= 1" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      className="w-full"
                      placeholder="1, 2, 3..."
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Input Data"
                    name={[name, "inputData"]}
                    rules={[{ required: true, message: "Nhập input data" }]}
                  >
                    <Input.TextArea
                      placeholder="VD: nums = [2,7,11,15], target = 9"
                      rows={3}
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Output Data"
                    name={[name, "outputData"]}
                    rules={[{ required: true, message: "Nhập output data" }]}
                  >
                    <Input.TextArea
                      placeholder="VD: [0,1]"
                      rows={2}
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Giải thích (optional)"
                    name={[name, "explanation"]}
                  >
                    <Input.TextArea
                      placeholder="Giải thích cách giải..."
                      rows={3}
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
                className="border-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:text-purple-700 font-semibold"
              >
                Thêm Ví Dụ
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
            className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 px-6"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu Ví Dụ"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
