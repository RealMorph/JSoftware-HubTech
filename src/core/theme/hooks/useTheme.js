import { useState, useEffect, useCallback } from 'react';
import { defaultTheme } from '../default-theme';

export const useTheme = () => {
  const [theme, setThemeState] = useState(defaultTheme);
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('currentTheme');
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        setThemeState(parsedTheme);
      } catch (error) {
        console.error('Failed to parse theme from localStorage:', error);
        // Fall back to default theme if parsing fails
        setThemeState(defaultTheme);
      }
    }
  }, []);
  
  const setTheme = useCallback(newTheme => {
    setThemeState(newTheme);
    localStorage.setItem('currentTheme', JSON.stringify(newTheme));
  }, []);
  
  return { theme, setTheme };
};
