/**
 * Temporary fix for React Spring stack overflow
 * This file provides disabled animations to prevent the infinite loop
 */

import React from 'react';

interface SafeAnimatedDivProps {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

// Simple non-animated replacement for animated.div
export const SafeAnimatedDiv: React.FC<SafeAnimatedDivProps> = ({ style = {}, className, children }) => {
  // Remove any transform/animation properties that might cause issues
  const safeStyle: React.CSSProperties = {
    ...style,
    opacity: 1, // Force visible
    transform: 'none', // Remove transforms
  };
  
  return React.createElement('div', { style: safeStyle, className }, children);
};

// Safe useSpring replacement that returns static values
export const useSafeSpring = () => {
  return {
    opacity: 1,
    transform: 'scale(1)',
  };
};

// Safe useTrail replacement
export const useSafeTrail = (count: number) => {
  return Array(count).fill({
    opacity: 1,
    transform: 'translate3d(0,0,0)',
  });
};
