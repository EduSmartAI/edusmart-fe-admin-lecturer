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

// Technology Type Enum matching API
// 1 = Programming Language
// 2 = Framework
// 3 = Database
// 4 = Tool
export type TechnologyTypeValue = 1 | 2 | 3 | 4;

export interface Technology {
  technologyId: string;
  technologyName: string;
  description: string;
  technologyType: TechnologyTypeValue;
  technologyTypeName: string;
  createdAt: string;
}

export interface TechnologyCreatePayload {
  technologyName: string;
  description: string;
  technologyType: TechnologyTypeValue;
}

export interface TechnologyUpdatePayload {
  technologyId: string;
  technologyName: string;
  description: string;
  technologyType: TechnologyTypeValue;
}

export interface TechnologyListResponse {
  response: {
    items: Technology[];
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

export interface TechnologyState {
  // State
  technologies: Technology[];
  isLoading: boolean;
  error: string | null;
  selectedTechnology: Technology | null;
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Actions
  fetchTechnologies: (page?: number, pageSize?: number, search?: string, technologyType?: TechnologyTypeValue) => Promise<void>;
  getTechnologyById: (id: string) => Promise<Technology | null>;
  createTechnology: (payload: TechnologyCreatePayload) => Promise<boolean>;
  updateTechnology: (payload: TechnologyUpdatePayload) => Promise<boolean>;
  deleteTechnology: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelected: () => void;
}

/**
 * Technology Store
 * Manages CRUD operations for technologies
 * APIs:
 * - POST /student/api/v1/Admin/InsertTechnology
 * - GET /student/api/v1/Admin/SelectTechnologies
 * - PUT /student/api/v1/Admin/UpdateTechnology
 * - DELETE /student/api/v1/Admin/DeleteTechnology
 */
export const useTechnologyStore = create<TechnologyState>((set, get) => ({
  technologies: [],
  isLoading: false,
  error: null,
  selectedTechnology: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,

  fetchTechnologies: async (page = 1, pageSize = 10, search = "", technologyType?: TechnologyTypeValue) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, unknown> = {
        PageNumber: page,
        PageSize: pageSize,
      };

      if (search) {
        params.SearchTerm = search;
      }

      if (technologyType) {
        params.TechnologyType = technologyType;
      }

      // API: GET /student/api/v1/Admin/SelectTechnologies
      const response = await axios.get<TechnologyListResponse>(
        `${API_BASE_URL}/student/api/v1/Admin/SelectTechnologies`,
        {
          params,
          headers: getHeaders(),
        }
      );

      if (response.data.success && response.data.response) {
        const { items, totalCount, pageNumber, pageSize: size, totalPages, hasPreviousPage, hasNextPage } = response.data.response;

        set({
          technologies: items || [],
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
          technologies: [],
          total: 0,
          isLoading: false,
          error: response.data.message || "Failed to fetch technologies",
        });
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { status?: number; data?: { message?: string } }; 
        message?: string;
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch technologies";
      console.error("[TechnologyStore] Error fetching technologies:", error);
      set({ error: errorMessage, isLoading: false, technologies: [] });
    }
  },

  getTechnologyById: async (id: string) => {
    try {
      const tech = get().technologies.find((t) => t.technologyId === id) || null;
      set({ selectedTechnology: tech });
      return tech;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch technology";
      set({ error: errorMessage });
      console.error("[TechnologyStore] Error fetching technology:", error);
      return null;
    }
  },

  createTechnology: async (payload: TechnologyCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: POST /student/api/v1/Admin/InsertTechnology
      const response = await axios.post(
        `${API_BASE_URL}/student/api/v1/Admin/InsertTechnology`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success || response.status === 200) {
        // Refresh the list after creation
        await get().fetchTechnologies(get().currentPage, get().pageSize);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.data.message || "Failed to create technology", 
          isLoading: false 
        });
        return false;
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to create technology";
      set({ error: errorMessage, isLoading: false });
      console.error("[TechnologyStore] Error creating technology:", error);
      return false;
    }
  },

  updateTechnology: async (payload: TechnologyUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      // API: PUT /student/api/v1/Admin/UpdateTechnology
      const response = await axios.put(
        `${API_BASE_URL}/student/api/v1/Admin/UpdateTechnology`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success || response.status === 200) {
        // Refresh the list after update
        await get().fetchTechnologies(get().currentPage, get().pageSize);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.data.message || "Failed to update technology", 
          isLoading: false 
        });
        return false;
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to update technology";
      set({ error: errorMessage, isLoading: false });
      console.error("[TechnologyStore] Error updating technology:", error);
      return false;
    }
  },

  deleteTechnology: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // API: DELETE /student/api/v1/Admin/DeleteTechnology?technologyId={id}
      const response = await axios.delete(
        `${API_BASE_URL}/student/api/v1/Admin/DeleteTechnology`,
        { 
          params: { technologyId: id },
          headers: getHeaders() 
        }
      );

      if (response.data.success || response.status === 200) {
        // Refresh the list after deletion
        await get().fetchTechnologies(get().currentPage, get().pageSize);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.data.message || "Failed to delete technology", 
          isLoading: false 
        });
        return false;
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { message?: string } }; 
        message?: string 
      };
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete technology";
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
