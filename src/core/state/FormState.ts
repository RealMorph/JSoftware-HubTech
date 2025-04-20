import { useState, useCallback, ChangeEvent } from 'react';

export type ValidationRule<T = any> = (value: T, formValues: Record<string, any>) => string | null;

export interface FieldConfig<T = any> {
  initialValue: T;
  validate?: ValidationRule<T> | ValidationRule<T>[];
  required?: boolean;
  transform?: (value: any) => T;
}

export interface FieldState<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormConfig {
  fields: Record<string, FieldConfig>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  hasErrors: boolean;
}

export interface FormActions {
  setValue: (field: string, value: any) => void;
  setValues: (values: Record<string, any>) => void;
  setError: (field: string, error: string | null) => void;
  setTouched: (field: string, touched: boolean) => void;
  resetField: (field: string) => void;
  resetForm: () => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  validateField: (field: string) => string | null;
  validateForm: () => boolean;
}

const requiredRule: ValidationRule = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'This field is required';
  }
  return null;
};

export function useFormState(config: FormConfig): [FormState, FormActions] {
  // Initialize form state
  const initialValues: Record<string, any> = {};
  const initialErrors: Record<string, string | null> = {};
  const initialTouched: Record<string, boolean> = {};
  const initialDirty: Record<string, boolean> = {};

  Object.entries(config.fields).forEach(([key, field]) => {
    initialValues[key] = field.initialValue;
    initialErrors[key] = null;
    initialTouched[key] = false;
    initialDirty[key] = false;
  });

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>(initialErrors);
  const [touched, setTouched] = useState<Record<string, boolean>>(initialTouched);
  const [dirty, setDirty] = useState<Record<string, boolean>>(initialDirty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: string): string | null => {
    const fieldConfig = config.fields[field];
    if (!fieldConfig) return null;

    const value = values[field];
    let fieldError: string | null = null;

    // Check required rule first
    if (fieldConfig.required) {
      fieldError = requiredRule(value, values);
      if (fieldError) return fieldError;
    }

    // Process validation rules
    if (fieldConfig.validate) {
      const rules = Array.isArray(fieldConfig.validate) 
        ? fieldConfig.validate 
        : [fieldConfig.validate];
      
      for (const rule of rules) {
        fieldError = rule(value, values);
        if (fieldError) break;
      }
    }

    return fieldError;
  }, [config.fields, values]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    Object.keys(config.fields).forEach(field => {
      const error = validateField(field);
      newErrors[field] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [config.fields, validateField]);

  // Set a single field value
  const setValue = useCallback((field: string, value: any) => {
    const fieldConfig = config.fields[field];
    if (!fieldConfig) return;

    // Apply transformation if provided
    const transformedValue = fieldConfig.transform ? fieldConfig.transform(value) : value;

    setValues(prev => ({ ...prev, [field]: transformedValue }));
    setDirty(prev => ({ ...prev, [field]: true }));
    
    // Validate field on change if it's been touched
    if (touched[field]) {
      const error = validateField(field);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [config.fields, touched, validateField]);

  // Set multiple field values at once
  const setMultipleValues = useCallback((newValues: Record<string, any>) => {
    const transformedValues: Record<string, any> = {};
    const newDirty: Record<string, boolean> = { ...dirty };
    
    Object.entries(newValues).forEach(([field, value]) => {
      const fieldConfig = config.fields[field];
      if (fieldConfig) {
        transformedValues[field] = fieldConfig.transform ? fieldConfig.transform(value) : value;
        newDirty[field] = true;
      }
    });
    
    setValues(prev => ({ ...prev, ...transformedValues }));
    setDirty(newDirty);
    
    // Validate touched fields
    const newErrors = { ...errors };
    Object.keys(transformedValues).forEach(field => {
      if (touched[field]) {
        newErrors[field] = validateField(field);
      }
    });
    
    setErrors(newErrors);
  }, [config.fields, dirty, errors, touched, validateField]);

  // Set error for a field
  const setError = useCallback((field: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Set touched state for a field
  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
    
    // Validate the field when marked as touched
    if (isTouched) {
      const error = validateField(field);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateField]);

  // Reset a single field
  const resetField = useCallback((field: string) => {
    const fieldConfig = config.fields[field];
    if (!fieldConfig) return;

    setValues(prev => ({ ...prev, [field]: fieldConfig.initialValue }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setTouched(prev => ({ ...prev, [field]: false }));
    setDirty(prev => ({ ...prev, [field]: false }));
  }, [config.fields]);

  // Reset entire form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors(initialErrors);
    setTouched(initialTouched);
    setDirty(initialDirty);
    setIsSubmitted(false);
  }, [initialValues, initialErrors, initialTouched, initialDirty]);

  // Handle input change event
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setValue(name, (e.target as HTMLInputElement).checked);
    } else if (type === 'file') {
      setValue(name, (e.target as HTMLInputElement).files);
    } else {
      setValue(name, value);
    }
  }, [setValue]);

  // Handle input blur event
  const handleBlur = useCallback((field: string) => {
    setFieldTouched(field, true);
  }, [setFieldTouched]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setIsSubmitted(true);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(config.fields).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    const isValid = validateForm();
    
    if (isValid && config.onSubmit) {
      try {
        await config.onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [validateForm, config.onSubmit, values]);

  // Calculate if the form has any errors
  const hasErrors = Object.values(errors).some(error => error !== null);

  // Calculate if the form is valid
  const isValid = !hasErrors;

  // Form state
  const formState: FormState = {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    isSubmitted,
    hasErrors,
  };

  // Form actions
  const formActions: FormActions = {
    setValue,
    setValues: setMultipleValues,
    setError,
    setTouched: setFieldTouched,
    resetField,
    resetForm,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
  };

  return [formState, formActions];
}

// Common validation rules
export const validationRules = {
  required: requiredRule,
  
  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },
  
  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters`;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters`;
  },
  
  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },
  
  numeric: (value: string) => {
    if (!value) return null;
    return /^[0-9]+$/.test(value) ? null : 'Must contain only numbers';
  },
  
  match: (field: string, message: string) => (value: any, formValues: Record<string, any>) => {
    return value === formValues[field] ? null : message;
  }
};

// Example usage:
/*
const [formState, formActions] = useFormState({
  fields: {
    email: {
      initialValue: '',
      required: true,
      validate: validationRules.email
    },
    password: {
      initialValue: '',
      required: true,
      validate: validationRules.minLength(8)
    },
    confirmPassword: {
      initialValue: '',
      required: true,
      validate: validationRules.match('password', 'Passwords must match')
    }
  },
  onSubmit: (values) => {
    console.log('Form submitted with values:', values);
  }
});
*/ 