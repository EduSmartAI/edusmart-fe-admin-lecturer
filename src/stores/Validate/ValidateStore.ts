import { create } from "zustand";

interface ValidateState {
  inValid: boolean;
  setInValid: (value: boolean) => void;
}

export const useValidateStore = create<ValidateState>((set) => ({
  inValid: false,
  setInValid: (value) => set({ inValid: value }),
}));
