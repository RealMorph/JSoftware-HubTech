import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState, forwardRef } from 'react';
import { useTheme } from '../../core/theme/theme-context';
import { getThemeValue } from '../../core/theme/styled';
export const TextField = forwardRef(
  (
    {
      label,
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
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const { currentTheme } = useTheme();
    const id = providedId || `text-field-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;
    const hasAdornments = Boolean(startAdornment || endAdornment);
    const getThemeVal = path => (currentTheme ? getThemeValue(currentTheme, path) : '');
    const getSpacing = (multiplier = 1) => {
      const baseSize = currentTheme ? parseInt(getThemeVal('spacing.4'), 10) : 16;
      return `${baseSize * multiplier}px`;
    };
    const rootStyles = {
      display: 'inline-flex',
      flexDirection: 'column',
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
      margin: `${getSpacing(0.25)} 0`,
      fontSize: getThemeVal('typography.scale.base'),
      fontFamily: getThemeVal('typography.family'),
    };
    const getLabelColor = () => {
      if (disabled) return getThemeVal('colors.gray.400');
      if (error) return getThemeVal('colors.error.500');
      if (focused) return getThemeVal('colors.primary.500');
      return getThemeVal('colors.gray.600');
    };
    const labelStyles = {
      color: getLabelColor(),
      marginBottom: getSpacing(0.25),
      transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
      fontSize: getThemeVal('typography.scale.sm'),
    };
    const getInputBorderColor = () => {
      if (disabled) return getThemeVal('colors.gray.300');
      if (error) return getThemeVal('colors.error.500');
      if (focused) return getThemeVal('colors.primary.500');
      return getThemeVal('colors.gray.400');
    };
    const getInputBgColor = () => {
      if (disabled) return getThemeVal('colors.gray.100');
      if (variant === 'filled') return getThemeVal('colors.gray.50');
      return 'transparent';
    };
    const getInputHeight = () => {
      if (size === 'small') return '32px';
      if (size === 'large') return '56px';
      return '40px';
    };
    const inputContainerStyles = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      borderRadius: getSpacing(0.25),
      border: `1px solid ${getInputBorderColor()}`,
      backgroundColor: getInputBgColor(),
      height: getInputHeight(),
      padding: hasAdornments ? `0 ${getSpacing(0.25)}` : undefined,
      transition:
        'background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, border-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
    };
    const inputStyles = {
      flex: 1,
      border: 'none',
      backgroundColor: 'transparent',
      outline: 'none',
      color: disabled ? getThemeVal('colors.gray.400') : getThemeVal('colors.gray.900'),
      padding: hasAdornments ? `0 ${getSpacing(0.25)}` : `0 ${getSpacing(0.5)}`,
      height: '100%',
      width: '100%',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit',
    };
    const adornmentStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: getThemeVal('colors.gray.500'),
    };
    const helperTextStyles = {
      marginTop: getSpacing(0.25),
      color: error ? getThemeVal('colors.error.500') : getThemeVal('colors.gray.500'),
      fontSize: getThemeVal('typography.scale.xs'),
    };
    const handleChange = e => {
      onChange?.(e.target.value, e);
    };
    const handleFocus = e => {
      setFocused(true);
      props.onFocus?.(e);
    };
    const handleBlur = e => {
      setFocused(false);
      props.onBlur?.(e);
    };
    return _jsxs('div', {
      style: rootStyles,
      className: className,
      children: [
        label &&
          _jsxs('label', {
            id: labelId,
            htmlFor: id,
            style: labelStyles,
            children: [
              label,
              required &&
                _jsx('span', { style: { color: getThemeVal('colors.error.500') }, children: ' *' }),
            ],
          }),
        _jsxs('div', {
          style: inputContainerStyles,
          children: [
            startAdornment && _jsx('div', { style: adornmentStyles, children: startAdornment }),
            _jsx('input', {
              ...props,
              id: id,
              ref: ref,
              'aria-invalid': error,
              'aria-describedby': helperText ? helperId : undefined,
              onChange: handleChange,
              onFocus: handleFocus,
              onBlur: handleBlur,
              style: inputStyles,
              disabled: disabled,
              required: required,
            }),
            endAdornment && _jsx('div', { style: adornmentStyles, children: endAdornment }),
          ],
        }),
        helperText && _jsx('div', { id: helperId, style: helperTextStyles, children: helperText }),
      ],
    });
  }
);
TextField.displayName = 'TextField';
