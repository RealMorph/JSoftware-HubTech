import { useContext } from 'react';
import { DirectThemeContext, DirectThemeContextType } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';
import React from 'react';

export function useDirectTheme(): DirectThemeContextType {
  const context = useContext(DirectThemeContext);
  if (!context) {
    throw new Error('useDirectTheme must be used within a DirectThemeProvider');
  }
  return context;
} 