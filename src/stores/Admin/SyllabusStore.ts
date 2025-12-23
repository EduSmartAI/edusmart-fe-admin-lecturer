import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import type {
  Syllabus,
  SyllabusListItem,
  Semester,
  CreateFullSyllabusPayload,
  CloneCascadeSyllabusPayload,
  CloneFoundationSyllabusPayload,
  SyllabusWizardState,
  CloneModalState,
  SyllabusApiResponse,
  CreateSyllabusSemesterDto,
} from "EduSmart/types/syllabus";

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

// Initial states
const initialWizardState: SyllabusWizardState = {
  currentStep: 0,
  step1Data: null,
  step2Data: null,
  step3Data: null,
};

const initialCloneModalState: CloneModalState = {
  isOpen: false,
  cloneType: null,
  sourceSyllabus: null,
};

// ========== Store State ==========
export interface SyllabusState {
  // Major state
  majors: Major[];
  allMajors: Major[]; // All majors for dropdown
  majorsLoading: boolean;
  majorsError: string | null;
  majorsTotalCount: number;
  majorsCurrentPage: number;
  majorsPageSize: number;
  selectedMajor: Major | null;

  // Subject state
  subjects: Subject[];
  allSubjects: Subject[]; // All subjects for dropdown
  subjectsLoading: boolean;
  subjectsError: string | null;
  subjectsTotalCount: number;
  subjectsCurrentPage: number;
  subjectsPageSize: number;
  selectedSubject: Subject | null;

  // Semester state
  semesters: Semester[];
  semestersLoading: boolean;
  semestersError: string | null;

  // Syllabus state
  syllabuses: SyllabusListItem[];
  syllabusesLoading: boolean;
  syllabusesError: string | null;
  syllabusTotalCount: number;
  syllabusCurrentPage: number;
  syllabusPageSize: number;
  selectedSyllabus: Syllabus | null;
  syllabusDetailLoading: boolean;

  // Wizard state
  wizardState: SyllabusWizardState;
  
  // Clone modal state
  cloneModalState: CloneModalState;

  // Major Actions
  fetchMajors: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  fetchAllMajors: () => Promise<void>;
  getMajorDetail: (majorId: string) => Promise<Major | null>;
  createMajor: (payload: MajorCreatePayload) => Promise<Major | null>;
  updateMajor: (payload: MajorUpdatePayload) => Promise<Major | null>;
  deleteMajor: (majorId: string) => Promise<boolean>;
  clearMajorError: () => void;
  clearSelectedMajor: () => void;

  // Subject Actions
  fetchSubjects: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  fetchAllSubjects: () => Promise<void>;
  getSubjectDetail: (subjectId: string) => Promise<Subject | null>;
  createSubject: (payload: SubjectCreatePayload) => Promise<Subject | null>;
  updateSubject: (payload: SubjectUpdatePayload) => Promise<Subject | null>;
  deleteSubject: (subjectId: string) => Promise<boolean>;
  clearSubjectError: () => void;
  clearSelectedSubject: () => void;

  // Semester Actions
  fetchSemesters: () => Promise<void>;
  clearSemesterError: () => void;

  // Syllabus Actions
  fetchSyllabuses: (page?: number, pageSize?: number) => Promise<void>;
  getSyllabusDetail: (versionLabel: string, majorCode?: string) => Promise<Syllabus | null>;
  createFullSyllabus: (payload: CreateFullSyllabusPayload) => Promise<boolean>;
  cloneCascadeSyllabus: (payload: CloneCascadeSyllabusPayload) => Promise<boolean>;
  cloneFoundationSyllabus: (payload: CloneFoundationSyllabusPayload) => Promise<boolean>;
  clearSyllabusError: () => void;
  clearSelectedSyllabus: () => void;

  // Wizard Actions
  setWizardStep: (step: number) => void;
  setWizardStep1Data: (data: SyllabusWizardState['step1Data']) => void;
  setWizardStep2Data: (data: SyllabusWizardState['step2Data']) => void;
  setWizardStep3Data: (data: SyllabusWizardState['step3Data']) => void;
  resetWizard: () => void;
  buildSyllabusPayload: () => CreateFullSyllabusPayload | null;

  // Clone Modal Actions
  openCloneModal: (type: 'cascade' | 'foundation', syllabus?: Syllabus) => void;
  closeCloneModal: () => void;
}

/**
 * Syllabus Store
 * Manages CRUD operations for Majors, Subjects, Semesters, and Syllabuses
 */
export const useSyllabusStore = create<SyllabusState>((set, get) => ({
  // ========== Major State ==========
  majors: [],
  allMajors: [],
  majorsLoading: false,
  majorsError: null,
  majorsTotalCount: 0,
  majorsCurrentPage: 1,
  majorsPageSize: 10,
  selectedMajor: null,

  // ========== Subject State ==========
  subjects: [],
  allSubjects: [],
  subjectsLoading: false,
  subjectsError: null,
  subjectsTotalCount: 0,
  subjectsCurrentPage: 1,
  subjectsPageSize: 10,
  selectedSubject: null,

  // ========== Semester State ==========
  semesters: [],
  semestersLoading: false,
  semestersError: null,

  // ========== Syllabus State ==========
  syllabuses: [],
  syllabusesLoading: false,
  syllabusesError: null,
  syllabusTotalCount: 0,
  syllabusCurrentPage: 1,
  syllabusPageSize: 10,
  selectedSyllabus: null,
  syllabusDetailLoading: false,

  // ========== Wizard State ==========
  wizardState: initialWizardState,

  // ========== Clone Modal State ==========
  cloneModalState: initialCloneModalState,

  // ========== Major Actions ==========
  fetchMajors: async (page = 1, pageSize = 10, search?: string) => {
    set({ majorsLoading: true, majorsError: null });
    try {
      const params: Record<string, string | number> = {
        page: page,
        size: pageSize,
      };
      
      // Add search parameter if provided
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await axios.get<ApiResponse<PaginatedResponse<Major>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetMajors`,
        {
          params,
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

  fetchAllMajors: async () => {
    try {
      const response = await axios.get<ApiResponse<PaginatedResponse<Major>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetMajors`,
        {
          params: {
            page: 1,
            size: 100,
          },
          headers: getHeaders(),
        }
      );

      if (response.data.success) {
        set({ allMajors: response.data.response.items || [] });
      }
    } catch (error) {
      console.error("[SyllabusStore] Error fetching all majors:", error);
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
        await get().fetchMajors(get().majorsCurrentPage, get().majorsPageSize);
        set({ majorsLoading: false });
        
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
      const response = await axios.put<ApiResponse<Major>>(
        `${API_BASE_URL}/course/api/Syllabus/UpdateMajor`,
        { updateMajorDto: payload },
        { headers: getHeaders() }
      );

      if (response.data.success) {
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
      const response = await axios.delete<ApiResponse<boolean>>(
        `${API_BASE_URL}/course/api/Syllabus/DeleteMajor/${majorId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
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
  fetchSubjects: async (page = 1, pageSize = 10, search?: string) => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const params: Record<string, string | number> = {
        page: page,
        size: pageSize,
      };
      
      // Add search parameter if provided
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await axios.get<ApiResponse<PaginatedResponse<Subject>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetSubjects`,
        {
          params,
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

  fetchAllSubjects: async () => {
    try {
      const response = await axios.get<ApiResponse<PaginatedResponse<Subject>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetSubjects`,
        {
          params: {
            page: 1,
            size: 100,
          },
          headers: getHeaders(),
        }
      );

      if (response.data.success) {
        set({ allSubjects: response.data.response.items || [] });
      }
    } catch (error) {
      console.error("[SyllabusStore] Error fetching all subjects:", error);
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
      const response = await axios.put<ApiResponse<Subject>>(
        `${API_BASE_URL}/course/api/Syllabus/UpdateSubject`,
        { updateSubjectDto: payload },
        { headers: getHeaders() }
      );

      if (response.data.success) {
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
      const response = await axios.delete<ApiResponse<boolean>>(
        `${API_BASE_URL}/course/api/Syllabus/DeleteSubject/${subjectId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
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

  // ========== Semester Actions ==========
  fetchSemesters: async () => {
    set({ semestersLoading: true, semestersError: null });
    try {
      const response = await axios.get<ApiResponse<PaginatedResponse<Semester>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetSemesters`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        set({
          semesters: response.data.response.items || [],
          semestersLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch semesters");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch semesters";
      set({ semestersError: errorMessage, semestersLoading: false });
      console.error("[SyllabusStore] Error fetching semesters:", error);
    }
  },

  clearSemesterError: () => set({ semestersError: null }),

  // ========== Syllabus Actions ==========
  fetchSyllabuses: async (page = 1, pageSize = 10) => {
    set({ syllabusesLoading: true, syllabusesError: null });
    try {
      // Get all majors first to build syllabus list
      const majorsResponse = await axios.get<ApiResponse<PaginatedResponse<Major>>>(
        `${API_BASE_URL}/course/api/Syllabus/GetMajors`,
        {
          params: { page: 1, size: 100 },
          headers: getHeaders(),
        }
      );

      if (majorsResponse.data.success) {
        set({
          syllabuses: [],
          syllabusTotalCount: 0,
          syllabusCurrentPage: page,
          syllabusPageSize: pageSize,
          syllabusesLoading: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch syllabuses";
      set({ syllabusesError: errorMessage, syllabusesLoading: false });
      console.error("[SyllabusStore] Error fetching syllabuses:", error);
    }
  },

  getSyllabusDetail: async (versionLabel: string, majorCode?: string) => {
    set({ syllabusDetailLoading: true, syllabusesError: null });
    try {
      // API: /api/Syllabus/full/{versionLabel}/{majorCode}
      const url = majorCode 
        ? `${API_BASE_URL}/course/api/Syllabus/full/${versionLabel}/${majorCode}`
        : `${API_BASE_URL}/course/api/Syllabus/full/${versionLabel}`;
      const response = await axios.get<SyllabusApiResponse<Syllabus>>(
        url,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        const syllabus = response.data.response;
        set({ selectedSyllabus: syllabus, syllabusDetailLoading: false });
        return syllabus;
      } else {
        throw new Error(response.data.message || "Failed to fetch syllabus detail");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch syllabus detail";
      set({ syllabusesError: errorMessage, syllabusDetailLoading: false });
      console.error("[SyllabusStore] Error fetching syllabus detail:", error);
      return null;
    }
  },

  createFullSyllabus: async (payload: CreateFullSyllabusPayload) => {
    set({ syllabusesLoading: true, syllabusesError: null });
    try {
      const response = await axios.post<SyllabusApiResponse<unknown>>(
        `${API_BASE_URL}/course/api/Syllabus/CreateFullSyllabusForMajor`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        set({ syllabusesLoading: false });
        return true;
      } else {
        throw new Error(response.data.message || "Failed to create syllabus");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create syllabus";
      set({ syllabusesError: errorMessage, syllabusesLoading: false });
      console.error("[SyllabusStore] Error creating syllabus:", error);
      return false;
    }
  },

  cloneCascadeSyllabus: async (payload: CloneCascadeSyllabusPayload) => {
    set({ syllabusesLoading: true, syllabusesError: null });
    try {
      const response = await axios.post<SyllabusApiResponse<unknown>>(
        `${API_BASE_URL}/course/api/Syllabus/clone/cascade`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        set({ syllabusesLoading: false });
        return true;
      } else {
        throw new Error(response.data.message || "Failed to clone syllabus");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clone syllabus";
      set({ syllabusesError: errorMessage, syllabusesLoading: false });
      console.error("[SyllabusStore] Error cloning syllabus:", error);
      return false;
    }
  },

  cloneFoundationSyllabus: async (payload: CloneFoundationSyllabusPayload) => {
    set({ syllabusesLoading: true, syllabusesError: null });
    try {
      const response = await axios.post<SyllabusApiResponse<unknown>>(
        `${API_BASE_URL}/course/api/Syllabus/clone/foundation`,
        payload,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        set({ syllabusesLoading: false });
        return true;
      } else {
        throw new Error(response.data.message || "Failed to clone foundation syllabus");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clone foundation syllabus";
      set({ syllabusesError: errorMessage, syllabusesLoading: false });
      console.error("[SyllabusStore] Error cloning foundation syllabus:", error);
      return false;
    }
  },

  clearSyllabusError: () => set({ syllabusesError: null }),
  clearSelectedSyllabus: () => set({ selectedSyllabus: null }),

  // ========== Wizard Actions ==========
  setWizardStep: (step: number) => {
    set((state) => ({
      wizardState: { ...state.wizardState, currentStep: step },
    }));
  },

  setWizardStep1Data: (data) => {
    set((state) => ({
      wizardState: { ...state.wizardState, step1Data: data },
    }));
  },

  setWizardStep2Data: (data) => {
    set((state) => ({
      wizardState: { ...state.wizardState, step2Data: data },
    }));
  },

  setWizardStep3Data: (data) => {
    set((state) => ({
      wizardState: { ...state.wizardState, step3Data: data },
    }));
  },

  resetWizard: () => {
    set({ wizardState: initialWizardState });
  },

  buildSyllabusPayload: () => {
    const { wizardState } = get();
    const { step1Data, step2Data, step3Data } = wizardState;

    if (!step1Data || !step2Data || !step3Data) {
      return null;
    }

    const semesterDtos: CreateSyllabusSemesterDto[] = step2Data.selectedSemesterIds
      .map((semesterId, index) => {
        const subjects = step3Data.semesterSubjects[semesterId] || [];
        return {
          semesterId,
          positionIndex: index + 1,
          subjects: subjects.map((s, idx) => ({
            ...s,
            positionIndex: idx + 1,
          })),
        };
      })
      .filter((s) => s.subjects.length > 0);

    return {
      createFullSyllabusDto: {
        majorId: step1Data.majorId,
        versionLabel: step1Data.versionLabel,
        effectiveFrom: step1Data.effectiveFrom,
        effectiveTo: step1Data.effectiveTo,
        semesters: semesterDtos,
      },
    };
  },

  // ========== Clone Modal Actions ==========
  openCloneModal: (type, syllabus) => {
    set({
      cloneModalState: {
        isOpen: true,
        cloneType: type,
        sourceSyllabus: syllabus || null,
      },
    });
  },

  closeCloneModal: () => {
    set({ cloneModalState: initialCloneModalState });
  },
}));
