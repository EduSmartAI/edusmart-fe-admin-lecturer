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

export type LearningGoalType = "ACADEMIC" | "PROFESSIONAL" | "SKILL";

export interface LearningGoal {
  id: string;
  name: string;
  description: string;
  type: LearningGoalType;
  createdDate?: string;
  modifiedDate?: string;
  isActive: boolean;
}

export interface LearningGoalCreatePayload {
  name: string;
  description: string;
  type: LearningGoalType;
}

export interface LearningGoalUpdatePayload {
  id: string;
  name: string;
  description: string;
  type: LearningGoalType;
  isActive: boolean;
}

export interface LearningGoalListResponse {
  data: LearningGoal[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LearningGoalState {
  // State
  goals: LearningGoal[];
  isLoading: boolean;
  error: string | null;
  selectedGoal: LearningGoal | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchGoals: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  getGoalById: (id: string) => Promise<LearningGoal | null>;
  createGoal: (payload: LearningGoalCreatePayload) => Promise<LearningGoal | null>;
  updateGoal: (payload: LearningGoalUpdatePayload) => Promise<LearningGoal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelected: () => void;
}

/**
 * Learning Goal Store
 * Manages CRUD operations for learning goals
 * APIs:
 * - POST /quiz/api/v1/LearningGoal
 * - PUT /quiz/api/v1/LearningGoal
 * - DELETE /quiz/api/v1/LearningGoal/{id}
 * - GET /quiz/api/v1/ExternalQuiz/SelectLearningGoals
 */
export const useLearningGoalStore = create<LearningGoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  selectedGoal: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,

  fetchGoals: async (page = 1, pageSize = 20, search = "") => {
    set({ isLoading: true, error: null });
    try {
      // API: GET /quiz/api/v1/ExternalQuiz/SelectLearningGoals
      // Note: Backend uses 0-based pageNumber
      const response = await axios.get(
        `${API_BASE_URL}/quiz/api/v1/ExternalQuiz/SelectLearningGoals`,
        {
          params: {
            pageNumber: page - 1, // Convert from 1-based to 0-based
            pageSize: pageSize,
            searchTerm: search,
          },
          headers: getHeaders(),
        }
      );

      // Extract data from response - backend returns { response: [], success: true, ... }
      const data = Array.isArray(response.data) ? response.data : response.data?.response || response.data?.data || [];
      
      // Map learningGoalType: 0 = ACADEMIC, 1 = PROFESSIONAL, 2 = SKILL
      const mapGoalType = (type: number | string): LearningGoalType => {
        if (typeof type === 'string') return type as LearningGoalType;
        switch (type) {
          case 0: return "ACADEMIC";
          case 1: return "PROFESSIONAL";
          case 2: return "SKILL";
          default: return "ACADEMIC";
        }
      };
      
      set({
        goals: data.map((g: Record<string, unknown>) => ({
          id: (g.learningGoalId || g.id) as string,
          name: (g.learningGoalName || g.goalName || g.name) as string,
          description: (g.description || "") as string,
          type: mapGoalType(g.learningGoalType as number || g.type as string || 0),
          isActive: (g.isActive ?? true) as boolean,
          createdDate: g.createdDate as string | undefined,
          modifiedDate: g.modifiedDate as string | undefined,
        })) || [],
        total: response.data?.total || data.length || 0,
        currentPage: page,
        pageSize: pageSize,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number; headers?: unknown }; message?: string };
      const errorMessage = err?.response?.data?.message 
        || (error as Error)?.message 
        || "Failed to fetch learning goals";
      console.error("[LearningGoalStore] Full error:", {
        status: err.response?.status,
        message: (error as Error)?.message,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      set({ error: errorMessage, isLoading: false });
    }
  },

  getGoalById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call to get single goal
      const goal = get().goals.find((g) => g.id === id) || null;
      set({ selectedGoal: goal, isLoading: false });
      return goal;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch learning goal";
      set({ error: errorMessage, isLoading: false });
      console.error("[LearningGoalStore] Error fetching goal:", error);
      return null;
    }
  },

  createGoal: async (payload: LearningGoalCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /quiz/api/v1/LearningGoal
      const response = await axios.post(
        `${API_BASE_URL}/quiz/api/v1/LearningGoal`,
        {
          goalName: payload.name,
          description: payload.description,
          learningGoalType: ["ACADEMIC", "PROFESSIONAL", "SKILL"].indexOf(payload.type),
        },
        { headers: getHeaders() }
      );

      const newGoal: LearningGoal = {
        id: response.data?.id || response.data?.learningGoalId || Date.now().toString(),
        name: response.data?.goalName || payload.name,
        description: response.data?.description || payload.description,
        type: payload.type,
        isActive: response.data?.isActive ?? true,
        createdDate: response.data?.createdDate,
      };

      const currentGoals = get().goals;
      set({
        goals: [newGoal, ...currentGoals],
        isLoading: false,
      });
      return newGoal;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create learning goal";
      set({ error: errorMessage, isLoading: false });
      console.error("[LearningGoalStore] Error creating goal:", error);
      return null;
    }
  },

  updateGoal: async (payload: LearningGoalUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: PUT /quiz/api/v1/LearningGoal
      await axios.put(
        `${API_BASE_URL}/quiz/api/v1/LearningGoal`,
        {
          id: payload.id,
          goalName: payload.name,
          description: payload.description,
          learningGoalType: ["ACADEMIC", "PROFESSIONAL", "SKILL"].indexOf(payload.type),
          isActive: payload.isActive ?? true,
        },
        { headers: getHeaders() }
      );

      const updatedGoals = get().goals.map((g) =>
        g.id === payload.id
          ? {
              ...g,
              name: payload.name,
              description: payload.description,
              type: payload.type,
              isActive: payload.isActive,
            }
          : g
      );

      set({
        goals: updatedGoals,
        selectedGoal: updatedGoals.find((g) => g.id === payload.id) || null,
        isLoading: false,
      });

      return updatedGoals.find((g) => g.id === payload.id) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update learning goal";
      set({ error: errorMessage, isLoading: false });
      console.error("[LearningGoalStore] Error updating goal:", error);
      return null;
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /quiz/api/v1/LearningGoal/{id}
      await axios.delete(
        `${API_BASE_URL}/quiz/api/v1/LearningGoal/${id}`,
        { headers: getHeaders() }
      );

      const updatedGoals = get().goals.filter((g) => g.id !== id);
      set({
        goals: updatedGoals,
        selectedGoal: get().selectedGoal?.id === id ? null : get().selectedGoal,
        isLoading: false,
      });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete learning goal";
      set({ error: errorMessage, isLoading: false });
      console.error("[LearningGoalStore] Error deleting goal:", error);
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelected: () => {
    set({ selectedGoal: null });
  },
}));
