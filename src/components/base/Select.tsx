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
    const theme = useDirectTheme();
    const id = providedId || `select-field-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;
    const hasAdornments = Boolean(startAdornment || endAdornment);

    // Helper function to access theme values
    const getThemeVal = (path: string): string =>
      theme.getTypography(path) as string || '';

    // Calculate sizes based on component size
    const getSpacing = (multiplier = 1) => {
      const baseSize = parseInt(theme.getSpacing('md', '16px'), 10);
      return `${baseSize * multiplier}px`;
    };

    // Calculate theme-based styles
    const rootStyles = {
      display: 'inline-flex',
      flexDirection: 'column',
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
      margin: `${getSpacing(0.25)} 0`,
      fontSize: theme.getTypography('fontSize.md', '1rem'),
      fontFamily: theme.getTypography('fontFamily.base', 'system-ui, sans-serif'),
    } as React.CSSProperties;

    const getLabelColor = () => {
      if (disabled) return theme.getColor('text.disabled', '#999999');
      if (error) return theme.getColor('error', '#f44336');
      if (focused) return theme.getColor('primary', '#1976d2');
      return theme.getColor('text.secondary', '#666666');
    };

    const labelStyles = {
      color: getLabelColor(),
      marginBottom: getSpacing(0.25),
      transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
      fontSize: theme.getTypography('fontSize.sm', '0.875rem'),
    } as React.CSSProperties;

    const getSelectBorderColor = () => {
      if (disabled) return theme.getColor('text.disabled', '#999999');
      if (error) return theme.getColor('error', '#f44336');
      if (focused) return theme.getColor('primary', '#1976d2');
      return theme.getColor('border', '#e0e0e0');
    };

    const getSelectBgColor = () => {
      if (disabled) return theme.getColor('background', '#f5f5f5');
      if (variant === 'filled') return theme.getColor('surface', '#f5f5f5');
      return theme.getColor('white', '#ffffff');
    };

    const getSelectHeight = () => {
      if (size === 'small') return '32px';
      if (size === 'large') return '56px';
      return '40px'; // medium
    };

    const containerStyles = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      borderRadius: theme.getBorderRadius('base', '4px'),
      border: `1px solid ${getSelectBorderColor()}`,
      backgroundColor: getSelectBgColor(),
      height: getSelectHeight(),
      transition:
        'background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, border-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
    } as React.CSSProperties;

    const selectStyles = {
      flex: 1,
      border: 'none',
      backgroundColor: 'transparent',
      outline: 'none',
      color: disabled ? theme.getColor('text.disabled', '#999999') : theme.getColor('text.primary', '#333333'),
      padding: `0 ${getSpacing(0.5)}`,
      height: '100%',
      width: '100%',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      appearance: 'none', // Remove default styling
      cursor: disabled ? 'not-allowed' : 'pointer',
    } as React.CSSProperties;

    const adornmentStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.getColor('text.secondary', '#666666'),
      pointerEvents: 'none', // Make sure clicks pass through to the select
    } as React.CSSProperties;

    // Custom dropdown icon
    const dropdownIconStyles = {
      position: 'absolute',
      right: getSpacing(0.5),
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: disabled ? theme.getColor('text.disabled', '#999999') : theme.getColor('text.secondary', '#666666'),
    } as React.CSSProperties;

    const helperTextStyles = {
      marginTop: getSpacing(0.25),
      color: error ? theme.getColor('error', '#f44336') : theme.getColor('text.secondary', '#666666'),
      fontSize: theme.getTypography('fontSize.xs', '0.75rem'),
    } as React.CSSProperties;

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

    // Helper to render the dropdown icon
    const renderDropdownIcon = () => (
      <div style={dropdownIconStyles}>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );

    return (
      <div style={rootStyles} className={className}>
        {label && (
          <label id={labelId} htmlFor={id} style={labelStyles}>
            {label}
            {required && <span style={{ color: theme.getColor('error', '#f44336') }}> *</span>}
          </label>
        )}
        <div style={containerStyles}>
          {startAdornment && <div style={adornmentStyles}>{startAdornment}</div>}
          <select
            {...props}
            id={id}
            ref={ref}
            aria-invalid={error}
            aria-describedby={helperText ? helperId : undefined}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={selectStyles}
            disabled={disabled}
            required={required}
          >
            {placeholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {endAdornment ? (
            <div style={adornmentStyles}>{endAdornment}</div>
          ) : (
            renderDropdownIcon()
          )}
        </div>
        {helperText && (
          <div id={helperId} style={helperTextStyles}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

export default Select; 