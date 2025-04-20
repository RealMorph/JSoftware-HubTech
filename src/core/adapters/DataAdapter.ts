/**
 * Unified Data Adapter Interface
 * 
 * This file defines the common interface that all data adapters must implement.
 * It provides a standardized way to interact with different data sources, whether
 * they're REST APIs, GraphQL endpoints, Firebase, or other sources.
 */

// Supported adapter types
export type AdapterType = 'rest' | 'firebase' | 'graphql' | 'mock';

// Generic request options interface
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached';
  timeout?: number;
  signal?: AbortSignal;
  credentials?: 'include' | 'omit' | 'same-origin';
}

// Generic response interface
export interface ResponseData<T> {
  data: T;
  meta?: {
    status: number;
    message?: string;
    timestamp?: number;
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    version?: string;
  };
}

// Pagination request parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

// Filtering parameters
export interface FilterParams {
  filters?: Record<string, any>;
  search?: string;
  sort?: string | string[];
  sortDirection?: 'asc' | 'desc';
}

// Combined request parameters
export interface DataRequestParams extends PaginationParams, FilterParams {
  select?: string | string[];
  include?: string | string[];
  fields?: string | string[];
  expand?: string | string[];
  groupBy?: string | string[];
}

/**
 * DataAdapter interface provides a unified approach to data operations
 * across different data sources.
 */
export interface DataAdapter {
  // Basic CRUD operations
  get<T>(endpoint: string, options?: RequestOptions): Promise<ResponseData<T>>;
  list<T>(endpoint: string, params?: DataRequestParams, options?: RequestOptions): Promise<ResponseData<T[]>>;
  create<T, D = any>(endpoint: string, data: D, options?: RequestOptions): Promise<ResponseData<T>>;
  update<T, D = any>(endpoint: string, id: string | number, data: D, options?: RequestOptions): Promise<ResponseData<T>>;
  patch<T, D = any>(endpoint: string, id: string | number, data: Partial<D>, options?: RequestOptions): Promise<ResponseData<T>>;
  remove<T>(endpoint: string, id: string | number, options?: RequestOptions): Promise<ResponseData<T>>;
  
  // Batch operations
  batchGet<T>(endpoint: string, ids: (string | number)[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  batchCreate<T, D = any>(endpoint: string, data: D[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  batchUpdate<T, D = any>(endpoint: string, data: (D & { id: string | number })[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  batchRemove<T>(endpoint: string, ids: (string | number)[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  
  // Cache operations
  clearCache(endpoint?: string): Promise<void>;
  invalidateCache(endpoint: string, id?: string | number): Promise<void>;
  
  // Offline support
  isOnline(): boolean;
  syncOfflineData(): Promise<void>;
  enableOfflineMode(enabled: boolean): void;
  
  // Data transformation
  transform<T, R>(data: T, transformFn: (data: T) => R): R;
  
  // Adapter configuration
  configure(config: Record<string, any>): void;
  getBaseUrl(): string;
  setBaseUrl(url: string): void;
  
  // Error handling
  handleError(error: any): Promise<never>;
}

/**
 * Abstract base class that provides some common functionality for data adapters
 */
export abstract class BaseDataAdapter implements DataAdapter {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected offlineEnabled: boolean = false;
  
  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }
  
  abstract get<T>(endpoint: string, options?: RequestOptions): Promise<ResponseData<T>>;
  abstract list<T>(endpoint: string, params?: DataRequestParams, options?: RequestOptions): Promise<ResponseData<T[]>>;
  abstract create<T, D = any>(endpoint: string, data: D, options?: RequestOptions): Promise<ResponseData<T>>;
  abstract update<T, D = any>(endpoint: string, id: string | number, data: D, options?: RequestOptions): Promise<ResponseData<T>>;
  abstract patch<T, D = any>(endpoint: string, id: string | number, data: Partial<D>, options?: RequestOptions): Promise<ResponseData<T>>;
  abstract remove<T>(endpoint: string, id: string | number, options?: RequestOptions): Promise<ResponseData<T>>;
  abstract batchGet<T>(endpoint: string, ids: (string | number)[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  abstract batchCreate<T, D = any>(endpoint: string, data: D[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  abstract batchUpdate<T, D = any>(endpoint: string, data: (D & { id: string | number })[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  abstract batchRemove<T>(endpoint: string, ids: (string | number)[], options?: RequestOptions): Promise<ResponseData<T[]>>;
  abstract clearCache(endpoint?: string): Promise<void>;
  abstract invalidateCache(endpoint: string, id?: string | number): Promise<void>;
  abstract syncOfflineData(): Promise<void>;
  
  // Common implementation for all adapters
  isOnline(): boolean {
    return navigator.onLine;
  }
  
  enableOfflineMode(enabled: boolean): void {
    this.offlineEnabled = enabled;
  }
  
  transform<T, R>(data: T, transformFn: (data: T) => R): R {
    return transformFn(data);
  }
  
  configure(config: Record<string, any>): void {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    
    if (config.headers) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        ...config.headers
      };
    }
    
    if (config.offlineEnabled !== undefined) {
      this.offlineEnabled = config.offlineEnabled;
    }
  }
  
  getBaseUrl(): string {
    return this.baseUrl;
  }
  
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
  
  handleError(error: any): Promise<never> {
    console.error('Data adapter error:', error);
    return Promise.reject(error);
  }
} 