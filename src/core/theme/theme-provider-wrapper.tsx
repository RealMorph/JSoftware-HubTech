import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from './types';
import { useTheme } from './theme-context';

// Create a context for the theme with any type
const SafeThemeContext = createContext<any>(null);

/**
 * A wrapper component that provides a type-safe theme to its children
 * by converting the Theme type to any to avoid type compatibility issues
 */
export const SafeThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentTheme } = useTheme();
  
  // Convert the theme to any type to avoid type compatibility issues
  const safeTheme = currentTheme as any;
  
  return (
    <SafeThemeContext.Provider value={safeTheme}>
      {children}
    </SafeThemeContext.Provider>
  );
};

/**
 * Hook to access the safe theme
 */
export const useSafeTheme = () => {
  const safeTheme = useContext(SafeThemeContext);
  
  if (!safeTheme) {
    throw new Error('useSafeTheme must be used within a SafeThemeProvider');
  }
  
  return safeTheme;
};

/**
 * Helper function to safely access theme properties
 */
export function getThemeProperty(theme: any, path: string, defaultValue: any = '') {
  if (!theme) return defaultValue;
  
  const parts = path.split('.');
  let value: any = theme;
  
  for (const part of parts) {
    if (value === undefined || value === null) return defaultValue;
    value = value[part];
  }
  
  return value !== undefined && value !== null ? value : defaultValue;
} 