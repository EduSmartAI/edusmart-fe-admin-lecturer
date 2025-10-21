/* eslint-disable */
// @ts-nocheck
// Temporarily disabled - needs restoration
import { create } from 'zustand';

export interface UpdateCourseState {
  isUpdating: boolean;
  error: string | null;
}

export const useUpdateCourseStore = create<UpdateCourseState>()((set) => ({
  isUpdating: false,
  error: null,
}));
