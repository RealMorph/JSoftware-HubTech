/**
 * DataFilter
 * 
 * Provides utilities for server-side filtering and pagination.
 * Supports complex filter conditions, sorting, and efficient pagination.
 */

import { TransformerFunction } from './types';

/**
 * Filter operator types
 */
export type FilterOperator = 
  | 'eq' | 'neq'              // Equal, Not Equal
  | 'gt' | 'gte'              // Greater Than, Greater Than or Equal
  | 'lt' | 'lte'              // Less Than, Less Than or Equal
  | 'in' | 'nin'              // In array, Not in array
  | 'contains' | 'ncontains'  // Contains, Not Contains (string or array)
  | 'startswith' | 'endswith' // Starts with, Ends with (string)
  | 'exists' | 'nexists'      // Field exists, Field doesn't exist
  | 'regex';                  // Regular expression match

/**
 * Logical filter operators
 */
export type LogicalOperator = 'and' | 'or' | 'not';

/**
 * Base filter condition interface
 */
export interface FilterCondition {
  type: 'field' | 'logical';
}

/**
 * Field filter condition
 */
export interface FieldFilterCondition extends FilterCondition {
  type: 'field';
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Logical filter condition
 */
export interface LogicalFilterCondition extends FilterCondition {
  type: 'logical';
  operator: LogicalOperator;
  conditions: AnyFilterCondition[];
}

/**
 * Union type for all filter conditions
 */
export type AnyFilterCondition = FieldFilterCondition | LogicalFilterCondition;

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort specification
 */
export interface SortSpec {
  field: string;
  direction: SortDirection;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;       // 1-based page number
  pageSize?: number;   // Number of items per page
  offset?: number;     // Alternative to page - start index
  limit?: number;      // Alternative to pageSize - max items to return
}

/**
 * Filter options for server requests
 */
export interface FilterOptions {
  filter?: AnyFilterCondition;
  sort?: SortSpec[];
  pagination?: PaginationOptions;
  includeCount?: boolean;  // Whether to include total count in response
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

/**
 * Utility class for data filtering and pagination
 */
export class DataFilter {
  /**
   * Create a field filter condition
   */
  static field(
    field: string,
    operator: FilterOperator,
    value: any
  ): FieldFilterCondition {
    return {
      type: 'field',
      field,
      operator,
      value,
    };
  }

  /**
   * Create an 'and' logical condition
   */
  static and(...conditions: AnyFilterCondition[]): LogicalFilterCondition {
    return {
      type: 'logical',
      operator: 'and',
      conditions,
    };
  }

  /**
   * Create an 'or' logical condition
   */
  static or(...conditions: AnyFilterCondition[]): LogicalFilterCondition {
    return {
      type: 'logical',
      operator: 'or',
      conditions,
    };
  }

  /**
   * Create a 'not' logical condition
   */
  static not(condition: AnyFilterCondition): LogicalFilterCondition {
    return {
      type: 'logical',
      operator: 'not',
      conditions: [condition],
    };
  }

  /**
   * Convert filter options to URL query parameters
   */
  static toQueryParams(options: FilterOptions): Record<string, string> {
    const params: Record<string, string> = {};

    // Add filter params
    if (options.filter) {
      params.filter = JSON.stringify(options.filter);
    }

    // Add sort params
    if (options.sort && options.sort.length > 0) {
      params.sort = options.sort
        .map(s => `${s.field}:${s.direction}`)
        .join(',');
    }

    // Add pagination params
    if (options.pagination) {
      const { page, pageSize, offset, limit } = options.pagination;
      
      if (page !== undefined) {
        params.page = page.toString();
      }
      
      if (pageSize !== undefined) {
        params.pageSize = pageSize.toString();
      }
      
      if (offset !== undefined) {
        params.offset = offset.toString();
      }
      
      if (limit !== undefined) {
        params.limit = limit.toString();
      }
    }

    // Add count param
    if (options.includeCount !== undefined) {
      params.count = options.includeCount.toString();
    }

    return params;
  }

  /**
   * Parse query params back to filter options
   */
  static fromQueryParams(params: Record<string, string>): FilterOptions {
    const options: FilterOptions = {};

    // Parse filter
    if (params.filter) {
      try {
        options.filter = JSON.parse(params.filter) as AnyFilterCondition;
      } catch (e) {
        console.error('Failed to parse filter param:', e);
      }
    }

    // Parse sort
    if (params.sort) {
      options.sort = params.sort.split(',').map(s => {
        const [field, direction] = s.split(':');
        return {
          field,
          direction: (direction as SortDirection) || 'asc',
        };
      });
    }

    // Parse pagination
    const pagination: PaginationOptions = {};
    
    if (params.page) {
      pagination.page = parseInt(params.page, 10);
    }
    
    if (params.pageSize) {
      pagination.pageSize = parseInt(params.pageSize, 10);
    }
    
    if (params.offset) {
      pagination.offset = parseInt(params.offset, 10);
    }
    
    if (params.limit) {
      pagination.limit = parseInt(params.limit, 10);
    }
    
    if (Object.keys(pagination).length > 0) {
      options.pagination = pagination;
    }

    // Parse count
    if (params.count) {
      options.includeCount = params.count === 'true';
    }

    return options;
  }

  /**
   * Apply a filter condition to a single item
   */
  static applyFilterToItem(
    item: any, 
    filter: AnyFilterCondition
  ): boolean {
    if (filter.type === 'logical') {
      return this.applyLogicalFilter(item, filter);
    } else {
      return this.applyFieldFilter(item, filter);
    }
  }

  /**
   * Apply a logical filter to an item
   */
  private static applyLogicalFilter(
    item: any, 
    filter: LogicalFilterCondition
  ): boolean {
    const { operator, conditions } = filter;

    switch (operator) {
      case 'and':
        return conditions.every(c => this.applyFilterToItem(item, c));
      
      case 'or':
        return conditions.some(c => this.applyFilterToItem(item, c));
      
      case 'not':
        return !this.applyFilterToItem(item, conditions[0]);
      
      default:
        return true;
    }
  }

  /**
   * Apply a field filter to an item
   */
  private static applyFieldFilter(
    item: any, 
    filter: FieldFilterCondition
  ): boolean {
    const { field, operator, value } = filter;
    const fieldValue = this.getNestedProperty(item, field);

    // Handle existence checks first
    if (operator === 'exists') {
      return fieldValue !== undefined && fieldValue !== null;
    }
    
    if (operator === 'nexists') {
      return fieldValue === undefined || fieldValue === null;
    }

    // Skip other checks if field doesn't exist
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    switch (operator) {
      case 'eq':
        return fieldValue === value;
      
      case 'neq':
        return fieldValue !== value;
      
      case 'gt':
        return fieldValue > value;
      
      case 'gte':
        return fieldValue >= value;
      
      case 'lt':
        return fieldValue < value;
      
      case 'lte':
        return fieldValue <= value;
      
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      
      case 'nin':
        return Array.isArray(value) && !value.includes(fieldValue);
      
      case 'contains':
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(value);
        }
        return false;
      
      case 'ncontains':
        if (typeof fieldValue === 'string') {
          return !fieldValue.includes(value);
        }
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(value);
        }
        return true;
      
      case 'startswith':
        return typeof fieldValue === 'string' && fieldValue.startsWith(value);
      
      case 'endswith':
        return typeof fieldValue === 'string' && fieldValue.endsWith(value);
      
      case 'regex':
        if (typeof fieldValue !== 'string') {
          return false;
        }
        try {
          const regex = new RegExp(value);
          return regex.test(fieldValue);
        } catch (e) {
          console.error('Invalid regex:', e);
          return false;
        }
      
      default:
        return true;
    }
  }

  /**
   * Get a nested property from an object using dot notation
   */
  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  }

  /**
   * Apply sort specifications to a dataset
   */
  static applySorting<T>(
    data: T[], 
    sortSpecs: SortSpec[]
  ): T[] {
    // Clone the array to avoid mutating the original
    const result = [...data];
    
    // No sorting needed
    if (!sortSpecs || sortSpecs.length === 0) {
      return result;
    }

    return result.sort((a, b) => {
      for (const sort of sortSpecs) {
        const { field, direction } = sort;
        const aValue = this.getNestedProperty(a, field);
        const bValue = this.getNestedProperty(b, field);
        
        // Skip if both values are undefined
        if (aValue === undefined && bValue === undefined) {
          continue;
        }
        
        // Nulls and undefined always go last regardless of sort direction
        if (aValue === null || aValue === undefined) {
          return 1;
        }
        
        if (bValue === null || bValue === undefined) {
          return -1;
        }
        
        // Compare values
        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        }
        
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        }
        
        // Equal values, continue to next sort field
      }
      
      // All sort fields were equal
      return 0;
    });
  }

  /**
   * Apply pagination to a dataset
   */
  static applyPagination<T>(
    data: T[], 
    options: PaginationOptions
  ): T[] {
    const { page, pageSize, offset, limit } = options;
    
    // Calculate start and end indices
    let startIndex = 0;
    let endIndex = data.length;
    
    if (page !== undefined && pageSize !== undefined) {
      startIndex = (page - 1) * pageSize;
      endIndex = startIndex + pageSize;
    } else if (offset !== undefined) {
      startIndex = offset;
      if (limit !== undefined) {
        endIndex = startIndex + limit;
      }
    } else if (limit !== undefined) {
      endIndex = limit;
    }
    
    // Ensure indices are within bounds
    startIndex = Math.max(0, startIndex);
    endIndex = Math.min(data.length, endIndex);
    
    return data.slice(startIndex, endIndex);
  }

  /**
   * Create a paginated response
   */
  static createPaginatedResponse<T>(
    data: T[],
    filteredData: T[],
    options: FilterOptions
  ): PaginatedResponse<T> {
    const { pagination, includeCount } = options;
    const { page, pageSize, offset, limit } = pagination || {};
    
    const meta: PaginatedResponse<T>['meta'] = {};
    
    // Add total count if requested
    if (includeCount) {
      meta.totalCount = filteredData.length;
    }
    
    // Add page information
    if (page !== undefined && pageSize !== undefined) {
      meta.page = page;
      meta.pageSize = pageSize;
      
      if (includeCount) {
        meta.pageCount = Math.ceil(filteredData.length / pageSize);
        meta.hasNextPage = page < meta.pageCount;
        meta.hasPreviousPage = page > 1;
      }
    }
    
    return {
      data,
      meta,
    };
  }

  /**
   * Apply complete filtering, sorting, and pagination to a dataset
   */
  static apply<T>(
    data: T[], 
    options: FilterOptions
  ): PaginatedResponse<T> {
    let filteredData = data;
    
    // Apply filter
    if (options.filter) {
      filteredData = data.filter(item => this.applyFilterToItem(item, options.filter!));
    }
    
    // Apply sorting
    if (options.sort && options.sort.length > 0) {
      filteredData = this.applySorting(filteredData, options.sort);
    }
    
    // Get total filtered data before pagination
    const totalFiltered = [...filteredData];
    
    // Apply pagination
    if (options.pagination) {
      filteredData = this.applyPagination(filteredData, options.pagination);
    }
    
    // Create response
    return this.createPaginatedResponse(filteredData, totalFiltered, options);
  }

  /**
   * Create a filter transformer for use in an ETL pipeline
   */
  static createFilterTransformer<T>(
    options: FilterOptions
  ): TransformerFunction<T[], PaginatedResponse<T>> {
    return (data: T[]) => this.apply(data, options);
  }
  
  /**
   * Create request parameters for server-side filtering
   */
  static buildServerRequest(
    baseUrl: string,
    options: FilterOptions
  ): string {
    const params = this.toQueryParams(options);
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${baseUrl}${queryString ? '?' + queryString : ''}`;
  }
} 