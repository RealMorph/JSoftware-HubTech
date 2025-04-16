import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Theme } from './types';
import { themeRegistry } from './theme-registry';
import { ThemeDatabase } from './interfaces/ThemeDatabase';
import { CSSVariablesManager } from './css-variables';
import { ThemeCache } from './theme-cache';

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  createTheme: (theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Theme>;
  updateTheme: (themeId: string, theme: Partial<Theme>) => Promise<Theme>;
  deleteTheme: (themeId: string) => Promise<void>;
  exportTheme: (themeId: string) => string;
  importTheme: (themeJson: string) => Promise<Theme>;
  isLoading: boolean;
  error: Error | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  database: ThemeDatabase;
  defaultThemeId?: string;
  enableTransitions?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  database,
  defaultThemeId,
  enableTransitions = true,
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize our optimized theme managers
  const cssVariablesManager = useMemo(() => CSSVariablesManager.getInstance(), []);
  const themeCache = useMemo(() => ThemeCache.getInstance(), []);

  // Set up transition styles if enabled
  useEffect(() => {
    if (enableTransitions) {
      cssVariablesManager.addTransitionStyles();
    }

    return () => {
      if (enableTransitions) {
        cssVariablesManager.removeTransitionStyles();
      }
    };
  }, [cssVariablesManager, enableTransitions]);

  // Load themes from database
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setIsLoading(true);
        const allThemes = await database.getAllThemes();
        setThemes(allThemes);

        // Pre-cache all themes for faster switching
        allThemes.forEach(theme => {
          themeCache.getTheme(theme);
        });

        if (defaultThemeId) {
          const defaultTheme = allThemes.find(t => t.id === defaultThemeId);
          if (defaultTheme) {
            setCurrentTheme(defaultTheme);
            cssVariablesManager.applyTheme(defaultTheme);
          }
        } else {
          const firstTheme = allThemes[0];
          if (firstTheme) {
            setCurrentTheme(firstTheme);
            cssVariablesManager.applyTheme(firstTheme);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load themes'));
      } finally {
        setIsLoading(false);
      }
    };

    loadThemes();
  }, [database, defaultThemeId, cssVariablesManager, themeCache]);

  // Optimized theme switching with memoization
  const setTheme = useCallback(
    (themeId: string) => {
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        cssVariablesManager.applyTheme(theme);
      }
    },
    [themes, cssVariablesManager]
  );

  const createTheme = useCallback(
    async (theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newTheme: Theme = {
          ...theme,
          id: `theme-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const savedTheme = await database.saveTheme(newTheme);
        setThemes(prev => [...prev, savedTheme]);

        // Pre-cache the new theme
        themeCache.getTheme(savedTheme);

        return savedTheme;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create theme'));
        throw err;
      }
    },
    [database, themeCache]
  );

  const updateTheme = useCallback(
    async (themeId: string, theme: Partial<Theme>) => {
      try {
        const updatedTheme = await database.updateTheme(themeId, theme);
        setThemes(prev => prev.map(t => (t.id === themeId ? updatedTheme : t)));

        // Invalidate the cache for this theme
        themeCache.invalidateTheme(themeId);

        if (currentTheme?.id === themeId) {
          setCurrentTheme(updatedTheme);
          cssVariablesManager.applyTheme(updatedTheme);
        }

        return updatedTheme;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update theme'));
        throw err;
      }
    },
    [database, currentTheme, cssVariablesManager, themeCache]
  );

  const deleteTheme = useCallback(
    async (themeId: string) => {
      try {
        await database.deleteTheme(themeId);
        setThemes(prev => prev.filter(t => t.id !== themeId));

        // Invalidate the cache for this theme
        themeCache.invalidateTheme(themeId);

        if (currentTheme?.id === themeId) {
          const firstTheme = themes[0];
          if (firstTheme) {
            setCurrentTheme(firstTheme);
            cssVariablesManager.applyTheme(firstTheme);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete theme'));
        throw err;
      }
    },
    [database, currentTheme, themes, cssVariablesManager, themeCache]
  );

  const exportTheme = useCallback((themeId: string): string => {
    return themeRegistry.exportTheme(themeId);
  }, []);

  const importTheme = useCallback(
    async (themeJson: string): Promise<Theme> => {
      try {
        // Parse the theme JSON
        const parsedTheme = JSON.parse(themeJson) as Theme;

        // Validate the theme structure
        if (!parsedTheme.id || !parsedTheme.name || !parsedTheme.config) {
          throw new Error('Invalid theme structure');
        }

        // Convert date strings back to Date objects
        parsedTheme.createdAt = new Date(parsedTheme.createdAt);
        parsedTheme.updatedAt = new Date(parsedTheme.updatedAt);

        // Register the theme in the registry
        themeRegistry.importTheme(themeJson);

        // Save the theme to the database
        const savedTheme = await database.saveTheme(parsedTheme);
        setThemes(prev => [...prev, savedTheme]);

        // Pre-cache the imported theme
        themeCache.getTheme(savedTheme);

        return savedTheme;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to import theme'));
        throw err;
      }
    },
    [database, themeCache]
  );

  if (!currentTheme) {
    return null; // Or a loading state
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        createTheme,
        updateTheme,
        deleteTheme,
        exportTheme,
        importTheme,
        isLoading,
        error,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
