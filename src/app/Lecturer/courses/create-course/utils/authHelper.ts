import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';

/**
 * Helper functions for authentication in course creation
 */

export interface LoginCredentials {
  username: string;
  password: string;
  client_id: string;
  client_secret: string;
}

// Default credentials based on your curl request
export const DEFAULT_CREDENTIALS: LoginCredentials = {
  username: 'vuthanhan3547@gmail.com',
  password: '123456',
  client_id: 'service_client',
  client_secret: 'EduSmartAI-Capstone-Project'
};

/**
 * Login with specific credentials for course creation
 */
export const loginForCourseCreation = async (credentials: LoginCredentials = DEFAULT_CREDENTIALS): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    
    const { login } = useAuthStore.getState();
    const success = await login(credentials.username, credentials.password);
    
    if (success) {
      const { token } = useAuthStore.getState();
      return {
        success: true,
        token: token || undefined
      };
    } else {
      return {
        success: false,
        error: 'Login failed with provided credentials'
      };
    }
  } catch (error) {
    console.error('[AuthHelper] Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown login error'
    };
  }
};

/**
 * Get current auth token or attempt to refresh
 */
export const getOrRefreshToken = async (): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    const { token, refreshToken, isAuthen } = useAuthStore.getState();
    
    // If we have a token and are authenticated, return it
    if (token && isAuthen) {
      return {
        success: true,
        token
      };
    }
    
    // Try to refresh the token
    if (token) {
      try {
        await refreshToken();
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          return {
            success: true,
            token: newToken
          };
        }
      } catch (refreshError) {
        // If refresh fails, try fresh login
        console.error('[AuthHelper] Refresh failed:', refreshError);
        return await loginForCourseCreation();
      }
    }
    
    // No token, attempt fresh login
    return await loginForCourseCreation();
    
  } catch (error) {
    console.error('[AuthHelper] Token retrieval error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown token error'
    };
  }
};

/**
 * Validate that we have proper authentication for course creation
 */
export const validateCourseCreationAuth = async (): Promise<{
  success: boolean;
  token?: string;
  error?: string;
  details?: {
    hasToken: boolean;
    isAuthenticated: boolean;
    tokenMasked?: string;
  };
}> => {
  try {
    const { token, isAuthen } = useAuthStore.getState();
    
    const details = {
      hasToken: !!token,
      isAuthenticated: isAuthen,
      tokenMasked: token ? `${token.slice(0, 6)}...${token.slice(-4)}` : undefined
    };
    
    
    if (!token || !isAuthen) {
      // Attempt to get/refresh token
      const authResult = await getOrRefreshToken();
      if (authResult.success) {
        return {
          success: true,
          token: authResult.token,
          details: {
            ...details,
            hasToken: true,
            isAuthenticated: true,
            tokenMasked: authResult.token ? `${authResult.token.slice(0, 6)}...${authResult.token.slice(-4)}` : undefined
          }
        };
      } else {
        return {
          success: false,
          error: authResult.error,
          details
        };
      }
    }
    
    return {
      success: true,
      token,
      details
    };
    
  } catch (error) {
    console.error('[AuthHelper] Auth validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
};

/**
 * Debug function to log current auth state
 */
export const debugAuthState = (): void => {
  const { token, isAuthen, refreshTokenValue } = useAuthStore.getState();
  
  console.log({
    hasToken: !!token,
    tokenPreview: token ? `${token.slice(0, 8)}...` : 'none',
    isAuthenticated: isAuthen,
    hasRefreshToken: !!refreshTokenValue,
    timestamp: new Date().toISOString()
  });
};