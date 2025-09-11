// src/components/Stepper/BaseControlStepperContent.tsx
import React from "react";

interface Props {
  index: number;
  current: number;
  children: React.ReactNode;
}

const BaseControlStepperContent: React.FC<Props> = ({
  index,
  current,
  children,
}) => {
  if (index !== current) return null;
  return <>{children}</>;
};

export default BaseControlStepperContent;
