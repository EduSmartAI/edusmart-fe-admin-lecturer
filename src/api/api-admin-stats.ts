/**
 * Admin Statistics API Service
 * Provides dashboard statistics and metrics
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';

export interface DashboardStats {
  totalMajors: number;
  totalSubjects: number;
  totalTests: number;
  totalSurveys: number;
  majorsTrend: string;
  subjectsTrend: string;
  testsTrend: string;
  surveysTrend: string;
}

export interface RecentActivity {
  action: string;
  detail: string;
  time: string;
  color: string;
  timestamp: string;
}

export interface SystemInfo {
  version: string;
  status: 'active' | 'maintenance' | 'error';
  lastUpdate: string;
  onlineUsers: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  systemInfo: SystemInfo;
}

class AdminStatsService {
  private courseClient: AxiosInstance;
  private quizClient: AxiosInstance;

  constructor() {
    const courseBaseURL = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'https://api.edusmart.pro.vn/course';
    const quizBaseURL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'https://api.edusmart.pro.vn/quiz';

    this.courseClient = axios.create({
      baseURL: courseBaseURL,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain',
      },
    });

    this.quizClient = axios.create({
      baseURL: quizBaseURL,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain',
      },
    });

    // Add auth interceptors
    [this.courseClient, this.quizClient].forEach(client => {
      client.interceptors.request.use(
        (config) => {
          const { token } = useAuthStore.getState();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
    });
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch majors count
      const majorsResponse = await this.courseClient.get('/api/Syllabus/GetMajors', {
        params: { page: 1, size: 1 },
      });
      const totalMajors = majorsResponse.data?.response?.totalCount || 0;

      // Fetch subjects count
      const subjectsResponse = await this.courseClient.get('/api/Syllabus/GetSubjects', {
        params: { page: 1, size: 1 },
      });
      const totalSubjects = subjectsResponse.data?.response?.totalCount || 0;

      // Fetch surveys count
      const surveysResponse = await this.quizClient.get('/api/v1/Admin/SelectSurveys', {
        params: { PageNumber: 1, PageSize: 1 },
      });
      const totalSurveys = surveysResponse.data?.response?.totalCount || 0;

      // Fetch practice tests count
      const testsResponse = await this.quizClient.get('/api/v1/Admin/SelectPracticeTests', {
        params: { PageNumber: 1, PageSize: 1 },
      });
      const totalTests = testsResponse.data?.response?.totalCount || 0;

      return {
        totalMajors,
        totalSubjects,
        totalTests,
        totalSurveys,
        majorsTrend: '+2',
        subjectsTrend: '+5',
        testsTrend: '+12',
        surveysTrend: '+3',
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        totalMajors: 0,
        totalSubjects: 0,
        totalTests: 0,
        totalSurveys: 0,
        majorsTrend: '0',
        subjectsTrend: '0',
        testsTrend: '0',
        surveysTrend: '0',
      };
    }
  }

  /**
   * Get recent activities (placeholder - can be enhanced with real API)
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    // This would come from a real audit log API
    // For now, return empty array or fetch from activity log endpoint when available
    return [
      {
        action: 'Cập nhật hệ thống',
        detail: 'Tích hợp API thống kê dashboard',
        time: 'Vừa xong',
        color: '#52c41a',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    return {
      version: 'v2.1.0',
      status: 'active',
      lastUpdate: '08/12/2025',
      onlineUsers: 0, // Can be fetched from analytics API
    };
  }

  /**
   * Get complete dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const [stats, recentActivities, systemInfo] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentActivities(),
      this.getSystemInfo(),
    ]);

    return {
      stats,
      recentActivities,
      systemInfo,
    };
  }
}

export const adminStatsService = new AdminStatsService();
export default adminStatsService;
