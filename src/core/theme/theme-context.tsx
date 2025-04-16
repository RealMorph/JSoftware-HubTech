import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeService, ThemeConfig } from './theme-persistence';
import { applyTheme } from './theme-system';

interface ThemeContextType {
  currentTheme: ThemeConfig | null;
  availableThemes: ThemeConfig[];
  isLoading: boolean;
  error: Error | null;
  switchTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
  createTheme: (theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ThemeConfig>;
  updateTheme: (
    id: string,
    theme: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<ThemeConfig | null>;
  deleteTheme: (id: string) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  themeService: ThemeService;
}

export function ThemeProvider({ children, themeService }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all themes and default theme
      const [themes, defaultTheme] = await Promise.all([
        themeService.getAllThemes(),
        themeService.getDefaultTheme(),
      ]);

      setAvailableThemes(themes);
      setCurrentTheme(defaultTheme || themes[0] || null);

      // Apply the current theme
      if (defaultTheme || themes[0]) {
        applyTheme(defaultTheme || themes[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load themes'));
    } finally {
      setIsLoading(false);
    }
  };

  const switchTheme = async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the theme to switch to
      const theme = await themeService.getThemeById(themeId);
      if (!theme) {
        throw new Error(`Theme with ID ${themeId} not found`);
      }

      // Set as default theme
      await themeService.setDefaultTheme(themeId);

      // Update current theme and apply it
      setCurrentTheme(theme);
      applyTheme(theme);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch theme'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createTheme = async (theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const newTheme = await themeService.createTheme(theme);
      await refreshThemes();
      return newTheme;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create theme'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (
    id: string,
    theme: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedTheme = await themeService.updateTheme(id, theme);
      if (updatedTheme) {
        await refreshThemes();
      }
      return updatedTheme;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update theme'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTheme = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await themeService.deleteTheme(id);
      if (success) {
        await refreshThemes();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete theme'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load themes on mount
  useEffect(() => {
    refreshThemes();
  }, []);

  const value = {
    currentTheme,
    availableThemes,
    isLoading,
    error,
    switchTheme,
    refreshThemes,
    createTheme,
    updateTheme,
    deleteTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
