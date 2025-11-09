/**
 * Quiz Admin Store
 * Zustand store for managing Quizzes, Tests, and Surveys (Admin-level CRUD)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  quizAdminServiceApi,
  AdminQuiz,
  AdminTest,
  AdminSurvey,
  CreateQuizDto,
  UpdateQuizDto,
  CreateTestDto,
  UpdateTestDto,
  CreateSurveyDto,
  UpdateSurveyDto,
} from 'EduSmart/api/api-quiz-admin-service';

interface QuizAdminState {
  // Quizzes Data
  quizzes: AdminQuiz[];
  currentQuiz: AdminQuiz | null;
  quizzesTotalCount: number;
  quizzesTotalPages: number;
  
  // Tests Data
  tests: AdminTest[];
  currentTest: AdminTest | null;
  testsTotalCount: number;
  testsTotalPages: number;
  
  // Surveys Data
  surveys: AdminSurvey[];
  currentSurvey: AdminSurvey | null;
  surveysTotalCount: number;
  surveysTotalPages: number;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // Quiz Actions
  fetchQuizzes: (page?: number, search?: string) => Promise<void>;
  createQuiz: (dto: CreateQuizDto) => Promise<boolean>;
  updateQuiz: (dto: UpdateQuizDto) => Promise<boolean>;
  deleteQuiz: (id: string) => Promise<boolean>;
  setCurrentQuiz: (quiz: AdminQuiz | null) => void;
  
  // Test Actions
  fetchTests: (page?: number, search?: string) => Promise<void>;
  createTest: (dto: CreateTestDto) => Promise<boolean>;
  updateTest: (dto: UpdateTestDto) => Promise<boolean>;
  deleteTest: (id: string) => Promise<boolean>;
  setCurrentTest: (test: AdminTest | null) => void;
  
  // Survey Actions
  fetchSurveys: (page?: number, search?: string) => Promise<void>;
  createSurvey: (dto: CreateSurveyDto) => Promise<boolean>;
  updateSurvey: (dto: UpdateSurveyDto) => Promise<boolean>;
  deleteSurvey: (id: string) => Promise<boolean>;
  setCurrentSurvey: (survey: AdminSurvey | null) => void;
  
  // Common Actions
  setSearchQuery: (query: string) => void;
  setPageSize: (size: number) => void;
  resetError: () => void;
  reset: () => void;
}

const initialState = {
  quizzes: [],
  currentQuiz: null,
  quizzesTotalCount: 0,
  quizzesTotalPages: 0,
  tests: [],
  currentTest: null,
  testsTotalCount: 0,
  testsTotalPages: 0,
  surveys: [],
  currentSurvey: null,
  surveysTotalCount: 0,
  surveysTotalPages: 0,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const useQuizAdminStore = create<QuizAdminState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================================================
      // Quiz Actions
      // ============================================================================

      fetchQuizzes: async (page?: number, search?: string) => {
        const currentPage = page ?? get().currentPage;
        const searchQuery = search ?? get().searchQuery;
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.getQuizzes({
            pageNumber: currentPage,
            pageSize: get().pageSize,
            search: searchQuery,
          });

          if (response.success && response.data) {
            set({
              quizzes: response.data.data,
              quizzesTotalCount: response.data.totalCount,
              quizzesTotalPages: response.data.totalPages,
              currentPage: response.data.pageNumber,
              isLoading: false,
            });
          } else {
            set({
              error: response.message || 'Failed to fetch quizzes',
              isLoading: false,
            });
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while fetching quizzes',
            isLoading: false,
          });
        }
      },

      createQuiz: async (dto: CreateQuizDto) => {
        set({ isCreating: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.createQuiz(dto);

          if (response.success) {
            await get().fetchQuizzes(1);
            set({ isCreating: false });
            return true;
          } else {
            set({
              error: response.message || 'Failed to create quiz',
              isCreating: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while creating quiz',
            isCreating: false,
          });
          return false;
        }
      },

      updateQuiz: async (dto: UpdateQuizDto) => {
        set({ isUpdating: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.updateQuiz(dto);

          if (response.success) {
            await get().fetchQuizzes();
            set({ isUpdating: false, currentQuiz: null });
            return true;
          } else {
            set({
              error: response.message || 'Failed to update quiz',
              isUpdating: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while updating quiz',
            isUpdating: false,
          });
          return false;
        }
      },

      deleteQuiz: async (id: string) => {
        set({ isDeleting: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.deleteQuiz(id);

          if (response.success) {
            await get().fetchQuizzes();
            set({ isDeleting: false });
            return true;
          } else {
            set({
              error: response.message || 'Failed to delete quiz',
              isDeleting: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while deleting quiz',
            isDeleting: false,
          });
          return false;
        }
      },

      setCurrentQuiz: (quiz: AdminQuiz | null) => {
        set({ currentQuiz: quiz });
      },

      // ============================================================================
      // Test Actions
      // ============================================================================

      fetchTests: async (page?: number, search?: string) => {
        const currentPage = page ?? get().currentPage;
        const searchQuery = search ?? get().searchQuery;
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.getTests({
            pageNumber: currentPage,
            pageSize: get().pageSize,
            search: searchQuery,
          });

          if (response.success && response.data) {
            set({
              tests: response.data.data,
              testsTotalCount: response.data.totalCount,
              testsTotalPages: response.data.totalPages,
              currentPage: response.data.pageNumber,
              isLoading: false,
            });
          } else {
            set({
              error: response.message || 'Failed to fetch tests',
              isLoading: false,
            });
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while fetching tests',
            isLoading: false,
          });
        }
      },

      createTest: async (dto: CreateTestDto) => {
        set({ isCreating: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.createTest(dto);

          if (response.success) {
            await get().fetchTests(1);
            set({ isCreating: false });
            return true;
          } else {
            set({
              error: response.message || 'Failed to create test',
              isCreating: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while creating test',
            isCreating: false,
          });
          return false;
        }
      },

      updateTest: async (dto: UpdateTestDto) => {
        set({ isUpdating: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.updateTest(dto);

          if (response.success) {
            await get().fetchTests();
            set({ isUpdating: false, currentTest: null });
            return true;
          } else {
            set({
              error: response.message || 'Failed to update test',
              isUpdating: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while updating test',
            isUpdating: false,
          });
          return false;
        }
      },

      deleteTest: async (id: string) => {
        set({ isDeleting: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.deleteTest(id);

          if (response.success) {
            await get().fetchTests();
            set({ isDeleting: false });
            return true;
          } else {
            set({
              error: response.message || 'Failed to delete test',
              isDeleting: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while deleting test',
            isDeleting: false,
          });
          return false;
        }
      },

      setCurrentTest: (test: AdminTest | null) => {
        set({ currentTest: test });
      },

      // ============================================================================
      // Survey Actions
      // ============================================================================

      fetchSurveys: async (page?: number, search?: string) => {
        const currentPage = page ?? get().currentPage;
        const searchQuery = search ?? get().searchQuery;
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.getSurveys({
            pageNumber: currentPage,
            pageSize: get().pageSize,
            search: searchQuery,
          });

          if (response.success && response.data) {
            set({
              surveys: response.data.data,
              surveysTotalCount: response.data.totalCount,
              surveysTotalPages: response.data.totalPages,
              currentPage: response.data.pageNumber,
              isLoading: false,
            });
          } else {
            set({
              error: response.message || 'Failed to fetch surveys',
              isLoading: false,
            });
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while fetching surveys',
            isLoading: false,
          });
        }
      },

      createSurvey: async (dto: CreateSurveyDto) => {
        set({ isCreating: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.createSurvey(dto);

          if (response.success) {
            await get().fetchSurveys(1);
            set({ isCreating: false });
            return true;
          } else {
            set({
              error: response.message || 'Failed to create survey',
              isCreating: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while creating survey',
            isCreating: false,
          });
          return false;
        }
      },

      updateSurvey: async (dto: UpdateSurveyDto) => {
        set({ isUpdating: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.updateSurvey(dto);

          if (response.success) {
            await get().fetchSurveys();
            set({ isUpdating: false, currentSurvey: null });
            return true;
          } else {
            set({
              error: response.message || 'Failed to update survey',
              isUpdating: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while updating survey',
            isUpdating: false,
          });
          return false;
        }
      },

      deleteSurvey: async (id: string) => {
        set({ isDeleting: true, error: null });
        
        try {
          const response = await quizAdminServiceApi.deleteSurvey(id);

          if (response.success) {
            await get().fetchSurveys();
            set({ isDeleting: false });
            return true;
          } else {
            set({
              error: response.message || 'Failed to delete survey',
              isDeleting: false,
            });
            return false;
          }
        } catch (error: unknown) {
        const err = error as { message?: string };
          set({
            error: err.message || 'An error occurred while deleting survey',
            isDeleting: false,
          });
          return false;
        }
      },

      setCurrentSurvey: (survey: AdminSurvey | null) => {
        set({ currentSurvey: survey });
      },

      // ============================================================================
      // Common Actions
      // ============================================================================

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setPageSize: (size: number) => {
        set({ pageSize: size, currentPage: 1 });
      },

      resetError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'quiz-admin-storage',
      partialize: (state) => ({
        pageSize: state.pageSize,
      }),
    }
  )
);
