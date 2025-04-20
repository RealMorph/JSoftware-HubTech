import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typeahead } from './Typeahead';
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

const sampleOptions = [
  {
    value: 'react',
    label: 'React',
    description: 'A JavaScript library for building user interfaces',
    group: 'Frontend',
  },
  {
    value: 'vue',
    label: 'Vue.js',
    description: 'The Progressive JavaScript Framework',
    group: 'Frontend',
  },
  {
    value: 'angular',
    label: 'Angular',
    description: 'Platform for building mobile and desktop web applications',
    group: 'Frontend',
  },
  {
    value: 'node',
    label: 'Node.js',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    group: 'Backend',
  },
  {
    value: 'python',
    label: 'Python',
    description: 'A programming language that lets you work quickly',
    group: 'Backend',
  },
  {
    value: 'java',
    label: 'Java',
    description: 'Write once, run anywhere',
    group: 'Backend',
  },
];

// Simulated async function to fetch options
const fetchOptions = async (query: string): Promise<typeof sampleOptions> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sampleOptions.filter(option =>
    option.label.toLowerCase().includes(query.toLowerCase()) ||
    option.description.toLowerCase().includes(query.toLowerCase())
  );
};

export const TypeaheadDemo: React.FC = () => {
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

  const [basicValue, setBasicValue] = useState('');
  const [asyncValue, setAsyncValue] = useState('');
  const [customValue, setCustomValue] = useState('');

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Basic Typeahead</DemoTitle>
        <Typeahead
          options={sampleOptions}
          value={basicValue}
          onChange={setBasicValue}
          placeholder="Search technologies..."
          minChars={1}
        />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Async Typeahead</DemoTitle>
        <Typeahead
          options={[]}
          value={asyncValue}
          onChange={setAsyncValue}
          placeholder="Search with async loading..."
          loadOptions={fetchOptions}
          minChars={2}
          debounceMs={300}
        />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Custom Rendering</DemoTitle>
        <Typeahead
          options={sampleOptions}
          value={customValue}
          onChange={setCustomValue}
          placeholder="Search with custom rendering..."
          renderOption={(option, inputValue) => (
            <div style={{ padding: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>{option.label}</div>
              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{option.description}</div>
              <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Category: {option.group}</div>
            </div>
          )}
        />
      </DemoSection>
    </DemoContainer>
  );
};

export default TypeaheadDemo; 