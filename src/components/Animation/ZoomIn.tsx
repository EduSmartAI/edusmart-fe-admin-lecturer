// ZoomIn.tsx
"use client";
import React from "react";
import { useSpring, animated } from "@react-spring/web";

interface ZoomInProps {
  children: React.ReactNode;
  delay?: number;
}

export const ZoomIn: React.FC<ZoomInProps> = ({ children, delay = 0 }) => {
  const props = useSpring({
    from: { opacity: 0, transform: "scale(0.5)" },
    to: { opacity: 1, transform: "scale(1)" },
    delay,
  });

  return <animated.div style={props}>{children}</animated.div>;
};
