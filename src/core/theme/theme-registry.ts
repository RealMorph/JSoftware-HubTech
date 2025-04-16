import { ThemeConfig } from './types';
import { defaultTheme } from './default-theme';
import { darkTheme } from './dark-theme';

class ThemeRegistry {
  private themes: Map<string, ThemeConfig>;
  private static instance: ThemeRegistry;

  private constructor() {
    this.themes = new Map();
    this.registerDefaultThemes();
  }

  public static getInstance(): ThemeRegistry {
    if (!ThemeRegistry.instance) {
      ThemeRegistry.instance = new ThemeRegistry();
    }
    return ThemeRegistry.instance;
  }

  private registerDefaultThemes(): void {
    this.registerTheme(defaultTheme);
    this.registerTheme(darkTheme);
  }

  public registerTheme(theme: ThemeConfig): void {
    if (this.themes.has(theme.id)) {
      throw new Error(`Theme with id ${theme.id} already exists`);
    }
    this.themes.set(theme.id, theme);
  }

  public getTheme(id: string): ThemeConfig {
    const theme = this.themes.get(id);
    if (!theme) {
      throw new Error(`Theme with id ${id} not found`);
    }
    return theme;
  }

  public getDefaultTheme(): ThemeConfig {
    const defaultTheme = Array.from(this.themes.values()).find(theme => theme.isDefault);
    if (!defaultTheme) {
      throw new Error('No default theme found');
    }
    return defaultTheme;
  }

  public getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  public updateTheme(id: string, updates: Partial<ThemeConfig>): void {
    const theme = this.getTheme(id);
    const updatedTheme = {
      ...theme,
      ...updates,
      updatedAt: new Date(),
    };
    this.themes.set(id, updatedTheme);
  }

  public deleteTheme(id: string): void {
    const theme = this.getTheme(id);
    if (theme.isDefault) {
      throw new Error('Cannot delete default theme');
    }
    this.themes.delete(id);
  }

  public exportTheme(id: string): string {
    const theme = this.getTheme(id);
    return JSON.stringify(theme);
  }

  public importTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson) as ThemeConfig;
      // Validate theme structure
      if (!theme.id || !theme.name || !theme.colors) {
        throw new Error('Invalid theme structure');
      }
      // Convert date strings back to Date objects
      theme.createdAt = new Date(theme.createdAt);
      theme.updatedAt = new Date(theme.updatedAt);
      this.registerTheme(theme);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to import theme: ${error.message}`);
      }
      throw new Error('Failed to import theme: Unknown error');
    }
  }
}

export const themeRegistry = ThemeRegistry.getInstance();
