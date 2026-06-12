import { useState, useEffect, useCallback, useRef } from 'react';

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
  
  // Store dynamic callbacks in refs to avoid triggering re-renders or dependencies cycles
  const apiCallRef = useRef(apiCall);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    apiCallRef.current = apiCall;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  // Serialize dependencies to have a single stable primitive value for dependency arrays
  const serializedDeps = JSON.stringify(dependencies);

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

  // Sync state if cacheKey or dependencies change
  const [prevCacheKey, setPrevCacheKey] = useState<string | undefined>(cacheKey);
  const [prevSerializedDeps, setPrevSerializedDeps] = useState<string>(serializedDeps);

  if (cacheKey !== prevCacheKey || serializedDeps !== prevSerializedDeps) {
    setPrevCacheKey(cacheKey);
    setPrevSerializedDeps(serializedDeps);
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
      const result = await apiCallRef.current();
      setData(result);
      if (cacheKey) {
        apiCache[cacheKey] = { data: result, timestamp: Date.now() };
      }
      if (onSuccessRef.current) onSuccessRef.current(result);
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setError(errorObject);
      if (onErrorRef.current) onErrorRef.current(errorObject);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, cacheTime]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData, serializedDeps]); // Refetches when dependencies serialize value changes

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch, setData };
}


