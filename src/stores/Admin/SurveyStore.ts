import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.edusmart.pro.vn";

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    Accept: "text/plain",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface SurveyQuestion {
  id: string;
  questionId: string;
  questionText: string;
  questionType: "SHORT_TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "NUMERIC";
  order: number;
  answers?: SurveyAnswer[];
}

export interface SurveyAnswer {
  id: string;
  answerText: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Survey {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: SurveyStatus;
  questions?: SurveyQuestion[];
  createdDate?: string;
  modifiedDate?: string;
  publishedDate?: string;
}

export interface SurveyAnswerRule {
  numericMin: number;
  numericMax: number;
  unit: number;
  mappedField: string;
  formula: string;
}

export interface SurveyAnswerPayload {
  answerText: string;
  isCorrect: boolean;
  answerRules?: SurveyAnswerRule[];
}

export interface SurveyQuestionPayload {
  questionText: string;
  questionType: number; // 1 = Multiple Choice, 2 = Text, 3 = Numeric, 4 = Rating
  answers: SurveyAnswerPayload[];
}

export interface SurveyCreatePayload {
  title: string;
  description: string;
  surveyCode: string;
  questions: SurveyQuestionPayload[];
}

export interface SurveyUpdatePayload {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: SurveyStatus;
  questions?: SurveyQuestion[];
}

export interface SurveyListResponse {
  data: Survey[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SurveyState {
  // State
  surveys: Survey[];
  isLoading: boolean;
  error: string | null;
  selectedSurvey: Survey | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchSurveys: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  getSurveyById: (id: string) => Promise<Survey | null>;
  getSurveyDetail: (id: string) => Promise<Survey | null>;
  createSurvey: (payload: SurveyCreatePayload) => Promise<Survey | null>;
  updateSurvey: (payload: SurveyUpdatePayload) => Promise<Survey | null>;
  publishSurvey: (id: string) => Promise<boolean>;
  deleteSurvey: (id: string) => Promise<boolean>;
  addQuestion: (surveyId: string, question: SurveyQuestion) => void;
  removeQuestion: (surveyId: string, questionId: string) => void;
  reorderQuestions: (surveyId: string, questions: SurveyQuestion[]) => void;
  clearError: () => void;
  clearSelected: () => void;
}

/**
 * Survey Store
 * Manages CRUD operations for surveys with inline questions
 * APIs:
 * - POST /quiz/api/v1/Survey/InsertSurvey
 * - GET /quiz/api/v1/Survey
 * - GET /quiz/api/v1/Survey/Detail
 * - PUT /quiz/api/v1/Survey
 * - DELETE /quiz/api/v1/Survey/{id}
 */
export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  isLoading: false,
  error: null,
  selectedSurvey: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,

  fetchSurveys: async (page = 1, pageSize = 20, search = "") => {
    set({ isLoading: true, error: null });
    try {
      // API: GET /quiz/api/v1/Survey
      const response = await axios.get(
        `${API_BASE_URL}/quiz/api/v1/Survey`,
        {
          params: {
            pageIndex: page - 1,
            pageSize: pageSize,
            searchTerm: search,
          },
          headers: getHeaders(),
        }
      );

      // Extract data from response - backend returns { response: [], success: true, ... }
      const data = Array.isArray(response.data) ? response.data : response.data?.response || response.data?.data || [];

      set({
        surveys: data.map((s: Record<string, unknown>) => ({
          id: s.id || s.surveyId,
          code: s.code || s.surveyCode,
          title: s.title || s.surveyName,
          description: s.description,
          status: s.status || "DRAFT",
          questions: s.questions || [],
          createdDate: s.createdDate,
          modifiedDate: s.modifiedDate,
          publishedDate: s.publishedDate,
        })) || [],
        total: response.data?.total || data.length || 0,
        currentPage: page,
        pageSize: pageSize,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch surveys";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error fetching surveys:", error);
    }
  },

  getSurveyById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const survey = get().surveys.find((s) => s.id === id) || null;
      set({ selectedSurvey: survey, isLoading: false });
      return survey;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch survey";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error fetching survey:", error);
      return null;
    }
  },

  getSurveyDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: GET /quiz/api/v1/Survey/Detail
      const response = await axios.get(
        `${API_BASE_URL}/quiz/api/v1/Survey/Detail`,
        {
          params: {
            SurveyId: id,
            PageIndex: 0,
            PageSize: 1000,
          },
          headers: getHeaders(),
        }
      );

      const surveyData = response.data;
      if (surveyData) {
        const survey: Survey = {
          id: surveyData.id || surveyData.surveyId,
          code: surveyData.code || surveyData.surveyCode,
          title: surveyData.title || surveyData.surveyName,
          description: surveyData.description,
          status: surveyData.status || "DRAFT",
          questions: surveyData.questions || [],
          createdDate: surveyData.createdDate,
          modifiedDate: surveyData.modifiedDate,
          publishedDate: surveyData.publishedDate,
        };

        set({ selectedSurvey: survey, isLoading: false });
        return survey;
      }
      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch survey details";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error fetching survey details:", error);
      return null;
    }
  },

  createSurvey: async (payload: SurveyCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /quiz/api/v1/Admin/InsertSurvey
      // Match exact curl structure
      const response = await axios.post(
        `${API_BASE_URL}/quiz/api/v1/Admin/InsertSurvey`,
        {
          title: payload.title,
          description: payload.description,
          surveyCode: payload.surveyCode,
          questions: payload.questions,
        },
        { headers: getHeaders() }
      );

      const newSurvey: Survey = {
        id: response.data?.response?.id || response.data?.id || Date.now().toString(),
        code: response.data?.response?.surveyCode || payload.surveyCode,
        title: response.data?.response?.title || payload.title,
        description: response.data?.response?.description || payload.description,
        status: "DRAFT",
        questions: payload.questions as unknown as SurveyQuestion[],
        createdDate: response.data?.response?.createdDate || new Date().toISOString(),
      };

      const currentSurveys = get().surveys;
      set({
        surveys: [newSurvey, ...currentSurveys],
        total: get().total + 1,
        isLoading: false,
      });
      return newSurvey;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create survey";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error creating survey:", error);
      return null;
    }
  },

  updateSurvey: async (payload: SurveyUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: PUT /quiz/api/v1/Survey
      await axios.put(
        `${API_BASE_URL}/quiz/api/v1/Survey`,
        {
          surveyId: payload.id,
          code: payload.code,
          surveyName: payload.title,
          description: payload.description,
          status: payload.status,
          questions: payload.questions || [],
        },
        { headers: getHeaders() }
      );

      const updatedSurveys = get().surveys.map((s) =>
        s.id === payload.id
          ? {
              ...s,
              code: payload.code,
              title: payload.title,
              description: payload.description,
              status: payload.status,
              questions: payload.questions,
            }
          : s
      );

      set({
        surveys: updatedSurveys,
        selectedSurvey: updatedSurveys.find((s) => s.id === payload.id) || null,
        isLoading: false,
      });

      return updatedSurveys.find((s) => s.id === payload.id) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update survey";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error updating survey:", error);
      return null;
    }
  },

  publishSurvey: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /quiz/api/v1/Survey/Publish/{id}
      await axios.post(
        `${API_BASE_URL}/quiz/api/v1/Survey/Publish/${id}`,
        {},
        { headers: getHeaders() }
      );

      const survey = get().surveys.find((s) => s.id === id);
      if (survey) {
        const updatedSurvey = { ...survey, status: "PUBLISHED" as SurveyStatus };
        const updatedSurveys = get().surveys.map((s) =>
          s.id === id ? updatedSurvey : s
        );

        set({
          surveys: updatedSurveys,
          selectedSurvey: get().selectedSurvey?.id === id ? updatedSurvey : get().selectedSurvey,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to publish survey";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error publishing survey:", error);
      return false;
    }
  },

  deleteSurvey: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /quiz/api/v1/Survey/{id}
      await axios.delete(
        `${API_BASE_URL}/quiz/api/v1/Survey/${id}`,
        { headers: getHeaders() }
      );

      const updatedSurveys = get().surveys.filter((s) => s.id !== id);
      set({
        surveys: updatedSurveys,
        selectedSurvey: get().selectedSurvey?.id === id ? null : get().selectedSurvey,
        isLoading: false,
      });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete survey";
      set({ error: errorMessage, isLoading: false });
      console.error("[SurveyStore] Error deleting survey:", error);
      return false;
    }
  },

  addQuestion: (surveyId: string, question: SurveyQuestion) => {
    const selected = get().selectedSurvey;
    if (selected && selected.id === surveyId) {
      const updatedQuestions = [...(selected.questions || []), question];
      set({
        selectedSurvey: {
          ...selected,
          questions: updatedQuestions,
        },
      });
    }
  },

  removeQuestion: (surveyId: string, questionId: string) => {
    const selected = get().selectedSurvey;
    if (selected && selected.id === surveyId) {
      const updatedQuestions = (selected.questions || []).filter(
        (q) => q.id !== questionId
      );
      set({
        selectedSurvey: {
          ...selected,
          questions: updatedQuestions,
        },
      });
    }
  },

  reorderQuestions: (surveyId: string, questions: SurveyQuestion[]) => {
    const selected = get().selectedSurvey;
    if (selected && selected.id === surveyId) {
      set({
        selectedSurvey: {
          ...selected,
          questions,
        },
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelected: () => {
    set({ selectedSurvey: null });
  },
}));
