"use client";
/* eslint-disable */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Progress, Button, Typography, Tooltip, Badge, Alert, App } from 'antd';
import { FaPlay, FaFilm, FaEye, FaExclamationTriangle, FaSyncAlt, FaCheckCircle, FaCloudUploadAlt } from 'react-icons/fa';
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

// Dynamic import để tránh SSR issues
const YouTubeStylePlayer = React.lazy(() => import('EduSmart/components/Video/VideoPlayer'));
const SimpleVideoPlayer = React.lazy(() => import('EduSmart/components/Video/SimpleVideoPlayer'));

const { Text } = Typography;

interface StreamingVideoUploaderProps {
  value?: string;
  onChange?: (value: string | null) => void;
  onVideoDurationExtracted?: (durationInSeconds: number) => void;
  maxSizeMB?: number;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

const StreamingVideoUploader: React.FC<StreamingVideoUploaderProps> = ({
  value, 
  onChange,
  onVideoDurationExtracted,
  placeholder = "Chọn hoặc kéo thả video vào đây", 
  maxSizeMB = 100,
  disabled = false,
  compact = false
}) => {
  const { notification } = App.useApp();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = ".mp4,.avi,.mov,.wmv,.mkv,.flv,.webm,.m4v";

  const getVideoInfo = () => {
    const isStreaming = value?.includes('.m3u8');
    return {
      type: isStreaming ? 'Streaming Video' : 'Video File',
      format: isStreaming ? 'HLS (.m3u8)' : 'Standard Video',
      isStreaming: !!isStreaming,
    };
  };

  // Extract video duration from file using HTML5 Video API
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const durationInSeconds = Math.round(video.duration);
        resolve(durationInSeconds);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Không thể đọc metadata của video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (file: File) => {
    if (disabled) return false;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      notification.error({
        message: 'File quá lớn',
        description: `Vui lòng chọn file nhỏ hơn ${maxSizeMB}MB`,
        placement: 'topRight'
      });
      return false;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type)) {
      notification.error({
        message: 'Định dạng không hỗ trợ',
        description: 'Vui lòng chọn file video hợp lệ.',
        placement: 'topRight'
      });
      return false;
    }

    // Extract video duration before upload
    try {
      const durationInSeconds = await getVideoDuration(file);
      // Call callback with duration in seconds
      onVideoDurationExtracted?.(durationInSeconds);
    } catch (error) {
      console.warn('Could not extract video duration:', error);
      // Continue with upload even if duration extraction fails
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const videoUrl = await courseServiceAPI.uploadVideosUtility(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onChange?.(videoUrl);
        
        notification.success({
          message: 'Upload thành công!',
          description: (
            <div className="space-y-1">
              <div>Video đã được convert sang định dạng streaming HLS (.m3u8)</div>
              <div className="text-orange-600">
                ⏳ Lưu ý: Video có thể cần 1-2 phút để sẵn sàng xem
              </div>
            </div>
          ),
          duration: 6,
          placement: 'topRight'
        });
      }, 500);

    } catch (error: unknown) {
      const err = error as Error;
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedFileName(null);
      
      let errorMessage = 'Không thể upload video. Vui lòng thử lại sau.';
      if (err.message?.includes('Failed to fetch')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Upload quá lâu. File có thể quá lớn, vui lòng thử file nhỏ hơn.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      notification.error({
        message: 'Lỗi upload',
        description: errorMessage,
        placement: 'topRight'
      });
    }

    return false; // Prevent default upload behavior
  };

  const handleRemove = () => {
    onChange?.(null);
    setUploadedFileName(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReupload = () => {
    handleRemove();
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
    setPlayerError(null); // Reset error khi toggle
  };

  const isVideoUploaded = !!value;
  const videoInfo = getVideoInfo();

  return (
    <div className="w-full max-w-full">
      {/* Hidden file input for reupload */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
        }}
        style={{ display: 'none' }}
      />
      
      {!isVideoUploaded && !isUploading && (
        <Upload.Dragger
          name="file"
          multiple={false}
          accept={accept}
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={disabled}
          className="hover:border-blue-400 transition-colors duration-200"
        >
          <div className={compact ? "py-4" : "py-8"}>
            <FaCloudUploadAlt className={`${compact ? "text-3xl" : "text-4xl"} text-blue-400 mx-auto mb-4`} />
            <Text className={`${compact ? "text-sm" : "text-base"} text-gray-700 block mb-2`}>
              {placeholder}
            </Text>
            <Text className="text-sm text-gray-500 block mb-4">
              Hỗ trợ: {accept.replace(/\./g, '').toUpperCase()}
            </Text>
            <Text className="text-xs text-gray-400 block">
              Kích thước tối đa: {maxSizeMB}MB
            </Text>
          </div>
        </Upload.Dragger>
      )}

      {isUploading && (
        <div className={`space-y-3 ${compact ? "p-4" : "p-6"} border-2 border-dashed border-blue-300 rounded-lg bg-blue-50`}>
          <div className="flex items-center justify-center gap-3">
            <FaFilm className="text-blue-500 text-xl animate-pulse" />
            <Text className={`${compact ? "text-sm" : "text-base"} font-medium`}>Đang xử lý video...</Text>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-sm">Converting to streaming format...</Text>
              <Text className="text-sm font-medium">{Math.round(uploadProgress)}%</Text>
            </div>
            <Progress 
              percent={Math.round(uploadProgress)} 
              status="active" 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
          
          <Text className={`${compact ? "text-xs" : "text-xs"} text-gray-500 text-center block`}>
            Video sẽ được convert sang định dạng HLS (.m3u8) để tối ưu streaming
          </Text>
        </div>
      )}

      {isVideoUploaded && (
        <div className="space-y-4">
          {compact ? (
            // Compact UI for modal usage
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2 min-w-0 flex-1">
                  <FaCheckCircle className="text-green-500 text-lg flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate flex-1">
                        {uploadedFileName || 'Video đã tải lên'}
                      </p>
                      {videoInfo.isStreaming && (
                        <Tooltip title="Video streaming chất lượng cao (.m3u8)">
                          <Badge 
                            count="STREAMING"
                            style={{
                              backgroundColor: '#e6f7ff',
                              color: '#1890ff',
                              border: '1px solid #91d5ff',
                              fontSize: '10px',
                              height: '18px',
                              lineHeight: '16px',
                              padding: '0 6px',
                              borderRadius: '4px'
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {videoInfo.type} • {videoInfo.format}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Tooltip title={showPreview ? "Ẩn preview" : "Xem trước video"}>
                    <Button
                      type="link"
                      size="small"
                      icon={<FaEye />}
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-1 w-8 h-8"
                    />
                  </Tooltip>
                  <Tooltip title="Thay đổi video">
                    <Button
                      type="link"
                      size="small"
                      icon={<FaSyncAlt />}
                      onClick={handleReupload}
                      className="p-1 w-8 h-8"
                    />
                  </Tooltip>
                </div>
              </div>
              
              {videoInfo.isStreaming && (
                <Alert
                  message="Video có thể cần 1-2 phút để sẵn sàng stream"
                  type="info"
                  showIcon
                  className="text-xs"
                  style={{ 
                    padding: '4px 8px',
                    fontSize: '12px'
                  }}
                />
              )}
              
              {showPreview && (
                <div className="border border-gray-300 rounded-md overflow-hidden mt-2">
                  <VideoPlayerWrapper 
                    src={value}
                    onError={() => {}}
                  />
                </div>
              )}
            </div>
          ) : (
            // Full UI for main sections  
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <span>{uploadedFileName || 'Video đã tải lên'}</span>
                      {videoInfo.isStreaming && (
                        <Tooltip title="Video streaming chất lượng cao (.m3u8)">
                          <Badge 
                            text="STREAMING" 
                            status="processing" 
                            style={{
                              color: '#1890ff',
                              backgroundColor: '#e6f7ff',
                              border: '1px solid #91d5ff',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          />
                        </Tooltip>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {videoInfo.type} • {videoInfo.format}
                    </p>
                    {videoInfo.isStreaming && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⏳ Video có thể cần 1-2 phút để sẵn sàng stream
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Tooltip title={showPreview ? "Ẩn preview" : "Xem trước video"}>
                    <Button
                      type="link"
                      icon={showPreview ? <FaEye /> : <FaPlay />}
                      onClick={handlePreviewToggle}
                      className="text-blue-500 hover:text-blue-700"
                    />
                  </Tooltip>
                  <Button 
                    type="link" 
                    danger 
                    onClick={handleRemove}
                    className="text-red-500 hover:text-red-700"
                    disabled={disabled}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Only show preview outside compact mode (full mode) */}
          {!compact && showPreview && value && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaPlay className="text-blue-500" />
                    Preview Video Streaming
                  </Text>
                  {videoInfo.isStreaming && (
                    <Button
                      type="link"
                      size="small"
                      icon={<FaSyncAlt />}
                      onClick={() => {
                        // Force re-check video status
                        setRetryKey(prev => prev + 1);
                        setPlayerError(null);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Kiểm tra lại trạng thái video"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <React.Suspense fallback={
                    <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                      <div className="text-center">
                        <FaFilm className="text-4xl mb-2 mx-auto opacity-50" />
                        <Text className="text-white">Đang tải video player...</Text>
                      </div>
                    </div>
                  }>
                    <VideoPlayerWrapper 
                      key={retryKey}
                      src={value} 
                      onError={setPlayerError}
                    />
                  </React.Suspense>
                </div>
                
                {playerError && (
                  <Alert
                    message="Lỗi phát video"
                    description={playerError}
                    type="warning"
                    icon={<FaExclamationTriangle />}
                    className="mt-3"
                    action={
                      <Button size="small" onClick={() => window.open(value, '_blank')}>
                        Xem trực tiếp
                      </Button>
                    }
                  />
                )}
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <Text className="text-xs text-blue-700 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    Video đang stream ở định dạng HLS (.m3u8) với chất lượng adaptive
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-3">
        <div>• Video sẽ được tự động convert sang định dạng HLS (.m3u8) để tối ưu streaming</div>
        <div>• Hỗ trợ đa chất lượng và adaptive bitrate cho trải nghiệm tốt nhất</div>
        <div>• Thời gian xử lý phụ thuộc vào kích thước và độ phức tạp của video</div>
      </div>
    </div>
  );
};

// Wrapper component để handle error và fallback
const VideoPlayerWrapper: React.FC<{
  src: string;
  onError: (error: string) => void;
}> = ({ src, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [useSimplePlayer, setUseSimplePlayer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if video is ready
  const checkVideoStatus = async (url: string): Promise<{ isReady: boolean; status?: number }> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return { 
        isReady: response.ok,
        status: response.status 
      };
    } catch {
      return { isReady: false };
    }
  };

  React.useEffect(() => {
    setHasError(false);
    setUseSimplePlayer(false);
    setIsProcessing(false);
    setRetryCount(0);

    // Check if video is ready, retry if 423 (processing)
    const checkAndRetry = async () => {
      if (src.includes('.m3u8')) {
        setIsProcessing(true);
        
        const maxRetries = 20;
        const retryDelay = 5000;

        for (let i = 0; i < maxRetries; i++) {
          const { isReady } = await checkVideoStatus(src);
          
          if (isReady) {
            setIsProcessing(false);
            return;
          }
          
          setRetryCount(i + 1);
          
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
        
        setIsProcessing(false);
        setHasError(true);
        onError('Video vẫn đang được xử lý. Cloudinary cần 1-2 phút để chuyển đổi video thành định dạng streaming. Vui lòng thử lại sau.');
      }
    };

    if (src && src.includes('.m3u8')) {
      checkAndRetry();
    }
  }, [src, onError]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white p-6">
        <div className="text-center max-w-md">
          <FaFilm className="text-5xl mb-4 mx-auto text-blue-500 animate-pulse" />
          <Text className="text-white mb-3 text-lg font-medium">
            Video đang được xử lý...
          </Text>
          <Text className="text-gray-300 text-sm mb-4">
            Cloudinary đang chuyển đổi video thành định dạng streaming. 
            Quá trình này có thể mất 1-2 phút.
          </Text>
          <Text className="text-blue-400 text-sm mb-4">
            Đang kiểm tra lần {retryCount}/20
          </Text>
          <div className="mt-4 bg-gray-800 rounded-lg p-3">
            <Progress 
              percent={(retryCount / 20) * 100}
              showInfo={false}
              strokeColor="#3b82f6"
              trailColor="#374151"
            />
            <Text className="text-gray-400 text-xs mt-2">
              Tiến trình kiểm tra: {Math.round((retryCount / 20) * 100)}%
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white p-6">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="text-5xl mb-4 mx-auto text-yellow-500" />
          <Text className="text-white mb-3 text-lg font-medium">Video chưa sẵn sàng</Text>
          <Text className="text-gray-300 text-sm mb-4">
            Video đã upload thành công nhưng Cloudinary vẫn đang xử lý để tạo định dạng streaming. 
            Quá trình này thường mất 1-3 phút tùy thuộc vào độ dài và chất lượng video.
          </Text>
          <div className="space-y-3">
            <Button 
              type="primary"
              size="small"
              icon={<FaSyncAlt />}
              onClick={() => {
                setHasError(false);
                setIsProcessing(true);
                setRetryCount(0);
              }}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 mx-auto block"
            >
              Thử lại ngay
            </Button>
            <div className="text-gray-400 text-xs">
              <p>💡 Mẹo: Đợi thêm 1-2 phút rồi nhấn &quot;Thử lại ngay&quot;</p>
              <p>Video streaming sẽ có chất lượng cao hơn sau khi xử lý xong</p>
            </div>
            <Button 
              size="small"
              onClick={() => setUseSimplePlayer(true)}
              className="mx-auto block"
            >
              Thử player đơn giản
            </Button>
            <Button 
              type="link" 
              size="small"
              className="text-blue-400 mx-auto block"
              onClick={() => window.open(src, '_blank')}
            >
              Mở link trực tiếp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (useSimplePlayer) {
    return (
      <React.Suspense fallback={<div className="bg-gray-800 h-full flex items-center justify-center text-white">Loading simple player...</div>}>
        <SimpleVideoPlayer src={src} />
      </React.Suspense>
    );
  }

  try {
    return (
      <YouTubeStylePlayer 
        src={src}
        poster=""
      />
    );
  } catch (caughtError) {
    // Can't use hooks in catch blocks - handle error directly
    setHasError(true);
    onError(caughtError instanceof Error ? caughtError.message : 'Lỗi không xác định');
    
    return null;
  }
};

export default StreamingVideoUploader;