/**
 * DataTransformer
 * 
 * Provides utilities for ETL (Extract, Transform, Load) operations.
 * Supports data transformation, mapping, filtering, and validation.
 */

import { 
  TransformerFunction, 
  PredicateFunction, 
  GroupKeyFunction, 
  ETLPipelineConfig 
} from './types';
import { parseCSVRow } from './parseCSVRow';

/**
 * Utility class for data transformation operations
 */
export class DataTransformer {
  /**
   * Apply a series of transformations to the input data
   */
  static transform<T, R>(data: T, ...transformers: Array<TransformerFunction<any, any>>): R {
    return transformers.reduce(
      (result, transformer) => transformer(result),
      data as any
    ) as R;
  }

  /**
   * Create a transformation pipeline that can be reused
   */
  static createPipeline<T, R>(config: ETLPipelineConfig<T, R>) {
    return async (data: T): Promise<R> => {
      try {
        // Apply all transformations
        const result = DataTransformer.transform<T, R>(data, ...config.transformers);
        
        // Validate result if validator provided
        if (config.validator) {
          const isValid = await config.validator(result);
          if (!isValid) {
            throw new Error(`Validation failed for ETL pipeline ${config.name || 'unnamed'}`);
          }
        }
        
        // Call success handler if provided
        if (config.onSuccess) {
          config.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        // Call error handler if provided
        if (config.errorHandler) {
          config.errorHandler(error as Error, data);
        }
        
        // Call failure handler if provided
        if (config.onFailure) {
          config.onFailure(error as Error, data);
        }
        
        throw error;
      }
    };
  }

  /**
   * Create a batch processing pipeline
   */
  static createBatchPipeline<T, R>(config: ETLPipelineConfig<T[], R[]>) {
    return async (data: T[]): Promise<R[]> => {
      try {
        // Apply all transformations
        const result = DataTransformer.transform<T[], R[]>(data, ...config.transformers);
        
        // Validate result if validator provided
        if (config.validator) {
          const isValid = await config.validator(result);
          if (!isValid) {
            throw new Error(`Validation failed for batch ETL pipeline ${config.name || 'unnamed'}`);
          }
        }
        
        // Call success handler if provided
        if (config.onSuccess) {
          config.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        // Call error handler if provided
        if (config.errorHandler) {
          config.errorHandler(error as Error, data);
        }
        
        // Call failure handler if provided
        if (config.onFailure) {
          config.onFailure(error as Error, data);
        }
        
        throw error;
      }
    };
  }
  
  // Common transformation functions
  
  /**
   * Map array items using a transform function
   */
  static map<T, R>(transformFn: TransformerFunction<T, R>): TransformerFunction<T[], R[]> {
    return (data: T[]) => data.map(transformFn);
  }
  
  /**
   * Filter array items using a predicate function
   */
  static filter<T>(predicateFn: PredicateFunction<T>): TransformerFunction<T[], T[]> {
    return (data: T[]) => data.filter(predicateFn);
  }
  
  /**
   * Group array items by a key function
   */
  static groupBy<T, K extends string | number | symbol>(
    keyFn: GroupKeyFunction<T, K>
  ): TransformerFunction<T[], Record<K, T[]>> {
    return (data: T[]) => {
      return data.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(item);
        return result;
      }, {} as Record<K, T[]>);
    };
  }
  
  /**
   * Flatten a nested array
   */
  static flatten<T>(): TransformerFunction<T[][], T[]> {
    return (data: T[][]) => data.flat();
  }
  
  /**
   * Remove duplicate items from an array
   */
  static distinct<T, K = T>(data: T[], keyFn?: (item: T) => K): T[] {
    if (!keyFn) {
      // Convert Set to Array without using spread operator to avoid TS2802 error
      const set = new Set(data);
      return Array.from(set);
    }

    const keys = new Set<K>();
    return data.filter(item => {
      const key = keyFn(item);
      if (keys.has(key)) {
        return false;
      }
      keys.add(key);
      return true;
    });
  }
  
  /**
   * Sort array items
   */
  static sort<T>(compareFn: (a: T, b: T) => number): TransformerFunction<T[], T[]> {
    return (data: T[]) => [...data].sort(compareFn);
  }
  
  /**
   * Limit the number of items in an array
   */
  static limit<T>(count: number): TransformerFunction<T[], T[]> {
    return (data: T[]) => data.slice(0, count);
  }
  
  /**
   * Skip the first n items in an array
   */
  static skip<T>(count: number): TransformerFunction<T[], T[]> {
    return (data: T[]) => data.slice(count);
  }
  
  /**
   * Take items from an array while a condition is true
   */
  static takeWhile<T>(predicateFn: PredicateFunction<T>): TransformerFunction<T[], T[]> {
    return (data: T[]) => {
      const result: T[] = [];
      for (const item of data) {
        if (!predicateFn(item)) {
          break;
        }
        result.push(item);
      }
      return result;
    };
  }
  
  /**
   * Skip items from an array while a condition is true
   */
  static skipWhile<T>(predicateFn: PredicateFunction<T>): TransformerFunction<T[], T[]> {
    return (data: T[]) => {
      let index = 0;
      for (const item of data) {
        if (!predicateFn(item)) {
          break;
        }
        index++;
      }
      return data.slice(index);
    };
  }
  
  /**
   * Add fields to each object in an array
   */
  static addFields<T extends object, R extends object>(
    fieldFn: (item: T) => Partial<R>
  ): TransformerFunction<T[], (T & R)[]> {
    return (data: T[]) => data.map(item => ({
      ...item,
      ...fieldFn(item)
    })) as (T & R)[];
  }
  
  /**
   * Remove fields from each object in an array
   */
  static removeFields<T extends object, K extends keyof T>(
    ...fields: K[]
  ): TransformerFunction<T[], Omit<T, K>[]> {
    return (data: T[]) => data.map(item => {
      const result = { ...item };
      fields.forEach(field => {
        delete result[field];
      });
      return result as Omit<T, K>;
    });
  }
  
  /**
   * Rename fields in each object in an array
   */
  static renameFields<T extends object>(
    fieldMap: Record<string, string>
  ): TransformerFunction<T[], any[]> {
    return (data: T[]) => data.map(item => {
      const result: Record<string, any> = { ...item };
      Object.entries(fieldMap).forEach(([oldName, newName]) => {
        if (oldName in result) {
          result[newName] = result[oldName];
          delete result[oldName];
        }
      });
      return result;
    });
  }
  
  /**
   * Convert array to CSV string
   */
  static toCSV<T extends object>(
    options?: {
      headers?: string[];
      delimiter?: string;
      includeHeaders?: boolean;
    }
  ): TransformerFunction<T[], string> {
    return (data: T[]) => {
      if (data.length === 0) {
        return '';
      }
      
      const delimiter = options?.delimiter || ',';
      const includeHeaders = options?.includeHeaders !== false;
      const headers = options?.headers || Object.keys(data[0]);
      
      const rows = data.map(item => 
        headers.map(header => {
          const value = (item as any)[header];
          // Handle values with commas or quotes
          if (value === null || value === undefined) {
            return '';
          } else if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(delimiter)
      );
      
      if (includeHeaders) {
        rows.unshift(headers.join(delimiter));
      }
      
      return rows.join('\n');
    };
  }
  
  /**
   * Parse CSV string to array of objects
   */
  static fromCSV<T extends object>(
    options?: {
      headers?: string[];
      delimiter?: string;
      hasHeaderRow?: boolean;
    }
  ): TransformerFunction<string, T[]> {
    return (data: string) => {
      if (!data.trim()) {
        return [];
      }
      
      const delimiter = options?.delimiter || ',';
      const hasHeaderRow = options?.hasHeaderRow !== false;
      
      const rows = data.split(/\r?\n/);
      
      if (rows.length === 0) {
        return [];
      }
      
      let headers: string[];
      
      if (hasHeaderRow) {
        // Parse header row
        headers = options?.headers || parseCSVRow(rows[0], delimiter);
        rows.shift();
      } else {
        // Use provided headers or generate default ones
        headers = options?.headers || Array.from({ length: parseCSVRow(rows[0], delimiter).length }, (_, i) => `field${i}`);
      }
      
      return rows.filter(row => row.trim()).map(row => {
        const values = parseCSVRow(row, delimiter);
        const obj: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          if (index < values.length) {
            obj[header] = values[index];
          }
        });
        
        return obj as T;
      });
    };
  }
} 