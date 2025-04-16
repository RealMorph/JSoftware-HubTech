import React, { useEffect, forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { useForm, ValidationRule } from './Form';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getThemeValue } from '../../core/theme/styled';
import { asTheme } from '../../core/theme/theme-utils';
import { TextField } from './TextField';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { FileUpload } from './FileUpload';

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const Label = styled.label<{ required?: boolean }>`
  margin-bottom: 0.25rem;
  font-size: ${({ theme }) => getThemeValue(asTheme(theme), 'typography.scale.sm')};
  font-weight: ${({ theme }) => getThemeValue(asTheme(theme), 'typography.weight.medium')};
  color: ${({ theme }) => getThemeValue(asTheme(theme), 'colors.text.primary')};
  
  ${({ required, theme }) => required && `
    &::after {
      content: '*';
      color: ${getThemeValue(asTheme(theme), 'colors.error')};
      margin-left: 0.25rem;
    }
  `}
`;

const InputStyled = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem;
  border-radius: ${({ theme }) => getThemeValue(asTheme(theme), 'borderRadius.sm')};
  border: 1px solid ${({ hasError, theme }) => 
    hasError 
      ? getThemeValue(asTheme(theme), 'colors.error') 
      : getThemeValue(asTheme(theme), 'colors.border')
  };
  font-size: ${({ theme }) => getThemeValue(asTheme(theme), 'typography.scale.base')};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ hasError, theme }) => 
      hasError 
        ? getThemeValue(asTheme(theme), 'colors.error') 
        : getThemeValue(asTheme(theme), 'colors.primary')
    };
    box-shadow: 0 0 0 2px ${({ hasError, theme }) => 
      hasError 
        ? `${getThemeValue(asTheme(theme), 'colors.error')}30` 
        : `${getThemeValue(asTheme(theme), 'colors.primary')}30`
    };
  }
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => getThemeValue(asTheme(theme), 'colors.error')};
  font-size: ${({ theme }) => getThemeValue(asTheme(theme), 'typography.scale.xs')};
  margin-top: 0.25rem;
  min-height: 1.2em;
`;

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  /** Field name (must be unique in the form) */
  name: string;
  /** Field label */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Custom validation rules */
  validationRules?: ValidationRule[];
  /** Custom classname */
  className?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, required, validationRules = [], className, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const { values, errors, touched, handleChange, handleBlur, registerField } = useForm();
    const uniqueId = React.useId();
    const fieldId = `${uniqueId}-${name}`;

    useEffect(() => {
      // Create validation rules array
      const rules: ValidationRule[] = [];
      
      // Add required validation if needed
      if (required) {
        rules.push({
          validator: (value) => Boolean(value),
          message: `${label || name} is required`
        });
      }
      
      // Add custom validation rules
      if (validationRules.length > 0) {
        rules.push(...validationRules);
      }
      
      // Register this field with the form
      registerField(name, rules);
    }, [name, label, required, validationRules, registerField]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(name, e.target.value);
    };

    const handleInputBlur = () => {
      handleBlur(name);
    };

    const error = touched[name] ? errors[name] : null;
    const hasError = Boolean(error);

    return (
      <FieldContainer className={className}>
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}
        <InputStyled
          id={fieldId}
          name={name}
          ref={ref}
          value={values[name] || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          hasError={hasError}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...props}
        />
        <ErrorMessage id={`${fieldId}-error`}>
          {error}
        </ErrorMessage>
      </FieldContainer>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField; 