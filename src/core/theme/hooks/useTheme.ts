import { useState, useEffect, useCallback } from 'react';
import { ThemeConfig } from '../types';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    // Load initial theme from localStorage
    const storedTheme = localStorage.getItem('currentTheme');
    if (storedTheme) {
      setThemeState(JSON.parse(storedTheme));
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeConfig) => {
    setThemeState(newTheme);
    localStorage.setItem('currentTheme', JSON.stringify(newTheme));
  }, []);

  return { theme, setTheme };
};
