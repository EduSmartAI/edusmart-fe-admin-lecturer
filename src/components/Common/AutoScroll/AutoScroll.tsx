import React, { ReactNode, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

interface AutoScrollProps {
  children: ReactNode;
  speed?: number; // pixels per second
  direction?: 'up' | 'down' | 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export interface AutoScrollRef {
  scrollToTop: () => void;
}

export const AutoScroll = forwardRef<AutoScrollRef, AutoScrollProps>(function AutoScroll({
  children,
  speed = 30,
  direction = 'up',
  pauseOnHover = true,
  className = '',
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const isHovered = useRef(false);
  const positionRef = useRef(0);

  const scrollToTop = () => {
    if (containerRef.current) {
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Reset position
      positionRef.current = 0;
      
      // Use native scroll for more reliable behavior
      containerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      // Reset transform as well
      if (contentRef.current) {
        contentRef.current.style.transform = 'none';
      }
      
      // Restart animation after scrolling
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 500);
      
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToTop,
  }));

  const animate = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const animateLoop = () => {
        if (isHovered.current && pauseOnHover) {
            animationRef.current = requestAnimationFrame(animateLoop);
            return;
        }

        const container = containerRef.current!;
        const content = contentRef.current!;
        const containerSize = direction === 'up' || direction === 'down'
            ? container.clientHeight
            : container.clientWidth;
        const contentSize = direction === 'up' || direction === 'down'
            ? content.clientHeight
            : content.clientWidth;

        if (contentSize <= containerSize) {
            animationRef.current = requestAnimationFrame(animateLoop);
            return;
        }

        const isVertical = direction === 'up' || direction === 'down';
        const isReverse = direction === 'up' || direction === 'left';

        positionRef.current += (isReverse ? -1 : 1) * (speed / 60);

        if (positionRef.current > contentSize - containerSize) {
            positionRef.current = 0;
        } else if (positionRef.current < 0) {
            positionRef.current = contentSize - containerSize;
        }

        content.style.transform = isVertical
            ? `translateY(${-positionRef.current}px)`
            : `translateX(${-positionRef.current}px)`;

        animationRef.current = requestAnimationFrame(animateLoop);
    };

    animationRef.current = requestAnimationFrame(animateLoop);
}, [pauseOnHover, direction, speed]);

  useEffect(() => {
    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [children, speed, direction, pauseOnHover, animate]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto max-h-screen ${className}`}
      onMouseEnter={() => pauseOnHover && (isHovered.current = true)}
      onMouseLeave={() => pauseOnHover && (isHovered.current = false)}
    >
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </div>
  );
});
