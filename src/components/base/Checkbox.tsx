import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getThemeValue } from '../../core/theme/styled';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'>;

export interface CheckboxProps extends InputProps {
  /** Label for the checkbox */
  label?: string;
  /** Helper text to display below the checkbox */
  helperText?: string;
  /** Whether the checkbox is in an error state */
  error?: boolean;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Whether the checkbox is indeterminate */
  indeterminate?: boolean;
  /** Function called when the checkbox state changes */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Size of the checkbox */
  size?: 'small' | 'medium' | 'large';
  /** ID for the input element. Auto-generated if not provided */
  id?: string;
  /** ClassName for the root element */
  className?: string;
  /** Color of the checkbox when checked */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

/**
 * Checkbox component for capturing boolean input
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error = false,
      checked = false,
      indeterminate = false,
      onChange,
      size = 'medium',
      id: providedId,
      className,
      color = 'primary',
      disabled,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const id = providedId || `checkbox-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;

    // Helper function to access theme values
    const getThemeVal = (path: string): string =>
      currentTheme ? getThemeValue(currentTheme, path) : '';

    // Calculate sizes based on component size
    const getCheckboxSize = () => {
      if (size === 'small') return '16px';
      if (size === 'large') return '24px';
      return '20px'; // medium
    };

    // Get color based on state and color prop
    const getBorderColor = () => {
      if (disabled) return getThemeVal('colors.gray.300');
      if (error) return getThemeVal('colors.error.500');
      if (checked || indeterminate) {
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
      if (disabled) return checked ? getThemeVal('colors.gray.300') : 'transparent';
      if (checked || indeterminate) {
        if (color === 'primary') return getThemeVal('colors.primary.500');
        if (color === 'secondary') return getThemeVal('colors.secondary.500');
        if (color === 'success') return getThemeVal('colors.success');
        if (color === 'error') return getThemeVal('colors.error.500');
        if (color === 'warning') return getThemeVal('colors.warning');
        if (color === 'info') return getThemeVal('colors.info');
      }
      return 'transparent';
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

    // Checkbox styles (outer box)
    const checkboxOuterStyles: React.CSSProperties = {
      width: getCheckboxSize(),
      height: getCheckboxSize(),
      position: 'relative',
      borderRadius: '4px',
      border: `2px solid ${getBorderColor()}`,
      backgroundColor: getBackgroundColor(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      marginRight: '8px',
      marginTop: '2px', // Better vertical alignment with label
    };

    // Check mark (SVG) styles
    const checkMarkStyles: React.CSSProperties = {
      fill: 'none',
      stroke: disabled ? getThemeVal('colors.gray.100') : 'white',
      strokeWidth: 2,
      visibility: checked ? 'visible' : 'hidden',
    };

    // Indeterminate mark styles
    const indeterminateMarkStyles: React.CSSProperties = {
      width: '60%',
      height: '2px',
      backgroundColor: disabled ? getThemeVal('colors.gray.100') : 'white',
      visibility: indeterminate ? 'visible' : 'hidden',
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
      marginLeft: `calc(${getCheckboxSize()} + 8px)`, // Align with label
      fontSize: getThemeVal('typography.scale.xs'),
      color: error ? getThemeVal('colors.error.500') : getThemeVal('colors.gray.500'),
    };

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange?.(e.target.checked, e);
      }
    };

    // Set indeterminate prop on input element using ref
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    // Render check mark SVG
    const renderCheckMark = () => (
      <svg
        viewBox="0 0 24 24"
        style={{ width: '100%', height: '100%', padding: '2px' }}
      >
        <path
          style={checkMarkStyles}
          d="M5,13l3,3l9-9"
        />
      </svg>
    );

    // Render indeterminate mark
    const renderIndeterminateMark = () => (
      <div style={indeterminateMarkStyles} />
    );

    return (
      <div className={className}>
        <label style={containerStyles} htmlFor={id}>
          <div style={checkboxOuterStyles}>
            {renderCheckMark()}
            {renderIndeterminateMark()}
            <input
              {...props}
              id={id}
              ref={ref}
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              aria-checked={indeterminate ? 'mixed' : checked}
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

Checkbox.displayName = 'Checkbox';

export default Checkbox; 