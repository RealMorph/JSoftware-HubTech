import { 
  useQuery, 
  UseQueryOptions, 
  useMutation, 
  UseMutationOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData
} from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { gqlFetcher } from '../graphql/client';

/**
 * Hook for using GraphQL queries with React Query
 * @param query GraphQL query string
 * @param variables Query variables
 * @param options React Query options
 */
export function useGraphQLQuery<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const { currentUser } = useAuth();
  const queryKey = currentUser?.uid 
    ? [`graphql:${query}`, variables, currentUser.uid]
    : [`graphql:${query}`, variables];
  
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      const token = currentUser?.uid ? await currentUser.getIdToken() : undefined;
      const fetchFn = gqlFetcher<TData, TVariables>(query, variables, token);
      return fetchFn();
    },
    ...options,
  });
}

/**
 * Hook for using GraphQL mutations with React Query
 * @param mutation GraphQL mutation string
 * @param options React Query mutation options
 */
export function useGraphQLMutation<TData, TVariables extends Record<string, unknown>>(
  mutation: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { currentUser } = useAuth();
  
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const token = currentUser?.uid ? await currentUser.getIdToken() : undefined;
      const fetchFn = gqlFetcher<TData, TVariables>(mutation, variables, token);
      return fetchFn();
    },
    ...options,
  });
}

/**
 * Interface for paginated GraphQL responses
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

/**
 * Hook for using infinite GraphQL queries with React Query
 * @param query GraphQL query string
 * @param getNextPageParam Function to extract the next page parameter
 * @param variables Query variables
 * @param options React Query infinite query options
 */
export function useGraphQLInfiniteQuery<
  TData extends PaginatedResponse<any>,
  TVariables extends Record<string, unknown> = Record<string, never>
>(
  query: string,
  getNextPageParam: (lastPage: TData) => string | null | undefined,
  initialVariables?: Omit<TVariables, 'cursor'>,
  options?: Omit<
    UseInfiniteQueryOptions<TData, Error, InfiniteData<TData>, TData, readonly unknown[]>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  const { currentUser } = useAuth();
  const queryKey = currentUser?.uid 
    ? [`graphql:infinite:${query}`, initialVariables, currentUser.uid]
    : [`graphql:infinite:${query}`, initialVariables];

  return useInfiniteQuery<TData, Error>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const token = currentUser?.uid ? await currentUser.getIdToken() : undefined;
      const variables = {
        ...(initialVariables || {}),
        ...(pageParam ? { cursor: pageParam } : {}),
      } as TVariables;
      
      const fetchFn = gqlFetcher<TData, TVariables>(query, variables, token);
      return fetchFn();
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    ...options,
  });
}

/**
 * Helper function to create a custom GraphQL hook for a specific query
 * @param query The GraphQL query
 */
export function createQueryHook<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string
) {
  return (
    variables?: TVariables,
    options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
  ) => useGraphQLQuery<TData, TVariables>(query, variables, options);
}

/**
 * Helper function to create a custom GraphQL hook for a specific mutation
 * @param mutation The GraphQL mutation
 */
export function createMutationHook<TData, TVariables extends Record<string, unknown>>(
  mutation: string
) {
  return (
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
  ) => useGraphQLMutation<TData, TVariables>(mutation, options);
} 