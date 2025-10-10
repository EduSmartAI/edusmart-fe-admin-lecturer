"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Upload, UploadProps, App, Progress, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { uploadToCloudinaryVideo, CloudinaryUploadResult } from 'EduSmart/utils/cloudinary';

export interface CloudinaryVideoUploadProps {
  value?: string;
  onChange?: (value?: string) => void;
  accept?: string;
  folder?: string;
  maxSizeMB?: number; // client guard
  dragger?: boolean;
}

const CloudinaryVideoUpload: React.FC<CloudinaryVideoUploadProps> = ({
  value,
  onChange,
  accept = 'video/*',
  folder,
  maxSizeMB = 1024,
  dragger = false,
}) => {
  const { message } = App.useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const beforeUpload = (file: RcFile) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      message.error('Chỉ cho phép tải video');
      return Upload.LIST_IGNORE;
    }
    const okSize = file.size / 1024 / 1024 <= maxSizeMB;
    if (!okSize) {
      message.error(`Kích thước tối đa ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      setIsUploading(true);
      setProgress(10);
      const res: CloudinaryUploadResult = await uploadToCloudinaryVideo(file as File, { folder });
      setProgress(100);
      setIsUploading(false);
      onChange?.(res.secure_url || res.url);
      if (onSuccess) onSuccess('ok');
      message.success('Tải video thành công');
    } catch (e: unknown) {
      setIsUploading(false);
      setProgress(0);
      const error = e as Error;
      message.error(error?.message || 'Tải video thất bại');
      if (onError) onError(e as any);
    }
  };

  const handleRemove = () => {
    onChange?.(undefined);
    setProgress(0);
  };

  const UploadNode = dragger ? Upload.Dragger : Upload;

  return (
    <div>
      <UploadNode
        accept={accept}
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
      >
        {dragger ? (
          <div>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Kéo & thả video vào đây hoặc bấm để chọn</p>
            <p className="ant-upload-hint">Chấp nhận video/*, tối đa {maxSizeMB}MB</p>
          </div>
        ) : (
          <Button icon={<UploadOutlined />} disabled={isUploading}>Tải video</Button>
        )}
      </UploadNode>
      {isUploading && <div style={{ marginTop: 8 }}><Progress percent={progress} /></div>}
      {value && !isUploading && (
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 8, wordBreak: 'break-all' }}>{value}</div>
          <video src={value} controls style={{ maxWidth: '100%' }} />
          <div style={{ marginTop: 8 }}>
            <Button danger onClick={handleRemove}>Xóa</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryVideoUpload;


