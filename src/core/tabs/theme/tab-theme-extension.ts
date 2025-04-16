import { Theme } from '../../theme/types';
import { ThemeConfig } from '../../theme/theme-persistence';

/**
 * Tab style options for customizing tab appearance
 */
export interface TabStyleOptions {
  // Dimensions
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  padding?: string;
  margin?: string;
  
  // Appearance
  borderRadius?: string;
  fontWeight?: number | string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  opacity?: number;
  shadow?: string;
  
  // Tab shape and style
  tabShape?: 'rectangle' | 'rounded' | 'pill' | 'underlined';
  separatorStyle?: 'none' | 'line' | 'dot' | 'space';
  
  // Icons and buttons
  iconSize?: string;
  closeButtonSize?: string;
}

/**
 * Tab animation options for customizing animations
 */
export interface TabAnimationOptions {
  duration: number;
  easing: string;
  slideDistance?: string;
  fadeOpacity?: number;
  scaleEffect?: number;
  
  // Feature flags
  enableTabSwitch: boolean;
  enableGroupCollapse: boolean;
  enableDragPreview: boolean;
}

/**
 * Tab theme extension to add to the main theme
 */
export interface TabThemeExtension {
  tabs: {
    styles: {
      default: TabStyleOptions;
      active: TabStyleOptions;
      hover: TabStyleOptions;
    };
    animation: TabAnimationOptions;
  }
}

/**
 * Default tab theme extension settings
 */
export const defaultTabThemeExtension: TabThemeExtension = {
  tabs: {
    styles: {
      default: {
        height: '36px',
        minWidth: '120px',
        maxWidth: '240px',
        padding: '0 12px',
        margin: '0 2px 0 0',
        borderRadius: '4px 4px 0 0',
        fontWeight: 400,
        textTransform: 'none',
        opacity: 1,
        shadow: 'none',
        tabShape: 'rounded',
        separatorStyle: 'none',
        iconSize: '16px',
        closeButtonSize: '14px'
      },
      active: {
        fontWeight: 600,
        shadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      hover: {
        opacity: 0.9
      }
    },
    animation: {
      duration: 200,
      easing: 'ease-in-out',
      slideDistance: '8px',
      fadeOpacity: 0.8,
      scaleEffect: 0.97,
      enableTabSwitch: true,
      enableGroupCollapse: true,
      enableDragPreview: true
    }
  }
};

/**
 * Extends the base theme with tab-specific theme options
 */
export function createTabTheme(baseTheme: Theme, customExtension?: Partial<TabThemeExtension>): Theme & { tabs: TabThemeExtension['tabs'] } {
  const mergedExtension: TabThemeExtension = {
    tabs: {
      animation: {
        ...defaultTabThemeExtension.tabs.animation,
        ...customExtension?.tabs?.animation
      },
      styles: {
        default: {
          ...defaultTabThemeExtension.tabs.styles.default,
          ...customExtension?.tabs?.styles?.default
        },
        active: {
          ...defaultTabThemeExtension.tabs.styles.default,
          ...defaultTabThemeExtension.tabs.styles.active,
          ...customExtension?.tabs?.styles?.active
        },
        hover: {
          ...defaultTabThemeExtension.tabs.styles.default,
          ...defaultTabThemeExtension.tabs.styles.hover,
          ...customExtension?.tabs?.styles?.hover
        }
      }
    }
  };

  return {
    ...baseTheme,
    tabs: mergedExtension.tabs
  };
} 