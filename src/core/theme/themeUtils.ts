import { ThemeStyles } from './themeTypes';

/**
 * Creates theme styles object from theme configuration
 */
export const createThemeStyles = (theme: any): ThemeStyles => {
  return {
    colors: {
      primary: theme.colors?.primary || '#1976d2',
      secondary: theme.colors?.secondary || '#f50057',
      background: theme.colors?.background || '#ffffff',
      surface: theme.colors?.surface || '#f5f5f5',
      border: theme.colors?.border || '#e0e0e0',
      buttonBg: theme.colors?.buttonBg || '#1976d2',
      buttonHover: theme.colors?.buttonHover || '#1565c0',
      googleButton: theme.colors?.googleButton || '#ffffff',
      text: {
        primary: theme.colors?.text?.primary || '#212121',
        secondary: theme.colors?.text?.secondary || '#757575',
      },
      error: theme.colors?.error || '#d32f2f',
      warning: theme.colors?.warning || '#f57c00',
      success: theme.colors?.success || '#388e3c',
      info: theme.colors?.info || '#0288d1',
    },
    typography: {
      fontFamily: theme.typography?.fontFamily || 'Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        xs: theme.typography?.fontSize?.xs || '0.75rem',
        sm: theme.typography?.fontSize?.sm || '0.875rem',
        md: theme.typography?.fontSize?.md || '1rem',
        lg: theme.typography?.fontSize?.lg || '1.25rem',
        xl: theme.typography?.fontSize?.xl || '1.5rem',
      },
      fontWeight: {
        light: theme.typography?.fontWeight?.light || 300,
        normal: theme.typography?.fontWeight?.normal || 400,
        medium: theme.typography?.fontWeight?.medium || 500,
        semibold: theme.typography?.fontWeight?.semibold || 600,
        bold: theme.typography?.fontWeight?.bold || 700,
      },
    },
    spacing: {
      xs: theme.spacing?.xs || '4px',
      sm: theme.spacing?.sm || '8px',
      md: theme.spacing?.md || '16px',
      lg: theme.spacing?.lg || '24px',
      xl: theme.spacing?.xl || '32px',
    },
    borderRadius: {
      sm: theme.borderRadius?.sm || '4px',
      md: theme.borderRadius?.md || '8px',
      lg: theme.borderRadius?.lg || '16px',
      full: theme.borderRadius?.full || '9999px',
    },
    shadows: {
      sm: theme.shadows?.sm || '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      md: theme.shadows?.md || '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
      lg: theme.shadows?.lg || '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
      input: theme.shadows?.input || '0 0 0 2px rgba(25, 118, 210, 0.2)',
      button: theme.shadows?.button || '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    },
  };
}; 