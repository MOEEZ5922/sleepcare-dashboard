import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cacheKey?: string;
  cacheTime?: number; // Cache validity duration in milliseconds. Defaults to 30000 (30 seconds).
}

// Global in-memory cache store
const apiCache: Record<string, { data: any; timestamp: number }> = {};

/**
 * Custom hook to handle API calls with loading, error, and data states.
 * Supports caching using options.cacheKey and options.cacheTime.
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, dependencies = [], onSuccess, onError, cacheKey, cacheTime = 30000 } = options;
  
  // Helper to fetch valid cache entry
  const getCachedValue = useCallback((): T | undefined => {
    if (cacheKey && apiCache[cacheKey]) {
      const entry = apiCache[cacheKey];
      if (Date.now() - entry.timestamp < cacheTime) {
        return entry.data as T;
      }
    }
    return undefined;
  }, [cacheKey, cacheTime]);

  const cachedVal = getCachedValue();
  const [data, setData] = useState<T | undefined>(cachedVal !== undefined ? cachedVal : initialData);
  const [isLoading, setIsLoading] = useState<boolean>(cachedVal === undefined);
  const [error, setError] = useState<Error | null>(null);

  // Track previous cache key and dependencies to reset/sync state synchronously during render
  const [prevCacheKey, setPrevCacheKey] = useState<string | undefined>(cacheKey);
  const [prevDeps, setPrevDeps] = useState<any[]>(dependencies);

  // Helper to check if dependencies array changed
  const areDepsEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  if (cacheKey !== prevCacheKey || !areDepsEqual(dependencies, prevDeps)) {
    setPrevCacheKey(cacheKey);
    setPrevDeps(dependencies);
    const nextCachedVal = getCachedValue();
    setData(nextCachedVal !== undefined ? nextCachedVal : initialData);
    setIsLoading(nextCachedVal === undefined);
    setError(null);
  }

  const fetchData = useCallback(async (force = false) => {
    // If not a forced refresh, check cache first
    if (cacheKey && !force) {
      const entry = apiCache[cacheKey];
      if (entry && Date.now() - entry.timestamp < cacheTime) {
        setData(entry.data);
        setIsLoading(false);
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      if (cacheKey) {
        apiCache[cacheKey] = { data: result, timestamp: Date.now() };
      }
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setError(errorObject);
      if (onError) onError(errorObject);
    } finally {
      setIsLoading(false);
    }
  }, [...dependencies, cacheKey, cacheTime]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch, setData };
}

