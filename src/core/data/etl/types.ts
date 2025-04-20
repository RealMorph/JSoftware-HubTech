/**
 * Common types for ETL (Extract, Transform, Load) operations
 */

/**
 * Function that transforms data from one type to another
 */
export type TransformerFunction<T, R> = (data: T) => R;

/**
 * Function that checks if an item meets a condition
 */
export type PredicateFunction<T> = (item: T) => boolean;

/**
 * Function that extracts a key from an item
 */
export type GroupKeyFunction<T, K extends string | number | symbol> = (item: T) => K;

/**
 * ETL Pipeline Configuration
 */
export interface ETLPipelineConfig<T, R> {
  name?: string;
  transformers: Array<TransformerFunction<any, any>>;
  errorHandler?: (error: Error, data: any) => void;
  validator?: (data: R) => boolean | Promise<boolean>;
  onSuccess?: (data: R) => void;
  onFailure?: (error: Error, data: T) => void;
} 