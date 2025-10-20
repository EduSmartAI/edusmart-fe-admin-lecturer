/**
 * Unified Course Store
 * Single Responsibility: State Management Only
 * Business logic is delegated to services
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Course,
  CoursePagination,
  CourseFilters,
  CourseModule
} from 'EduSmart/domain/course/models';
import type { CourseDto, CourseDetailDto } from 'EduSmart/api/api-course-service';

// ============================================
// Store State Interface
// ============================================

export interface CourseState {
  // Current course being created/edited
  currentCourse: Course | null;
  
  // Course list management
  courses: CourseDto[];
  selectedCourseDetails: CourseDetailDto | null;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Pagination & Filters
  pagination: CoursePagination;
  filters: CourseFilters;
  
  // Current editing step (for multi-step form)
  currentStep: number;
  
  // Actions - State Management Only
  setCurrentCourse: (course: Course | null) => void;
  updateCourseField: <K extends keyof Course>(field: K, value: Course[K]) => void;
  
  setCourses: (courses: CourseDto[]) => void;
  setSelectedCourseDetails: (course: CourseDetailDto | null) => void;
  
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  
  setPagination: (pagination: Partial<CoursePagination>) => void;
  setFilters: (filters: Partial<CourseFilters>) => void;
  
  setCurrentStep: (step: number) => void;
  
  // Module operations (state only)
  addModule: (module: CourseModule) => void;
  updateModule: (index: number, module: Partial<CourseModule>) => void;
  removeModule: (index: number) => void;
  reorderModules: (startIndex: number, endIndex: number) => void;
  
  // Reset
  reset: () => void;
  clearError: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  currentCourse: null,
  courses: [],
  selectedCourseDetails: null,
  isLoading: false,
  isSaving: false,
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
    sortBy: undefined,
  },
  currentStep: 0,
};

// ============================================
// Store Implementation
// ============================================

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // Current Course Management
      // ============================================
      
      setCurrentCourse: (course) => {
        set({ currentCourse: course });
      },

      updateCourseField: (field, value) => {
        const current = get().currentCourse;
        if (!current) return;
        
        set({
          currentCourse: {
            ...current,
            [field]: value
          }
        });
      },

      // ============================================
      // Course List Management
      // ============================================
      
      setCourses: (courses) => {
        set({ courses });
      },

      setSelectedCourseDetails: (course) => {
        set({ selectedCourseDetails: course });
      },

      // ============================================
      // UI State Management
      // ============================================
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setSaving: (saving) => {
        set({ isSaving: saving });
      },

      setError: (error) => {
        set({ error });
      },

      setPagination: (pagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        }));
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      // ============================================
      // Module Operations (State Management)
      // ============================================
      
      addModule: (module) => {
        const current = get().currentCourse;
        if (!current) return;
        
        set({
          currentCourse: {
            ...current,
            modules: [...current.modules, module]
          }
        });
      },

      updateModule: (index, moduleData) => {
        const current = get().currentCourse;
        if (!current) return;
        
        const updatedModules = current.modules.map((mod, idx) =>
          idx === index ? { ...mod, ...moduleData } : mod
        );
        
        set({
          currentCourse: {
            ...current,
            modules: updatedModules
          }
        });
      },

      removeModule: (index) => {
        const current = get().currentCourse;
        if (!current) return;
        
        set({
          currentCourse: {
            ...current,
            modules: current.modules.filter((_, idx) => idx !== index)
          }
        });
      },

      reorderModules: (startIndex, endIndex) => {
        const current = get().currentCourse;
        if (!current) return;
        
        const modules = Array.from(current.modules);
        const [removed] = modules.splice(startIndex, 1);
        modules.splice(endIndex, 0, removed);
        
        // Update position indices
        const reindexed = modules.map((mod, idx) => ({
          ...mod,
          positionIndex: idx
        }));
        
        set({
          currentCourse: {
            ...current,
            modules: reindexed
          }
        });
      },

      // ============================================
      // Reset & Clear
      // ============================================
      
      reset: () => {
        set(initialState);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist necessary data
      partialize: (state) => ({
        currentCourse: state.currentCourse,
        filters: state.filters,
        pagination: state.pagination,
        currentStep: state.currentStep,
      }),
    }
  )
);





