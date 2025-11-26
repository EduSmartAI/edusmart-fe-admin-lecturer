"use client";

import { useEffect } from 'react';
import { useUserProfileStore } from 'EduSmart/stores/User/UserProfileStore';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loadProfile, isLoading } = useUserProfileStore();

  useEffect(() => {
    // Load profile on mount if not already loaded
    if (!profile && !isLoading) {
      console.log('[ProfileProvider] Initializing profile...');
      loadProfile();
    }
  }, [profile, isLoading, loadProfile]); // Include all dependencies

  return <>{children}</>;
};
