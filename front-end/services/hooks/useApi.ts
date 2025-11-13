import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for API calls with loading and error states
 * @param apiFunction - The API function to call
 * @param immediate - Whether to execute immediately on mount
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = handleApiError(error);
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Custom hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiFunction: (page: number, ...args: any[]) => Promise<{ data: T[]; hasMore: boolean; total: number }>,
  initialPage = 1
) {
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { data, loading, error, execute } = useApi(apiFunction);

  const loadMore = useCallback(
    async (...args: any[]) => {
      if (!hasMore || loading) return;

      const result = await execute(page, ...args);

      if (result) {
        setAllData((prev) => [...prev, ...result.data]);
        setHasMore(result.hasMore);
        setTotal(result.total);
        setPage((prev) => prev + 1);
      }
    },
    [page, hasMore, loading, execute]
  );

  const reset = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    setTotal(0);
  }, [initialPage]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    reset,
  };
}

