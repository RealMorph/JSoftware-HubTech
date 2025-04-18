import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { Grid, GridItem, Row, Col, Flex, FlexItem, Box, Spacer, Divider } from './index';

// Theme styles interface
interface ThemeStyles {
  spacing: {
    2: string;
    4: string;
    6: string;
    8: string;
  };
  typography: {
    family: {
      primary: string;
    };
    scale: {
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    weights: {
      medium: string;
      semibold: string;
    };
  };
  colors: {
    text: {
      primary: string;
      secondary: string;
    };
    primary: string;
    background: {
      secondary: string;
    };
  };
  borderRadius: {
    md: string;
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    spacing: {
      2: String(themeContext.getSpacing('2', '8px')),
      4: String(themeContext.getSpacing('4', '16px')),
      6: String(themeContext.getSpacing('6', '24px')),
      8: String(themeContext.getSpacing('8', '32px')),
    },
    typography: {
      family: {
        primary: String(themeContext.getTypography('family.primary', 'sans-serif')),
      },
      scale: {
        sm: String(themeContext.getTypography('scale.sm', '0.875rem')),
        base: String(themeContext.getTypography('scale.base', '1rem')),
        lg: String(themeContext.getTypography('scale.lg', '1.125rem')),
        xl: String(themeContext.getTypography('scale.xl', '1.25rem')),
      },
      weights: {
        medium: String(themeContext.getTypography('weights.medium', '500')),
        semibold: String(themeContext.getTypography('weights.semibold', '600')),
      },
    },
    colors: {
      text: {
        primary: themeContext.getColor('text.primary', '#111827'),
        secondary: themeContext.getColor('text.secondary', '#4b5563'),
      },
      primary: themeContext.getColor('primary', '#3b82f6'),
      background: {
        secondary: themeContext.getColor('background.secondary', '#f3f4f6'),
      },
    },
    borderRadius: {
      md: String(themeContext.getBorderRadius('md', '0.375rem')),
    },
  };
};

// Styled components for the demo
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  padding: $themeStyles.spacing[6],
  fontFamily: $themeStyles.typography.family.primary,
}));

const DemoSection = styled.section<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  marginBottom: $themeStyles.spacing[8],
}));

const DemoTitle = styled.h2<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  fontSize: $themeStyles.typography.scale.xl,
  fontWeight: $themeStyles.typography.weights.semibold,
  marginBottom: $themeStyles.spacing[4],
  color: $themeStyles.colors.text.primary,
}));

const DemoSubtitle = styled.h3<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  fontSize: $themeStyles.typography.scale.lg,
  fontWeight: $themeStyles.typography.weights.medium,
  marginBottom: $themeStyles.spacing[2],
  marginTop: $themeStyles.spacing[4],
  color: $themeStyles.colors.text.primary,
}));

const DemoDescription = styled.p<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  fontSize: $themeStyles.typography.scale.base,
  marginBottom: $themeStyles.spacing[4],
  color: $themeStyles.colors.text.secondary,
}));

const ExampleBox = styled.div<{ bg?: string; $themeStyles: ThemeStyles }>(
  ({ $themeStyles, bg = 'primary' }) => {
    const bgColor =
      bg === 'primary'
        ? $themeStyles.colors.primary
        : $themeStyles.colors[bg as keyof typeof $themeStyles.colors] || '#3b82f6';

    return {
      padding: $themeStyles.spacing[4],
      backgroundColor: `${bgColor}33`, // Adding 33 for transparency
      border: `1px solid ${bgColor}`,
      borderRadius: $themeStyles.borderRadius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: $themeStyles.colors.text.primary,
      fontSize: $themeStyles.typography.scale.sm,
      fontWeight: $themeStyles.typography.weights.medium,
      height: '100%',
    };
  }
);

const CodeBlock = styled.pre<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  backgroundColor: $themeStyles.colors.background.secondary,
  padding: $themeStyles.spacing[4],
  borderRadius: $themeStyles.borderRadius.md,
  overflow: 'auto',
  fontSize: $themeStyles.typography.scale.sm,
  fontFamily: 'monospace',
  marginBottom: $themeStyles.spacing[6],
  whiteSpace: 'pre-wrap',
}));

// Flex with style prop
const StyledBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
`;

const StyledFlex = styled(Flex)`
  height: 100px;
`;

const BackgroundBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
`;

const SmallBox = styled(BackgroundBox)`
  border-radius: 0.375rem;
`;

const MediumBox = styled(BackgroundBox)`
  border-radius: 0.375rem;
`;

const LargeBox = styled(BackgroundBox)`
  border-radius: 0.375rem;
`;

const HorizontalVerticalBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
`;

const CardHeaderBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem 0.375rem 0 0;
`;

const CardContentBox = styled(Box)`
  background-color: #f3f4f6;
`;

const CardFooterBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0 0 0.375rem 0.375rem;
`;

const DashboardBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
`;

const LayoutItemBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
`;

const SidebarBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  height: 100%;
`;

const MainContentBox = styled(Box)`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  height: 100%;
`;

const HolyGrailContainer = styled(Flex)`
  min-height: 400px;
`;

// Code templates for examples
const gridLayoutCode = `<Grid columns={12} gap={16} fullWidth>
  <GridItem colSpan={12}>
    <DashboardBox p="3">
      <ExampleBox>Header (12 columns)</ExampleBox>
    </DashboardBox>
  </GridItem>
  
  <GridItem colSpan={3}>
    <DashboardBox p="3">
      <ExampleBox>Sidebar (3 columns)</ExampleBox>
    </DashboardBox>
  </GridItem>
  
  <GridItem colSpan={9}>
    <Grid columns={3} gap={16} fullWidth>
      <GridItem>
        <DashboardBox p="3">
          <ExampleBox>Card 1</ExampleBox>
        </DashboardBox>
      </GridItem>
      <GridItem>
        <DashboardBox p="3">
          <ExampleBox>Card 2</ExampleBox>
        </DashboardBox>
      </GridItem>
      <GridItem>
        <DashboardBox p="3">
          <ExampleBox>Card 3</ExampleBox>
        </DashboardBox>
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardBox p="3">
          <ExampleBox>Main Content (full width)</ExampleBox>
        </DashboardBox>
      </GridItem>
    </Grid>
  </GridItem>
  
  <GridItem colSpan={12}>
    <DashboardBox p="3">
      <ExampleBox>Footer (12 columns)</ExampleBox>
    </DashboardBox>
  </GridItem>
</Grid>`;

const holyGrailLayoutCode = `<HolyGrailContainer direction="column" gap={16} fullWidth>
  <FlexItem>
    <LayoutItemBox p="3">
      <ExampleBox>Header</ExampleBox>
    </LayoutItemBox>
  </FlexItem>
  
  <FlexItem grow={1}>
    <Flex gap={16} fullWidth fullHeight>
      <FlexItem basis="200px" shrink={0}>
        <SidebarBox p="3">
          <ExampleBox>Left Sidebar</ExampleBox>
        </SidebarBox>
      </FlexItem>
      
      <FlexItem grow={1}>
        <MainContentBox p="3">
          <ExampleBox>Main Content</ExampleBox>
        </MainContentBox>
      </FlexItem>
      
      <FlexItem basis="200px" shrink={0}>
        <SidebarBox p="3">
          <ExampleBox>Right Sidebar</ExampleBox>
        </SidebarBox>
      </FlexItem>
    </Flex>
  </FlexItem>
  
  <FlexItem>
    <LayoutItemBox p="3">
      <ExampleBox>Footer</ExampleBox>
    </LayoutItemBox>
  </FlexItem>
</HolyGrailContainer>`;

export const LayoutDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Grid Layout Examples</DemoTitle>
        
        <Grid columns={12} gap={16} fullWidth>
          <GridItem colSpan={12}>
            <DashboardBox p="3">
              <ExampleBox $themeStyles={themeStyles}>Header (12 columns)</ExampleBox>
            </DashboardBox>
          </GridItem>

          <GridItem colSpan={3}>
            <DashboardBox p="3">
              <ExampleBox $themeStyles={themeStyles}>Sidebar (3 columns)</ExampleBox>
            </DashboardBox>
          </GridItem>

          <GridItem colSpan={9}>
            <Grid columns={3} gap={16} fullWidth>
              <GridItem>
                <DashboardBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Card 1</ExampleBox>
                </DashboardBox>
              </GridItem>
              <GridItem>
                <DashboardBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Card 2</ExampleBox>
                </DashboardBox>
              </GridItem>
              <GridItem>
                <DashboardBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Card 3</ExampleBox>
                </DashboardBox>
              </GridItem>
              <GridItem colSpan={3}>
                <DashboardBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Main Content (full width)</ExampleBox>
                </DashboardBox>
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem colSpan={12}>
            <DashboardBox p="3">
              <ExampleBox $themeStyles={themeStyles}>Footer (12 columns)</ExampleBox>
            </DashboardBox>
          </GridItem>
        </Grid>

        <CodeBlock $themeStyles={themeStyles}>{gridLayoutCode}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Holy Grail Layout</DemoSubtitle>
        <HolyGrailContainer direction="column" gap={16} fullWidth>
          <FlexItem>
            <LayoutItemBox p="3">
              <ExampleBox $themeStyles={themeStyles}>Header</ExampleBox>
            </LayoutItemBox>
          </FlexItem>

          <FlexItem grow={1}>
            <Flex gap={16} fullWidth fullHeight>
              <FlexItem basis="200px" shrink={0}>
                <SidebarBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Left Sidebar</ExampleBox>
                </SidebarBox>
              </FlexItem>

              <FlexItem grow={1}>
                <MainContentBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Main Content</ExampleBox>
                </MainContentBox>
              </FlexItem>

              <FlexItem basis="200px" shrink={0}>
                <SidebarBox p="3">
                  <ExampleBox $themeStyles={themeStyles}>Right Sidebar</ExampleBox>
                </SidebarBox>
              </FlexItem>
            </Flex>
          </FlexItem>

          <FlexItem>
            <LayoutItemBox p="3">
              <ExampleBox $themeStyles={themeStyles}>Footer</ExampleBox>
            </LayoutItemBox>
          </FlexItem>
        </HolyGrailContainer>

        <CodeBlock $themeStyles={themeStyles}>{holyGrailLayoutCode}</CodeBlock>
      </DemoSection>
    </DemoContainer>
  );
};

export default LayoutDemo;
