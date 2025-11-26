"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { useUserProfileStore } from "EduSmart/stores/User/UserProfileStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { profile, isLoading } = useUserProfileStore();
  const [isChecking, setIsChecking] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only run auth check once when component mounts
    if (hasCheckedAuth.current) return;

    const checkAuth = async () => {
      try {
        // Get current state directly from store
        const state = useUserProfileStore.getState();
        
        // Load profile if not already loaded
        if (!state.profile && !state.isLoading) {
          await state.loadProfile();
        }

        // Wait a bit for profile to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // After loading, check if user is authenticated and has Admin role
        const currentProfile = useUserProfileStore.getState().profile;

        if (!currentProfile) {
          // Not authenticated - redirect to login
          console.log('[AdminLayout] No profile found, redirecting to login');
          router.push("/Login?error=unauthorized");
          return;
        }

        const userRole = currentProfile.role?.toLowerCase() || '';
        console.log('[AdminLayout] User role:', currentProfile.role, '(lowercase:', userRole + ')');

        // Block Student role explicitly
        if (userRole === "student") {
          console.log('[AdminLayout] Student role not allowed');
          router.push("/Login?error=student_not_allowed");
          return;
        }

        if (userRole !== "admin") {
          // Not an admin - redirect to login
          console.log('[AdminLayout] Not admin role, redirecting');
          router.push("/Login?error=unauthorized");
          return;
        }

        // User is authenticated and is Admin
        console.log('[AdminLayout] Admin authenticated successfully');
        hasCheckedAuth.current = true;
        setIsChecking(false);
      } catch (error) {
        console.error('[AdminLayout] Auth check failed:', error);
        router.push("/Login?error=unauthorized");
      }
    };

    checkAuth();
  }, [router]); // router is stable, no need for other deps since we use getState()

  // Show loading spinner while checking authentication
  if (isChecking || isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large">
          <div style={{ padding: '50px' }} />
        </Spin>
      </div>
    );
  }

  // Only render content if user is authenticated and is Admin
  if (!profile || profile.role?.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <BaseScreenAdmin>
      {children}
    </BaseScreenAdmin>
  );
}
