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

// Learning Goal Type based on API
// 0 = Chưa có định hướng
// 1-10 = Various career paths
export type LearningGoalTypeValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface LearningGoal {
  goalId: string;
  goalName: string;
  description: string;
  learningGoalType: LearningGoalTypeValue;
  createdAt: string;
}

export interface LearningGoalCreatePayload {
  goalName: string;
  description: string;
  learningGoalType: LearningGoalTypeValue;
}

export interface LearningGoalUpdatePayload {
  goalId: string;
  goalName: string;
  description: string;
  learningGoalType: LearningGoalTypeValue;
}

export interface LearningGoalListResponse {
  response: {
    items: LearningGoal[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: string[] | null;
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
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Actions
  fetchGoals: (page?: number, pageSize?: number, search?: string, learningGoalType?: LearningGoalTypeValue) => Promise<void>;
  getGoalById: (id: string) => Promise<LearningGoal | null>;
  createGoal: (payload: LearningGoalCreatePayload) => Promise<boolean>;
  updateGoal: (payload: LearningGoalUpdatePayload) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelected: () => void;
}

/**
 * Learning Goal Store
 * Manages CRUD operations for learning goals
 * APIs:
 * - POST /student/api/v1/Admin/InsertLearningGoal
 * - GET /student/api/v1/Admin/SelectLearningGoals
 * - PUT /student/api/v1/Admin/UpdateLearningGoal
 * - DELETE /student/api/v1/Admin/DeleteLearningGoal
 */
export const useLearningGoalStore = create<LearningGoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  selectedGoal: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,

  fetchGoals: async (page = 1, pageSize = 10, search = "", learningGoalType?: LearningGoalTypeValue) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, unknown> = {
        PageNumber: page,
        PageSize: pageSize,
      };

      if (search) {
        params.SearchTerm = search;
      }

      if (learningGoalType !== undefined) {
        params.LearningGoalType = learningGoalType;
      }

      // API: GET /student/api/v1/Admin/SelectLearningGoals
      const response = await axios.get<LearningGoalListResponse>(
        `${API_BASE_URL}/student/api/v1/Admin/SelectLearningGoals`,
        {
          params,
          headers: getHeaders(),
        }
      );

      if (response.data.success && response.data.response) {
        const { items, totalCount, pageNumber, pageSize: size, totalPages, hasPreviousPage, hasNextPage } = response.data.response;

        set({
          goals: items || [],
          total: totalCount,
          currentPage: pageNumber,
          pageSize: size,
          totalPages,
          hasPreviousPage,
          hasNextPage,
          isLoading: false,
        });
      } else {
        set({
          goals: [],
          total: 0,
          isLoading: false,
          error: response.data.message || "Failed to fetch learning goals",
        });
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { status?: number; data?: { message?: string } }; 
        message?: string;
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch learning goals";
      console.error("[LearningGoalStore] Error fetching goals:", error);
      set({ error: errorMessage, isLoading: false, goals: [] });
    }
  },

  getGoalById: async (id: string) => {
    try {
      const goal = get().goals.find((g) => g.goalId === id) || null;
      set({ selectedGoal: goal });
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch learning goal";
      set({ error: errorMessage });
      console.error("[LearningGoalStore] Error fetching goal:", error);
      return null;
    }
  },

  createGoal: async (payload: LearningGoalCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /student/api/v1/Admin/InsertLearningGoal
      const response = await axios.post(
        `${API_BASE_URL}/student/api/v1/Admin/InsertLearningGoal`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success || response.status === 200) {
        // Refresh the list after creation
        await get().fetchGoals(get().currentPage, get().pageSize);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.data.message || "Failed to create learning goal", 
          isLoading: false 
        });
        return false;
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to create learning goal";
      set({ error: errorMessage, isLoading: false });
      console.error("[LearningGoalStore] Error creating goal:", error);
      return false;
    }
  },

  updateGoal: async (payload: LearningGoalUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: PUT /student/api/v1/Admin/UpdateLearningGoal
      const response = await axios.put(
        `${API_BASE_URL}/student/api/v1/Admin/UpdateLearningGoal`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success || response.status === 200) {
        // Refresh the list after update
        await get().fetchGoals(get().currentPage, get().pageSize);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.data.message || "Failed to update learning goal", 
          isLoading: false 
        });
        return false;
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to update learning goal";
      set({ error: errorMessage, isLoading: false });
      console.error("[LearningGoalStore] Error updating goal:", error);
      return false;
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /student/api/v1/Admin/DeleteLearningGoal?GoalId={id}
      const response = await axios.delete(
        `${API_BASE_URL}/student/api/v1/Admin/DeleteLearningGoal`,
        { 
          params: { GoalId: id },
          headers: getHeaders() 
        }
      );

      if (response.data.success || response.status === 200) {
        // Refresh the list after deletion
        await get().fetchGoals(get().currentPage, get().pageSize);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.data.message || "Failed to delete learning goal", 
          isLoading: false 
        });
        return false;
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete learning goal";
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
