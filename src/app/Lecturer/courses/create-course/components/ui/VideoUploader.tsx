'use client';
import { FC, useState } from 'react';
import { Upload, Button, Progress, Input, Typography, message } from 'antd';
import { FaVideo, FaPlay, FaTrash, FaLink } from 'react-icons/fa';
import type { UploadProps } from 'antd/es/upload/interface';
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

const { Text } = Typography;
const { Dragger } = Upload;

interface VideoUploaderProps {
  value?: File | string;
  onChange?: (value: File | string | undefined) => void;
  label?: string;
  helpText?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  showUrlInput?: boolean;
}

const VideoUploader: FC<VideoUploaderProps> = ({
  value,
  onChange,
  label = "Video khóa học",
  helpText = "Tải lên video giới thiệu khóa học của bạn",
  maxSize = 500, // 500MB default
  acceptedFormats = ['mp4', 'mov', 'avi', 'mkv'],
  showUrlInput = true
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [urlValue, setUrlValue] = useState('');

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setIsUploading(true);
    setUploadProgress(10);
    try {
      console.log('[VideoUpload] Starting upload for:', (file as File).name);
      const url = await courseServiceAPI.uploadVideo(file as File);
      console.log('[VideoUpload] Got hosted URL:', url);
      setUploadProgress(100);
      setIsUploading(false);
      onChange?.(url);
      onSuccess?.('ok');
      message.success('Video đã được tải lên thành công!');
    } catch (e) {
      console.error('[VideoUpload] Upload failed:', e);
      setIsUploading(false);
      setUploadProgress(0);
      message.error('Tải video thất bại');
      onError?.(e as any);
    }
  };

  const beforeUpload = (file: File) => {
    const isValidFormat = acceptedFormats.some(format => 
      file.name.toLowerCase().endsWith(`.${format}`)
    );
    
    if (!isValidFormat) {
      message.error(`Chỉ hỗ trợ các định dạng: ${acceptedFormats.join(', ')}`);
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(`Kích thước file không được vượt quá ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleRemove = () => {
    onChange?.(undefined);
    setUploadProgress(0);
    setUrlValue('');
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onChange?.(urlValue.trim());
      message.success('Đã thêm link video thành công!');
    }
  };

  const isVideoFile = value instanceof File;
  const isVideoUrl = typeof value === 'string' && value.length > 0;
  const hasVideo = isVideoFile || isVideoUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {showUrlInput && (
          <div className="flex gap-2">
            <Button
              type={inputType === 'upload' ? 'primary' : 'default'}
              size="small"
              onClick={() => setInputType('upload')}
            >
              Tải lên
            </Button>
            <Button
              type={inputType === 'url' ? 'primary' : 'default'}
              size="small"
              onClick={() => setInputType('url')}
            >
              Link URL
            </Button>
          </div>
        )}
      </div>

      {helpText && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 block">
          {helpText}
        </Text>
      )}

      {!hasVideo && inputType === 'upload' && (
        <Dragger
          name="video"
          customRequest={handleUpload}
          beforeUpload={beforeUpload}
          showUploadList={false}
          className="hover:border-blue-400 transition-colors duration-200"
        >
          <p className="ant-upload-drag-icon">
            <FaVideo className="text-4xl text-blue-500 mx-auto" />
          </p>
          <p className="ant-upload-text text-lg font-medium">
            Kéo thả video vào đây hoặc click để chọn
          </p>
          <p className="ant-upload-hint text-gray-500">
            Hỗ trợ: {acceptedFormats.join(', ').toUpperCase()} (tối đa {maxSize}MB)
          </p>
        </Dragger>
      )}

      {!hasVideo && inputType === 'url' && (
        <div className="space-y-3">
          <Input
            placeholder="Nhập link YouTube, Vimeo hoặc link video khác..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            size="large"
            prefix={<FaLink className="text-gray-400" />}
          />
          <Button
            type="primary"
            onClick={handleUrlSubmit}
            disabled={!urlValue.trim()}
            className="w-full"
          >
            Thêm link video
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text className="text-sm">Đang tải lên...</Text>
            <Text className="text-sm">{uploadProgress}%</Text>
          </div>
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}

      {hasVideo && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FaVideo className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Text className="font-medium text-gray-800 dark:text-gray-200">
                  {isVideoFile ? (value as File).name : 'Video từ URL'}
                </Text>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isVideoFile 
                    ? `${((value as File).size / 1024 / 1024).toFixed(1)} MB`
                    : value as string
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isVideoUrl && (
                <Button
                  type="text"
                  icon={<FaPlay />}
                  onClick={() => window.open(value as string, '_blank')}
                  title="Xem video"
                />
              )}
              <Button
                type="text"
                danger
                icon={<FaTrash />}
                onClick={handleRemove}
                title="Xóa video"
              />
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>• Video chất lượng cao sẽ tạo ấn tượng tốt với học viên</div>
        <div>• Thời lượng khuyến nghị: 1-3 phút cho video giới thiệu</div>
        <div>• Đảm bảo âm thanh rõ ràng và hình ảnh sắc nét</div>
      </div>
    </div>
  );
};

export default VideoUploader;
