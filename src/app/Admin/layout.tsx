"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { useUserProfileStore } from "EduSmart/stores/User/UserProfileStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { profile, loadProfile, isLoading } = useUserProfileStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Load profile if not already loaded
        if (!profile && !isLoading) {
          await loadProfile();
        }

        // After loading, check if user is authenticated and has Admin role
        const currentProfile = useUserProfileStore.getState().profile;
        
        if (!currentProfile) {
          // Not authenticated - redirect to login
          router.push("/Login?error=unauthorized");
          return;
        }

        // Block Student role explicitly
        if (currentProfile.role === "Student") {
          router.push("/Login?error=student_not_allowed");
          return;
        }

        if (currentProfile.role !== "Admin") {
          // Not an admin - redirect to login
          router.push("/Login?error=unauthorized");
          return;
        }

        // User is authenticated and is Admin
        setIsChecking(false);
      } catch (error) {
        console.error('[AdminLayout] Auth check failed:', error);
        router.push("/Login?error=unauthorized");
      }
    };

    checkAuth();
  }, [profile, loadProfile, isLoading, router]);

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
  if (!profile || profile.role !== "Admin") {
    return null;
  }

  return (
    <BaseScreenAdmin>
      {children}
    </BaseScreenAdmin>
  );
}
