import React, { ReactNode } from 'react';
import { ThemeService, ThemeServiceContext } from './theme-context';

interface ThemeServiceProviderProps {
  children: ReactNode;
  themeService: ThemeService;
}

export const ThemeServiceProvider: React.FC<ThemeServiceProviderProps> = ({
  children,
  themeService,
}) => {
  return (
    <ThemeServiceContext.Provider value={themeService}>
      {children}
    </ThemeServiceContext.Provider>
  );
}; 