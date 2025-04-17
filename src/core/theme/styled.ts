import { css } from '@emotion/react';
import type { CSSProperties } from 'react';
import { ThemeConfig, defaultTheme } from './theme-persistence';
import { Theme, ThemeVisualConfig } from './types';
import { themeValueFallbacks } from './theme-utils';

// Type for our theme-aware CSS properties
type ThemeValue = string | number;
type ThemeObject = { [key: string]: ThemeValue | ThemeObject };

// Type for our theme-aware CSS properties
export type ThemeAwareCSS = CSSProperties & {
  [key: string]: ThemeValue | ThemeObject;
};

// Updated getThemeValue function that uses theme fallbacks
export function getThemeValue(theme: any, path: string): string {
  // If no theme is provided, use the fallbacks right away
  if (!theme) {
    return themeValueFallbacks[path] || '';
  }

  // Try to get the value from the theme
  try {
    const parts = path.split('.');
    let value: any = theme;

    for (const part of parts) {
      if (value === undefined || value === null) {
        // Try fallback
        return themeValueFallbacks[path] || '';
      }
      value = value[part];
    }

    if (value !== undefined && value !== null) {
      return String(value);
    }
  } catch (e) {
    // If any error occurs, use fallback
    console.warn(`Error accessing theme value for path: ${path}`, e);
  }

  // Use fallback if value not found
  const fallbackValue = themeValueFallbacks[path] || '';
  if (!fallbackValue) {
    console.warn(`Theme value not found and no fallback available: ${path}`);
  }
  return fallbackValue;
}

// Create a theme-aware CSS function
export const themed = (cssFn: (theme: ThemeConfig) => ThemeAwareCSS) => {
  return (theme: ThemeConfig | undefined) => {
    // Use default theme if no theme is provided
    const themeToUse = theme || defaultTheme;
    const styles = cssFn(themeToUse);
    return css(styles as any); // Type assertion needed due to Emotion's type constraints
  };
};

// Common theme-aware style mixins
export const mixins = {
  // Typography mixins
  text: (size: string = 'base') =>
    themed(theme => ({
      fontSize: getThemeValue(theme, `typography.scale.${size}`),
      lineHeight: getThemeValue(theme, 'typography.lineHeights.normal'),
    })),

  heading: (size: string = '2xl') =>
    themed(theme => ({
      fontSize: getThemeValue(theme, `typography.scale.${size}`),
      fontWeight: getThemeValue(theme, 'typography.weights.bold'),
      lineHeight: getThemeValue(theme, 'typography.lineHeights.tight'),
    })),

  // Spacing mixins
  padding: (size: string = '4') =>
    themed(theme => ({
      padding: getThemeValue(theme, `spacing.${size}`),
    })),

  margin: (size: string = '4') =>
    themed(theme => ({
      margin: getThemeValue(theme, `spacing.${size}`),
    })),

  // Color mixins
  bg: (color: string) =>
    themed(theme => ({
      backgroundColor: getThemeValue(theme, `colors.${color}`),
    })),

  textColor: (color: string) =>
    themed(theme => ({
      color: getThemeValue(theme, `colors.${color}`),
    })),

  // Layout mixins
  flex: (direction: 'row' | 'column' = 'row') =>
    themed(() => ({
      display: 'flex',
      flexDirection: direction,
    })),

  grid: (columns: number) =>
    themed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    })),

  // Responsive mixins
  responsive: (breakpoint: string) =>
    themed(theme => {
      const breakpointValue = getThemeValue(theme, `breakpoints.${breakpoint}`);
      // Ensure breakpoint value has 'px' unit
      const breakpointWithUnit = breakpointValue.toString().endsWith('px')
        ? breakpointValue
        : `${breakpointValue}px`;

      return {
        [`@media (min-width: ${breakpointWithUnit})`]: {
          // This will be extended by the component using it
        },
      };
    }),
};

// Example usage:
/*
import styled from '@emotion/styled';
import { mixins } from './styled';

const StyledButton = styled.button`
  ${mixins.padding('4')}
  ${mixins.text('base')}
  ${mixins.bg('primary.500')}
  ${mixins.textColor('white')}
  ${mixins.responsive('md')} {
    padding: ${props => props.theme.spacing['6']};
  }
`;
*/
