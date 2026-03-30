// Shared utility types used across the entire app

// Generic paginated response wrapper for API calls
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Standard API error shape
export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  details?: Record<string, string[]>;  // field-level validation errors
}

// Loading state for async operations
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Date range used by analytics, reports, and scheduling
export interface DateRange {
  start: Date;
  end: Date;
}

// Generic select option (used in dropdowns)
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Result wrapper for service functions (mirrors auth pattern)
export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
