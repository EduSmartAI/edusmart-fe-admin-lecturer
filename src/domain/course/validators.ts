/**
 * Domain Validators for Course
 * Pure validation functions
 */

import type { Course, CourseInformation, CourseModule } from './models';

// ============================================
// Course Information Validators
// ============================================

export const validateCourseInformation = (info: Partial<CourseInformation>): string[] => {
  const errors: string[] = [];

  if (!info.teacherId) errors.push('Teacher ID is required');
  if (!info.subjectId) errors.push('Subject ID is required');
  if (!info.title || info.title.trim() === '') errors.push('Course title is required');
  if (info.price === undefined || info.price === null) errors.push('Course price is required');
  if (info.price !== undefined && info.price < 0) errors.push('Course price must be non-negative');
  
  if (info.dealPrice !== undefined) {
    if (info.dealPrice < 0) errors.push('Deal price must be non-negative');
    if (info.price !== undefined && info.dealPrice > info.price) {
      errors.push('Deal price cannot be higher than regular price');
    }
  }

  if (info.level !== undefined && (info.level < 1 || info.level > 3)) {
    errors.push('Course level must be 1 (Beginner), 2 (Intermediate), or 3 (Advanced)');
  }

  return errors;
};

// ============================================
// Module Validators
// ============================================

export const validateModule = (module: Partial<CourseModule>): string[] => {
  const errors: string[] = [];

  if (!module.moduleName || module.moduleName.trim() === '') {
    errors.push('Module name is required');
  }

  if (module.positionIndex === undefined || module.positionIndex < 0) {
    errors.push('Module position index must be non-negative');
  }

  if (module.lessons && module.lessons.length === 0) {
    errors.push('Module must have at least one lesson');
  }

  return errors;
};

// ============================================
// Complete Course Validator
// ============================================

export const validateCourse = (course: Partial<Course>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate course information
  if (course.courseInformation) {
    errors.push(...validateCourseInformation(course.courseInformation));
  } else {
    errors.push('Course information is required');
  }

  // Validate objectives
  if (!course.objectives || course.objectives.length === 0) {
    errors.push('At least one learning objective is required');
  }

  // Validate target audience
  if (!course.targetAudience || course.targetAudience.length === 0) {
    errors.push('At least one target audience is required');
  }

  // Validate modules (for published courses)
  if (course.courseInformation?.isActive) {
    if (!course.modules || course.modules.length === 0) {
      errors.push('At least one module is required for active courses');
    } else {
      course.modules.forEach((module, index) => {
        const moduleErrors = validateModule(module);
        if (moduleErrors.length > 0) {
          errors.push(`Module ${index + 1}: ${moduleErrors.join(', ')}`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================
// ID Duplicate Validators
// ============================================

export const checkForDuplicateIds = (items: Array<{ id?: string }>): boolean => {
  const ids = items.map(item => item.id).filter(Boolean);
  return new Set(ids).size !== ids.length;
};

export const validateNoDuplicateIds = (course: Partial<Course>): string[] => {
  const errors: string[] = [];

  if (course.objectives && checkForDuplicateIds(course.objectives)) {
    errors.push('Duplicate objective IDs found');
  }

  if (course.requirements && checkForDuplicateIds(course.requirements)) {
    errors.push('Duplicate requirement IDs found');
  }

  if (course.targetAudience && checkForDuplicateIds(course.targetAudience)) {
    errors.push('Duplicate audience IDs found');
  }

  if (course.modules) {
    course.modules.forEach((module, idx) => {
      if (module.objectives && checkForDuplicateIds(module.objectives)) {
        errors.push(`Duplicate objective IDs in module ${idx + 1}`);
      }
      if (module.lessons && checkForDuplicateIds(module.lessons)) {
        errors.push(`Duplicate lesson IDs in module ${idx + 1}`);
      }
    });
  }

  return errors;
};













