'use client';
import { useMemo } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

export interface StepProgress {
  stepId: number;
  stepName: string;
  isCompleted: boolean;
  completionPercentage: number;
  requiredFields: string[];
  completedFields: string[];
  missingFields: string[];
  warnings: string[];
  estimatedTimeRemaining?: number;
}

export interface OverallProgress {
  totalPercentage: number;
  completedSteps: number;
  totalSteps: number;
  currentStepProgress: StepProgress;
  allStepsProgress: StepProgress[];
  canProceedToNext: boolean;
  estimatedTimeToComplete?: number;
}

export const useProgressTracking = () => {
  const { 
    courseInformation, 
    modules, 
    currentStep 
  } = useCreateCourseStore();

  const stepProgressCalculations = useMemo(() => {
    // Step 0: Course Information
    const courseInfoProgress = (): StepProgress => {
      const requiredFields = [
        'title', 'description', 'subjectCode', 'level', 
        'courseImageUrl', 'price'
      ];
      const completedFields: string[] = [];
      const warnings: string[] = [];

      // Check required fields
      if (courseInformation.title?.trim()) completedFields.push('title');
      if (courseInformation.description?.trim()) completedFields.push('description');
      if (courseInformation.subjectCode?.trim()) completedFields.push('subjectCode');
      if (courseInformation.level) completedFields.push('level');
      if (courseInformation.courseImageUrl?.trim()) completedFields.push('courseImageUrl');
      if (courseInformation.price && courseInformation.price > 0) completedFields.push('price');

      // Quality warnings
      if (courseInformation.title && courseInformation.title.length > 60) {
        warnings.push('Tiêu đề nên dưới 60 ký tự để dễ đọc');
      }
      if (courseInformation.price && courseInformation.price < 50000) {
        warnings.push('Giá thấp có thể ảnh hưởng đến nhận thức chất lượng');
      }

      const completionPercentage = (completedFields.length / requiredFields.length) * 100;
      const missingFields = requiredFields.filter(field => !completedFields.includes(field));

      return {
        stepId: 0,
        stepName: 'Thông tin khóa học',
        isCompleted: completedFields.length === requiredFields.length,
        completionPercentage,
        requiredFields,
        completedFields,
        missingFields,
        warnings,
        estimatedTimeRemaining: missingFields.length * 2 // 2 minutes per field
      };
    };

    // Step 1: Curriculum (Modules)
    const curriculumProgress = (): StepProgress => {
      const requiredFields = ['modules'];
      const completedFields: string[] = [];
      const warnings: string[] = [];

      if (modules.length > 0) {
        completedFields.push('modules');
      }

      // Quality checks
      if (modules.length < 3) {
        warnings.push('Khóa học nên có ít nhất 3 chương để đảm bảo chất lượng');
      }

      const incompleteModules = modules.filter(module => 
        !module.moduleName?.trim() || 
        !module.description?.trim() || 
        (module.durationMinutes || 0) === 0
      );

      if (incompleteModules.length > 0) {
        warnings.push(`${incompleteModules.length} chương chưa hoàn thiện thông tin`);
      }

      const totalDuration = modules.reduce((sum, module) => sum + (module.durationMinutes || 0), 0);
      if (totalDuration < 60) {
        warnings.push('Tổng thời lượng khóa học nên ít nhất 60 phút');
      }

      const completionPercentage = modules.length > 0 ? 
        ((modules.length - incompleteModules.length) / modules.length) * 100 : 0;

      return {
        stepId: 1,
        stepName: 'Giáo trình',
        isCompleted: modules.length >= 2 && incompleteModules.length === 0,
        completionPercentage,
        requiredFields,
        completedFields,
        missingFields: completedFields.length === 0 ? ['modules'] : [],
        warnings,
        estimatedTimeRemaining: (modules.length === 0 ? 15 : incompleteModules.length * 5)
      };
    };

    // Step 2: Course Content (Lessons)
    const contentProgress = (): StepProgress => {
      const requiredFields = ['moduleContent'];
      const completedFields: string[] = [];
      const warnings: string[] = [];

      const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);

      if (totalLessons > 0) {
        completedFields.push('moduleContent');
      }

      // Quality checks
      const modulesWithoutContent = modules.filter(module => 
        !module.lessons || module.lessons.length === 0
      );

      if (modulesWithoutContent.length > 0) {
        warnings.push(`${modulesWithoutContent.length} chương chưa có nội dung`);
      }

      if (totalLessons < modules.length * 2) {
        warnings.push('Mỗi chương nên có ít nhất 2 bài học');
      }

      // Check for video content
      const hasVideo = modules.some(module => 
        module.lessons?.some(lesson => lesson.videoUrl)
      );

      if (!hasVideo) {
        warnings.push('Khóa học nên có ít nhất 1 video bài giảng');
      }

      const completionPercentage = modules.length > 0 ? 
        ((modules.length - modulesWithoutContent.length) / modules.length) * 100 : 0;

      return {
        stepId: 2,
        stepName: 'Nội dung bài học',
        isCompleted: totalLessons >= modules.length && modulesWithoutContent.length === 0,
        completionPercentage,
        requiredFields,
        completedFields,
        missingFields: totalLessons === 0 ? ['moduleContent'] : [],
        warnings,
        estimatedTimeRemaining: modulesWithoutContent.length * 10
      };
    };

    // Step 3: Pricing
    const pricingProgress = (): StepProgress => {
      const requiredFields = ['basePrice'];
      const completedFields: string[] = [];
      const warnings: string[] = [];

      if (courseInformation.price && courseInformation.price > 0) {
        completedFields.push('basePrice');
      }

      // Quality checks
      if (courseInformation.price && courseInformation.price < 50000) {
        warnings.push('Giá thấp có thể ảnh hưởng đến nhận thức chất lượng khóa học');
      }

      if (courseInformation.dealPrice && courseInformation.dealPrice >= courseInformation.price) {
        warnings.push('Giá giảm phải nhỏ hơn giá gốc');
      }

      const completionPercentage = (completedFields.length / requiredFields.length) * 100;

      return {
        stepId: 3,
        stepName: 'Giá khóa học',
        isCompleted: completedFields.length === requiredFields.length,
        completionPercentage,
        requiredFields,
        completedFields,
        missingFields: requiredFields.filter(field => !completedFields.includes(field)),
        warnings,
        estimatedTimeRemaining: completedFields.length === 0 ? 5 : 0
      };
    };

    // Step 4: Course Analytics (placeholder)
    const courseAnalyticsProgress = (): StepProgress => {
      return {
        stepId: 4,
        stepName: 'Phân tích',
        isCompleted: false,
        completionPercentage: 0,
        requiredFields: [],
        completedFields: [],
        missingFields: [],
        warnings: [],
        estimatedTimeRemaining: 0
      };
    };

    // Step 5: Publish (placeholder)
    const publishProgress = (): StepProgress => {
      return {
        stepId: 5,
        stepName: 'Xuất bản',
        isCompleted: false,
        completionPercentage: 0,
        requiredFields: ['review'],
        completedFields: [],
        missingFields: ['review'],
        warnings: [],
        estimatedTimeRemaining: 5
      };
    };

    return [
      courseInfoProgress(),
      curriculumProgress(),
      contentProgress(),
      pricingProgress(),
      courseAnalyticsProgress(),
      publishProgress()
    ];
  }, [courseInformation, modules]);

  const overallProgress = useMemo((): OverallProgress => {
    const completedSteps = stepProgressCalculations.filter(step => step.isCompleted).length;
    const totalSteps = stepProgressCalculations.length;
    const totalPercentage = stepProgressCalculations.reduce((sum, step) => sum + step.completionPercentage, 0) / totalSteps;
    
    const currentStepProgress = stepProgressCalculations[currentStep] || stepProgressCalculations[0];
    const canProceedToNext = currentStepProgress.isCompleted || currentStepProgress.completionPercentage >= 80;
    
    const estimatedTimeToComplete = stepProgressCalculations.reduce((sum, step) => 
      sum + (step.estimatedTimeRemaining || 0), 0
    );

    return {
      totalPercentage,
      completedSteps,
      totalSteps,
      currentStepProgress,
      allStepsProgress: stepProgressCalculations,
      canProceedToNext,
      estimatedTimeToComplete
    };
  }, [stepProgressCalculations, currentStep]);

  return {
    overallProgress,
    stepProgress: stepProgressCalculations,
    currentStepProgress: overallProgress.currentStepProgress
  };
};
