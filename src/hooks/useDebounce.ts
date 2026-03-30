// Debounce hook — delays updating a value until the user stops typing.
// Used by patient search, CDT code search, and any live-search input.

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the value that only updates after
 * the specified delay (default: 300ms) of no further changes.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 300);
 *   // Use debouncedSearch to trigger the API call or filter
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timer if value changes before delay expires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
