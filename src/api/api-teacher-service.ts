'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';

// Base URL configuration
function resolveTeacherBaseUrl(): string {
  // Use dedicated teacher service URL if set
  if (process.env.NEXT_PUBLIC_TEACHER_BASE_URL) {
    return process.env.NEXT_PUBLIC_TEACHER_BASE_URL;
  }
  // Fallback to API base URL + /teacher
  if (process.env.NEXT_PUBLIC_API_URL) {
    const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    return `${base}/teacher`;
  }
  // Default
  return 'https://api.edusmart.pro.vn/teacher';
}

// Types
export interface TeacherProfileDto {
  teacherId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePictureUrl?: string;
  certificates: CertificateDto[];
  experiences: ExperienceDto[];
  qualifications: QualificationDto[];
}

export interface CertificateDto {
  certificateId?: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ExperienceDto {
  experienceId?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent: boolean;
}

export interface QualificationDto {
  qualificationId?: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
  grade?: string;
}

export interface UpdateTeacherProfileDto {
  displayName: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePictureUrl?: string;
}

export interface ApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: string[] | null;
}

// Axios instance with interceptors
const createTeacherApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: resolveTeacherBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      'accept': 'text/plain',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    async (config) => {
      // Try to get token from auth store
      let token: string | null = null;
      
      try {
        const authState = useAuthStore.getState();
        token = authState.token || null;
      } catch {
        // Silent error
      }

      // Fallback to localStorage
      if (!token && typeof window !== 'undefined') {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            token = parsed?.state?.accessToken || parsed?.state?.token || null;
          }
        } catch {
          // Silent error
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        try {
          const { refreshAction } = await import('EduSmart/app/(auth)/action');
          const refreshResult = await refreshAction();
          
          if (refreshResult.ok && refreshResult.accessToken && error.config) {
            // Retry with new token
            error.config.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
            return instance.request(error.config);
          }
        } catch {
          // Silent error
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const teacherApiClient = createTeacherApiClient();

// API Functions
export const teacherServiceAPI = {
  /**
   * Get teacher profile by ID
   * @request GET:/api/Teachers/{teacherId}
   */
  getProfile: async (teacherId: string): Promise<ApiResponse<TeacherProfileDto>> => {
    const response = await teacherApiClient.get<ApiResponse<TeacherProfileDto>>(
      `/api/Teachers/${teacherId}`
    );
    return response.data;
  },

  /**
   * Update teacher profile
   * @request PUT:/api/Teachers/{teacherId}
   */
  updateProfile: async (
    teacherId: string,
    data: UpdateTeacherProfileDto
  ): Promise<ApiResponse<TeacherProfileDto>> => {
    console.log("[TeacherAPI] Updating profile for:", teacherId);
    console.log("[TeacherAPI] Update data:", data);
    
    const response = await teacherApiClient.put<ApiResponse<TeacherProfileDto>>(
      `/api/Teachers/${teacherId}`,
      data
    );
    return response.data;
  },

  /**
   * Upload profile picture
   * Uses utility service for image upload
   */
  uploadProfilePicture: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('formFile', file);

    // Get token
    let token: string | null = null;
    try {
      const authState = useAuthStore.getState();
      token = authState.token || null;
    } catch {
      // Silent error
    }

    if (!token && typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.accessToken || parsed?.state?.token || null;
        }
      } catch {
        // Silent error
      }
    }

    const response = await fetch('https://api.edusmart.pro.vn/utility/api/UploadFiles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'text/plain'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile picture');
    }

    const result = await response.json();
    if (result.success && result.response) {
      return result.response;
    }
    throw new Error(result.message || 'Failed to upload profile picture');
  },
};

export default teacherServiceAPI;
