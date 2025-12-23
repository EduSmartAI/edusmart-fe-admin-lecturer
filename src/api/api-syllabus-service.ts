'use client';

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import type { UpdateSyllabusDto } from 'EduSmart/types/syllabus';

// Types
export interface MajorDto {
  majorId: string;
  majorCode: string;
  majorName: string;
  description?: string | null;
  creditRequired?: number;
}

export interface CreateMajorDto {
  majorCode: string;
  majorName: string;
  description?: string;
  requiredCredits?: number;
}

export interface PrerequisiteSubject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
}

export interface SubjectDto {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectDescription?: string | null;
  prerequisites: PrerequisiteSubject[];
}

export interface CreateSubjectDto {
  subjectCode: string;
  subjectName: string;
  subjectDescription?: string;
  prerequisiteSubjectIds?: string[];
}

// Paginated response interface
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
  detailErrors: string[] | null;
}

// Axios instance
const createSyllabusApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'https://api.edusmart.pro.vn/course';
  
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'accept': 'text/plain',
    },
  });

  // Request interceptor - use the same method as apiClient.ts
  instance.interceptors.request.use(
    (config) => {
      // Get token from AuthStore (same as apiClient.ts)
      const { token } = useAuthStore.getState();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

const syllabusApiClient = createSyllabusApiClient();

// API Functions
export const syllabusServiceAPI = {
  // ==================== MAJOR APIs ====================
  
  /**
   * Create a new major
   * POST /api/Syllabus/CreateMajorProcess
   */
  createMajor: async (data: CreateMajorDto): Promise<ApiResponse<boolean>> => {
    const response = await syllabusApiClient.post<ApiResponse<boolean>>(
      '/api/Syllabus/CreateMajorProcess',
      { createMajorDto: data }
    );
    return response.data;
  },

  /**
   * Get major detail by ID
   * GET /api/Syllabus/GetMajorDetail/{majorId}
   */
  getMajorDetail: async (majorId: string): Promise<ApiResponse<MajorDto>> => {
    const response = await syllabusApiClient.get<ApiResponse<MajorDto>>(
      `/api/Syllabus/GetMajorDetail/${majorId}`
    );
    return response.data;
  },

  /**
   * Get all majors with pagination
   * GET /api/Syllabus/GetMajors
   */
  getAllMajors: async (page = 1, size = 100, search?: string): Promise<ApiResponse<PaginatedResponse<MajorDto>>> => {
    let url = `/api/Syllabus/GetMajors?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await syllabusApiClient.get<ApiResponse<PaginatedResponse<MajorDto>>>(url);
    return response.data;
  },

  /**
   * Update major description
   * PUT /api/Syllabus/major/{majorId}
   */
  updateMajorDescription: async (majorId: string, description: string): Promise<ApiResponse<boolean>> => {
    const response = await syllabusApiClient.put<ApiResponse<boolean>>(
      `/api/Syllabus/major/${majorId}`,
      JSON.stringify(description),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // ==================== SUBJECT APIs ====================

  /**
   * Create a new subject
   * POST /api/Syllabus/CreateSubjectProcess
   */
  createSubject: async (data: CreateSubjectDto): Promise<ApiResponse<boolean>> => {
    const response = await syllabusApiClient.post<ApiResponse<boolean>>(
      '/api/Syllabus/CreateSubjectProcess',
      { createSubjectDto: data }
    );
    return response.data;
  },

  /**
   * Get subject detail by ID
   * GET /api/Syllabus/GetSubjectDetail/{subjectId}
   */
  getSubjectDetail: async (subjectId: string): Promise<ApiResponse<SubjectDto>> => {
    const response = await syllabusApiClient.get<ApiResponse<SubjectDto>>(
      `/api/Syllabus/GetSubjectDetail/${subjectId}`
    );
    return response.data;
  },

  /**
   * Get all subjects with pagination
   * GET /api/Syllabus/GetSubjects
   */
  getAllSubjects: async (page = 1, size = 100, search?: string): Promise<ApiResponse<PaginatedResponse<SubjectDto>>> => {
    let url = `/api/Syllabus/GetSubjects?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await syllabusApiClient.get<ApiResponse<PaginatedResponse<SubjectDto>>>(url);
    return response.data;
  },

  /**
   * Delete a major
   * DELETE /api/Syllabus/DeleteMajor/{majorId}
   */
  deleteMajor: async (majorId: string): Promise<ApiResponse<boolean>> => {
    const response = await syllabusApiClient.delete<ApiResponse<boolean>>(
      `/api/Syllabus/DeleteMajor/${majorId}`
    );
    return response.data;
  },

  /**
   * Delete a subject
   * DELETE /api/Syllabus/DeleteSubject/{subjectId}
   */
  deleteSubject: async (subjectId: string): Promise<ApiResponse<boolean>> => {
    const response = await syllabusApiClient.delete<ApiResponse<boolean>>(
      `/api/Syllabus/DeleteSubject/${subjectId}`
    );
    return response.data;
  },

  // ==================== SYLLABUS APIs ====================

  /**
   * Update syllabus (modify semesters and subjects)
   * PUT /api/Syllabus
   */
  updateSyllabus: async (data: UpdateSyllabusDto): Promise<ApiResponse<boolean>> => {
    const response = await syllabusApiClient.put<ApiResponse<boolean>>(
      '/api/Syllabus',
      data
    );
    return response.data;
  },
};

export default syllabusServiceAPI;

// Helper functions for easier usage
export const createMajor = syllabusServiceAPI.createMajor;
export const getMajorDetail = async (majorId: string): Promise<MajorDto | null> => {
  const response = await syllabusServiceAPI.getMajorDetail(majorId);
  return response.success ? response.response : null;
};
export const getAllMajors = async (page = 1, size = 100, search?: string): Promise<MajorDto[]> => {
  const response = await syllabusServiceAPI.getAllMajors(page, size, search);
  return response.success ? response.response?.items || [] : [];
};

export const createSubject = syllabusServiceAPI.createSubject;
export const getSubjectDetail = async (subjectId: string): Promise<SubjectDto | null> => {
  const response = await syllabusServiceAPI.getSubjectDetail(subjectId);
  return response.success ? response.response : null;
};
export const getAllSubjects = async (page = 1, size = 100, search?: string): Promise<SubjectDto[]> => {
  const response = await syllabusServiceAPI.getAllSubjects(page, size, search);
  return response.success ? response.response?.items || [] : [];
};

export const deleteMajor = async (majorId: string): Promise<boolean> => {
  const response = await syllabusServiceAPI.deleteMajor(majorId);
  return response.success;
};

export const deleteSubject = async (subjectId: string): Promise<boolean> => {
  const response = await syllabusServiceAPI.deleteSubject(subjectId);
  return response.success;
};

export const updateSyllabus = async (data: UpdateSyllabusDto): Promise<boolean> => {
  const response = await syllabusServiceAPI.updateSyllabus(data);
  return response.success;
};

export const updateMajorDescription = async (majorId: string, description: string): Promise<boolean> => {
  const response = await syllabusServiceAPI.updateMajorDescription(majorId, description);
  return response.success;
};
