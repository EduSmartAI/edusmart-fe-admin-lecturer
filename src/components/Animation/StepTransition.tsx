"use client";
import React, { useState, useEffect } from 'react';

interface StepTransitionProps {
  item: React.ReactNode;
  children: React.ReactNode;
}

export const StepTransition: React.FC<StepTransitionProps> = ({ item, children }) => {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Add slight delay for smooth transition
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Simple CSS transition instead of React Spring to avoid hydration issues
  if (!isClient) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-5'
      }`}
    >
      {children}
    </div>
  );
};

