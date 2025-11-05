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

export type QuestionType = "SHORT_TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "NUMERIC";

export interface QuestionAnswer {
  id: string;
  answerText: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface NumericRules {
  minValue: number;
  maxValue: number;
  unit?: string;
  formula?: string;
}

export interface Question {
  id: string;
  questionText: string;
  explanation?: string;
  questionType: QuestionType;
  answers?: QuestionAnswer[];
  numericRules?: NumericRules;
  createdDate?: string;
  modifiedDate?: string;
  isActive: boolean;
  usedInSurveys?: number;
}

export interface QuestionCreatePayload {
  questionText: string;
  explanation?: string;
  questionType: QuestionType;
  answers?: QuestionAnswer[];
  numericRules?: NumericRules;
}

export interface QuestionUpdatePayload {
  id: string;
  questionText: string;
  explanation?: string;
  questionType: QuestionType;
  answers?: QuestionAnswer[];
  numericRules?: NumericRules;
  isActive: boolean;
}

export interface QuestionListResponse {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuestionState {
  // State
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  selectedQuestion: Question | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchQuestions: (page?: number, pageSize?: number, search?: string, type?: QuestionType) => Promise<void>;
  getQuestionById: (id: string) => Promise<Question | null>;
  createQuestion: (payload: QuestionCreatePayload) => Promise<Question | null>;
  updateQuestion: (payload: QuestionUpdatePayload) => Promise<Question | null>;
  deleteQuestion: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelected: () => void;
}

/**
 * Question Store
 * Manages CRUD operations for questions
 * APIs:
 * - POST /quiz/api/v1/Question
 * - PUT /quiz/api/v1/Question
 * - DELETE /quiz/api/v1/Question/{id}
 * - GET /quiz/api/v1/Question (implicit for list)
 */
export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  isLoading: false,
  error: null,
  selectedQuestion: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,

  fetchQuestions: async (
    page = 1,
    pageSize = 20,
    search = "",
    type: QuestionType | undefined = undefined
  ) => {
    set({ isLoading: true, error: null });
    try {
      // API: GET /quiz/api/v1/Question
      // Note: Backend uses 0-based pageNumber
      const response = await axios.get(
        `${API_BASE_URL}/quiz/api/v1/Question`,
        {
          params: {
            pageNumber: page - 1, // Convert from 1-based to 0-based
            pageSize: pageSize,
            searchTerm: search,
            questionType: type,
          },
          headers: getHeaders(),
        }
      );

      // Extract data from response - backend returns { response: [], success: true, ... }
      const data = Array.isArray(response.data) ? response.data : response.data?.response || response.data?.data || [];

      set({
        questions: data.map((q: Record<string, unknown>) => ({
          id: q.id || q.questionId,
          questionText: q.questionText,
          explanation: q.explanation,
          questionType: q.questionType || "SHORT_TEXT",
          answers: q.answers || [],
          numericRules: q.numericRules,
          isActive: q.isActive ?? true,
          usedInSurveys: q.usedInSurveys || 0,
          createdDate: q.createdDate,
          modifiedDate: q.modifiedDate,
        })) || [],
        total: response.data?.total || data.length || 0,
        currentPage: page,
        pageSize: pageSize,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const errorMessage = err?.response?.data?.message 
        || (error as Error)?.message 
        || "Failed to fetch questions";
      console.error("[QuestionStore] Fetch error:", {
        status: err.response?.status,
        method: "GET",
        url: `${API_BASE_URL}/quiz/api/v1/Question?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${search}`,
        message: (error as Error)?.message,
        data: err.response?.data,
      });
      set({ error: errorMessage, isLoading: false });
    }
  },

  getQuestionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const question = get().questions.find((q) => q.id === id) || null;
      set({ selectedQuestion: question, isLoading: false });
      return question;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch question";
      set({ error: errorMessage, isLoading: false });
      console.error("[QuestionStore] Error fetching question:", error);
      return null;
    }
  },

  createQuestion: async (payload: QuestionCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /quiz/api/v1/Question
      const response = await axios.post(
        `${API_BASE_URL}/quiz/api/v1/Question`,
        {
          questionText: payload.questionText,
          explanation: payload.explanation,
          answers: payload.answers?.map((a) => ({
            answerText: a.answerText,
            isCorrect: a.isCorrect ?? false,
          })) || [],
        },
        { headers: getHeaders() }
      );

      const newQuestion: Question = {
        id: response.data?.id || response.data?.questionId || Date.now().toString(),
        questionText: response.data?.questionText || payload.questionText,
        explanation: response.data?.explanation || payload.explanation,
        questionType: payload.questionType,
        answers: payload.answers || [],
        numericRules: payload.numericRules,
        isActive: response.data?.isActive ?? true,
        usedInSurveys: 0,
        createdDate: response.data?.createdDate,
      };

      const currentQuestions = get().questions;
      set({
        questions: [newQuestion, ...currentQuestions],
        isLoading: false,
      });
      return newQuestion;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create question";
      set({ error: errorMessage, isLoading: false });
      console.error("[QuestionStore] Error creating question:", error);
      return null;
    }
  },

  updateQuestion: async (payload: QuestionUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: PUT /quiz/api/v1/Question
      await axios.put(
        `${API_BASE_URL}/quiz/api/v1/Question`,
        {
          questionId: payload.id,
          questionText: payload.questionText,
          explanation: payload.explanation,
          answers: payload.answers?.map((a) => ({
            answerId: a.id,
            answerText: a.answerText,
            isCorrect: a.isCorrect ?? false,
          })) || [],
        },
        { headers: getHeaders() }
      );

      const updatedQuestions = get().questions.map((q) =>
        q.id === payload.id
          ? {
              ...q,
              questionText: payload.questionText,
              explanation: payload.explanation,
              questionType: payload.questionType,
              answers: payload.answers,
              numericRules: payload.numericRules,
              isActive: payload.isActive,
            }
          : q
      );

      set({
        questions: updatedQuestions,
        selectedQuestion: updatedQuestions.find((q) => q.id === payload.id) || null,
        isLoading: false,
      });

      return updatedQuestions.find((q) => q.id === payload.id) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update question";
      set({ error: errorMessage, isLoading: false });
      console.error("[QuestionStore] Error updating question:", error);
      return null;
    }
  },

  deleteQuestion: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /quiz/api/v1/Question?questionId={id}
      await axios.delete(
        `${API_BASE_URL}/quiz/api/v1/Question`,
        {
          params: { questionId: id },
          headers: getHeaders(),
        }
      );

      const updatedQuestions = get().questions.filter((q) => q.id !== id);
      set({
        questions: updatedQuestions,
        selectedQuestion: get().selectedQuestion?.id === id ? null : get().selectedQuestion,
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const errorMessage = err?.response?.data?.message 
        || (error as Error)?.message 
        || "Failed to delete question";
      console.error("[QuestionStore] Delete error:", {
        status: err.response?.status,
        method: "DELETE",
        url: `${API_BASE_URL}/quiz/api/v1/Question?questionId=${id}`,
        message: (error as Error)?.message,
        data: err.response?.data,
      });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelected: () => {
    set({ selectedQuestion: null });
  },
}));
