import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { FirestoreService } from '../firebase';

/**
 * Custom hook for querying Firestore documents with React Query
 */
export function useFirestoreQuery<T>(
  collectionName: string,
  queryKey: QueryKey,
  queryFilters?: any[],
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    onSuccess?: (data: T[]) => void;
    onError?: (error: Error) => void;
  }
) {
  const firestoreService = FirestoreService.getInstance();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (queryFilters && queryFilters.length > 0) {
        return await firestoreService.queryDocuments<T>(collectionName, queryFilters);
      }
      return await firestoreService.getAllDocuments<T>(collectionName);
    },
    ...options
  });
}

/**
 * Custom hook for querying a single Firestore document with React Query
 */
export function useFirestoreDocument<T>(
  collectionName: string,
  documentId: string,
  queryKey: QueryKey,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    onSuccess?: (data: T | null) => void;
    onError?: (error: Error) => void;
  }
) {
  const firestoreService = FirestoreService.getInstance();

  return useQuery({
    queryKey,
    queryFn: async () => {
      return await firestoreService.getDocumentData<T>(collectionName, documentId);
    },
    enabled: !!documentId && (options?.enabled !== false),
    ...options
  });
}

/**
 * Custom hook for creating a Firestore document with React Query mutation
 */
export function useCreateDocument<T extends { id?: string }>(
  collectionName: string,
  queryKeyToInvalidate: QueryKey,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const firestoreService = FirestoreService.getInstance();

  return useMutation({
    mutationFn: async (input: Omit<T, 'id'>) => {
      return await firestoreService.addDocument(collectionName, input) as T;
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      if (options?.onSuccess) options.onSuccess(data);
    },
    onError: options?.onError
  });
}

/**
 * Custom hook for updating a Firestore document with React Query mutation
 */
export function useUpdateDocument<T>(
  collectionName: string,
  queryKeyToInvalidate: QueryKey,
  options?: {
    onSuccess?: (data: void) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const firestoreService = FirestoreService.getInstance();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      await firestoreService.updateDocument(collectionName, id, data);
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      if (options?.onSuccess) options.onSuccess();
    },
    onError: options?.onError
  });
}

/**
 * Custom hook for deleting a Firestore document with React Query mutation
 */
export function useDeleteDocument(
  collectionName: string,
  queryKeyToInvalidate: QueryKey,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const firestoreService = FirestoreService.getInstance();

  return useMutation({
    mutationFn: async (id: string) => {
      await firestoreService.deleteDocument(collectionName, id);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      if (options?.onSuccess) options.onSuccess();
    },
    onError: options?.onError
  });
} 