import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTheme } from '../theme-context';
import {
  Theme,
  ThemeConfig,
  ThemeColors,
  TypographyConfig,
  SpacingConfig,
  BreakpointConfig,
  BorderRadiusConfig,
  ShadowConfig,
  TransitionConfig,
  ThemeVisualConfig,
  TypographyFamilies,
} from '../types';
import { colors, semanticColors, stateColors } from '../colors';
import {
  typographyScale,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
} from '../typography';
import { spacingScale, semanticSpacing } from '../spacing';
import { breakpointValues, containerMaxWidths } from '../breakpoints';
import { Button } from '../../../components/base/Button';
import { TextField } from '../../../components/base/TextField';
import styled from '@emotion/styled';
import { Theme as EmotionTheme } from '@emotion/react';

// We no longer need this since we have a proper type declaration file
// declare module '@emotion/react' {
//   export interface Theme extends ThemeVisualConfig {}
// }

// Type for props with theme
interface StyledProps {
  theme: any; // Use any to bypass complex type issues with Theme
}

// Styled components
const EditorContainer = styled.div<StyledProps>`
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => props.theme?.colors?.background?.secondary ?? '#f8f9fa'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3<StyledProps>`
  margin-bottom: 10px;
  color: ${props => props.theme?.colors?.text?.primary ?? '#212529'};
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const ColorItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const ColorPreview = styled.div<{ color: string } & StyledProps>`
  width: 100%;
  height: 40px;
  background-color: ${props => props.color};
  border-radius: 4px;
  margin-bottom: 5px;
  border: 1px solid ${props => props.theme?.colors?.border?.primary ?? '#dee2e6'};
`;

const ColorInput = styled.input<StyledProps>`
  width: 100%;
  padding: 5px;
  border: 1px solid ${props => props.theme?.colors?.border?.primary ?? '#dee2e6'};
  border-radius: 4px;
  background-color: ${props => props.theme?.colors?.background?.primary ?? '#ffffff'};
  color: ${props => props.theme?.colors?.text?.primary ?? '#212529'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const PreviewContainer = styled.div<StyledProps>`
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => props.theme?.colors?.background?.primary ?? '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.primary ?? '#dee2e6'};
  margin-top: 20px;
`;

const PreviewTitle = styled.h4<StyledProps>`
  margin-bottom: 10px;
  color: ${props => props.theme?.colors?.text?.primary ?? '#212529'};
`;

const PreviewContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

interface CustomThemeEditorProps {
  currentTheme?: Theme;
  onSave: (theme: Theme) => void;
  onCancel: () => void;
}

export const CustomThemeEditor: React.FC<CustomThemeEditorProps> = ({
  currentTheme,
  onSave,
  onCancel,
}) => {
  const { createTheme, updateTheme } = useTheme();
  const [themeName, setThemeName] = useState(currentTheme?.name || '');
  const [themeDescription, setThemeDescription] = useState(currentTheme?.description || '');
  const [isDarkTheme, setIsDarkTheme] = useState(currentTheme?.isDark || false);
  
  // Initialize with a complete ThemeVisualConfig that matches our updated interfaces
  const [themeData, setThemeData] = useState<ThemeVisualConfig>({
    colors: currentTheme?.colors || {
      primary: '#007bff',
      secondary: '#6c757d',
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        tertiary: '#e9ecef',
      },
      text: {
        primary: '#212529',
        secondary: '#6c757d',
        disabled: '#adb5bd',
      },
      border: {
        primary: '#dee2e6',
        secondary: '#e9ecef',
      },
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
    },
    typography: currentTheme?.typography || {
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      weights: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      family: {
        primary: 'system-ui, -apple-system, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'ui-monospace, monospace',
      },
    },
    spacing: currentTheme?.spacing || {
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    breakpoints: currentTheme?.breakpoints || {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    borderRadius: currentTheme?.borderRadius || {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    shadows: currentTheme?.shadows || {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    transitions: currentTheme?.transitions || {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
  });

  // Set initial values from current theme
  useEffect(() => {
    if (currentTheme) {
      setThemeName(currentTheme.name || '');
      setThemeDescription(currentTheme.description || '');
      setIsDarkTheme(currentTheme.isDark || false);
      
      // Create a copy of the current theme's visual properties
      setThemeData({
        colors: { ...currentTheme.colors },
        typography: { ...currentTheme.typography },
        spacing: { ...currentTheme.spacing },
        borderRadius: { ...currentTheme.borderRadius },
        shadows: { ...currentTheme.shadows },
        transitions: { ...currentTheme.transitions },
        breakpoints: { ...currentTheme.breakpoints },
      });
    }
  }, [currentTheme]);

  // Update this handler to accept the correct parameter types
  const handleColorChange = (colorKey: string, value: string) => {
    setThemeData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  // Update this handler to accept the correct parameter types
  const handleNestedColorChange = (parent: string, key: string, value: string) => {
    setThemeData(prev => {
      // Create a safe copy of the parent property if it exists
      const parentObj = prev.colors[parent as keyof typeof prev.colors] || {};
      
      return {
        ...prev,
        colors: {
          ...prev.colors,
          [parent]: {
            ...parentObj, // Safe spread of parentObj
            [key]: value,
          },
        },
      };
    });
  };

  // Update this handler to accept the correct parameter types
  const handleTypographyChange = (section: keyof TypographyConfig, key: string, value: string) => {
    setThemeData(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [section]: {
          ...prev.typography[section],
          [key]: value,
        },
      },
    }));
  };

  // Custom handler function for TextField onChange
  const handleTextFieldChange = (
    section: keyof TypographyConfig,
    key: string
  ) => (value: string, event: ChangeEvent<HTMLInputElement>) => {
    handleTypographyChange(section, key, value);
  };

  // Fix this handler to correctly determine the section of typography being edited
  const renderTypographyEditor = (typographySection: keyof TypographyConfig) => {
    const sectionToLabel: Record<keyof TypographyConfig, string> = {
      scale: 'Font Sizes',
      weights: 'Font Weights',
      lineHeights: 'Line Heights',
      letterSpacing: 'Letter Spacing',
      family: 'Font Families',
    };

    // Get the correct section data
    const sectionData = themeData.typography[typographySection];
    
    return (
      <Section>
        <SectionTitle theme={themeData as any}>{sectionToLabel[typographySection]}</SectionTitle>
        <ColorGrid>
          {Object.entries(sectionData).map(([key, value]) => (
            <ColorItem key={`typography-${typographySection}-${key}`}>
              <PreviewTitle theme={themeData as any}>{key}</PreviewTitle>
              <TextField 
                value={value.toString()}
                onChange={(value: string) => handleTypographyChange(typographySection, key, value)}
                fullWidth
                size="small"
              />
            </ColorItem>
          ))}
        </ColorGrid>
      </Section>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!themeName) {
      alert('Theme name is required');
      return;
    }
    
    try {
      if (currentTheme?.id) {
        // For existing theme, we use the update function with partial theme data
        await updateTheme(currentTheme.id, {
          name: themeName,
          description: themeDescription,
          colors: themeData.colors as any,
          typography: themeData.typography as any,
          spacing: themeData.spacing as any,
          borderRadius: themeData.borderRadius as any,
          transitions: themeData.transitions as any,
          breakpoints: themeData.breakpoints as any,
        });
        
        // When passing to onSave, merge with current theme for complete data
        onSave({
          ...currentTheme,
          name: themeName,
          description: themeDescription,
          colors: themeData.colors,
          typography: themeData.typography,
          spacing: themeData.spacing,
          borderRadius: themeData.borderRadius,
          shadows: themeData.shadows,
          transitions: themeData.transitions,
          breakpoints: themeData.breakpoints,
        });
      } else {
        // For new theme, create with all necessary fields except ID/dates
        const newThemeConfig = {
          name: themeName,
          description: themeDescription,
          colors: themeData.colors as any,
          typography: themeData.typography as any,
          spacing: themeData.spacing as any,
          borderRadius: themeData.borderRadius as any,
          shadows: themeData.shadows as any,
          transitions: themeData.transitions as any,
          breakpoints: themeData.breakpoints as any,
        };
        
        const createdTheme = await createTheme(newThemeConfig);
        if (createdTheme) {
          // The API returns a complete theme with ID and dates
          onSave(createdTheme as unknown as Theme);
        }
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Render preview components with the correct theme type
  const renderPreview = () => (
    <PreviewContainer theme={themeData as any}>
      <PreviewTitle theme={themeData as any}>Preview</PreviewTitle>
      <PreviewContent>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="accent">Accent Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </PreviewContent>
    </PreviewContainer>
  );

  return (
    <EditorContainer theme={themeData as any}>
      <form onSubmit={handleSubmit}>
        <Section>
          <TextField
            label="Theme Name"
            value={themeName}
            onChange={(value: string) => setThemeName(value)}
            fullWidth
          />
        </Section>
        <Section>
          <TextField
            label="Description"
            value={themeDescription}
            onChange={(value: string) => setThemeDescription(value)}
            fullWidth
          />
        </Section>
        
        {/* Render typography editors */}
        {renderTypographyEditor('scale')}
        {renderTypographyEditor('weights')}
        {renderTypographyEditor('lineHeights')}
        {renderTypographyEditor('letterSpacing')}
        {renderTypographyEditor('family')}
        
        {renderPreview()}
        
        <ButtonGroup>
          <Button variant="primary" type="submit">
            Save Theme
          </Button>
          <Button variant="secondary" onClick={onCancel} type="button">
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </EditorContainer>
  );
};

export default CustomThemeEditor;
