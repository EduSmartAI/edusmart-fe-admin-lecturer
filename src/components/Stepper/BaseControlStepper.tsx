import React from "react";
import { Steps } from "antd";
import type { StepsProps } from "antd";

export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface CustomStepperProps {
  steps: StepItem[];
  currentIndex: number;
  onChange?: (current: number) => void;
  direction?: StepsProps["direction"];
}

const CustomStepper: React.FC<CustomStepperProps> = ({
  steps,
  currentIndex,
  onChange,
  direction = "horizontal",
}) => {
  const items: StepsProps["items"] = steps.map((step, index) => ({
    key: String(index),
    title: step.title,
    description: step.description,
    status:
      index < currentIndex
        ? "finish"
        : index === currentIndex
          ? "process"
          : "wait",
  }));

  return (
    <Steps
      current={currentIndex}
      items={items}
      onChange={onChange}
      direction={direction}
    />
  );
};

export default CustomStepper;
