/**
 * Initial Test API Service
 * Handles API calls for Initial Test CRUD operations
 * 
 * Endpoints:
 * - POST /quiz/api/v1/Admin/InsertTest
 * - GET /quiz/api/v1/Admin/SelectTests
 * - GET /quiz/api/v1/Admin/SelectTest?TestId={guid}
 * - PUT /quiz/api/v1/Admin/UpdateTest
 * - DELETE /quiz/api/v1/Admin/DeleteTest
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import {
  CreateInitialTestDto,
  InitialTest,
  InitialTestListItem,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from 'EduSmart/types/initial-test';

class InitialTestApi {
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
   * Create a new initial test
   * POST /quiz/api/v1/Admin/InsertTest
   */
  async createTest(dto: CreateInitialTestDto): Promise<ApiResponse<InitialTest>> {
    try {
      const response = await this.client.post<ApiResponse<InitialTest>>(
        '/api/v1/Admin/InsertTest',
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
        response: {} as InitialTest,
        success: false,
        messageId: 'E00001',
        message: axiosError.response?.data?.message || 'Failed to create test',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Get paginated list of tests
   * GET /quiz/api/v1/Admin/SelectTests
   */
  async getTests(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<InitialTestListItem>>> {
    try {
      const response = await this.client.get<ApiResponse<PaginatedResponse<InitialTestListItem>>>(
        '/api/v1/Admin/SelectTests',
        {
          params: {
            PageNumber: params.pageNumber,
            PageSize: params.pageSize,
            SearchTerm: params.search || '',
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
          items: [],
          totalCount: 0,
          pageNumber: 0,
          pageSize: 10,
        },
        success: false,
        messageId: 'E00002',
        message: axiosError.response?.data?.message || 'Failed to fetch tests',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Get test detail
   * GET /quiz/api/v1/Admin/SelectTest?TestId={guid}
   */
  async getTestDetail(testId: string): Promise<ApiResponse<InitialTest>> {
    try {
      const response = await this.client.get<ApiResponse<InitialTest>>(
        '/api/v1/Admin/SelectTest',
        {
          params: {
            TestId: testId,
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
        response: {} as InitialTest,
        success: false,
        messageId: 'E00003',
        message: axiosError.response?.data?.message || 'Failed to fetch test detail',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Update a test
   * PUT /quiz/api/v1/Admin/UpdateTest
   */
  async updateTest(dto: InitialTest): Promise<ApiResponse<InitialTest>> {
    try {
      const response = await this.client.put<ApiResponse<InitialTest>>(
        '/api/v1/Admin/UpdateTest',
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
        response: {} as InitialTest,
        success: false,
        messageId: 'E00004',
        message: axiosError.response?.data?.message || 'Failed to update test',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }

  /**
   * Delete a test
   * DELETE /quiz/api/v1/Admin/DeleteTest
   */
  async deleteTest(testId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete<ApiResponse<void>>(
        '/api/v1/Admin/DeleteTest',
        {
          data: {
            testId,
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
        messageId: 'E00005',
        message: axiosError.response?.data?.message || 'Failed to delete test',
        detailErrors: axiosError.response?.data?.detailErrors || null,
      };
    }
  }
}

// Export singleton instance
export const initialTestApi = new InitialTestApi();
