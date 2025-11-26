"use client";

import React, { useEffect, useState, useRef } from "react";
import { Spin } from "antd";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { useUserProfileStore } from "EduSmart/stores/User/UserProfileStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading } = useUserProfileStore();
  const [isReady, setIsReady] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load profile once
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadUserProfile = async () => {
      try {
        const state = useUserProfileStore.getState();
        
        // If profile already loaded, just mark as ready
        if (state.profile) {
          setIsReady(true);
          return;
        }

        // Load profile
        await state.loadProfile();
        
        // Wait for state to update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Trust middleware for authorization
        // Middleware already verified this is an Admin, so just load the profile for display
        // If profile fails to load, still render the page (middleware already authorized)
        setIsReady(true);
        
      } catch (error) {
        console.error('[AdminLayout] Error loading profile:', error);
        // Still mark as ready - middleware already authorized this request
        setIsReady(true);
      }
    };

    loadUserProfile();
  }, []);

  // Show loading spinner while loading profile
  if (!isReady || isLoading) {
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

  return (
    <BaseScreenAdmin>
      {children}
    </BaseScreenAdmin>
  );
}
