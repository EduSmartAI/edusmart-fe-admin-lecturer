// src/components/BaseControl/FormWrapper.tsx
"use client";
import React from "react";
import { Form, FormInstance } from "antd";
import { FormProps } from "antd/lib";

export interface BaseControlFormProps {
  form: FormInstance;
  layout?: "horizontal" | "vertical" | "inline";
  children: React.ReactNode;
  /** Giới hạn chiều rộng tối đa (px hoặc %) */
  maxWidth?: number | string;
  onFinish?: FormProps["onFinish"];
  initialValues?: FormProps["initialValues"];
}

const BaseControlForm: React.FC<BaseControlFormProps> = ({
  form,
  layout = "vertical",
  children,
  maxWidth = "80%",
  onFinish,
  initialValues,
}) => (
  <div style={{ maxWidth, margin: "0 auto" }}>
    <Form
      form={form}
      layout={layout}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {children}
    </Form>
  </div>
);

export default BaseControlForm;
