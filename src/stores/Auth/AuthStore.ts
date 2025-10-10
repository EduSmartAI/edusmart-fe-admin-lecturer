// src/stores/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import apiClient from "EduSmart/hooks/apiClient";
import {
  getAuthen,
  insertStudentAction,
  loginAction,
  logoutAction,
  refreshAction,
} from "EduSmart/app/(auth)/action";
import { StudentInsertResponse } from "EduSmart/api/api-auth-service";

export interface AuthState {
  token: string | null;
  isAuthen: boolean;
  refreshTokenValue: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<void>;
  logout: () => void;
  reset: () => void;
  getAuthen: () => Promise<boolean>;
  initializeAuth: () => Promise<boolean>;
  insertStudent: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<StudentInsertResponse>;
}

type PersistedAuth = {
  token: string | null;
};

const cookieRawStorage = {
  getItem: (name: string) => Cookies.get(name) ?? null,
  setItem: (name: string, value: string) =>
    Cookies.set(name, value, { expires: 7, sameSite: "lax", path: "/" }),
  removeItem: (name: string) => Cookies.remove(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthen: false,
      refreshTokenValue: null,

      reset: () => {
        set({ token: null, refreshTokenValue: null });
        Cookies.remove("auth-storage");
      },

      getAuthen: async () => {
        const ok = await getAuthen(); // Server Action
        set({ isAuthen: ok }); // ← cập nhật store để UI theo dõi
        return ok;
      },

      initializeAuth: async () => {
        try {
          const { initializeAuthAction } = await import('EduSmart/app/(auth)/action');
          const result = await initializeAuthAction();
          
          if (result.ok) {
            set({ 
              token: result.accessToken,
              isAuthen: result.isAuthenticated 
            });
            
            if (result.accessToken) {
              apiClient.authEduService.setSecurityData({ token: result.accessToken });
            }
            

            return true;
          }
          return false;
        } catch (error) {
          console.error('[AuthStore] Failed to initialize:', error);
          return false;
        }
      },

      insertStudent: async (email, password, firstName, lastName) => {
        const res = await insertStudentAction({
          email,
          password,
          firstName,
          lastName,
        });
        if (!res.ok) throw new Error(res.error || "InsertStudent failed");
        return res.data;
      },

      login: async (email, password) => {
        try {
          const resp = await loginAction({ email, password });
          if (resp.ok) {
            await getAuthen();
            const token = resp.accessToken;
            set({ token });
            apiClient.authEduService.setSecurityData({ token });
            return true
          }
          return false
        } catch (error) {
          console.error('[AuthStore] Login failed:', error);
          return false
        }
      },

      // 2) Refresh token và revoke khi cần
      refreshToken: async () => {

        const res = await refreshAction();
        if (!res.ok || !res.accessToken) {
          set({ token: null });
          apiClient.authEduService.setSecurityData({ token: undefined });
          throw new Error(res.error || "Refresh failed");
        }
        set({ token: res.accessToken });
        apiClient.authEduService.setSecurityData({ token: res.accessToken });
      },

      logout: async () => {
        await logoutAction();
        set({ token: null, refreshTokenValue: null });
        apiClient.authEduService.setSecurityData({
          token: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage<PersistedAuth>(() => cookieRawStorage),
      partialize: (s) => ({
        token: s.token,
        refreshTokenValue: s.refreshTokenValue,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          apiClient.authEduService.setSecurityData({
            token: (state as PersistedAuth).token,
          });
        }
      },
    },
  ),
);
