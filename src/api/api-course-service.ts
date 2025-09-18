import axios, { AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

// Base configuration from environment (configure in .env.local)
// Prefer NEXT_PUBLIC_COURSE_BASE_URL (e.g. https://api.edusmart.pro.vn/course)
// Fallback: compose from NEXT_PUBLIC_API_URL + '/course'
function resolveCourseBaseUrl(): string {
  const rawCourse = process.env.NEXT_PUBLIC_COURSE_BASE_URL ?? '';
  const course = rawCourse.replace(/\/$/, '');
  if (course) return course;

  const api = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  if (api) return `${api}/course`;

  if (typeof window !== 'undefined') {
    // Try runtime override via localStorage for DX without rebuild
    try {
      const fromStorage =
        window.localStorage.getItem('NEXT_PUBLIC_COURSE_BASE_URL') ||
        window.localStorage.getItem('NEXT_PUBLIC_API_URL');
      if (fromStorage) {
        const v = fromStorage.replace(/\/$/, '');
        return v.includes('/course') ? v : `${v}/course`;
      }
    } catch {}
  }
  
  // No fallback - require proper env configuration
  throw new Error('Missing NEXT_PUBLIC_COURSE_BASE_URL or NEXT_PUBLIC_API_URL. Define one in .env.local');
}

const COURSE_SERVICE_BASE_URL = resolveCourseBaseUrl();

const courseServiceApi = axios.create({
  baseURL: COURSE_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth + ngrok interceptor aligned with shared client
courseServiceApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = axios.AxiosHeaders.from(config.headers as AxiosRequestHeaders);
  const base = (config.baseURL ?? COURSE_SERVICE_BASE_URL) as string;
  const url = config.url ?? '';
  
  if (base.includes('ngrok') || url.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }
  const { token } = useAuthStore.getState();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    // Debug: ensure auth header is present for create request
    if (url?.includes('/api/v1/Courses') && config.method?.toLowerCase() === 'post') {
      try {
        const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : 'present';
        console.log('[CourseAPI] Auth token attached:', masked);
      } catch {}
    }
  }
  config.headers = headers as unknown as AxiosRequestHeaders;
  return config;
});

// Response types based on OpenAPI schema
export interface CourseDto {
  courseId: string;
  teacherId: string;
  subjectId: string;
  subjectCode?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  slug?: string;
  courseImageUrl?: string;
  learnerCount: number;
  durationMinutes?: number;
  durationHours?: number;
  level?: number;
  price: number;
  dealPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetailDto extends CourseDto {
  objectives?: CourseObjectiveDto[];
  requirements?: CourseRequirementDto[];
  modules?: ModuleDetailDto[];
}

export interface CourseObjectiveDto {
  objectiveId: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CourseRequirementDto {
  requirementId: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface ModuleDetailDto {
  moduleId: string;
  moduleName?: string;
  description?: string;
  positionIndex: number;
  isActive: boolean;
  isCore: boolean;
  durationMinutes?: number;
  durationHours?: number;
  level?: number;
  objectives?: ModuleObjectiveDto[];
  guestLessons?: GuestLessonDetailDto[];
}

export interface ModuleObjectiveDto {
  objectiveId: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface GuestLessonDetailDto {
  lessonId: string;
  title?: string;
  positionIndex: number;
  isActive: boolean;
}

// Request types
export interface CreateCourseDto {
  teacherId: string;
  subjectId: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  slug?: string;
  courseImageUrl?: string;
  durationMinutes?: number;
  level?: number;
  price: number;
  dealPrice?: number;
  isActive: boolean;
  objectives?: CreateCourseObjectiveDto[];
  requirements?: CreateCourseRequirementDto[];
  modules?: CreateModuleDto[];
}

export interface CreateCourseObjectiveDto {
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CreateCourseRequirementDto {
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CreateModuleDto {
  moduleName?: string;
  description?: string;
  positionIndex: number;
  isActive: boolean;
  isCore: boolean;
  durationMinutes?: number;
  level?: number;
  objectives?: CreateModuleObjectiveDto[];
  lessons?: CreateLessonDto[];
}

export interface CreateModuleObjectiveDto {
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CreateLessonDto {
  title?: string;
  videoUrl?: string;
  videoDurationSec?: number;
  positionIndex: number;
  isActive: boolean;
}

export interface UpdateCourseDto {
  teacherId: string;
  subjectId: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  slug?: string;
  courseImageUrl?: string;
  durationMinutes?: number;
  level?: number;
  price: number;
  dealPrice?: number;
  isActive: boolean;
  objectives?: UpdateCourseObjectiveDto[];
  requirements?: UpdateCourseRequirementDto[];
  modules?: UpdateModuleDto[];
}

export interface UpdateCourseObjectiveDto {
  objectiveId?: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface UpdateCourseRequirementDto {
  requirementId?: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface UpdateModuleDto {
  moduleId?: string;
  moduleName?: string;
  description?: string;
  positionIndex: number;
  isActive: boolean;
  isCore: boolean;
  durationMinutes?: number;
  level?: number;
  objectives?: UpdateModuleObjectiveDto[];
  lessons?: UpdateLessonDto[];
}

export interface UpdateModuleObjectiveDto {
  objectiveId?: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface UpdateLessonDto {
  lessonId?: string;
  title?: string;
  videoUrl?: string;
  videoDurationSec?: number;
  positionIndex: number;
  isActive: boolean;
}

// Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  messageId?: string;
  message?: string;
  detailErrors?: DetailError[];
  response: T;
}

export interface DetailError {
  field?: string;
  messageId?: string;
  errorMessage?: string;
}

export interface PaginatedResult<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data?: T[];
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type GetCoursesResponse = ApiResponse<PaginatedResult<CourseDto>>;

export interface GetCourseByIdResponse extends ApiResponse<CourseDetailDto> {
  modulesCount: number;
  lessonsCount: number;
}

export type CreateCourseResponse = ApiResponse<string>;

export type UpdateCourseResponse = ApiResponse<CourseDetailDto>;

// Query parameters
export interface GetCoursesQuery {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  subjectCode?: string;
  isActive?: boolean;
  sortBy?: CourseSortBy;
}

export enum CourseSortBy {
  CreatedAt = 1,
  UpdatedAt = 2,
  Title = 3,
  Price = 4
}

// API functions
export const courseServiceAPI = {
  // Get courses with pagination and filtering
  getCourses: async (query?: GetCoursesQuery): Promise<GetCoursesResponse> => {
    const response: AxiosResponse<GetCoursesResponse> = await courseServiceApi.get('/api/v1/Courses', {
      params: query ? {
        'Pagination.PageIndex': query.pageIndex,
        'Pagination.PageSize': query.pageSize,
        'Filter.Search': query.search,
        'Filter.SubjectCode': query.subjectCode,
        'Filter.IsActive': query.isActive,
        'Filter.SortBy': query.sortBy,
      } : undefined
    });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id: string): Promise<GetCourseByIdResponse> => {
    const response: AxiosResponse<GetCourseByIdResponse> = await courseServiceApi.get(`/api/v1/Courses/${id}`);
    return response.data;
  },

  // Create new course
  createCourse: async (courseData: CreateCourseDto): Promise<CreateCourseResponse> => {
    console.log('[CourseAPI] Base URL:', COURSE_SERVICE_BASE_URL);
    console.log('[CourseAPI] Request URL:', `${COURSE_SERVICE_BASE_URL}/api/v1/Courses`);
    console.log('[CourseAPI] Request payload:', { payload: courseData });
    try {
      const response: AxiosResponse<CreateCourseResponse> = await courseServiceApi.post('/api/v1/Courses', {
        payload: courseData
      });
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const headers = err?.response?.headers;
      console.error('[CourseAPI] Create failed', { status, data, headers });
      throw err;
    }
  },

  // Update existing course
  updateCourse: async (id: string, courseData: UpdateCourseDto): Promise<UpdateCourseResponse> => {
    const response: AxiosResponse<UpdateCourseResponse> = await courseServiceApi.put(`/api/v1/Courses/${id}`, courseData);
    return response.data;
  },

  // Upload course cover image; returns hosted URL
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      console.log('[CourseAPI] Uploading image:', file.name, 'Size:', file.size);
      console.log('[CourseAPI] Base URL:', COURSE_SERVICE_BASE_URL);
      console.log('[CourseAPI] Full URL:', `${COURSE_SERVICE_BASE_URL}/api/v1/Media/Images`);
      
      // Try the actual upload endpoint first
      try {
        const resp: AxiosResponse<ApiResponse<string>> = await courseServiceApi.post('/api/v1/Media/Images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('[CourseAPI] Image upload response:', resp.data);
        if (resp.data?.success && resp.data.response) return resp.data.response;
        // Some backends return raw URL string
        if (typeof (resp.data as any) === 'string') return resp.data as unknown as string;
        throw new Error(resp.data?.message || 'Image upload failed');
      } catch (endpointError: any) {
        console.log('[CourseAPI] Endpoint error details:', {
          status: endpointError?.response?.status,
          statusText: endpointError?.response?.statusText,
          data: endpointError?.response?.data,
          message: endpointError?.message,
        });
        
        // If the endpoint doesn't exist (404), create a mock URL for development
        if (endpointError?.response?.status === 404) {
          console.warn('[CourseAPI] Media upload endpoint not found, using mock URL for development');
          const mockUrl = `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${file.name}`;
          return mockUrl;
        }
        throw endpointError;
      }
    } catch (err: any) {
      console.error('[CourseAPI] Image upload failed', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      throw err;
    }
  },

  // Upload lesson video; returns hosted URL
  uploadVideo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      console.log('[CourseAPI] Uploading video:', file.name, 'Size:', file.size);
      
      // Try the actual upload endpoint first
      try {
        const resp: AxiosResponse<ApiResponse<string>> = await courseServiceApi.post('/api/v1/Media/Videos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          // ensure we still get a response object on 4xx to read status
          validateStatus: () => true,
        });
        if (resp.status === 413) {
          throw Object.assign(new Error('Video quá lớn (413). Vui lòng nén hoặc chọn file nhỏ hơn.'), { response: resp });
        }
        // Manually surface non-2xx as errors so the catch can handle 404 fallback, etc.
        if (resp.status < 200 || resp.status >= 300) {
          const error: any = new Error(resp.data?.message || `HTTP ${resp.status}`);
          error.response = resp;
          throw error;
        }
        console.log('[CourseAPI] Video upload response:', resp.data);
        if (resp.data?.success && resp.data.response) return resp.data.response;
        if (typeof (resp.data as any) === 'string') return resp.data as unknown as string;
        throw new Error(resp.data?.message || 'Video upload failed');
      } catch (endpointError: any) {
        console.log('[CourseAPI] Video endpoint error details:', {
          status: endpointError?.response?.status,
          statusText: endpointError?.response?.statusText,
          data: endpointError?.response?.data,
          message: endpointError?.message,
        });
        
        // If payload too large, surface error to user (do NOT fallback)
        if (endpointError?.response?.status === 413) {
          throw endpointError;
        }
        // If the endpoint doesn't exist (404), create a mock URL for development
        if (endpointError?.response?.status === 404) {
          console.warn('[CourseAPI] Media upload endpoint not found, using mock URL for development');
          const mockUrl = `https://res.cloudinary.com/demo/video/upload/v${Date.now()}/${file.name}`;
          return mockUrl;
        }
        throw endpointError;
      }
    } catch (err: any) {
      console.error('[CourseAPI] Video upload failed', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      throw err;
    }
  },
};
