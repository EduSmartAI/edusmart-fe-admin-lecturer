/**
 * Utility functions for consistent scrolling behavior in course creation
 */

/**
 * Scrolls to the top of the main course content container or window
 * @param options - Optional scroll options to override defaults
 */
export const scrollToTop = (options?: ScrollToOptions) => {
  // Try to find the main container first (works for both create and edit modes)
  const container = document.getElementById('create-course-content') || 
                    document.getElementById('edit-course-content');
  
  if (container) {
    container.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  } else {
    // Fallback to window scroll
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
      ...options
    });
  }
};

/**
 * Scrolls to a specific element by ID
 * @param elementId - The ID of the element to scroll to
 * @param options - Optional scroll options to override defaults
 * @returns true if element was found and scrolled to, false otherwise
 */
export const scrollToElement = (elementId: string, options?: ScrollIntoViewOptions) => {
  const element = document.getElementById(elementId);
  
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      ...options
    });
    return true;
  }
  
  return false;
};

/**
 * Executes a scroll callback after a delay, using requestAnimationFrame for better timing
 * @param callback - The function to execute
 * @param delay - Delay in milliseconds (default: 100ms)
 */
export const deferredScroll = (callback: () => void, delay: number = 100) => {
  // Use requestAnimationFrame for better timing with rendering
  requestAnimationFrame(() => {
    setTimeout(callback, delay);
  });
};

/**
 * Scrolls to top after a delay to allow content to render
 * @param delay - Delay in milliseconds (default: 100ms)
 */
export const scrollToTopDeferred = (delay: number = 100) => {
  deferredScroll(() => scrollToTop(), delay);
};

/**
 * Scrolls to the first error field in a form
 * Searches for elements with 'ant-form-item-has-error' class
 * @param formId - Optional form ID to limit search scope
 * @returns true if error field was found and scrolled to, false otherwise
 */
export const scrollToFirstError = (formId?: string) => {
  const form = formId ? document.getElementById(formId) : document;
  if (!form) return false;

  const errorField = form.querySelector('.ant-form-item-has-error');
  if (errorField) {
    errorField.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    return true;
  }

  return false;
};

/**
 * Scrolls to the first error field after a delay
 * @param formId - Optional form ID to limit search scope
 * @param delay - Delay in milliseconds (default: 100ms)
 */
export const scrollToFirstErrorDeferred = (formId?: string, delay: number = 100) => {
  deferredScroll(() => scrollToFirstError(formId), delay);
};
