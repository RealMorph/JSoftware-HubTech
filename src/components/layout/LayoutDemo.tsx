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

const LayoutDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoTitle $themeStyles={themeStyles}>Layout Components</DemoTitle>
      <DemoDescription $themeStyles={themeStyles}>
        A collection of modular layout components for building responsive interfaces. These
        components follow the project's modular architecture principles, ensuring they are
        independently usable, loosely coupled, and testable in isolation.
      </DemoDescription>

      {/* Grid System */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Grid System</DemoTitle>
        <DemoDescription $themeStyles={themeStyles}>
          The Grid system provides a flexible and powerful way to create layouts using CSS Grid. It
          includes Grid and GridItem components, as well as Row and Col components for traditional
          grid layouts.
        </DemoDescription>

        <DemoSubtitle $themeStyles={themeStyles}>Basic Grid</DemoSubtitle>
        <Grid columns={3} gap={16} fullWidth>
          <GridItem>
            <ExampleBox $themeStyles={themeStyles}>Column 1</ExampleBox>
          </GridItem>
          <GridItem>
            <ExampleBox $themeStyles={themeStyles}>Column 2</ExampleBox>
          </GridItem>
          <GridItem>
            <ExampleBox $themeStyles={themeStyles}>Column 3</ExampleBox>
          </GridItem>
        </Grid>

        <CodeBlock $themeStyles={themeStyles}>{`<Grid columns={3} gap={16} fullWidth>
  <GridItem><ExampleBox>Column 1</ExampleBox></GridItem>
  <GridItem><ExampleBox>Column 2</ExampleBox></GridItem>
  <GridItem><ExampleBox>Column 3</ExampleBox></GridItem>
</Grid>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Advanced Grid with Column Spans</DemoSubtitle>
        <Grid columns={6} gap={16} fullWidth>
          <GridItem colSpan={6}>
            <ExampleBox $themeStyles={themeStyles}>Full Width - 6 Column Span</ExampleBox>
          </GridItem>
          <GridItem colSpan={2}>
            <ExampleBox $themeStyles={themeStyles}>2 Column Span</ExampleBox>
          </GridItem>
          <GridItem colSpan={4}>
            <ExampleBox $themeStyles={themeStyles}>4 Column Span</ExampleBox>
          </GridItem>
          <GridItem colSpan={3}>
            <ExampleBox $themeStyles={themeStyles}>3 Column Span</ExampleBox>
          </GridItem>
          <GridItem colSpan={3}>
            <ExampleBox $themeStyles={themeStyles}>3 Column Span</ExampleBox>
          </GridItem>
        </Grid>

        <CodeBlock $themeStyles={themeStyles}>{`<Grid columns={6} gap={16} fullWidth>
  <GridItem colSpan={6}><ExampleBox>Full Width - 6 Column Span</ExampleBox></GridItem>
  <GridItem colSpan={2}><ExampleBox>2 Column Span</ExampleBox></GridItem>
  <GridItem colSpan={4}><ExampleBox>4 Column Span</ExampleBox></GridItem>
  <GridItem colSpan={3}><ExampleBox>3 Column Span</ExampleBox></GridItem>
  <GridItem colSpan={3}><ExampleBox>3 Column Span</ExampleBox></GridItem>
</Grid>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Row and Column Layout</DemoSubtitle>
        <Row gap={16} fullWidth>
          <Col span={4}>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              1/3 Width
            </ExampleBox>
          </Col>
          <Col span={4}>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              1/3 Width
            </ExampleBox>
          </Col>
          <Col span={4}>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              1/3 Width
            </ExampleBox>
          </Col>
        </Row>

        <Spacer size={16} />

        <Row gap={16} fullWidth>
          <Col span={6}>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              1/2 Width
            </ExampleBox>
          </Col>
          <Col span={6}>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              1/2 Width
            </ExampleBox>
          </Col>
        </Row>

        <CodeBlock $themeStyles={themeStyles}>{`<Row gap={16} fullWidth>
  <Col span={4}><ExampleBox bg="secondary">1/3 Width</ExampleBox></Col>
  <Col span={4}><ExampleBox bg="secondary">1/3 Width</ExampleBox></Col>
  <Col span={4}><ExampleBox bg="secondary">1/3 Width</ExampleBox></Col>
</Row>

<Spacer size={16} />

<Row gap={16} fullWidth>
  <Col span={6}><ExampleBox bg="secondary">1/2 Width</ExampleBox></Col>
  <Col span={6}><ExampleBox bg="secondary">1/2 Width</ExampleBox></Col>
</Row>`}</CodeBlock>
      </DemoSection>

      {/* Flexbox */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Flexbox Containers</DemoTitle>
        <DemoDescription $themeStyles={themeStyles}>
          Flexbox containers provide a simple way to create flexible layouts. The Flex and FlexItem
          components offer a convenient API for common flexbox patterns.
        </DemoDescription>

        <DemoSubtitle $themeStyles={themeStyles}>Basic Flex Row</DemoSubtitle>
        <Flex gap={16} fullWidth>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Item 1
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Item 2
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Item 3
            </ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock $themeStyles={themeStyles}>{`<Flex gap={16} fullWidth>
  <FlexItem><ExampleBox bg="secondary">Item 1</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Item 2</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Item 3</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Flex with Different Alignments</DemoSubtitle>
        <Flex gap={16} justifyContent="space-between" alignItems="center" fullWidth>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Left
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Center
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Right
            </ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock
          $themeStyles={themeStyles}
        >{`<Flex gap={16} justifyContent="space-between" alignItems="center" fullWidth>
  <FlexItem><ExampleBox bg="secondary">Left</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Center</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Right</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Flex Column</DemoSubtitle>
        <Flex direction="column" gap={16} fullWidth>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Top
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Middle
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Bottom
            </ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock $themeStyles={themeStyles}>{`<Flex direction="column" gap={16} fullWidth>
  <FlexItem><ExampleBox bg="secondary">Top</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Middle</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Bottom</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Flex with Grow/Shrink</DemoSubtitle>
        <Flex gap={16} fullWidth>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Fixed
            </ExampleBox>
          </FlexItem>
          <FlexItem grow={1}>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Grows to fill space
            </ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox $themeStyles={themeStyles} bg="secondary">
              Fixed
            </ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock $themeStyles={themeStyles}>{`<Flex gap={16} fullWidth>
  <FlexItem><ExampleBox bg="secondary">Fixed</ExampleBox></FlexItem>
  <FlexItem grow={1}><ExampleBox bg="secondary">Grows to fill space</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Fixed</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>
      </DemoSection>

      {/* Spacing */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Spacing Components</DemoTitle>
        <DemoDescription $themeStyles={themeStyles}>
          Spacing components provide utilities for controlling margins, paddings, and spacing
          between elements. They include Box, Spacer, and Divider components.
        </DemoDescription>

        <DemoSubtitle $themeStyles={themeStyles}>Box with Padding and Margin</DemoSubtitle>
        <StyledBox p="4" m="4">
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Box with padding and margin
          </ExampleBox>
        </StyledBox>

        <CodeBlock $themeStyles={themeStyles}>{`<StyledBox p="4" m="4">
  <ExampleBox bg="accent">Box with padding and margin</ExampleBox>
</StyledBox>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>
          Box with Different Padding and Margin Sizes
        </DemoSubtitle>
        <Flex gap={16} fullWidth>
          <FlexItem>
            <SmallBox p="2" m="2">
              <ExampleBox $themeStyles={themeStyles} bg="accent">
                Small (p="2", m="2")
              </ExampleBox>
            </SmallBox>
          </FlexItem>
          <FlexItem>
            <MediumBox p="4" m="4">
              <ExampleBox $themeStyles={themeStyles} bg="accent">
                Medium (p="4", m="4")
              </ExampleBox>
            </MediumBox>
          </FlexItem>
          <FlexItem>
            <LargeBox p="6" m="6">
              <ExampleBox $themeStyles={themeStyles} bg="accent">
                Large (p="6", m="6")
              </ExampleBox>
            </LargeBox>
          </FlexItem>
        </Flex>

        <CodeBlock $themeStyles={themeStyles}>{`<Flex gap={16} fullWidth>
  <FlexItem>
    <SmallBox p="2" m="2">
      <ExampleBox bg="accent">Small (p="2", m="2")</ExampleBox>
    </SmallBox>
  </FlexItem>
  <FlexItem>
    <MediumBox p="4" m="4">
      <ExampleBox bg="accent">Medium (p="4", m="4")</ExampleBox>
    </MediumBox>
  </FlexItem>
  <FlexItem>
    <LargeBox p="6" m="6">
      <ExampleBox bg="accent">Large (p="6", m="6")</ExampleBox>
    </LargeBox>
  </FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Box with Different Paddings</DemoSubtitle>
        <HorizontalVerticalBox>
          <Box px="4" py="2">
            <ExampleBox $themeStyles={themeStyles} bg="accent">
              Horizontal and Vertical Padding (px="4", py="2")
            </ExampleBox>
          </Box>
          <Box pt="4" pr="6" pb="2" pl="2">
            <ExampleBox $themeStyles={themeStyles} bg="accent">
              Individual Side Padding (pt="4", pr="6", pb="2", pl="2")
            </ExampleBox>
          </Box>
        </HorizontalVerticalBox>

        <CodeBlock $themeStyles={themeStyles}>{`<HorizontalVerticalBox>
  <Box px="4" py="2">
    <ExampleBox bg="accent">Horizontal and Vertical Padding (px="4", py="2")</ExampleBox>
  </Box>
  <Box pt="4" pr="6" pb="2" pl="2">
    <ExampleBox bg="accent">Individual Side Padding (pt="4", pr="6", pb="2", pl="2")</ExampleBox>
  </Box>
</HorizontalVerticalBox>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Spacer (Vertical)</DemoSubtitle>
        <ExampleBox $themeStyles={themeStyles} bg="accent">
          Element Above
        </ExampleBox>
        <Spacer size="16" />
        <ExampleBox $themeStyles={themeStyles} bg="accent">
          Element Below
        </ExampleBox>

        <CodeBlock $themeStyles={themeStyles}>{`<ExampleBox bg="accent">Element Above</ExampleBox>
<Spacer size="16" />
<ExampleBox bg="accent">Element Below</ExampleBox>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Spacer (Horizontal)</DemoSubtitle>
        <Flex fullWidth>
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Left
          </ExampleBox>
          <Spacer size="16" axis="horizontal" />
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Right
          </ExampleBox>
        </Flex>

        <CodeBlock $themeStyles={themeStyles}>{`<Flex fullWidth>
  <ExampleBox bg="accent">Left</ExampleBox>
  <Spacer size="16" axis="horizontal" />
  <ExampleBox bg="accent">Right</ExampleBox>
</Flex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>
          Multiple Spacers with Different Sizes
        </DemoSubtitle>
        <Flex direction="column" fullWidth>
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            First Element
          </ExampleBox>
          <Spacer size="8" />
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Small Gap (8px)
          </ExampleBox>
          <Spacer size="16" />
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Medium Gap (16px)
          </ExampleBox>
          <Spacer size="32" />
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Large Gap (32px)
          </ExampleBox>
        </Flex>

        <CodeBlock $themeStyles={themeStyles}>{`<Flex direction="column" fullWidth>
  <ExampleBox bg="accent">First Element</ExampleBox>
  <Spacer size="8" />
  <ExampleBox bg="accent">Small Gap (8px)</ExampleBox>
  <Spacer size="16" />
  <ExampleBox bg="accent">Medium Gap (16px)</ExampleBox>
  <Spacer size="32" />
  <ExampleBox bg="accent">Large Gap (32px)</ExampleBox>
</Flex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Divider</DemoSubtitle>
        <ExampleBox $themeStyles={themeStyles} bg="accent">
          Content Above
        </ExampleBox>
        <Divider />
        <ExampleBox $themeStyles={themeStyles} bg="accent">
          Content Below
        </ExampleBox>

        <CodeBlock $themeStyles={themeStyles}>{`<ExampleBox bg="accent">Content Above</ExampleBox>
<Divider />
<ExampleBox bg="accent">Content Below</ExampleBox>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Vertical Divider</DemoSubtitle>
        <StyledFlex fullWidth alignItems="center" justifyContent="center">
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Left Content
          </ExampleBox>
          <Divider orientation="vertical" />
          <ExampleBox $themeStyles={themeStyles} bg="accent">
            Right Content
          </ExampleBox>
        </StyledFlex>

        <CodeBlock
          $themeStyles={themeStyles}
        >{`<StyledFlex fullWidth alignItems="center" justifyContent="center">
  <ExampleBox bg="accent">Left Content</ExampleBox>
  <Divider orientation="vertical" />
  <ExampleBox bg="accent">Right Content</ExampleBox>
</StyledFlex>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Divider with Custom Color and Size</DemoSubtitle>
        <ExampleBox $themeStyles={themeStyles} bg="accent">
          Content Above
        </ExampleBox>
        <Divider size="3px" color="secondary" />
        <ExampleBox $themeStyles={themeStyles} bg="accent">
          Content Below
        </ExampleBox>

        <CodeBlock $themeStyles={themeStyles}>{`<ExampleBox bg="accent">Content Above</ExampleBox>
<Divider size="3px" color="secondary" />
<ExampleBox bg="accent">Content Below</ExampleBox>`}</CodeBlock>
      </DemoSection>

      {/* Component Combinations */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Component Combinations</DemoTitle>
        <DemoDescription $themeStyles={themeStyles}>
          These layout components can be combined to create complex layouts with clean, readable
          code. Below are examples of common layout patterns built using these components.
        </DemoDescription>

        <DemoSubtitle $themeStyles={themeStyles}>Card Layout with Grid and Spacing</DemoSubtitle>
        <Grid columns={1} gap={0} fullWidth>
          <GridItem>
            <CardHeaderBox p="4">
              <ExampleBox $themeStyles={themeStyles}>Card Header</ExampleBox>
            </CardHeaderBox>
          </GridItem>
          <GridItem>
            <Divider />
          </GridItem>
          <GridItem>
            <CardContentBox p="6">
              <Flex direction="column" gap={16}>
                <FlexItem>
                  <ExampleBox $themeStyles={themeStyles}>Card Content Section 1</ExampleBox>
                </FlexItem>
                <FlexItem>
                  <ExampleBox $themeStyles={themeStyles}>Card Content Section 2</ExampleBox>
                </FlexItem>
              </Flex>
            </CardContentBox>
          </GridItem>
          <GridItem>
            <Divider />
          </GridItem>
          <GridItem>
            <CardFooterBox p="4">
              <Flex justifyContent="flex-end" gap={8}>
                <FlexItem>
                  <ExampleBox $themeStyles={themeStyles}>Cancel</ExampleBox>
                </FlexItem>
                <FlexItem>
                  <ExampleBox $themeStyles={themeStyles}>Submit</ExampleBox>
                </FlexItem>
              </Flex>
            </CardFooterBox>
          </GridItem>
        </Grid>

        <CodeBlock $themeStyles={themeStyles}>{`<Grid columns={1} gap={0} fullWidth>
  <GridItem>
    <CardHeaderBox p="4">
      <ExampleBox>Card Header</ExampleBox>
    </CardHeaderBox>
  </GridItem>
  <GridItem>
    <Divider />
  </GridItem>
  <GridItem>
    <CardContentBox p="6">
      <Flex direction="column" gap={16}>
        <FlexItem>
          <ExampleBox>Card Content Section 1</ExampleBox>
        </FlexItem>
        <FlexItem>
          <ExampleBox>Card Content Section 2</ExampleBox>
        </FlexItem>
      </Flex>
    </CardContentBox>
  </GridItem>
  <GridItem>
    <Divider />
  </GridItem>
  <GridItem>
    <CardFooterBox p="4">
      <Flex justifyContent="flex-end" gap={8}>
        <FlexItem>
          <ExampleBox>Cancel</ExampleBox>
        </FlexItem>
        <FlexItem>
          <ExampleBox>Submit</ExampleBox>
        </FlexItem>
      </Flex>
    </CardFooterBox>
  </GridItem>
</Grid>`}</CodeBlock>

        <DemoSubtitle $themeStyles={themeStyles}>Dashboard Layout</DemoSubtitle>
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

        <CodeBlock $themeStyles={themeStyles}>{`<Grid columns={12} gap={16} fullWidth>
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
</Grid>`}</CodeBlock>

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

        <CodeBlock
          $themeStyles={themeStyles}
        >{`<HolyGrailContainer direction="column" gap={16} fullWidth>
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
</HolyGrailContainer>`}</CodeBlock>
      </DemoSection>
    </DemoContainer>
  );
};

export default LayoutDemo;

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

        <CodeBlock $themeStyles={themeStyles}>{`<Grid columns={12} gap={16} fullWidth>
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
</Grid>`}</CodeBlock>

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

        <CodeBlock
          $themeStyles={themeStyles}
        >{`<HolyGrailContainer direction="column" gap={16} fullWidth>
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
</HolyGrailContainer>`}</CodeBlock>
      </DemoSection>
    </DemoContainer>
  );
};

export default LayoutDemo;
