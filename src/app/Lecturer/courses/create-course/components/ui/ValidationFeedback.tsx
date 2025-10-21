'use client';
import { FC } from 'react';
import { ValidationResult } from '../../hooks/useRealTimeValidation';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaLightbulb } from 'react-icons/fa';

interface ValidationFeedbackProps {
  validation?: ValidationResult;
  className?: string;
  showSuggestions?: boolean;
}

const ValidationFeedback: FC<ValidationFeedbackProps> = ({ 
  validation, 
  className = '',
  showSuggestions = true 
}) => {
  if (!validation) return null;

  const getIcon = () => {
    switch (validation.level) {
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaTimes className="text-red-500" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (validation.level) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTextColor = () => {
    switch (validation.level) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'info':
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`border rounded-lg p-3 mt-2 transition-all duration-200 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${getTextColor()}`}>
            {validation.message}
          </div>
          
          {showSuggestions && validation.suggestions && validation.suggestions.length > 0 && (
            <div className="mt-2">
              <div className={`flex items-center gap-1 text-xs font-medium ${getTextColor()} mb-1`}>
                <FaLightbulb className="text-xs" />
                <span>Gợi ý cải thiện:</span>
              </div>
              <ul className={`text-xs ${getTextColor()} space-y-1 ml-4`}>
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-xs mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationFeedback;
