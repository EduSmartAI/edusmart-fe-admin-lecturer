import { useEffect, useState, useRef } from "react";

/**
 * Custom hook for debounced search
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns [searchValue, setSearchValue, debouncedValue]
 */
export const useDebouncedSearch = (
  initialValue: string = "",
  delay: number = 300
) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchValue, delay]);

  return [searchValue, setSearchValue, debouncedValue] as const;
};

/**
 * Debounce function for immediate use
 */
export const debounce = <T extends (...args: Array<unknown>) => unknown>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Throttle function for high-frequency events
 */
export const throttle = <T extends (...args: Array<unknown>) => unknown>(
  func: T,
  limit: number = 300
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
