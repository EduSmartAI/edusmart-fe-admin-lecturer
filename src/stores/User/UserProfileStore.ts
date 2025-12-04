import { create } from "zustand";
import { getUserIdFromTokenAction } from "EduSmart/app/(auth)/action";
import { 
  teacherServiceAPI, 
  UpdateTeacherProfileDto,
  CertificateDto,
  ExperienceDto,
  QualificationDto
} from "EduSmart/api/api-teacher-service";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  accountId?: string;
  // Extended profile from Teacher API
  teacherId?: string; // Teacher service uses different ID
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePictureUrl?: string;
  certificates?: CertificateDto[];
  experiences?: ExperienceDto[];
  qualifications?: QualificationDto[];
}

export interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  loadTeacherProfile: (teacherId: string) => Promise<void>;
  updateTeacherProfile: (data: UpdateTeacherProfileDto) => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<string | null>;
  clearProfile: () => void;
}

/**
 * User Profile Store
 * Manages user profile information from JWT token claims and Teacher API
 */
export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
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

        // If user is a teacher/lecturer, load extended profile
        if (result.userRole === "Lecturer" || result.userRole === "Teacher") {
          // Load teacher profile in background (don't block initial load)
          get().loadTeacherProfile(result.userId);
        }
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

  loadTeacherProfile: async (teacherId: string) => {
    try {
      const response = await teacherServiceAPI.getProfile(teacherId);
      
      console.log("[UserProfileStore] GET profile response:", response);
      
      if (response.success && response.response) {
        const teacherData = response.response;
        const currentProfile = get().profile;

        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              teacherId: teacherData.teacherId, // Save teacherId for update calls
              displayName: teacherData.displayName,
              firstName: teacherData.firstName,
              lastName: teacherData.lastName,
              bio: teacherData.bio,
              profilePictureUrl: teacherData.profilePictureUrl,
              certificates: teacherData.certificates,
              experiences: teacherData.experiences,
              qualifications: teacherData.qualifications,
              // Update name with full name from teacher profile
              name: teacherData.displayName || 
                `${teacherData.firstName || ''} ${teacherData.lastName || ''}`.trim() || 
                currentProfile.name,
            },
          });
        }
      }
    } catch (error) {
      console.error("[UserProfileStore] Error loading teacher profile:", error);
      // Don't set error state here as basic profile is already loaded
    }
  },

  updateTeacherProfile: async (data: UpdateTeacherProfileDto) => {
    const currentProfile = get().profile;
    // Use teacherId if available, fallback to userId
    const teacherId = currentProfile?.teacherId || currentProfile?.userId;
    
    if (!teacherId) {
      set({ error: "No user profile loaded" });
      return false;
    }

    set({ isUpdating: true, error: null });
    try {
      console.log("[UserProfileStore] Updating with teacherId:", teacherId);
      
      const response = await teacherServiceAPI.updateProfile(
        teacherId,
        data
      );

      console.log("[UserProfileStore] Update response:", response);

      if (response.success) {
        // Update profile with the data we sent, not from response
        // because PUT API may not return all fields
        set({
          profile: {
            ...currentProfile,
            displayName: data.displayName ?? currentProfile.displayName,
            firstName: data.firstName ?? currentProfile.firstName,
            lastName: data.lastName ?? currentProfile.lastName,
            bio: data.bio ?? currentProfile.bio,
            profilePictureUrl: data.profilePictureUrl ?? currentProfile.profilePictureUrl,
            // Keep existing data - these are not updated via basic profile update
            certificates: currentProfile.certificates,
            experiences: currentProfile.experiences,
            qualifications: currentProfile.qualifications,
            name: data.displayName || 
              `${data.firstName || ''} ${data.lastName || ''}`.trim() || 
              currentProfile.name,
          },
          isUpdating: false,
        });
        return true;
      } else {
        set({ 
          error: response.message || "Failed to update profile", 
          isUpdating: false 
        });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      set({ error: errorMessage, isUpdating: false });
      console.error("[UserProfileStore] Error updating profile:", error);
      return false;
    }
  },

  uploadProfilePicture: async (file: File) => {
    set({ isUpdating: true, error: null });
    try {
      const imageUrl = await teacherServiceAPI.uploadProfilePicture(file);
      set({ isUpdating: false });
      return imageUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      set({ error: errorMessage, isUpdating: false });
      console.error("[UserProfileStore] Error uploading profile picture:", error);
      return null;
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null, isLoading: false, isUpdating: false });
  },
}));
