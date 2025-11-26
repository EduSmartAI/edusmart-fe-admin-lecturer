/**
 * Initial Test Store
 * Zustand store for managing Initial Test state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialTestApi } from 'EduSmart/api/api-initial-test-service';
import {
  InitialTest,
  InitialTestListItem,
  CreateInitialTestDto,
  PaginationParams,
} from 'EduSmart/types/initial-test';

export interface InitialTestState {
  // State
  tests: InitialTestListItem[];
  selectedTest: InitialTest | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchTests: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  getTestDetail: (testId: string) => Promise<InitialTest | null>;
  createTest: (dto: CreateInitialTestDto) => Promise<InitialTest | null>;
  updateTest: (dto: InitialTest) => Promise<InitialTest | null>;
  deleteTest: (testId: string) => Promise<boolean>;
  duplicateTest: (testId: string) => Promise<boolean>;
  
  // Utility
  clearError: () => void;
  clearSelected: () => void;
}

export const useInitialTestStore = create<InitialTestState>()(
  persist(
    (set, get) => ({
      // Initial State
      tests: [],
      selectedTest: null,
      isLoading: false,
      error: null,
      total: 0,
      currentPage: 1,
      pageSize: 20,

      // Fetch tests with pagination
      fetchTests: async (page = 1, pageSize = 20, search = '') => {
        set({ isLoading: true, error: null });
        try {
          const params: PaginationParams = {
            pageNumber: page,
            pageSize,
            search,
          };

          const response = await initialTestApi.getTests(params);

          if (response.success) {
            set({
              tests: response.response.items,
              total: response.response.totalCount,
              currentPage: page,
              pageSize,
              isLoading: false,
            });
          } else {
            set({
              error: response.message,
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tests';
          set({ error: errorMessage, isLoading: false });
          console.error('[InitialTestStore] Error fetching tests:', error);
        }
      },

      // Get test detail
      getTestDetail: async (testId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await initialTestApi.getTestDetail(testId);

          if (response.success) {
            set({
              selectedTest: response.response,
              isLoading: false,
            });
            return response.response;
          } else {
            set({
              error: response.message,
              isLoading: false,
            });
            return null;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch test detail';
          set({ error: errorMessage, isLoading: false });
          console.error('[InitialTestStore] Error fetching detail:', error);
          return null;
        }
      },

      // Create new test
      createTest: async (dto: CreateInitialTestDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await initialTestApi.createTest(dto);

          if (response.success) {
            // Add to list
            const newTest: InitialTestListItem = {
              testId: response.response.testId,
              testName: response.response.testName,
              description: response.response.description,
              totalQuizzes: response.response.totalQuizzes || 0,
              totalQuestions: response.response.totalQuestions || 0,
              createdAt: response.response.createdAt || new Date().toISOString(),
              updatedAt: response.response.updatedAt || new Date().toISOString(),
            };

            set({
              tests: [newTest, ...get().tests],
              total: get().total + 1,
              isLoading: false,
            });

            return response.response;
          } else {
            set({
              error: response.message,
              isLoading: false,
            });
            return null;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create test';
          set({ error: errorMessage, isLoading: false });
          console.error('[InitialTestStore] Error creating test:', error);
          return null;
        }
      },

      // Update test
      updateTest: async (dto: InitialTest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await initialTestApi.updateTest(dto);

          if (response.success) {
            // Update in list
            set({
              tests: get().tests.map((test) =>
                test.testId === dto.testId
                  ? {
                      ...test,
                      testName: response.response.testName,
                      description: response.response.description,
                      totalQuizzes: response.response.totalQuizzes,
                      totalQuestions: response.response.totalQuestions,
                      updatedAt: response.response.updatedAt,
                    }
                  : test
              ),
              selectedTest: response.response,
              isLoading: false,
            });

            return response.response;
          } else {
            set({
              error: response.message,
              isLoading: false,
            });
            return null;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update test';
          set({ error: errorMessage, isLoading: false });
          console.error('[InitialTestStore] Error updating test:', error);
          return null;
        }
      },

      // Delete test
      deleteTest: async (testId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await initialTestApi.deleteTest(testId);

          if (response.success) {
            set({
              tests: get().tests.filter((test) => test.testId !== testId),
              total: get().total - 1,
              selectedTest: get().selectedTest?.testId === testId ? null : get().selectedTest,
              isLoading: false,
            });
            return true;
          } else {
            set({
              error: response.message,
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete test';
          set({ error: errorMessage, isLoading: false });
          console.error('[InitialTestStore] Error deleting test:', error);
          return false;
        }
      },

      // Duplicate test
      duplicateTest: async (testId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Get the original test detail
          const original = await get().getTestDetail(testId);
          
          if (!original) {
            set({ error: 'Test not found', isLoading: false });
            return false;
          }

          // Create a copy with modified name
          const duplicateDto: CreateInitialTestDto = {
            testName: `${original.testName} (Copy)`,
            description: original.description,
            quizzes: original.quizzes,
          };

          const result = await get().createTest(duplicateDto);
          return result !== null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate test';
          set({ error: errorMessage, isLoading: false });
          console.error('[InitialTestStore] Error duplicating test:', error);
          return false;
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Clear selected test
      clearSelected: () => {
        set({ selectedTest: null });
      },
    }),
    {
      name: 'initial-test-storage',
      partialize: (state) => ({
        currentPage: state.currentPage,
        pageSize: state.pageSize,
      }),
    }
  )
);
