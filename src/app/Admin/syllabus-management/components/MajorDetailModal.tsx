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
  Input,
  message,
} from 'antd';
import { 
  BookOutlined, 
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { syllabusServiceAPI, MajorDto } from 'EduSmart/api/api-syllabus-service';

const { TextArea } = Input;

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    if (open) {
      if (majorProp) {
        setMajor(majorProp);
        setEditedDescription(majorProp.description || '');
      } else if (majorId) {
        fetchMajorDetail();
      }
    } else {
      // Reset edit mode when modal closes
      setIsEditMode(false);
      setEditedDescription('');
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
        setEditedDescription(response.response.description || '');
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
    setIsEditMode(false);
    setEditedDescription('');
    onClose();
  };

  const handleStartEdit = () => {
    if (major) {
      setIsEditMode(true);
      setEditedDescription(major.description || '');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedDescription(major?.description || '');
  };

  const handleSaveDescription = async () => {
    if (!major) return;

    setLoading(true);
    try {
      const response = await syllabusServiceAPI.updateMajorDescription(
        major.majorId,
        editedDescription.trim()
      );

      if (response.success) {
        message.success('Cập nhật mô tả chuyên ngành thành công!');
        // Update local state
        const updatedMajor = { ...major, description: editedDescription.trim() };
        setMajor(updatedMajor);
        setIsEditMode(false);
        
        // Call onEdit callback if provided
        if (onEdit) {
          onEdit(updatedMajor);
        }
      } else {
        message.error(response.message || 'Cập nhật mô tả thất bại');
      }
    } catch (err) {
      console.error('Error updating major description:', err);
      message.error('Đã xảy ra lỗi khi cập nhật mô tả');
    } finally {
      setLoading(false);
    }
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
              {!isEditMode && onDelete && (
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
              {isEditMode ? (
                <>
                  <Button onClick={handleCancelEdit} icon={<CloseOutlined />}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={handleSaveDescription}
                    loading={loading}
                  >
                    Lưu
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleClose}>Đóng</Button>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={handleStartEdit}
                  >
                    Chỉnh sửa
                  </Button>
                </>
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
              {isEditMode ? (
                <TextArea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Nhập mô tả chuyên ngành..."
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  maxLength={500}
                  showCount
                />
              ) : (
                major.description || (
                  <span className="text-gray-400 italic">Chưa có mô tả</span>
                )
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số tín chỉ yêu cầu">
              {major.creditRequired ? (
                <Tag color="green">{major.creditRequired} tín chỉ</Tag>
              ) : (
                <span className="text-gray-400 italic">Chưa cấu hình</span>
              )}
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
