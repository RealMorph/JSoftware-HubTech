import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Field label */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Whether the field is in an error state */
  error?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** TextField variant */
  variant?: 'standard' | 'outlined' | 'filled';
  /** Input size */
  size?: 'small' | 'medium' | 'large';
  /** Custom className */
  className?: string;
  /** Whether the field takes up the full width of its container */
  fullWidth?: boolean;
  /** Content to display at the start of the input */
  startAdornment?: React.ReactNode;
  /** Content to display at the end of the input */
  endAdornment?: React.ReactNode;
}

// Container component
const TextFieldContainer = styled.div<{
  $fullWidth: boolean;
  $variant: string;
  $disabled: boolean;
  $error: boolean;
  $size: string;
  $themeStyles: any;
}>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  margin-bottom: ${props => props.$themeStyles.spacing};
  opacity: ${props => (props.$disabled ? 0.7 : 1)};
`;

// Label component
const Label = styled.label<{
  $error: boolean;
  $required: boolean;
  $themeStyles: any;
}>`
  font-size: ${props => props.$themeStyles.labelFontSize};
  margin-bottom: ${props => props.$themeStyles.labelMargin};
  color: ${props => (props.$error ? props.$themeStyles.errorColor : props.$themeStyles.labelColor)};

  ${props =>
    props.$required &&
    `
    &::after {
      content: " *";
      color: ${props.$themeStyles.errorColor};
    }
  `}
`;

// Helper text component
const HelperText = styled.div<{
  $error: boolean;
  $themeStyles: any;
}>`
  font-size: ${props => props.$themeStyles.helperTextFontSize};
  margin-top: ${props => props.$themeStyles.helperTextMargin};
  color: ${props =>
    props.$error ? props.$themeStyles.errorColor : props.$themeStyles.helperTextColor};
`;

// Input wrapper component (for adornments)
const InputWrapper = styled.div<{
  $variant: string;
  $size: string;
  $error: boolean;
  $focused: boolean;
  $hasStartAdornment: boolean;
  $hasEndAdornment: boolean;
  $themeStyles: any;
}>`
  display: flex;
  align-items: center;
  position: relative;
  background-color: ${props => props.$themeStyles.backgroundColor};
  border: ${props => props.$themeStyles.border};
  border-color: ${props =>
    props.$error
      ? props.$themeStyles.errorColor
      : props.$focused
        ? props.$themeStyles.focusBorderColor
        : props.$themeStyles.borderColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  padding: ${props => props.$themeStyles.padding};
  transition: ${props => props.$themeStyles.transition};

  &:hover {
    border-color: ${props =>
      props.$error ? props.$themeStyles.errorColor : props.$themeStyles.hoverBorderColor};
  }
`;

// Actual input component
const Input = styled.input<{
  $hasStartAdornment: boolean;
  $hasEndAdornment: boolean;
  $themeStyles: any;
}>`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: ${props => props.$themeStyles.fontSize};
  font-family: ${props => props.$themeStyles.fontFamily};
  color: ${props => props.$themeStyles.inputColor};
  padding: 0;
  padding-left: ${props => (props.$hasStartAdornment ? '8px' : '0')};
  padding-right: ${props => (props.$hasEndAdornment ? '8px' : '0')};

  &::placeholder {
    color: ${props => props.$themeStyles.placeholderColor};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

// Adornment containers
const StartAdornment = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.color};
`;

const EndAdornment = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.color};
`;

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  error = false,
  required = false,
  onChange,
  variant = 'outlined',
  size = 'medium',
  className,
  fullWidth = false,
  startAdornment,
  endAdornment,
  disabled = false,
  id,
  ...rest
}) => {
  // Use direct theme access
  const { getColor, getTypography, getSpacing, getBorderRadius, getTransition } = useDirectTheme();

  const [focused, setFocused] = useState(false);
  const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Handle focus state
  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  // Theme styles for the TextField
  const getVariantStyles = () => {
    switch (variant) {
      case 'standard':
        return {
          border: `0 0 1px 0 solid`,
          borderRadius: '0',
          backgroundColor: 'transparent',
          padding: `${getSpacing('2', '0.5rem')} 0`,
        };
      case 'filled':
        return {
          border: '0',
          borderRadius: `${getBorderRadius('sm', '0.125rem')} ${getBorderRadius('sm', '0.125rem')} 0 0`,
          backgroundColor: getColor('gray.100', '#F3F4F6'),
          padding: getSpacing('3', '0.75rem'),
        };
      default: // outlined
        return {
          border: '1px solid',
          borderRadius: getBorderRadius('md', '0.375rem'),
          backgroundColor: 'transparent',
          padding: getSpacing('3', '0.75rem'),
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: getTypography('fontSize.sm', '0.875rem'),
          padding: getSpacing('2', '0.5rem'),
          labelFontSize: getTypography('fontSize.xs', '0.75rem'),
          helperTextFontSize: getTypography('fontSize.xs', '0.75rem'),
        };
      case 'large':
        return {
          fontSize: getTypography('fontSize.lg', '1.125rem'),
          padding: getSpacing('4', '1rem'),
          labelFontSize: getTypography('fontSize.md', '1rem'),
          helperTextFontSize: getTypography('fontSize.sm', '0.875rem'),
        };
      default: // medium
        return {
          fontSize: getTypography('fontSize.base', '1rem'),
          padding: getSpacing('3', '0.75rem'),
          labelFontSize: getTypography('fontSize.sm', '0.875rem'),
          helperTextFontSize: getTypography('fontSize.xs', '0.75rem'),
        };
    }
  };

  const themeStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    spacing: getSpacing('4', '1rem'),
    labelMargin: getSpacing('1', '0.25rem'),
    helperTextMargin: getSpacing('1', '0.25rem'),
    fontFamily: getTypography('fontFamily.base', 'system-ui, sans-serif'),
    inputColor: getColor('text.primary', '#1F2937'),
    labelColor: getColor('text.secondary', '#4B5563'),
    placeholderColor: getColor('text.tertiary', '#9CA3AF'),
    helperTextColor: getColor('text.secondary', '#4B5563'),
    errorColor: getColor('error.500', '#EF4444'),
    borderColor: getColor('gray.300', '#D1D5DB'),
    hoverBorderColor: getColor('gray.500', '#6B7280'),
    focusBorderColor: getColor('primary.500', '#3B82F6'),
    transition: `${getTransition('duration.normal', '200ms')} ease`,
  };

  return (
    <TextFieldContainer
      $fullWidth={fullWidth}
      $variant={variant}
      $disabled={disabled}
      $error={error}
      $size={size}
      $themeStyles={themeStyles}
      className={className}
      data-testid="text-field"
    >
      {label && (
        <Label htmlFor={inputId} $error={error} $required={required} $themeStyles={themeStyles}>
          {label}
        </Label>
      )}

      <InputWrapper
        $variant={variant}
        $size={size}
        $error={error}
        $focused={focused}
        $hasStartAdornment={!!startAdornment}
        $hasEndAdornment={!!endAdornment}
        $themeStyles={themeStyles}
      >
        {startAdornment && (
          <StartAdornment color={themeStyles.labelColor}>{startAdornment}</StartAdornment>
        )}

        <Input
          id={inputId}
          $hasStartAdornment={!!startAdornment}
          $hasEndAdornment={!!endAdornment}
          $themeStyles={themeStyles}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...rest}
        />

        {endAdornment && <EndAdornment color={themeStyles.labelColor}>{endAdornment}</EndAdornment>}
      </InputWrapper>

      {helperText && (
        <HelperText $error={error} $themeStyles={themeStyles}>
          {helperText}
        </HelperText>
      )}
    </TextFieldContainer>
  );
};
