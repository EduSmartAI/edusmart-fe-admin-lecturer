"use client";
import React from 'react';
import { useTransition, animated } from '@react-spring/web';

interface StepTransitionProps {
  item: React.ReactNode;
  children: React.ReactNode;
}

export const StepTransition: React.FC<StepTransitionProps> = ({ item, children }) => {
  const transitions = useTransition(item, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)', position: 'absolute', width: '100%' },
    config: { tension: 220, friction: 20 },
  });

  return (
    <div style={{ position: 'relative' }}>
      {transitions((style) => (
        <animated.div style={style}>
          {children}
        </animated.div>
      ))}
    </div>
  );
};

