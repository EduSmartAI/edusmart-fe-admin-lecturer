/**
 * Admin Content Management - API Error Handling Utilities
 * Provides consistent error handling and user-friendly messages
 */

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export interface ApiError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for API error response
    const apiError = error as unknown as { response?: { data?: ApiErrorResponse } };
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  const apiError = error as unknown as { response?: { status?: number } };
  return apiError.response?.status === 400;
};

/**
 * Check if error is authentication error
 */
export const isAuthenticationError = (error: unknown): boolean => {
  const apiError = error as unknown as { response?: { status?: number } };
  return apiError.response?.status === 401;
};

/**
 * Check if error is authorization error
 */
export const isAuthorizationError = (error: unknown): boolean => {
  const apiError = error as unknown as { response?: { status?: number } };
  return apiError.response?.status === 403;
};

/**
 * Check if error is not found error
 */
export const isNotFoundError = (error: unknown): boolean => {
  const apiError = error as unknown as { response?: { status?: number } };
  return apiError.response?.status === 404;
};

/**
 * Check if error is server error
 */
export const isServerError = (error: unknown): boolean => {
  const apiError = error as unknown as { response?: { status?: number } };
  return (apiError.response?.status ?? 0) >= 500;
};

/**
 * Format error message for display to user
 */
export const formatErrorMessage = (error: unknown): string => {
  if (isValidationError(error)) {
    return "The form contains validation errors. Please check your input.";
  }

  if (isAuthenticationError(error)) {
    return "Your session has expired. Please log in again.";
  }

  if (isAuthorizationError(error)) {
    return "You don't have permission to perform this action.";
  }

  if (isNotFoundError(error)) {
    return "The resource was not found. It may have been deleted.";
  }

  if (isServerError(error)) {
    return "A server error occurred. Please try again later.";
  }

  return getErrorMessage(error);
};

/**
 * Log error for monitoring/debugging
 */
export const logError = (context: string, error: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}] Error:`, error);
  }

  // TODO: Send to error tracking service (Sentry, etc.)
};

/**
 * Retry API call with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
};

/**
 * Validate API response structure
 */
export const validateApiResponse = <T>(
  response: unknown,
  expectedFields: (keyof T)[] = []
): response is T => {
  if (!response || typeof response !== "object") {
    return false;
  }

  for (const field of expectedFields) {
    if (!(field in response)) {
      return false;
    }
  }

  return true;
};
