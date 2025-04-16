import React, { createContext, useContext, useState, useCallback, useEffect, forwardRef, FormHTMLAttributes, ReactNode, useMemo } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';

export interface FormValidationError {
  field: string;
  message: string;
}

// Extended validation rule system
export type ValidationRule = {
  validator: (value: any) => boolean;
  message: string;
};

export type ValidationErrors = Record<string, string | null>;
export type FormValues = Record<string, any>;
export type TouchedFields = Record<string, boolean>;

// Form Context
export interface FormContextType {
  values: FormValues;
  errors: ValidationErrors;
  touched: TouchedFields;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  registerField: (name: string, validationRules?: ValidationRule[]) => void;
  validateField: (name: string) => string | null;
  setFieldValue: (name: string, value: any) => void;
  setFieldTouched: (name: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Form hook for consuming components
export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
};

// Styled components
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
`;

/**
 * Form component that provides form state management and validation
 */
export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  /** Optional ID for the form element */
  id?: string;
  /** Optional CSS class name */
  className?: string;
  /** Form children or render function */
  children: ReactNode | ((formState: FormContextType) => ReactNode);
  /** Initial values for form fields */
  defaultValues?: Record<string, any>;
  /** Handler called when form is submitted with valid data */
  onSubmit?: (values: Record<string, any>, e: React.FormEvent) => void;
  /** Handler called when form validation fails */
  onValidationError?: (errors: ValidationErrors) => void;
  /** Custom validation function */
  validate?: (values: FormValues) => ValidationErrors;
  /** Validation rules for form fields */
  validationRules?: Record<string, {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    errorMessage?: string;
  }>;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      id: providedId,
      className,
      children,
      defaultValues = {},
      onSubmit,
      onValidationError,
      validate,
      validationRules,
      ...props
    },
    ref
  ) => {
    // Get theme using the DirectThemeProvider
    let themeUtils;
    try {
      themeUtils = useDirectTheme();
    } catch (e) {
      // Theme not available, will use fallback values
      themeUtils = null;
    }
    
    const id = providedId || `form-${Math.random().toString(36).substring(2, 11)}`;
    
    const [values, setValues] = useState<FormValues>(defaultValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<TouchedFields>({});
    const [fieldRules, setFieldRules] = useState<Record<string, ValidationRule[]>>({});

    // Process validationRules prop if provided
    useEffect(() => {
      if (validationRules) {
        const processedRules: Record<string, ValidationRule[]> = {};
        
        Object.entries(validationRules).forEach(([fieldName, rules]) => {
          const fieldValidators: ValidationRule[] = [];
          
          if (rules.required) {
            fieldValidators.push({
              validator: (value) => !!value,
              message: rules.errorMessage || `${fieldName} is required`
            });
          }
          
          if (rules.minLength) {
            fieldValidators.push({
              validator: (value) => !value || value.length >= rules.minLength!,
              message: rules.errorMessage || `${fieldName} must be at least ${rules.minLength} characters`
            });
          }
          
          if (rules.pattern) {
            fieldValidators.push({
              validator: (value) => !value || rules.pattern!.test(value),
              message: rules.errorMessage || `${fieldName} format is invalid`
            });
          }
          
          if (fieldValidators.length > 0) {
            processedRules[fieldName] = fieldValidators;
          }
        });
        
        setFieldRules(processedRules);
      }
    }, [validationRules]);

    // Helper function to access theme values with fallbacks
    const getThemeVal = (path: string): string => {
      // Default fallback values for common spacing
      const fallbacks: Record<string, string> = {
        'spacing.md': '1rem',
        'spacing.lg': '1.5rem',
        'spacing.sm': '0.5rem'
      };
      
      if (themeUtils) {
        // Extract the category and property from the path
        const [category, property] = path.split('.');
        
        switch(category) {
          case 'spacing':
            return themeUtils.getSpacing(property, fallbacks[path]);
          case 'borderRadius':
            return themeUtils.getBorderRadius(property, fallbacks[path]);
          case 'colors':
            return themeUtils.getColor(property, fallbacks[path]);
          case 'typography':
            return themeUtils.getTypography(property, fallbacks[path]) as string;
          default:
            return fallbacks[path] || '';
        }
      }
      
      return fallbacks[path] || '';
    };

    // Register field with validation rules
    const registerField = useCallback((name: string, rules: ValidationRule[] = []) => {
      setFieldRules(prev => ({
        ...prev,
        [name]: rules
      }));
      
      // Initialize field value if not already set
      setValues(prev => ({
        ...prev,
        [name]: prev[name] !== undefined ? prev[name] : ''
      }));
    }, []);

    // Validate a single field
    const validateField = useCallback((name: string): string | null => {
      const rules = fieldRules[name] || [];
      
      if (validationRules && validationRules[name]) {
        const rule = validationRules[name];
        
        // Check required field
        if (rule.required && !values[name]) {
          return rule.errorMessage || `${name} is required`;
        }
        
        // Check minimum length
        if (rule.minLength && values[name] && values[name].length < rule.minLength) {
          return rule.errorMessage || `${name} must be at least ${rule.minLength} characters`;
        }
        
        // Check pattern match
        if (rule.pattern && values[name] && !rule.pattern.test(values[name])) {
          return rule.errorMessage || `${name} format is invalid`;
        }
      }
      
      // Check custom validation rules
      for (const rule of rules) {
        if (!rule.validator(values[name])) {
          return rule.message;
        }
      }
      
      return null;
    }, [fieldRules, values, validationRules]);

    // Validate all fields
    const validateForm = useCallback((): ValidationErrors => {
      const newErrors: ValidationErrors = {};

      // Check validationRules prop
      if (validationRules) {
        Object.entries(validationRules).forEach(([fieldName, rule]) => {
          // Check required field
          if (rule.required && !values[fieldName]) {
            newErrors[fieldName] = rule.errorMessage || `${fieldName} is required`;
            return;
          }
          
          // Check minimum length
          if (rule.minLength && values[fieldName] && values[fieldName].length < rule.minLength) {
            newErrors[fieldName] = rule.errorMessage || `${fieldName} must be at least ${rule.minLength} characters`;
            return;
          }
          
          // Check pattern match
          if (rule.pattern && values[fieldName] && !rule.pattern.test(values[fieldName])) {
            newErrors[fieldName] = rule.errorMessage || `${fieldName} format is invalid`;
            return;
          }
        });
      }

      // Check validation rules registered via registerField
      Object.keys(fieldRules).forEach(fieldName => {
        if (!newErrors[fieldName]) { // Skip if already has error
          const error = validateField(fieldName);
          if (error) {
            newErrors[fieldName] = error;
          }
        }
      });

      // Check custom validate function
      if (validate) {
        const customErrors = validate(values);
        Object.entries(customErrors).forEach(([key, value]) => {
          if (value) {
            newErrors[key] = value;
          }
        });
      }

      return newErrors;
    }, [fieldRules, validate, validateField, validationRules, values]);

    // Handle field value change
    const handleChange = useCallback((name: string, value: any) => {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (touched[name]) {
        // Re-validate field on change if it was touched before
        const error = validateField(name);
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }, [touched, validateField]);

    // Handle field blur
    const handleBlur = useCallback((name: string) => {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Validate field on blur
      const error = validateField(name);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }, [validateField]);

    // Utility for direct field value setting
    const setFieldValue = useCallback((name: string, value: any) => {
      handleChange(name, value);
    }, [handleChange]);

    // Utility for marking a field as touched
    const setFieldTouched = useCallback((name: string) => {
      handleBlur(name);
    }, [handleBlur]);

    // Form submission handler
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const formErrors = validateForm();
      const hasErrors = Object.values(formErrors).some(Boolean);
      
      if (hasErrors) {
        // Mark all fields as touched on submission with errors
        const allTouched: TouchedFields = {};
        Object.keys(values).forEach(key => {
          allTouched[key] = true;
        });
        setTouched(allTouched);
        setErrors(formErrors);
        
        if (onValidationError) {
          onValidationError(formErrors);
        }
        return;
      }
      
      if (onSubmit) {
        onSubmit(values, e);
      }
    };

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      registerField,
      validateField,
      setFieldValue,
      setFieldTouched
    }), [values, errors, touched, handleChange, handleBlur, registerField, validateField, setFieldValue, setFieldTouched]);

    return (
      <FormContext.Provider value={contextValue}>
        <FormContainer
          id={id}
          className={className}
          ref={ref}
          onSubmit={handleSubmit}
          {...props}
        >
          {typeof children === 'function' ? children(contextValue) : children}
        </FormContainer>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';

export default Form; 