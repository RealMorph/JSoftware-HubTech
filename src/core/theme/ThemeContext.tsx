import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeConfig, ThemeState } from './consolidated-types';
import { defaultTheme } from './default-theme';

// Create the initial theme state
const initialThemeState: ThemeState = {
  name: 'default',
  config: defaultTheme,
};

// Create the theme context
const ThemeContext = createContext<{
  currentTheme: ThemeState;
  setTheme: (theme: ThemeState) => void;
}>({
  currentTheme: initialThemeState,
  setTheme: () => {},
});

// ThemeProvider props interface
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeState;
}

/**
 * Theme Provider component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = initialThemeState,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeState>(initialTheme);

  const setTheme = (theme: ThemeState) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the theme context
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to access the current theme config
 */
export const useTheme = (): ThemeConfig => {
  const { currentTheme } = useThemeContext();
  return currentTheme.config;
};

/**
 * Higher-order component to inject the theme into a component's props
 */
export const withTheme = <P extends { theme?: ThemeConfig }>(
  Component: React.ComponentType<P>
) => {
  const WithTheme = (props: Omit<P, 'theme'>) => {
    const theme = useTheme();
    return <Component {...(props as P)} theme={theme} />;
  };

  WithTheme.displayName = `WithTheme(${Component.displayName || Component.name || 'Component'})`;
  return WithTheme;
};

export default ThemeContext; 