import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  setLoading: (value: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (value) => set({ loading: value }),
  showLoading: () => set({ loading: true }),
  hideLoading: () => set({ loading: false }),
}));
