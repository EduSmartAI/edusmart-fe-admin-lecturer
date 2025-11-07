/**
 * Course Service
 * Handles all course-related API operations
 * Single Responsibility: API communication and data transformation
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { courseServiceAPI } from 'EduSmart/api/api-course-service';
import { quizServiceAPI } from 'EduSmart/api/api-quiz-service';
import type { Course, CourseModule, OperationResult, CoursePagination, CourseFilters } from 'EduSmart/domain/course/models';
import type { CourseDto, CourseDetailDto } from 'EduSmart/api/api-course-service';
import { transformToCreateDto, transformToUpdateDto, transformToUpdateWithModulesDto, transformModulesForUpdate, buildCourseQuizUpdatePayload } from './courseTransformers';
import { validateCourse, validateNoDuplicateIds } from 'EduSmart/domain/course/validators';

// ============================================
// Helper: Get Current Teacher ID
// ============================================

const getCurrentTeacherId = async (): Promise<string> => {
  try {
    const { getUserIdFromTokenAction } = await import('EduSmart/app/(auth)/action');
    const userInfo = await getUserIdFromTokenAction();
    
    if (userInfo.ok && userInfo.userId) {
      return userInfo.userId;
    }
    
    throw new Error('Unable to get teacher ID from authentication token');
  } catch (error) {
    throw new Error(
      'Failed to authenticate: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
};

// ============================================
// Query Operations
// ============================================

export const fetchAllCourses = async (
  filters?: CourseFilters,
  pagination?: Partial<CoursePagination>
): Promise<OperationResult<{ courses: CourseDto[]; pagination: CoursePagination }>> => {
  try {
    const response = await courseServiceAPI.getCourses({
      pageIndex: pagination?.pageIndex || 1,
      pageSize: pagination?.pageSize || 10,
      search: filters?.search,
      subjectCode: filters?.subjectCode,
      isActive: filters?.isActive,
      sortBy: filters?.sortBy
    });

    if (response.success && response.response) {
      const { data, ...paginationData } = response.response;
      
      return {
        success: true,
        data: {
          courses: data || [],
          pagination: {
            pageIndex: paginationData.pageIndex || 1,
            pageSize: paginationData.pageSize || 10,
            totalCount: paginationData.totalCount,
            totalPages: paginationData.totalPages,
            hasPreviousPage: paginationData.hasPreviousPage,
            hasNextPage: paginationData.hasNextPage
          }
        }
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to fetch courses'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const fetchCoursesByTeacher = async (
  teacherId: string,
  filters?: CourseFilters,
  pagination?: Partial<CoursePagination>
): Promise<OperationResult<{ courses: CourseDto[]; pagination: CoursePagination }>> => {
  try {
    const response = await courseServiceAPI.getCoursesByLecturer({
      lectureId: teacherId,
      pageIndex: pagination?.pageIndex || 1,
      pageSize: pagination?.pageSize || 10,
      search: filters?.search,
      subjectCode: filters?.subjectCode,
      isActive: filters?.isActive,
      sortBy: filters?.sortBy
    });

    if (response.success && response.response) {
      const { data, ...paginationData } = response.response;
      
      return {
        success: true,
        data: {
          courses: data || [],
          pagination: {
            pageIndex: paginationData.pageIndex || 1,
            pageSize: paginationData.pageSize || 10,
            totalCount: paginationData.totalCount,
            totalPages: paginationData.totalPages,
            hasPreviousPage: paginationData.hasPreviousPage,
            hasNextPage: paginationData.hasNextPage
          }
        }
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to fetch teacher courses'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const fetchCourseById = async (
  courseId: string
): Promise<OperationResult<CourseDetailDto>> => {
  try {
    const response = await courseServiceAPI.getCourseById(courseId);

    if (response.success && response.response) {
      return {
        success: true,
        data: response.response
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to fetch course details'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// ============================================
// Create Operation
// ============================================

export const createCourse = async (course: Course): Promise<OperationResult<string>> => {
  try {
    // Validate course data
    const validation = validateCourse(course);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Check for duplicate IDs
    const duplicateErrors = validateNoDuplicateIds(course);
    if (duplicateErrors.length > 0) {
      return {
        success: false,
        error: `Duplicate IDs found: ${duplicateErrors.join(', ')}`
      };
    }

    // Get current teacher ID
    const teacherId = await getCurrentTeacherId();

    // Transform to DTO
    const createDto = await transformToCreateDto(course, teacherId);

    // Call API
    const response = await courseServiceAPI.createCourse(createDto);

    if (response.success && response.response) {
      return {
        success: true,
        data: response.response,
        message: 'Course created successfully'
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to create course'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// ============================================
// Update Operations
// ============================================

export const updateCourseBasicInfo = async (
  courseId: string,
  course: Course
): Promise<OperationResult<CourseDetailDto>> => {
  try {
    // Validate required fields
    const validation = validateCourse(course);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Get current teacher ID
    const teacherId = await getCurrentTeacherId();

    // Transform to update DTO (without modules)
    const updateDto = await transformToUpdateDto(course, teacherId);

    // Call API
    const response = await courseServiceAPI.updateCourse(courseId, updateDto);

    if (response.success && response.response) {
      return {
        success: true,
        data: response.response,
        message: 'Course updated successfully'
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to update course'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const updateCourseComplete = async (
  courseId: string,
  course: Course
): Promise<OperationResult<CourseDetailDto>> => {
  try {

    // Validate course data
    const validation = validateCourse(course);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Check for duplicate IDs
    const duplicateErrors = validateNoDuplicateIds(course);
    if (duplicateErrors.length > 0) {
      return {
        success: false,
        error: `Duplicate IDs found: ${duplicateErrors.join(', ')}`
      };
    }

    // Get current teacher ID
    const teacherId = await getCurrentTeacherId();

    // Transform to complete update DTO (with modules)
    const updateDto = await transformToUpdateWithModulesDto(course, teacherId);

    // Call API - using updateCourse instead of non-existent updateCourseWithModules
    const response = await courseServiceAPI.updateCourse(courseId, updateDto as any);

    if (response.success && response.response) {
      return {
        success: true,
        data: response.response,
        message: 'Course updated successfully'
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to update course'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const updateCourseModules = async (
  courseId: string,
  course: Course
): Promise<OperationResult<any>> => {
  try {
    // Validate course data
    const validation = validateCourse(course);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Check for duplicate IDs in modules
    const duplicateErrors = validateNoDuplicateIds(course);
    if (duplicateErrors.length > 0) {
      return {
        success: false,
        error: `Duplicate IDs found: ${duplicateErrors.join(', ')}`
      };
    }

    // Transform modules to update DTO
    const modulesDto = transformModulesForUpdate(course.modules);

    // Call the new updateModules API endpoint
    const response = await courseServiceAPI.updateCourseModules(courseId, modulesDto);

    if (response.success) {
      return {
        success: true,
        data: response.response,
        message: 'Course modules updated successfully'
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to update course modules'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const updateCourseQuizzes = async (
  courseId: string,
  modules: CourseModule[],
  editedQuizIds?: Set<string>
): Promise<OperationResult<any>> => {
  try {
    const payload = buildCourseQuizUpdatePayload(modules, editedQuizIds);

    if (payload.quizzes.length === 0) {
      return {
        success: true,
        data: null,
        message: 'No quiz changes detected',
      };
    }

    if (typeof window !== 'undefined') {
      const res = await fetch('/api/course-quizzes/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, quizzes: payload.quizzes }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Failed to update course quizzes',
        };
      }

      return {
        success: true,
        data: data.data ?? data.response ?? null,
        message: data.message || 'Course quizzes updated successfully',
      };
    }

    const response = await quizServiceAPI.updateCourseQuiz(courseId, payload);

    if (response.success) {
      return {
        success: true,
        data: response.response,
        message: response.message || 'Course quizzes updated successfully',
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to update course quizzes',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// ============================================
// Media Upload Operations
// ============================================

export const uploadCourseImage = async (file: File): Promise<OperationResult<string>> => {
  try {
    const url = await courseServiceAPI.uploadImage(file);
    
    return {
      success: true,
      data: url,
      message: 'Image uploaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    };
  }
};

export const uploadCourseVideo = async (file: File): Promise<OperationResult<string>> => {
  try {
    const url = await courseServiceAPI.uploadVideosUtility(file);
    
    return {
      success: true,
      data: url,
      message: 'Video uploaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload video'
    };
  }
};

export const uploadCourseDocument = async (file: File): Promise<OperationResult<string>> => {
  try {
    const url = await courseServiceAPI.uploadDocuments(file);
    
    return {
      success: true,
      data: url,
      message: 'Document uploaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload document'
    };
  }
};






