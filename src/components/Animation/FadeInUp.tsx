"use client";
import React from "react";
import { useSpring, animated } from "@react-spring/web";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  children: React.ReactNode;
}

export const FadeInUp: React.FC<FadeInProps> = ({
  delay = 0,
  children,
  ...rest
}) => {
  const styles = useSpring({
    from: { opacity: 0, y: 16, scale: 0.98 },
    to: { opacity: 1, y: 0, scale: 1 },
    delay,
    config: { tension: 220, friction: 20 },
  });

  return (
    <animated.div style={styles} {...rest}>
      {children}
    </animated.div>
  );
};
