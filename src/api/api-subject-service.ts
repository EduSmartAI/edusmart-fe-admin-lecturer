/**
 * Subject API Service
 * Handles API calls for Subject (Môn học) operations
 * 
 * TODO: Replace mock data with real API endpoint when available
 * Expected endpoint: GET /api/v1/subjects or /course/api/v1/subjects
 */

import axios, { AxiosInstance } from 'axios';

export interface Subject {
  id: string; // UUID
  code: string; // Subject code (e.g., PRF192, MAE101)
  name: string; // Subject name
  description?: string;
  isActive?: boolean;
}

export interface SubjectResponse {
  response: Subject[];
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
      },
    });
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const authStore = localStorage.getItem('auth-storage');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        return parsed?.state?.accessToken || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  }

  /**
   * Get all active subjects
   * TODO: Replace with real API call
   * GET /api/v1/subjects
   */
  async getSubjects(): Promise<SubjectResponse> {
    try {
      // TODO: Uncomment when real API is available
      // const token = this.getAuthToken();
      // const response = await this.client.get('/api/v1/subjects', {
      //   headers: token ? { Authorization: `Bearer ${token}` } : {},
      // });
      // return response.data;

      // MOCK DATA - Based on CreateCourseStore mapping
      return {
        success: true,
        message: 'Subjects retrieved successfully',
        response: [
          { id: 'a4917fc0-bbcc-46b1-a7c8-f32e1d2aa298', code: 'PRF192', name: 'Programming Fundamentals', description: 'Học lập trình cơ bản với C', isActive: true },
          { id: 'a83eabde-fb96-4732-88f3-3e7a846796bc', code: 'MAE101', name: 'Mathematics for Engineers', description: 'Toán học cho kỹ sư', isActive: true },
          { id: '432cabc2-79bd-42ac-a67b-fc233dd3a6bc', code: 'CEA201', name: 'Computer Architecture', description: 'Kiến trúc máy tính', isActive: true },
          { id: '3ed33ae3-da55-49f7-b563-41ca0503fab5', code: 'SSL101C', name: 'Self-Study Skills', description: 'Kỹ năng tự học', isActive: true },
          { id: '63368d18-6112-413d-9815-4e31597b6e4c', code: 'CSI104', name: 'Computer Science Introduction', description: 'Giới thiệu khoa học máy tính', isActive: true },
          { id: '5e8967c9-2971-4250-a7fc-a8a26ca7f106', code: 'NWC203C', name: 'Computer Networks', description: 'Mạng máy tính', isActive: true },
          { id: 'b8f9c5a1-6d2e-4f3a-9b7c-1e8d5a4c6b9f', code: 'PRO192', name: 'Object-Oriented Programming', description: 'Lập trình hướng đối tượng với Java', isActive: true },
          { id: 'c7d8e9f0-1a2b-3c4d-5e6f-7g8h9i0j1k2l', code: 'DBI202', name: 'Database Introduction', description: 'Giới thiệu cơ sở dữ liệu', isActive: true },
          { id: 'd9e0f1a2-b3c4-d5e6-f7g8-h9i0j1k2l3m4', code: 'LAB211', name: 'OOP with Java Lab', description: 'Thực hành OOP với Java', isActive: true },
          { id: 'e1f2g3h4-i5j6-k7l8-m9n0-o1p2q3r4s5t6', code: 'WED201C', name: 'Web Design', description: 'Thiết kế web', isActive: true },
          { id: 'f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8', code: 'JPD123', name: 'Java Programming & Design', description: 'Lập trình và thiết kế Java', isActive: true },
          { id: 'g5h6i7j8-k9l0-m1n2-o3p4-q5r6s7t8u9v0', code: 'SWE201C', name: 'Software Engineering', description: 'Công nghệ phần mềm', isActive: true },
          { id: 'h7i8j9k0-l1m2-n3o4-p5q6-r7s8t9u0v1w2', code: 'MAS291', name: 'Mathematics & Statistics', description: 'Toán và thống kê', isActive: true },
          { id: 'i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4', code: 'OSG202', name: 'Operating Systems', description: 'Hệ điều hành', isActive: true },
          { id: 'j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6', code: 'IOT102', name: 'Internet of Things', description: 'Internet vạn vật', isActive: true },
          { id: 'k3l4m5n6-o7p8-q9r0-s1t2-u3v4w5x6y7z8', code: 'MLN111', name: 'Machine Learning', description: 'Học máy cơ bản', isActive: true },
          { id: 'l5m6n7o8-p9q0-r1s2-t3u4-v5w6x7y8z9a0', code: 'PYT101', name: 'Python Programming', description: 'Lập trình Python', isActive: true },
          { id: 'm7n8o9p0-q1r2-s3t4-u5v6-w7x8y9z0a1b2', code: 'WEB301', name: 'Advanced Web Development', description: 'Phát triển web nâng cao', isActive: true },
          { id: 'n9o0p1q2-r3s4-t5u6-v7w8-x9y0z1a2b3c4', code: 'MOB201', name: 'Mobile Programming', description: 'Lập trình di động', isActive: true },
          { id: 'o1p2q3r4-s5t6-u7v8-w9x0-y1z2a3b4c5d6', code: 'SEC301', name: 'Information Security', description: 'An toàn thông tin', isActive: true },
        ],
      };
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
   * Get subject by ID
   */
  async getSubjectById(id: string): Promise<Subject | null> {
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
  async getSubjectByCode(code: string): Promise<Subject | null> {
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
  async searchSubjects(query: string): Promise<Subject[]> {
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
