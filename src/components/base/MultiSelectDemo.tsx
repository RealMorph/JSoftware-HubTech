import React, { useState } from 'react';
import styled from '@emotion/styled';
import { MultiSelect, MultiSelectOption } from './MultiSelect';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

const DemoContainer = styled.div<{ $themeStyles: any }>`
  padding: ${props => props.$themeStyles.spacing.md};
  background: ${props => props.$themeStyles.colors.background || '#f6f7fb'};
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
  font-family: ${props => props.$themeStyles.typography?.fontFamily?.base || 'system-ui, sans-serif'};
`;

const DemoSection = styled.div<{ $themeStyles: any }>`
  margin-bottom: ${props => props.$themeStyles.spacing.lg};
  background: ${props => props.$themeStyles.colors.surface || '#ffffff'};
  padding: ${props => props.$themeStyles.spacing.md};
  border-radius: ${props => props.$themeStyles.borderRadius?.md || '8px'};
  border: 1px solid ${props => props.$themeStyles.colors.border || '#e6e9ef'};
`;

const DemoTitle = styled.h3<{ $themeStyles: any }>`
  margin-bottom: ${props => props.$themeStyles.spacing.md};
  color: ${props => props.$themeStyles.colors.text.primary || '#323338'};
  font-weight: 600;
  font-size: 18px;
`;

const sampleOptions: MultiSelectOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'python', label: 'Python', group: 'Backend' },
  { value: 'java', label: 'Java', group: 'Backend' },
  { value: 'go', label: 'Go', group: 'Backend' },
  { value: 'postgres', label: 'PostgreSQL', group: 'Database' },
  { value: 'mongo', label: 'MongoDB', group: 'Database' },
  { value: 'redis', label: 'Redis', group: 'Database' },
];

export const MultiSelectDemo: React.FC = () => {
  const theme = useDirectTheme();
  const themeStyles = {
    spacing: {
      xs: theme.getSpacing('xs'),
      sm: theme.getSpacing('sm'),
      md: theme.getSpacing('md'),
      lg: theme.getSpacing('lg'),
    },
    colors: {
      background: theme.getColor('colors.background'),
      surface: theme.getColor('colors.surface'),
      primary: theme.getColor('colors.primary'),
      secondary: theme.getColor('colors.secondary'),
      border: theme.getColor('colors.border'),
      text: {
        primary: theme.getColor('colors.text.primary'),
        secondary: theme.getColor('colors.text.secondary'),
      },
      hover: {
        background: theme.getColor('colors.hover.background'),
        border: theme.getColor('colors.hover.border'),
      },
      focus: {
        border: theme.getColor('colors.focus.border'),
        shadow: theme.getColor('colors.focus.shadow'),
      },
    },
    borderRadius: {
      sm: theme.getBorderRadius('sm'),
      md: theme.getBorderRadius('md'),
    },
    shadows: {
      sm: theme.getShadow('sm'),
      md: theme.getShadow('md'),
    },
    typography: {
      fontSize: {
        sm: theme.getTypography('fontSize.sm'),
        md: theme.getTypography('fontSize.md'),
      },
      fontFamily: {
        base: theme.getTypography('fontFamily.base'),
      },
    },
  };

  const [selectedBasic, setSelectedBasic] = useState<string[]>([]);
  const [selectedGrouped, setSelectedGrouped] = useState<string[]>([]);
  const [selectedWithLimit, setSelectedWithLimit] = useState<string[]>([]);
  const [selectedSearchable, setSelectedSearchable] = useState<string[]>([]);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Basic MultiSelect</DemoTitle>
        <MultiSelect
          options={sampleOptions}
          value={selectedBasic}
          onChange={setSelectedBasic}
          placeholder="Select technologies..."
        />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Grouped MultiSelect</DemoTitle>
        <MultiSelect
          options={sampleOptions}
          value={selectedGrouped}
          onChange={setSelectedGrouped}
          placeholder="Select grouped technologies..."
          groupBy={true}
        />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>MultiSelect with Limit (max 3)</DemoTitle>
        <MultiSelect
          options={sampleOptions}
          value={selectedWithLimit}
          onChange={setSelectedWithLimit}
          placeholder="Select up to 3 technologies..."
          maxItems={3}
        />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Searchable MultiSelect</DemoTitle>
        <MultiSelect
          options={sampleOptions}
          value={selectedSearchable}
          onChange={setSelectedSearchable}
          placeholder="Search and select technologies..."
          searchable={true}
          filterOption={(option, searchText) =>
            option.label.toLowerCase().includes(searchText.toLowerCase()) ||
            (option.group ? option.group.toLowerCase().includes(searchText.toLowerCase()) : false)
          }
        />
      </DemoSection>
    </DemoContainer>
  );
};

export default MultiSelectDemo; 