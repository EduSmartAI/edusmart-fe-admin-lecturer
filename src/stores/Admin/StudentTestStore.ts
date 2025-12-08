import { create } from "zustand";
import {
  quizAdminServiceApi,
  StudentTest,
  StudentTestDetail,
} from "EduSmart/api/api-quiz-admin-service";

export interface StudentTestState {
  // State
  tests: StudentTest[];
  selectedTestDetail: StudentTestDetail | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchTests: (page?: number, pageSize?: number) => Promise<void>;
  fetchTestDetail: (studentTestId: string) => Promise<void>;
  clearError: () => void;
  clearDetail: () => void;
}

/**
 * Student Test Store
 * Manages viewing student test submissions and details
 * APIs:
 * - GET /quiz/api/v1/Admin/SelectStudentTests
 * - GET /quiz/api/v1/Admin/SelectStudentTestDetail
 */
export const useStudentTestStore = create<StudentTestState>((set) => ({
  tests: [],
  selectedTestDetail: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  total: 0,
  currentPage: 0,
  pageSize: 10,

  fetchTests: async (page = 0, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[StudentTestStore] Fetching tests with page:', page, 'pageSize:', pageSize);
      
      const response = await quizAdminServiceApi.getStudentTests({
        pageNumber: page + 1, // API expects 1-based pagination
        pageSize: pageSize,
      });

      console.log('[StudentTestStore] API Response:', response);

      if (response.success && response.response) {
        console.log('[StudentTestStore] Tests loaded:', response.response.studentTests.length);
        set({
          tests: response.response.studentTests,
          total: response.response.totalCount,
          currentPage: page, // Store as 0-based for UI
          pageSize: response.response.pageSize,
          isLoading: false,
        });
      } else {
        console.error('[StudentTestStore] API failed:', response.message);
        set({
          error: response.message || "Failed to fetch student tests",
          isLoading: false,
        });
      }
    } catch (error: unknown) {
      console.error('[StudentTestStore] Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch student tests";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchTestDetail: async (studentTestId: string) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await quizAdminServiceApi.getStudentTestDetail(studentTestId);

      if (response.success && response.response) {
        set({
          selectedTestDetail: response.response,
          isLoadingDetail: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch test detail",
          isLoadingDetail: false,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch test detail";
      set({ error: errorMessage, isLoadingDetail: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearDetail: () => {
    set({ selectedTestDetail: null });
  },
}));
