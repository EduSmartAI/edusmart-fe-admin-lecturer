// FadeTransition.tsx
"use client";
import React from "react";
import { useTransition, animated } from "@react-spring/web";

interface FadeTransitionProps {
  show: boolean;
  children: React.ReactNode;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  show,
  children,
}) => {
  const transitions = useTransition(show, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { tension: 220, friction: 20 },
  });

  return (
    <>
      {transitions(
        (style, item) =>
          item && <animated.div style={style}>{children}</animated.div>,
      )}
    </>
  );
};
