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

// Theme styles interface
interface FormThemeStyles {
  root: {
    gap: string;
    padding: string;
    background: string;
    border: string;
    borderRadius: string;
    boxShadow?: string;
  };
  field: {
    spacing: {
      gap: string;
      marginBottom: string;
    };
    typography: {
      fontSize: string;
      fontWeight: string | number;
      lineHeight: string | number;
    };
    colors: {
      text: string;
      placeholder: string;
      border: string;
      borderFocus: string;
      background: string;
      error: string;
    };
  };
}

// Create theme styles function
const createFormThemeStyles = (theme: ReturnType<typeof useDirectTheme>): FormThemeStyles => {
  const { getSpacing, getColor, getBorderRadius, getTypography, getShadow } = theme;
  
  return {
    root: {
      gap: getSpacing('4'),
      padding: getSpacing('4'),
      background: getColor('background.paper'),
      border: `1px solid ${getColor('border.default')}`,
      borderRadius: getBorderRadius('md'),
      boxShadow: getShadow('sm'),
    },
    field: {
      spacing: {
        gap: getSpacing('2'),
        marginBottom: getSpacing('3'),
      },
      typography: {
        fontSize: getTypography('fontSize.base', '1rem') as string,
        fontWeight: getTypography('fontWeight.normal', 400),
        lineHeight: getTypography('lineHeight.normal', 1.5),
      },
      colors: {
        text: getColor('text.primary'),
        placeholder: getColor('text.secondary'),
        border: getColor('border.default'),
        borderFocus: getColor('primary.main'),
        background: getColor('background.default'),
        error: getColor('error.main'),
      },
    },
  };
};

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
const FormContainer = styled.form<{ $themeStyles: FormThemeStyles['root'] }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.gap};
  width: 100%;
  padding: ${props => props.$themeStyles.padding};
  background: ${props => props.$themeStyles.background};
  border: ${props => props.$themeStyles.border};
  border-radius: ${props => props.$themeStyles.borderRadius};
  ${props => props.$themeStyles.boxShadow && `box-shadow: ${props.$themeStyles.boxShadow};`}
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
    const theme = useDirectTheme();
    const themeStyles = createFormThemeStyles(theme);
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
      <FormContext.Provider
        value={{
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          registerField,
          validateField,
          setFieldValue,
          setFieldTouched,
        }}
      >
        <FormContainer
          ref={ref}
          id={id}
          className={className}
          onSubmit={handleSubmit}
          $themeStyles={themeStyles.root}
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
