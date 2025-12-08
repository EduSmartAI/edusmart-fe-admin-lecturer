/**
 * Subject API Service
 * Handles API calls for Subject (Môn học) operations
 * 
 * API: GET /course/api/Syllabus/GetSubjects
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';

// Subject interface matching API response
export interface Subject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectDescription?: string | null;
  prerequisiteSubjectIds?: string[];
  prerequisiteSubjects?: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
  }[];
}

// Legacy interface for backward compatibility
export interface LegacySubject {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

// API Response structure matching Syllabus API
export interface SubjectApiResponse {
  response: {
    items: Subject[];
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

// Legacy response for backward compatibility
export interface SubjectResponse {
  response: LegacySubject[];
  success: boolean;
  message: string;
}


class SubjectApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'https://api.edusmart.pro.vn/course';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Convert API Subject to Legacy Subject format for backward compatibility
   */
  private convertToLegacyFormat(subject: Subject): LegacySubject {
    return {
      id: subject.subjectId,
      code: subject.subjectCode,
      name: subject.subjectName,
      description: subject.subjectDescription || undefined,
      isActive: true,
    };
  }

  /**
   * Get all subjects from real API
   * GET /api/Syllabus/GetSubjects
   */
  async getSubjects(page = 1, size = 1000): Promise<SubjectResponse> {
    try {
      const response = await this.client.get<SubjectApiResponse>(
        '/api/Syllabus/GetSubjects',
        {
          params: { page, size },
        }
      );

      if (response.data.success && response.data.response) {
        // Convert to legacy format
        const legacySubjects = response.data.response.items.map(subject => 
          this.convertToLegacyFormat(subject)
        );

        return {
          success: true,
          message: response.data.message || 'Subjects retrieved successfully',
          response: legacySubjects,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch subjects',
          response: [],
        };
      }
    } catch (error: unknown) {
      console.error('Error fetching subjects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subjects';
      return {
        success: false,
        message: errorMessage,
        response: [],
      };
    }
  }

  /**
   * Get all subjects in original API format (not legacy)
   */
  async getSubjectsRaw(page = 1, size = 1000): Promise<Subject[]> {
    try {
      const response = await this.client.get<SubjectApiResponse>(
        '/api/Syllabus/GetSubjects',
        {
          params: { page, size },
        }
      );

      if (response.data.success && response.data.response) {
        return response.data.response.items;
      }
      return [];
    } catch (error) {
      console.error('Error fetching subjects (raw):', error);
      return [];
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(id: string): Promise<LegacySubject | null> {
    try {
      const result = await this.getSubjects();
      return result.response.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Error fetching subject by ID:', error);
      return null;
    }
  }

  /**
   * Get subject by code
   */
  async getSubjectByCode(code: string): Promise<LegacySubject | null> {
    try {
      const result = await this.getSubjects();
      return result.response.find(s => s.code === code) || null;
    } catch (error) {
      console.error('Error fetching subject by code:', error);
      return null;
    }
  }

  /**
   * Search subjects by name or code
   */
  async searchSubjects(query: string): Promise<LegacySubject[]> {
    try {
      const result = await this.getSubjects();
      const lowerQuery = query.toLowerCase();
      return result.response.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) ||
        s.code.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching subjects:', error);
      return [];
    }
  }
}

// Export singleton instance
export const subjectApiService = new SubjectApiService();
export default subjectApiService;

