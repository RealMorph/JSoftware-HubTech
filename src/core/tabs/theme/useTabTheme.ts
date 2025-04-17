import { useTheme } from '../../theme';
import {
  defaultTabThemeExtension,
  TabStyleOptions,
  TabAnimationOptions,
  TabThemeExtension,
} from './tab-theme-extension';

/**
 * Hook to access the tab theme configuration
 */
export function useTabTheme() {
  const theme = useTheme();

  // Safely get the tab theme extension from the current theme or use default
  const tabTheme: TabThemeExtension = {
    tabs: {
      styles: {
        default: {
          ...((theme?.currentTheme as any)?.tabs?.styles?.default ||
            defaultTabThemeExtension.tabs.styles.default),
        },
        active: {
          ...((theme?.currentTheme as any)?.tabs?.styles?.active ||
            defaultTabThemeExtension.tabs.styles.active),
        },
        hover: {
          ...((theme?.currentTheme as any)?.tabs?.styles?.hover ||
            defaultTabThemeExtension.tabs.styles.hover),
        },
      },
      animation: {
        ...((theme?.currentTheme as any)?.tabs?.animation ||
          defaultTabThemeExtension.tabs.animation),
      },
    },
  };

  return tabTheme;
}

/**
 * Get the styles for a specific tab state
 */
export function getTabStyles(state: 'default' | 'active' | 'hover' = 'default'): TabStyleOptions {
  const tabTheme = useTabTheme();

  if (state === 'active') {
    return {
      ...tabTheme.tabs.styles.default,
      ...tabTheme.tabs.styles.active,
    };
  }

  if (state === 'hover') {
    return {
      ...tabTheme.tabs.styles.default,
      ...tabTheme.tabs.styles.hover,
    };
  }

  return tabTheme.tabs.styles.default;
}

/**
 * Get the animation settings
 */
export function getTabAnimations(): TabAnimationOptions {
  const tabTheme = useTabTheme();
  return tabTheme.tabs.animation;
}

/**
 * Applies tab theme to CSS variables for traditional CSS styling
 */
export function applyTabThemeToCss(tabTheme: TabThemeExtension) {
  const root = document.documentElement;
  const { styles, animation } = tabTheme.tabs;

  // Apply default styles
  Object.entries(styles.default).forEach(([key, value]) => {
    if (value !== undefined) {
      root.style.setProperty(`--tab-${kebabCase(key)}`, String(value));
    }
  });

  // Apply active styles
  Object.entries(styles.active).forEach(([key, value]) => {
    if (value !== undefined) {
      root.style.setProperty(`--tab-active-${kebabCase(key)}`, String(value));
    }
  });

  // Apply hover styles
  Object.entries(styles.hover).forEach(([key, value]) => {
    if (value !== undefined) {
      root.style.setProperty(`--tab-hover-${kebabCase(key)}`, String(value));
    }
  });

  // Apply animation styles
  root.style.setProperty('--tab-animation-duration', `${animation.duration}ms`);
  root.style.setProperty('--tab-animation-easing', animation.easing);
}

/**
 * Convert camelCase to kebab-case for CSS variables
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
