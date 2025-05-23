import { ThemeConfig } from './consolidated-types';

/**
 * Default theme configuration that matches the consolidated types
 */
export const themeDefaults: ThemeConfig = {
  colors: {
    primary: '#0073ea',
    secondary: '#5034ff',
    error: '#e44258',
    warning: '#fdab3d',
    info: '#579bfc',
    success: '#00c875',
    background: '#f6f7fb',
    surface: '#ffffff',
    border: '#c3c6d4',
    text: {
      primary: '#323338',
      secondary: '#676879',
    },
    hover: {
      background: 'rgba(0, 0, 0, 0.04)',
      border: '#0073ea',
    },
    focus: {
      border: '#0073ea',
      shadow: '0 0 0 2px rgba(0, 115, 234, 0.25)',
    },
    private: {
      buttonBg: '#0073ea',
      buttonHover: '#0060b9',
      googleButton: '#fff',
    },
    node: {
      default: '#007AFF',
      active: '#5856D6',
      hover: '#5AC8FA',
      text: '#FFFFFF',
    },
    edge: {
      default: '#C7C7CC',
      active: '#5856D6',
      hover: '#5AC8FA',
      text: '#3C3C43',
    },
  },
  typography: {
    fontFamily: {
      base: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      heading: 'Poppins, Roboto, sans-serif',
      monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    none: '0',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    input: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.08)',
    button: '0 4px 6px -1px rgba(0, 115, 234, 0.2), 0 2px 4px -1px rgba(0, 115, 234, 0.12)',
  },
  transitions: {
    fastest: '50ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms'
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700,
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  animation: {
    duration: {
      short: '100ms',
      medium: '200ms',
      long: '300ms'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
    }
  },
};

export default themeDefaults; 