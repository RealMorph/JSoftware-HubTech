import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState, forwardRef } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define ThemeStyles interface to structure theme-related properties
/**
 * @typedef {Object} ThemeStyles
 * @property {string} fontSize
 * @property {string} fontFamily
 * @property {string} errorColor
 * @property {string} primaryColor
 * @property {string} grayColor400
 * @property {string} grayColor600
 * @property {string} grayColor900
 * @property {string} grayColor100
 * @property {string} grayColor50
 * @property {string} grayColor300
 * @property {string} grayColor500
 * @property {string} typographyScaleSm
 * @property {string} typographyScaleXs
 * @property {string} spacing4
 */

/**
 * Creates theme styles from DirectTheme context
 * @param {import('../../core/theme/DirectThemeProvider').DirectTheme} themeContext
 * @returns {ThemeStyles}
 */
function createThemeStyles(themeContext) {
  return {
    fontSize: themeContext.getTypography('scale.base'),
    fontFamily: themeContext.getTypography('family'),
    errorColor: themeContext.getColor('error.500'),
    primaryColor: themeContext.getColor('primary.500'),
    grayColor400: themeContext.getColor('gray.400'),
    grayColor600: themeContext.getColor('gray.600'),
    grayColor900: themeContext.getColor('gray.900'),
    grayColor100: themeContext.getColor('gray.100'),
    grayColor50: themeContext.getColor('gray.50'),
    grayColor300: themeContext.getColor('gray.300'),
    grayColor500: themeContext.getColor('gray.500'),
    typographyScaleSm: themeContext.getTypography('scale.sm'),
    typographyScaleXs: themeContext.getTypography('scale.xs'),
    spacing4: themeContext.getSpacing('4'),
  };
}

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
    const themeContext = useDirectTheme();
    const themeStyles = createThemeStyles(themeContext);
    
    const id = providedId || `text-field-${Math.random().toString(36).substring(2, 11)}`;
    const labelId = `${id}-label`;
    const helperId = `${id}-helper`;
    const hasAdornments = Boolean(startAdornment || endAdornment);
    
    const getSpacing = (multiplier = 1) => {
      const baseSize = parseInt(themeStyles.spacing4, 10) || 16;
      return `${baseSize * multiplier}px`;
    };
    
    const rootStyles = {
      display: 'inline-flex',
      flexDirection: 'column',
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
      margin: `${getSpacing(0.25)} 0`,
      fontSize: themeStyles.fontSize,
      fontFamily: themeStyles.fontFamily,
    };
    
    const getLabelColor = () => {
      if (disabled) return themeStyles.grayColor400;
      if (error) return themeStyles.errorColor;
      if (focused) return themeStyles.primaryColor;
      return themeStyles.grayColor600;
    };
    
    const labelStyles = {
      color: getLabelColor(),
      marginBottom: getSpacing(0.25),
      transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
      fontSize: themeStyles.typographyScaleSm,
    };
    
    const getInputBorderColor = () => {
      if (disabled) return themeStyles.grayColor300;
      if (error) return themeStyles.errorColor;
      if (focused) return themeStyles.primaryColor;
      return themeStyles.grayColor400;
    };
    
    const getInputBgColor = () => {
      if (disabled) return themeStyles.grayColor100;
      if (variant === 'filled') return themeStyles.grayColor50;
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
      color: disabled ? themeStyles.grayColor400 : themeStyles.grayColor900,
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
      color: themeStyles.grayColor500,
    };
    
    const helperTextStyles = {
      marginTop: getSpacing(0.25),
      color: error ? themeStyles.errorColor : themeStyles.grayColor500,
      fontSize: themeStyles.typographyScaleXs,
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
                _jsx('span', { style: { color: themeStyles.errorColor }, children: ' *' }),
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

      fontSize: themeStyles.typographyScaleXs,
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
                _jsx('span', { style: { color: themeStyles.errorColor }, children: ' *' }),
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
