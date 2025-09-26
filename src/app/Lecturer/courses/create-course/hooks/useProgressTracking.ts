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

export const useProgressTracking = (isEditMode: boolean = false) => {
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

      if (totalLessons < modules.length) {
        warnings.push('Mỗi chương nên có ít nhất 1 video bài học');
      }

      // Check each module has at least one video lesson
      const modulesWithoutVideoLessons = modules.filter(module => 
        !module.lessons || 
        module.lessons.length === 0 || 
        !module.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
      );

      if (modulesWithoutVideoLessons.length > 0) {
        warnings.push(`${modulesWithoutVideoLessons.length} chương chưa có video bài học`);
      }

      const completionPercentage = modules.length > 0 ? 
        ((modules.length - modulesWithoutContent.length) / modules.length) * 100 : 0;

      return {
        stepId: 2,
        stepName: 'Nội dung bài học',
        isCompleted: modulesWithoutVideoLessons.length === 0 && modules.length > 0,
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

    // Step 4: Course Analytics & Review OR Confirm Update - Final step
    const courseFinalStepProgress = (): StepProgress => {
      // Check if all previous steps are complete enough for publication/update
      const requiredFields = [isEditMode ? 'updateReview' : 'courseReview'];
      const completedFields: string[] = [];
      const warnings: string[] = [];

      // Check if basic course info is complete
      const courseInfoComplete = courseInformation.title?.trim() && 
                                courseInformation.description?.trim() && 
                                courseInformation.price && courseInformation.price > 0;

      // Check if curriculum is complete
      const hasModules = modules.length > 0;
      const modulesComplete = modules.every(module => 
        module.moduleName?.trim() && (module.durationMinutes || 0) > 0
      );

      // Check if content exists
      const hasContent = modules.some(module => 
        module.lessons && module.lessons.length > 0
      );

      if (courseInfoComplete && hasModules && modulesComplete && hasContent) {
        completedFields.push(isEditMode ? 'updateReview' : 'courseReview');
      }

      // Add warnings for incomplete sections
      if (!courseInfoComplete) {
        warnings.push('Thông tin khóa học chưa đầy đủ');
      }
      if (!hasModules || !modulesComplete) {
        warnings.push('Chương trình học chưa hoàn thiện');
      }
      if (!hasContent) {
        warnings.push('Chưa có nội dung bài học');
      }

      const completionPercentage = (completedFields.length / requiredFields.length) * 100;

      return {
        stepId: 4,
        stepName: isEditMode ? 'Xác nhận cập nhật' : 'Phân tích',
        isCompleted: completedFields.length === requiredFields.length,
        completionPercentage,
        requiredFields,
        completedFields,
        missingFields: requiredFields.filter(field => !completedFields.includes(field)),
        warnings,
        estimatedTimeRemaining: completedFields.length === 0 ? 10 : 0
      };
    };

    return [
      courseInfoProgress(),
      curriculumProgress(),
      contentProgress(),
      pricingProgress(),
      courseFinalStepProgress()
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
