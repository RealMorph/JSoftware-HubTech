import { ThemeVisualConfig } from '../core/theme/types';
import { colors, semanticColors, stateColors } from '../core/theme/colors';

declare module '@emotion/react' {
  export interface Theme extends Omit<ThemeVisualConfig, 'colors'> {
    // Add any additional properties that might be needed from ThemeConfig
    id?: string;
    name?: string;
    description?: string;
    isDefault?: boolean;
    isDark?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    colors: typeof colors & typeof semanticColors & typeof stateColors & {
      // Add any missing properties that might be accessed in components
      background?: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      text?: {
        primary: string;
        secondary: string;
        disabled: string;
      };
      border?: {
        primary: string;
        secondary: string;
      };
      primary?: string;
      secondary?: string;
      success?: string;
      warning?: string;
      error?: string;
    };
  }
} 