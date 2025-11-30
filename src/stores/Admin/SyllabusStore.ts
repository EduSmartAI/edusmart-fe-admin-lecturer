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

// ========== Major Types ==========
export interface Major {
  majorId: string;
  majorCode: string;
  majorName: string;
  description?: string | null;
}

export interface MajorCreatePayload {
  majorCode: string;
  majorName: string;
  description: string;
}

export interface MajorUpdatePayload {
  majorId: string;
  majorCode: string;
  majorName: string;
  description: string;
}

// ========== Subject Types ==========
export interface Subject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  prerequisiteSubjectIds?: string[];
}

export interface SubjectCreatePayload {
  subjectCode: string;
  subjectName: string;
  prerequisiteSubjectIds?: string[];
}

export interface SubjectUpdatePayload {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  prerequisiteSubjectIds?: string[];
}

// ========== API Response Types ==========
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors?: unknown | null;
}

// ========== Store State ==========
export interface SyllabusState {
  // Major state
  majors: Major[];
  majorsLoading: boolean;
  majorsError: string | null;
  majorsTotalCount: number;
  majorsCurrentPage: number;
  majorsPageSize: number;
  selectedMajor: Major | null;

  // Subject state
  subjects: Subject[];
  subjectsLoading: boolean;
  subjectsError: string | null;
  subjectsTotalCount: number;
  subjectsCurrentPage: number;
  subjectsPageSize: number;
  selectedSubject: Subject | null;

  // Major Actions
  fetchMajors: (page?: number, pageSize?: number) => Promise<void>;
  getMajorDetail: (majorId: string) => Promise<Major | null>;
  createMajor: (payload: MajorCreatePayload) => Promise<Major | null>;
  updateMajor: (payload: MajorUpdatePayload) => Promise<Major | null>;
  deleteMajor: (majorId: string) => Promise<boolean>;
  clearMajorError: () => void;
  clearSelectedMajor: () => void;

  // Subject Actions
  fetchSubjects: (page?: number, pageSize?: number) => Promise<void>;
  getSubjectDetail: (subjectId: string) => Promise<Subject | null>;
  createSubject: (payload: SubjectCreatePayload) => Promise<Subject | null>;
  updateSubject: (payload: SubjectUpdatePayload) => Promise<Subject | null>;
  deleteSubject: (subjectId: string) => Promise<boolean>;
  clearSubjectError: () => void;
  clearSelectedSubject: () => void;
}

/**
 * Syllabus Store
 * Manages CRUD operations for Majors and Subjects
 * APIs:
 * - GET /course/api/Syllabus/GetMajors
 * - GET /course/api/Syllabus/GetMajorDetail/{majorId}
 * - POST /course/api/Syllabus/CreateMajorProcess
 * - GET /course/api/Syllabus/GetSubjects
 * - GET /course/api/Syllabus/GetSubjectDetail/{subjectId}
 * - POST /course/api/Syllabus/CreateSubjectProcess
 */
export const useSyllabusStore = create<SyllabusState>((set, get) => ({
  // ========== Major State ==========
  majors: [],
  majorsLoading: false,
  majorsError: null,
  majorsTotalCount: 0,
  majorsCurrentPage: 1,
  majorsPageSize: 10,
  selectedMajor: null,

  // ========== Subject State ==========
  subjects: [],
  subjectsLoading: false,
  subjectsError: null,
  subjectsTotalCount: 0,
  subjectsCurrentPage: 1,
  subjectsPageSize: 10,
  selectedSubject: null,

  // ========== Major Actions ==========
  fetchMajors: async (page = 1, pageSize = 10) => {
    set({ majorsLoading: true, majorsError: null });
    try {
      const response = await axios.get<ApiResponse<PaginatedResponse<Major>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetMajors`,
        {
          params: {
            pageNumber: page,
            pageSize: pageSize,
          },
          headers: getHeaders(),
        }
      );

      if (response.data.success) {
        const data = response.data.response;
        set({
          majors: data.items || [],
          majorsTotalCount: data.totalCount,
          majorsCurrentPage: data.pageNumber,
          majorsPageSize: data.pageSize,
          majorsLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch majors");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch majors";
      set({ majorsError: errorMessage, majorsLoading: false });
      console.error("[SyllabusStore] Error fetching majors:", error);
    }
  },

  getMajorDetail: async (majorId: string) => {
    set({ majorsLoading: true, majorsError: null });
    try {
      const response = await axios.get<ApiResponse<Major>>(
        `${API_BASE_URL}/course/api/Syllabus/GetMajorDetail/${majorId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        const major = response.data.response;
        set({ selectedMajor: major, majorsLoading: false });
        return major;
      } else {
        throw new Error(response.data.message || "Failed to fetch major detail");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch major detail";
      set({ majorsError: errorMessage, majorsLoading: false });
      console.error("[SyllabusStore] Error fetching major detail:", error);
      return null;
    }
  },

  createMajor: async (payload: MajorCreatePayload) => {
    set({ majorsLoading: true, majorsError: null });
    try {
      const response = await axios.post<ApiResponse<Major>>(
        `${API_BASE_URL}/course/api/Syllabus/CreateMajorProcess`,
        { createMajorDto: payload },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh the list after creation
        await get().fetchMajors(get().majorsCurrentPage, get().majorsPageSize);
        set({ majorsLoading: false });
        
        // Return created major data
        const createdMajor: Major = {
          majorId: response.data.response?.majorId || "",
          majorCode: payload.majorCode,
          majorName: payload.majorName,
          description: payload.description,
        };
        return createdMajor;
      } else {
        throw new Error(response.data.message || "Failed to create major");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create major";
      set({ majorsError: errorMessage, majorsLoading: false });
      console.error("[SyllabusStore] Error creating major:", error);
      return null;
    }
  },

  updateMajor: async (payload: MajorUpdatePayload) => {
    set({ majorsLoading: true, majorsError: null });
    try {
      // Note: Update API endpoint needs to be confirmed
      const response = await axios.put<ApiResponse<Major>>(
        `${API_BASE_URL}/course/api/Syllabus/UpdateMajor`,
        { updateMajorDto: payload },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh the list after update
        await get().fetchMajors(get().majorsCurrentPage, get().majorsPageSize);
        set({ majorsLoading: false });
        
        const updatedMajor: Major = {
          majorId: payload.majorId,
          majorCode: payload.majorCode,
          majorName: payload.majorName,
          description: payload.description,
        };
        return updatedMajor;
      } else {
        throw new Error(response.data.message || "Failed to update major");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update major";
      set({ majorsError: errorMessage, majorsLoading: false });
      console.error("[SyllabusStore] Error updating major:", error);
      return null;
    }
  },

  deleteMajor: async (majorId: string) => {
    set({ majorsLoading: true, majorsError: null });
    try {
      // Note: Delete API endpoint needs to be confirmed
      const response = await axios.delete<ApiResponse<boolean>>(
        `${API_BASE_URL}/course/api/Syllabus/DeleteMajor/${majorId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh the list after deletion
        await get().fetchMajors(get().majorsCurrentPage, get().majorsPageSize);
        set({ majorsLoading: false });
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete major");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete major";
      set({ majorsError: errorMessage, majorsLoading: false });
      console.error("[SyllabusStore] Error deleting major:", error);
      return false;
    }
  },

  clearMajorError: () => set({ majorsError: null }),
  clearSelectedMajor: () => set({ selectedMajor: null }),

  // ========== Subject Actions ==========
  fetchSubjects: async (page = 1, pageSize = 10) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const response = await axios.get<ApiResponse<PaginatedResponse<Subject>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetSubjects`,
        {
          params: {
            pageNumber: page,
            pageSize: pageSize,
          },
          headers: getHeaders(),
        }
      );

      if (response.data.success) {
        const data = response.data.response;
        set({
          subjects: data.items || [],
          subjectsTotalCount: data.totalCount,
          subjectsCurrentPage: data.pageNumber,
          subjectsPageSize: data.pageSize,
          subjectsLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch subjects");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch subjects";
      set({ subjectsError: errorMessage, subjectsLoading: false });
      console.error("[SyllabusStore] Error fetching subjects:", error);
    }
  },

  getSubjectDetail: async (subjectId: string) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const response = await axios.get<ApiResponse<Subject>>(
        `${API_BASE_URL}/course/api/Syllabus/GetSubjectDetail/${subjectId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        const subject = response.data.response;
        set({ selectedSubject: subject, subjectsLoading: false });
        return subject;
      } else {
        throw new Error(response.data.message || "Failed to fetch subject detail");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch subject detail";
      set({ subjectsError: errorMessage, subjectsLoading: false });
      console.error("[SyllabusStore] Error fetching subject detail:", error);
      return null;
    }
  },

  createSubject: async (payload: SubjectCreatePayload) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const response = await axios.post<ApiResponse<Subject>>(
        `${API_BASE_URL}/course/api/Syllabus/CreateSubjectProcess`,
        { createSubjectDto: payload },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh the list after creation
        await get().fetchSubjects(get().subjectsCurrentPage, get().subjectsPageSize);
        set({ subjectsLoading: false });
        
        const createdSubject: Subject = {
          subjectId: response.data.response?.subjectId || "",
          subjectCode: payload.subjectCode,
          subjectName: payload.subjectName,
          prerequisiteSubjectIds: payload.prerequisiteSubjectIds,
        };
        return createdSubject;
      } else {
        throw new Error(response.data.message || "Failed to create subject");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create subject";
      set({ subjectsError: errorMessage, subjectsLoading: false });
      console.error("[SyllabusStore] Error creating subject:", error);
      return null;
    }
  },

  updateSubject: async (payload: SubjectUpdatePayload) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      // Note: Update API endpoint needs to be confirmed
      const response = await axios.put<ApiResponse<Subject>>(
        `${API_BASE_URL}/course/api/Syllabus/UpdateSubject`,
        { updateSubjectDto: payload },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh the list after update
        await get().fetchSubjects(get().subjectsCurrentPage, get().subjectsPageSize);
        set({ subjectsLoading: false });
        
        const updatedSubject: Subject = {
          subjectId: payload.subjectId,
          subjectCode: payload.subjectCode,
          subjectName: payload.subjectName,
          prerequisiteSubjectIds: payload.prerequisiteSubjectIds,
        };
        return updatedSubject;
      } else {
        throw new Error(response.data.message || "Failed to update subject");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update subject";
      set({ subjectsError: errorMessage, subjectsLoading: false });
      console.error("[SyllabusStore] Error updating subject:", error);
      return null;
    }
  },

  deleteSubject: async (subjectId: string) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      // Note: Delete API endpoint needs to be confirmed
      const response = await axios.delete<ApiResponse<boolean>>(
        `${API_BASE_URL}/course/api/Syllabus/DeleteSubject/${subjectId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh the list after deletion
        await get().fetchSubjects(get().subjectsCurrentPage, get().subjectsPageSize);
        set({ subjectsLoading: false });
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete subject");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete subject";
      set({ subjectsError: errorMessage, subjectsLoading: false });
      console.error("[SyllabusStore] Error deleting subject:", error);
      return false;
    }
  },

  clearSubjectError: () => set({ subjectsError: null }),
  clearSelectedSubject: () => set({ selectedSubject: null }),
}));
