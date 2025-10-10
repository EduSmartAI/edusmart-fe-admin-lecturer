"use client";

import React, { useState } from 'react';
import { Button, Typography } from 'antd';

const { Text } = Typography;

interface SimpleVideoPlayerProps {
  src: string;
  poster?: string;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  src,
  poster
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = () => {
    setHasError(true);
    setErrorMessage('Video chưa sẵn sàng hoặc đang được xử lý');
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4">
            <Text className="text-white block">{errorMessage}</Text>
            <Text className="text-gray-400 text-sm block mt-2">
              Video .m3u8 có thể cần thời gian để xử lý
            </Text>
          </div>
          <div className="space-y-2">
            <Button 
              size="small" 
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
              }}
            >
              Thử lại
            </Button>
            <Button 
              type="link" 
              size="small"
              className="text-blue-400 block mx-auto"
              onClick={() => window.open(src, '_blank')}
            >
              Mở link trực tiếp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <video
        className="w-full h-full"
        controls
        playsInline
        crossOrigin="anonymous"
        poster={poster}
        preload="metadata"
        src={src}
        onError={handleError}
        style={{
          maxWidth: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default SimpleVideoPlayer;