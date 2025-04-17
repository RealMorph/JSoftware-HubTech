import { ThemeConfig } from './types';

/**
 * Recursively sets CSS variables for nested theme objects
 */
function setNestedCSSVariables(root: HTMLElement, prefix: string, obj: Record<string, any>): void {
  if (!obj) return;

  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      setNestedCSSVariables(root, `${prefix}-${key}`, value);
    } else if (value !== undefined && value !== null) {
      root.style.setProperty(`--${prefix}-${key}`, String(value));
    }
  });
}

/**
 * Applies a theme to the document by setting CSS variables
 */
export const applyTheme = (theme: ThemeConfig) => {
  console.log('Applying theme:', theme.name || 'unnamed theme');

  if (!theme) {
    console.error('No theme provided to applyTheme');
    return;
  }

  // Apply theme to document root
  const root = document.documentElement;

  // Apply colors
  if (theme.colors) {
    // Primary and secondary colors
    if (theme.colors.primary) root.style.setProperty('--color-primary', theme.colors.primary);
    if (theme.colors.secondary) root.style.setProperty('--color-secondary', theme.colors.secondary);

    // Background colors
    if (theme.colors.background) {
      Object.entries(theme.colors.background).forEach(([key, value]) => {
        root.style.setProperty(`--color-background-${key}`, value);
      });
    }

    // Text colors
    if (theme.colors.textColors) {
      Object.entries(theme.colors.textColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-text-${key}`, value);
      });
    }

    // Border colors
    if (theme.colors.border) {
      Object.entries(theme.colors.border).forEach(([key, value]) => {
        root.style.setProperty(`--color-border-${key}`, value);
      });
    }

    // State colors
    if (theme.colors.success) root.style.setProperty('--color-success', theme.colors.success);
    if (theme.colors.warning) root.style.setProperty('--color-warning', theme.colors.warning);
    if (theme.colors.error) root.style.setProperty('--color-error', theme.colors.error);
  }

  // Apply typography
  if (theme.typography && theme.typography.family) {
    root.style.setProperty('--font-family-primary', theme.typography.family.primary);
    root.style.setProperty('--font-family-secondary', theme.typography.family.secondary);
    root.style.setProperty('--font-family-monospace', theme.typography.family.monospace);

    if (theme.typography.scale) {
      Object.entries(theme.typography.scale).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value);
      });
    }

    if (theme.typography.weights) {
      Object.entries(theme.typography.weights).forEach(([key, value]) => {
        root.style.setProperty(`--font-weight-${key}`, value);
      });
    }

    if (theme.typography.lineHeights) {
      Object.entries(theme.typography.lineHeights).forEach(([key, value]) => {
        root.style.setProperty(`--line-height-${key}`, value);
      });
    }

    if (theme.typography.letterSpacing) {
      Object.entries(theme.typography.letterSpacing).forEach(([key, value]) => {
        root.style.setProperty(`--letter-spacing-${key}`, value);
      });
    }
  }

  // Apply spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        root.style.setProperty(`--spacing-${key}`, value);
      }
    });
  }

  // Apply breakpoints
  if (theme.breakpoints) {
    Object.entries(theme.breakpoints).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        root.style.setProperty(`--breakpoint-${key}`, value);
      }
    });
  }

  // Apply border radius
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
  }

  // Apply shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }

  // Apply transitions
  if (theme.transitions) {
    Object.entries(theme.transitions).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value);
    });
  }

  console.log('Theme applied successfully');
};
