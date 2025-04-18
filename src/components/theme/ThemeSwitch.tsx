import React from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';
import ThemeSelector from './ThemeSelector';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SwitchContainer = styled.button<{ $themeStyles?: boolean }>`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    opacity: 0.8;
  }
`;

const ThemeSwitch: React.FC = () => {
  const theme = useDirectTheme();
  const isDarkMode = theme.getColor('background') === '#1e1e1e';
  
  return (
    <Container>
      <ThemeSelector />
      <SwitchContainer
        data-testid="theme-switch"
        onClick={() => theme.toggleDarkMode()}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </SwitchContainer>
    </Container>
  );
};

export default ThemeSwitch; 