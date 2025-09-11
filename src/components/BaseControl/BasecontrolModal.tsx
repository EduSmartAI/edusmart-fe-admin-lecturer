// src/components/BaseControl/BasecontrolModal.tsx
"use client";
import React, { ReactNode, useState } from "react";
import { Button, Modal, ButtonProps } from "antd";
import "./style/modal.css";

interface FooterButtonConfig {
  key?: string;
  text: ReactNode;
  type?: ButtonProps["type"];
  onClick?: () => void;
}

export interface BasecontrolModalProps {
  /** Text for the trigger button */
  triggerText?: ReactNode;
  /** Props for the trigger button to customize style/color/etc. */
  triggerButtonProps?: ButtonProps;
  /** Title shown in the modal header (used if `header` not provided) */
  title?: ReactNode;
  /** Custom header content (overrides `title` if provided) */
  header?: ReactNode;
  /** Content inside the modal body */
  children: ReactNode;
  /** Hide all footer buttons */
  hideFooter?: boolean;
  /** Custom text for OK button */
  okText?: ReactNode;
  /** Custom text for Cancel button */
  cancelText?: ReactNode;
  /** Specific width (px or %) */
  width?: number | string;
  /** Specific height (px or %) */
  height?: number | string;
  /** Full screen mode */
  isFullScreen?: boolean;
  /** Responsive mode: width 90% max 800px */
  isResponsive?: boolean;
  /**
   * Callback khi click OK.
   * Trả về `false` (hoặc Promise<false>) để giữ modal,
   * trả về `true` hoặc không trả gì để đóng modal.
   */
  onOk?: () => boolean | Promise<boolean>;
  /** Callback khi click Cancel */
  onCancel?: () => void;
  /** Additional custom footer buttons */
  extraFooterButtons?: FooterButtonConfig[];
}

const BasecontrolModal: React.FC<BasecontrolModalProps> = ({
  triggerText = "Open Modal",
  triggerButtonProps,
  title,
  header,
  children,
  hideFooter = false,
  okText = "OK",
  cancelText = "Cancel",
  width,
  height,
  isFullScreen = false,
  isResponsive = false,
  onOk,
  onCancel,
  extraFooterButtons = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);

  const handleOk = async () => {
    let shouldClose = true;
    if (onOk) {
      const result = await onOk();
      if (typeof result === "boolean") {
        shouldClose = result;
      }
    }
    if (shouldClose) setIsModalOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setIsModalOpen(false);
  };

  // Prepare style object for Modal
  const style: React.CSSProperties = {};
  let modalWidth: number | string | undefined = width;

  if (isFullScreen) {
    modalWidth = "100vw";
    style.top = 0;
    style.padding = 0;
    style.height = "100vh";
    style.overflow = "auto";
  } else if (isResponsive) {
    modalWidth = "90%";
    style.maxWidth = 800;
  }
  if (height && !isFullScreen) {
    style.height = height;
  }

  const footer = hideFooter ? null : (
    <div className="flex justify-end space-x-2">
      <Button onClick={handleCancel}>{cancelText}</Button>
      {extraFooterButtons.map((btn) => (
        <Button
          key={btn.key || String(btn.text)}
          type={btn.type}
          onClick={btn.onClick}
        >
          {btn.text}
        </Button>
      ))}
      <Button type="primary" onClick={handleOk}>
        {okText}
      </Button>
    </div>
  );

  return (
    <>
      <Button
        {...triggerButtonProps}
        onClick={showModal}
        type={triggerButtonProps?.type || "primary"}
      >
        {triggerText}
      </Button>
      <Modal
        title={header ?? title}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={footer}
        destroyOnHidden
        maskClosable={false}
        width={modalWidth}
        style={style}
      >
        {children}
      </Modal>
    </>
  );
};

export default BasecontrolModal;
