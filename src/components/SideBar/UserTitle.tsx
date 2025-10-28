"use client";

import React, { useEffect } from "react";
import { Tooltip, Avatar, theme } from "antd";
import { useRouter } from "next/navigation";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useUserProfileStore } from "EduSmart/stores/User/UserProfileStore";

type UserTitleProps = {
  collapsed: boolean;
};

const initialsFrom = (name: string) =>
  (name || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const UserTitle: React.FC<UserTitleProps> = ({ collapsed }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { profile, loadProfile } = useUserProfileStore();
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  // Load user profile on mount
  useEffect(() => {
    console.log('UserTitle: Current profile:', profile);
    if (!profile) {
      console.log('UserTitle: Loading profile...');
      loadProfile();
    }
  }, [profile, loadProfile]);

  console.log('UserTitle render:', { profile, name: profile?.name, email: profile?.email });

  const displayName = profile?.name || "User";
  const email = profile?.email || "user@example.com";
  const avatarUrl = null;

  return (
    <Tooltip
      title={
        collapsed ? (
          <div>
            <div className="font-semibold">{displayName}</div>
            <div className="opacity-80">{email}</div>
          </div>
        ) : null
      }
      placement="right"
    >
      <div
        onClick={() => router.push("/Admin/profile")}
        role="button"
        className={`
          m-0 cursor-pointer select-none
          rounded-2xl
          flex items-center gap-3
          ${collapsed ? "p-2.5" : "px-3 py-2.5"}
          ${isDarkMode ? "bg-white/5 border-white/10" : "bg-[#f6f8fb]"}
          border
        `}
        style={{
          borderColor: isDarkMode ? "" : colorBorderSecondary,
        }}
      >
        <Avatar size={44} src={avatarUrl} className="shrink-0">
          {initialsFrom(displayName)}
        </Avatar>

        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold leading-tight truncate">{displayName}</div>
            <div className="text-[13px] opacity-75 truncate">{email}</div>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

