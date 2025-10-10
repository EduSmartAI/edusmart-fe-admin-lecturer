/**
 * Video Uploader Component
 * 
 * Standalone component for video upload with progress tracking
 * Can be used independently or within forms
 */

'use client';

import React, { FC, useState, useCallback } from 'react';
import { Upload, Progress, Button, message } from 'antd';
import { FaCloudUploadAlt, FaVideo, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useContentUpload } from './hooks/useContentUpload';

const { Dragger } = Upload;

interface VideoUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  maxSizeMB?: number;
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
}

export const VideoUploader: FC<VideoUploaderProps> = ({
  value,
  onChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 512,
  placeholder = 'Kéo thả video vào đây hoặc click để chọn',
  compact = false,
  disabled = false,
}) => {
  const {
    uploadProgress,
    uploadedFileName,
    isUploading,
    handleVideoUpload,
    resetUpload,
  } = useContentUpload();

  const [videoUrl, setVideoUrl] = useState<string>(value || '');

  // Handle file selection
  const handleFileChange = useCallback(async (file: File) => {
    // Validate file type
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      message.error('Vui lòng chỉ upload file video!');
      return false;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(`Kích thước file không được vượt quá ${maxSizeMB}MB!`);
      return false;
    }

    onUploadStart?.();

    try {
      const url = await handleVideoUpload(file);
      if (url) {
        setVideoUrl(url);
        onChange?.(url);
        onUploadComplete?.(url);
        message.success('Upload video thành công!');
      }
    } catch (error) {
      const err = error as Error;
      onUploadError?.(err);
      message.error('Upload video thất bại: ' + err.message);
    }

    return false; // Prevent default upload behavior
  }, [handleVideoUpload, onChange, onUploadStart, onUploadComplete, onUploadError, maxSizeMB]);

  // Handle remove video
  const handleRemove = useCallback(() => {
    setVideoUrl('');
    resetUpload();
    onChange?.('');
  }, [resetUpload, onChange]);

  // Render upload progress
  if (isUploading) {
    return (
      <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
        <div className="text-center">
          <FaVideo className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Đang tải video lên...
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {uploadedFileName || 'Vui lòng đợi...'}
          </p>
          <Progress 
            percent={uploadProgress.percent} 
            status="active"
            strokeColor={{
              '0%': '#1890ff',
              '100%': '#52c41a',
            }}
          />
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Đừng tắt trang này trong khi upload đang diễn ra
          </p>
        </div>
      </div>
    );
  }

  // Render uploaded video
  if (videoUrl || value) {
    const displayUrl = videoUrl || value;
    return (
      <div className="border-2 border-solid border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <FaCheckCircle className="text-white text-xl" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
              Video đã upload thành công
            </h4>
            <p className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-100 dark:bg-green-800/20 px-2 py-1 rounded truncate">
              {uploadedFileName || displayUrl?.split('/').pop() || 'video.mp4'}
            </p>
            {displayUrl && (
              <div className="mt-3">
                <video 
                  src={displayUrl} 
                  controls 
                  className="w-full rounded-lg max-h-64"
                  preload="metadata"
                >
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            )}
          </div>
          {!disabled && (
            <Button 
              type="text" 
              danger 
              icon={<FaTimes />}
              onClick={handleRemove}
              className="flex-shrink-0"
            >
              Xóa
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render upload area
  return (
    <Dragger
      name="video"
      multiple={false}
      accept="video/*"
      showUploadList={false}
      beforeUpload={handleFileChange}
      disabled={disabled}
      className={compact ? 'compact-uploader' : ''}
    >
      <div className={compact ? 'py-4' : 'py-8'}>
        <p className="ant-upload-drag-icon">
          <FaCloudUploadAlt className="text-5xl text-blue-500 dark:text-blue-400 mx-auto" />
        </p>
        <p className="ant-upload-text text-base font-medium text-gray-700 dark:text-gray-300">
          {placeholder}
        </p>
        <p className="ant-upload-hint text-sm text-gray-500 dark:text-gray-400">
          Hỗ trợ: MP4, AVI, MOV, WMV (tối đa {maxSizeMB}MB)
        </p>
      </div>
    </Dragger>
  );
};

export default VideoUploader;
