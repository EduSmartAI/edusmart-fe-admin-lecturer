import { create } from "zustand";
import { getUserIdFromTokenAction } from "EduSmart/app/(auth)/action";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  accountId?: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  clearProfile: () => void;
}

/**
 * User Profile Store
 * Manages user profile information loaded from JWT token claims
 */
export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getUserIdFromTokenAction();

      if (result.ok) {
        const profile: UserProfile = {
          userId: result.userId,
          name: result.userName || "User",
          email: result.userEmail || "user@example.com",
          role: result.userRole || "User",
          accountId: result.accountId,
        };

        set({ profile, isLoading: false });
      } else {
        set({
          error: result.error || "Failed to load profile",
          isLoading: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load profile";
      set({ error: errorMessage, isLoading: false });
      console.error("[UserProfileStore] Error loading profile:", error);
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null, isLoading: false });
  },
}));
