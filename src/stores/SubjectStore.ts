import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import subjectApiService, { LegacySubject } from 'EduSmart/api/api-subject-service';

export interface SubjectState {
  // State
  subjects: LegacySubject[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheExpiry: number; // milliseconds

  // Actions
  fetchSubjects: (forceRefresh?: boolean) => Promise<void>;
  getSubjectById: (id: string) => LegacySubject | undefined;
  getSubjectByCode: (code: string) => LegacySubject | undefined;
  searchSubjects: (query: string) => LegacySubject[];
  clearCache: () => void;
  clearError: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set, get) => ({
      // Initial State
      subjects: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      cacheExpiry: CACHE_DURATION,

      // Fetch subjects with caching
      fetchSubjects: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Check if cache is still valid
        if (
          !forceRefresh &&
          state.lastFetched &&
          state.subjects.length > 0 &&
          now - state.lastFetched < state.cacheExpiry
        ) {
          // Use cached data
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await subjectApiService.getSubjects();

          if (response.success) {
            set({
              subjects: response.response,
              lastFetched: now,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: response.message || 'Không thể tải danh sách môn học',
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải danh sách môn học';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Get subject by ID (from cache)
      getSubjectById: (id: string) => {
        const state = get();
        return state.subjects.find((s) => s.id === id);
      },

      // Get subject by code (from cache)
      getSubjectByCode: (code: string) => {
        const state = get();
        return state.subjects.find((s) => s.code === code);
      },

      // Search subjects (from cache)
      searchSubjects: (query: string) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.subjects.filter(
          (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.code.toLowerCase().includes(lowerQuery) ||
            s.description?.toLowerCase().includes(lowerQuery)
        );
      },

      // Clear cache (force refresh on next fetch)
      clearCache: () => {
        set({ lastFetched: null, subjects: [] });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'subject-storage',
      partialize: (state) => ({
        subjects: state.subjects,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

export default useSubjectStore;
