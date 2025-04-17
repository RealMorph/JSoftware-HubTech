import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  forwardRef,
  FormHTMLAttributes,
  ReactNode,
} from 'react';
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
  setFieldTouched: (name: string, touched?: boolean) => void;
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
const FormContainer = styled.form<{ $themeStyles?: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles?.spacing || '1.25rem'};
  width: 100%;
`;

/**
 * Form component that provides form state management and validation
 */
export interface FormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  /** Optional ID for the form element */
  id?: string;
  /** Optional CSS class name */
  className?: string;
  /** Form children or render function */
  children: ReactNode | ((formState: FormContextType) => ReactNode);
  /** Initial values for form fields */
  defaultValues?: Record<string, any>;
  /** Handler called when form is submitted with valid data */
  onSubmit?: (values: Record<string, any>) => void;
  /** Handler called when form validation fails */
  onValidationError?: (errors: ValidationErrors) => void;
  /** Custom validation function */
  validate?: (values: FormValues) => ValidationErrors;
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
      ...props
    },
    ref
  ) => {
    const { getSpacing } = useDirectTheme();
    const id = providedId || `form-${Math.random().toString(36).substring(2, 11)}`;

    const [values, setValues] = useState<FormValues>(defaultValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<TouchedFields>({});
    const [fieldRules, setFieldRules] = useState<Record<string, ValidationRule[]>>({});

    // Register field with validation rules
    const registerField = useCallback((name: string, rules: ValidationRule[] = []) => {
      // Use functional updates to prevent dependency on previous state
      setFieldRules(prev => {
        // Skip update if rules haven't changed to prevent infinite loops
        const prevRules = prev[name];
        if (
          prevRules &&
          prevRules.length === rules.length &&
          JSON.stringify(prevRules) === JSON.stringify(rules)
        ) {
          return prev;
        }
        return {
          ...prev,
          [name]: rules,
        };
      });

      // Initialize field value if not already set
      setValues(prev => {
        if (prev[name] !== undefined) {
          return prev; // No change needed
        }
        return {
          ...prev,
          [name]: '',
        };
      });
    }, []);

    // Validate a single field
    const validateField = useCallback(
      (name: string): string | null => {
        const rules = fieldRules[name] || [];

        for (const rule of rules) {
          if (!rule.validator(values[name])) {
            return rule.message;
          }
        }

        return null;
      },
      [fieldRules, values]
    );

    // Validate all fields
    const validateForm = useCallback((): ValidationErrors => {
      const newErrors: ValidationErrors = {};

      Object.keys(fieldRules).forEach(fieldName => {
        const error = validateField(fieldName);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);

      return newErrors;
    }, [validateField, fieldRules]);

    // Handle form input change
    const handleChange = useCallback(
      (name: string, value: any) => {
        setValues(prevValues => {
          const newValues = {
            ...prevValues,
            [name]: value,
          };

          // Run validation if field was touched
          if (touched[name]) {
            const error = validateField(name);
            setErrors(prevErrors => ({
              ...prevErrors,
              [name]: error,
            }));
          }

          return newValues;
        });
      },
      [touched, validateField]
    );

    // Explicit setters for field value and touched state
    const setFieldValue = useCallback(
      (name: string, value: any) => {
        handleChange(name, value);
      },
      [handleChange]
    );

    const setFieldTouched = useCallback(
      (name: string, isTouched: boolean = true) => {
        setTouched(prev => ({
          ...prev,
          [name]: isTouched,
        }));

        if (isTouched) {
          const error = validateField(name);
          setErrors(prev => ({
            ...prev,
            [name]: error,
          }));
        }
      },
      [validateField]
    );

    // Handle input blur
    const handleBlur = useCallback(
      (name: string) => {
        setFieldTouched(name, true);
      },
      [setFieldTouched]
    );

    // Handle form submission
    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched: TouchedFields = {};
        Object.keys(fieldRules).forEach(field => {
          allTouched[field] = true;
        });
        setTouched(allTouched);

        // Validate all fields
        const formErrors = validateForm();

        // Check if there are any errors
        const hasErrors = Object.values(formErrors).some(
          error => error !== null && error !== undefined && error !== ''
        );

        if (hasErrors) {
          if (onValidationError) {
            onValidationError(formErrors);
          }
          // Don't proceed with form submission if there are errors
          return;
        }

        if (onSubmit) {
          onSubmit(values);
        }
      },
      [onSubmit, validateForm, values, fieldRules, onValidationError]
    );

    // Theme styles for the Form
    const themeStyles = {
      spacing: getSpacing('md', '1.25rem'),
    };

    // Memoize context value
    const contextValue: FormContextType = {
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      registerField,
      validateField,
      setFieldValue,
      setFieldTouched,
    };

    return (
      <FormContext.Provider value={contextValue}>
        <FormContainer
          id={id}
          ref={ref}
          className={className}
          $themeStyles={themeStyles}
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
