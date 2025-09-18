'use client';

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { getLastSavedTime, getTimeUntilExpiry, getSavedStep, checkAndClearExpiredData } from '../../utils/autoSave';

interface AutoSaveStatusWithTimerProps {
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const AutoSaveStatusWithTimer: React.FC<AutoSaveStatusWithTimerProps> = ({ 
  saveStatus = 'idle', 
  className = '' 
}) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);
  const [savedStep, setSavedStep] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      // Check if data has expired and clear it
      const wasExpired = checkAndClearExpiredData();
      
      if (!wasExpired) {
        setLastSaved(getLastSavedTime());
        setTimeUntilExpiry(getTimeUntilExpiry());
        setSavedStep(getSavedStep());
      } else {
        setLastSaved(null);
        setTimeUntilExpiry(0);
        setSavedStep(null);
      }
    };

    // Update immediately
    updateStatus();

    // Update every second to show countdown
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [saveStatus]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <FaSpinner className="animate-spin text-blue-500" />;
      case 'saved':
        return <FaCheck className="text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        if (lastSaved && timeUntilExpiry > 0) {
          return timeUntilExpiry < 2 * 60 * 1000 ? // Less than 2 minutes
            <FaExclamationTriangle className="text-orange-500" /> :
            <FaClock className="text-gray-400" />;
        }
        return lastSaved ? <FaCheck className="text-gray-400" /> : null;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Đang lưu...';
      case 'saved':
        return 'Đã lưu';
      case 'error':
        return 'Lỗi lưu';
      default:
        if (lastSaved && timeUntilExpiry > 0) {
          const stepText = savedStep && ['1', '2', '3', '4'].includes(savedStep) ? ` (Bước ${savedStep})` : '';
          const timeRemaining = formatTimeRemaining(timeUntilExpiry);
          const isExpiringSoon = timeUntilExpiry < 2 * 60 * 1000; // Less than 2 minutes
          
          return isExpiringSoon ? 
            `Dữ liệu sẽ bị xóa sau: ${timeRemaining}${stepText}` :
            `Lưu lần cuối: ${lastSaved.toLocaleTimeString()} - Xóa sau: ${timeRemaining}${stepText}`;
        }
        return lastSaved ? `Lưu lần cuối: ${lastSaved.toLocaleTimeString()}` : '';
    }
  };

  const getStatusColor = () => {
    if (saveStatus === 'saving') return 'text-blue-500';
    if (saveStatus === 'saved') return 'text-green-500';
    if (saveStatus === 'error') return 'text-red-500';
    
    if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 1000) {
      return 'text-orange-500'; // Warning color when expiring soon
    }
    
    return 'text-gray-500 dark:text-gray-400';
  };

  // Don't show anything if there's no save status and no saved data
  if (saveStatus === 'idle' && !lastSaved) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000 && ( // Show warning when less than 5 minutes
        <span className="text-xs text-orange-500 ml-2 font-medium">
          ⚠️ Dữ liệu sẽ tự động xóa - Hãy hoàn thành sớm!
        </span>
      )}
    </div>
  );
};

export default AutoSaveStatusWithTimer;