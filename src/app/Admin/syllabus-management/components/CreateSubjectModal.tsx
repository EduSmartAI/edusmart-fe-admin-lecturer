'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Spin,
  Select,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { syllabusServiceAPI, CreateSubjectDto, SubjectDto } from 'EduSmart/api/api-syllabus-service';

const { TextArea } = Input;

interface CreateSubjectModalProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  onSuccess?: () => void;
  existingSubjects?: SubjectDto[];
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({ 
  open, 
  onClose,
  onSuccess,
  existingSubjects = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Load subjects for prerequisite selection
  useEffect(() => {
    if (open) {
      if (existingSubjects && existingSubjects.length > 0) {
        setSubjects(existingSubjects);
      } else {
        loadSubjects();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Remove existingSubjects from deps to avoid infinite loop

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await syllabusServiceAPI.getAllSubjects(1, 200);
      if (response.success && response.response?.items) {
        setSubjects(response.response.items);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async (values: CreateSubjectDto) => {
    setLoading(true);
    try {
      const response = await syllabusServiceAPI.createSubject(values);
      
      if (response.success) {
        message.success(response.message || 'Tạo môn học thành công!');
        form.resetFields();
        onClose(true);
        onSuccess?.();
      } else {
        message.error(response.message || 'Tạo môn học thất bại!');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      message.error('Đã xảy ra lỗi khi tạo môn học!');
    } finally {
      setLoading(false);
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
          <PlusOutlined className="text-green-500" />
          <span>Tạo Môn học mới</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="subjectCode"
            label="Mã môn học"
            rules={[
              { required: true, message: 'Vui lòng nhập mã môn học' },
              { max: 20, message: 'Mã môn học không quá 20 ký tự' },
              { pattern: /^[A-Z0-9_-]+$/i, message: 'Mã chỉ chứa chữ, số, gạch ngang và gạch dưới' },
            ]}
          >
            <Input 
              placeholder="VD: PRF192, MAE101, DBI202..." 
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                form.setFieldValue('subjectCode', e.target.value.toUpperCase());
              }}
            />
          </Form.Item>

          <Form.Item
            name="subjectName"
            label="Tên môn học"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học' },
              { max: 200, message: 'Tên môn học không quá 200 ký tự' },
            ]}
          >
            <Input placeholder="VD: Programming Fundamentals, Database Introduction..." />
          </Form.Item>

          <Form.Item
            name="subjectDescription"
            label="Mô tả môn học"
            rules={[
              { max: 1000, message: 'Mô tả không quá 1000 ký tự' },
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả ngắn về môn học, nội dung, mục tiêu..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="prerequisiteSubjectIds"
            label="Môn học tiên quyết"
            tooltip="Chọn các môn học sinh viên cần hoàn thành trước khi đăng ký môn này"
          >
            <Select
              mode="multiple"
              placeholder="Chọn môn học tiên quyết (nếu có)..."
              loading={loadingSubjects}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={subjects.map(subject => ({
                value: subject.subjectId,
                label: `${subject.subjectCode} - ${subject.subjectName}`,
              }))}
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <div className="flex gap-2">
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo môn học
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateSubjectModal;
