/**
 * Practice Test API Service
 * Handles API calls for Practice Test (Bài Thực Hành) CRUD operations
 * 
 * Endpoints:
 * - POST /quiz/api/v1/Admin/InsertPracticeTest
 * - POST /quiz/api/v1/Admin/InsertPracticeTestExamples
 * - POST /quiz/api/v1/Admin/InsertPracticeTestTemplates
 * - POST /quiz/api/v1/Admin/InsertPracticeTestTestcases
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import {
  CreatePracticeTestDto,
  UpdatePracticeTestDto,
  AddExamplesDto,
  AddTemplatesDto,
  AddTestCasesDto,
  PracticeTest,
  PaginatedPracticeTestResponse,
  PaginationParams,
  ApiResponse,
} from 'EduSmart/types/practice-test';

class PracticeTestAdminApi {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'https://api.edusmart.pro.vn/quiz';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
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
      const token = useAuthStore.getState().token;
      if (token) return token;
      
      // Fallback: Try to read from localStorage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Create a new practice test with all components
   * POST /quiz/api/v1/Admin/InsertPracticeTest
   */
  async createPracticeTest(dto: CreatePracticeTestDto): Promise<ApiResponse<PracticeTest>> {
    try {
      console.log('🚀 [API] Creating practice test with payload:', JSON.stringify(dto, null, 2));
      
      const response = await this.client.post<ApiResponse<PracticeTest>>(
        '/api/v1/Admin/InsertPracticeTest',
        dto
      );
      
      console.log('✅ [API] Practice test created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to create practice test:', error);
      
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          };
          status?: number;
        } 
      };
      
      console.error('❌ [API] Error details:', {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message,
        detailErrors: axiosError.response?.data?.detailErrors,
      });
      
      return {
        response: {} as PracticeTest,
        success: false,
        messageId: 'E00001',
        message: axiosError.response?.data?.message || 'Failed to create practice test',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Add examples to an existing practice test
   * POST /quiz/api/v1/Admin/InsertPracticeTestExamples
   */
  async addExamples(dto: AddExamplesDto): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post<ApiResponse<void>>(
        '/api/v1/Admin/InsertPracticeTestExamples',
        dto
      );
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        } 
      };
      
      return {
        response: undefined as unknown as void,
        success: false,
        messageId: 'E00002',
        message: axiosError.response?.data?.message || 'Failed to add examples',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Add code templates to an existing practice test
   * POST /quiz/api/v1/Admin/InsertPracticeTestTemplates
   * Note: Each language can only have 1 template
   */
  async addTemplates(dto: AddTemplatesDto): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post<ApiResponse<void>>(
        '/api/v1/Admin/InsertPracticeTestTemplates',
        dto
      );
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        } 
      };
      
      return {
        response: undefined as unknown as void,
        success: false,
        messageId: 'E00003',
        message: axiosError.response?.data?.message || 'Failed to add templates',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Add test cases to an existing practice test
   * POST /quiz/api/v1/Admin/InsertPracticeTestTestcases
   */
  async addTestCases(dto: AddTestCasesDto): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post<ApiResponse<void>>(
        '/api/v1/Admin/InsertPracticeTestTestcases',
        dto
      );
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        } 
      };
      
      return {
        response: undefined as unknown as void,
        success: false,
        messageId: 'E00004',
        message: axiosError.response?.data?.message || 'Failed to add test cases',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Get paginated list of practice tests
   * GET /quiz/api/v1/Admin/SelectPracticeTests?PageNumber=1&PageSize=10
   */
  async getPracticeTests(params: PaginationParams): Promise<ApiResponse<PaginatedPracticeTestResponse>> {
    try {
      const response = await this.client.get<ApiResponse<PaginatedPracticeTestResponse>>(
        '/api/v1/Admin/SelectPracticeTests',
        {
          params: {
            PageNumber: params.pageNumber,
            PageSize: params.pageSize,
            SearchTerm: params.search || '',
            Difficulty: params.difficulty,
          },
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        } 
      };
      
      return {
        response: {
          practiceTests: [],
          totalCount: 0,
          pageNumber: 0,
          pageSize: 10,
        },
        success: false,
        messageId: 'E00005',
        message: axiosError.response?.data?.message || 'Failed to fetch practice tests',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Get detailed information about a practice test
   * GET /quiz/api/v1/Admin/SelectPracticeTest?ProblemId={guid}
   */
  async getPracticeTestDetail(problemId: string): Promise<ApiResponse<PracticeTest>> {
    try {
      const response = await this.client.get<ApiResponse<PracticeTest>>(
        '/api/v1/Admin/SelectPracticeTest',
        {
          params: {
            ProblemId: problemId,
          },
        }
      );
      
      console.log('🔍 [API] Practice Test Detail Response:', {
        success: response.data.success,
        hasResponse: !!response.data.response,
        templates: response.data.response?.templates,
        testCases: response.data.response?.testCases,
        examples: response.data.response?.examples,
        fullResponse: response.data
      });
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        } 
      };
      
      return {
        response: {} as PracticeTest,
        success: false,
        messageId: 'E00006',
        message: axiosError.response?.data?.message || 'Failed to fetch practice test detail',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }
  /**
   * Update a practice test
   * PUT /quiz/api/v1/Admin/UpdatePracticeTest
   * 
   * Updates practice test including title, description, difficulty, test cases, templates and examples.
   * Only updates/deletes items with ID in request. Items not in request will be deleted.
   * Must keep at least 1 test case and 1 example.
   */
  async updatePracticeTest(dto: UpdatePracticeTestDto): Promise<ApiResponse<PracticeTest>> {
    try {
      console.log('🚀 [API] Updating practice test:', JSON.stringify(dto, null, 2));
      
      const response = await this.client.put<ApiResponse<PracticeTest>>(
        '/api/v1/Admin/UpdatePracticeTest',
        dto
      );
      
      console.log('✅ [API] Practice test updated successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to update practice test:', error);
      
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          };
          status?: number;
        } 
      };
      
      console.error('❌ [API] Error details:', {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message,
        detailErrors: axiosError.response?.data?.detailErrors,
      });
      
      return {
        response: {} as PracticeTest,
        success: false,
        messageId: 'E00007',
        message: axiosError.response?.data?.message || 'Failed to update practice test',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Delete a practice test
   * DELETE /quiz/api/v1/Admin/DeletePracticeTest
   * 
   * Request body: { "problemId": "guid" }
   */
  async deletePracticeTest(problemId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete<ApiResponse<void>>(
        '/api/v1/Admin/DeletePracticeTest',
        {
          data: {
            problemId,
          },
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        } 
      };
      
      return {
        response: undefined as unknown as void,
        success: false,
        messageId: 'E00008',
        message: axiosError.response?.data?.message || 'Failed to delete practice test',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }
}

// Export singleton instance
export const practiceTestAdminApi = new PracticeTestAdminApi();
