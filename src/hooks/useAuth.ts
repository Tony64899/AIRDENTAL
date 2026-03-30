// ⚠️ HIPAA: Auth context — all session data stored in memory only

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type Dispatch,
} from 'react';
import type { AuthState, LoginCredentials, User } from '../types/auth';
import * as authService from '../services/authService';

// --- State ---
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isMfaPending: false,
  isLoading: false,
  error: null,
  failedAttempts: 0,
  lockoutUntil: null,
};

// --- Actions ---
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: { error: string; failedCount?: number } }
  | { type: 'MFA_SUCCESS' }
  | { type: 'MFA_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        isMfaPending: true,
        error: null,
        failedAttempts: 0,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        failedAttempts: action.payload.failedCount ?? state.failedAttempts,
      };
    case 'MFA_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        isMfaPending: false,
        error: null,
      };
    case 'MFA_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      // ⚠️ HIPAA: Clear ALL in-memory state
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// --- Context ---
interface AuthContextType {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthReducer() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      dispatch({ type: 'LOGIN_START' });
      const result = await authService.login(credentials);
      if (result.success && result.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        return true;
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: {
            error: result.error ?? 'Login failed.',
            failedCount: result.failedCount,
          },
        });
        return false;
      }
    },
    []
  );

  const verifyMfa = useCallback(
    async (code: string): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const email = state.user?.email ?? '';
      const result = await authService.verifyMfa(email, code);
      if (result.success) {
        dispatch({ type: 'MFA_SUCCESS' });
        return true;
      } else {
        dispatch({ type: 'MFA_FAILURE', payload: result.error ?? 'Verification failed.' });
        return false;
      }
    },
    [state.user?.email]
  );

  const logout = useCallback(() => {
    // ⚠️ HIPAA: Clear everything from memory
    dispatch({ type: 'LOGOUT' });
  }, []);

  return { state, dispatch, login, verifyMfa, logout };
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
