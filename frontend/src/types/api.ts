import { type PaginationResponse } from './index';

// Enhanced API error response type
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
  statusCode?: number;
}

// Generic API response with proper typing
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  // Your API might also return user/token at root level
  token?: string;
  pagination?: PaginationResponse;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
  statusCode: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination: PaginationResponse;
}

// Axios error response structure
export interface AxiosErrorResponse {
  response?: {
    data: ApiErrorResponse;
    status: number;
    statusText: string;
  };
  request?: unknown;
  message?: string;
  code?: string;
}

// Generic API types
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface MutationOptions<TVariables = unknown> {
  onSuccess?: (data: unknown, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: unknown, error: ApiError | null, variables: TVariables) => void;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}