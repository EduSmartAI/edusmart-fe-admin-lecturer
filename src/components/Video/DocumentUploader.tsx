"use client";

import React, { useState, useRef } from 'react';
import { Upload, Progress, Button, Typography, App, Tooltip, Badge, Card } from 'antd';
import { FaCheckCircle, FaDownload, FaFileArchive, FaFolder, FaFileAlt } from 'react-icons/fa';
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

const { Text } = Typography;

interface DocumentUploaderProps {
  value?: string;
  onChange?: (url: string | null) => void;
  maxSizeMB?: number;
  disabled?: boolean;
  placeholder?: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  value,
  onChange,
  maxSizeMB = 100, // 100MB default
  disabled = false,
  placeholder = "Chọn hoặc kéa thả file ZIP vào đây"
}) => {
  const { message } = App.useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileInfo = () => {
    const isZipFile = value?.includes('.zip');
    return {
      type: isZipFile ? 'Tài liệu học tập' : 'File đã upload',
      format: isZipFile ? 'Archive (.zip)' : 'Unknown format',
      isZip: !!isZipFile,
    };
  };

  const handleUpload = async (file: File) => {
    if (disabled) return false;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      message.error(`File quá lớn! Vui lòng chọn file nhỏ hơn ${maxSizeMB}MB`);
      return false;
    }

    // Validate file type - chỉ chấp nhận ZIP
    if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed' && !file.name.toLowerCase().endsWith('.zip')) {
      message.error('Chỉ hỗ trợ file ZIP! Vui lòng nén tài liệu của bạn thành file .zip');
      return false;
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
        return prev + Math.random() * 10;
      });
    }, 300);

    try {
      const documentUrl = await courseServiceAPI.uploadDocuments(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onChange?.(documentUrl);
        
        message.success({
          content: (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaCheckCircle className="text-green-500" />
                <span className="font-medium">Upload thành công!</span>
              </div>
              <div className="text-sm text-gray-600">
                Tài liệu đã được lưu trữ và sẵn sàng để tải xuống
              </div>
            </div>
          ),
          duration: 4,
        });
      }, 500);

    } catch (error: unknown) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedFileName(null);
      message.error(`Lỗi upload tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleDownload = () => {
    if (value) {
      window.open(value, '_blank');
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const isDocumentUploaded = !!value;
  const fileInfo = getFileInfo();

  // Mock preview data for ZIP file contents
  const mockZipContents = [
    { name: 'Bài giảng 1.pdf', type: 'pdf', size: '2.5 MB' },
    { name: 'Slide thuyết trình.pptx', type: 'powerpoint', size: '1.8 MB' },
    { name: 'Tài liệu tham khảo.docx', type: 'word', size: '850 KB' },
    { name: 'Images/', type: 'folder', size: '3 items' },
    { name: 'Exercises/', type: 'folder', size: '5 items' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FaFileAlt className="text-red-500" />;
      case 'powerpoint': return <FaFileAlt className="text-orange-500" />;
      case 'word': return <FaFileAlt className="text-blue-500" />;
      case 'folder': return <FaFolder className="text-yellow-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      {!isDocumentUploaded && !isUploading && (
        <Upload.Dragger
          name="file"
          multiple={false}
          accept=".zip,application/zip,application/x-zip-compressed"
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={disabled}
          className="hover:border-green-400 transition-colors duration-200"
        >
          <div className="py-8">
            <FaFileArchive className="text-4xl text-green-400 mx-auto mb-4" />
            <Text className="text-base text-gray-700 block mb-2">
              {placeholder}
            </Text>
            <Text className="text-sm text-gray-500 block mb-4">
              Chỉ hỗ trợ: ZIP
            </Text>
            <Text className="text-xs text-gray-400 block">
              Kích thước tối đa: {maxSizeMB}MB
            </Text>
          </div>
        </Upload.Dragger>
      )}

      {isUploading && (
        <div className="space-y-3 p-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
          <div className="flex items-center justify-center gap-3">
            <FaFileArchive className="text-green-500 text-xl animate-pulse" />
            <Text className="text-base font-medium">Đang tải tài liệu...</Text>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-sm">Uploading document archive...</Text>
              <Text className="text-sm font-medium">{Math.round(uploadProgress)}%</Text>
            </div>
            <Progress 
              percent={Math.round(uploadProgress)} 
              status="active" 
              strokeColor={{
                '0%': '#52c41a',
                '100%': '#73d13d',
              }}
            />
          </div>
          
          <Text className="text-xs text-gray-500 text-center block">
            Tài liệu sẽ được lưu trữ và có thể tải xuống bất cứ lúc nào
          </Text>
        </div>
      )}

      {isDocumentUploaded && (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 text-xl" />
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <span>{uploadedFileName || 'Tài liệu đã tải lên'}</span>
                    {fileInfo.isZip && (
                      <Tooltip title="Tài liệu học tập đã nén (.zip)">
                        <Badge 
                          text="ARCHIVE" 
                          status="success" 
                          style={{
                            color: '#52c41a',
                            backgroundColor: '#f6ffed',
                            border: '1px solid #b7eb8f',
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
                    {fileInfo.type} • {fileInfo.format}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Tooltip title="Xem nội dung">
                  <Button
                    type="link"
                    icon={<FaFolder />}
                    onClick={handlePreviewToggle}
                    className="text-blue-500 hover:text-blue-700"
                  />
                </Tooltip>
                <Tooltip title="Tải xuống">
                  <Button
                    type="link"
                    icon={<FaDownload />}
                    onClick={handleDownload}
                    className="text-green-500 hover:text-green-700"
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

          {showPreview && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FaFileArchive className="text-green-500" />
                  <span>Nội dung tài liệu</span>
                </div>
              }
              size="small"
              className="border border-gray-200"
            >
              <div className="space-y-2">
                {mockZipContents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{file.size}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-xs text-blue-700">
                  💡 Preview mô phỏng: Để xem nội dung thực tế, vui lòng tải xuống file ZIP
                </Text>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-3">
        <div>• Chỉ chấp nhận file ZIP chứa tài liệu học tập</div>
        <div>• Nên bao gồm: PDF, Word, PowerPoint, hình ảnh, bài tập</div>
        <div>• Tài liệu sẽ được lưu trữ an toàn và có thể tải xuống bất cứ lúc nào</div>
      </div>
    </div>
  );
};

export default DocumentUploader;