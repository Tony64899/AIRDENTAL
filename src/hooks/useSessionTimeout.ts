// ⚠️ HIPAA: Auto-logout after inactivity — required for all protected pages.
// Warning at 13 minutes, hard logout at 15 minutes of no user activity.
// Resets on any user interaction: mousemove, keydown, click, scroll, touchstart.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const WARNING_MS  = 13 * 60 * 1000;  // 13 minutes
const TIMEOUT_MS  = 15 * 60 * 1000;  // 15 minutes

interface UseSessionTimeoutReturn {
  showWarning: boolean;         // true when warning modal should be visible
  secondsRemaining: number;     // countdown shown in warning modal
  extendSession: () => void;    // call when user clicks "Stay Logged In"
}

export function useSessionTimeout(): UseSessionTimeoutReturn {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  // Use refs for timer IDs so we can clear them without causing re-renders
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current)  clearTimeout(logoutTimerRef.current);
    if (countdownRef.current)    clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);

    // Show warning at 13 minutes
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsRemaining(120);  // 2 minutes until logout

      // Start the countdown display
      countdownRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1_000);
    }, WARNING_MS);

    // Hard logout at 15 minutes
    logoutTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setShowWarning(false);
      logout();
    }, TIMEOUT_MS);
  }, [clearAllTimers, logout]);

  // Reset timers whenever the user interacts with the page
  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Throttle: only reset if at least 5 seconds have passed since last activity
    if (now - lastActivityRef.current > 5_000) {
      lastActivityRef.current = now;
      if (!showWarning) {
        startTimers();
      }
    }
  }, [showWarning, startTimers]);

  // Extend the session when user clicks "Stay Logged In" in the warning modal
  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    startTimers();
  }, [startTimers]);

  // Start timers on mount, clean up on unmount
  useEffect(() => {
    startTimers();
    return clearAllTimers;
  }, [startTimers, clearAllTimers]);

  // Listen for user activity events
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'] as const;
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [handleActivity]);

  return { showWarning, secondsRemaining, extendSession };
}
