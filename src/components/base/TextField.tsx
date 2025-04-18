import React, { useState, forwardRef, useId, ChangeEvent, FocusEvent } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

interface ThemeStyles {
  fontSize: string;
  fontFamily: string;
  errorColor: string;
  primaryColor: string;
  grayColor400: string;
  grayColor600: string;
  grayColor900: string;
  grayColor100: string;
  grayColor50: string;
  grayColor300: string;
  grayColor500: string;
  typographyScaleSm: string;
  typographyScaleXs: string;
  spacing4: string;
  textColorPrimary: string;
  spacingXs: string;
}

function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing } = themeContext;

  return {
    fontSize: getTypography('scale.base', '1rem').toString(),
    fontFamily: getTypography('family', 'sans-serif').toString(),
    errorColor: getColor('error.500', '#ef4444').toString(),
    primaryColor: getColor('primary.500', '#3b82f6').toString(),
    grayColor400: getColor('gray.400', '#9ca3af').toString(),
    grayColor600: getColor('gray.600', '#4b5563').toString(),
    grayColor900: getColor('gray.900', '#111827').toString(),
    grayColor100: getColor('gray.100', '#f3f4f6').toString(),
    grayColor50: getColor('gray.50', '#f9fafb').toString(),
    grayColor300: getColor('gray.300', '#d1d5db').toString(),
    grayColor500: getColor('gray.500', '#6b7280').toString(),
    typographyScaleSm: getTypography('scale.sm', '0.875rem').toString(),
    typographyScaleXs: getTypography('scale.xs', '0.75rem').toString(),
    spacing4: getSpacing('4', '1rem').toString(),
    textColorPrimary: getColor('text.primary', '#111827').toString(),
    spacingXs: getSpacing('2', '0.5rem').toString(),
  };
}

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** Field label */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Whether the field is in an error state */
  error?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Callback when value changes */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
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

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  helperText,
  error = false,
  required,
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
}, ref) => {
  const [focused, setFocused] = useState(false);
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  
  const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${inputId}-label`;
  const helperId = `${inputId}-helper`;

  const rootStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: themeStyles.spacingXs,
  };

  const labelStyles: React.CSSProperties = {
    color: themeStyles.textColorPrimary,
    fontSize: themeStyles.typographyScaleXs,
    fontFamily: themeStyles.fontFamily,
    marginBottom: themeStyles.spacingXs,
  };

  const inputContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${error ? themeStyles.errorColor : focused ? themeStyles.primaryColor : themeStyles.grayColor300}`,
    borderRadius: '4px',
    backgroundColor: disabled ? themeStyles.grayColor50 : 'white',
    transition: 'border-color 0.2s ease',
  };

  const inputStyles: React.CSSProperties = {
    flex: 1,
    padding: themeStyles.spacing4,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: size === 'small' ? themeStyles.typographyScaleXs : 
             size === 'large' ? themeStyles.fontSize : 
             themeStyles.typographyScaleSm,
    fontFamily: themeStyles.fontFamily,
    color: disabled ? themeStyles.grayColor500 : themeStyles.grayColor900,
    width: '100%',
  };

  const adornmentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${themeStyles.spacingXs}`,
    color: themeStyles.grayColor500,
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: themeStyles.typographyScaleXs,
    color: error ? themeStyles.errorColor : themeStyles.grayColor600,
    marginTop: themeStyles.spacingXs,
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    rest.onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    rest.onBlur?.(e);
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
        <label id={labelId} htmlFor={inputId} style={labelStyles}>
          {label}
          {required && <span style={{ color: themeStyles.errorColor }}> *</span>}
        </label>
      )}
      <div style={inputContainerStyles}>
        {startAdornment && <div style={adornmentStyles}>{startAdornment}</div>}
        <input
          {...rest}
          id={inputId}
          ref={ref}
          aria-invalid={error}
          aria-describedby={helperText ? helperId : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyles}
          disabled={disabled}
          required={required}
        />
        {endAdornment && <div style={adornmentStyles}>{endAdornment}</div>}
      </div>
      {helperText && <div id={helperId} style={helperTextStyles}>{helperText}</div>}
    </TextFieldContainer>
  );
});

TextField.displayName = 'TextField';

export default TextField;
