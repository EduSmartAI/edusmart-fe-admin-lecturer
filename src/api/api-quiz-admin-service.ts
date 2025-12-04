/**
 * Quiz Service API Client (Admin)
 * 
 * Handles API calls for:
 * - Tests (CRUD)
 * - Surveys (CRUD)
 * - Quizzes (CRUD)
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AdminTest {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSurvey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Quiz item from API response
export interface AdminQuizItem {
  quizId: string;
  quizType: number;
  quizTypeName: string;
  title: string | null;
  description: string | null;
  subjectCode: string | null;
  subjectCodeName: string | null;
  surveyCode: string | null;
  totalQuestions: number;
  totalStudentsTaken: number;
  isActive: boolean;
  createdAt: string;
}

// Legacy interface for compatibility
export interface AdminQuiz {
  id: string;
  title: string;
  description?: string;
  totalQuestions?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

// API response wrapper
export interface QuizApiResponseWrapper<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: string[] | null;
}

// Paginated quiz response from API
export interface QuizPaginatedData {
  quizzes: AdminQuizItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Survey item from API response
export interface AdminSurveyItem {
  quizId: string;
  quizType: number;
  quizTypeName: string;
  title: string | null;
  description: string | null;
  subjectCode: string | null;
  subjectCodeName: string | null;
  surveyCode: string | null;
  totalQuestions: number;
  totalStudentsTaken: number;
  isActive: boolean;
  createdAt: string;
}

// Paginated survey response from API
export interface SurveyPaginatedData {
  quizzes: AdminSurveyItem[]; // API returns "quizzes" array for surveys too
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Test/Survey Creation Types (matching actual API)
export interface TestAnswerDto {
  answerText: string;
  isCorrect: boolean;
}

export interface TestQuestionDto {
  questionText: string;
  difficultyLevel: number; // 0 = Easy, 1 = Medium, 2 = Hard
  questionType: number; // 0 = Multiple Choice, 1 = True/False, etc.
  explanation: string;
  answers: TestAnswerDto[];
}

export interface TestQuizDto {
  title: string;
  description: string;
  subjectCode: string; // UUID
  questions: TestQuestionDto[];
}

export interface CreateTestDto {
  testName: string;
  description: string;
  quizzes: TestQuizDto[];
}

export interface UpdateTestDto {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  isActive?: boolean;
}

export interface SurveyAnswerRuleDto {
  numericMin: number;
  numericMax: number;
  unit: number;
  mappedField: string;
  formula: string;
}

export interface SurveyAnswerDto {
  answerText: string;
  isCorrect: boolean;
  answerRules: SurveyAnswerRuleDto[];
}

export interface SurveyQuestionDto {
  questionText: string;
  questionType: number; // 1 = Multiple Choice, 2 = Text, etc.
  answers: SurveyAnswerDto[];
}

export interface CreateSurveyDto {
  title: string;
  description: string;
  surveyCode: string; // e.g., "HABIT", "INTEREST"
  questions: SurveyQuestionDto[];
}

export interface UpdateSurveyDto {
  id: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateQuizDto {
  id: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

// ============================================================================
// Student Surveys & Tests Types
// ============================================================================

export interface StudentSurvey {
  studentQuizId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  surveyId: string;
  surveyTitle: string | null;
  surveyCode: string;
  totalQuestions: number;
  totalAnswers: number;
  createdAt: string;
}

export interface StudentTest {
  studentTestId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  testId: string;
  testName: string;
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrectAnswers: number;
  studentLevel: number;
  startedAt: string;
  finishedAt: string;
  duration: string;
}

export interface StudentTestAnswer {
  answerId: string;
  isCorrectAnswer: boolean;
  selectedByStudent: boolean;
  answerText: string;
}

export interface StudentTestQuestion {
  questionId: string;
  questionText: string;
  questionType: number;
  difficultyLevel: number;
  explanation: string | null;
  answers: StudentTestAnswer[];
}

export interface StudentTestQuizResult {
  quizId: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectCodeName: string;
  totalQuestions: number;
  totalCorrectAnswers: number;
  questionResults: StudentTestQuestion[];
}

export interface StudentTestDetail {
  studentTestId: string;
  testId: string;
  testName: string;
  testDescription: string;
  startedAt: string;
  finishedAt: string;
  quizResults: StudentTestQuizResult[];
}

export interface StudentSurveysResponse {
  studentSurveys: StudentSurvey[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface StudentTestsResponse {
  studentTests: StudentTest[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiResponseWithNested<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: string[] | null;
}

// ============================================================================
// API Client Class
// ============================================================================

class QuizAdminServiceApi {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'https://api.edusmart.pro.vn/quiz';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/Login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      // First, try to get from Zustand store
      const token = useAuthStore.getState().token;
      if (token) return token;
      
      // Fallback: Try to read directly from cookies (for page refresh before hydration)
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop()?.split(';').shift();
          return cookieValue || null;
        }
        return null;
      };
      
      const authCookie = getCookie('auth-storage');
      if (authCookie) {
        try {
          const decoded = decodeURIComponent(authCookie);
          const parsed = JSON.parse(decoded);
          return parsed.state?.token || parsed.token || null;
        } catch {
          // Ignore parse errors
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // ============================================================================
  // Tests API
  // ============================================================================

  /**
   * Get paginated list of tests
   * GET /quiz/api/v1/Admin/SelectTests
   */
  async getTests(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<AdminTest>>> {
    try {
      const response = await this.client.get('/api/v1/Admin/SelectTests', {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          search: params.search || '',
        },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch tests',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Create a new test
   * POST /quiz/api/v1/Admin/InsertTest
   */
  async createTest(dto: CreateTestDto): Promise<ApiResponse<AdminTest>> {
    try {
      const response = await this.client.post('/api/v1/Admin/InsertTest', dto);
      
      return {
        success: true,
        data: response.data,
        message: 'Test created successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to create test',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Update an existing test
   * PUT /quiz/api/v1/Admin/UpdateTest
   */
  async updateTest(dto: UpdateTestDto): Promise<ApiResponse<AdminTest>> {
    try {
      const response = await this.client.put('/api/v1/Admin/UpdateTest', dto);
      
      return {
        success: true,
        data: response.data,
        message: 'Test updated successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to update test',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Delete a test
   * DELETE /quiz/api/v1/Admin/DeleteTest
   */
  async deleteTest(id: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete('/api/v1/Admin/DeleteTest', {
        params: { id },
      });
      
      return {
        success: true,
        message: 'Test deleted successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to delete test',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  // ============================================================================
  // Surveys API
  // ============================================================================

  /**
   * Get paginated list of surveys
   * GET /quiz/api/v1/Admin/SelectSurveys
   */
  async getSurveys(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<AdminSurvey>>> {
    try {
      const response = await this.client.get<QuizApiResponseWrapper<SurveyPaginatedData>>('/api/v1/Admin/SelectSurveys', {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          search: params.search || '',
        },
      });
      
      const apiData = response.data;
      
      if (apiData.success && apiData.response) {
        // Map API response to expected format
        const mappedData: PaginatedResponse<AdminSurvey> = {
          data: apiData.response.quizzes.map(survey => ({
            id: survey.quizId,
            title: survey.title || survey.surveyCode || `Survey ${survey.quizTypeName}`,
            description: survey.description || undefined,
            isActive: survey.isActive,
            createdAt: survey.createdAt,
          })),
          pageNumber: apiData.response.pageNumber,
          pageSize: apiData.response.pageSize,
          totalCount: apiData.response.totalCount,
          totalPages: Math.ceil(apiData.response.totalCount / apiData.response.pageSize),
        };
        
        return {
          success: true,
          data: mappedData,
        };
      }
      
      return {
        success: false,
        message: apiData.message || 'Failed to fetch surveys',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch surveys',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Create a new survey
   * POST /quiz/api/v1/Admin/InsertSurvey
   */
  async createSurvey(dto: CreateSurveyDto): Promise<ApiResponse<AdminSurvey>> {
    try {
      const response = await this.client.post('/api/v1/Admin/InsertSurvey', dto);
      
      return {
        success: true,
        data: response.data,
        message: 'Survey created successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to create survey',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Update an existing survey
   * PUT /quiz/api/v1/Admin/UpdateSurvey
   */
  async updateSurvey(dto: UpdateSurveyDto): Promise<ApiResponse<AdminSurvey>> {
    try {
      const response = await this.client.put('/api/v1/Admin/UpdateSurvey', dto);
      
      return {
        success: true,
        data: response.data,
        message: 'Survey updated successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to update survey',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Delete a survey
   * DELETE /quiz/api/v1/Admin/DeleteSurvey
   */
  async deleteSurvey(id: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete('/api/v1/Admin/DeleteSurvey', {
        params: { id },
      });
      
      return {
        success: true,
        message: 'Survey deleted successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to delete survey',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  // ============================================================================
  // Quizzes API
  // ============================================================================

  /**
   * Get paginated list of quizzes
   * GET /quiz/api/v1/Admin/SelectQuizzes
   */
  async getQuizzes(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<AdminQuiz>>> {
    try {
      const response = await this.client.get<QuizApiResponseWrapper<QuizPaginatedData>>('/api/v1/Admin/SelectQuizzes', {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          search: params.search || '',
        },
      });
      
      const apiData = response.data;
      
      if (apiData.success && apiData.response) {
        // Map API response to expected format
        const mappedData: PaginatedResponse<AdminQuiz> = {
          data: apiData.response.quizzes.map(quiz => ({
            id: quiz.quizId,
            title: quiz.title || `Quiz ${quiz.quizTypeName}`,
            description: quiz.description || undefined,
            totalQuestions: quiz.totalQuestions,
            isActive: quiz.isActive,
            createdAt: quiz.createdAt,
          })),
          pageNumber: apiData.response.pageNumber,
          pageSize: apiData.response.pageSize,
          totalCount: apiData.response.totalCount,
          totalPages: Math.ceil(apiData.response.totalCount / apiData.response.pageSize),
        };
        
        return {
          success: true,
          data: mappedData,
        };
      }
      
      return {
        success: false,
        message: apiData.message || 'Failed to fetch quizzes',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch quizzes',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Create a new quiz
   * POST /quiz/api/v1/Admin/InsertQuiz
   */
  async createQuiz(dto: CreateQuizDto): Promise<ApiResponse<AdminQuiz>> {
    try {
      const response = await this.client.post('/api/v1/Admin/InsertQuiz', dto);
      
      return {
        success: true,
        data: response.data,
        message: 'Quiz created successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to create quiz',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Update an existing quiz
   * PUT /quiz/api/v1/Admin/UpdateQuiz
   */
  async updateQuiz(dto: UpdateQuizDto): Promise<ApiResponse<AdminQuiz>> {
    try {
      const response = await this.client.put('/api/v1/Admin/UpdateQuiz', dto);
      
      return {
        success: true,
        data: response.data,
        message: 'Quiz updated successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to update quiz',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  /**
   * Delete a quiz
   * DELETE /quiz/api/v1/Admin/DeleteQuiz
   */
  async deleteQuiz(id: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete('/api/v1/Admin/DeleteQuiz', {
        params: { id },
      });
      
      return {
        success: true,
        message: 'Quiz deleted successfully',
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to delete quiz',
        errors: axiosError.response?.data?.errors,
      };
    }
  }

  // ============================================================================
  // Student Surveys & Tests API
  // ============================================================================

  /**
   * Get paginated list of student surveys
   * GET /quiz/api/v1/Admin/SelectStudentSurveys
   */
  async getStudentSurveys(params: PaginationParams): Promise<ApiResponseWithNested<StudentSurveysResponse>> {
    try {
      const response = await this.client.get('/api/v1/Admin/SelectStudentSurveys', {
        params: {
          PageNumber: params.pageNumber,
          PageSize: params.pageSize,
        },
      });
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; detailErrors?: string[] } } };
      return {
        response: {
          studentSurveys: [],
          totalCount: 0,
          pageNumber: 0,
          pageSize: 10,
        },
        success: false,
        messageId: 'E00001',
        message: axiosError.response?.data?.message || 'Failed to fetch student surveys',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Get paginated list of student tests
   * GET /quiz/api/v1/Admin/SelectStudentTests
   */
  async getStudentTests(params: PaginationParams): Promise<ApiResponseWithNested<StudentTestsResponse>> {
    try {
      const response = await this.client.get('/api/v1/Admin/SelectStudentTests', {
        params: {
          PageNumber: params.pageNumber,
          PageSize: params.pageSize,
        },
      });
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; detailErrors?: string[] } } };
      return {
        response: {
          studentTests: [],
          totalCount: 0,
          pageNumber: 0,
          pageSize: 10,
        },
        success: false,
        messageId: 'E00001',
        message: axiosError.response?.data?.message || 'Failed to fetch student tests',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Get detailed information about a student test
   * GET /quiz/api/v1/Admin/SelectStudentTestDetail
   */
  async getStudentTestDetail(studentTestId: string): Promise<ApiResponseWithNested<StudentTestDetail>> {
    try {
      const response = await this.client.get('/api/v1/Admin/SelectStudentTestDetail', {
        params: {
          StudentTestId: studentTestId,
        },
      });
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; detailErrors?: string[] } } };
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch student test detail');
    }
  }
}

// Export singleton instance
export const quizAdminServiceApi = new QuizAdminServiceApi();
