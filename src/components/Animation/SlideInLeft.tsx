// SlideInLeft.tsx
"use client";
import React from "react";
import { animated, useSpring } from "@react-spring/web";

interface SlideInLeftProps {
  children: React.ReactNode;
  delay?: number;
}

export const SlideInLeft: React.FC<SlideInLeftProps> = ({
  children,
  delay = 0,
}) => {
  const props = useSpring({
    from: { opacity: 0, transform: "translateX(-100%)" },
    to: { opacity: 1, transform: "translateX(0%)" },
    delay,
  });

  return <animated.div style={props}>{children}</animated.div>;
};
