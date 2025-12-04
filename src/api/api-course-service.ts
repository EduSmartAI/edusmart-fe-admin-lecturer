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
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorBody = await res.clone().text();
        console.error('❌ API Error Response:', errorBody);
        errorDetails = errorBody;
      } catch (e) {
        // Ignore
      }
      throw new Error(`HTTP ${res.status} – ${res.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
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

  // Try to get access token from localStorage first (fastest)
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

    // Fallback: try auth store (synchronous, fast)
    if (!accessToken) {
      const authState = useAuthStore.getState();
      accessToken = authState.token || null;
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

    // Log final request details


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
    } catch { }
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
  tags?: CourseTagDto[]; // Alternative field name from API
  modules?: ModuleDetailDto[];
  comments?: CommentDto[]; // Comments from API response
  ratings?: RatingDto[]; // Ratings from API response
  ratingsCount?: number; // Total ratings count
  ratingsAverage?: number; // Average rating (1-5)
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

// Rating DTO for course ratings
export interface RatingDto {
  ratingId: string;
  courseId: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  score: number; // 1-5 star rating
  comment?: string;
  createdAt: string;
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
  // teacherId is now extracted from JWT token by backend, no longer in payload
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
  items?: T[];
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
// Comment DTOs
export interface CommentDto {
  commentId: string;
  courseId: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: string;
  isReplied: boolean;
  createdAt: string;
  replies?: CommentDto[];
}

export type GetCommentsResponse = ApiResponse<PaginatedResult<CommentDto>>;

export interface GetCommentsQuery {
  courseId: string;
  page?: number;
  size?: number;
}

// Module Discussion DTOs
export interface DiscussionThreadDto {
  commentId: string;
  moduleId: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: string;
  isReplied: boolean;
  createdAt: string;
  replies?: DiscussionThreadDto[];
}

export type GetDiscussionThreadResponse = ApiResponse<PaginatedResult<DiscussionThreadDto>>;

export interface GetDiscussionThreadQuery {
  moduleId: string;
  page?: number;
  size?: number;
}

// Enrolled User DTOs
export interface EnrolledUserDto {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export type GetEnrolledUsersResponse = ApiResponse<PaginatedResult<EnrolledUserDto>>;

export interface GetEnrolledUsersQuery {
  courseId: string;
  pageIndex?: number;
  pageSize?: number;
}

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
    updateModules: (id: string, modules: UpdateModuleDto[], courseIdForPayload?: string, params?: RequestParams) => {
      const normalizedModules: UpdateModuleDto[] = modules.map((module) => {
        const workingModule: any = { ...module };

        const normalizeDiscussions = (source: any[] | undefined) => {
          if (!Array.isArray(source)) return undefined;
          return source.map((discussion: any) => {
            const normalized = {
              discussionId: discussion.discussionId ?? discussion.id,
              title: discussion.title,
              description: discussion.description,
              discussionQuestion: discussion.discussionQuestion,
              isActive: discussion.isActive,
              createdAt: discussion.createdAt,
              updatedAt: discussion.updatedAt
            };
            return normalized;
          });
        };

        const normalizeMaterials = (source: any[] | undefined) => {
          if (!Array.isArray(source)) return undefined;
          return source.map((material: any) => {
            const normalized = {
              materialId: material.materialId ?? material.id,
              title: material.title,
              description: material.description,
              fileUrl: material.fileUrl,
              isActive: material.isActive,
              createdAt: material.createdAt,
              updatedAt: material.updatedAt
            };
            return normalized;
          });
        };

        const discussions = normalizeDiscussions(workingModule.discussions)
          ?? normalizeDiscussions(workingModule.moduleDiscussionDetails);
        const materials = normalizeMaterials(workingModule.materials)
          ?? normalizeMaterials(workingModule.moduleMaterialDetails);

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

        delete workingModule.moduleDiscussionDetails;
        delete workingModule.moduleMaterialDetails;

        if (
          typeof workingModule.durationMinutes === 'number' &&
          workingModule.durationMinutes > 0 &&
          (workingModule.durationHours === undefined || workingModule.durationHours === null)
        ) {
          workingModule.durationHours = workingModule.durationMinutes / 60;
        }

        return workingModule as UpdateModuleDto;
      });

      const payload = {
        courseId: courseIdForPayload || id,
        updateCourseModules: {
          modules: normalizedModules
        }
      };
      return this.request<ApiResponse<any>>(`/api/v1/Courses/${id}/modules`, "PUT", payload, params);
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
      // Helper function to get fresh access token
      const getFreshAccessToken = async (): Promise<string | null> => {
        if (typeof window === 'undefined') return null;

        // First, try to refresh token via server action to get a fresh one
        try {
          const { refreshAction } = await import('EduSmart/app/(auth)/action');
          const refreshResult = await refreshAction();
          if (refreshResult.ok && refreshResult.accessToken) {
            // Update localStorage with new token
            try {
              const authStorage = localStorage.getItem('auth-storage');
              if (authStorage) {
                const parsed = JSON.parse(authStorage);
                parsed.state = parsed.state || {};
                parsed.state.accessToken = refreshResult.accessToken;
                localStorage.setItem('auth-storage', JSON.stringify(parsed));
              }
            } catch {
              // Silent error handling
            }
            return refreshResult.accessToken;
          }
        } catch {
          // Silent error handling
        }

        // Fallback: try getAccessTokenAction
        try {
          const { getAccessTokenAction } = await import('EduSmart/app/(auth)/action');
          const result = await getAccessTokenAction();
          if (result.ok && result.accessToken) {
            return result.accessToken;
          }
        } catch {
          // Silent error handling
        }

        return null;
      };

      // Helper function to get current access token from storage
      const getCurrentAccessToken = (): string | null => {
        if (typeof window === 'undefined') return null;

        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsedAuth = JSON.parse(authStorage);
            return parsedAuth?.state?.accessToken || null;
          }
        } catch {
          // Silent error handling
        }

        // Fallback: try auth store
        try {
          const authState = useAuthStore.getState();
          return authState.token || null;
        } catch {
          // Silent error handling
        }

        return null;
      };

      // Helper function to perform upload
      const performUpload = async (token: string | null): Promise<Response> => {
        const formData = new FormData();
        formData.append('formFile', file);

        return fetch('https://api.edusmart.pro.vn/utility/api/v1/UploadVideos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'text/plain'
          },
          body: formData
        });
      };

      try {
        // Try with current token first
        let accessToken = getCurrentAccessToken();
        let response = await performUpload(accessToken);

        // If 401, try to refresh token and retry once
        if (response.status === 401) {
          console.log('[uploadVideosUtility] Got 401, attempting token refresh...');
          accessToken = await getFreshAccessToken();

          if (accessToken) {
            console.log('[uploadVideosUtility] Token refreshed, retrying upload...');
            response = await performUpload(accessToken);
          } else {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        }

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
      // Helper function to get fresh access token
      const getFreshAccessToken = async (): Promise<string | null> => {
        if (typeof window === 'undefined') return null;

        // First, try to refresh token via server action to get a fresh one
        try {
          const { refreshAction } = await import('EduSmart/app/(auth)/action');
          const refreshResult = await refreshAction();
          if (refreshResult.ok && refreshResult.accessToken) {
            // Update localStorage with new token
            try {
              const authStorage = localStorage.getItem('auth-storage');
              if (authStorage) {
                const parsed = JSON.parse(authStorage);
                parsed.state = parsed.state || {};
                parsed.state.accessToken = refreshResult.accessToken;
                localStorage.setItem('auth-storage', JSON.stringify(parsed));
              }
            } catch {
              // Silent error handling
            }
            return refreshResult.accessToken;
          }
        } catch {
          // Silent error handling
        }

        // Fallback: try getAccessTokenAction
        try {
          const { getAccessTokenAction } = await import('EduSmart/app/(auth)/action');
          const result = await getAccessTokenAction();
          if (result.ok && result.accessToken) {
            return result.accessToken;
          }
        } catch {
          // Silent error handling
        }

        return null;
      };

      // Helper function to get current access token from storage
      const getCurrentAccessToken = (): string | null => {
        if (typeof window === 'undefined') return null;

        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsedAuth = JSON.parse(authStorage);
            return parsedAuth?.state?.accessToken || null;
          }
        } catch {
          // Silent error handling
        }

        // Fallback: try auth store
        try {
          const authState = useAuthStore.getState();
          return authState.token || null;
        } catch {
          // Silent error handling
        }

        return null;
      };

      // Helper function to perform upload
      const performUpload = async (token: string | null): Promise<Response> => {
        const formData = new FormData();
        formData.append('formFile', file);

        return fetch('https://api.edusmart.pro.vn/utility/api/UploadFiles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'text/plain'
          },
          body: formData
        });
      };

      try {
        // Try with current token first
        let accessToken = getCurrentAccessToken();
        let response = await performUpload(accessToken);

        // If 401, try to refresh token and retry once
        if (response.status === 401) {
          console.log('[uploadDocuments] Got 401, attempting token refresh...');
          accessToken = await getFreshAccessToken();

          if (accessToken) {
            console.log('[uploadDocuments] Token refreshed, retrying upload...');
            response = await performUpload(accessToken);
          } else {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        }

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

  comments = {
    /**
     * @description Lấy danh sách bình luận của khóa học
     * @request GET:/api/CourseComments
     */
    get: (query: GetCommentsQuery, params?: RequestParams) => {
      const queryParams = {
        'courseId': query.courseId,
        'page': query.page ?? 0,
        'size': query.size ?? 10,
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString();

      return this.request<GetCommentsResponse>(`/api/CourseComments?${queryString}`, "GET", undefined, params);
    },

    /**
     * @description Tạo bình luận mới
     * @request POST:/api/CourseComments
     */
    create: (courseId: string, content: string, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        `/api/CourseComments?courseId=${courseId}`,
        "POST",
        { content },
        params
      );
    },

    /**
     * @description Xóa bình luận
     * @request DELETE:/api/CourseComments?courseId={courseId}&commentId={commentId}
     */
    delete: (commentId: string, courseId: string, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        `/api/CourseComments?courseId=${courseId}&commentId=${commentId}`,
        "DELETE",
        undefined,
        params
      );
    },
    reply: (commentId: string, content: string, courseId: string, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        `/api/CourseComments/${commentId}/replies?courseId=${courseId}`,
        "POST",
        { content },
        params
      );
    },
  };

  moduleDiscussions = {
    /**
     * @description Lấy danh sách thảo luận của module
     * @request GET:/api/modules/{moduleId}/discussion/thread
     */
    getThread: (query: GetDiscussionThreadQuery, params?: RequestParams) => {
      const queryParams = {
        'page': query.page ?? 0,
        'size': query.size ?? 10,
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString();

      return this.request<GetDiscussionThreadResponse>(
        `/api/modules/${query.moduleId}/discussion/thread?${queryString}`,
        "GET",
        undefined,
        params
      );
    },

    /**
     * @description Tạo bình luận mới trong thảo luận module
     * @request POST:/api/ModuleDiscussionComments/{moduleId}
     */
    createComment: (moduleId: string, content: string, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        `/api/ModuleDiscussionComments/${moduleId}`,
        "POST",
        { content },
        params
      );
    },

    /**
     * @description Trả lời bình luận trong thảo luận module
     * @request POST:/api/ModuleDiscussionComments/{moduleId}/{commentId}/reply
     */
    replyToComment: (moduleId: string, commentId: string, content: string, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        `/api/ModuleDiscussionComments/${moduleId}/${commentId}/reply`,
        "POST",
        { content },
        params
      );
    },
  };

  enrolledUsers = {
    /**
     * @description Lấy danh sách học viên đã đăng ký khóa học
     * @request GET:/api/v1/Courses/GetEnrolledUsers
     */
    get: (query: GetEnrolledUsersQuery, params?: RequestParams) => {
      const queryParams = {
        'Pagination.PageIndex': query.pageIndex ?? 1,
        'Pagination.PageSize': query.pageSize ?? 10,
        'CourseId': query.courseId,
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString();

      return this.request<GetEnrolledUsersResponse>(
        `/api/v1/Courses/GetEnrolledUsers?${queryString}`,
        "GET",
        undefined,
        params
      );
    },
  };

  syllabus = {
    /**
     * @description Tạo chuyên ngành (Major)
     * @request POST:/api/Syllabus/CreateMajorProcess
     */
    createMajor: (data: { majorCode: string; majorName: string; description: string }, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        '/api/Syllabus/CreateMajorProcess',
        "POST",
        { createMajorDto: data },
        params
      );
    },

    /**
     * @description Tạo môn học (Subject)
     * @request POST:/api/Syllabus/CreateSubjectProcess
     */
    createSubject: (data: { subjectCode: string; subjectName: string }, params?: RequestParams) => {
      return this.request<ApiResponse<any>>(
        '/api/Syllabus/CreateSubjectProcess',
        "POST",
        { createSubjectDto: data },
        params
      );
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
  comments: courseService.comments,
  moduleDiscussions: courseService.moduleDiscussions,
  enrolledUsers: courseService.enrolledUsers,
  syllabus: courseService.syllabus,
};
