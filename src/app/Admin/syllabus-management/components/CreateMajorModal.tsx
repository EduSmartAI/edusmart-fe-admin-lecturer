'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { syllabusServiceAPI, CreateMajorDto } from 'EduSmart/api/api-syllabus-service';

const { TextArea } = Input;

interface CreateMajorModalProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  onSuccess?: () => void;
}

const CreateMajorModal: React.FC<CreateMajorModalProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateMajorDto) => {
    setLoading(true);
    try {
      const response = await syllabusServiceAPI.createMajor(values);
      
      if (response.success) {
        message.success(response.message || 'Tạo chuyên ngành thành công!');
        form.resetFields();
        onClose(true);
        onSuccess?.();
      } else {
        message.error(response.message || 'Tạo chuyên ngành thất bại!');
      }
    } catch (error) {
      console.error('Error creating major:', error);
      message.error('Đã xảy ra lỗi khi tạo chuyên ngành!');
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
          <PlusOutlined className="text-blue-500" />
          <span>Tạo Chuyên ngành mới</span>
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
            name="majorCode"
            label="Mã chuyên ngành"
            rules={[
              { required: true, message: 'Vui lòng nhập mã chuyên ngành' },
              { max: 20, message: 'Mã chuyên ngành không quá 20 ký tự' },
              { pattern: /^[A-Z0-9_-]+$/i, message: 'Mã chỉ chứa chữ, số, gạch ngang và gạch dưới' },
            ]}
          >
            <Input 
              placeholder="VD: AI, SE, NET, IA..." 
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                form.setFieldValue('majorCode', e.target.value.toUpperCase());
              }}
            />
          </Form.Item>

          <Form.Item
            name="majorName"
            label="Tên chuyên ngành"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chuyên ngành' },
              { max: 200, message: 'Tên chuyên ngành không quá 200 ký tự' },
            ]}
          >
            <Input placeholder="VD: Artificial Intelligence, Software Engineering..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 1000, message: 'Mô tả không quá 1000 ký tự' },
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả ngắn về chuyên ngành..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="requiredCredits"
            label="Số tín chỉ yêu cầu"
            rules={[
              { type: 'number', min: 0, max: 300, message: 'Số tín chỉ từ 0 đến 300' },
            ]}
          >
            <InputNumber 
              placeholder="VD: 120" 
              className="w-full"
              min={0}
              max={300}
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <div className="flex gap-2">
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo chuyên ngành
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateMajorModal;
