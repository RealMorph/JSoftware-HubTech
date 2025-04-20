import { ThemeConfig } from './consolidated-types';

/**
 * Default theme to use when no theme is available
 */
export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default Theme',
  description: 'Default system theme',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#0062CC',
    success: '#34C759',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      disabled: '#8E8E93'
    },
    background: '#FFFFFF',
    border: '#C7C7CC',
    surface: '#FFFFFF',
    hover: {
      background: '#F5F5F5',
      border: '#E0E0E0'
    },
    focus: {
      border: '#0062CC',
      shadow: 'rgba(0, 98, 204, 0.25)'
    },
    private: {
      buttonBg: '#E5E5EA',
      buttonHover: '#D1D1D6',
      googleButton: '#4285F4'
    },
    node: {
      default: '#DDDDDD',
      active: '#007AFF',
      hover: '#F5F5F5',
      text: '#000000'
    },
    edge: {
      default: '#CCCCCC',
      active: '#007AFF',
      hover: '#F5F5F5',
      text: '#000000'
    }
  },
  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      heading:
        'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
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
    '2xl': '2.5rem',
    '3xl': '3rem',
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    input: '0 2px 4px rgba(0, 0, 0, 0.05)',
    button: '0 2px 4px rgba(0, 0, 0, 0.12)',
  },
  transitions: {
    fastest: '50ms',
    faster: '100ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms',
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
    toast: 1700,
    tooltip: 1800,
  },
  animation: {
    duration: {
      shortest: '100ms',
      shorter: '150ms',
      short: '200ms',
      standard: '300ms', 
      medium: '400ms',
      long: '500ms',
      longer: '700ms',
      longest: '1000ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cubic: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
    variants: {
      fade: {
        in: { opacity: 0, opacity_to: 1 },
        out: { opacity: 1, opacity_to: 0 },
      },
      slide: {
        up: { transform: 'translateY(20px)', transform_to: 'translateY(0)' },
        down: { transform: 'translateY(-20px)', transform_to: 'translateY(0)' },
        left: { transform: 'translateX(20px)', transform_to: 'translateX(0)' },
        right: { transform: 'translateX(-20px)', transform_to: 'translateX(0)' },
      },
      scale: {
        in: { transform: 'scale(0.9)', transform_to: 'scale(1)' },
        out: { transform: 'scale(1)', transform_to: 'scale(0.9)' },
      },
      rotate: {
        in: { transform: 'rotate(-5deg)', transform_to: 'rotate(0deg)' },
        out: { transform: 'rotate(0deg)', transform_to: 'rotate(5deg)' },
      },
    },
    motionSafe: {
      enabled: true,
      reducedIntensity: false,
    },
    performance: {
      highPerformance: true,
      willChangeEnabled: true,
      gpuRenderingEnabled: true,
    },
  },
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default defaultTheme;
