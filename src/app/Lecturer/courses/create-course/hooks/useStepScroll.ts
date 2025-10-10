import { useEffect, useRef } from 'react';
import { scrollToTopDeferred } from '../utils/scrollUtils';

/**
 * Custom hook that automatically scrolls to top when the current step changes
 * @param currentStep - The current step number
 * @param delay - Optional delay before scrolling (default: 200ms)
 */
export const useStepScroll = (currentStep: number, delay: number = 200) => {
  const previousStep = useRef<number>(currentStep);
  
  useEffect(() => {
    // Only scroll if step actually changed (not on initial mount)
    if (previousStep.current !== currentStep) {
      // Wait for new step content to render before scrolling
      scrollToTopDeferred(delay);
      previousStep.current = currentStep;
    }
  }, [currentStep, delay]);
};
