import { colors, semanticColors, stateColors } from './colors';
import {
  typographyScale,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
} from './typography';
import { spacingScale, semanticSpacing } from './spacing';
import { breakpointValues, containerMaxWidths } from './breakpoints';
import { ThemeConfig, ThemeManager, ThemeState, ShadowConfig, ThemeColors } from './consolidated-types';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';

// Re-export these types explicitly to ensure consistency across the codebase
export { ThemeConfig, ThemeManager, ThemeState, ShadowConfig, ThemeColors };

// This interface should be implemented with your actual database client
export interface ThemeDatabase {
  findThemeById(id: string): Promise<ThemeConfig | null>;
  findAllThemes(): Promise<ThemeConfig[]>;
  findDefaultTheme(): Promise<ThemeConfig | null>;
  createTheme(theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThemeConfig>;
  updateTheme(
    id: string,
    theme: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ThemeConfig | null>;
  deleteTheme(id: string): Promise<boolean>;
  setDefaultTheme(id: string): Promise<boolean>;
}

export class ThemeService {
  constructor(private db: ThemeDatabase) {}

  async getThemeById(id: string): Promise<ThemeConfig | null> {
    return this.db.findThemeById(id);
  }

  async getAllThemes(): Promise<ThemeConfig[]> {
    return this.db.findAllThemes();
  }

  async getDefaultTheme(): Promise<ThemeConfig | null> {
    return this.db.findDefaultTheme();
  }

  async createTheme(
    theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ThemeConfig> {
    return this.db.createTheme(theme);
  }

  async updateTheme(
    id: string,
    theme: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ThemeConfig | null> {
    return this.db.updateTheme(id, theme);
  }

  async deleteTheme(id: string): Promise<boolean> {
    return this.db.deleteTheme(id);
  }

  async setDefaultTheme(id: string): Promise<boolean> {
    return this.db.setDefaultTheme(id);
  }
}

// Example of how to create a theme service with your real database:
/*
import { PrismaClient } from '@prisma/client';
// or import { MongoClient } from 'mongodb';
// or any other database client

class RealThemeDatabase implements ThemeDatabase {
  constructor(private prisma: PrismaClient) {}
  
  async findThemeById(id: string): Promise<ThemeConfig | null> {
    // Implement with real database queries
    return this.prisma.theme.findUnique({ where: { id } });
  }
  
  // Implement other methods...
}

const prisma = new PrismaClient();
const themeDb = new RealThemeDatabase(prisma);
export const themeService = new ThemeService(themeDb);
*/

// Default theme for initial use
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e74c3c',
    info: '#00cec9',
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
      disabled: '#a0aec0',
    },
    background: '#ffffff',
    border: '#e2e8f0',
    white: '#ffffff',
    surface: '#f7fafc',
  },
  typography: {
    fontFamily: {
      base: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
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
      normal: 1.5,
      relaxed: 1.75,
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
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  transitions: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
};

// Default theme state
export const defaultThemeState: ThemeState = {
  name: 'Default Theme',
  config: defaultTheme
};

// Save theme to local storage
export const saveTheme = (theme: ThemeState) => {
  try {
    localStorage.setItem('theme', JSON.stringify(theme));
    return true;
  } catch (error) {
    console.error('Failed to save theme to local storage:', error);
    return false;
  }
};

// Load theme from local storage
export const loadTheme = (): ThemeState => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return JSON.parse(stored) as ThemeState;
    }
    return defaultThemeState;
  } catch (error) {
    console.error('Failed to load theme from local storage:', error);
    return defaultThemeState;
  }
};

// Hook for theme persistence
export const useThemePersistence = () => {
  const [theme, setTheme] = useLocalStorage<ThemeState>('theme', defaultThemeState);

  return {
    theme,
    setTheme,
  };
};

// In-memory database implementation
export class InMemoryThemeDatabase implements ThemeDatabase {
  private themes: ThemeConfig[] = [defaultTheme];
  private idCounter = 1;

  async findThemeById(id: string): Promise<ThemeConfig | null> {
    const theme = this.themes.find(t => t.id === id);
    return theme || null;
  }

  async findAllThemes(): Promise<ThemeConfig[]> {
    return [...this.themes];
  }

  async findDefaultTheme(): Promise<ThemeConfig | null> {
    const theme = this.themes.find(t => t.isDefault === true);
    return theme || null;
  }

  async createTheme(
    theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ThemeConfig> {
    const newTheme: ThemeConfig = {
      ...theme,
      id: `theme-${this.idCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.themes.push(newTheme);
    return newTheme;
  }

  async updateTheme(
    id: string,
    updates: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ThemeConfig | null> {
    const index = this.themes.findIndex(t => t.id === id);
    if (index === -1) return null;

    const theme = this.themes[index];
    const updatedTheme: ThemeConfig = {
      ...theme,
      ...updates,
      updatedAt: new Date(),
    };
    this.themes[index] = updatedTheme;
    return updatedTheme;
  }

  async deleteTheme(id: string): Promise<boolean> {
    const index = this.themes.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.themes.splice(index, 1);
    return true;
  }

  async setDefaultTheme(id: string): Promise<boolean> {
    const themeIndex = this.themes.findIndex(t => t.id === id);
    if (themeIndex === -1) return false;

    // Reset all themes to non-default
    this.themes.forEach(t => (t.isDefault = false));

    // Set the specified theme as default
    this.themes[themeIndex].isDefault = true;
    return true;
  }
}

// Create and export a pre-configured theme service
const inMemoryDb = new InMemoryThemeDatabase();
export const inMemoryThemeService = new ThemeService(inMemoryDb);
