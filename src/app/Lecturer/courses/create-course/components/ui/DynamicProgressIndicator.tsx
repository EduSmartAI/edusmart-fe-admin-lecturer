'use client';
import { FC } from 'react';
import { useProgressTracking, StepProgress } from '../../hooks/useProgressTracking';
import { FaCheck, FaExclamationTriangle, FaClock, FaChevronRight } from 'react-icons/fa';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

interface DynamicProgressIndicatorProps {
  showDetailedView?: boolean;
  className?: string;
  isEditMode?: boolean;
}

const DynamicProgressIndicator: FC<DynamicProgressIndicatorProps> = ({ 
  showDetailedView = false, 
  className = '',
  isEditMode = false
}) => {
  const { overallProgress, stepProgress } = useProgressTracking(isEditMode);
  const { setCurrentStep, currentStep } = useCreateCourseStore();

  const getStepStatusIcon = (step: StepProgress) => {
    if (step.isCompleted) {
      return <FaCheck className="text-green-500 text-sm" />;
    }
    if (step.warnings.length > 0) {
      return <FaExclamationTriangle className="text-yellow-500 text-sm" />;
    }
    if (step.completionPercentage > 0) {
      return <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />;
    }
    return <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />;
  };

  const getStepStatusColor = (step: StepProgress, isActive: boolean) => {
    if (isActive) {
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
    if (step.isCompleted) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    if (step.warnings.length > 0) {
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
    if (step.completionPercentage > 0) {
      return 'border-blue-300 bg-blue-25 dark:bg-blue-900/10';
    }
    return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!showDetailedView) {
    // Compact progress bar for headers
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Overall Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm relative"
              style={{ width: `${Math.max(overallProgress.totalPercentage, 5)}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Bước {currentStep + 1} của {overallProgress.totalSteps}</span>
            <span>{Math.round(overallProgress.totalPercentage)}% hoàn thành</span>
          </div>
        </div>

        {/* Current Step Status */}
        <div className="flex items-center gap-2 text-sm">
          {getStepStatusIcon(overallProgress.currentStepProgress)}
          <span className="text-gray-600 dark:text-gray-400">
            {overallProgress.currentStepProgress.stepName}: {Math.round(overallProgress.currentStepProgress.completionPercentage)}%
          </span>
          {overallProgress.currentStepProgress.estimatedTimeRemaining && overallProgress.currentStepProgress.estimatedTimeRemaining > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FaClock />
              <span>{formatTime(overallProgress.currentStepProgress.estimatedTimeRemaining)} còn lại</span>
            </div>
          )}
        </div>

        {/* Warnings for current step */}
        {overallProgress.currentStepProgress.warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-500 text-sm mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Gợi ý cải thiện:
                </div>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  {overallProgress.currentStepProgress.warnings.map((warning, index) => (
                    <li key={index} className="text-xs">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed progress view for sidebar
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Tiến độ tổng thể</h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(overallProgress.totalPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(overallProgress.totalPercentage, 2)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{overallProgress.completedSteps}/{overallProgress.totalSteps} bước hoàn thành</span>
          {overallProgress.estimatedTimeToComplete && overallProgress.estimatedTimeToComplete > 0 && (
            <span className="flex items-center gap-1">
              <FaClock />
              {formatTime(overallProgress.estimatedTimeToComplete)}
            </span>
          )}
        </div>
      </div>

      {/* Step-by-step Progress */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">Chi tiết từng bước</h4>
        {stepProgress.map((step, index) => {
          const isActive = index === currentStep;
          const isClickable = index <= currentStep || step.completionPercentage >= 80;
          
          return (
            <div
              key={step.stepId}
              className={`
                border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer
                ${getStepStatusColor(step, isActive)}
                ${isClickable ? 'hover:shadow-md' : 'opacity-60 cursor-not-allowed'}
                ${isActive ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
              `}
              onClick={() => isClickable && setCurrentStep(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStepStatusIcon(step)}
                  <span className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {step.stepName}
                  </span>
                  {isActive && <FaChevronRight className="text-blue-500 text-xs" />}
                </div>
                <span className={`text-xs font-bold ${step.isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {Math.round(step.completionPercentage)}%
                </span>
              </div>

              {/* Progress bar for each step */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step.isCompleted 
                      ? 'bg-green-500' 
                      : step.warnings.length > 0 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(step.completionPercentage, 2)}%` }}
                />
              </div>

              {/* Missing fields indicator */}
              {step.missingFields.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Còn thiếu: {step.missingFields.length} trường bắt buộc
                </div>
              )}

              {/* Warnings */}
              {step.warnings.length > 0 && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {step.warnings.length} gợi ý cải thiện
                </div>
              )}

              {/* Time estimate */}
              {step.estimatedTimeRemaining && step.estimatedTimeRemaining > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <FaClock />
                  <span>~{formatTime(step.estimatedTimeRemaining)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Step Recommendation */}
      {!overallProgress.currentStepProgress.isCompleted && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Tiếp theo:
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {overallProgress.currentStepProgress.missingFields.length > 0 
              ? `Hoàn thành ${overallProgress.currentStepProgress.missingFields.length} trường còn thiếu`
              : 'Kiểm tra và cải thiện chất lượng nội dung'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicProgressIndicator;
