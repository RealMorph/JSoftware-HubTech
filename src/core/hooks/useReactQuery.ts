import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey
} from '@tanstack/react-query';

/**
 * Enhanced React Query hook for data fetching
 * @param queryKey - Query key for caching
 * @param fetchFn - Function to fetch data
 * @param options - Additional query options
 */
export function useFetch<TData, TError = Error>(
  queryKey: QueryKey, 
  fetchFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: fetchFn,
    ...options
  });
}

/**
 * Enhanced React Query hook for data mutations (create, update, delete)
 * @param mutationFn - Function to perform the mutation
 * @param options - Additional mutation options
 * @param invalidateQueries - Query keys to invalidate after successful mutation
 */
export function useDataMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
  invalidateQueries?: QueryKey[]
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context) => {
      // Run the provided onSuccess if it exists
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
      
      // Invalidate relevant queries if specified
      if (invalidateQueries && invalidateQueries.length > 0) {
        await Promise.all(
          invalidateQueries.map(queryKey => 
            queryClient.invalidateQueries({ queryKey })
          )
        );
      }
    }
  });
}

/**
 * Hook to invalidate multiple queries at once
 */
export function useQueryInvalidation() {
  const queryClient = useQueryClient();
  
  return {
    invalidateQueries: (queryKeys: QueryKey[]) => {
      return Promise.all(
        queryKeys.map(queryKey => 
          queryClient.invalidateQueries({ queryKey })
        )
      );
    },
    setQueryData: <T>(queryKey: QueryKey, updater: T | ((oldData: T | undefined) => T)) => {
      queryClient.setQueryData(queryKey, updater);
    },
    getQueryData: <T>(queryKey: QueryKey): T | undefined => {
      return queryClient.getQueryData<T>(queryKey);
    }
  };
}

/**
 * Hook for infinite query pagination
 */
export function useQueryCache() {
  const queryClient = useQueryClient();
  
  return {
    clearCache: () => queryClient.clear(),
    removeQuery: (queryKey: QueryKey) => queryClient.removeQueries({ queryKey }),
    prefetchQuery: async <T>(
      queryKey: QueryKey,
      fetchFn: () => Promise<T>,
      options?: UseQueryOptions<T, Error, T>
    ) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: fetchFn,
        ...options
      });
    }
  };
} 