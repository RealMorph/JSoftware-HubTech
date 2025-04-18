import React from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from 'styled-components';

const SwitchContainer = styled.button<{ $themeStyles: any }>`
  background: ${props => props.$themeStyles.colors.background};
  border: 1px solid ${props => props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius.full};
  padding: ${props => props.$themeStyles.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.$themeStyles.spacing.xs};
  transition: all ${props => props.$themeStyles.transitions.duration.normal} ${props => props.$themeStyles.transitions.timing.easeInOut};
  
  &:hover {
    background: ${props => props.$themeStyles.colors.surface};
  }
`;

const ThemeSwitch: React.FC = () => {
  const { theme, toggleDarkMode } = useDirectTheme();
  
  return (
    <SwitchContainer
      data-testid="theme-switch"
      onClick={toggleDarkMode}
      $themeStyles={theme}
      aria-label="Toggle theme"
    >
      {theme.colors.background === '#FFFFFF' ? '🌙' : '☀️'}
    </SwitchContainer>
  );
};

export default ThemeSwitch; 