
import { api } from './api';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User, 
  ChangePasswordData,
  AxiosErrorResponse
} from '../types';

// Custom error class for auth service
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

// Define the actual API response interfaces here if not in types.ts
interface AuthApiResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Type guard to check if error is an Axios error
const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  return typeof error === 'object' && error !== null && ('response' in error || 'request' in error);
};

// Type guard to check if error has response with status
const hasErrorResponseWithStatus = (error: unknown): error is { response: { data: { message?: string; code?: string }; status: number } } => {
  return isAxiosError(error) && 
         error.response !== undefined && 
         typeof error.response === 'object' &&
         'status' in error.response &&
         'data' in error.response;
};

// // Type guard to check if response has user and token
// const isValidAuthResponse = (data: unknown): data is { user: User; token: string } => {
//   return typeof data === 'object' && 
//          data !== null && 
//          'user' in data && 
//          'token' in data &&
//          typeof (data as { token: string }).token === 'string';
// };

// // Type guard to check if response has user
// const isValidUserResponse = (data: unknown): data is { user: User } => {
//   return typeof data === 'object' && 
//          data !== null && 
//          'user' in data;
// };

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  // Only log in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
  
  if (hasErrorResponseWithStatus(error)) {
    const { data, status } = error.response;
    throw new AuthServiceError(
      data?.message || 'Authentication failed',
      data?.code || 'AUTH_ERROR',
      status
    );
  } else if (isAxiosError(error) && error.request) {
    // Request made but no response received
    throw new AuthServiceError(
      'Network error: Unable to connect to server',
      'NETWORK_ERROR'
    );
  } else if (error instanceof Error) {
    // Standard JavaScript error
    throw new AuthServiceError(
      error.message,
      'UNKNOWN_ERROR'
    );
  }
  
  // Unknown error type
  throw new AuthServiceError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthApiResponse>('/auth/login', credentials);
      
      if (!response.data) {
        throw new AuthServiceError(
          'No response data received from server',
          'NO_RESPONSE_DATA'
        );
      }
      
      if (response.data.success === false) {
        throw new AuthServiceError(
          response.data.message || 'Login failed',
          'LOGIN_FAILED'
        );
      }
      
      // ✅ Use type guard to validate response structure
      if (!response.data.user || !response.data.token) {
        throw new AuthServiceError(
          'Invalid response structure: missing user or token',
          'INVALID_RESPONSE_STRUCTURE'
        );
      }
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthApiResponse>('/auth/register', userData);
      
      if (!response.data) {
        throw new AuthServiceError(
          'No response data received from server',
          'NO_RESPONSE_DATA'
        );
      }
      
      if (response.data.success === false) {
        throw new AuthServiceError(
          response.data.message || 'Registration failed',
          'REGISTRATION_FAILED'
        );
      }
      
      if (!response.data.user || !response.data.token) {
        throw new AuthServiceError(
          'Invalid response structure: missing user or token',
          'INVALID_RESPONSE_STRUCTURE'
        );
      }
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<AuthApiResponse>('/auth/profile');
      
      if (!response.data) {
        throw new AuthServiceError(
          'No response data received from server',
          'NO_RESPONSE_DATA'
        );
      }
      
      if (!response.data.success) {
        throw new AuthServiceError(
          response.data.message || 'Failed to fetch profile',
          'PROFILE_FETCH_FAILED'
        );
      }
      
      if (!response.data.user) {
        throw new AuthServiceError(
          'No user data received from server',
          'NO_USER_DATA'
        );
      }
      
      return response.data.user;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<AuthApiResponse>('/auth/profile', data);
      
      if (!response.data) {
        throw new AuthServiceError(
          'No response data received from server',
          'NO_RESPONSE_DATA'
        );
      }
      
      if (!response.data.success) {
        throw new AuthServiceError(
          response.data.message || 'Failed to update profile',
          'PROFILE_UPDATE_FAILED'
        );
      }
      
      if (!response.data.user) {
        throw new AuthServiceError(
          'No updated user data received from server',
          'NO_UPDATED_USER_DATA'
        );
      }
      
      return response.data.user;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      const response = await api.put<AuthApiResponse>('/auth/change-password', data);
      
      if (!response.data) {
        throw new AuthServiceError(
          'No response data received from server',
          'NO_RESPONSE_DATA'
        );
      }
      
      if (!response.data.success) {
        throw new AuthServiceError(
          response.data.message || 'Failed to change password',
          'PASSWORD_CHANGE_FAILED'
        );
      }
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Utility methods
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  // Refresh token method (if your API supports it)
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthApiResponse>('/auth/refresh');
      
      if (!response.data) {
        throw new AuthServiceError(
          'No response data received from server',
          'NO_RESPONSE_DATA'
        );
      }
      
      if (!response.data.success) {
        throw new AuthServiceError(
          response.data.message || 'Token refresh failed',
          'TOKEN_REFRESH_FAILED'
        );
      }
      
      if (!response.data.user || !response.data.token) {
        throw new AuthServiceError(
          'Invalid response structure: missing user or token',
          'INVALID_RESPONSE_STRUCTURE'
        );
      }
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  }
};
