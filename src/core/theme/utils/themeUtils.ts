/**
 * Theme utility functions for consistent styling across components
 */
import { Theme, ThemeStyles } from '../types';

/**
 * Creates a theme styles object from a theme context
 * @param theme The theme context
 * @returns A themed styles object with colors, typography, spacing, etc.
 */
export const createThemeStyles = (theme: any): ThemeStyles => {
  // Base implementation that can be used across different components
  // Each component can extend this as needed with their specific theme requirements
  return {
    colors: {
      background: {
        default: theme.getColor?.('background.default', '#ffffff'),
        paper: theme.getColor?.('background.paper', '#f5f5f5'),
        subtle: theme.getColor?.('background.subtle', '#f0f0f0'),
      },
      text: {
        primary: theme.getColor?.('text.primary', '#333333'),
        secondary: theme.getColor?.('text.secondary', '#666666'),
        disabled: theme.getColor?.('text.disabled', '#999999'),
      },
      primary: {
        main: theme.getColor?.('primary.main', '#1976d2'),
        light: theme.getColor?.('primary.light', '#42a5f5'),
        dark: theme.getColor?.('primary.dark', '#1565c0'),
        contrastText: theme.getColor?.('primary.contrastText', '#ffffff'),
      },
      border: {
        main: theme.getColor?.('border.main', '#e0e0e0'),
      },
      hover: {
        light: theme.getColor?.('action.hover', '#f5f5f5'),
      },
      // Optional chart colors for data visualization components
      chart: {
        axis: theme.getColor?.('chart.axis', '#888888'),
        grid: theme.getColor?.('chart.grid', '#e0e0e0'),
        tooltip: theme.getColor?.('chart.tooltip', 'rgba(0, 0, 0, 0.7)'),
        point: {
          default: theme.getColor?.('chart.point.default', '#1976d2'),
          hover: theme.getColor?.('chart.point.hover', '#42a5f5'),
          active: theme.getColor?.('chart.point.active', '#1565c0'),
        },
        bar: {
          default: theme.getColor?.('chart.bar.default', '#1976d2'),
          hover: theme.getColor?.('chart.bar.hover', '#42a5f5'),
          active: theme.getColor?.('chart.bar.active', '#1565c0'),
        },
        line: {
          default: theme.getColor?.('chart.line.default', '#1976d2'),
          hover: theme.getColor?.('chart.line.hover', '#42a5f5'),
          active: theme.getColor?.('chart.line.active', '#1565c0'),
        },
        pie: {
          default: theme.getColor?.('chart.pie.default', '#1976d2'),
          hover: theme.getColor?.('chart.pie.hover', '#42a5f5'),
          active: theme.getColor?.('chart.pie.active', '#1565c0'),
        },
      },
    },
    typography: {
      fontSize: {
        xs: theme.getTypography?.('fontSize.xs', '0.75rem'),
        sm: theme.getTypography?.('fontSize.sm', '0.875rem'),
        md: theme.getTypography?.('fontSize.md', '1rem'),
        lg: theme.getTypography?.('fontSize.lg', '1.25rem'),
        xl: theme.getTypography?.('fontSize.xl', '1.5rem'),
      },
      fontWeight: {
        normal: theme.getTypography?.('fontWeight.normal', 400),
        medium: theme.getTypography?.('fontWeight.medium', 500),
        semibold: theme.getTypography?.('fontWeight.semibold', 600),
        bold: theme.getTypography?.('fontWeight.bold', 700),
      },
      family: theme.getTypography?.('family.base', 'inherit'),
      lineHeight: {
        normal: 1.5,
      },
    },
    borders: {
      radius: {
        small: theme.getBorderRadius?.('sm', '4px'),
        medium: theme.getBorderRadius?.('md', '8px'),
        large: theme.getBorderRadius?.('lg', '12px'),
      },
      focus: {
        width: '2px',
        color: theme.getColor?.('primary.main', '#1976d2') + '33', // 20% opacity
      },
    },
    shadows: {
      card: theme.getShadow?.('card', '0 2px 8px rgba(0, 0, 0, 0.1)'),
      tooltip: theme.getShadow?.('tooltip', '0 2px 10px rgba(0, 0, 0, 0.2)'),
      legend: theme.getShadow?.('legend', '0 1px 4px rgba(0, 0, 0, 0.1)'),
    },
    spacing: {
      xs: theme.getSpacing?.('xs', '4px'),
      sm: theme.getSpacing?.('sm', '8px'),
      md: theme.getSpacing?.('md', '16px'),
      lg: theme.getSpacing?.('lg', '24px'),
      xl: theme.getSpacing?.('xl', '32px'),
      item: theme.getSpacing?.('item', '8px'),
      icon: theme.getSpacing?.('icon', '4px'),
      container: {
        vertical: theme.getSpacing?.('container.vertical', '8px'),
        horizontal: theme.getSpacing?.('container.horizontal', '12px'),
      },
      element: {
        height: theme.getSpacing?.('element.height', '32px'),
        padding: theme.getSpacing?.('element.padding', '8px'),
      }
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      },
      hover: {
        scale: '1.05',
      },
    },
  };
};

/**
 * Extends the base theme styles with component-specific theme values
 * @param baseStyles The base theme styles
 * @param componentStyles Component-specific theme style extensions
 * @returns Merged theme styles
 */
export const extendThemeStyles = (baseStyles: ThemeStyles, componentStyles: Partial<ThemeStyles>): ThemeStyles => {
  // Ensure animation has required properties
  const mergedAnimation = componentStyles.animation ? {
    duration: {
      fast: componentStyles.animation.duration?.fast || baseStyles.animation?.duration?.fast || '150ms',
      normal: componentStyles.animation.duration?.normal || baseStyles.animation?.duration?.normal || '300ms',
      slow: componentStyles.animation.duration?.slow || baseStyles.animation?.duration?.slow
    },
    easing: {
      easeInOut: componentStyles.animation.easing?.easeInOut || baseStyles.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: componentStyles.animation.easing?.easeOut || baseStyles.animation?.easing?.easeOut,
      easeIn: componentStyles.animation.easing?.easeIn || baseStyles.animation?.easing?.easeIn
    },
    hover: componentStyles.animation.hover || baseStyles.animation?.hover
  } : baseStyles.animation;

  return {
    ...baseStyles,
    ...componentStyles,
    colors: {
      ...baseStyles.colors,
      ...componentStyles.colors,
    },
    typography: {
      ...baseStyles.typography,
      ...componentStyles.typography,
    },
    spacing: {
      ...baseStyles.spacing,
      ...componentStyles.spacing,
    },
    borders: {
      ...baseStyles.borders,
      ...componentStyles.borders,
    },
    shadows: {
      ...baseStyles.shadows,
      ...componentStyles.shadows,
    },
    animation: mergedAnimation,
  };
};

export default {
  createThemeStyles,
  extendThemeStyles
}; 