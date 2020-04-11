import { useState, useReducer, useEffect, useCallback } from 'react';

interface ReducerState<V> {
  value: V | null;
  loading: boolean;
  error: Error | null;
}

type ReducerAction<V> =
  | { type: 'INIT' }
  | { type: 'RESET' }
  | { type: 'RESOLVE'; payload: V }
  | { type: 'REJECT'; payload: Error };

export function useAsync<V>(
  asyncFunction: () => Promise<V>,
  dependencies: React.DependencyList = []
): [ReducerState<V>, () => void] {
  const [retryToken, setRetryToken] = useState(Date.now());

  const retry = useCallback(() => {
    dispatch({ type: 'RESET' });
    setRetryToken(Date.now());
  }, []);

  const initialState: ReducerState<V> = {
    error: null,
    loading: false,
    value: null,
  };

  const memoizedReducer = useCallback(
    (state: ReducerState<V>, action: ReducerAction<V>) => {
      switch (action.type) {
        case 'INIT':
          return { ...state, loading: true };
        case 'RESET':
          return initialState;
        case 'RESOLVE':
          return { ...state, loading: false, value: action.payload };
        case 'REJECT':
          return { ...state, loading: false, error: action.payload };
        default:
          throw new Error('Unknown action type.');
      }
    },
    []
  );

  const [state, dispatch] = useReducer(memoizedReducer, initialState);

  useEffect(() => {
    let mounted = true;
    dispatch({ type: 'INIT' });

    if (mounted) {
      asyncFunction().then(
        payload => dispatch({ type: 'RESOLVE', payload }),
        error => dispatch({ type: 'REJECT', payload: error })
      );
    }

    return () => {
      mounted = false;
    };
  }, [...dependencies, retryToken]);

  return [state, retry];
}

export default useAsync;
