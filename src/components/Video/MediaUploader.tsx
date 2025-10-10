"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, Tabs, Typography, Badge } from 'antd';
import { FaPlay, FaFileArchive } from 'react-icons/fa';
import StreamingVideoUploader from './StreamingVideoUploader';
import DocumentUploader from './DocumentUploader';

const { Text } = Typography;
const { TabPane } = Tabs;

interface MediaUploaderProps {
  videoValue?: string;
  onVideoChange?: (url: string | null) => void;
  documentValue?: string;
  onDocumentChange?: (url: string | null) => void;
  disabled?: boolean;
  defaultActiveTab?: 'video' | 'document';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  videoValue,
  onVideoChange,
  documentValue,
  onDocumentChange,
  disabled = false,
  defaultActiveTab = 'video'
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const hasVideo = !!videoValue;
  const hasDocument = !!documentValue;

  return (
    <Card className="w-full">
      <div className="mb-4">
        <Text className="text-lg font-semibold">Tải lên Nội dung</Text>
        <Text className="text-sm text-gray-500 block mt-1">
          Chọn loại nội dung bạn muốn tải lên
        </Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab as any}
        className="media-uploader-tabs"
      >
        <TabPane 
          tab={
            <div className="flex items-center gap-2">
              <FaPlay className="text-blue-500" />
              <span>Video bài học</span>
              {hasVideo && (
                <Badge 
                  status="success" 
                  text="✓" 
                  style={{ marginLeft: '4px' }}
                />
              )}
            </div>
          } 
          key="video"
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <FaPlay className="text-blue-500 text-lg mt-0.5" />
                <div>
                  <Text className="font-medium text-blue-900 block">Video Streaming</Text>
                  <Text className="text-sm text-blue-700">
                    Upload video bài học để tạo trải nghiệm học tập tương tác
                  </Text>
                  <ul className="text-xs text-blue-600 mt-2 space-y-1">
                    <li>• Tự động convert sang định dạng HLS (.m3u8)</li>
                    <li>• Hỗ trợ đa chất lượng và adaptive streaming</li>
                    <li>• Tối ưu cho mọi thiết bị và băng thông</li>
                  </ul>
                </div>
              </div>
            </div>

            <StreamingVideoUploader
              value={videoValue}
              onChange={onVideoChange}
              disabled={disabled}
              placeholder="Chọn hoặc kéo thả video bài học vào đây"
            />
          </div>
        </TabPane>

        <TabPane 
          tab={
            <div className="flex items-center gap-2">
              <FaFileArchive className="text-green-500" />
              <span>Tài liệu học tập</span>
              {hasDocument && (
                <Badge 
                  status="success" 
                  text="✓" 
                  style={{ marginLeft: '4px' }}
                />
              )}
            </div>
          } 
          key="document"
        >
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <FaFileArchive className="text-green-500 text-lg mt-0.5" />
                <div>
                  <Text className="font-medium text-green-900 block">Tài liệu đính kèm</Text>
                  <Text className="text-sm text-green-700">
                    Upload tài liệu bổ trợ để học viên có thể tải xuống và học tập offline
                  </Text>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• Chỉ chấp nhận file ZIP để đảm bảo tính tổ chức</li>
                    <li>• Bao gồm: PDF, Word, PowerPoint, hình ảnh, bài tập</li>
                    <li>• Học viên có thể tải xuống và sử dụng offline</li>
                  </ul>
                </div>
              </div>
            </div>

            <DocumentUploader
              value={documentValue}
              onChange={onDocumentChange}
              disabled={disabled}
              placeholder="Chọn hoặc kéo thả file ZIP tài liệu vào đây"
            />
          </div>
        </TabPane>
      </Tabs>

      {(hasVideo || hasDocument) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <Text className="font-medium text-gray-900 block mb-2">Tóm tắt nội dung đã tải:</Text>
          <div className="space-y-2">
            {hasVideo && (
              <div className="flex items-center gap-2 text-sm">
                <Badge status="success" />
                <FaPlay className="text-blue-500" />
                <span>Video bài học đã sẵn sàng (Streaming HLS)</span>
              </div>
            )}
            {hasDocument && (
              <div className="flex items-center gap-2 text-sm">
                <Badge status="success" />
                <FaFileArchive className="text-green-500" />
                <span>Tài liệu học tập đã sẵn sàng (ZIP Archive)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MediaUploader;