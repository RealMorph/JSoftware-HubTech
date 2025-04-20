/**
 * DataProcessor
 * 
 * Provides unified data processing pipelines that combine extraction,
 * transformation, loading, and error handling capabilities.
 * 
 * This module works as a higher-level abstraction over other ETL utilities
 * to provide a comprehensive solution for data processing.
 */

import { TransformerFunction } from './types';
import { DataTransformer } from './DataTransformer';
import { DataValidator } from './DataValidator';
import { DataCompression } from './DataCompression';

/**
 * Configuration for a DataProcessor instance
 */
export interface DataProcessorConfig<TInput, TOutput> {
  /** Unique identifier for this processor */
  id: string;
  
  /** Human-readable name for this processor */
  name: string;
  
  /** Description of this processor's purpose */
  description?: string;
  
  /** Maximum number of retry attempts for failed operations */
  maxRetries?: number;
  
  /** Delay between retry attempts (in milliseconds) */
  retryDelay?: number;
  
  /** Whether to use exponential backoff for retries */
  useExponentialBackoff?: boolean;
  
  /** Whether to cache results */
  cacheResults?: boolean;
  
  /** Time-to-live for cached results (in milliseconds) */
  cacheTTL?: number;
  
  /** Whether to compress data for transfer */
  compressData?: boolean;
  
  /** Compression options if compression is enabled */
  compressionOptions?: any;
  
  /** Functions to transform the data */
  transformers: Array<TransformerFunction<any, any>>;
  
  /** Function to validate the result after transformation */
  validator?: (data: TOutput) => Promise<boolean> | boolean;
  
  /** Function to handle errors */
  errorHandler?: (error: Error, input: TInput) => void;
  
  /** Function called on successful processing */
  onSuccess?: (result: TOutput) => void;
  
  /** Function called on processing failure */
  onFailure?: (error: Error, input: TInput) => void;
  
  /** 
   * Function to generate a cache key from input data
   * If not provided, a default implementation will be used
   */
  cacheKeyGenerator?: (input: TInput) => string;
}

/**
 * Processing result including metadata
 */
export interface ProcessingResult<T> {
  /** The processed data */
  data: T;
  
  /** Whether the processing was successful */
  success: boolean;
  
  /** Error information if processing failed */
  error?: Error;
  
  /** Processing statistics */
  stats: {
    /** Start time of processing */
    startTime: number;
    
    /** End time of processing */
    endTime: number;
    
    /** Duration of processing in milliseconds */
    duration: number;
    
    /** Number of retry attempts if any */
    retryCount: number;
    
    /** Whether the result was served from cache */
    fromCache: boolean;
    
    /** Whether the data was compressed */
    compressed: boolean;
    
    /** Original data size in bytes if compressed */
    originalSize?: number;
    
    /** Compressed data size in bytes if compressed */
    compressedSize?: number;
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Cache entry for processed data
 */
interface CacheEntry<T> {
  /** The processed data */
  data: T;
  
  /** When this entry was created */
  createdAt: number;
  
  /** When this entry expires */
  expiresAt: number;
}

/**
 * Main DataProcessor class that provides unified data processing capabilities
 */
export class DataProcessor<TInput, TOutput> {
  private config: DataProcessorConfig<TInput, TOutput>;
  private pipeline: (data: TInput) => Promise<TOutput>;
  private cache: Map<string, CacheEntry<TOutput>> = new Map();
  
  /**
   * Create a new DataProcessor instance
   */
  constructor(config: DataProcessorConfig<TInput, TOutput>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      useExponentialBackoff: true,
      cacheResults: false,
      cacheTTL: 60 * 60 * 1000, // 1 hour by default
      compressData: false,
      ...config
    };
    
    // Create the processing pipeline
    this.pipeline = DataTransformer.createPipeline({
      name: this.config.name,
      transformers: this.config.transformers,
      validator: this.config.validator,
      errorHandler: this.config.errorHandler,
      onSuccess: this.config.onSuccess,
      onFailure: this.config.onFailure
    });
    
    // Set up cache cleanup
    if (this.config.cacheResults) {
      // Clean expired entries every minute
      setInterval(() => this.cleanExpiredCache(), 60 * 1000);
    }
  }
  
  /**
   * Generate a cache key for the input data
   */
  private generateCacheKey(input: TInput): string {
    if (this.config.cacheKeyGenerator) {
      return this.config.cacheKeyGenerator(input);
    }
    
    // Default cache key generation
    try {
      if (typeof input === 'function') {
        return `fn_${this.config.id}_${Date.now()}`;
      }
      
      if (input === null || input === undefined) {
        return `null_${this.config.id}`;
      }
      
      if (typeof input === 'object') {
        return `obj_${this.config.id}_${JSON.stringify(input)}`;
      }
      
      return `${this.config.id}_${String(input)}`;
    } catch (error) {
      console.warn('Error generating cache key:', error);
      return `${this.config.id}_${Date.now()}_${Math.random()}`;
    }
  }
  
  /**
   * Check if there's a valid cached result for the input
   */
  private getCachedResult(cacheKey: string): TOutput | null {
    if (!this.config.cacheResults) {
      return null;
    }
    
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    
    if (entry.expiresAt < now) {
      // Entry has expired, remove it
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Store a result in the cache
   */
  private cacheResult(cacheKey: string, result: TOutput): void {
    if (!this.config.cacheResults) {
      return;
    }
    
    const now = Date.now();
    const ttl = this.config.cacheTTL || 60 * 60 * 1000; // Default 1 hour
    
    this.cache.set(cacheKey, {
      data: result,
      createdAt: now,
      expiresAt: now + ttl
    });
  }
  
  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`Cleaned ${expiredCount} expired cache entries for ${this.config.name}`);
    }
  }
  
  /**
   * Process data with retry logic, caching, and result metadata
   * @param data The input data or a function that returns the input data
   */
  async process(data: TInput | (() => TInput | Promise<TInput>)): Promise<ProcessingResult<TOutput>> {
    const startTime = Date.now();
    let retryCount = 0;
    let success = false;
    let result: TOutput | null = null;
    let error: Error | null = null;
    let fromCache = false;
    let compressed = false;
    let originalSize: number | undefined;
    let compressedSize: number | undefined;
    
    // Resolve the input data for cache key generation if it's a function
    const inputForCache = typeof data === 'function'
      ? await Promise.resolve((data as Function)())
      : data;
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(inputForCache as TInput);
    
    // Check cache first
    if (this.config.cacheResults) {
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult !== null) {
        console.log(`Cache hit for ${this.config.name} (key: ${cacheKey.substring(0, 20)}...)`);
        fromCache = true;
        success = true;
        result = cachedResult;
        
        // Still call onSuccess if provided
        if (this.config.onSuccess && result) {
          this.config.onSuccess(result);
        }
        
        const endTime = Date.now();
        
        return {
          data: result,
          success: true,
          stats: {
            startTime,
            endTime,
            duration: endTime - startTime,
            retryCount,
            fromCache: true,
            compressed,
            ...(compressed ? { originalSize, compressedSize } : {})
          }
        };
      }
      
      console.log(`Cache miss for ${this.config.name} (key: ${cacheKey.substring(0, 20)}...)`);
    }
    
    // Implement retry logic with exponential backoff
    const maxRetries = this.config.maxRetries || 0;
    const baseDelay = this.config.retryDelay || 1000;
    const useExponentialBackoff = this.config.useExponentialBackoff || false;
    
    let currentAttempt = 0;
    
    while (currentAttempt <= maxRetries) {
      try {
        // If not the first attempt, log retry information
        if (currentAttempt > 0) {
          console.log(`Retry attempt ${currentAttempt}/${maxRetries} for ${this.config.name}`);
          retryCount++;
        }
        
        // Resolve the input data - either use it directly or call the function to get it
        const resolvedData = typeof data === 'function' 
          ? await Promise.resolve((data as Function)())
          : data;
        
        result = await this.pipeline(resolvedData as TInput);
        success = true;
        
        // If successful, cache the result
        if (this.config.cacheResults && result) {
          this.cacheResult(cacheKey, result);
        }
        
        // If successful, exit the retry loop
        break;
      } catch (e) {
        error = e as Error;
        success = false;
        
        // If we've reached the max retries, give up
        if (currentAttempt >= maxRetries) {
          console.error(`All retry attempts failed for ${this.config.name}: ${error.message}`);
          break;
        }
        
        // Calculate delay for next retry attempt
        let delayMs = baseDelay;
        
        if (useExponentialBackoff) {
          // Exponential backoff with jitter: baseDelay * 2^attempt + random(0-100ms)
          delayMs = baseDelay * Math.pow(2, currentAttempt) + Math.random() * 100;
        }
        
        console.log(`Retrying in ${Math.round(delayMs)}ms...`);
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      currentAttempt++;
    }
    
    // TODO: Implement compression if enabled
    
    const endTime = Date.now();
    
    return {
      data: result as TOutput,
      success,
      ...(error ? { error } : {}),
      stats: {
        startTime,
        endTime,
        duration: endTime - startTime,
        retryCount,
        fromCache,
        compressed,
        ...(compressed ? { originalSize, compressedSize } : {})
      }
    };
  }
  
  /**
   * Process multiple items in batch
   */
  async processBatch(items: TInput[]): Promise<ProcessingResult<TOutput>[]> {
    if (items.length === 0) {
      return [];
    }
    
    console.log(`Processing batch of ${items.length} items with ${this.config.name}`);
    
    // Process all items in parallel
    return Promise.all(items.map(item => this.process(item)));
  }
  
  /**
   * Clear any cached results for this processor
   */
  clearCache(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`Cleared ${count} cache entries for ${this.config.name}`);
  }
  
  /**
   * Get statistics about the cache
   */
  getCacheStats(): {
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;
    
    for (const entry of this.cache.values()) {
      if (oldestEntry === null || entry.createdAt < oldestEntry) {
        oldestEntry = entry.createdAt;
      }
      
      if (newestEntry === null || entry.createdAt > newestEntry) {
        newestEntry = entry.createdAt;
      }
    }
    
    return {
      size: this.cache.size,
      oldestEntry,
      newestEntry
    };
  }
  
  /**
   * Get the configuration for this processor
   */
  getConfig(): DataProcessorConfig<TInput, TOutput> {
    return this.config;
  }
}

/**
 * Helper functions for creating common data processors
 */
export const DataProcessors = {
  /**
   * Create a data processor for data extraction and transformation
   */
  createETLProcessor: <TInput, TOutput>(
    config: Omit<DataProcessorConfig<TInput, TOutput>, 'id'> & { id?: string }
  ): DataProcessor<TInput, TOutput> => {
    return new DataProcessor({
      id: `etl-processor-${Date.now()}`,
      ...config
    });
  },
  
  /**
   * Create a data processor optimized for API data extraction
   */
  createAPIProcessor: <TResponse, TOutput>(
    config: Omit<DataProcessorConfig<Promise<TResponse> | (() => Promise<TResponse>), TOutput>, 'id' | 'transformers'> & {
      transformers: Array<TransformerFunction<any, any>>;
      id?: string;
    }
  ): DataProcessor<Promise<TResponse> | (() => Promise<TResponse>), TOutput> => {
    return new DataProcessor({
      id: `api-processor-${Date.now()}`,
      maxRetries: 3,
      retryDelay: 2000,
      useExponentialBackoff: true,
      ...config
    });
  },
  
  /**
   * Create a data processor for file import/export operations
   */
  createFileProcessor: <TFile, TOutput>(
    config: Omit<DataProcessorConfig<TFile, TOutput>, 'id'> & { id?: string }
  ): DataProcessor<TFile, TOutput> => {
    return new DataProcessor({
      id: `file-processor-${Date.now()}`,
      compressData: true,
      ...config
    });
  }
}; 