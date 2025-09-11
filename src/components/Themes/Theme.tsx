import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../../Provider/ThemeProvider";

// Tùy chỉnh màu nhanh ở đây
const LIGHT_STYLES = [
  "!bg-white",
  "hover:!bg-gray-50",
  "!text-gray-900",
  "!border",
  "!border-gray-300",
  "!shadow-sm",
  "dark:!bg-white",
].join(" ");
const DARK_STYLES = "!bg-[#374151] hover:!bg-[#4B5563] !text-white"; // xám đậm

interface ThemeToggleButtonProps {
  size?: "small" | "middle" | "large";
  showText?: boolean;
  square?: boolean; // nếu true -> bỏ bo tròn luôn
}

export const ThemeSwitch: React.FC<ThemeToggleButtonProps> = ({
  size = "small",
  showText = false,
  square = false,
}) => {
  const { toggleSwitchTheme, isDarkMode, ref } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    // bạn có thể trả về null, loading spinner, hoặc placeholder ẩn đi
    return null;
  }

  const tooltip = isDarkMode
    ? "Chuyển sang Light mode"
    : "Chuyển sang Dark mode";
  const IconComponent = isDarkMode ? SunOutlined : MoonOutlined;

  return (
    <Tooltip title={tooltip}>
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        size={size}
        onClick={(e) => {
          e.preventDefault();
          toggleSwitchTheme();
        }}
        className={[
          "transition-colors duration-200 !px-4 !py-1",
          square ? "!rounded-none" : "!rounded-md",
          isDarkMode ? DARK_STYLES : LIGHT_STYLES,
        ].join(" ")}
      >
        <IconComponent />
        {showText && (
          <span className="ml-2">{isDarkMode ? "Light" : "Dark"}</span>
        )}
      </Button>
    </Tooltip>
  );
};
