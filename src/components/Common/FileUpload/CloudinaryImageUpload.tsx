"use client";
import React, { useMemo } from 'react';
import { Upload, UploadFile, UploadProps, message } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { uploadToCloudinaryImage, CloudinaryUploadResult } from 'EduSmart/utils/cloudinary';

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
  maxCount = 1,
  accept = 'image/*',
  folder,
  listType = 'picture-card',
}) => {
  const fileList: UploadFile[] = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value) {
      return [
        {
          uid: '1',
          name: value.split('/').pop() || 'image',
          status: 'done',
          url: value,
        },
      ];
    }
    return [];
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
        uid: (file as any).uid || `${Date.now()}`,
        name: (file as File).name,
        status: 'done',
        url: res.secure_url || res.url,
        thumbUrl: res.secure_url || res.url,
      };
      const next = maxCount === 1 ? [uploaded] : [...fileList, uploaded];
      onChange?.(maxCount === 1 ? (uploaded.url as string) : next);
      onSuccess && onSuccess('ok');
      message.success('Tải ảnh thành công');
    } catch (e: any) {
      message.error(e?.message || 'Tải ảnh thất bại');
      onError && onError(e);
    }
  };

  return (
    <Upload
      accept={accept}
      listType={listType}
      maxCount={maxCount}
      fileList={fileList}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
    >
      {fileList.length < maxCount && <div>+ Upload</div>}
    </Upload>
  );
};

export default CloudinaryImageUpload;



