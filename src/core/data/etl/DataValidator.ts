/**
 * DataValidator
 * 
 * Provides utilities for ETL data validation and integrity checking.
 * Supports schema validation, data type checking, and custom validation rules.
 */

import { TransformerFunction } from './types';

/**
 * Validation error object
 */
export interface ValidationError {
  path: string[];
  message: string;
  value?: any;
}

/**
 * Field validation rule
 */
export interface ValidationRule<T> {
  validator: (value: any, data?: T) => boolean;
  message: string | ((value: any, data?: T) => string);
}

/**
 * Schema field definition
 */
export interface SchemaField<T = any> {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'any';
  required?: boolean;
  rules?: ValidationRule<T>[];
  defaultValue?: any;
  allowNull?: boolean;
  properties?: Record<string, SchemaField<T>> | null;
  items?: SchemaField<T> | null;
}

/**
 * Schema definition
 */
export type Schema<T = any> = Record<string, SchemaField<T>>;

/**
 * Options for validation
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult<T = any> {
  valid: boolean;
  errors: ValidationError[];
  value: T;
}

/**
 * Utility class for data validation
 */
export class DataValidator {
  /**
   * Validate a single value against a schema field
   */
  private static validateField<T>(
    value: any,
    field: SchemaField<T>,
    path: string[],
    parentData?: any
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if field is required
    if (field.required && (value === undefined || value === null)) {
      errors.push({
        path,
        message: `Field is required`,
      });
      return errors;
    }

    // If value is not provided and field is not required, skip validation
    if (value === undefined) {
      return errors;
    }

    // Check if null is allowed
    if (value === null) {
      if (field.allowNull) {
        return errors;
      }
      errors.push({
        path,
        message: `Field cannot be null`,
        value,
      });
      return errors;
    }

    // Type validation
    if (field.type) {
      let typeIsValid = true;

      switch (field.type) {
        case 'string':
          typeIsValid = typeof value === 'string';
          break;
        case 'number':
          typeIsValid = typeof value === 'number' && !isNaN(value);
          break;
        case 'boolean':
          typeIsValid = typeof value === 'boolean';
          break;
        case 'object':
          typeIsValid = typeof value === 'object' && !Array.isArray(value) && value !== null;
          break;
        case 'array':
          typeIsValid = Array.isArray(value);
          break;
        case 'date':
          typeIsValid = value instanceof Date && !isNaN(value.getTime());
          break;
        case 'any':
          typeIsValid = true;
          break;
      }

      if (!typeIsValid) {
        errors.push({
          path,
          message: `Expected ${field.type}, got ${typeof value}`,
          value,
        });
        return errors;
      }
    }

    // Validate nested object properties
    if (field.type === 'object' && field.properties && typeof value === 'object') {
      Object.entries(field.properties).forEach(([propName, propSchema]) => {
        const propValue = value[propName];
        const propPath = [...path, propName];
        const propErrors = this.validateField(propValue, propSchema, propPath, value);
        errors.push(...propErrors);
      });
    }

    // Validate array items
    if (field.type === 'array' && field.items && Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemPath = [...path, index.toString()];
        const itemErrors = this.validateField(item, field.items!, itemPath, value);
        errors.push(...itemErrors);
      });
    }

    // Custom validation rules
    if (field.rules) {
      field.rules.forEach((rule) => {
        if (!rule.validator(value, parentData)) {
          const message = typeof rule.message === 'function'
            ? rule.message(value, parentData)
            : rule.message;
          
          errors.push({
            path,
            message,
            value,
          });
        }
      });
    }

    return errors;
  }

  /**
   * Validate data against a schema
   */
  static validate<T extends Record<string, any>>(
    data: any,
    schema: Schema<T>,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    const errors: ValidationError[] = [];
    const result: Record<string, any> = { ...data };
    
    // Process each field in the schema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const fieldValue = data?.[fieldName];
      const fieldPath = [fieldName];
      
      const fieldErrors = this.validateField(fieldValue, fieldSchema, fieldPath, data);
      errors.push(...fieldErrors);
      
      // Apply default value if needed
      if (fieldValue === undefined && fieldSchema.defaultValue !== undefined) {
        result[fieldName] = fieldSchema.defaultValue;
      }
      
      // Stop validation if abortEarly is enabled and we have errors
      if (options.abortEarly && errors.length > 0) {
        break;
      }
    }
    
    // Handle unknown fields
    if (!options.allowUnknown && data) {
      const schemaKeys = Object.keys(schema);
      const dataKeys = Object.keys(data);
      
      for (const key of dataKeys) {
        if (!schemaKeys.includes(key)) {
          errors.push({
            path: [key],
            message: `Unknown field`,
            value: data[key],
          });
          
          // Remove unknown field if stripUnknown is enabled
          if (options.stripUnknown) {
            delete result[key];
          }
          
          // Stop validation if abortEarly is enabled
          if (options.abortEarly && errors.length > 0) {
            break;
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      value: result as T,
    };
  }

  /**
   * Create a validation transformer function
   */
  static validateTransformer<T extends Record<string, any>>(
    schema: Schema<T>,
    options: ValidationOptions = {}
  ): TransformerFunction<any, T> {
    return (data: any) => {
      const result = this.validate<T>(data, schema, options);
      
      if (!result.valid) {
        const errorMessages = result.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        ).join('\n');
        
        throw new Error(`Validation failed:\n${errorMessages}`);
      }
      
      return result.value;
    };
  }

  /**
   * Create a simple validator for common data types
   */
  static createTypeValidator<T>(type: SchemaField<T>['type']): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        
        switch (type) {
          case 'string': return typeof value === 'string';
          case 'number': return typeof value === 'number' && !isNaN(value);
          case 'boolean': return typeof value === 'boolean';
          case 'object': return typeof value === 'object' && !Array.isArray(value) && value !== null;
          case 'array': return Array.isArray(value);
          case 'date': return value instanceof Date && !isNaN(value.getTime());
          case 'any': return true;
          default: return false;
        }
      },
      message: (value) => `Expected ${type}, got ${typeof value}`,
    };
  }

  /**
   * Create a required field validator
   */
  static required<T>(message = 'Field is required'): ValidationRule<T> {
    return {
      validator: (value) => value !== undefined && value !== null,
      message,
    };
  }

  /**
   * Create a min value validator for numbers
   */
  static min<T>(min: number, message?: string): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'number' && value >= min;
      },
      message: message || ((value) => `Value must be at least ${min}, got ${value}`),
    };
  }

  /**
   * Create a max value validator for numbers
   */
  static max<T>(max: number, message?: string): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'number' && value <= max;
      },
      message: message || ((value) => `Value must be at most ${max}, got ${value}`),
    };
  }

  /**
   * Create a min length validator for strings and arrays
   */
  static minLength<T>(min: number, message?: string): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        return (typeof value === 'string' || Array.isArray(value)) && value.length >= min;
      },
      message: message || ((value) => `Length must be at least ${min}, got ${value?.length || 0}`),
    };
  }

  /**
   * Create a max length validator for strings and arrays
   */
  static maxLength<T>(max: number, message?: string): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        return (typeof value === 'string' || Array.isArray(value)) && value.length <= max;
      },
      message: message || ((value) => `Length must be at most ${max}, got ${value?.length || 0}`),
    };
  }

  /**
   * Create a pattern validator for strings
   */
  static pattern<T>(pattern: RegExp, message = 'Invalid format'): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'string' && pattern.test(value);
      },
      message,
    };
  }

  /**
   * Create a custom validator
   */
  static custom<T>(
    validator: (value: any, data?: T) => boolean,
    message: string | ((value: any, data?: T) => string)
  ): ValidationRule<T> {
    return { validator, message };
  }

  /**
   * Create an enum validator
   */
  static oneOf<T>(values: any[], message?: string): ValidationRule<T> {
    return {
      validator: (value) => {
        if (value === null || value === undefined) return true;
        return values.includes(value);
      },
      message: message || ((value) => `Value must be one of [${values.join(', ')}], got ${value}`),
    };
  }
} 