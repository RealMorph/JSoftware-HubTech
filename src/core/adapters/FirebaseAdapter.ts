/**
 * Firebase Adapter Implementation
 * 
 * This file implements the DataAdapter interface for Firebase Firestore database.
 * It provides standardized methods to interact with Firestore using the Firebase SDK.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getCountFromServer,
  documentId,
  QueryConstraint,
  Firestore
} from 'firebase/firestore';

import { 
  DataAdapter, 
  BaseDataAdapter, 
  RequestOptions, 
  ResponseData, 
  DataRequestParams,
  PaginationParams,
  FilterParams
} from './DataAdapter';

/**
 * Configuration for offline persistence
 */
interface OfflineConfig {
  enabled: boolean;
  persistenceKey?: string;
}

/**
 * Implementation of DataAdapter for Firebase Firestore
 */
export class FirebaseAdapter extends BaseDataAdapter implements DataAdapter {
  private db: Firestore;
  private offlineConfig: OfflineConfig;
  private pendingOperations: Array<{
    type: 'create' | 'update' | 'patch' | 'remove';
    collectionPath: string;
    id?: string;
    data?: any;
    timestamp: number;
  }> = [];
  
  constructor(
    firestore: Firestore,
    defaultHeaders: Record<string, string> = {},
    offlineConfig: Partial<OfflineConfig> = {}
  ) {
    // We don't need baseUrl for Firebase, but we need to provide something
    super('firebase://', defaultHeaders);
    
    this.db = firestore;
    this.offlineConfig = {
      enabled: true,
      ...offlineConfig
    };
    
    // Load any pending operations from storage
    this.loadPendingOperations();
    
    // Set up event listeners for online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
  }
  
  /**
   * Handle online event
   */
  private handleOnline(): void {
    if (this.offlineEnabled) {
      this.syncOfflineData();
    }
  }
  
  /**
   * Store a pending operation for offline mode
   */
  private storePendingOperation(
    type: 'create' | 'update' | 'patch' | 'remove',
    collectionPath: string,
    id?: string,
    data?: any
  ): void {
    this.pendingOperations.push({
      type,
      collectionPath,
      id,
      data,
      timestamp: Date.now()
    });
    
    // Store in localStorage
    this.savePendingOperations();
  }
  
  /**
   * Save pending operations to localStorage
   */
  private savePendingOperations(): void {
    try {
      localStorage.setItem('firebase-pending-operations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.warn('Failed to store pending operations:', error);
    }
  }
  
  /**
   * Load pending operations from localStorage
   */
  private loadPendingOperations(): void {
    try {
      const stored = localStorage.getItem('firebase-pending-operations');
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load pending operations:', error);
    }
  }
  
  /**
   * Clear pending operations
   */
  private clearPendingOperations(): void {
    this.pendingOperations = [];
    localStorage.removeItem('firebase-pending-operations');
  }
  
  /**
   * Convert DataRequestParams to Firestore query constraints
   */
  private getQueryConstraints(params?: DataRequestParams): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    
    if (!params) return constraints;
    
    // Handle filtering
    if (params.filters && typeof params.filters === 'object') {
      Object.entries(params.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          constraints.push(where(field, '==', value));
        }
      });
    }
    
    // Handle search (if simple field search)
    if (params.search && typeof params.search === 'string' && params.search.includes(':')) {
      const [field, value] = params.search.split(':');
      if (field && value) {
        constraints.push(where(field, '==', value.trim()));
      }
    }
    
    // Handle sorting
    if (params.sort) {
      const direction = params.sortDirection === 'desc' ? 'desc' : 'asc';
      if (Array.isArray(params.sort)) {
        params.sort.forEach(field => {
          constraints.push(orderBy(field, direction));
        });
      } else {
        constraints.push(orderBy(params.sort, direction));
      }
    }
    
    // Handle pagination
    if (params.limit !== undefined) {
      constraints.push(limit(params.limit));
    }
    
    return constraints;
  }
  
  /**
   * Convert Firestore document to standard response
   */
  private documentToResponse<T>(document: any): T {
    if (!document.exists) return null as unknown as T;
    
    return {
      id: document.id,
      ...document.data()
    } as unknown as T;
  }
  
  /**
   * Convert Firestore query result to standard response
   */
  private async queryToResponse<T>(
    collectionPath: string,
    queryResult: any,
    params?: DataRequestParams
  ): Promise<ResponseData<T[]>> {
    const documents = queryResult.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const meta: ResponseData<T[]>['meta'] = {
      status: 200,
      timestamp: Date.now()
    };
    
    // If pagination was requested, add count information
    if (params?.page !== undefined || params?.pageSize !== undefined) {
      try {
        // Get total count for pagination
        const countSnapshot = await getCountFromServer(collection(this.db, collectionPath));
        const total = countSnapshot.data().count;
        
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        
        meta.pagination = {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        };
      } catch (error) {
        console.warn('Failed to get collection count:', error);
      }
    }
    
    return {
      data: documents as T[],
      meta
    };
  }
  
  // DataAdapter interface implementation
  
  /**
   * Get a single document by path and ID
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ResponseData<T>> {
    try {
      // Extract document ID from endpoint if it contains a slash
      let collectionPath = endpoint;
      let documentId: string | undefined;
      
      if (endpoint.includes('/')) {
        const parts = endpoint.split('/');
        documentId = parts.pop();
        collectionPath = parts.join('/');
      }
      
      if (!documentId) {
        throw new Error('Document ID is required to get a single document');
      }
      
      const docRef = doc(this.db, collectionPath, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          data: null as unknown as T,
          meta: {
            status: 404,
            message: 'Document not found',
            timestamp: Date.now()
          }
        };
      }
      
      return {
        data: this.documentToResponse<T>(docSnap),
        meta: {
          status: 200,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Get a list of documents from a collection
   */
  async list<T>(
    endpoint: string,
    params?: DataRequestParams,
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    try {
      const collectionRef = collection(this.db, endpoint);
      const constraints = this.getQueryConstraints(params);
      
      const q = constraints.length > 0
        ? query(collectionRef, ...constraints)
        : collectionRef;
      
      const querySnapshot = await getDocs(q);
      
      return this.queryToResponse<T>(endpoint, querySnapshot, params);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Create a new document in a collection
   */
  async create<T, D = any>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        this.storePendingOperation('create', endpoint, undefined, data);
        
        // Return a mock response for offline mode
        return {
          data: {
            id: `temp-${Date.now()}`,
            ...data
          } as unknown as T,
          meta: {
            status: 202,
            message: 'Document creation queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      const collectionRef = collection(this.db, endpoint);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Fetch the created document to return it
      const docSnap = await getDoc(docRef);
      
      return {
        data: this.documentToResponse<T>(docSnap),
        meta: {
          status: 201,
          message: 'Document created successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Update a document (overwrite)
   */
  async update<T, D = any>(
    endpoint: string,
    id: string | number,
    data: D,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        this.storePendingOperation('update', endpoint, id.toString(), data);
        
        // Return a mock response for offline mode
        return {
          data: {
            id,
            ...data,
            updatedAt: new Date().toISOString()
          } as unknown as T,
          meta: {
            status: 202,
            message: 'Document update queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      const docRef = doc(this.db, endpoint, id.toString());
      
      // Add timestamp
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      // Fetch the updated document to return it
      const docSnap = await getDoc(docRef);
      
      return {
        data: this.documentToResponse<T>(docSnap),
        meta: {
          status: 200,
          message: 'Document updated successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Partially update a document
   */
  async patch<T, D = any>(
    endpoint: string,
    id: string | number,
    data: Partial<D>,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        this.storePendingOperation('patch', endpoint, id.toString(), data);
        
        // Return a mock response for offline mode
        return {
          data: {
            id,
            ...data,
            updatedAt: new Date().toISOString()
          } as unknown as T,
          meta: {
            status: 202,
            message: 'Document patch queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      const docRef = doc(this.db, endpoint, id.toString());
      
      // Add timestamp
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      // Fetch the updated document to return it
      const docSnap = await getDoc(docRef);
      
      return {
        data: this.documentToResponse<T>(docSnap),
        meta: {
          status: 200,
          message: 'Document patched successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Delete a document
   */
  async remove<T>(
    endpoint: string,
    id: string | number,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        this.storePendingOperation('remove', endpoint, id.toString());
        
        // Return a mock response for offline mode
        return {
          data: { id } as unknown as T,
          meta: {
            status: 202,
            message: 'Document deletion queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      const docRef = doc(this.db, endpoint, id.toString());
      
      // Get the document before deleting it to return its data
      const docSnap = await getDoc(docRef);
      const data = this.documentToResponse<T>(docSnap);
      
      // Delete the document
      await deleteDoc(docRef);
      
      return {
        data,
        meta: {
          status: 200,
          message: 'Document deleted successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Get multiple documents by IDs
   */
  async batchGet<T>(
    endpoint: string,
    ids: (string | number)[],
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    try {
      if (ids.length === 0) {
        return {
          data: [],
          meta: {
            status: 200,
            timestamp: Date.now()
          }
        };
      }
      
      const collectionRef = collection(this.db, endpoint);
      const constraints = [where(documentId(), 'in', ids.map(id => id.toString()))];
      
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return this.queryToResponse<T>(endpoint, querySnapshot);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Create multiple documents
   */
  async batchCreate<T, D = any>(
    endpoint: string,
    data: D[],
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        // Queue each creation individually
        data.forEach(item => {
          this.storePendingOperation('create', endpoint, undefined, item);
        });
        
        // Return a mock response for offline mode
        const mockData = data.map((item, index) => ({
          id: `temp-${Date.now()}-${index}`,
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        return {
          data: mockData as unknown as T[],
          meta: {
            status: 202,
            message: 'Batch creation queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      const collectionRef = collection(this.db, endpoint);
      const createdDocs: T[] = [];
      
      // Firestore doesn't have a native batch create API that returns IDs,
      // so we need to create documents one by one
      for (const item of data) {
        const docRef = await addDoc(collectionRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        const docSnap = await getDoc(docRef);
        createdDocs.push(this.documentToResponse<T>(docSnap));
      }
      
      return {
        data: createdDocs,
        meta: {
          status: 201,
          message: 'Documents created successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Update multiple documents
   */
  async batchUpdate<T, D = any>(
    endpoint: string,
    data: (D & { id: string | number })[],
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        // Queue each update individually
        data.forEach(item => {
          const { id, ...rest } = item;
          this.storePendingOperation('update', endpoint, id.toString(), rest);
        });
        
        // Return a mock response for offline mode
        const mockData = data.map(item => ({
          ...item,
          updatedAt: new Date().toISOString()
        }));
        
        return {
          data: mockData as unknown as T[],
          meta: {
            status: 202,
            message: 'Batch update queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      const updatedDocs: T[] = [];
      
      // Firestore doesn't have a native batch update API that returns data,
      // so we need to update documents one by one
      for (const item of data) {
        const { id, ...rest } = item;
        const docRef = doc(this.db, endpoint, id.toString());
        
        await setDoc(docRef, {
          ...rest,
          updatedAt: new Date().toISOString()
        });
        
        const docSnap = await getDoc(docRef);
        updatedDocs.push(this.documentToResponse<T>(docSnap));
      }
      
      return {
        data: updatedDocs,
        meta: {
          status: 200,
          message: 'Documents updated successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Delete multiple documents
   */
  async batchRemove<T>(
    endpoint: string,
    ids: (string | number)[],
    options?: RequestOptions
  ): Promise<ResponseData<T[]>> {
    try {
      // Check if we're offline
      if (!this.isOnline() && this.offlineEnabled) {
        // Queue each deletion individually
        ids.forEach(id => {
          this.storePendingOperation('remove', endpoint, id.toString());
        });
        
        // Return a mock response for offline mode
        const mockData = ids.map(id => ({ id }));
        
        return {
          data: mockData as unknown as T[],
          meta: {
            status: 202,
            message: 'Batch deletion queued for when online',
            timestamp: Date.now()
          }
        };
      }
      
      // First get all documents to be deleted
      const result = await this.batchGet<T>(endpoint, ids, options);
      const docsToDelete = result.data;
      
      // Delete each document
      for (const id of ids) {
        const docRef = doc(this.db, endpoint, id.toString());
        await deleteDoc(docRef);
      }
      
      return {
        data: docsToDelete,
        meta: {
          status: 200,
          message: 'Documents deleted successfully',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Clear cache - Firestore handles its own caching, so this is a no-op
   */
  async clearCache(endpoint?: string): Promise<void> {
    // Firebase handles its own caching - nothing to do here
    return Promise.resolve();
  }
  
  /**
   * Invalidate cache - Firestore handles its own caching, so this is a no-op
   */
  async invalidateCache(endpoint: string, id?: string | number): Promise<void> {
    // Firebase handles its own caching - nothing to do here
    return Promise.resolve();
  }
  
  /**
   * Synchronize offline data with the server
   */
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline() || !this.offlineEnabled || this.pendingOperations.length === 0) {
      return;
    }
    
    console.log(`Syncing ${this.pendingOperations.length} offline operations with Firebase...`);
    
    // Process the queue in order
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    this.clearPendingOperations();
    
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'create':
            await this.create(operation.collectionPath, operation.data);
            break;
          case 'update':
            await this.update(operation.collectionPath, operation.id!, operation.data);
            break;
          case 'patch':
            await this.patch(operation.collectionPath, operation.id!, operation.data);
            break;
          case 'remove':
            await this.remove(operation.collectionPath, operation.id!);
            break;
        }
        
        console.log(`Successfully synced offline operation: ${operation.type} ${operation.collectionPath}`);
      } catch (error) {
        console.error(`Failed to sync offline operation: ${operation.type} ${operation.collectionPath}`, error);
        
        // Re-add to queue if it failed
        this.pendingOperations.push(operation);
      }
    }
    
    // Save any remaining operations
    if (this.pendingOperations.length > 0) {
      this.savePendingOperations();
    }
    
    console.log(`Firebase offline sync complete. ${this.pendingOperations.length} operations remaining.`);
  }
  
  /**
   * Override error handling to provide Firebase-specific error messages
   */
  handleError(error: any): Promise<never> {
    console.error('Firebase adapter error:', error);
    
    // Try to extract useful information from Firebase errors
    const errorCode = error.code || 'unknown-error';
    const errorMessage = error.message || 'An unknown error occurred';
    
    // Format the error in our standard way
    const formattedError = {
      status: 500,
      data: {
        message: errorMessage,
        code: errorCode
      }
    };
    
    return Promise.reject(formattedError);
  }
} 