import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  courseServiceAPI, 
  CourseDto, 
  GetCoursesQuery, 
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
  fetchCourseById: (courseId: string) => Promise<boolean>;
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
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  filters: {
    search: '',
    subjectCode: '',
    isActive: undefined,
    sortBy: CourseSortBy.UpdatedAt,
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
                pageIndex: paginationData.pageIndex || 1,
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
          console.error('Fetch courses error:', e);
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
          console.error('Fetch course by ID error:', e);
          set({
            selectedCourse: null,
            isLoading: false,
            error,
          });
          return false;
        }
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, pageIndex: 1 }, // Reset to first page when filters change
        }));
        
        // Auto-fetch with new filters
        get().fetchCourses();
      },
      
      setPagination: (page, pageSize) => {
        set((state) => ({
          pagination: {
            ...state.pagination,
            pageIndex: page,
            ...(pageSize && { pageSize }),
          },
        }));
        
        // Auto-fetch with new pagination
        get().fetchCourses();
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set(initialState);
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

