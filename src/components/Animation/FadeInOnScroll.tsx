import React from "react";
import { animated, useInView } from "@react-spring/web";

export function FadeInOnScrollSpring({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ref, springs] = useInView(
    () => ({
      from: { opacity: 0, y: 16 },
      to: { opacity: 1, y: 0 },
      config: { tension: 220, friction: 20 },
    }),
    {
      rootMargin: "-10% 0%", // tuỳ chọn
      amount: 0.15, // (tuỳ phiên bản, không phải bản nào cũng hỗ trợ)
    },
  );

  return (
    <animated.div
      ref={ref}
      style={{
        opacity: springs.opacity,
        transform: springs.y.to((v) => `translateY(${v}px)`),
      }}
    >
      {children}
    </animated.div>
  );
}
