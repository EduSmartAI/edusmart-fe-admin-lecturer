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

// Mock data for development
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Lập trình ReactJS cho người mới bắt đầu',
    description: 'Khóa học toàn diện về ReactJS từ cơ bản đến nâng cao',
    status: 'published',
    price: 299000,
    currency: 'VND',
    studentCount: 156,
    category: 'Javascript',
    level: 'beginner',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    lecturerId: 'lecturer-1',
    lecturerName: 'Maria Kelly',
    duration: 40,
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: '2',
    title: 'Java Spring Boot Fundamentals',
    description: 'Học cách xây dựng ứng dụng web với Spring Boot',
    status: 'published',
    price: 399000,
    currency: 'VND',
    studentCount: 203,
    category: 'Java',
    level: 'intermediate',
    coverImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    lecturerId: 'lecturer-1',
    lecturerName: 'Maria Kelly',
    duration: 60,
    rating: 4.6,
    reviewCount: 124,
  },
  {
    id: '3',
    title: 'Node.js và Express.js từ A đến Z',
    description: 'Xây dựng API và ứng dụng backend với Node.js',
    status: 'draft',
    price: 349000,
    currency: 'VND',
    studentCount: 0,
    category: 'Javascript',
    level: 'intermediate',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-25'),
    lecturerId: 'lecturer-1',
    lecturerName: 'Maria Kelly',
    duration: 45,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: '4',
    title: 'C# và .NET Core Development',
    description: 'Phát triển ứng dụng enterprise với C# và .NET Core',
    status: 'published',
    price: 449000,
    currency: 'VND',
    studentCount: 87,
    category: 'CSharp',
    level: 'advanced',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-28'),
    lecturerId: 'lecturer-1',
    lecturerName: 'Maria Kelly',
    duration: 80,
    rating: 4.9,
    reviewCount: 67,
  },
  {
    id: '5',
    title: 'Database Design và SQL Optimization',
    description: 'Thiết kế cơ sở dữ liệu hiệu quả và tối ưu hóa truy vấn',
    status: 'archived',
    price: 199000,
    currency: 'VND',
    studentCount: 45,
    category: 'Database',
    level: 'intermediate',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2024-01-10'),
    lecturerId: 'lecturer-1',
    lecturerName: 'Maria Kelly',
    duration: 35,
    rating: 4.4,
    reviewCount: 32,
  },
];
