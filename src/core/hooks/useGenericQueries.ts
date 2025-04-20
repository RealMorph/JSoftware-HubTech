import { 
  useQuery, 
  useMutation,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
  QueryClient,
  InfiniteData
} from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Base interface for all API responses
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Interface for paginated API responses
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
}

/**
 * Type for API fetcher functions
 */
export type ApiFetcher<TData, TParams = void> = 
  (params: TParams) => Promise<TData>;

/**
 * Hook for fetching data from an API
 * @param key The cache key for the query
 * @param fetcher The function to fetch the data
 * @param params Optional parameters for the fetcher
 * @param options React Query options
 */
export function useApiQuery<
  TData,
  TParams extends Record<string, unknown> = Record<string, never>
>(
  key: string | readonly unknown[],
  fetcher: ApiFetcher<TData, TParams>,
  params: TParams,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const { currentUser } = useAuth();
  
  // Build the query key
  const queryKey = Array.isArray(key) 
    ? [...key, params, currentUser?.uid].filter(Boolean)
    : [key, params, currentUser?.uid].filter(Boolean);

  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => fetcher(params),
    ...options,
  });
}

/**
 * Hook for mutating data via an API
 * @param key The cache key for the mutation
 * @param mutator The function to perform the mutation
 * @param options React Query options
 */
export function useApiMutation<TData, TVariables>(
  key: string | readonly unknown[],
  mutator: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: mutator,
    ...options,
  });
}

/**
 * Hook for fetching paginated data from an API
 * @param key The cache key for the query
 * @param fetcher The function to fetch the data
 * @param params Optional parameters for the fetcher
 * @param options React Query options
 */
export function useApiInfiniteQuery<
  TData,
  TParams extends Record<string, unknown> = { page: number; pageSize: number }
>(
  key: string | readonly unknown[],
  fetcher: (params: TParams) => Promise<PaginatedApiResponse<TData>>,
  initialParams: TParams,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedApiResponse<TData>, 
      Error, 
      InfiniteData<PaginatedApiResponse<TData>>, 
      PaginatedApiResponse<TData>, 
      readonly unknown[]
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  const { currentUser } = useAuth();
  
  // Build the query key
  const queryKey = Array.isArray(key) 
    ? [...key, initialParams, currentUser?.uid].filter(Boolean)
    : [key, initialParams, currentUser?.uid].filter(Boolean);

  return useInfiniteQuery<PaginatedApiResponse<TData>, Error>({
    queryKey,
    queryFn: ({ pageParam }) => {
      const params = {
        ...initialParams,
        page: pageParam || 1,
      } as TParams;
      
      return fetcher(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    ...options,
  });
}

/**
 * Helper function to invalidate queries by prefix
 * @param queryClient The React Query client
 * @param prefix The query key prefix to invalidate
 */
export function invalidateQueriesByPrefix(
  queryClient: QueryClient,
  prefix: string
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: [prefix] });
}

/**
 * Hook factory for creating entity-specific query hooks
 * @param prefix The prefix for the query keys
 * @param fetchers Object containing the fetchers for the entity
 */
export function createEntityHooks<
  TEntity,
  TListParams extends Record<string, unknown> = Record<string, never>,
  TDetailParams extends Record<string, unknown> = { id: string | number },
  TCreateParams extends Record<string, unknown> = Partial<TEntity>,
  TUpdateParams extends Record<string, unknown> = Partial<TEntity> & { id: string | number }
>(
  prefix: string,
  fetchers: {
    list: (params: TListParams) => Promise<PaginatedApiResponse<TEntity>>;
    detail: (params: TDetailParams) => Promise<ApiResponse<TEntity>>;
    create: (params: TCreateParams) => Promise<ApiResponse<TEntity>>;
    update: (params: TUpdateParams) => Promise<ApiResponse<TEntity>>;
    remove: (id: string | number) => Promise<ApiResponse<{ success: boolean }>>;
  }
) {
  // Hook for fetching a list of entities
  const useList = (
    params: TListParams,
    options?: Omit<UseQueryOptions<PaginatedApiResponse<TEntity>, Error>, 'queryKey' | 'queryFn'>
  ) => useApiQuery<PaginatedApiResponse<TEntity>, TListParams>(
    [prefix, 'list'],
    fetchers.list,
    params,
    options
  );
  
  // Hook for fetching an entity by ID
  const useDetail = (
    params: TDetailParams,
    options?: Omit<UseQueryOptions<ApiResponse<TEntity>, Error>, 'queryKey' | 'queryFn'>
  ) => useApiQuery<ApiResponse<TEntity>, TDetailParams>(
    [prefix, 'detail', params.id],
    fetchers.detail,
    params,
    options
  );
  
  // Hook for infinite scrolling list of entities
  const useInfiniteList = (
    params: TListParams & { pageSize: number },
    options?: Omit<
      UseInfiniteQueryOptions<
        PaginatedApiResponse<TEntity>,
        Error,
        InfiniteData<PaginatedApiResponse<TEntity>>,
        PaginatedApiResponse<TEntity>,
        readonly unknown[]
      >,
      'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
    >
  ) => useApiInfiniteQuery<TEntity, TListParams & { page: number; pageSize: number }>(
    [prefix, 'list', 'infinite'],
    fetchers.list,
    { ...params, page: 1 } as TListParams & { page: number; pageSize: number },
    options
  );
  
  // Hook for creating a new entity
  const useCreate = (
    options?: Omit<UseMutationOptions<ApiResponse<TEntity>, Error, TCreateParams>, 'mutationFn'>
  ) => useApiMutation<ApiResponse<TEntity>, TCreateParams>(
    [prefix, 'create'],
    fetchers.create,
    options
  );
  
  // Hook for updating an entity
  const useUpdate = (
    options?: Omit<UseMutationOptions<ApiResponse<TEntity>, Error, TUpdateParams>, 'mutationFn'>
  ) => useApiMutation<ApiResponse<TEntity>, TUpdateParams>(
    [prefix, 'update'],
    fetchers.update,
    options
  );
  
  // Hook for removing an entity
  const useRemove = (
    options?: Omit<UseMutationOptions<ApiResponse<{ success: boolean }>, Error, string | number>, 'mutationFn'>
  ) => useApiMutation<ApiResponse<{ success: boolean }>, string | number>(
    [prefix, 'remove'],
    fetchers.remove,
    options
  );
  
  return {
    useList,
    useDetail,
    useInfiniteList,
    useCreate,
    useUpdate,
    useRemove,
  };
} 