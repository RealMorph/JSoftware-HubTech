import React, { useState, forwardRef, SelectHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export interface SelectOption {
  /** Value of the option */
  value: string;
  /** Label to display for the option */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  /** Label for the select field */
  label?: string;
  /** Options for the select */
  options: SelectOption[];
  /** Helper text to display below the select */
  helperText?: string;
  /** Whether the field is in an error state */
  error?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Function called when the selected value changes */
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Variant of the select field */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Size of the select field */
  size?: 'small' | 'medium' | 'large';
  /** ID for the select element. Auto-generated if not provided */
  id?: string;
  /** ClassName for the root element */
  className?: string;
  /** Whether the field is full width */
  fullWidth?: boolean;
  /** Start adornment (icon or element) */
  startAdornment?: React.ReactNode;
  /** End adornment (icon or element) - Note: some browsers may hide custom dropdown icons */
  endAdornment?: React.ReactNode;
  /** Placeholder text when no option is selected */
  placeholder?: string;
}

// Theme styles interfaces
interface SelectThemeStyles {
  root: {
    fontSize: string;
    fontFamily: string;
    spacing: string;
  };
  label: {
    color: string;
    fontSize: string;
    spacing: string;
  };
  container: {
    borderColor: string;
    backgroundColor: string;
    height: string;
    borderRadius: string;
  };
  select: {
    color: string;
    padding: string;
  };
  adornment: {
    color: string;
  };
  dropdownIcon: {
    color: string;
    spacing: string;
  };
  helperText: {
    color: string;
    fontSize: string;
    spacing: string;
  };
}

// Styled components
const SelectRoot = styled.div<{ $themeStyles: SelectThemeStyles; $fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  margin: ${props => props.$themeStyles.root.spacing} 0;
  font-size: ${props => props.$themeStyles.root.fontSize};
  font-family: ${props => props.$themeStyles.root.fontFamily};
`;

const SelectLabel = styled.label<{ $themeStyles: SelectThemeStyles }>`
  color: ${props => props.$themeStyles.label.color};
  margin-bottom: ${props => props.$themeStyles.label.spacing};
  transition: color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
  font-size: ${props => props.$themeStyles.label.fontSize};
`;

const SelectContainer = styled.div<{ $themeStyles: SelectThemeStyles }>`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${props => props.$themeStyles.container.borderRadius};
  border: 1px solid ${props => props.$themeStyles.container.borderColor};
  background-color: ${props => props.$themeStyles.container.backgroundColor};
  height: ${props => props.$themeStyles.container.height};
  transition: background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,
    border-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
`;

const SelectElement = styled.select<{ $themeStyles: SelectThemeStyles }>`
  flex: 1;
  border: none;
  background-color: transparent;
  outline: none;
  color: ${props => props.$themeStyles.select.color};
  padding: ${props => props.$themeStyles.select.padding};
  height: 100%;
  width: 100%;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  appearance: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const Adornment = styled.div<{ $themeStyles: SelectThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$themeStyles.adornment.color};
  pointer-events: none;
`;

const DropdownIcon = styled.div<{ $themeStyles: SelectThemeStyles }>`
  position: absolute;
  right: ${props => props.$themeStyles.dropdownIcon.spacing};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$themeStyles.dropdownIcon.color};
`;

const HelperText = styled.div<{ $themeStyles: SelectThemeStyles }>`
  margin-top: ${props => props.$themeStyles.helperText.spacing};
  color: ${props => props.$themeStyles.helperText.color};
  font-size: ${props => props.$themeStyles.helperText.fontSize};
`;

// Create theme styles function
const createSelectThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  {
    error,
    disabled,
    focused,
    variant,
    size,
  }: {
    error: boolean;
    disabled: boolean;
    focused: boolean;
    variant: SelectProps['variant'];
    size: SelectProps['size'];
  }
): SelectThemeStyles => {
  const { getColor, getTypography, getSpacing, getBorderRadius } = themeContext;

  const getLabelColor = () => {
    if (disabled) return getColor('text.disabled', '#999999');
    if (error) return getColor('error', '#f44336');
    if (focused) return getColor('primary', '#1976d2');
    return getColor('text.secondary', '#666666');
  };

  const getSelectBorderColor = () => {
    if (disabled) return getColor('text.disabled', '#999999');
    if (error) return getColor('error', '#f44336');
    if (focused) return getColor('primary', '#1976d2');
    return getColor('border', '#e0e0e0');
  };

  const getSelectBgColor = () => {
    if (disabled) return getColor('background', '#f5f5f5');
    if (variant === 'filled') return getColor('surface', '#f5f5f5');
    return getColor('white', '#ffffff');
  };

  const getSelectHeight = () => {
    if (size === 'small') return '32px';
    if (size === 'large') return '56px';
    return '40px'; // medium
  };

  return {
    root: {
      fontSize: getTypography('fontSize.md', '1rem') as string,
      fontFamily: getTypography('fontFamily.base', 'system-ui, sans-serif') as string,
      spacing: getSpacing('1', '0.25rem') as string,
    },
    label: {
      color: getLabelColor(),
      fontSize: getTypography('fontSize.sm', '0.875rem') as string,
      spacing: getSpacing('1', '0.25rem') as string,
    },
    container: {
      borderColor: getSelectBorderColor(),
      backgroundColor: getSelectBgColor(),
      height: getSelectHeight(),
      borderRadius: getBorderRadius('base', '4px') as string,
    },
    select: {
      color: disabled
        ? getColor('text.disabled', '#999999')
        : getColor('text.primary', '#333333'),
      padding: `0 ${getSpacing('2', '0.5rem') as string}`,
    },
    adornment: {
      color: getColor('text.secondary', '#666666'),
    },
    dropdownIcon: {
      color: disabled
        ? getColor('text.disabled', '#999999')
        : getColor('text.secondary', '#666666'),
      spacing: getSpacing('2', '0.5rem') as string,
    },
    helperText: {
      color: error
        ? getColor('error', '#f44336')
        : getColor('text.secondary', '#666666'),
      fontSize: getTypography('fontSize.xs', '0.75rem') as string,
      spacing: getSpacing('1', '0.25rem') as string,
    },
  };
};

/**
 * Select component for selecting from predefined options
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error = false,
      required = false,
      variant = 'outlined',
      size = 'medium',
      id: providedId,
      className,
      fullWidth = false,
      startAdornment,
      endAdornment,
      onChange,
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const themeContext = useDirectTheme();
    const id = providedId || `select-field-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;

    const themeStyles = createSelectThemeStyles(themeContext, {
      error,
      disabled: !!disabled,
      focused,
      variant,
      size,
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value, e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(false);
      props.onBlur?.(e);
    };

    const renderDropdownIcon = () => (
      <DropdownIcon $themeStyles={themeStyles}>
        <svg
          width="10"
          height="5"
          viewBox="0 0 10 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0L5 5L10 0H0Z" fill="currentColor" />
        </svg>
      </DropdownIcon>
    );

    return (
      <SelectRoot className={className} $themeStyles={themeStyles} $fullWidth={fullWidth}>
        {label && (
          <SelectLabel
            id={labelId}
            htmlFor={id}
            $themeStyles={themeStyles}
          >
            {label}
            {required && <span style={{ color: themeStyles.label.color }}>*</span>}
          </SelectLabel>
        )}
        <SelectContainer $themeStyles={themeStyles}>
          {startAdornment && <Adornment $themeStyles={themeStyles}>{startAdornment}</Adornment>}
          <SelectElement
            ref={ref}
            id={id}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={helperText ? helperId : undefined}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            $themeStyles={themeStyles}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </SelectElement>
          {endAdornment ? (
            <Adornment $themeStyles={themeStyles}>{endAdornment}</Adornment>
          ) : (
            renderDropdownIcon()
          )}
        </SelectContainer>
        {helperText && (
          <HelperText id={helperId} $themeStyles={themeStyles}>
            {helperText}
          </HelperText>
        )}
      </SelectRoot>
    );
  }
);

Select.displayName = 'Select';

export default Select;
