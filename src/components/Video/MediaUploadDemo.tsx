"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import { 
  StreamingVideoUploader, 
  DocumentUploader, 
  MediaUploader,
  YouTubeStylePlayer 
} from 'EduSmart/components/Video';

const { Title, Text } = Typography;

const MediaUploadDemo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(undefined);
  const [testVideoUrl, setTestVideoUrl] = useState<string | undefined>(undefined);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <Title level={2}>Media Upload System Demo</Title>
        <Text className="text-gray-600">
          Test các component upload video và tài liệu với API backend
        </Text>
      </div>

      <Divider />

      {/* MediaUploader - Unified Component */}
      <Card title="📁 Unified Media Uploader" className="shadow-sm">
        <Text className="text-gray-600 block mb-4">
          Component tổng hợp cho cả video và tài liệu
        </Text>
        <MediaUploader
          videoValue={videoUrl}
          onVideoChange={setVideoUrl as any}
          documentValue={documentUrl}
          onDocumentChange={setDocumentUrl as any}
        />
      </Card>

      {/* Streaming Video Uploader */}
      <Card title="🎥 Streaming Video Uploader" className="shadow-sm">
        <Text className="text-gray-600 block mb-4">
          Upload video → convert sang .m3u8 → preview với VideoPlayer
        </Text>
        <StreamingVideoUploader
          value={testVideoUrl}
          onChange={setTestVideoUrl as any}
          placeholder="Upload video để test streaming"
        />
      </Card>

      {/* Document Uploader */}
      <Card title="📚 Document Uploader" className="shadow-sm">
        <Text className="text-gray-600 block mb-4">
          Upload file ZIP tài liệu học tập với preview
        </Text>
        <DocumentUploader
          value={documentUrl}
          onChange={setDocumentUrl as any}
          placeholder="Upload file ZIP tài liệu"
        />
      </Card>

      {/* Video Player Test */}
      {(videoUrl || testVideoUrl) && (
        <Card title="📺 Video Player Test" className="shadow-sm">
          <Text className="text-gray-600 block mb-4">
            Test VideoPlayer với URL streaming .m3u8
          </Text>
          <YouTubeStylePlayer 
            src={videoUrl || testVideoUrl || ''}
            poster=""
          />
        </Card>
      )}

      {/* Status Display */}
      <Card title="📊 Upload Status" className="shadow-sm">
        <Space direction="vertical" className="w-full">
          <div>
            <Text strong>Video URL: </Text>
            <Text code>{videoUrl || 'Chưa upload'}</Text>
          </div>
          <div>
            <Text strong>Document URL: </Text>
            <Text code>{documentUrl || 'Chưa upload'}</Text>
          </div>
          <div>
            <Text strong>Test Video URL: </Text>
            <Text code>{testVideoUrl || 'Chưa upload'}</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default MediaUploadDemo;