import React from 'react';
import { ThemeService, ThemeServiceContext } from './theme-context';

/**
 * Provider for theme service
 */
export const ThemeServiceProvider: React.FC<{
  children: React.ReactNode;
  themeService: ThemeService;
}> = ({ children, themeService }) => {
  return (
    <ThemeServiceContext.Provider value={themeService}>{children}</ThemeServiceContext.Provider>
  );
};
