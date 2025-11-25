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
   * Get list of available programming languages
   * GET /quiz/api/v1/PracticeTest/SelectCodeLanguages
   * 
   * WORKAROUND: This endpoint returns 403 for admin/lecturer role.
   * Using static fallback data since backend doesn't allow admin access to this endpoint.
   */
  async getCodeLanguages(): Promise<ApiResponse<Array<{ languageId: number; name: string }>>> {
    try {
      const token = this.getAuthToken();
      console.log('📡 [API] Attempting to fetch code languages from:', this.baseURL + '/api/v1/PracticeTest/SelectCodeLanguages');
      console.log('🔑 [API] Auth token:', token ? `Present (${token.substring(0, 20)}...)` : 'MISSING!');
      
      // Try API call first
      const response = await axios.get<ApiResponse<Array<{ languageId: number; name: string }>>>(
        `${this.baseURL}/api/v1/PracticeTest/SelectCodeLanguages`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      console.log('✅ [API] Code Languages Response:', {
        status: response.status,
        success: response.data.success,
        count: response.data.response?.length || 0,
        sample: response.data.response?.slice(0, 3)
      });
      
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] getCodeLanguages failed:', error);
      const axiosError = error as { 
        response?: { 
          status?: number;
          statusText?: string;
          data?: { 
            message?: string; 
            detailErrors?: string[] 
          } 
        };
        message?: string;
      };
      
      console.error('❌ [API] Error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        data: axiosError.response?.data
      });
      
      // If 403 Forbidden, use static fallback data
      // This endpoint doesn't allow admin/lecturer role access
      if (axiosError.response?.status === 403) {
        console.warn('⚠️ [API] 403 Forbidden - Using static fallback language list');
        console.warn('⚠️ [API] This endpoint requires student/user role, not admin/lecturer');
        
        // Return static list of programming languages from Judge0
        return {
          response: [
            { languageId: 102, name: "JavaScript (Node.js 22.08.0)" },
            { languageId: 91, name: "Java (JDK 17.0.6)" },
            { languageId: 51, name: "C# (Mono 6.6.0.161)" },
            { languageId: 43, name: "Plain Text" },
            { languageId: 44, name: "Executable" },
            { languageId: 45, name: "Assembly (NASM 2.14.02)" },
            { languageId: 46, name: "Bash (5.0.0)" },
            { languageId: 47, name: "Basic (FBC 1.07.1)" },
            { languageId: 48, name: "C (GCC 7.4.0)" },
            { languageId: 49, name: "C (GCC 8.3.0)" },
            { languageId: 50, name: "C (GCC 9.2.0)" },
            { languageId: 52, name: "C++ (GCC 7.4.0)" },
            { languageId: 53, name: "C++ (GCC 8.3.0)" },
            { languageId: 54, name: "C++ (GCC 9.2.0)" },
            { languageId: 55, name: "Common Lisp (SBCL 2.0.0)" },
            { languageId: 56, name: "D (DMD 2.089.1)" },
            { languageId: 57, name: "Elixir (1.9.4)" },
            { languageId: 58, name: "Erlang (OTP 22.2)" },
            { languageId: 59, name: "Fortran (GFortran 9.2.0)" },
            { languageId: 60, name: "Go (1.13.5)" },
            { languageId: 61, name: "Haskell (GHC 8.8.1)" },
            { languageId: 62, name: "Java (OpenJDK 13.0.1)" },
            { languageId: 63, name: "JavaScript (Node.js 12.14.0)" },
            { languageId: 64, name: "Lua (5.3.5)" },
            { languageId: 65, name: "OCaml (4.09.0)" },
            { languageId: 66, name: "Octave (5.1.0)" },
            { languageId: 67, name: "Pascal (FPC 3.0.4)" },
            { languageId: 68, name: "PHP (7.4.1)" },
            { languageId: 69, name: "Prolog (GNU Prolog 1.4.5)" },
            { languageId: 70, name: "Python (2.7.17)" },
            { languageId: 71, name: "Python (3.8.1)" },
            { languageId: 72, name: "Ruby (2.7.0)" },
            { languageId: 73, name: "Rust (1.40.0)" },
            { languageId: 74, name: "TypeScript (3.7.4)" },
            { languageId: 75, name: "C (Clang 7.0.1)" },
            { languageId: 76, name: "C++ (Clang 7.0.1)" },
            { languageId: 77, name: "COBOL (GnuCOBOL 2.2)" },
            { languageId: 78, name: "Kotlin (1.3.70)" },
            { languageId: 79, name: "Objective-C (Clang 7.0.1)" },
            { languageId: 80, name: "R (4.0.0)" },
            { languageId: 81, name: "Scala (2.13.2)" },
            { languageId: 82, name: "SQL (SQLite 3.27.2)" },
            { languageId: 83, name: "Swift (5.2.3)" },
            { languageId: 84, name: "Visual Basic.Net (vbnc 0.0.0.5943)" },
            { languageId: 85, name: "Perl (5.28.1)" },
            { languageId: 86, name: "Clojure (1.10.1)" },
            { languageId: 87, name: "F# (.NET Core SDK 3.1.202)" },
            { languageId: 88, name: "Groovy (3.0.3)" },
            { languageId: 89, name: "Multi-file program" },
            { languageId: 90, name: "Dart (2.19.2)" },
            { languageId: 92, name: "Python (3.11.2)" },
            { languageId: 93, name: "JavaScript (Node.js 18.15.0)" },
            { languageId: 94, name: "TypeScript (5.0.3)" },
            { languageId: 95, name: "Go (1.18.5)" },
            { languageId: 96, name: "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)" },
            { languageId: 97, name: "JavaScript (Node.js 20.17.0)" },
            { languageId: 98, name: "PHP (8.3.11)" },
            { languageId: 99, name: "R (4.4.1)" },
            { languageId: 100, name: "Python (3.12.5)" },
            { languageId: 101, name: "TypeScript (5.6.2)" },
            { languageId: 103, name: "C (GCC 14.1.0)" },
            { languageId: 104, name: "C (Clang 18.1.8)" },
            { languageId: 105, name: "C++ (GCC 14.1.0)" },
            { languageId: 106, name: "Go (1.22.0)" },
            { languageId: 107, name: "Go (1.23.5)" },
            { languageId: 108, name: "Rust (1.85.0)" },
            { languageId: 109, name: "Python (3.13.2)" },
            { languageId: 110, name: "C (Clang 19.1.7)" },
            { languageId: 111, name: "Kotlin (2.1.10)" },
            { languageId: 112, name: "Scala (3.4.2)" },
            { languageId: 113, name: "Python (3.14.0)" },
          ],
          success: true,
          messageId: 'I00001',
          message: 'Đã tải danh sách ngôn ngữ (fallback data)',
          detailErrors: null,
        };
      }
      
      return {
        response: [],
        success: false,
        messageId: 'E00007',
        message: axiosError.response?.data?.message || axiosError.message || 'Failed to fetch code languages',
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
