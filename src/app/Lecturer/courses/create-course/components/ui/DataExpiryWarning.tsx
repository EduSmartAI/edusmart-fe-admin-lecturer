'use client';

import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { getTimeUntilExpiry, clearLocalStorage } from '../../utils/autoSave';

interface DataExpiryWarningProps {
  onDismiss?: () => void;
}

export const DataExpiryWarning: React.FC<DataExpiryWarningProps> = ({ onDismiss }) => {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const updateExpiry = () => {
      const timeLeft = getTimeUntilExpiry();
      setTimeUntilExpiry(timeLeft);
      
      // Show warning when less than 3 minutes remaining
      const shouldShow = timeLeft > 0 && timeLeft < 3 * 60 * 1000 && !isDismissed;
      setIsVisible(shouldShow);
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  const handleClearData = () => {
    clearLocalStorage();
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || timeUntilExpiry <= 0) {
    return null;
  }

  const isUrgent = timeUntilExpiry < 60 * 1000; // Less than 1 minute

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border-l-4 animate-pulse ${
      isUrgent 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200' 
        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200'
    }`}>
      <div className="flex items-start gap-3">
        <FaExclamationTriangle className={`flex-shrink-0 mt-1 ${
          isUrgent ? 'text-red-500' : 'text-orange-500'
        }`} />
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            {isUrgent ? 'Dữ liệu sắp bị xóa!' : 'Cảnh báo: Dữ liệu sẽ bị xóa'}
          </h3>
          <p className="text-xs mb-3">
            Tất cả dữ liệu bạn đã nhập sẽ bị tự động xóa sau{' '}
            <span className="font-bold">{formatTimeRemaining(timeUntilExpiry)}</span>.
            {isUrgent ? ' Hãy hoàn thành ngay!' : ' Hãy hoàn thành tạo khóa học để lưu dữ liệu.'}
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleClearData}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Xóa ngay
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Ẩn thông báo
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default DataExpiryWarning;