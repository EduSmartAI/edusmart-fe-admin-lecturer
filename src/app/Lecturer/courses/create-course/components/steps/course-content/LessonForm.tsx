/**
 * Lesson Form Component
 * 
 * Modal form for creating and editing course content (lessons, files, questions)
 * Handles different content types with type-specific fields
 */

'use client';

import React, { FC, useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';
import { FaVideo, FaFile, FaQuestionCircle, FaClipboardList } from 'react-icons/fa';
import StreamingVideoUploader from 'EduSmart/components/Video/StreamingVideoUploader';
import UtilityFileUpload from 'EduSmart/components/Common/FileUpload/UtilityFileUpload';
import { CourseContentItem } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

enum ContentType {
  VIDEO = 'video',
  QUIZ = 'quiz',
  QUESTION = 'question',
  FILE = 'file'
}

interface ContentTypeConfig {
  type: ContentType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  gradient: string;
  lightBg: string;
  darkBg: string;
  borderColor: string;
}

const contentTypes: ContentTypeConfig[] = [
  {
    type: ContentType.VIDEO,
    icon: FaVideo,
    title: 'Video Bài Học',
    description: 'Tải lên hoặc liên kết video bài giảng',
    color: 'bg-red-600',
    gradient: 'from-red-500 to-red-700',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  {
    type: ContentType.QUIZ,
    icon: FaClipboardList,
    title: 'Bài Kiểm Tra',
    description: 'Tạo câu hỏi trắc nghiệm và bài kiểm tra',
    color: 'bg-emerald-600',
    gradient: 'from-emerald-500 to-emerald-700',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    type: ContentType.QUESTION,
    icon: FaQuestionCircle,
    title: 'Câu Hỏi Thảo Luận',
    description: 'Thêm câu hỏi để học viên thảo luận',
    color: 'bg-blue-600',
    gradient: 'from-blue-500 to-blue-700',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    type: ContentType.FILE,
    icon: FaFile,
    title: 'Tài Liệu Học Tập',
    description: 'Tải lên tài liệu, PDF, hình ảnh',
    color: 'bg-amber-600',
    gradient: 'from-amber-500 to-amber-700',
    lightBg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800'
  }
];

interface LessonFormData {
  title: string;
  description?: string;
  duration?: number;
  url?: string;
  fileUrl?: string;
  question?: string;
}

interface LessonFormProps {
  visible: boolean;
  editingItem: CourseContentItem | null;
  selectedType: ContentType | null;
  onClose: () => void;
  onSubmit: (values: LessonFormData, contentType: ContentType) => void;
  onTypeSelect: (type: ContentType) => void;
}

export const LessonForm: FC<LessonFormProps> = ({
  visible,
  editingItem,
  selectedType,
  onClose,
  onSubmit,
  onTypeSelect,
}) => {
  const [form] = Form.useForm();
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when modal opens/closes or editing item changes
  useEffect(() => {
    if (visible && editingItem && selectedType) {
      // Populate form with editing item data
      if (selectedType === ContentType.VIDEO) {
        form.setFieldsValue({
          title: editingItem.title,
          description: editingItem.description || '',
          duration: editingItem.duration,
          url: editingItem.url || ''
        });
      } else if (selectedType === ContentType.FILE) {
        form.setFieldsValue({
          title: editingItem.title,
          description: editingItem.description || '',
          fileUrl: (editingItem.metadata as any)?.fileUrl || editingItem.url || ''
        });
        
        // Set uploaded file name
        const fileUrl = (editingItem.metadata as any)?.fileUrl || editingItem.url || '';
        if (fileUrl && typeof fileUrl === 'string') {
          const fileName = fileUrl.split('/').pop() || '';
          setUploadedFileName(fileName);
        }
      } else if (selectedType === ContentType.QUESTION) {
        form.setFieldsValue({
          title: editingItem.title,
          description: editingItem.description || '',
          question: (editingItem.metadata as any)?.question || ''
        });
      }
    } else if (visible && !editingItem) {
      form.resetFields();
      setUploadedFileName(null);
    }
  }, [visible, editingItem, selectedType, form]);

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!selectedType) return;
      onSubmit(values, selectedType);
      form.resetFields();
      setUploadedFileName(null);
    }).catch((errorInfo) => {    });
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setUploadedFileName(null);
    onClose();
  };

  // Render content type selector
  const renderTypeSelector = () => (
    <div className="p-4">
      <h3 className="text-center text-lg font-semibold mb-6">Chọn loại nội dung bạn muốn thêm</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {contentTypes.map((type, index) => {
          const IconComponent = type.icon;
          return (
            <div
              key={type.type}
              onClick={() => onTypeSelect(type.type)}
              className={`
                group relative overflow-hidden rounded-xl border-2 transition-all duration-300 h-56
                cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
                border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:${type.borderColor}
              `}
            >
              <div className="relative flex flex-col items-center justify-center h-full text-center p-6">
                <div className={`
                  inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4
                  bg-gradient-to-br ${type.gradient} text-white shadow-lg
                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                  ring-4 ring-white/20
                `}>
                  <IconComponent className="text-3xl" />
                </div>
                
                <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
                  {type.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {type.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render form content based on selected type
  const renderFormContent = () => {
    if (!selectedType) return null;

    const typeConfig = contentTypes.find(t => t.type === selectedType);
    
    console.log('🔍 [LessonForm] selectedType:', selectedType);
    console.log('🔍 [LessonForm] ContentType.FILE:', ContentType.FILE);
    console.log('🔍 [LessonForm] ContentType.QUESTION:', ContentType.QUESTION);
    console.log('🔍 [LessonForm] Should show description?', selectedType === ContentType.FILE || selectedType === ContentType.QUESTION);
    
    return (
      <Form form={form} layout="vertical">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
              bg-gradient-to-br ${typeConfig?.gradient} text-white
            `}>
              {typeConfig?.icon && <typeConfig.icon className="text-2xl" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {editingItem ? 'Chỉnh sửa' : 'Thêm'} {typeConfig?.title}
            </h3>
          </div>

          {/* Common fields */}
          <Form.Item
            name="title"
            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tiêu đề <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input 
              placeholder="Nhập tiêu đề nội dung..." 
              size="large"
            />
          </Form.Item>

          {/* Description field - only for FILE (materials) and QUESTION (discussions) */}
          {(selectedType === ContentType.FILE || selectedType === ContentType.QUESTION) && (
            <Form.Item
              name="description"
              label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</span>}
            >
              <Input.TextArea 
                placeholder="Mô tả chi tiết về nội dung này..."
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          )}

          {/* Type-specific fields */}
          {selectedType === ContentType.VIDEO && (
            <Form.Item
              name="url"
              label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Video Bài Học</span>}
              valuePropName="value"
              getValueFromEvent={(value) => value}
            >
              <StreamingVideoUploader
                placeholder="Chọn hoặc kéo thả video bài học vào đây"
                maxSizeMB={512}
                compact={true}
              />
            </Form.Item>
          )}

          {selectedType === ContentType.FILE && (
            <>
              <Form.Item
                name="fileUrl"
                label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tài liệu <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Vui lòng tải lên tài liệu!' }]}
                valuePropName="value"
                getValueFromEvent={(value) => value}
              >
                <UtilityFileUpload
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                  maxSizeMB={50}
                  buttonText="Chọn file"
                  dragger={true}
                />
              </Form.Item>
              {uploadedFileName && !isUploading && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <FaFile className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      File đã tải lên thành công:
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-green-600 dark:text-green-400 font-mono bg-green-100 dark:bg-green-800/20 px-2 py-1 rounded">
                    {uploadedFileName}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedType === ContentType.QUESTION && (
            <Form.Item
              name="question"
              label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Câu hỏi thảo luận <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
            >
              <Input.TextArea 
                placeholder="Nhập câu hỏi để học viên thảo luận..."
                rows={4}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          )}
        </div>
      </Form>
    );
  };

  return (
    <Modal
      key={`modal-${selectedType || 'none'}-${editingItem?.id || 'new'}`}
      title={editingItem ? 'Chỉnh sửa nội dung' : 'Thêm nội dung mới'}
      open={visible}
      onCancel={handleClose}
      footer={
        selectedType ? (
          <div className="flex justify-end gap-3">
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit}>
              {editingItem ? 'Cập nhật' : 'Thêm nội dung'}
            </Button>
          </div>
        ) : null
      }
      width={selectedType ? 600 : 800}
      destroyOnClose={true}
    >
      {!selectedType ? renderTypeSelector() : renderFormContent()}
    </Modal>
  );
};

export default LessonForm;
