import { useState, useCallback, useEffect } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
  autoExecute?: boolean;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: (...params: P) => Promise<T>;
  reset: () => void;
}

/**
 * Custom hook for handling API requests with loading and error states
 * @param apiFunction The API function to call
 * @param options Options for the hook
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const { onSuccess, onError, initialData, autoExecute = false } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(autoExecute);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...params: P): Promise<T> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...params);
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (onError) {
          onError(error);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  // Auto-execute the API call if autoExecute is true
  useEffect(() => {
    if (autoExecute) {
      // Use empty array as parameters, assuming the API function can handle it
      (execute as Function)();
    }
  }, [autoExecute, execute]);

  return { data, loading, error, execute, reset };
}

/**
 * Custom hook for handling API requests with automatic polling
 * @param apiFunction The API function to call
 * @param interval Polling interval in milliseconds
 * @param options Options for the hook
 */
export function usePollingApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>,
  interval: number = 5000,
  options: UseApiOptions<T> & { enabled?: boolean } = {}
): UseApiReturn<T, P> & { stopPolling: () => void; startPolling: () => void } {
  const { enabled = true, ...apiOptions } = options;
  const [polling, setPolling] = useState<boolean>(enabled);
  const api = useApi(apiFunction, { ...apiOptions, autoExecute: enabled });

  const stopPolling = useCallback(() => {
    setPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    setPolling(true);
  }, []);

  useEffect(() => {
    if (!polling) return;

    const poll = async () => {
      try {
        // Call execute without parameters
        await (api.execute as Function)();
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const timer = setInterval(poll, interval);

    return () => {
      clearInterval(timer);
    };
  }, [api, interval, polling]);

  return { ...api, stopPolling, startPolling };
}
