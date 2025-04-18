import React from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { themeDefaults } from '../../core/theme/theme-defaults';
import { blueTheme } from '../../core/theme/blue-theme';
import styled from '@emotion/styled';

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Select = styled.select`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const themes = [
  { id: 'default', name: 'Default Theme', theme: themeDefaults },
  { id: 'blue', name: 'Blue Theme', theme: blueTheme },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useDirectTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = themes.find(t => t.id === event.target.value);
    if (selectedTheme) {
      setTheme(selectedTheme.theme);
    }
  };

  return (
    <SelectContainer>
      <Select
        value={theme.id || 'default'}
        onChange={handleThemeChange}
        aria-label="Select theme"
      >
        {themes.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </SelectContainer>
  );
};

export default ThemeSelector; 