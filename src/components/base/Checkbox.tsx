import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

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
    const theme = useDirectTheme();
    const id = providedId || `checkbox-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;

    // Calculate sizes based on component size
    const getCheckboxSize = () => {
      if (size === 'small') return '16px';
      if (size === 'large') return '24px';
      return '20px'; // medium
    };

    // Get color based on state and color prop
    const getBorderColor = () => {
      if (disabled) return theme.getColor('gray.300', '#d1d5db');
      if (error) return theme.getColor('error', '#f44336');
      if (checked || indeterminate) {
        if (color === 'primary') return theme.getColor('primary', '#1976d2');
        if (color === 'secondary') return theme.getColor('secondary', '#dc004e');
        if (color === 'success') return theme.getColor('success', '#4caf50');
        if (color === 'error') return theme.getColor('error', '#f44336');
        if (color === 'warning') return theme.getColor('warning', '#ff9800');
        if (color === 'info') return theme.getColor('info', '#2196f3');
      }
      return theme.getColor('gray.500', '#6b7280');
    };

    const getBackgroundColor = () => {
      if (disabled) return checked ? theme.getColor('gray.300', '#d1d5db') : 'transparent';
      if (checked || indeterminate) {
        if (color === 'primary') return theme.getColor('primary', '#1976d2');
        if (color === 'secondary') return theme.getColor('secondary', '#dc004e');
        if (color === 'success') return theme.getColor('success', '#4caf50');
        if (color === 'error') return theme.getColor('error', '#f44336');
        if (color === 'warning') return theme.getColor('warning', '#ff9800');
        if (color === 'info') return theme.getColor('info', '#2196f3');
      }
      return 'transparent';
    };

    const getTextColor = () => {
      if (disabled) return theme.getColor('gray.400', '#9ca3af');
      if (error) return theme.getColor('error', '#f44336');
      return theme.getColor('gray.900', '#111827');
    };

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'flex-start',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: theme.getTypography('fontSize.md', '1rem') as string,
      fontFamily: theme.getTypography('fontFamily.base', 'system-ui, sans-serif') as string,
    };

    // Checkbox styles (outer box)
    const checkboxOuterStyles: React.CSSProperties = {
      width: getCheckboxSize(),
      height: getCheckboxSize(),
      position: 'relative',
      borderRadius: theme.getBorderRadius('sm', '4px'),
      border: `2px solid ${getBorderColor()}`,
      backgroundColor: getBackgroundColor(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: theme.getTransition('duration.fast', '150ms') + ' cubic-bezier(0.4, 0, 0.2, 1)',
      marginRight: '8px',
      marginTop: '2px', // Better vertical alignment with label
    };

    // Check mark (SVG) styles
    const checkMarkStyles: React.CSSProperties = {
      fill: 'none',
      stroke: disabled ? theme.getColor('gray.100', '#f3f4f6') : '#ffffff',
      strokeWidth: 2,
      visibility: checked ? 'visible' : 'hidden',
    };

    // Indeterminate mark styles
    const indeterminateMarkStyles: React.CSSProperties = {
      width: '60%',
      height: '2px',
      backgroundColor: disabled ? theme.getColor('gray.100', '#f3f4f6') : '#ffffff',
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
      fontSize: theme.getTypography('fontSize.md', '1rem') as string,
      lineHeight: 1.5,
      color: getTextColor(),
      userSelect: 'none',
    };

    // Helper text styles
    const helperTextStyles: React.CSSProperties = {
      marginTop: '4px',
      marginLeft: `calc(${getCheckboxSize()} + 8px)`, // Align with label
      fontSize: theme.getTypography('fontSize.xs', '0.75rem') as string,
      color: error ? theme.getColor('error', '#f44336') : theme.getColor('gray.500', '#6b7280'),
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
      <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', padding: '2px' }}>
        <path style={checkMarkStyles} d="M5,13l3,3l9-9" />
      </svg>
    );

    // Render indeterminate mark
    const renderIndeterminateMark = () => <div style={indeterminateMarkStyles} />;

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
