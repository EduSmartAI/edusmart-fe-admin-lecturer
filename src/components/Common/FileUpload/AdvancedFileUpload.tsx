'use client';
import { FC, useState, useCallback, useRef } from 'react';
import { Progress, Button, message } from 'antd';
import { FaUpload, FaFile, FaVideo, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaTrash, FaEye } from 'react-icons/fa';
import Image from 'next/image';

interface FileItem {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  url?: string;
  preview?: string;
}

interface AdvancedFileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxCount?: number;
  multiple?: boolean;
  onUpload?: (files: FileItem[]) => Promise<void>;
  onRemove?: (file: FileItem) => void;
  className?: string;
  uploadText?: string;
  uploadHint?: string;
}

const AdvancedFileUpload: FC<AdvancedFileUploadProps> = ({
  accept = "*",
  maxSize = 100,
  maxCount = 10,
  multiple = true,
  onUpload,
  onRemove,
  className = "",
  uploadText = "Kéo thả file vào đây hoặc click để chọn",
  uploadHint = "Hỗ trợ nhiều định dạng file"
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return FaVideo;
    if (type.startsWith('image/')) return FaImage;
    if (type.includes('pdf')) return FaFilePdf;
    if (type.includes('word') || type.includes('document')) return FaFileWord;
    if (type.includes('excel') || type.includes('spreadsheet')) return FaFileExcel;
    if (type.includes('powerpoint') || type.includes('presentation')) return FaFilePowerpoint;
    return FaFile;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = useCallback((file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`File "${file.name}" vượt quá giới hạn ${maxSize}MB`);
      return false;
    }

    if (files.length >= maxCount) {
      message.error(`Chỉ được upload tối đa ${maxCount} file`);
      return false;
    }

    return true;
  }, [files.length, maxCount, maxSize]);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles: FileItem[] = [];

    for (const file of fileArray) {
      if (validateFile(file)) {
        const fileItem: FileItem = {
          uid: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFiles(prev => prev.map(f =>
              f.uid === fileItem.uid
                ? { ...f, preview: e.target?.result as string }
                : f
            ));
          };
          reader.readAsDataURL(file);
        }

        validFiles.push(fileItem);
      }
    }

    if (validFiles.length === 0) return;

    setFiles(prev => [...prev, ...validFiles]);

    // Simulate upload progress
    for (const fileItem of validFiles) {
      simulateUpload(fileItem);
    }

    // Call upload handler
    if (onUpload) {
      try {
        await onUpload(validFiles);
      } catch (error) {
        console.error('Upload failed:', error);
        setFiles(prev => prev.map(f =>
          validFiles.some(vf => vf.uid === f.uid)
            ? { ...f, status: 'error' }
            : f
        ));
      }
    }
  }, [onUpload, validateFile]);

  // Simulate upload progress
  const simulateUpload = (fileItem: FileItem) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f =>
          f.uid === fileItem.uid
            ? { ...f, status: 'done', progress: 100 }
            : f
        ));
      } else {
        setFiles(prev => prev.map(f =>
          f.uid === fileItem.uid
            ? { ...f, progress }
            : f
        ));
      }
    }, 200);
  };

  // Handle file removal
  const handleRemoveFile = useCallback((fileItem: FileItem) => {
    setFiles(prev => prev.filter(f => f.uid !== fileItem.uid));
    onRemove?.(fileItem);
  }, [onRemove]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // Render file item
  const renderFileItem = (file: FileItem) => {
    const IconComponent = getFileIcon(file.type);

    return (
      <div
        key={file.uid}
        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
      >
        {/* File icon/preview */}
        <div className="flex-shrink-0">
          {file.preview ? (
            <Image
              src={file.preview}
              alt={file.name}
              width={48}
              height={48}
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
              <IconComponent className="text-lg" />
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {file.name}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </span>
          </div>

          {/* Progress bar */}
          {file.status === 'uploading' && (
            <Progress
              percent={Math.round(file.progress)}
              size="small"
              status="active"
              showInfo={false}
            />
          )}

          {file.status === 'done' && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <FaEye className="text-xs" />
              <span>Upload thành công</span>
            </div>
          )}

          {file.status === 'error' && (
            <div className="text-xs text-red-600 dark:text-red-400">
              Upload thất bại
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <Button
            type="text"
            danger
            size="small"
            icon={<FaTrash />}
            onClick={() => handleRemoveFile(file)}
            className="hover:bg-red-50 dark:hover:bg-red-900/30"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 hover:border-blue-400
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center
            ${isDragging
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }
          `}>
            <FaUpload className="text-2xl" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {uploadText}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {uploadHint}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Tối đa {maxSize}MB • {maxCount} file
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            File đã chọn ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map(renderFileItem)}
          </div>
        </div>
      )}

      {/* Upload button for mobile */}
      <div className="sm:hidden">
        <Button
          type="dashed"
          block
          size="large"
          icon={<FaUpload />}
          onClick={() => fileInputRef.current?.click()}
        >
          Chọn file
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFileUpload;
