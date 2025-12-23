'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Descriptions,
  Spin,
  Tag,
  Empty,
  Button,
  List,
  Popconfirm,
} from 'antd';
import { 
  BookOutlined, 
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { syllabusServiceAPI, SubjectDto } from 'EduSmart/api/api-syllabus-service';

interface SubjectDetailModalProps {
  open: boolean;
  subjectId?: string | null;
  subject?: SubjectDto | null; // Can receive subject directly
  onClose: () => void;
  onEdit?: (subject: SubjectDto) => void;
  onDelete?: () => void;
}

const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ 
  open, 
  subjectId,
  subject: subjectProp,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState<SubjectDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (subjectProp) {
        setSubject(subjectProp);
      } else if (subjectId) {
        fetchSubjectDetail();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subjectId, subjectProp?.subjectId]); // Use subjectProp?.subjectId to avoid infinite loop

  const fetchSubjectDetail = async () => {
    if (!subjectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await syllabusServiceAPI.getSubjectDetail(subjectId);
      
      if (response.success && response.response) {
        setSubject(response.response);
      } else {
        setError(response.message || 'Không thể tải thông tin môn học');
      }
    } catch (err) {
      console.error('Error fetching subject detail:', err);
      setError('Đã xảy ra lỗi khi tải thông tin môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject(null);
    setError(null);
    onClose();
  };

  // Get prerequisite subjects from the subject's data
  const getPrerequisiteInfo = () => {
    if (subject?.prerequisites && subject.prerequisites.length > 0) {
      return subject.prerequisites.map(s => `${s.subjectCode} - ${s.subjectName}`);
    }
    return [];
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <BookOutlined className="text-green-500" />
          <span>Chi tiết Môn học</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={
        subject ? (
          <div className="flex justify-between">
            <div>
              {onDelete && (
                <Popconfirm
                  title="Xóa môn học"
                  description="Bạn có chắc chắn muốn xóa môn học này?"
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
                  onClick={() => onEdit(subject)}
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
        ) : subject ? (
          <Descriptions 
            bordered 
            column={1} 
            className="mt-4"
            labelStyle={{ width: 150, fontWeight: 500 }}
          >
            <Descriptions.Item label="Mã môn học">
              <Tag color="green" className="text-base px-3 py-1">
                {subject.subjectCode}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên môn học">
              <span className="font-medium">{subject.subjectName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {subject.subjectDescription || (
                <span className="text-gray-400 italic">Chưa có mô tả</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Môn tiên quyết">
              {getPrerequisiteInfo().length > 0 ? (
                <List
                  size="small"
                  dataSource={getPrerequisiteInfo()}
                  renderItem={(item) => (
                    <List.Item className="!py-1">
                      <LinkOutlined className="mr-2 text-blue-500" />
                      {item}
                    </List.Item>
                  )}
                />
              ) : (
                <span className="text-gray-400 italic">Không có môn tiên quyết</span>
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

export default SubjectDetailModal;
