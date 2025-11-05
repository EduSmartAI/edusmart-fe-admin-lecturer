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

export type TechnologyType = "FRAMEWORK" | "LIBRARY" | "TOOL" | "PLATFORM";
export type TechnologyCategory = "FRONTEND" | "BACKEND" | "MOBILE" | "DEVOPS";

export interface Technology {
  id: string;
  name: string;
  description?: string;
  type: TechnologyType;
  category: TechnologyCategory;
  createdDate?: string;
  modifiedDate?: string;
  isActive: boolean;
}

export interface TechnologyCreatePayload {
  name: string;
  description?: string;
  type: TechnologyType;
  category: TechnologyCategory;
}

export interface TechnologyUpdatePayload {
  id: string;
  name: string;
  description?: string;
  type: TechnologyType;
  category: TechnologyCategory;
  isActive: boolean;
}

export interface TechnologyListResponse {
  data: Technology[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TechnologyState {
  // State
  technologies: Technology[];
  isLoading: boolean;
  error: string | null;
  selectedTechnology: Technology | null;
  total: number;
  currentPage: number;
  pageSize: number;

  // Actions
  fetchTechnologies: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  getTechnologyById: (id: string) => Promise<Technology | null>;
  createTechnology: (payload: TechnologyCreatePayload) => Promise<Technology | null>;
  updateTechnology: (payload: TechnologyUpdatePayload) => Promise<Technology | null>;
  deleteTechnology: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelected: () => void;
}

/**
 * Technology Store
 * Manages CRUD operations for technologies
 * APIs:
 * - POST /quiz/api/v1/Technology/InsertTechnology
 * - PUT /quiz/api/v1/Technology/{id}
 * - DELETE /quiz/api/v1/Technology/{id}
 * - GET /quiz/api/v1/ExternalQuiz/SelectTechnologies
 */
export const useTechnologyStore = create<TechnologyState>((set, get) => ({
  technologies: [],
  isLoading: false,
  error: null,
  selectedTechnology: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,

  fetchTechnologies: async (page = 1, pageSize = 20, search = "") => {
    set({ isLoading: true, error: null });
    try {
      const fullUrl = `${API_BASE_URL}/quiz/api/v1/ExternalQuiz/SelectTechnologies`;
      const requestParams = {
        pageNumber: page - 1, // Convert from 1-based to 0-based
        pageSize: pageSize,
        searchTerm: search,
      };

      // API: GET /quiz/api/v1/ExternalQuiz/SelectTechnologies
      // Note: Backend uses 0-based pageNumber, so we convert from 1-based
      const response = await axios.get(fullUrl, {
        params: requestParams,
        headers: getHeaders(),
      });

      // Extract data from response - backend returns { response: [], success: true, ... }
      const data = Array.isArray(response.data) 
        ? response.data 
        : response.data?.response || response.data?.data || [];

      set({
        technologies: data.map((t: Record<string, unknown>) => ({
          id: t.id || t.technologyId,
          name: t.technologyName || t.name,
          description: t.description,
          type: t.technologyType === 0 ? "FRAMEWORK" : "LIBRARY",
          category: t.category || "FRONTEND",
          isActive: t.isActive ?? true,
          createdDate: t.createdDate,
          modifiedDate: t.modifiedDate,
        })) || [],
        total: response.data?.total || data.length || 0,
        currentPage: page,
        pageSize: pageSize,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { 
        response?: { status?: number; statusText?: string; data?: unknown }; 
        config?: { url?: string; method?: string; params?: unknown };
        message?: string;
      };
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch technologies";
      console.error("[TechnologyStore] Error fetching technologies:", {
        message: errorMessage,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          params: err.config?.params,
        },
      });
      set({ error: errorMessage, isLoading: false });
    }
  },

  getTechnologyById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const tech = get().technologies.find((t) => t.id === id) || null;
      set({ selectedTechnology: tech, isLoading: false });
      return tech;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch technology";
      set({ error: errorMessage, isLoading: false });
      console.error("[TechnologyStore] Error fetching technology:", error);
      return null;
    }
  },

  createTechnology: async (payload: TechnologyCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /quiz/api/v1/Technology/InsertTechnology
      const response = await axios.post(
        `${API_BASE_URL}/quiz/api/v1/Technology/InsertTechnology`,
        {
          technologyName: payload.name,
          description: payload.description,
          technologyType: 0, // Default type mapping
        },
        { headers: getHeaders() }
      );

      const newTech: Technology = {
        id: response.data?.id || response.data?.technologyId || Date.now().toString(),
        name: response.data?.technologyName || payload.name,
        description: response.data?.description || payload.description,
        type: payload.type,
        category: payload.category,
        isActive: response.data?.isActive ?? true,
        createdDate: response.data?.createdDate,
      };

      const currentTechs = get().technologies;
      set({
        technologies: [newTech, ...currentTechs],
        isLoading: false,
      });
      return newTech;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create technology";
      set({ error: errorMessage, isLoading: false });
      console.error("[TechnologyStore] Error creating technology:", error);
      return null;
    }
  },

  updateTechnology: async (payload: TechnologyUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: PUT /quiz/api/v1/Technology/{id}
      await axios.put(
        `${API_BASE_URL}/quiz/api/v1/Technology/${payload.id}`,
        {
          id: payload.id,
          technologyName: payload.name,
          description: payload.description,
          technologyType: 0,
          category: payload.category,
          isActive: payload.isActive ?? true,
        },
        { headers: getHeaders() }
      );

      const updatedTechs = get().technologies.map((t) =>
        t.id === payload.id
          ? {
              ...t,
              name: payload.name,
              description: payload.description,
              type: payload.type,
              category: payload.category,
              isActive: payload.isActive,
            }
          : t
      );

      set({
        technologies: updatedTechs,
        selectedTechnology: updatedTechs.find((t) => t.id === payload.id) || null,
        isLoading: false,
      });

      return updatedTechs.find((t) => t.id === payload.id) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update technology";
      set({ error: errorMessage, isLoading: false });
      console.error("[TechnologyStore] Error updating technology:", error);
      return null;
    }
  },

  deleteTechnology: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /quiz/api/v1/Technology/{id}
      await axios.delete(
        `${API_BASE_URL}/quiz/api/v1/Technology/${id}`,
        { headers: getHeaders() }
      );

      const updatedTechs = get().technologies.filter((t) => t.id !== id);
      set({
        technologies: updatedTechs,
        selectedTechnology: get().selectedTechnology?.id === id ? null : get().selectedTechnology,
        isLoading: false,
      });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete technology";
      set({ error: errorMessage, isLoading: false });
      console.error("[TechnologyStore] Error deleting technology:", error);
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelected: () => {
    set({ selectedTechnology: null });
  },
}));
