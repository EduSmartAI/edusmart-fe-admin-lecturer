'use client';
import { useState } from 'react';
import { Button, Upload, message } from 'antd';
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  const handleImageUpload = async (file: File) => {
    try {
      console.log('Testing image upload...');
      const url = await courseServiceAPI.uploadImage(file);
      console.log('Image upload result:', url);
      setImageUrl(url);
      message.success('Image upload successful!');
    } catch (error) {
      console.error('Image upload error:', error);
      message.error('Image upload failed!');
    }
    return false; // Prevent default upload
  };

  const handleVideoUpload = async (file: File) => {
    try {
      console.log('Testing video upload...');
      const url = await courseServiceAPI.uploadVideo(file);
      console.log('Video upload result:', url);
      setVideoUrl(url);
      message.success('Video upload successful!');
    } catch (error) {
      console.error('Video upload error:', error);
      message.error('Video upload failed!');
    }
    return false; // Prevent default upload
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Image Upload</h3>
        <Upload
          beforeUpload={handleImageUpload}
          showUploadList={false}
        >
          <Button>Upload Image</Button>
        </Upload>
        {imageUrl && (
          <div>
            <p>Image URL: {imageUrl}</p>
            <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '200px' }} />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Video Upload</h3>
        <Upload
          beforeUpload={handleVideoUpload}
          showUploadList={false}
        >
          <Button>Upload Video</Button>
        </Upload>
        {videoUrl && (
          <div>
            <p>Video URL: {videoUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}

