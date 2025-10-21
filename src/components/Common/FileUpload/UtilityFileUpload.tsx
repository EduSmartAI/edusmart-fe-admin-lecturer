'use client';
import React, { useState } from 'react';
import { Upload, App, Button } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

export interface UtilityFileUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
  dragger?: boolean;
  disabled?: boolean;
}

/**
 * Component for uploading files using the Utility API
 * POST /utility/api/UploadFiles
 */
const UtilityFileUpload: React.FC<UtilityFileUploadProps> = ({
  value,
  onChange,
  accept,
  maxSizeMB = 50,
  buttonText = 'Chọn file',
  dragger = false,
  disabled = false
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Create file list from value
  React.useEffect(() => {
    if (value && typeof value === 'string') {
      const fileName = value.split('/').pop() || 'file';
      setFileList([{
        uid: '-1',
        name: fileName,
        status: 'done',
        url: value
      }]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const beforeUpload = (file: RcFile) => {
    const isValidSize = file.size / 1024 / 1024 < maxSizeMB;
    if (!isValidSize) {
      message.error(`File không được vượt quá ${maxSizeMB}MB!`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      setUploading(true);
      const rcFile = file as RcFile;
      // Show upload progress
      onProgress?.({ percent: 10 });
      message.loading({ content: 'Đang tải lên file...', key: 'utility-upload', duration: 0 });

      // Upload using the Utility API
      const fileUrl = await courseServiceAPI.uploadDocuments(rcFile);      
      // Update progress
      onProgress?.({ percent: 100 });
      
      // Update file list
      setFileList([{
        uid: rcFile.uid,
        name: rcFile.name,
        status: 'done',
        url: fileUrl
      }]);

      // Call onChange with the file URL
      onChange?.(fileUrl);
      
      message.success({ content: 'Tải lên file thành công!', key: 'utility-upload' });
      onSuccess?.(fileUrl);
      
    } catch (error) {
      message.error({ 
        content: `Lỗi tải lên: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        key: 'utility-upload' 
      });
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    onChange?.('');
  };

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload,
    customRequest,
    onRemove: handleRemove,
    maxCount: 1,
    accept,
    disabled: disabled || uploading
  };

  if (dragger) {
    return (
      <Upload.Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{buttonText}</p>
        <p className="ant-upload-hint">
          Kéo thả file vào đây hoặc click để chọn
        </p>
        {maxSizeMB && (
          <p className="ant-upload-hint text-xs text-gray-500">
            Kích thước tối đa: {maxSizeMB}MB
          </p>
        )}
      </Upload.Dragger>
    );
  }

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
        {buttonText}
      </Button>
    </Upload>
  );
};

export default UtilityFileUpload;
