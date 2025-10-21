// Re-export types from the API service for consistency
export type { 
  CourseDto,
  CourseDetailDto,
  CourseObjectiveDto,
  CourseRequirementDto,
  CourseTagDto,
  CreateCourseTagDto,
  ModuleDetailDto,
  ModuleObjectiveDto,
  GuestLessonDetailDto,
  CreateCourseDto,
  UpdateCourseDto,
  GetCoursesQuery,
  PaginatedResult,
  ApiResponse
} from 'EduSmart/api/api-course-service';
export { CourseSortBy } from 'EduSmart/api/api-course-service';

// Backward compatibility - map old Course interface to new API format
export interface Course {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  price: number;
  currency: string;
  studentCount: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  lecturerId: string;
  lecturerName: string;
  duration?: number; // in hours
  rating?: number;
  reviewCount?: number;
  tags?: CourseTag[];
}

// Course tag interface for UI
export interface CourseTag {
  tagId: number;
  tagName: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  coverImage?: File;
}

export interface CourseFilters {
  status?: Course['status'];
  category?: string;
  level?: Course['level'];
  search?: string;
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

// Course status enum for UI
export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived'
}

// Level mapping for UI display
export const CourseLevelMapping = {
  1: 'Beginner',
  2: 'Intermediate', 
  3: 'Advanced'
} as const;

export type CourseLevelKey = keyof typeof CourseLevelMapping;

// Helper function to get level display text
export const getCourseLevelText = (level?: number): string => {
  if (!level || !CourseLevelMapping[level as CourseLevelKey]) {
    return 'Beginner';
  }
  return CourseLevelMapping[level as CourseLevelKey];
};

// Helper function to format course duration
export const formatCourseDuration = (durationMinutes?: number): string => {
  if (!durationMinutes) return '0 phút';
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} phút`;
  } else if (minutes === 0) {
    return `${hours} giờ`;
  } else {
    return `${hours} giờ ${minutes} phút`;
  }
};

// Helper function to format price
export const formatPrice = (price: number, dealPrice?: number): { 
  display: string; 
  original?: string; 
  hasDiscount: boolean 
} => {
  const formatVND = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

  if (dealPrice && dealPrice < price) {
    return {
      display: formatVND(dealPrice),
      original: formatVND(price),
      hasDiscount: true
    };
  }

  return {
    display: formatVND(price),
    hasDiscount: false
  };
};
