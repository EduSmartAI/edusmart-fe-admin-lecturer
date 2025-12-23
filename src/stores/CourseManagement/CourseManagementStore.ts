import { create } from 'zustand';
/* eslint-disable */
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  courseServiceAPI, 
  CourseDto, 
  GetCoursesQuery, 
  GetCoursesByLecturerQuery,
  CourseSortBy,
  CourseDetailDto 
} from 'EduSmart/api/api-course-service';

export interface CourseManagementState {
  courses: CourseDto[];
  selectedCourse: CourseDetailDto | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  filters: {
    search?: string;
    subjectCode?: string;
    isActive?: boolean;
    sortBy?: CourseSortBy;
  };
  fetchCourses: (query?: GetCoursesQuery) => Promise<boolean>;
  fetchCoursesByLecturer: (query?: Partial<GetCoursesByLecturerQuery>) => Promise<boolean>;
  fetchCourseById: (courseId: string) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  getCurrentLecturerId: () => Promise<string>;
  setFilters: (filters: Partial<CourseManagementState['filters']>) => void;
  setPagination: (page: number, pageSize?: number) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  pagination: {
    pageIndex: 0,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  filters: {
    search: '',
    subjectCode: '',
    isActive: undefined,
    sortBy: CourseSortBy.CreatedAt,
  },
};

export const useCourseManagementStore = create<CourseManagementState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchCourses: async (query?: GetCoursesQuery) => {
        set({ isLoading: true, error: null });
        
        try {
          const state = get();
          const searchQuery: GetCoursesQuery = query || {
            pageIndex: state.pagination.pageIndex,
            pageSize: state.pagination.pageSize,
            search: state.filters.search,
            subjectCode: state.filters.subjectCode,
            isActive: state.filters.isActive,
            sortBy: state.filters.sortBy,
          };
          
          const response = await courseServiceAPI.getCourses(searchQuery);
          
          if (response.success && response.response) {
            const { data, ...paginationData } = response.response;
            
            set({
              courses: data || [],
              pagination: {
                pageIndex: (paginationData.pageIndex ?? 0) + 1, // Convert API's 0-based to UI's 1-based
                pageSize: paginationData.pageSize || 10,
                totalCount: paginationData.totalCount,
                totalPages: paginationData.totalPages,
                hasPreviousPage: paginationData.hasPreviousPage,
                hasNextPage: paginationData.hasNextPage,
              },
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Failed to fetch courses',
            });
            return false;
          }
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Network error occurred while fetching courses';
          set({ isLoading: false, error });
          return false;
        }
      },
      
      fetchCourseById: async (courseId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await courseServiceAPI.getCourseById(courseId);
          
          if (response.success && response.response) {
            set({
              selectedCourse: response.response,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              selectedCourse: null,
              isLoading: false,
              error: response.message || 'Failed to fetch course',
            });
            return false;
          }
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Network error occurred while fetching course';
          set({
            selectedCourse: null,
            isLoading: false,
            error,
          });
          return false;
        }
      },

      deleteCourse: async (courseId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await courseServiceAPI.deleteCourse(courseId);
          const isSuccess = typeof response === 'object' && response !== null
            ? response.success !== false
            : true;

          if (!isSuccess) {
            const message = typeof response === 'object' && response !== null
              ? response.message || 'Failed to delete course'
              : 'Failed to delete course';
            set({ isLoading: false, error: message });
            return false;
          }

          set({ selectedCourse: null });

          const refreshed = await get().fetchCoursesByLecturer();
          if (!refreshed) {
            set({ isLoading: false });
            return true;
          }

          set({ isLoading: false });
          return true;
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Network error occurred while deleting course';
          set({ isLoading: false, error });
          return false;
        }
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, pageIndex: 1 }, // Reset to first page when filters change
        }));
        
        // Auto-fetch with new filters using lecturer method
        get().fetchCoursesByLecturer();
      },
      
      setPagination: (page, pageSize) => {
        set((state) => ({
          pagination: {
            ...state.pagination,
            pageIndex: Math.max(1, page), // UI uses 1-based pagination
            ...(pageSize && { pageSize }),
          },
        }));
        
        // Auto-fetch with new pagination using lecturer method
        get().fetchCoursesByLecturer();
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set(initialState);
      },

      getCurrentLecturerId: async (): Promise<string> => {
        
        try {
          const { getUserIdFromTokenAction } = await import('EduSmart/app/(auth)/action');
          const userInfo = await getUserIdFromTokenAction();
          
          if (userInfo.ok && userInfo.userId) {
            return userInfo.userId;
          } else {
            throw new Error('Unable to extract lecturer ID from JWT token');
          }
        } catch (error) {
          throw new Error('Failed to get lecturer ID: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },

      fetchCoursesByLecturer: async (query?: Partial<GetCoursesByLecturerQuery>) => {
        set({ isLoading: true, error: null });
        
        try {
          const state = get();
          
          // Get lecturer ID dynamically from JWT
          let lecturerId: string;
          try {
            lecturerId = await get().getCurrentLecturerId();
          } catch {
            set({ 
              isLoading: false, 
              error: 'Unable to get lecturer ID from logged-in account. Please try logging in again.' 
            });
            return false;
          }

          const searchQuery: GetCoursesByLecturerQuery = {
            lectureId: lecturerId,
            pageIndex: Math.max(0, (query?.pageIndex || state.pagination.pageIndex) - 1), // Convert to 0-based pagination
            pageSize: query?.pageSize || state.pagination.pageSize,
            search: query?.search ?? state.filters.search,
            subjectCode: query?.subjectCode ?? state.filters.subjectCode,
            isActive: query?.isActive ?? state.filters.isActive, // Don't default to true - get ALL courses
            sortBy: query?.sortBy ?? state.filters.sortBy,
          };
          
          
          const response = await courseServiceAPI.getCoursesByLecturer(searchQuery);
          
          
          // Check for data inconsistency (totalCount > 0 but empty data array)
          if (response.response?.totalCount > 0 && (!response.response?.data || response.response.data.length === 0)) {
            
            // Try comprehensive fallback approach
            
            try {
              const allCoursesResponse = await courseServiceAPI.getCourses({
                pageIndex: 0, // Use 0-based pagination
                pageSize: 100,
              });              
              if (allCoursesResponse.success && allCoursesResponse.response?.data) {
                const allCourses = allCoursesResponse.response.data;
                
                if (allCourses.length > 0) {
                  // Log all course teacher IDs for debugging
                  const teacherIds = allCourses.map(c => c.teacherId);
                  const __uniqueTeacherIds = [...new Set(teacherIds)];                  
                  const myCourses = allCourses.filter(course => course.teacherId === lecturerId);
                  
                  if (myCourses.length > 0) {
                    // Use the client-side filtered results
                    set({
                      courses: myCourses,
                      pagination: {
                        ...state.pagination,
                        totalCount: myCourses.length,
                        totalPages: Math.ceil(myCourses.length / state.pagination.pageSize),
                      },
                      isLoading: false,
                      error: null
                    });
                    return true;
                  } else {
                  }
                } else {
                  
                  // Test different isActive combinations to identify filtering
                  const testCombinations = [
                    { isActive: false, description: 'isActive: false (draft courses)' },
                    { isActive: undefined, description: 'isActive: undefined (all courses)' },
                    { description: 'no isActive parameter (default)' },
                    { isActive: true, description: 'isActive: true (published courses)' },
                  ];
                  
                  for (const testCombo of testCombinations) {
                    try {
                      const testQuery: GetCoursesQuery = {
                        pageIndex: 0, // Use 0-based pagination for API
                        pageSize: 50,
                      };
                      
                      if (testCombo.hasOwnProperty('isActive')) {
                        testQuery.isActive = testCombo.isActive;
                      }
                      
                      const testResponse = await courseServiceAPI.getCourses(testQuery);
                      const resultInfo = {
                        success: testResponse.success,
                        totalCount: testResponse.response?.totalCount || 0,
                        dataLength: testResponse.response?.data?.length || 0,
                        message: testResponse.message
                      };
                      
                      
                      if (resultInfo.totalCount > 0 || resultInfo.dataLength > 0) {
                        
                        if (testResponse.response?.data && testResponse.response.data.length > 0) {
                          const courses = testResponse.response.data;
                          
                          // Check if any match our lecturer ID
                          const myCourses = courses.filter(c => c.teacherId === lecturerId);
                          if (myCourses.length > 0) {
                            // Use these courses and stop testing
                            set({
                              courses: myCourses,
                              pagination: {
                                ...state.pagination,
                                totalCount: myCourses.length,
                                totalPages: Math.ceil(myCourses.length / state.pagination.pageSize),
                              },
                              isLoading: false,
                              error: null
                            });
                            return true;
                          }
                        }
                      }
                    } catch {
                      // Ignore errors in test queries
                    }
                  }
                  
                  
                  // Set a helpful error message for the user
                  set({
                    isLoading: false,
                    error: 'Backend API Issue: Your courses exist in the database but cannot be retrieved due to a server-side bug. Please contact the technical team with this error message.',
                    courses: []
                  });
                  return false;
                }
              }
            } catch {
            }
          }
          
          if (response.success && response.response) {
            const { data, ...paginationData } = response.response;
            
            set({
              courses: data || [],
              pagination: {
                pageIndex: (paginationData.pageIndex ?? 0) + 1, // Convert API's 0-based to UI's 1-based
                pageSize: paginationData.pageSize || 10,
                totalCount: paginationData.totalCount,
                totalPages: paginationData.totalPages,
                hasPreviousPage: paginationData.hasPreviousPage,
                hasNextPage: paginationData.hasNextPage,
              },
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Failed to fetch courses',
            });
            return false;
          }
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Network error occurred while fetching courses';
          set({ isLoading: false, error });
          return false;
        }
      },
    }),
    {
      name: 'course-management-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        pagination: {
          pageIndex: state.pagination.pageIndex,
          pageSize: state.pagination.pageSize,
        },
      }),
    }
  )
);

