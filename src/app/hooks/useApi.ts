import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook to handle API calls with loading, error, and data states.
 * This ensures consistent data fetching patterns across the entire app.
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, dependencies = [], onSuccess, onError } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setError(errorObject);
      if (onError) onError(errorObject);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData, setData };
}
