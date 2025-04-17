import {
  Theme,
  ThemeConfig,
  ThemeColors,
  TypographyConfig,
  SpacingConfig,
  BorderRadiusConfig,
  ShadowConfig,
} from '../types';
import { ThemeDatabase } from '../interfaces/ThemeDatabase';

export class ThemeService {
  private database: ThemeDatabase;
  private themes: Map<string, Theme> = new Map();
  private defaultTheme: Theme | null = null;

  constructor(database: ThemeDatabase) {
    this.database = database;
    this.initializeThemes();
  }

  private async initializeThemes() {
    try {
      // Load themes from database
      const themes = await this.database.getAllThemes();
      themes.forEach(theme => {
        this.themes.set(theme.id, theme);
        if (theme.isDefault) {
          this.defaultTheme = theme;
        }
      });

      // If no default theme is set, create one
      if (!this.defaultTheme) {
        const defaultTheme = this.createDefaultTheme();
        await this.registerTheme(defaultTheme);
        this.defaultTheme = defaultTheme;
      }
    } catch (error) {
      console.error('Failed to initialize themes:', error);
      throw error;
    }
  }

  private createDefaultTheme(): Theme {
    const defaultColors: ThemeColors = {
      primary: '#3B82F6',
      secondary: '#10B981',
      primaryDark: '#2563EB',
      secondaryDark: '#059669',
      white: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#1F2937',
      background: {
        primary: '#FFFFFF',
        secondary: '#F3F4F6',
        tertiary: '#E5E7EB',
        paper: '#FFFFFF',
        default: '#F9FAFB',
      },
      textColors: {
        primary: '#1F2937',
        secondary: '#4B5563',
        disabled: '#9CA3AF',
      },
      border: {
        primary: '#D1D5DB',
        secondary: '#E5E7EB',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    };

    const defaultTypography: TypographyConfig = {
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      weights: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      family: {
        primary: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
    };

    const defaultSpacing: SpacingConfig = {
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
    };

    const defaultBorderRadius: BorderRadiusConfig = {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    };

    const defaultShadows: ShadowConfig = {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      md: '0 6px 10px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    };

    return {
      id: 'default-light',
      name: 'Default Light',
      description: 'Default light theme',
      colors: defaultColors,
      typography: defaultTypography,
      spacing: defaultSpacing,
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      borderRadius: defaultBorderRadius,
      shadows: defaultShadows,
      transitions: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      isDefault: true,
      isDark: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async registerTheme(theme: Theme): Promise<Theme> {
    try {
      // Validate theme
      this.validateTheme(theme);

      // Check if theme with same ID exists
      if (this.themes.has(theme.id)) {
        throw new Error(`Theme with ID ${theme.id} already exists`);
      }

      // If this is the first theme or marked as default, set as default
      if (this.themes.size === 0 || theme.isDefault) {
        theme.isDefault = true;
        // Update existing default theme if any
        if (this.defaultTheme) {
          const updatedDefaultTheme = { ...this.defaultTheme, isDefault: false };
          await this.database.updateTheme(updatedDefaultTheme.id, updatedDefaultTheme);
          this.themes.set(updatedDefaultTheme.id, updatedDefaultTheme);
        }
        this.defaultTheme = theme;
      }

      // Save to database
      await this.database.saveTheme(theme);
      this.themes.set(theme.id, theme);

      return theme;
    } catch (error) {
      console.error('Failed to register theme:', error);
      throw error;
    }
  }

  async updateTheme(theme: Theme): Promise<Theme> {
    try {
      // Validate theme
      this.validateTheme(theme);

      // Check if theme exists
      if (!this.themes.has(theme.id)) {
        throw new Error(`Theme with ID ${theme.id} does not exist`);
      }

      // If theme is being set as default, update existing default
      if (theme.isDefault && this.defaultTheme && this.defaultTheme.id !== theme.id) {
        const updatedDefaultTheme = { ...this.defaultTheme, isDefault: false };
        await this.database.updateTheme(updatedDefaultTheme.id, updatedDefaultTheme);
        this.themes.set(updatedDefaultTheme.id, updatedDefaultTheme);
        this.defaultTheme = theme;
      }

      // Update theme
      theme.updatedAt = new Date();
      await this.database.updateTheme(theme.id, theme);
      this.themes.set(theme.id, theme);

      return theme;
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }

  async deleteTheme(themeId: string): Promise<void> {
    try {
      // Check if theme exists
      if (!this.themes.has(themeId)) {
        throw new Error(`Theme with ID ${themeId} does not exist`);
      }

      const theme = this.themes.get(themeId)!;

      // Prevent deleting default theme
      if (theme.isDefault) {
        throw new Error('Cannot delete default theme');
      }

      // Delete from database
      await this.database.deleteTheme(themeId);
      this.themes.delete(themeId);
    } catch (error) {
      console.error('Failed to delete theme:', error);
      throw error;
    }
  }

  async getTheme(themeId: string): Promise<Theme | null> {
    try {
      return this.themes.get(themeId) || null;
    } catch (error) {
      console.error('Failed to get theme:', error);
      throw error;
    }
  }

  async getThemes(): Promise<Theme[]> {
    try {
      return Array.from(this.themes.values());
    } catch (error) {
      console.error('Failed to get themes:', error);
      throw error;
    }
  }

  async getDefaultTheme(): Promise<Theme> {
    try {
      if (!this.defaultTheme) {
        throw new Error('No default theme is set');
      }
      return this.defaultTheme;
    } catch (error) {
      console.error('Failed to get default theme:', error);
      throw error;
    }
  }

  private validateTheme(theme: Theme): void {
    if (!theme.id) {
      throw new Error('Theme ID is required');
    }
    if (!theme.name) {
      throw new Error('Theme name is required');
    }
    // Validate colors
    if (!theme.colors || !theme.colors.primary) {
      throw new Error('Theme must have at least a primary color');
    }
    // Additional validations as needed
  }

  private validateThemeConfig(config: ThemeConfig): void {
    // Validate required properties
    if (!config.colors) {
      throw new Error('Theme config must have colors');
    }
    if (!config.typography) {
      throw new Error('Theme config must have typography');
    }
    if (!config.spacing) {
      throw new Error('Theme config must have spacing');
    }
    // Check for textColors
    if (!config.colors.textColors || typeof config.colors.textColors.primary !== 'string') {
      throw new Error('Theme must have textColors.primary as a string');
    }
  }
}
