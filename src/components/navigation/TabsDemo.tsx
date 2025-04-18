import React from 'react';
import styled from '@emotion/styled';
import { Tabs } from './Tabs';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  spacing6: string;
  spacing4: string;
  spacing3: string;
  backgroundDefault: string;
  backgroundPaper: string;
  borderRadiusMd: string;
  shadow: string;
  textPrimary: string;
  fontFamily: string;
  fontSizeLg: string;
  fontWeightSemibold: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing, getBorderRadius, getTypography, getShadow } = themeContext;

  return {
    spacing6: getSpacing('6', '1.5rem'),
    spacing4: getSpacing('4', '1rem'),
    spacing3: getSpacing('3', '0.75rem'),
    backgroundDefault: getColor('background.default', '#f5f5f5'),
    backgroundPaper: getColor('background.paper', '#ffffff'),
    borderRadiusMd: getBorderRadius('md', '0.375rem'),
    shadow: getShadow('sm', '0 1px 3px rgba(0,0,0,0.12)'),
    textPrimary: getColor('text.primary', '#333333'),
    fontFamily: getTypography('family.primary', 'system-ui') as string,
    fontSizeLg: getTypography('scale.lg', '1.25rem') as string,
    fontWeightSemibold: getTypography('weights.semibold', '600') as string,
  };
}

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing6};
  background-color: ${props => props.$themeStyles.backgroundDefault};
`;

const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing6};
  padding: ${props => props.$themeStyles.spacing4};
  background-color: ${props => props.$themeStyles.backgroundPaper};
  border-radius: ${props => props.$themeStyles.borderRadiusMd};
  box-shadow: ${props => props.$themeStyles.shadow};
`;

const DemoTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing3};
  color: ${props => props.$themeStyles.textPrimary};
  font-family: ${props => props.$themeStyles.fontFamily};
  font-size: ${props => props.$themeStyles.fontSizeLg};
  font-weight: ${props => props.$themeStyles.fontWeightSemibold};
`;

const tabs = [
  {
    id: 'tab1',
    label: 'Dashboard',
    content: <div>Main dashboard content with overview metrics.</div>
  },
  {
    id: 'tab2',
    label: 'Reports',
    content: <div>Detailed reports and data analysis.</div>
  },
  {
    id: 'tab3',
    label: 'Analytics',
    content: <div>Analytics dashboard with charts and metrics.</div>
  }
];

export const TabsDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Default Tabs</DemoTitle>
        <Tabs tabs={tabs} />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Pill Tabs</DemoTitle>
        <Tabs tabs={tabs} variant="pills" />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Underline Tabs</DemoTitle>
        <Tabs tabs={tabs} variant="underline" />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Tab Sizes</DemoTitle>
        <Tabs tabs={tabs} size="small" />
        <Tabs tabs={tabs} size="medium" />
        <Tabs tabs={tabs} size="large" />
      </DemoSection>
    </DemoContainer>
  );
};

export default TabsDemo;
