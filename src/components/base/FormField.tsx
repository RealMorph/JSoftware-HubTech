import React, { useEffect, forwardRef, InputHTMLAttributes, useMemo } from 'react';
import styled from 'styled-components';
import { useForm, ValidationRule, FormContextType } from './Form';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { 
  SpacingConfig, 
  TypographyConfig,
  ThemeConfig,
  BorderRadiusConfig,
  ThemeColors
} from '../../core/theme/consolidated-types';
import { SpacingScale } from '../../core/theme/types';

/**
 * Component-specific theme styles interface
 * Defines the exact theme properties required by this component
 */
interface FormFieldThemeStyles {
  typography: {
    scale: {
      label: TypographyConfig['fontSize']['sm'];
      input: TypographyConfig['fontSize']['md'];
      error: TypographyConfig['fontSize']['xs'];
    };
    weight: {
      label: TypographyConfig['fontWeight']['medium'];
      input: TypographyConfig['fontWeight']['normal'];
    };
  };
  colors: {
    text: {
      label: string;
      input: string;
      error: string;
    };
    border: ThemeColors['border'];
    primary: {
      main: ThemeColors['primary'];
    };
  };
  borderRadius: {
    input: BorderRadiusConfig['base'];
  };
  spacing: {
    labelGap: string;
    inputPadding: string;
    errorGap: string;
  };
}

const FieldContainer = styled.div<{ $themeStyles: FormFieldThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $themeStyles }) => $themeStyles.spacing.labelGap};
`;

const Label = styled.label<{ $themeStyles: FormFieldThemeStyles }>`
  font-size: ${({ $themeStyles }) => $themeStyles.typography.scale.label};
  font-weight: ${({ $themeStyles }) => $themeStyles.typography.weight.label};
  color: ${({ $themeStyles }) => $themeStyles.colors.text.label};
`;

const InputStyled = styled.input<{ $themeStyles: FormFieldThemeStyles; $hasError?: boolean }>`
  font-size: ${({ $themeStyles }) => $themeStyles.typography.scale.input};
  font-weight: ${({ $themeStyles }) => $themeStyles.typography.weight.input};
  color: ${({ $themeStyles }) => $themeStyles.colors.text.input};
  border: 1px solid ${({ $themeStyles, $hasError }) => 
    $hasError ? $themeStyles.colors.text.error : $themeStyles.colors.border};
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.input};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.inputPadding};
  
  &:focus {
    outline: none;
    border-color: ${({ $themeStyles }) => $themeStyles.colors.primary.main};
  }
`;

const ErrorMessage = styled.span<{ $themeStyles: FormFieldThemeStyles }>`
  font-size: ${({ $themeStyles }) => $themeStyles.typography.scale.error};
  color: ${({ $themeStyles }) => $themeStyles.colors.text.error};
  margin-top: ${({ $themeStyles }) => $themeStyles.spacing.errorGap};
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
    const themeContext = useDirectTheme();
    
    const themeStyles = useMemo<FormFieldThemeStyles>(() => ({
      typography: {
        scale: {
          label: String(themeContext.getTypography('fontSize.sm')),
          input: String(themeContext.getTypography('fontSize.md')),
          error: String(themeContext.getTypography('fontSize.xs'))
        },
        weight: {
          label: Number(themeContext.getTypography('fontWeight.medium')),
          input: Number(themeContext.getTypography('fontWeight.normal'))
        }
      },
      colors: {
        text: {
          label: String(themeContext.getColor('text.primary')),
          input: String(themeContext.getColor('text.primary')),
          error: String(themeContext.getColor('error.main'))
        },
        border: String(themeContext.getColor('border')),
        primary: {
          main: String(themeContext.getColor('primary.main'))
        }
      },
      borderRadius: {
        input: String(themeContext.getBorderRadius('base'))
      },
      spacing: {
        labelGap: String(themeContext.getSpacing('2')),
        inputPadding: String(themeContext.getSpacing('3')),
        errorGap: String(themeContext.getSpacing('1'))
      }
    }), [themeContext]);

    const formContext = useForm();
    const { 
      values, 
      errors, 
      touched, 
      handleChange, 
      handleBlur, 
      registerField 
    } = formContext as FormContextType;
    const uniqueId = React.useId();
    const fieldId = `${uniqueId}-${name}`;

    useEffect(() => {
      const rules: ValidationRule[] = [];

      if (required) {
        rules.push({
          validator: value => Boolean(value),
          message: `${label || name} is required`,
        });
      }

      if (validationRules.length > 0) {
        rules.push(...validationRules);
      }

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
      <FieldContainer $themeStyles={themeStyles} className={className}>
        {label && (
          <Label $themeStyles={themeStyles} htmlFor={fieldId}>
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
          $hasError={hasError}
          $themeStyles={themeStyles}
          {...props}
        />
        {error && (
          <ErrorMessage $themeStyles={themeStyles} id={`${fieldId}-error`}>
            {error}
          </ErrorMessage>
        )}
      </FieldContainer>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
