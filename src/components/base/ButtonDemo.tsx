import React from 'react';
import styled from '@emotion/styled';
import { Button } from './Button';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define a theme styles interface for consistent theming
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  spacing: {
    container: string;
    gap: string;
  };
  typography: {
    headingFontSize: string;
    headingFontWeight: string;
    headingColor: string;
  };
  borderRadius: string;
  shadow: string;
}

// Theme-based styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.gap};
  padding: ${props => props.$themeStyles.spacing.container};
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.textColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const ButtonRow = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing.gap};
  flex-wrap: wrap;
`;

const SectionHeading = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.headingFontSize};
  font-weight: ${props => props.$themeStyles.typography.headingFontWeight};
  color: ${props => props.$themeStyles.typography.headingColor};
  margin-top: ${props => props.$themeStyles.spacing.gap};
  margin-bottom: ${props => props.$themeStyles.spacing.gap};
`;

// Create theme styles based on DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    textSecondaryColor: getColor('text.secondary', '#666666'),
    spacing: {
      container: getSpacing('6', '1.5rem'),
      gap: getSpacing('4', '1rem'),
    },
    typography: {
      headingFontSize: getTypography('fontSize.lg', '1.25rem') as string,
      headingFontWeight: getTypography('fontWeight.semibold', '600') as string,
      headingColor: getColor('text.primary', '#333333'),
    },
    borderRadius: getBorderRadius('md', '0.375rem'),
    shadow: getShadow('sm', '0 1px 3px rgba(0,0,0,0.12)'),
  };
}

export const ButtonDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <SectionHeading $themeStyles={themeStyles}>Button Variants</SectionHeading>
      <ButtonRow $themeStyles={themeStyles}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="ghost">Ghost</Button>
      </ButtonRow>

      <SectionHeading $themeStyles={themeStyles}>Button Sizes</SectionHeading>
      <ButtonRow $themeStyles={themeStyles}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </ButtonRow>

      <SectionHeading $themeStyles={themeStyles}>Button States</SectionHeading>
      <ButtonRow $themeStyles={themeStyles}>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button fullWidth>Full Width</Button>
      </ButtonRow>
    </DemoContainer>
  );
};
