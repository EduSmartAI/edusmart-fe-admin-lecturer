"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSprings, animated, easings, to } from "@react-spring/web";

interface Bubble {
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  duration: number;
  color: string;
  blur: number;
}

export default function BubbleBackground() {
  // State lưu kích thước viewport
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // chỉ chạy trên client
    function update() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const bubbles = useMemo<Bubble[]>(() => {
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return []; // chưa biết kích thước
    return Array.from({ length: 12 }).map(() => {
      const hue = Math.floor(Math.random() * 360);
      const size = 150 + Math.random() * 300;
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.max(width, height) * 1.5;
      const endX = startX + Math.cos(angle) * distance;
      const endY = startY + Math.sin(angle) * distance;
      return {
        size,
        startX,
        startY,
        endX,
        endY,
        delay: Math.random() * 3000,
        duration: 8000 + Math.random() * 7000,
        color: `hsla(${hue}, 100%, 50%, 0.2)`,
        blur: 3 + Math.random() * 5,
      };
    });
  }, [dimensions]);

  const springs = useSprings(
    bubbles.length,
    bubbles.map(({ delay, duration, startX, startY, endX, endY }) => ({
      from: { x: startX, y: startY, opacity: 1, scale: 1 },
      to: { x: endX, y: endY, opacity: 0, scale: 0.8 },
      loop: true,
      delay,
      config: { duration, easing: easings.easeInOutQuad },
    })),
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {springs.map((style, i) => {
        const { size, color, blur } = bubbles[i];
        return (
          <animated.div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: "50%",
              boxShadow: `0 0 ${blur * 4}px ${color}`,
              opacity: style.opacity,
              transform: to(
                [style.x, style.y, style.scale],
                (x, y, s) => `translate3d(${x}px, ${y}px, 0) scale(${s})`,
              ),
            }}
          />
        );
      })}
    </div>
  );
}
