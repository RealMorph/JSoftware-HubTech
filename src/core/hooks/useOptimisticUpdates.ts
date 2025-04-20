import { QueryClient } from '@tanstack/react-query';

/**
 * Helper function to perform optimistic updates with React Query
 * 
 * @param queryClient The React Query client
 * @param queryKey The query key to update
 * @param updateFn Function that updates the cached data optimistically
 * @param rollbackFn Optional function to run if the mutation fails
 */
export function performOptimisticUpdate<TData>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updateFn: (oldData: TData | undefined) => TData,
  rollbackFn?: (error: Error) => void
): {
  onMutate: () => Promise<{ previousData: TData | undefined }>;
  onError: (error: Error, variables: unknown, context: { previousData: TData | undefined } | undefined) => void;
  onSettled: () => Promise<void>;
} {
  return {
    // When the mutation starts
    onMutate: async () => {
      // Cancel any outgoing refetches 
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // Optimistically update the cache
      queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old));
      
      // Return context with the previous data
      return { previousData };
    },
    
    // If the mutation fails, roll back
    onError: (error, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData<TData>(queryKey, context.previousData);
      }
      if (rollbackFn) {
        rollbackFn(error);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  };
}

/**
 * Helper function to perform optimistic list updates with React Query
 * 
 * @param queryClient The React Query client
 * @param queryKey The query key to update
 * @param item The item being modified
 * @param mutationType The type of mutation (add, update, remove)
 * @param idField The field to use as the unique identifier
 */
export function performOptimisticListUpdate<TItem extends Record<string, any>>(
  queryClient: QueryClient,
  queryKey: unknown[],
  item: TItem,
  mutationType: 'add' | 'update' | 'remove',
  idField: keyof TItem = 'id'
): {
  onMutate: () => Promise<{ previousData: TItem[] | undefined }>;
  onError: (error: Error, variables: unknown, context: { previousData: TItem[] | undefined } | undefined) => void;
  onSettled: () => Promise<void>;
} {
  return {
    // When the mutation starts
    onMutate: async () => {
      // Cancel any outgoing refetches 
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TItem[]>(queryKey);
      
      // Optimistically update the cache based on the mutation type
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) => {
        if (mutationType === 'add') {
          return [...old, item];
        }
        
        if (mutationType === 'update') {
          return old.map((oldItem) => 
            oldItem[idField] === item[idField] ? item : oldItem
          );
        }
        
        if (mutationType === 'remove') {
          return old.filter((oldItem) => oldItem[idField] !== item[idField]);
        }
        
        return old;
      });
      
      // Return context with the previous data
      return { previousData };
    },
    
    // If the mutation fails, roll back
    onError: (_error, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData<TItem[]>(queryKey, context.previousData);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  };
}

/**
 * Helper function to perform optimistic infinite list updates with React Query
 * 
 * @param queryClient The React Query client
 * @param queryKey The query key to update
 * @param item The item being modified
 * @param mutationType The type of mutation (add, update, remove)
 * @param idField The field to use as the unique identifier
 * @param dataField The field containing the items array in the page data
 */
export function performOptimisticInfiniteListUpdate<
  TItem extends Record<string, any>,
  TData extends Record<string, any>
>(
  queryClient: QueryClient,
  queryKey: unknown[],
  item: TItem,
  mutationType: 'add' | 'update' | 'remove',
  idField: keyof TItem = 'id',
  dataField: keyof TData = 'data' as keyof TData
): {
  onMutate: () => Promise<{ previousData: TData | undefined }>;
  onError: (error: Error, variables: unknown, context: { previousData: TData | undefined } | undefined) => void;
  onSettled: () => Promise<void>;
} {
  return {
    // When the mutation starts
    onMutate: async () => {
      // Cancel any outgoing refetches 
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // Optimistically update the cache based on the mutation type
      queryClient.setQueryData<TData>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        
        // Update the infinite list data structure
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            const items = page[dataField] || [];
            
            let updatedItems;
            if (mutationType === 'add') {
              updatedItems = [...items, item];
            } else if (mutationType === 'update') {
              updatedItems = items.map((oldItem: TItem) => 
                oldItem[idField] === item[idField] ? item : oldItem
              );
            } else if (mutationType === 'remove') {
              updatedItems = items.filter((oldItem: TItem) => 
                oldItem[idField] !== item[idField]
              );
            } else {
              updatedItems = items;
            }
            
            return {
              ...page,
              [dataField]: updatedItems,
            };
          }),
        };
      });
      
      // Return context with the previous data
      return { previousData };
    },
    
    // If the mutation fails, roll back
    onError: (_error, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData<TData>(queryKey, context.previousData);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  };
} 