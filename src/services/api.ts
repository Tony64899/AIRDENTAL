// Base API client — wraps fetch with auth headers, error normalization, and mock toggle.
// Set VITE_USE_MOCK_API=true in .env.local to use mock services instead of real API.
// TODO (backend phase): Set VITE_API_BASE_URL to the NestJS server URL.

import type { ApiError } from '../types/common';

// Read from environment variables — never hardcode URLs or secrets
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
export const IS_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false' || API_BASE_URL === '';

// In-memory auth token store — ⚠️ HIPAA: never use localStorage for tokens
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function clearAuthToken(): void {
  authToken = null;
}

// Standard API error class for consistent error handling
export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.statusCode = error.statusCode ?? 500;
    this.details = error.details;
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;  // ms, default 10000
}

/**
 * Core fetch wrapper used by all service files.
 * Injects auth token, normalizes errors, and enforces request timeout.
 */
export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 10_000, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  // Inject auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Attach clinicId header for multi-tenant routing
  // TODO: Read from ClinicContext when backend is integrated
  headers['X-Clinic-Id'] = 'clinic-1';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to parse a structured error from the response body
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiRequestError({
        code: errorBody.code ?? 'API_ERROR',
        message: errorBody.message ?? `Request failed with status ${response.status}`,
        statusCode: response.status,
        details: errorBody.details,
      });
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiRequestError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiRequestError({
        code: 'REQUEST_TIMEOUT',
        message: 'Request timed out. Please check your connection and try again.',
        statusCode: 408,
      });
    }
    throw new ApiRequestError({
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    });
  }
}
