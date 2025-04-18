import React from 'react';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { useDirectTheme } from '../DirectThemeProvider';
import type { ThemeConfig, ThemeColors } from '../consolidated-types';

// Type guard for text object
const isTextObject = (text: ThemeColors['text']): text is { primary: string; secondary: string; disabled: string } => {
  return typeof text === 'object' && text !== null;
};

// Styled components using theme
const PageContainer = styled.div<{ $themeStyles: ThemeConfig }>`
  padding: ${({ $themeStyles }) => $themeStyles.spacing.xl};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background};
  min-height: 100vh;
  transition: all ${({ $themeStyles }) => $themeStyles.transitions.duration.normal} ${({ $themeStyles }) => $themeStyles.transitions.timing.easeInOut};
`;

const Card = styled.div<{ $themeStyles: ThemeConfig }>`
  background-color: ${({ $themeStyles }) => $themeStyles.colors.surface};
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.lg};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.lg};
  margin-bottom: ${({ $themeStyles }) => $themeStyles.spacing.md};
  box-shadow: ${({ $themeStyles }) => $themeStyles.shadows.md};
  
  h2 {
    color: ${({ $themeStyles }) => isTextObject($themeStyles.colors.text) ? $themeStyles.colors.text.primary : $themeStyles.colors.text};
    font-family: ${({ $themeStyles }) => $themeStyles.typography.fontFamily.heading};
    font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.xl};
    margin-bottom: ${({ $themeStyles }) => $themeStyles.spacing.sm};
  }
  
  p {
    color: ${({ $themeStyles }) => isTextObject($themeStyles.colors.text) ? $themeStyles.colors.text.secondary : $themeStyles.colors.text};
    font-family: ${({ $themeStyles }) => $themeStyles.typography.fontFamily.base};
    font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.md};
    line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.relaxed};
  }
`;

const NavLink = styled(Link)<{ $themeStyles: ThemeConfig }>`
  color: ${({ $themeStyles }) => $themeStyles.colors.primary};
  text-decoration: none;
  font-family: ${({ $themeStyles }) => $themeStyles.typography.fontFamily.base};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.md};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.sm} ${({ $themeStyles }) => $themeStyles.spacing.md};
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.base};
  transition: all ${({ $themeStyles }) => $themeStyles.transitions.duration.fast} ${({ $themeStyles }) => $themeStyles.transitions.timing.easeInOut};
  
  &:hover {
    background-color: ${({ $themeStyles }) => $themeStyles.colors.primary + '1A'}; // 10% opacity
  }
  
  &:active {
    background-color: ${({ $themeStyles }) => $themeStyles.colors.primary + '33'}; // 20% opacity
  }
`;

const ThemeToggleButton = styled.button<{ $themeStyles: ThemeConfig }>`
  background-color: ${({ $themeStyles }) => $themeStyles.colors.primary};
  color: ${({ $themeStyles }) => $themeStyles.colors.white};
  border: none;
  border-radius: ${({ $themeStyles }) => $themeStyles.borderRadius.base};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.sm} ${({ $themeStyles }) => $themeStyles.spacing.lg};
  font-family: ${({ $themeStyles }) => $themeStyles.typography.fontFamily.base};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.md};
  cursor: pointer;
  transition: all ${({ $themeStyles }) => $themeStyles.transitions.duration.fast} ${({ $themeStyles }) => $themeStyles.transitions.timing.easeInOut};
  
  &:hover {
    background-color: ${({ $themeStyles }) => $themeStyles.colors.secondary};
  }
`;

// Example route components
const HomePage = () => {
  const { theme } = useDirectTheme();
  
  return (
    <PageContainer $themeStyles={theme}>
      <Card $themeStyles={theme}>
        <h2>Welcome to Theme Examples</h2>
        <p>This example demonstrates theme usage across different routes.</p>
      </Card>
      <NavLink $themeStyles={theme} to="/theme-example/settings">
        Go to Settings
      </NavLink>
    </PageContainer>
  );
};

const SettingsPage = () => {
  const { theme, toggleDarkMode } = useDirectTheme();
  
  return (
    <PageContainer $themeStyles={theme}>
      <Card $themeStyles={theme}>
        <h2>Theme Settings</h2>
        <p>Customize the application theme preferences.</p>
        <ThemeToggleButton $themeStyles={theme} onClick={toggleDarkMode}>
          Toggle Dark Mode
        </ThemeToggleButton>
      </Card>
      <NavLink $themeStyles={theme} to="/theme-example">
        Back to Home
      </NavLink>
    </PageContainer>
  );
};

// Route-level theme customization example
const CustomThemedRoute = () => {
  const { theme } = useDirectTheme();
  const location = useLocation();
  
  // Example of route-specific theme modifications
  const routeTheme: ThemeConfig = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: location.pathname === '/theme-example/settings' 
        ? '#9c27b0' // Purple for settings
        : '#2196f3', // Blue for home
    },
  };
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

export default CustomThemedRoute; 