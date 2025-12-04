"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Alert,
  Typography,
  Divider,
  message,
} from "antd";
import {
  CopyOutlined,
  ForkOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useSyllabusStore } from "EduSmart/stores/Admin";
import type { Syllabus, CloneType } from "EduSmart/types/syllabus";

const { Text } = Typography;
const { Option } = Select;

interface CloneSyllabusModalProps {
  open: boolean;
  cloneType: CloneType | null;
  sourceSyllabus: Syllabus | null;
  onClose: (success?: boolean) => void;
}

export default function CloneSyllabusModal({
  open,
  cloneType,
  sourceSyllabus,
  onClose,
}: CloneSyllabusModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    allMajors,
    syllabusesLoading,
    cloneCascadeSyllabus,
    cloneFoundationSyllabus,
    fetchAllMajors,
  } = useSyllabusStore();

  // Load majors on mount
  useEffect(() => {
    if (open && allMajors.length === 0) {
      fetchAllMajors();
    }
  }, [open, allMajors.length, fetchAllMajors]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      
      // Pre-fill source version if available
      if (sourceSyllabus) {
        form.setFieldsValue({
          baseVersion: sourceSyllabus.versionLabel,
        });
        
        // Pre-fill major code for cascade
        if (cloneType === 'cascade') {
          const major = allMajors.find(m => m.majorId === sourceSyllabus.majorId);
          if (major) {
            form.setFieldsValue({
              majorCode: major.majorCode,
            });
          }
        }
      }
    }
  }, [open, sourceSyllabus, cloneType, form, allMajors]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      let success = false;

      if (cloneType === 'cascade') {
        success = await cloneCascadeSyllabus({
          cloneCascadeSyllabusDto: {
            baseVersion: values.baseVersion.toUpperCase(),
            newVersion: values.newVersion.toUpperCase(),
            majorCode: values.majorCode,
            effectiveFrom: values.effectiveRange[0].format("YYYY-MM-DD"),
            effectiveTo: values.effectiveRange[1].format("YYYY-MM-DD"),
          },
        });
      } else if (cloneType === 'foundation') {
        success = await cloneFoundationSyllabus({
          cloneFoundationSyllabusDto: {
            baseVersion: values.baseVersion.toUpperCase(),
            newVersion: values.newVersion.toUpperCase(),
            effectiveFrom: values.effectiveRange[0].format("YYYY-MM-DD"),
            effectiveTo: values.effectiveRange[1].format("YYYY-MM-DD"),
          },
        });
      }

      if (success) {
        onClose(true);
      } else {
        message.error("Clone thất bại. Vui lòng thử lại.");
      }
    } catch {
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCascade = cloneType === 'cascade';
  const isFoundation = cloneType === 'foundation';

  return (
    <Modal
      open={open}
      onCancel={() => onClose()}
      title={
        <div className="flex items-center gap-2">
          {isCascade ? (
            <CopyOutlined className="text-green-600" />
          ) : (
            <ForkOutlined className="text-purple-600" />
          )}
          <span>
            {isCascade ? "Clone Toàn bộ Syllabus" : "Clone Môn học Nền tảng"}
          </span>
        </div>
      }
      width={600}
      footer={[
        <Button key="cancel" onClick={() => onClose()}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting || syllabusesLoading}
          className={isCascade ? "bg-green-600" : "bg-purple-600"}
        >
          Clone Syllabus
        </Button>,
      ]}
    >
      {/* Info Alert */}
      <Alert
        message={
          isCascade
            ? "Sao chép nguyên vẹn syllabus cho khoá mới cùng chuyên ngành"
            : "Sao chép các môn học nền tảng (kỳ 1-4) cho chuyên ngành mới"
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-4"
      />

      {/* Use cases */}
      <div className={`p-3 rounded-lg mb-4 ${isCascade ? 'bg-green-50' : 'bg-purple-50'}`}>
        <Text strong>Ví dụ sử dụng:</Text>
        {isCascade ? (
          <ul className="list-disc list-inside mt-2 text-gray-600 text-sm">
            <li>K20 .NET Engineering → K21 .NET Engineering</li>
            <li>K20 Java Engineering → K21 Java Engineering</li>
            <li>Giữ nguyên toàn bộ môn học, chỉ đổi version</li>
          </ul>
        ) : (
          <ul className="list-disc list-inside mt-2 text-gray-600 text-sm">
            <li>Tạo chuyên ngành mới dựa trên môn nền tảng</li>
            <li>Clone các môn chung từ kỳ 1-4</li>
            <li>Sau đó thêm các môn chuyên ngành (kỳ 5+) thủ công</li>
          </ul>
        )}
      </div>

      <Divider />

      {/* Form */}
      <Form form={form} layout="vertical">
        <Form.Item
          name="baseVersion"
          label="Syllabus nguồn (Base Version)"
          rules={[{ required: true, message: "Vui lòng nhập version nguồn" }]}
          tooltip="VD: K20"
        >
          <Input
            placeholder="VD: K20"
            style={{ textTransform: 'uppercase' }}
            disabled={!!sourceSyllabus}
          />
        </Form.Item>

        <Form.Item
          name="newVersion"
          label="Version mới"
          rules={[
            { required: true, message: "Vui lòng nhập version mới" },
            { pattern: /^[A-Za-z0-9]+$/, message: "Chỉ chứa chữ và số" },
          ]}
          tooltip="VD: K21"
        >
          <Input
            placeholder="VD: K21"
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        {/* Major Code - only for Cascade */}
        {isCascade && (
          <Form.Item
            name="majorCode"
            label="Mã chuyên ngành"
            rules={[{ required: true, message: "Vui lòng chọn chuyên ngành" }]}
          >
            <Select
              placeholder="Chọn chuyên ngành"
              showSearch
              optionFilterProp="children"
            >
              {allMajors.map(major => (
                <Option key={major.majorCode} value={major.majorCode}>
                  {major.majorCode} - {major.majorName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="effectiveRange"
          label="Thời gian hiệu lực"
          rules={[{ required: true, message: "Vui lòng chọn thời gian hiệu lực" }]}
        >
          <DatePicker.RangePicker
            className="w-full"
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </Form.Item>
      </Form>

      {/* Warning for foundation */}
      {isFoundation && (
        <Alert
          message="Lưu ý"
          description="Sau khi clone nền tảng, bạn cần sử dụng tính năng 'Tạo Syllabus Mới' để thêm các môn chuyên ngành từ kỳ 5 trở đi."
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
    </Modal>
  );
}
