import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getThemeValue } from '../../core/theme/styled';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'>;

export interface RadioProps extends InputProps {
  /** Label for the radio button */
  label?: string;
  /** Helper text to display below the radio button */
  helperText?: string;
  /** Whether the field is in an error state */
  error?: boolean;
  /** Whether the radio is checked */
  checked?: boolean;
  /** Function called when the radio state changes */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Size of the radio button */
  size?: 'small' | 'medium' | 'large';
  /** ID for the input element. Auto-generated if not provided */
  id?: string;
  /** ClassName for the root element */
  className?: string;
  /** Color of the radio when checked */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /** Value for the radio input */
  value?: string;
  /** Name for the radio group */
  name?: string;
}

/**
 * Radio component for capturing selection from a set of options
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      helperText,
      error = false,
      checked = false,
      onChange,
      size = 'medium',
      id: providedId,
      className,
      color = 'primary',
      disabled,
      value,
      name,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const id = providedId || `radio-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;

    // Helper function to access theme values
    const getThemeVal = (path: string): string =>
      currentTheme ? getThemeValue(currentTheme, path) : '';

    // Calculate sizes based on component size
    const getRadioSize = () => {
      if (size === 'small') return '16px';
      if (size === 'large') return '24px';
      return '20px'; // medium
    };

    // Get color based on state and color prop
    const getBorderColor = () => {
      if (disabled) return getThemeVal('colors.gray.300');
      if (error) return getThemeVal('colors.error.500');
      if (checked) {
        if (color === 'primary') return getThemeVal('colors.primary.500');
        if (color === 'secondary') return getThemeVal('colors.secondary.500');
        if (color === 'success') return getThemeVal('colors.success');
        if (color === 'error') return getThemeVal('colors.error.500');
        if (color === 'warning') return getThemeVal('colors.warning');
        if (color === 'info') return getThemeVal('colors.info');
      }
      return getThemeVal('colors.gray.500');
    };

    const getBackgroundColor = () => {
      return 'transparent'; // Radio button has transparent background, only the dot shows
    };

    const getDotColor = () => {
      if (disabled) return getThemeVal('colors.gray.300');
      if (color === 'primary') return getThemeVal('colors.primary.500');
      if (color === 'secondary') return getThemeVal('colors.secondary.500');
      if (color === 'success') return getThemeVal('colors.success');
      if (color === 'error') return getThemeVal('colors.error.500');
      if (color === 'warning') return getThemeVal('colors.warning');
      if (color === 'info') return getThemeVal('colors.info');
      return getThemeVal('colors.primary.500');
    };

    const getTextColor = () => {
      if (disabled) return getThemeVal('colors.gray.400');
      if (error) return getThemeVal('colors.error.500');
      return getThemeVal('colors.gray.900');
    };

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'flex-start',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: getThemeVal('typography.scale.base'),
      fontFamily: getThemeVal('typography.family'),
    };

    // Radio button outer circle styles
    const radioOuterStyles: React.CSSProperties = {
      width: getRadioSize(),
      height: getRadioSize(),
      position: 'relative',
      borderRadius: '50%',
      border: `2px solid ${getBorderColor()}`,
      backgroundColor: getBackgroundColor(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      marginRight: '8px',
      marginTop: '2px', // Better vertical alignment with label
    };

    // Radio button inner dot styles
    const radioInnerDotStyles: React.CSSProperties = {
      width: `calc(${getRadioSize()} - 10px)`,
      height: `calc(${getRadioSize()} - 10px)`,
      borderRadius: '50%',
      backgroundColor: getDotColor(),
      opacity: checked ? 1 : 0,
      transform: checked ? 'scale(1)' : 'scale(0)',
      transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Hide the actual input visually but keep it accessible
    const inputStyles: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      margin: 0,
      padding: 0,
      zIndex: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontSize: getThemeVal('typography.scale.base'),
      lineHeight: 1.5,
      color: getTextColor(),
      userSelect: 'none',
    };

    // Helper text styles
    const helperTextStyles: React.CSSProperties = {
      marginTop: '4px',
      marginLeft: `calc(${getRadioSize()} + 8px)`, // Align with label
      fontSize: getThemeVal('typography.scale.xs'),
      color: error ? getThemeVal('colors.error.500') : getThemeVal('colors.gray.500'),
    };

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange?.(e.target.checked, e);
      }
    };

    return (
      <div className={className}>
        <label style={containerStyles} htmlFor={id}>
          <div style={radioOuterStyles}>
            <div style={radioInnerDotStyles} />
            <input
              {...props}
              id={id}
              ref={ref}
              type="radio"
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              value={value}
              name={name}
              aria-checked={checked}
              aria-describedby={helperText ? helperId : undefined}
              style={inputStyles}
            />
          </div>
          {label && (
            <span id={labelId} style={labelStyles}>
              {label}
            </span>
          )}
        </label>
        {helperText && (
          <div id={helperId} style={helperTextStyles}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio; 