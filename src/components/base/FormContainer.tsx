import React from 'react';
import { Form, ValidationRule } from './Form';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { TextField } from './TextField';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getThemeValue } from '../../core/theme/styled';

export type FieldConfig = {
  /** Field name */
  name: string;
  /** Field label */
  label: string;
  /** Field type (text, email, password, etc.) */
  type?: string;
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** Whether the field spans full width */
  fullWidth?: boolean;
};

export type FormContainerProps = {
  /** Title for the form */
  title?: string;
  /** Description text */
  description?: string;
  /** Field configurations */
  fields: FieldConfig[];
  /** Default values for form fields */
  defaultValues?: Record<string, any>;
  /** Submit button text */
  submitButtonText?: string;
  /** Cancel button text */
  cancelButtonText?: string;
  /** Handler for form submission */
  onSubmit: (values: Record<string, any>) => void;
  /** Handler for cancel button click */
  onCancel?: () => void;
  /** Whether the form is loading/processing */
  isLoading?: boolean;
  /** Whether the form is embedded (no Card container) */
  embedded?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Additional content to render after form fields */
  additionalContent?: React.ReactNode;
  /** Form layout - vertical (default) or horizontal */
  layout?: 'vertical' | 'horizontal';
  /** Custom renderer for specific fields */
  renderField?: (fieldConfig: FieldConfig, formState: {
    values: Record<string, any>;
    errors: Record<string, string | null>;
    touched: Record<string, boolean>;
    handleChange: (name: string, value: any) => void;
    handleBlur: (name: string) => void;
  }) => React.ReactNode;
};

/**
 * FormContainer is a high-level component that simplifies creating forms with validation
 */
export const FormContainer: React.FC<FormContainerProps> = ({
  title,
  description,
  fields,
  defaultValues = {},
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  onSubmit,
  onCancel,
  isLoading = false,
  embedded = false,
  className,
  style,
  additionalContent,
  layout = 'vertical',
  renderField,
}) => {
  const { currentTheme } = useTheme();
  const formId = React.useId(); // Generate unique ID for this form instance

  // Helper function to access theme values
  const getThemeVal = (path: string): string =>
    currentTheme ? getThemeValue(currentTheme, path) : '';

  // Generate validation rules from field configs
  const generateValidationRules = React.useMemo(() => {
    const rules: Record<string, ValidationRule[]> = {};
    
    fields.forEach(field => {
      const fieldRules: ValidationRule[] = [];
      
      if (field.required) {
        fieldRules.push({
          validator: (value) => value !== undefined && value !== null && value !== '',
          message: `${field.label} is required`,
        });
      }
      
      if (field.type === 'email') {
        fieldRules.push({
          validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Please enter a valid email address',
        });
      }
      
      if (field.type === 'password') {
        fieldRules.push({
          validator: (value) => !value || value.length >= 8,
          message: 'Password must be at least 8 characters long',
        });
      }
      
      if (field.validationRules?.length) {
        fieldRules.push(...field.validationRules);
      }
      
      if (fieldRules.length > 0) {
        rules[field.name] = fieldRules;
      }
    });
    
    return rules;
  }, [fields]);

  const handleValidate = React.useCallback((values: Record<string, any>) => {
    const errors: Record<string, string | null> = {};
    const rules = generateValidationRules;
    
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      for (const rule of fieldRules) {
        if (!rule.validator(values[fieldName])) {
          errors[fieldName] = rule.message;
          break;
        }
      }
    });
    
    return errors;
  }, [generateValidationRules]);

  const renderFormContent = () => (
    <Form 
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      validate={handleValidate}
    >
      {(formState) => {
        // Register fields when form mounts
        React.useEffect(() => {
          const rules = generateValidationRules;
          fields.forEach(field => {
            formState.registerField(field.name, rules[field.name] || []);
          });
        }, [formState.registerField, generateValidationRules]);

        return (
          <>
            {description && (
              <p style={{ 
                marginBottom: '16px', 
                color: getThemeVal('colors.gray.600'),
                fontSize: getThemeVal('typography.scale.sm')
              }}>
                {description}
              </p>
            )}

            <div style={{ 
              display: 'flex', 
              flexDirection: layout === 'horizontal' ? 'row' : 'column',
              flexWrap: 'wrap',
              gap: layout === 'horizontal' ? '24px' : '16px',
            }}>
              {fields.map(field => {
                if (renderField) {
                  return renderField(field, {
                    values: formState.values,
                    errors: formState.errors,
                    touched: formState.touched,
                    handleChange: formState.handleChange,
                    handleBlur: formState.handleBlur,
                  });
                }
                
                const error = formState.touched[field.name] ? formState.errors[field.name] : null;
                const fieldId = `${formId}-${field.name}`; // Create unique ID for each field
                
                return (
                  <div 
                    key={field.name} 
                    style={{ 
                      flex: field.fullWidth ? '0 0 100%' : (layout === 'horizontal' ? '0 0 calc(50% - 12px)' : '0 0 100%'),
                    }}
                  >
                    <TextField
                      id={fieldId}
                      name={field.name}
                      label={field.label}
                      type={field.type || 'text'}
                      value={formState.values[field.name] || ''}
                      onChange={(value, e) => {
                        formState.handleChange(field.name, value);
                      }}
                      onBlur={() => formState.handleBlur(field.name)}
                      placeholder={field.placeholder}
                      required={field.required}
                      error={!!error}
                      helperText={error || field.helperText}
                      fullWidth
                    />
                  </div>
                );
              })}
            </div>

            {additionalContent}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '24px',
            }}>
              {onCancel && (
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelButtonText}
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : submitButtonText}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );

  if (embedded) {
    return (
      <div className={className} style={style}>
        {title && <h2 style={{ marginBottom: '16px' }}>{title}</h2>}
        {renderFormContent()}
      </div>
    );
  }

  return (
    <Card className={className} style={style}>
      {title && (
        <CardHeader>
          <h2>{title}</h2>
        </CardHeader>
      )}
      <CardContent>
        {renderFormContent()}
      </CardContent>
    </Card>
  );
};

export default FormContainer; 