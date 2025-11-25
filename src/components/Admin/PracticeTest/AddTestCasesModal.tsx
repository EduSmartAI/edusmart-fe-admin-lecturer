"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Button, Card, Empty, Tabs, App } from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import { TestCase } from "EduSmart/types/practice-test";

interface AddTestCasesModalProps {
  problemId: string;
  visible: boolean;
  onClose: () => void;
  existingPublicCount?: number;
  existingPrivateCount?: number;
}

export default function AddTestCasesModal({
  problemId,
  visible,
  onClose,
  existingPublicCount = 0,
  existingPrivateCount = 0,
}: AddTestCasesModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();
  const { addTestCases } = usePracticeTestStore();

  const handleSubmit = async (values: { publicTestcases?: TestCase[]; privateTestcases?: TestCase[] }) => {
    const publicTests = values.publicTestcases || [];
    const privateTests = values.privateTestcases || [];

    if (publicTests.length === 0 && privateTests.length === 0) {
      message.warning("Vui lòng thêm ít nhất 1 test case");
      return;
    }

    setIsSubmitting(true);
    try {
      await addTestCases(problemId, {
        publicTestcases: publicTests,
        privateTestcases: privateTests,
      });
      const total = publicTests.length + privateTests.length;
      message.success(`Đã thêm ${total} test case mới!`);
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm test case";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const renderTestCaseList = (
    fieldName: 'publicTestcases' | 'privateTestcases',
    isPublic: boolean,
    existingCount: number
  ) => {
    const color = isPublic ? 'green' : 'gray';
    const icon = isPublic ? <CheckCircleOutlined /> : <CloseCircleOutlined />;

    return (
      <Form.List name={fieldName}>
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={`Chưa có ${isPublic ? 'public' : 'private'} test case mới`}
                className="my-6"
              />
            )}

            {fields.map(({ key, name, ...restField }, index) => (
              <Card
                key={key}
                className={`mb-4 border-l-4 border-l-${color}-500 shadow-md`}
                title={
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center`}>
                      {React.cloneElement(icon, { className: `text-${color}-600 text-lg` })}
                    </div>
                    <span className="font-bold">
                      Test {existingCount + index + 1}
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
                  label="Input Data"
                  name={[name, "inputData"]}
                  rules={[{ required: true, message: "Nhập input data" }]}
                >
                  <Input.TextArea
                    placeholder="VD: [2,7,11,15]\n9"
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
                    placeholder="VD: [0,1]"
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
              className={`border-2 border-${color}-300 text-${color}-600 hover:border-${color}-400 hover:text-${color}-700 font-semibold`}
            >
              Thêm {isPublic ? 'Public' : 'Private'} Test Case
            </Button>
          </>
        )}
      </Form.List>
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <PlusOutlined className="text-white" />
          </div>
          <span className="text-lg font-bold">Thêm Test Cases</span>
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
          <span className="inline-flex items-center gap-1">
            <CheckCircleOutlined className="text-green-500" />
            Public: <span className="font-bold text-green-600">{existingPublicCount}</span>
          </span>
          {" | "}
          <span className="inline-flex items-center gap-1">
            <CloseCircleOutlined className="text-gray-400" />
            Private: <span className="font-bold text-gray-600">{existingPrivateCount}</span>
          </span>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ publicTestcases: [], privateTestcases: [] }}
        autoComplete="off"
      >
        <Tabs
          defaultActiveKey="public"
          items={[
            {
              key: 'public',
              label: (
                <span className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-500" />
                  Public Test Cases
                </span>
              ),
              children: renderTestCaseList('publicTestcases', true, existingPublicCount),
            },
            {
              key: 'private',
              label: (
                <span className="flex items-center gap-2">
                  <CloseCircleOutlined className="text-gray-400" />
                  Private Test Cases
                </span>
              ),
              children: renderTestCaseList('privateTestcases', false, existingPrivateCount),
            },
          ]}
        />

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
            className="bg-gradient-to-r from-green-600 to-teal-600 border-0 px-6"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu Test Cases"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
