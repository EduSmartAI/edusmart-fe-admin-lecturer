/// <reference lib="dom" />
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Question Types for Quizzes
 */
export enum QuestionType {
  MultipleChoice = 1,
  TrueFalse = 2,
  SingleChoice = 3,
}

/**
 * Cấu hình chung cho mọi API client
 */
export interface ApiConfig {
  baseUrl: string;
  customFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

/** Tham số mở rộng cho request */
export interface RequestParams {
  secure?: boolean;
  headers?: Record<string, string>;
}

/**
 * HttpClient base dùng fetch hoặc axiosFetch để gọi API
 */
export abstract class HttpClient {
  protected baseUrl: string;
  protected customFetch: (
    input: RequestInfo,
    init?: RequestInit,
  ) => Promise<Response>;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.customFetch = config.customFetch ?? fetch;
  }

  protected async request<ResType>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
    params?: RequestParams,
    format: "json" | "text" | "blob" = "json",
  ): Promise<ResType> {
    const url = `${this.baseUrl}${path}`;
    const headers = params?.headers ?? { "Content-Type": "application/json" };
    
    const requestInit: RequestInit = {
      method,
      headers,
      mode: "cors",
    };

    if (body && (method === "POST" || method === "PUT")) {
      if (body instanceof FormData) {
        // Remove Content-Type for FormData to let browser set it with boundary
        delete headers["Content-Type"];
        requestInit.body = body;
      } else {
        requestInit.body = JSON.stringify(body);
      }
    }

    const res = await this.customFetch(url, requestInit);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} – ${res.statusText}`);
    }
    if (format === "text") {
      const text = await res.text();
      return text as unknown as ResType;
    }
    if (format === "blob") {
      const blob = await res.blob();
      return blob as unknown as ResType;
    }
    return (await res.json()) as ResType;
  }
}

// Import auth stores at module level to avoid async issues
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import { useValidateStore } from 'EduSmart/stores/Validate/ValidateStore';

/**
 * customFetch sử dụng axios bên trong, nhưng trả về đối tượng Response để tương thích fetch API
 * Sử dụng cùng pattern như apiClient để có auth handling nhất quán
 */
export const axiosFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = typeof input === "string" ? input : input.toString();
  const { method, headers, body, credentials } = init ?? {};
  
  // For course API, use access token for authorization
  let accessToken: string | null = null;
  
  // Try to get access token from localStorage first
  if (typeof window !== 'undefined') {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        accessToken = parsedAuth?.state?.accessToken;
      }
    } catch (storageError) {
      // Silent error handling
    }
    
    // Fallback: Try to get from server action if not in localStorage
    if (!accessToken) {
      try {
        const { getAccessTokenAction } = await import('EduSmart/app/(auth)/action');
        const result = await getAccessTokenAction();
        if (result.ok && result.accessToken) {
          accessToken = result.accessToken;
        }
      } catch (serverError) {
        // Silent error handling
      }
    }
  }
  
  // Prepare headers with access token
  let requestHeaders = headers as Record<string, string> || {};
  
  // Add Authorization header with access token
  if (accessToken) {
    requestHeaders = {
      ...requestHeaders,
      'Authorization': `Bearer ${accessToken}`,
    };
  } else {
    // Fallback: try to get access token from auth store as last resort
    const authState = useAuthStore.getState();
    const { token } = authState;
    
    if (token) {
      requestHeaders = {
        ...requestHeaders,
        'Authorization': `Bearer ${token}`,
      };
    } else {
      // Last resort: try to refresh tokens since user is logged in (JWT extraction worked)
      try {
        const { refreshAction } = await import('EduSmart/app/(auth)/action');
        const refreshResult = await refreshAction();
        
        if (refreshResult.ok && refreshResult.accessToken) {
          requestHeaders = {
            ...requestHeaders,
            'Authorization': `Bearer ${refreshResult.accessToken}`,
          };
        }
      } catch (refreshError) {
        // Silent error handling
      }
    }
  }

  // Add ngrok headers if needed
  const baseURL = resolveCourseBaseUrl();
  if (baseURL.includes('ngrok') || url.includes('ngrok')) {
    requestHeaders['ngrok-skip-browser-warning'] = 'true';
  }

  const config: AxiosRequestConfig = {
    url,
    method: method as AxiosRequestConfig["method"],
    headers: requestHeaders,
    data: body,
    withCredentials: credentials === "include",
  };

  // Create axios instance with base URL and interceptors
  const axiosInstance = axios.create({
    baseURL: resolveCourseBaseUrl(),
  });

  // Apply the same interceptors pattern from apiClient
  axiosInstance.interceptors.request.use((cfg) => {
    const h = axios.AxiosHeaders.from(cfg.headers);
    const base = cfg.baseURL ?? resolveCourseBaseUrl();
    const reqUrl = cfg.url ?? '';
    
    if (base.includes('ngrok') || reqUrl.includes('ngrok')) {
      h.set('ngrok-skip-browser-warning', 'true');
    }
    
    // Ensure auth token is always present - check both initial headers and store
    const currentToken = useAuthStore.getState().token;
    const existingAuth = h.get('Authorization');
    
    if (currentToken && !existingAuth) {
      h.set('Authorization', `Bearer ${currentToken}`);
    }
    
    cfg.headers = h;
    
    return cfg;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: any) => {
      const status = error.response?.status;
      const originalRequest = error.config;
      
      // Enhanced 400 error logging for course creation
      if (status === 400) {
        // Log minimal error info for debugging
      }
      
            if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Try to refresh access token via server action
        try {
          const { refreshAction } = await import('EduSmart/app/(auth)/action');
          const refreshResult = await refreshAction();
          
          if (refreshResult.ok && refreshResult.accessToken) {
            // Update the request with new access token
            originalRequest.headers = {
              ...originalRequest.headers,
              'Authorization': `Bearer ${refreshResult.accessToken}`,
            };
            
            return axiosInstance.request(originalRequest);
          }
        } catch (refreshError) {
          // Silent error handling
        }
      }
      
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to get fresh ID token from client-side cookies
          let newIdToken: string | null = null;
          
          // Try to refresh tokens first
          const authStore = useAuthStore.getState();
          if (authStore.refreshTokenValue) {
            try {
              await authStore.refreshToken();
              
              // After refresh, try to get ID token via server action
              try {
                const { getIdTokenAction } = await import('EduSmart/app/(auth)/action');
                const result = await getIdTokenAction();
                if (result.ok && result.idToken) {
                  newIdToken = result.idToken;
                }
              } catch (tokenError) {
                // Silent error handling
              }
            } catch (refreshError) {
              // Silent error handling
            }
          }
          
          if (newIdToken) {
            originalRequest.headers = axios.AxiosHeaders.from(originalRequest.headers);
            originalRequest.headers.set('Authorization', `Bearer ${newIdToken}`);
            originalRequest.headers.set('ngrok-skip-browser-warning', "true");
            return axiosInstance(originalRequest);
          } else {
            useAuthStore.getState().logout();
            useValidateStore.getState().setInValid(true);
          }
        } catch (recoveryError) {
          useAuthStore.getState().logout();
          useValidateStore.getState().setInValid(true);
        }
      }
      
      if ((status === 403 || status === 418) && !originalRequest._retry) {
        useAuthStore.getState().logout();
        useValidateStore.getState().setInValid(true);
      }
      
      return Promise.reject(error);
    },
  );

  const res: AxiosResponse = await axiosInstance(config);
  const blob = new Blob([JSON.stringify(res.data)], {
    type: "application/json",
  });
  return new Response(blob, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers as HeadersInit,
  });
};

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
  courseIntroVideoUrl?: string; // Video giới thiệu khóa học
  objectives?: CourseObjectiveDto[];
  requirements?: CourseRequirementDto[];
  audiences?: CourseAudienceDto[]; // Đối tượng học viên
  courseTags?: CourseTagDto[];
  modules?: ModuleDetailDto[];
}

export interface CourseObjectiveDto {
  objectiveId: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CourseTagDto {
  tagId: number;
  tagName?: string;
}

export interface CourseRequirementDto {
  requirementId: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CourseAudienceDto {
  audienceId: string;
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
  guestLessons?: GuestLessonDetailDto[]; // For guest endpoint compatibility
  lessons?: LectureLessonDetailDto[]; // For lecturer endpoint
  moduleDiscussionDetails?: ModuleDiscussionDto[]; // For lecturer endpoint
  moduleMaterialDetails?: ModuleMaterialDto[]; // For lecturer endpoint
  moduleQuiz?: ModuleQuizDto; // For lecturer endpoint
}

export interface ModuleObjectiveDto {
  objectiveId: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

// Guest lesson detail (limited info)
export interface GuestLessonDetailDto {
  lessonId: string;
  title?: string;
  positionIndex: number;
  isActive: boolean;
}

// Lecturer lesson detail (full info including video URL and quiz)
export interface LectureLessonDetailDto {
  lessonId: string;
  title?: string;
  videoUrl?: string;
  videoDurationSec?: number;
  positionIndex: number;
  isActive: boolean;
  lessonQuiz?: LessonQuizDto;
}

// Module discussion
export interface ModuleDiscussionDto {
  discussionId: string;
  title?: string;
  description?: string;
  discussionQuestion?: string;
  isActive: boolean;
}

// Module material
export interface ModuleMaterialDto {
  materialId: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  isActive: boolean;
}

// Module quiz
export interface ModuleQuizDto {
  id?: string;
  quizSettings?: QuizSettingsDto;
  questions?: QuestionDto[];
}

// Lesson quiz
export interface LessonQuizDto {
  id?: string;
  quizSettings?: QuizSettingsDto;
  questions?: QuestionDto[];
}

// Quiz settings
export interface QuizSettingsDto {
  durationMinutes?: number;
  passingScorePercentage?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
}

// Question DTO
export interface QuestionDto {
  questionId?: string;
  questionType: QuestionType;
  questionText?: string;
  explanation?: string;
  answers?: AnswerDto[];
}

// Answer DTO
export interface AnswerDto {
  answerId?: string;
  answerText?: string;
  isCorrect: boolean;
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
  courseIntroVideoUrl?: string; // Video giới thiệu khóa học
  durationMinutes?: number;
  level?: number;
  price: number;
  dealPrice?: number;
  isActive: boolean;
  objectives?: CreateCourseObjectiveDto[];
  requirements?: CreateCourseRequirementDto[];
  audiences?: CreateCourseAudienceDto[];
  courseTags?: CreateCourseTagDto[];
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

export interface CreateCourseAudienceDto {
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CreateCourseTagDto {
  tagId: number;
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
  discussions?: CreateDiscussionDto[]; // Optional: thảo luận
  materials?: CreateMaterialDto[]; // Optional: tài liệu
  moduleQuiz?: CreateModuleQuizDto;
}

export interface CreateModuleObjectiveDto {
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CreateModuleQuizDto {
  quizSettings?: CreateQuizSettingsDto;
  questions?: CreateQuestionDto[];
}

export interface CreateLessonDto {
  title?: string;
  videoUrl?: string;
  videoDurationSec?: number;
  positionIndex: number;
  isActive: boolean;
  lessonQuiz?: CreateLessonQuizDto;
}

export interface CreateLessonQuizDto {
  quizSettings?: CreateQuizSettingsDto;
  questions?: CreateQuestionDto[];
}

export interface CreateQuizSettingsDto {
  durationMinutes?: number;
  passingScorePercentage?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
}

export interface CreateQuestionDto {
  questionType: QuestionType;
  questionText?: string;
  options?: CreateQuestionOptionDto[];
  explanation?: string;
}

export interface CreateQuestionOptionDto {
  text?: string;
  isCorrect: boolean;
}

export interface CreateDiscussionDto {
  title?: string;
  description?: string;
  discussionQuestion?: string;
  isActive: boolean;
}

export interface CreateMaterialDto {
  title?: string;
  description?: string;
  fileUrl?: string;
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
  courseIntroVideoUrl?: string; // Video giới thiệu khóa học
  durationMinutes?: number;
  level?: number;
  price: number;
  dealPrice?: number;
  isActive: boolean;
  objectives?: UpdateCourseObjectiveDto[];
  requirements?: UpdateCourseRequirementDto[];
  audiences?: UpdateCourseAudienceDto[];
  courseTags?: UpdateCourseTagDto[];
}

export interface UpdateCoursePayload {
  courseId: string;
  payload: UpdateCourseDto;
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

export interface UpdateCourseAudienceDto {
  audienceId?: string; // Changed from targetAudienceId to match API
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface UpdateCourseTagDto {
  tagId: number;
}

export interface UpdateModuleDto {
  moduleId?: string;
  moduleName?: string;
  description?: string;
  positionIndex: number;
  isActive: boolean;
  isCore: boolean;
  durationMinutes?: number;
  durationHours?: number;
  level?: number;
  objectives?: UpdateModuleObjectiveDto[];
  lessons?: UpdateLessonDto[];
  moduleDiscussionDetails?: UpdateModuleDiscussionDto[];
  moduleMaterialDetails?: UpdateModuleMaterialDto[];
  discussions?: UpdateModuleDiscussionDto[];
  materials?: UpdateModuleMaterialDto[];
  moduleQuiz?: UpdateModuleQuizDto | null;
}

export interface UpdateModuleDiscussionDto {
  discussionId?: string;
  title?: string;
  description?: string;
  discussionQuestion?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateModuleMaterialDto {
  materialId?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateModuleObjectiveDto {
  objectiveId?: string;
  content?: string;
  positionIndex: number;
  isActive: boolean;
}

export interface UpdateModuleQuizDto {
  moduleQuizId?: string;
  quizSettings?: UpdateQuizSettingsDto;
  questions?: UpdateQuestionDto[];
}

export interface UpdateLessonDto {
  lessonId?: string;
  title?: string;
  videoUrl?: string;
  videoDurationSec?: number;
  positionIndex: number;
  isActive: boolean;
  lessonQuiz?: UpdateLessonQuizDto | null;
}

export interface UpdateLessonQuizDto {
  lessonQuizId?: string;
  quizSettings?: UpdateQuizSettingsDto;
  questions?: UpdateQuestionDto[];
}

export interface UpdateQuizSettingsDto {
  quizSettingsId?: string;
  durationMinutes?: number;
  passingScorePercentage?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
}

export interface UpdateQuestionDto {
  questionId?: string;
  questionType: QuestionType;
  questionText?: string;
  explanation?: string;
  answers?: UpdateAnswerDto[];
}

export interface UpdateAnswerDto {
  answerId?: string;
  answerText?: string;
  isCorrect?: boolean;
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
export type DeleteCourseResponse = ApiResponse<string | boolean>;

// Query parameters
export interface GetCoursesQuery {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  subjectCode?: string;
  isActive?: boolean;
  sortBy?: CourseSortBy;
}

export interface GetCoursesByLecturerQuery {
  pageIndex?: number;
  pageSize?: number;
  lectureId: string;
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

/**
 * Module gọi Course Service API với auth handling tự động
 */
export class ApiCourseModule extends HttpClient {
  constructor(config: ApiConfig) {
    super(config);
  }

  courses = {
    /**
     * @description Lấy danh sách khóa học với phân trang và lọc
     * @request GET:/api/v1/Courses
     */
    getAll: (query?: GetCoursesQuery, params?: RequestParams) => {
      const queryParams = query ? {
        'Pagination.PageIndex': query.pageIndex,
        'Pagination.PageSize': query.pageSize,
        'Filter.Search': query.search,
        'Filter.SubjectCode': query.subjectCode,
        'Filter.IsActive': query.isActive,
        'Filter.SortBy': query.sortBy,
      } : {};
      
      const queryString = new URLSearchParams(
        Object.entries(queryParams).filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString();
      
      const path = queryString ? `/api/v1/Courses?${queryString}` : '/api/v1/Courses';
      return this.request<GetCoursesResponse>(path, "GET", undefined, params);
    },

    /**
     * @description Lấy danh sách khóa học theo lecturer ID
     * @request GET:/api/v1/Courses/lecture
     */
    getByLecturer: (query: GetCoursesByLecturerQuery, params?: RequestParams) => {
      const queryParams: Record<string, any> = {
        'Pagination.PageIndex': query.pageIndex,
        'Pagination.PageSize': query.pageSize,
        'Filter.LectureId': query.lectureId,
      };
      
      // Only add optional filters if they have values
      if (query.search && query.search.trim()) {
        queryParams['Filter.Search'] = query.search;
      }
      if (query.subjectCode && query.subjectCode.trim()) {
        queryParams['Filter.SubjectCode'] = query.subjectCode;
      }
      if (query.isActive !== undefined) {
        queryParams['Filter.IsActive'] = query.isActive;
      }
      if (query.sortBy !== undefined) {
        queryParams['Filter.SortBy'] = query.sortBy;
      }
      
      const queryString = new URLSearchParams(
        Object.entries(queryParams).filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString();
      
      const fullUrl = `/api/v1/Courses/lecture?${queryString}`;
      
      return this.request<GetCoursesResponse>(fullUrl, "GET", undefined, params);
    },

    /**
     * @description Lấy thông tin chi tiết khóa học theo ID cho giảng viên (authenticated)
     * @request GET:/api/v1/Courses/auth/{id}
     */
    getById: (id: string, params?: RequestParams) =>
      this.request<GetCourseByIdResponse>(`/api/v1/Courses/auth/${id}`, "GET", undefined, params),

    /**
     * @description Tạo khóa học mới
     * @request POST:/api/v1/Courses
     */
    create: (courseData: CreateCourseDto, params?: RequestParams) => {
      return this.request<CreateCourseResponse>('/api/v1/Courses', "POST", { payload: courseData }, params);
    },

    /**
     * @description Cập nhật khóa học
     * @request PUT:/api/v1/Courses/{id}
     */
    update: (id: string, courseData: UpdateCourseDto, params?: RequestParams) => {
      const wrappedPayload: UpdateCoursePayload = {
        courseId: id,
        payload: courseData
      };
      return this.request<UpdateCourseResponse>(`/api/v1/Courses/${id}`, "PUT", wrappedPayload, params);
    },

    /**
     * @description Xóa khóa học
     * @request DELETE:/api/v1/Courses/{id}
     */
    delete: (id: string, params?: RequestParams) => {
      const headers = {
        accept: 'text/plain',
        ...(params?.headers ?? {}),
      };
      return this.request<DeleteCourseResponse>(
        `/api/v1/Courses/${id}`,
        "DELETE",
        undefined,
        { ...params, headers }
      );
    },

    /**
     * @description Cập nhật modules của khóa học
     * @request PUT:/api/v1/Courses/{id}/modules
     * 
     * IMPORTANT: The courseId in the payload should match the course that owns these modules,
     * which may be different from the {id} in the URL path in some cases.
     * The URL {id} specifies which course's modules endpoint to use.
     */
    updateModules: async (id: string, modules: UpdateModuleDto[], courseIdForPayload?: string, params?: RequestParams) => {
      // Update each module individually using the single module endpoint
      const results = [];
      
      for (const module of modules) {
        const workingModule: any = { ...module };

        const normalizeDiscussions = (source: any[] | undefined) => {
          if (!Array.isArray(source)) return undefined;
          return source.map((discussion: any) => ({
            discussionId: discussion.discussionId ?? discussion.id,
            title: discussion.title,
            description: discussion.description,
            discussionQuestion: discussion.discussionQuestion,
            isActive: discussion.isActive
            // Exclude createdAt and updatedAt - backend doesn't expect them
          }));
        };

        const normalizeMaterials = (source: any[] | undefined) => {
          if (!Array.isArray(source)) return undefined;
          return source.map((material: any) => ({
            materialId: material.materialId ?? material.id,
            title: material.title,
            description: material.description,
            fileUrl: material.fileUrl,
            isActive: material.isActive
            // Exclude createdAt and updatedAt - backend doesn't expect them
          }));
        };

        const discussions = normalizeDiscussions(workingModule.discussions) 
          ?? normalizeDiscussions(workingModule.moduleDiscussionDetails);
        const materials = normalizeMaterials(workingModule.materials) 
          ?? normalizeMaterials(workingModule.moduleMaterialDetails);

        // Set normalized arrays
        if (discussions) {
          workingModule.discussions = discussions;
        } else {
          delete workingModule.discussions;
        }

        if (materials) {
          workingModule.materials = materials;
        } else {
          delete workingModule.materials;
        }

        // Remove the long-form fields
        delete workingModule.moduleDiscussionDetails;
        delete workingModule.moduleMaterialDetails;

        // Ensure durationMinutes is set (required by backend)
        if (!workingModule.durationMinutes && workingModule.durationHours) {
          workingModule.durationMinutes = Math.round(workingModule.durationHours * 60);
        }

        // Calculate durationHours if needed
        if (
          typeof workingModule.durationMinutes === 'number' &&
          workingModule.durationMinutes > 0 &&
          (workingModule.durationHours === undefined || workingModule.durationHours === null)
        ) {
          workingModule.durationHours = workingModule.durationMinutes / 60;
        }

        // Remove fields that shouldn't be sent
        delete workingModule.createdAt;
        delete workingModule.updatedAt;

        // Prepare payload matching the curl structure
        const payload = {
          moduleId: workingModule.moduleId,
          updateModuleDto: workingModule
        };

        // Call single module update endpoint
        const response = await this.request<ApiResponse<any>>(
          `/api/Modules/${workingModule.moduleId}`,
          "PUT",
          payload,
          params
        );

        results.push(response);

        // If any update fails, return the failure immediately
        if (!response || response.success !== true) {
          return response;
        }
      }

      // Return success if all modules updated successfully
      return {
        success: true,
        message: 'All modules updated successfully',
        response: results
      } as ApiResponse<any>;
    },
  };

  media = {
    /**
     * @description Upload ảnh bìa khóa học
     * @request POST:/api/v1/Media/Images
     */
    uploadImage: async (file: File, params?: RequestParams): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await this.request<ApiResponse<string>>('/api/v1/Media/Images', "POST", formData, params);
        if (response.success && response.response) return response.response;
        // Some backends return raw URL string
        if (typeof (response as any) === 'string') return response as unknown as string;
        throw new Error(response.message || 'Image upload failed');
      } catch (error: any) {
        // If upload fails, throw the error without mock URLs
        throw new Error('Image upload failed: ' + error.message);
      }
    },

    /**
     * @description Upload video bài học
     * @request POST:/api/v1/Media/Videos
     */
    uploadVideo: async (file: File, params?: RequestParams): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await this.request<ApiResponse<string>>('/api/v1/Media/Videos', "POST", formData, params);
        if (response.success && response.response) return response.response;
        if (typeof (response as any) === 'string') return response as unknown as string;
        throw new Error(response.message || 'Video upload failed');
      } catch (error: any) {
        // If payload too large, surface error to user (do NOT fallback)
        if (error.message?.includes('413')) {
          throw new Error('Video quá lớn (413). Vui lòng nén hoặc chọn file nhỏ hơn.');
        }
        // Throw error without mock URLs
        throw new Error('Video upload failed: ' + error.message);
      }
    },

    /**
     * @description Upload video với utility API (trả về .m3u8 URL)
     * @request POST:/utility/api/v1/UploadVideos
     */
    uploadVideosUtility: async (file: File): Promise<string> => {
      try {
        // Get auth token
        let accessToken: string | null = null;
        
        if (typeof window !== 'undefined') {
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const parsedAuth = JSON.parse(authStorage);
              accessToken = parsedAuth?.state?.accessToken;
            }
          } catch (error) {
            // Silent error handling
          }
          
          if (!accessToken) {
            try {
              const { getAccessTokenAction } = await import('EduSmart/app/(auth)/action');
              const result = await getAccessTokenAction();
              if (result.ok && result.accessToken) {
                accessToken = result.accessToken;
              }
            } catch (error) {
              // Silent error handling
            }
          }
        }
        
        const formData = new FormData();
        formData.append('formFile', file);
        const response = await fetch('https://api.edusmart.pro.vn/utility/api/v1/UploadVideos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': 'text/plain'
          },
          body: formData
        });        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();        
        if (result.success && result.response) {
          return result.response;
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        throw error;
      }
    },

    /**
     * @description Upload tài liệu (file zip) với utility API
     * @request POST:/utility/api/UploadFiles
     */
    uploadDocuments: async (file: File): Promise<string> => {
      try {
        // Get auth token
        let accessToken: string | null = null;
        
        if (typeof window !== 'undefined') {
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const parsedAuth = JSON.parse(authStorage);
              accessToken = parsedAuth?.state?.accessToken;
            }
          } catch (error) {
            // Silent error handling
          }
          
          if (!accessToken) {
            try {
              const { getAccessTokenAction } = await import('EduSmart/app/(auth)/action');
              const result = await getAccessTokenAction();
              if (result.ok && result.accessToken) {
                accessToken = result.accessToken;
              }
            } catch (error) {
              // Silent error handling
            }
          }
        }
        
        const formData = new FormData();
        formData.append('formFile', file);
        const response = await fetch('https://api.edusmart.pro.vn/utility/api/UploadFiles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': 'text/plain'
          },
          body: formData
        });        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Document upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();        
        if (result.success && result.response) {
          return result.response;
        } else {
          throw new Error(result.message || 'Document upload failed');
        }
      } catch (error) {
        throw error;
      }
    },
  };
}

// Create course service instance with auth-enabled fetch
const courseService = new ApiCourseModule({
  baseUrl: resolveCourseBaseUrl(),
  customFetch: axiosFetch,
});

// Export with backward compatibility
export const courseServiceAPI = {
  // Direct method access for existing code
  getCourses: courseService.courses.getAll,
  getCoursesByLecturer: (query: GetCoursesByLecturerQuery, params?: RequestParams) => {
    return courseService.courses.getByLecturer(query, params);
  },
  getCourseById: courseService.courses.getById,
  createCourse: courseService.courses.create,
  updateCourse: courseService.courses.update,
  deleteCourse: courseService.courses.delete,
  updateCourseModules: courseService.courses.updateModules,
  uploadImage: courseService.media.uploadImage,
  uploadVideo: courseService.media.uploadVideo,
  uploadVideosUtility: courseService.media.uploadVideosUtility,
  uploadDocuments: courseService.media.uploadDocuments,
  
  // Full service access for new code
  courses: courseService.courses,
  media: courseService.media,
};
