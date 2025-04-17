import { jsx as _jsx } from 'react/jsx-runtime';
import { createContext, useContext, useState, useEffect } from 'react';
import { applyTheme } from './theme-system';
import { modernTheme } from './modern-theme';

// Define ThemeService interface and implementations directly in this file
// to avoid circular dependencies
export class ThemeService {
  // This is just a placeholder - the actual implementation is in theme-context.ts
  getDefaultTheme() { return {}; }
  getDarkTheme() { return null; }
  getLightTheme() { return null; }
}

// Simple InMemoryThemeService implementation
class InMemoryThemeService extends ThemeService {
  constructor(defaultTheme = modernTheme) {
    super();
    this.defaultTheme = defaultTheme;
    this.lightTheme = defaultTheme;
    this.darkTheme = null;
  }
  
  getDefaultTheme() {
    return this.defaultTheme;
  }
  
  getDarkTheme() {
    return this.darkTheme;
  }
  
  getLightTheme() {
    return this.lightTheme;
  }
  
  setDefaultTheme(theme) {
    this.defaultTheme = theme;
  }
}

// Create and export the context and service
export const inMemoryThemeService = new InMemoryThemeService();
export const ThemeServiceContext = createContext(inMemoryThemeService);
export const useThemeService = () => useContext(ThemeServiceContext);

// Original theme context for backward compatibility
const ThemeContext = createContext(null);
export function ThemeProvider({ children, themeService }) {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [themes, defaultTheme] = await Promise.all([
        themeService.getAllThemes(),
        themeService.getDefaultTheme(),
      ]);
      setAvailableThemes(themes);
      setCurrentTheme(defaultTheme || themes[0] || null);
      if (defaultTheme || themes[0]) {
        applyTheme(defaultTheme || themes[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load themes'));
    } finally {
      setIsLoading(false);
    }
  };
  const switchTheme = async themeId => {
    try {
      setIsLoading(true);
      setError(null);
      const theme = await themeService.getThemeById(themeId);
      if (!theme) {
        throw new Error(`Theme with ID ${themeId} not found`);
      }
      await themeService.setDefaultTheme(themeId);
      setCurrentTheme(theme);
      applyTheme(theme);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch theme'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const createTheme = async theme => {
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
  const updateTheme = async (id, theme) => {
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
  const deleteTheme = async id => {
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
  return _jsx(ThemeContext.Provider, { value: value, children: children });
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

      setIsLoading(false);
    }
  };
  const deleteTheme = async id => {
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
  return _jsx(ThemeContext.Provider, { value: value, children: children });
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
