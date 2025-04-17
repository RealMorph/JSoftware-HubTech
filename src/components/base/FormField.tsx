import React, { useEffect, forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { useForm, ValidationRule } from './Form';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
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

const Label = styled.label<{ required?: boolean; $themeStyles: any }>`
  margin-bottom: 0.25rem;
  font-size: ${props => props.$themeStyles.fontSize};
  font-weight: ${props => props.$themeStyles.fontWeight};
  color: ${props => props.$themeStyles.textColor};

  ${props =>
    props.required &&
    `
    &::after {
      content: '*';
      color: ${props.$themeStyles.errorColor};
      margin-left: 0.25rem;
    }
  `}
`;

const InputStyled = styled.input<{ hasError?: boolean; $themeStyles: any }>`
  padding: 0.75rem;
  border-radius: ${props => props.$themeStyles.borderRadius};
  border: 1px solid
    ${props => (props.hasError ? props.$themeStyles.errorColor : props.$themeStyles.borderColor)};
  font-size: ${props => props.$themeStyles.inputFontSize};
  transition: ${props => props.$themeStyles.transition};

  &:focus {
    outline: none;
    border-color: ${props =>
      props.hasError ? props.$themeStyles.errorColor : props.$themeStyles.primaryColor};
    box-shadow: 0 0 0 2px
      ${props =>
        props.hasError
          ? `${props.$themeStyles.errorColor}30`
          : `${props.$themeStyles.primaryColor}30`};
  }
`;

const ErrorMessage = styled.span<{ $themeStyles: any }>`
  color: ${props => props.$themeStyles.errorColor};
  font-size: ${props => props.$themeStyles.errorFontSize};
  margin-top: 0.25rem;
  min-height: 1.2em;
`;

export interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
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
    const { getColor, getTypography, getBorderRadius, getTransition } = useDirectTheme();

    const { values, errors, touched, handleChange, handleBlur, registerField } = useForm();
    const uniqueId = React.useId();
    const fieldId = `${uniqueId}-${name}`;

    useEffect(() => {
      // Create validation rules array
      const rules: ValidationRule[] = [];

      // Add required validation if needed
      if (required) {
        rules.push({
          validator: value => Boolean(value),
          message: `${label || name} is required`,
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

    // Theme styles for the FormField
    const themeStyles = {
      fontSize: getTypography('scale.sm', '0.875rem'),
      fontWeight: getTypography('weight.medium', 500),
      textColor: getColor('text.primary', '#000000'),
      errorColor: getColor('error', '#d32f2f'),
      inputFontSize: getTypography('scale.base', '1rem'),
      borderRadius: getBorderRadius('sm', '0.25rem'),
      borderColor: getColor('border', '#e0e0e0'),
      primaryColor: getColor('primary', '#1976d2'),
      transition: getTransition('base', 'border-color 0.2s ease'),
      errorFontSize: getTypography('scale.xs', '0.75rem'),
    };

    return (
      <FieldContainer className={className}>
        {label && (
          <Label htmlFor={fieldId} required={required} $themeStyles={themeStyles}>
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
          $themeStyles={themeStyles}
          {...props}
        />
        <ErrorMessage id={`${fieldId}-error`} $themeStyles={themeStyles}>
          {error}
        </ErrorMessage>
      </FieldContainer>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
