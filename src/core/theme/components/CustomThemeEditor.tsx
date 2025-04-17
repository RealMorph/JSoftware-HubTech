import React, { useState, useEffect, ChangeEvent } from 'react';
import { useDirectTheme } from '../DirectThemeProvider';
import type { DirectThemeContextType } from '../DirectThemeProvider';
import {
  ThemeConfig,
  ThemeColors,
  TypographyConfig,
  ThemeTypography,
} from '../types';
import { Button } from '../../../components/base/Button';
import { TextField } from '../../../components/base/TextField';
import styled from '@emotion/styled';

// Theme styles interfaces
interface EditorThemeStyles {
  root: {
    padding: string;
    borderRadius: string;
    backgroundColor: string;
    boxShadow: string;
    marginBottom: string;
  };
  section: {
    marginBottom: string;
  };
  title: {
    color: string;
    marginBottom: string;
    fontSize: string;
    fontWeight: string | number;
  };
  grid: {
    gap: string;
    marginBottom: string;
  };
  colorItem: {
    gap: string;
    marginBottom: string;
  };
  preview: {
    backgroundColor: string;
    borderColor: string;
    padding: string;
    borderRadius: string;
    marginTop: string;
  };
  input: {
    borderColor: string;
    backgroundColor: string;
    color: string;
    padding: string;
    borderRadius: string;
  };
  colorPreview: {
    borderColor: string;
    borderRadius: string;
  };
  buttonGroup: {
    gap: string;
    marginTop: string;
  };
}

// Create theme styles function
const createEditorThemeStyles = (theme: DirectThemeContextType): EditorThemeStyles => {
  const { getColor, getSpacing, getBorderRadius, getTypography } = theme;
  
  return {
    root: {
      padding: getSpacing('4', '1rem'),
      borderRadius: getBorderRadius('md', '0.375rem'),
      backgroundColor: getColor('background.secondary', '#f8f9fa'),
      boxShadow: `0 2px 8px ${getColor('shadow.sm', 'rgba(0, 0, 0, 0.1)')}`,
      marginBottom: getSpacing('5', '1.25rem'),
    },
    section: {
      marginBottom: getSpacing('5', '1.25rem'),
    },
    title: {
      color: getColor('text.primary', '#1a1a1a'),
      marginBottom: getSpacing('3', '0.75rem'),
      fontSize: getTypography('fontSize.lg', '1.125rem') as string,
      fontWeight: getTypography('fontWeight.semibold', 600),
    },
    grid: {
      gap: getSpacing('3', '0.75rem'),
      marginBottom: getSpacing('4', '1rem'),
    },
    colorItem: {
      gap: getSpacing('2', '0.5rem'),
      marginBottom: getSpacing('4', '1rem'),
    },
    preview: {
      backgroundColor: getColor('background.paper', '#ffffff'),
      borderColor: getColor('border.default', '#e0e0e0'),
      padding: getSpacing('4', '1rem'),
      borderRadius: getBorderRadius('md', '0.375rem'),
      marginTop: getSpacing('5', '1.25rem'),
    },
    input: {
      borderColor: getColor('border.default', '#e0e0e0'),
      backgroundColor: getColor('background.default', '#ffffff'),
      color: getColor('text.primary', '#1a1a1a'),
      padding: getSpacing('2', '0.5rem'),
      borderRadius: getBorderRadius('sm', '0.25rem'),
    },
    colorPreview: {
      borderColor: getColor('border.default', '#e0e0e0'),
      borderRadius: getBorderRadius('sm', '0.25rem'),
    },
    buttonGroup: {
      gap: getSpacing('3', '0.75rem'),
      marginTop: getSpacing('5', '1.25rem'),
    },
  };
};

// Styled components
const EditorContainer = styled.div<{ $themeStyles: EditorThemeStyles['root'] }>`
  padding: ${props => props.$themeStyles.padding};
  border-radius: ${props => props.$themeStyles.borderRadius};
  background-color: ${props => props.$themeStyles.backgroundColor};
  box-shadow: ${props => props.$themeStyles.boxShadow};
  margin-bottom: ${props => props.$themeStyles.marginBottom};
`;

const Section = styled.div<{ $themeStyles: EditorThemeStyles['section'] }>`
  margin-bottom: ${props => props.$themeStyles.marginBottom};
`;

const SectionTitle = styled.h3<{ $themeStyles: EditorThemeStyles['title'] }>`
  color: ${props => props.$themeStyles.color};
  margin-bottom: ${props => props.$themeStyles.marginBottom};
  font-size: ${props => props.$themeStyles.fontSize};
  font-weight: ${props => props.$themeStyles.fontWeight};
`;

const ColorGrid = styled.div<{ $themeStyles: EditorThemeStyles['grid'] }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.$themeStyles.gap};
  margin-bottom: ${props => props.$themeStyles.marginBottom};
`;

const ColorItem = styled.div<{ $themeStyles: EditorThemeStyles['colorItem'] }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.$themeStyles.gap};
  margin-bottom: ${props => props.$themeStyles.marginBottom};
`;

const ColorPreview = styled.div<{ 
  color: string; 
  $themeStyles: EditorThemeStyles['colorPreview']
}>`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.$themeStyles.borderRadius};
  background-color: ${props => props.color};
  border: 1px solid ${props => props.$themeStyles.borderColor};
`;

const StyledInput = styled(TextField)<{ $themeStyles: EditorThemeStyles['input'] }>`
  width: 120px;
  text-align: center;
  border-color: ${props => props.$themeStyles.borderColor};
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.color};
  padding: ${props => props.$themeStyles.padding};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const ButtonGroup = styled.div<{ $themeStyles: EditorThemeStyles['buttonGroup'] }>`
  display: flex;
  gap: ${props => props.$themeStyles.gap};
  margin-top: ${props => props.$themeStyles.marginTop};
`;

const PreviewContainer = styled.div<{ $themeStyles: EditorThemeStyles['preview'] }>`
  padding: ${props => props.$themeStyles.padding};
  border-radius: ${props => props.$themeStyles.borderRadius};
  background-color: ${props => props.$themeStyles.backgroundColor};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  margin-top: ${props => props.$themeStyles.marginTop};
`;

const PreviewContent = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

interface CustomThemeEditorProps {
  currentTheme?: ThemeConfig;
  onSave: (theme: ThemeConfig) => void;
  onCancel: () => void;
}

export const CustomThemeEditor: React.FC<CustomThemeEditorProps> = ({
  currentTheme,
  onSave,
  onCancel,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createEditorThemeStyles(themeContext);

  const [themeName, setThemeName] = useState(currentTheme?.name || '');
  const [themeDescription, setThemeDescription] = useState(currentTheme?.description || '');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => ({
    id: currentTheme?.id || `theme-${Date.now()}`,
    name: currentTheme?.name || '',
    description: currentTheme?.description || '',
    colors: currentTheme?.colors || {
      primary: '#007bff',
      secondary: '#6c757d',
      tertiary: '#5c636a',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
      text: {
        primary: '#212529',
        secondary: '#6c757d',
        disabled: '#adb5bd',
      },
      background: '#ffffff',
      border: '#dee2e6',
      white: '#ffffff',
      surface: '#f8f9fa',
    },
    typography: currentTheme?.typography || {
      fontFamily: {
        base: 'system-ui, -apple-system, sans-serif',
        heading: 'system-ui, -apple-system, sans-serif',
        monospace: 'ui-monospace, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: currentTheme?.spacing || {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    breakpoints: currentTheme?.breakpoints || {
      xs: '320px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1400px',
    },
    borderRadius: currentTheme?.borderRadius || {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    shadows: currentTheme?.shadows || {
      none: 'none',
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    transitions: currentTheme?.transitions || {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      timing: {
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
      },
    },
  }));

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setThemeConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleNestedColorChange = (parent: keyof ThemeColors, key: string, value: string) => {
    setThemeConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [parent]: {
          ...(prev.colors[parent] as Record<string, string>),
          [key]: value,
        },
      },
    }));
  };

  const handleTypographyChange = (
    section: keyof TypographyConfig,
    key: string,
    value: string | number
  ) => {
    // Convert value to number for numeric typography properties
    const processedValue = section === 'fontWeight' || section === 'lineHeight'
      ? Number(value) || value
      : value;

    setThemeConfig(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [section]: {
          ...prev.typography[section],
          [key]: processedValue
        }
      }
    }));
  };

  const renderColorEditor = (colorKey: keyof ThemeColors) => (
    <ColorItem key={colorKey} $themeStyles={themeStyles.colorItem}>
      <ColorPreview 
        color={typeof themeConfig.colors[colorKey] === 'string' 
          ? themeConfig.colors[colorKey] as string 
          : '#000000'} 
        $themeStyles={themeStyles.colorPreview}
      />
      <StyledInput
        value={typeof themeConfig.colors[colorKey] === 'string' 
          ? themeConfig.colors[colorKey] as string 
          : ''}
        onChange={(value: string) => handleColorChange(colorKey, value)}
        $themeStyles={themeStyles.input}
      />
      <span>{colorKey}</span>
    </ColorItem>
  );

  const renderTypographyEditor = (typographySection: keyof TypographyConfig) => {
    const sectionToLabel: Record<keyof TypographyConfig, string> = {
      fontFamily: 'Font Families',
      fontSize: 'Font Sizes',
      fontWeight: 'Font Weights',
      lineHeight: 'Line Heights',
      letterSpacing: 'Letter Spacing',
    };

    return (
      <Section key={typographySection} $themeStyles={themeStyles.section}>
        <SectionTitle $themeStyles={themeStyles.title}>
          {sectionToLabel[typographySection]}
        </SectionTitle>
        <div>
          {Object.entries(themeConfig.typography[typographySection]).map(([key, value]) => (
            <div key={key}>
              <span>{key}</span>
              <StyledInput
                value={value.toString()}
                onChange={(value: string) => 
                  handleTypographyChange(typographySection, key, value)
                }
                $themeStyles={themeStyles.input}
                type={typographySection === 'fontWeight' || typographySection === 'lineHeight' ? 'number' : 'text'}
              />
            </div>
          ))}
        </div>
      </Section>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const theme: ThemeConfig = {
      ...themeConfig,
      name: themeName,
      description: themeDescription,
    };
    onSave(theme);
  };

  return (
    <EditorContainer $themeStyles={themeStyles.root}>
      <form onSubmit={handleSubmit}>
        <Section $themeStyles={themeStyles.section}>
          <SectionTitle $themeStyles={themeStyles.title}>Theme Information</SectionTitle>
          <div>
            <TextField
              label="Theme Name"
              value={themeName}
              onChange={(value: string) => setThemeName(value)}
              required
            />
            <TextField
              label="Description"
              value={themeDescription}
              onChange={(value: string) => setThemeDescription(value)}
            />
            <label>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={e => setIsDarkMode(e.target.checked)}
              />
              Dark Mode
            </label>
          </div>
        </Section>

        <Section $themeStyles={themeStyles.section}>
          <SectionTitle $themeStyles={themeStyles.title}>Colors</SectionTitle>
          <ColorGrid $themeStyles={themeStyles.grid}>
            {Object.keys(themeConfig.colors).map(key => 
              renderColorEditor(key as keyof ThemeColors)
            )}
          </ColorGrid>
        </Section>

        {Object.keys(themeConfig.typography).map(key => 
          renderTypographyEditor(key as keyof TypographyConfig)
        )}

        <PreviewContainer $themeStyles={themeStyles.preview}>
          <SectionTitle $themeStyles={themeStyles.title}>Theme Preview</SectionTitle>
          <PreviewContent>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </PreviewContent>
        </PreviewContainer>

        <ButtonGroup $themeStyles={themeStyles.buttonGroup}>
          <Button type="submit">Save Theme</Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </EditorContainer>
  );
};

export default CustomThemeEditor;
