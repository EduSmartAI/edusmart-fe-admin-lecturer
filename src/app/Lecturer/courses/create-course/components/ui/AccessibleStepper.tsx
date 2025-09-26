'use client';
import { FC, useCallback, useRef } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useProgressTracking, StepProgress } from '../../hooks/useProgressTracking';
import { FaCheck, FaExclamationTriangle, FaLock } from 'react-icons/fa';

interface AccessibleStepperProps {
  className?: string;
  isEditMode?: boolean;
}

const AccessibleStepper: FC<AccessibleStepperProps> = ({ className = '', isEditMode = false }) => {
  const { currentStep, setCurrentStep } = useCreateCourseStore();
  const { stepProgress } = useProgressTracking(isEditMode);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleStepClick = useCallback((stepIndex: number) => {
    const step = stepProgress[stepIndex];
    const isClickable = stepIndex <= currentStep || step.completionPercentage >= 80;

    if (isClickable) {
      setCurrentStep(stepIndex);
      // Announce step change to screen readers
      const announcement = `Đã chuyển đến ${step.stepName}. ${
        step.isCompleted ? 'Đã hoàn thành.' :
        `${Math.round(step.completionPercentage)}% hoàn thành.`
      }`;

      // Create temporary announcement element
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);

      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }
  }, [currentStep, stepProgress, setCurrentStep]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, stepIndex: number) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = stepIndex > 0 ? stepIndex - 1 : stepProgress.length - 1;
        stepRefs.current[prevIndex]?.focus();
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = stepIndex < stepProgress.length - 1 ? stepIndex + 1 : 0;
        stepRefs.current[nextIndex]?.focus();
        break;

      case 'Home':
        event.preventDefault();
        stepRefs.current[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        stepRefs.current[stepProgress.length - 1]?.focus();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        handleStepClick(stepIndex);
        break;
    }
  }, [stepProgress.length, handleStepClick]);

  const getStepStatus = (step: StepProgress, index: number) => {
    if (index < currentStep) {
      return 'completed';
    }
    if (index === currentStep) {
      if (step.warnings.length > 0) return 'warning';
      return 'in-progress';
    }
    return 'not-started';
  };

  const getStepStatusText = (step: StepProgress, status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'warning':
        return `${step.warnings.length} gợi ý`;
      case 'in-progress':
        return `${Math.round(step.completionPercentage)}% hoàn thành`;
      case 'not-started':
      default:
        return 'Chưa bắt đầu';
    }
  };

  const getStepAriaLabel = (step: StepProgress, stepIndex: number, status: string) => {
    const position = `Bước ${stepIndex + 1} của ${stepProgress.length}`;
    const statusText = getStepStatusText(step, status);
    const warnings = step.warnings.length > 0 ? `, ${step.warnings.length} gợi ý cải thiện` : '';
    const isClickable = stepIndex <= currentStep || step.completionPercentage >= 80;
    const clickableText = isClickable ? '' : ', không thể truy cập';
    return `${position}: ${step.stepName}, ${statusText}${warnings}${clickableText}`;
  };

  return (
    <nav className={className} aria-label="Tiến trình tạo khóa học">
      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {stepProgress.map((step, index) => {
          const isActive = index === currentStep;
          const isClickable = index <= currentStep || step.completionPercentage >= 80;
          const status = getStepStatus(step, index);

          const statusClasses = {
            completed: 'bg-green-500',
            warning: 'bg-yellow-500',
            'in-progress': 'bg-blue-500',
            'not-started': 'bg-gray-300 dark:bg-gray-500',
          };

          const textClasses = {
            completed: 'text-green-600 dark:text-green-400',
            warning: 'text-yellow-600 dark:text-yellow-400',
            'in-progress': 'text-blue-600 dark:text-blue-400',
            'not-started': 'text-gray-500 dark:text-gray-400',
          };

          return (
            <li key={step.stepId} className="mb-4 ml-8 last:mb-0">
              <span
                className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white dark:ring-gray-800 ${statusClasses[status]}`}
              >
                {status === 'completed' ? <FaCheck className="text-white" size={12} /> :
                 status === 'warning' ? <FaExclamationTriangle className="text-white" size={12} /> :
                 !isClickable ? <FaLock className="text-white" size={10} /> :
                 <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400 dark:bg-gray-200'}`} />
                }
              </span>
              <button
                ref={(el) => { stepRefs.current[index] = el; }}
                type="button"
                onClick={() => handleStepClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={!isClickable}
                aria-label={getStepAriaLabel(step, index, status)}
                aria-current={isActive ? 'step' : undefined}
                className={`w-full text-left p-2 rounded-md transition-all duration-200 ease-in-out ${isClickable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-not-allowed opacity-50'} ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 shadow-sm' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500`}
              >
                <h3 className={`font-bold text-md ${isActive ? 'text-blue-800 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {step.stepName}
                </h3>
                <p className={`text-sm font-medium ${textClasses[status]}`}>
                  {getStepStatusText(step, status)}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );

};

export default AccessibleStepper;
