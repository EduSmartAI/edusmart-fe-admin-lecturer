'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Descriptions,
  Spin,
  Tag,
  Empty,
  Button,
  Popconfirm,
} from 'antd';
import { 
  BookOutlined, 
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { syllabusServiceAPI, MajorDto } from 'EduSmart/api/api-syllabus-service';

interface MajorDetailModalProps {
  open: boolean;
  majorId?: string | null;
  major?: MajorDto | null; // Can receive major directly
  onClose: () => void;
  onEdit?: (major: MajorDto) => void;
  onDelete?: () => void;
}

const MajorDetailModal: React.FC<MajorDetailModalProps> = ({ 
  open, 
  majorId,
  major: majorProp,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [major, setMajor] = useState<MajorDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (majorProp) {
        setMajor(majorProp);
      } else if (majorId) {
        fetchMajorDetail();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, majorId, majorProp?.majorId]); // Use majorProp?.majorId to avoid infinite loop

  const fetchMajorDetail = async () => {
    if (!majorId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await syllabusServiceAPI.getMajorDetail(majorId);
      
      if (response.success && response.response) {
        setMajor(response.response);
      } else {
        setError(response.message || 'Không thể tải thông tin chuyên ngành');
      }
    } catch (err) {
      console.error('Error fetching major detail:', err);
      setError('Đã xảy ra lỗi khi tải thông tin chuyên ngành');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMajor(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <BookOutlined className="text-blue-500" />
          <span>Chi tiết Chuyên ngành</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={
        major ? (
          <div className="flex justify-between">
            <div>
              {onDelete && (
                <Popconfirm
                  title="Xóa chuyên ngành"
                  description="Bạn có chắc chắn muốn xóa chuyên ngành này?"
                  onConfirm={onDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleClose}>Đóng</Button>
              {onEdit && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => onEdit(major)}
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        ) : null
      }
      width={600}
    >
      <Spin spinning={loading}>
        {error ? (
          <Empty 
            description={error}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : major ? (
          <Descriptions 
            bordered 
            column={1} 
            className="mt-4"
            labelStyle={{ width: 150, fontWeight: 500 }}
          >
            <Descriptions.Item label="Mã chuyên ngành">
              <Tag color="blue" className="text-base px-3 py-1">
                {major.majorCode}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên chuyên ngành">
              <span className="font-medium">{major.majorName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {major.description || (
                <span className="text-gray-400 italic">Chưa có mô tả</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số tín chỉ yêu cầu">
              {major.creditRequired ? (
                <Tag color="green">{major.creditRequired} tín chỉ</Tag>
              ) : (
                <span className="text-gray-400 italic">Chưa cấu hình</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="ID">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {major.majorId}
              </code>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="flex items-center justify-center py-8">
            <InfoCircleOutlined className="text-4xl text-gray-300" />
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default MajorDetailModal;
