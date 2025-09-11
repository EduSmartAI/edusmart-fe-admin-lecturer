// src/components/CustomDrawer.tsx
import React from "react";
import { Drawer, Space, Button } from "antd";

export interface CustomDrawerProps {
  /** Tiêu đề Drawer */
  title: React.ReactNode;
  /** Mở/đóng Drawer */
  open: boolean;
  /** Hàm gọi khi người dùng nhấn Cancel hoặc đóng Drawer */
  onClose: () => void;
  /** Hàm gọi khi người dùng nhấn Submit */
  onSubmit: () => void;
  /** Nội dung tùy biến (form, text, ...) */
  children: React.ReactNode;
  /** Độ rộng Drawer (px) */
  width?: number;
  /** Text hiển thị cho nút Cancel */
  cancelText?: string;
  /** Text hiển thị cho nút Submit */
  submitText?: string;
}

const BaseControlDrawer: React.FC<CustomDrawerProps> = ({
  title,
  open,
  onClose,
  onSubmit,
  children,
  width = 720,
  cancelText = "Cancel",
  submitText = "Submit",
}) => (
  <Drawer
    title={title}
    width={width}
    onClose={onClose}
    open={open}
    style={{ paddingBottom: 80 }}
    extra={
      <Space>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button type="primary" onClick={onSubmit}>
          {submitText}
        </Button>
      </Space>
    }
  >
    {children}
  </Drawer>
);

export default BaseControlDrawer;
