import { create } from "zustand";
import {
  quizAdminServiceApi,
  StudentSurvey,
} from "EduSmart/api/api-quiz-admin-service";

export interface StudentSurveyState {
  // State
  surveys: StudentSurvey[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchSurveys: (page?: number, pageSize?: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Student Survey Store
 * Manages viewing student survey submissions
 * API: GET /quiz/api/v1/Admin/SelectStudentSurveys
 */
export const useStudentSurveyStore = create<StudentSurveyState>((set) => ({
  surveys: [],
  isLoading: false,
  error: null,
  total: 0,
  currentPage: 0,
  pageSize: 10,

  fetchSurveys: async (page = 0, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await quizAdminServiceApi.getStudentSurveys({
        pageNumber: page,
        pageSize: pageSize,
      });

      if (response.success && response.response) {
        set({
          surveys: response.response.studentSurveys,
          total: response.response.totalCount,
          currentPage: response.response.pageNumber,
          pageSize: response.response.pageSize,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch student surveys",
          isLoading: false,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch student surveys";
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
