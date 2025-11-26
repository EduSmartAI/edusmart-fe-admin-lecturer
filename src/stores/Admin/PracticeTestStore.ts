/**
 * Practice Test Store
 * Zustand store for managing Practice Test (Bài Thực Hành) state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { practiceTestAdminApi } from 'EduSmart/api/api-practice-test-service';
import {
  PracticeTest,
  PracticeTestListItem,
  CreatePracticeTestDto,
  UpdatePracticeTestDto,
  AddExamplesDto,
  AddTemplatesDto,
  AddTestCasesDto,
  PaginationParams,
  DifficultyLevel,
} from 'EduSmart/types/practice-test';

export interface PracticeTestState {
  // State
  practiceTests: PracticeTestListItem[];
  selectedTest: PracticeTest | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchPracticeTests: (page?: number, pageSize?: number, search?: string, difficulty?: DifficultyLevel) => Promise<void>;
  getPracticeTestDetail: (problemId: string) => Promise<PracticeTest | null>;
  createPracticeTest: (dto: CreatePracticeTestDto) => Promise<PracticeTest | null>;
  updatePracticeTest: (dto: UpdatePracticeTestDto) => Promise<PracticeTest | null>;
  deletePracticeTest: (problemId: string) => Promise<boolean>;
  
  // Incremental additions
  addExamples: (problemId: string, dto: Omit<AddExamplesDto, 'problemId'>) => Promise<boolean>;
  addTemplates: (problemId: string, dto: Omit<AddTemplatesDto, 'problemId'>) => Promise<boolean>;
  addTestCases: (problemId: string, dto: Omit<AddTestCasesDto, 'problemId'>) => Promise<boolean>;
  
  // Utility
  clearError: () => void;
  clearSelected: () => void;
}

export const usePracticeTestStore = create<PracticeTestState>()(
  persist(
    (set, get) => ({
      // Initial State
      practiceTests: [],
      selectedTest: null,
      isLoading: false,
      error: null,
      total: 0,
      currentPage: 1,
      pageSize: 20,

      // Fetch practice tests with pagination
      fetchPracticeTests: async (page = 1, pageSize = 20, search = '', difficulty?: DifficultyLevel) => {
        set({ isLoading: true, error: null });
        try {
          const params: PaginationParams = {
            pageNumber: page,
            pageSize,
            search,
            difficulty,
          };

          const response = await practiceTestAdminApi.getPracticeTests(params);

          if (response.success) {
            // API returns response.practiceTests, not response.items
            set({
              practiceTests: response.response.practiceTests,
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
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch practice tests';
          set({ error: errorMessage, isLoading: false });
          console.error('[PracticeTestStore] Error fetching practice tests:', error);
        }
      },

      // Get practice test detail
      getPracticeTestDetail: async (problemId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await practiceTestAdminApi.getPracticeTestDetail(problemId);

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
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch practice test detail';
          set({ error: errorMessage, isLoading: false });
          console.error('[PracticeTestStore] Error fetching detail:', error);
          return null;
        }
      },

      // Create new practice test
      createPracticeTest: async (dto: CreatePracticeTestDto) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔵 [Store] Starting practice test creation...');
          console.log('🔵 [Store] Payload:', JSON.stringify(dto, null, 2));
          
          const response = await practiceTestAdminApi.createPracticeTest(dto);

          console.log('🔵 [Store] Full API Response:', JSON.stringify(response, null, 2));
          console.log('🔵 [Store] Response structure:', {
            success: response.success,
            message: response.message,
            messageId: response.messageId,
            detailErrors: response.detailErrors,
            hasResponseData: !!response.response,
            responseData: response.response,
          });

          if (response.success) {
            console.log('✅ [Store] Practice test created successfully');
            
            // Check if response.response exists
            if (!response.response) {
              console.warn('⚠️ [Store] Success but no response data returned');
              set({ isLoading: false });
              // Return a minimal object or just refresh the list
              await get().fetchPracticeTests(1, 20);
              return null;
            }
            
            // Add to list - API uses problemId
            const newTest: PracticeTestListItem = {
              problemId: response.response.problemId || '',
              title: response.response.title || dto.problem.title,
              difficulty: response.response.difficulty || 'Easy',
              totalTestCases: response.response.totalTestCases || 0,
              totalExamples: response.response.totalExamples || 0,
              totalTemplates: response.response.totalTemplates || 0,
              totalSubmissions: response.response.totalSubmissions || 0,
              createdAt: response.response.createdAt || new Date().toISOString(),
            };

            set({
              practiceTests: [newTest, ...get().practiceTests],
              total: get().total + 1,
              isLoading: false,
            });

            return response.response;
          } else {
            console.error('❌ [Store] API returned success=false:', {
              message: response.message,
              detailErrors: response.detailErrors,
            });
            set({
              error: response.message,
              isLoading: false,
            });
            throw new Error(response.message || 'Failed to create practice test');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create practice test';
          console.error('❌ [Store] Error creating practice test:', error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Update practice test
      updatePracticeTest: async (dto: UpdatePracticeTestDto) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔵 [Store] Updating practice test...');
          console.log('🔵 [Store] Update payload:', JSON.stringify(dto, null, 2));
          
          const response = await practiceTestAdminApi.updatePracticeTest(dto);

          console.log('🔵 [Store] Update response:', {
            success: response.success,
            message: response.message,
            hasResponseData: !!response.response,
          });

          if (response.success) {
            console.log('✅ [Store] Practice test updated successfully');
            
            // Update in list if response data exists
            if (response.response) {
              set({
                practiceTests: get().practiceTests.map((test) =>
                  test.problemId === dto.problemId
                    ? {
                        ...test,
                        title: response.response.title,
                        difficulty: response.response.difficulty,
                        totalTestCases: response.response.totalTestCases || test.totalTestCases,
                        totalExamples: response.response.totalExamples || test.totalExamples,
                        totalTemplates: response.response.totalTemplates || test.totalTemplates,
                      }
                    : test
                ),
                selectedTest: response.response,
                isLoading: false,
              });
            } else {
              // If no response data, just refresh the list
              set({ isLoading: false });
              await get().fetchPracticeTests(get().currentPage, get().pageSize);
            }

            return response.response;
          } else {
            console.error('❌ [Store] API returned success=false:', {
              message: response.message,
              detailErrors: response.detailErrors,
            });
            set({
              error: response.message,
              isLoading: false,
            });
            throw new Error(response.message || 'Failed to update practice test');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update practice test';
          console.error('❌ [Store] Error updating practice test:', error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Delete practice test
      deletePracticeTest: async (problemId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await practiceTestAdminApi.deletePracticeTest(problemId);

          if (response.success) {
            set({
              practiceTests: get().practiceTests.filter((test) => test.problemId !== problemId),
              total: get().total - 1,
              selectedTest: get().selectedTest?.problemId === problemId ? null : get().selectedTest,
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
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete practice test';
          set({ error: errorMessage, isLoading: false });
          console.error('[PracticeTestStore] Error deleting practice test:', error);
          return false;
        }
      },

      // Add examples to existing test
      addExamples: async (problemId: string, dto: Omit<AddExamplesDto, 'problemId'>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await practiceTestAdminApi.addExamples({
            problemId,
            ...dto,
          });

          if (response.success) {
            // Refresh detail if selected
            if (get().selectedTest?.problemId === problemId) {
              await get().getPracticeTestDetail(problemId);
            }
            
            // Update count in list
            set({
              practiceTests: get().practiceTests.map((test) =>
                test.problemId === problemId
                  ? { ...test, totalExamples: test.totalExamples + dto.examples.length }
                  : test
              ),
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
          const errorMessage = error instanceof Error ? error.message : 'Failed to add examples';
          set({ error: errorMessage, isLoading: false });
          console.error('[PracticeTestStore] Error adding examples:', error);
          return false;
        }
      },

      // Add templates to existing test
      addTemplates: async (problemId: string, dto: Omit<AddTemplatesDto, 'problemId'>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await practiceTestAdminApi.addTemplates({
            problemId,
            ...dto,
          });

          if (response.success) {
            // Refresh detail if selected
            if (get().selectedTest?.problemId === problemId) {
              await get().getPracticeTestDetail(problemId);
            }
            
            // Update count in list
            set({
              practiceTests: get().practiceTests.map((test) =>
                test.problemId === problemId
                  ? { ...test, totalTemplates: test.totalTemplates + dto.templates.length }
                  : test
              ),
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
          const errorMessage = error instanceof Error ? error.message : 'Failed to add templates';
          set({ error: errorMessage, isLoading: false });
          console.error('[PracticeTestStore] Error adding templates:', error);
          return false;
        }
      },

      // Add test cases to existing test
      addTestCases: async (problemId: string, dto: Omit<AddTestCasesDto, 'problemId'>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await practiceTestAdminApi.addTestCases({
            problemId,
            ...dto,
          });

          if (response.success) {
            // Refresh detail if selected
            if (get().selectedTest?.problemId === problemId) {
              await get().getPracticeTestDetail(problemId);
            }
            
            // Update counts in list
            set({
              practiceTests: get().practiceTests.map((test) =>
                test.problemId === problemId
                  ? {
                      ...test,
                      totalTestCases: test.totalTestCases + dto.publicTestcases.length + dto.privateTestcases.length,
                    }
                  : test
              ),
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
          const errorMessage = error instanceof Error ? error.message : 'Failed to add test cases';
          set({ error: errorMessage, isLoading: false });
          console.error('[PracticeTestStore] Error adding test cases:', error);
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
      name: 'practice-test-storage',
      partialize: (state) => ({
        currentPage: state.currentPage,
        pageSize: state.pageSize,
      }),
    }
  )
);
