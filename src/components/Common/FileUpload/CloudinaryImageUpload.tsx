"use client";
import React, { useMemo } from 'react';
import { Upload, UploadFile, UploadProps, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { uploadToCloudinaryImage, CloudinaryUploadResult } from 'EduSmart/utils/cloudinary';
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CloudinaryImageUploadProps {
  value?: string | UploadFile[];
  onChange?: (value: string | UploadFile[]) => void;
  maxCount?: number;
  accept?: string;
  folder?: string;
  listType?: UploadProps['listType'];
}

const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  value,
  onChange,
  accept = "image/*",
  maxCount = 1,
  folder,
  listType = "picture-card"
}) => {
  const { message } = App.useApp();
  
  const fileList: UploadFile[] = useMemo(() => {    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value) {
      const fileItem = {
        uid: '1',
        name: value.split('/').pop() || 'image',
        status: 'done' as const,
        url: value,
      };      return [fileItem];
    }    return [];
  }, [value]);

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ cho phép tải ảnh');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const res: CloudinaryUploadResult = await uploadToCloudinaryImage(file as File, { folder });
      const uploaded: UploadFile = {
        uid: (file as { uid?: string }).uid || `${Date.now()}`,
        name: (file as File).name,
        status: 'done',
        url: res.secure_url || res.url,
        thumbUrl: res.secure_url || res.url,
      };
      const next = maxCount === 1 ? [uploaded] : [...fileList, uploaded];
      const returnValue = maxCount === 1 ? (uploaded.url as string) : next;
      onChange?.(returnValue);
      if (onSuccess) onSuccess('ok');
      message.success('Tải ảnh thành công');
    } catch (e: unknown) {
      const error = e as Error;
      message.error(error?.message || 'Tải ảnh thất bại');
      if (onError) onError(e as any);
    }
  };

  const handleRemove = (file: UploadFile) => {
    if (maxCount === 1) {
      // For single file, clear the value
      onChange?.('');
    } else {
      // For multiple files, remove the specific file
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      onChange?.(newFileList);
    }
    message.success('Đã xóa ảnh');
    return true;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      accept={accept}
      listType={listType}
      maxCount={maxCount}
      fileList={fileList}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onRemove={handleRemove}
    >
      {fileList.length < maxCount && uploadButton}
    </Upload>
  );
};

export default CloudinaryImageUpload;






