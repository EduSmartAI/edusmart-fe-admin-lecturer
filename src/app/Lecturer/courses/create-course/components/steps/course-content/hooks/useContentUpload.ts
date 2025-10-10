/**
 * Content Upload Hook
 * 
 * Handles all upload-related operations including:
 * - Video upload
 * - Document/file upload
 * - Upload progress tracking
 * - Error handling
 */

import { useState, useCallback } from 'react';
import { App } from 'antd';
import { uploadToCloudinaryRaw } from 'EduSmart/utils/cloudinary';
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

export interface UploadProgress {
  percent: number;
  status: 'uploading' | 'success' | 'error' | 'idle';
}

export const useContentUpload = () => {
  const { message } = App.useApp();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percent: 0,
    status: 'idle',
  });
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Upload video to server
   */
  const handleVideoUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress({ percent: 0, status: 'uploading' });
      setUploadedFileName(file.name);

      // Upload video using the API
      const videoUrl = await courseServiceAPI.uploadVideo(file);

      if (videoUrl && typeof videoUrl === 'string') {
        setUploadProgress({ percent: 100, status: 'success' });
        message.success(`Video "${file.name}" đã được tải lên thành công!`);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress({ percent: 0, status: 'idle' });
        }, 1000);

        return videoUrl;
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch {
      setUploadProgress({ percent: 0, status: 'error' });
      setIsUploading(false);
      message.error('Có lỗi khi tải video lên. Vui lòng thử lại.');
      return null;
    }
  }, [message]);

  /**
   * Upload document/file to server
   */
  const handleFileUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress({ percent: 0, status: 'uploading' });
      setUploadedFileName(file.name);

      // Upload document using the API
      const fileUrl = await courseServiceAPI.uploadDocuments(file);

      if (fileUrl && typeof fileUrl === 'string') {
        setUploadProgress({ percent: 100, status: 'success' });
        message.success(`Tài liệu "${file.name}" đã được tải lên thành công!`);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress({ percent: 0, status: 'idle' });
        }, 1000);

        return fileUrl;
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch {
      setUploadProgress({ percent: 0, status: 'error' });
      setIsUploading(false);
      message.error('Có lỗi khi tải tài liệu lên. Vui lòng thử lại.');
      return null;
    }
  }, [message]);

  /**
   * Upload image to Cloudinary (for thumbnails, etc.)
   */
  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress({ percent: 0, status: 'uploading' });
      setUploadedFileName(file.name);

      // Upload to Cloudinary
      const result = await uploadToCloudinaryRaw(file);
      
      if (result.secure_url) {
        setUploadProgress({ percent: 100, status: 'success' });
        message.success(`Hình ảnh "${file.name}" đã được tải lên thành công!`);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress({ percent: 0, status: 'idle' });
        }, 1000);

        return result.secure_url;
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch {
      setUploadProgress({ percent: 0, status: 'error' });
      setIsUploading(false);
      message.error('Có lỗi khi tải hình ảnh lên. Vui lòng thử lại.');
      return null;
    }
  }, [message]);

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploadProgress({ percent: 0, status: 'idle' });
    setUploadedFileName(null);
    setIsUploading(false);
  }, []);

  /**
   * Cancel ongoing upload (placeholder - can be enhanced with actual cancellation)
   */
  const cancelUpload = useCallback(() => {
    setUploadProgress({ percent: 0, status: 'idle' });
    setIsUploading(false);
    message.info('Đã hủy tải lên');
  }, [message]);

  return {
    // State
    uploadProgress,
    uploadedFileName,
    isUploading,

    // Methods
    handleVideoUpload,
    handleFileUpload,
    handleImageUpload,
    resetUpload,
    cancelUpload,
  };
};
