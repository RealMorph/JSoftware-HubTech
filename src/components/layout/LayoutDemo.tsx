import React from 'react';
import styled from '@emotion/styled';
import { Theme } from '@emotion/react';
import { getThemeValue } from '../../core/theme/styled';
import { Grid, GridItem, Row, Col, Flex, FlexItem, Box, Spacer, Divider } from './index';

// Helper for theme values
const themeValue = (theme: Theme) => (path: string, fallback?: string) => {
  const value = getThemeValue(theme, path);
  return value || fallback || '';
};

// Styled components for the demo
const DemoContainer = styled.div(({ theme }) => {
  const tv = themeValue(theme);
  return {
    padding: tv('spacing.6', '24px'),
    fontFamily: tv('typography.family.primary', 'sans-serif'),
  };
});

const DemoSection = styled.section(({ theme }) => {
  const tv = themeValue(theme);
  return {
    marginBottom: tv('spacing.8', '32px'),
  };
});

const DemoTitle = styled.h2(({ theme }) => {
  const tv = themeValue(theme);
  return {
    fontSize: tv('typography.scale.xl', '1.25rem'),
    fontWeight: tv('typography.weights.semibold', '600'),
    marginBottom: tv('spacing.4', '16px'),
    color: tv('colors.text.primary', '#111827'),
  };
});

const DemoSubtitle = styled.h3(({ theme }) => {
  const tv = themeValue(theme);
  return {
    fontSize: tv('typography.scale.lg', '1.125rem'),
    fontWeight: tv('typography.weights.medium', '500'),
    marginBottom: tv('spacing.2', '8px'),
    marginTop: tv('spacing.4', '16px'),
    color: tv('colors.text.primary', '#111827'),
  };
});

const DemoDescription = styled.p(({ theme }) => {
  const tv = themeValue(theme);
  return {
    fontSize: tv('typography.scale.base', '1rem'),
    marginBottom: tv('spacing.4', '16px'),
    color: tv('colors.text.secondary', '#4b5563'),
  };
});

const ExampleBox = styled.div<{ bg?: string }>(({ theme, bg = 'primary' }) => {
  const tv = themeValue(theme);
  return {
    padding: tv('spacing.4', '16px'),
    backgroundColor: tv(`colors.${bg}`, '#3b82f6') + '33', // Adding 33 for transparency
    border: `1px solid ${tv(`colors.${bg}`, '#3b82f6')}`,
    borderRadius: tv('borderRadius.md', '0.375rem'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tv('colors.text.primary', '#111827'),
    fontSize: tv('typography.scale.sm', '0.875rem'),
    fontWeight: tv('typography.weights.medium', '500'),
    height: '100%',
  };
});

const CodeBlock = styled.pre(({ theme }) => {
  const tv = themeValue(theme);
  return {
    backgroundColor: tv('colors.background.secondary', '#f3f4f6'),
    padding: tv('spacing.4', '16px'),
    borderRadius: tv('borderRadius.md', '0.375rem'),
    overflow: 'auto',
    fontSize: tv('typography.scale.sm', '0.875rem'),
    fontFamily: 'monospace',
    marginBottom: tv('spacing.6', '24px'),
    whiteSpace: 'pre-wrap',
  };
});

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
  return (
    <DemoContainer>
      <DemoTitle>Layout Components</DemoTitle>
      <DemoDescription>
        A collection of modular layout components for building responsive interfaces.
        These components follow the project's modular architecture principles, ensuring
        they are independently usable, loosely coupled, and testable in isolation.
      </DemoDescription>

      {/* Grid System */}
      <DemoSection>
        <DemoTitle>Grid System</DemoTitle>
        <DemoDescription>
          The Grid system provides a flexible and powerful way to create layouts using CSS Grid.
          It includes Grid and GridItem components, as well as Row and Col components for traditional grid layouts.
        </DemoDescription>

        <DemoSubtitle>Basic Grid</DemoSubtitle>
        <Grid columns={3} gap={16} fullWidth>
          <GridItem>
            <ExampleBox>Column 1</ExampleBox>
          </GridItem>
          <GridItem>
            <ExampleBox>Column 2</ExampleBox>
          </GridItem>
          <GridItem>
            <ExampleBox>Column 3</ExampleBox>
          </GridItem>
        </Grid>

        <CodeBlock>{`<Grid columns={3} gap={16} fullWidth>
  <GridItem><ExampleBox>Column 1</ExampleBox></GridItem>
  <GridItem><ExampleBox>Column 2</ExampleBox></GridItem>
  <GridItem><ExampleBox>Column 3</ExampleBox></GridItem>
</Grid>`}</CodeBlock>

        <DemoSubtitle>Advanced Grid with Column Spans</DemoSubtitle>
        <Grid columns={6} gap={16} fullWidth>
          <GridItem colSpan={2}>
            <ExampleBox>Span 2</ExampleBox>
          </GridItem>
          <GridItem colSpan={4}>
            <ExampleBox>Span 4</ExampleBox>
          </GridItem>
          <GridItem colSpan={3}>
            <ExampleBox>Span 3</ExampleBox>
          </GridItem>
          <GridItem colSpan={3}>
            <ExampleBox>Span 3</ExampleBox>
          </GridItem>
          <GridItem colSpan={6}>
            <ExampleBox>Span 6 (Full Width)</ExampleBox>
          </GridItem>
        </Grid>

        <CodeBlock>{`<Grid columns={6} gap={16} fullWidth>
  <GridItem colSpan={2}><ExampleBox>Span 2</ExampleBox></GridItem>
  <GridItem colSpan={4}><ExampleBox>Span 4</ExampleBox></GridItem>
  <GridItem colSpan={3}><ExampleBox>Span 3</ExampleBox></GridItem>
  <GridItem colSpan={3}><ExampleBox>Span 3</ExampleBox></GridItem>
  <GridItem colSpan={6}><ExampleBox>Span 6 (Full Width)</ExampleBox></GridItem>
</Grid>`}</CodeBlock>

        <DemoSubtitle>Row and Column Layout</DemoSubtitle>
        <Row gap={16} fullWidth>
          <Col span={4}>
            <ExampleBox>1/3 Width</ExampleBox>
          </Col>
          <Col span={4}>
            <ExampleBox>1/3 Width</ExampleBox>
          </Col>
          <Col span={4}>
            <ExampleBox>1/3 Width</ExampleBox>
          </Col>
        </Row>
        
        <Spacer size={16} />
        
        <Row gap={16} fullWidth>
          <Col span={6}>
            <ExampleBox>1/2 Width</ExampleBox>
          </Col>
          <Col span={6}>
            <ExampleBox>1/2 Width</ExampleBox>
          </Col>
        </Row>

        <CodeBlock>{`<Row gap={16} fullWidth>
  <Col span={4}><ExampleBox>1/3 Width</ExampleBox></Col>
  <Col span={4}><ExampleBox>1/3 Width</ExampleBox></Col>
  <Col span={4}><ExampleBox>1/3 Width</ExampleBox></Col>
</Row>

<Spacer size={16} />

<Row gap={16} fullWidth>
  <Col span={6}><ExampleBox>1/2 Width</ExampleBox></Col>
  <Col span={6}><ExampleBox>1/2 Width</ExampleBox></Col>
</Row>`}</CodeBlock>
      </DemoSection>

      {/* Flexbox */}
      <DemoSection>
        <DemoTitle>Flexbox Containers</DemoTitle>
        <DemoDescription>
          Flexbox containers provide a simple way to create flexible layouts. 
          The Flex and FlexItem components offer a convenient API for common flexbox patterns.
        </DemoDescription>

        <DemoSubtitle>Basic Flex Row</DemoSubtitle>
        <Flex gap={16} fullWidth>
          <FlexItem>
            <ExampleBox bg="secondary">Item 1</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Item 2</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Item 3</ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock>{`<Flex gap={16} fullWidth>
  <FlexItem><ExampleBox bg="secondary">Item 1</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Item 2</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Item 3</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle>Flex with Different Alignments</DemoSubtitle>
        <Flex gap={16} justifyContent="space-between" alignItems="center" fullWidth>
          <FlexItem>
            <ExampleBox bg="secondary">Left</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Center</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Right</ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock>{`<Flex gap={16} justifyContent="space-between" alignItems="center" fullWidth>
  <FlexItem><ExampleBox bg="secondary">Left</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Center</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Right</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle>Flex Column</DemoSubtitle>
        <Flex direction="column" gap={16} fullWidth>
          <FlexItem>
            <ExampleBox bg="secondary">Top</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Middle</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Bottom</ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock>{`<Flex direction="column" gap={16} fullWidth>
  <FlexItem><ExampleBox bg="secondary">Top</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Middle</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Bottom</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>

        <DemoSubtitle>Flex with Grow/Shrink</DemoSubtitle>
        <Flex gap={16} fullWidth>
          <FlexItem>
            <ExampleBox bg="secondary">Fixed</ExampleBox>
          </FlexItem>
          <FlexItem grow={1}>
            <ExampleBox bg="secondary">Grows to fill space</ExampleBox>
          </FlexItem>
          <FlexItem>
            <ExampleBox bg="secondary">Fixed</ExampleBox>
          </FlexItem>
        </Flex>

        <CodeBlock>{`<Flex gap={16} fullWidth>
  <FlexItem><ExampleBox bg="secondary">Fixed</ExampleBox></FlexItem>
  <FlexItem grow={1}><ExampleBox bg="secondary">Grows to fill space</ExampleBox></FlexItem>
  <FlexItem><ExampleBox bg="secondary">Fixed</ExampleBox></FlexItem>
</Flex>`}</CodeBlock>
      </DemoSection>

      {/* Spacing */}
      <DemoSection>
        <DemoTitle>Spacing Components</DemoTitle>
        <DemoDescription>
          Spacing components provide utilities for controlling margins, paddings, and spacing between elements.
          They include Box, Spacer, and Divider components.
        </DemoDescription>

        <DemoSubtitle>Box with Padding and Margin</DemoSubtitle>
        <StyledBox p="4" m="4">
          <ExampleBox bg="accent">Box with padding and margin</ExampleBox>
        </StyledBox>

        <CodeBlock>{`<StyledBox p="4" m="4">
  <ExampleBox bg="accent">Box with padding and margin</ExampleBox>
</StyledBox>`}</CodeBlock>

        <DemoSubtitle>Box with Different Padding and Margin Sizes</DemoSubtitle>
        <Flex gap={16} fullWidth>
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
        </Flex>

        <CodeBlock>{`<Flex gap={16} fullWidth>
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

        <DemoSubtitle>Box with Different Paddings</DemoSubtitle>
        <HorizontalVerticalBox>
          <Box px="4" py="2">
            <ExampleBox bg="accent">Horizontal and Vertical Padding (px="4", py="2")</ExampleBox>
          </Box>
          <Box pt="4" pr="6" pb="2" pl="2">
            <ExampleBox bg="accent">Individual Side Padding (pt="4", pr="6", pb="2", pl="2")</ExampleBox>
          </Box>
        </HorizontalVerticalBox>

        <CodeBlock>{`<HorizontalVerticalBox>
  <Box px="4" py="2">
    <ExampleBox bg="accent">Horizontal and Vertical Padding (px="4", py="2")</ExampleBox>
  </Box>
  <Box pt="4" pr="6" pb="2" pl="2">
    <ExampleBox bg="accent">Individual Side Padding (pt="4", pr="6", pb="2", pl="2")</ExampleBox>
  </Box>
</HorizontalVerticalBox>`}</CodeBlock>

        <DemoSubtitle>Spacer (Vertical)</DemoSubtitle>
        <ExampleBox bg="accent">Element Above</ExampleBox>
        <Spacer size="16" />
        <ExampleBox bg="accent">Element Below</ExampleBox>

        <CodeBlock>{`<ExampleBox bg="accent">Element Above</ExampleBox>
<Spacer size="16" />
<ExampleBox bg="accent">Element Below</ExampleBox>`}</CodeBlock>

        <DemoSubtitle>Spacer (Horizontal)</DemoSubtitle>
        <Flex fullWidth>
          <ExampleBox bg="accent">Left</ExampleBox>
          <Spacer size="16" axis="horizontal" />
          <ExampleBox bg="accent">Right</ExampleBox>
        </Flex>

        <CodeBlock>{`<Flex fullWidth>
  <ExampleBox bg="accent">Left</ExampleBox>
  <Spacer size="16" axis="horizontal" />
  <ExampleBox bg="accent">Right</ExampleBox>
</Flex>`}</CodeBlock>

        <DemoSubtitle>Multiple Spacers with Different Sizes</DemoSubtitle>
        <Flex direction="column" fullWidth>
          <ExampleBox bg="accent">First Element</ExampleBox>
          <Spacer size="8" />
          <ExampleBox bg="accent">Small Gap (8px)</ExampleBox>
          <Spacer size="16" />
          <ExampleBox bg="accent">Medium Gap (16px)</ExampleBox>
          <Spacer size="32" />
          <ExampleBox bg="accent">Large Gap (32px)</ExampleBox>
        </Flex>

        <CodeBlock>{`<Flex direction="column" fullWidth>
  <ExampleBox bg="accent">First Element</ExampleBox>
  <Spacer size="8" />
  <ExampleBox bg="accent">Small Gap (8px)</ExampleBox>
  <Spacer size="16" />
  <ExampleBox bg="accent">Medium Gap (16px)</ExampleBox>
  <Spacer size="32" />
  <ExampleBox bg="accent">Large Gap (32px)</ExampleBox>
</Flex>`}</CodeBlock>

        <DemoSubtitle>Divider</DemoSubtitle>
        <ExampleBox bg="accent">Content Above</ExampleBox>
        <Divider />
        <ExampleBox bg="accent">Content Below</ExampleBox>

        <CodeBlock>{`<ExampleBox bg="accent">Content Above</ExampleBox>
<Divider />
<ExampleBox bg="accent">Content Below</ExampleBox>`}</CodeBlock>

        <DemoSubtitle>Vertical Divider</DemoSubtitle>
        <StyledFlex fullWidth alignItems="center" justifyContent="center">
          <ExampleBox bg="accent">Left Content</ExampleBox>
          <Divider orientation="vertical" />
          <ExampleBox bg="accent">Right Content</ExampleBox>
        </StyledFlex>

        <CodeBlock>{`<StyledFlex fullWidth alignItems="center" justifyContent="center">
  <ExampleBox bg="accent">Left Content</ExampleBox>
  <Divider orientation="vertical" />
  <ExampleBox bg="accent">Right Content</ExampleBox>
</StyledFlex>`}</CodeBlock>

        <DemoSubtitle>Divider with Custom Color and Size</DemoSubtitle>
        <ExampleBox bg="accent">Content Above</ExampleBox>
        <Divider size="3px" color="secondary" />
        <ExampleBox bg="accent">Content Below</ExampleBox>

        <CodeBlock>{`<ExampleBox bg="accent">Content Above</ExampleBox>
<Divider size="3px" color="secondary" />
<ExampleBox bg="accent">Content Below</ExampleBox>`}</CodeBlock>
      </DemoSection>

      {/* Component Combinations */}
      <DemoSection>
        <DemoTitle>Component Combinations</DemoTitle>
        <DemoDescription>
          These layout components can be combined to create complex layouts with clean, readable code.
          Below are examples of common layout patterns built using these components.
        </DemoDescription>

        <DemoSubtitle>Card Layout with Grid and Spacing</DemoSubtitle>
        <Grid columns={1} gap={0} fullWidth>
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
        </Grid>

        <CodeBlock>{`<Grid columns={1} gap={0} fullWidth>
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

        <DemoSubtitle>Dashboard Layout</DemoSubtitle>
        <Grid columns={12} gap={16} fullWidth>
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
        </Grid>

        <CodeBlock>{`<Grid columns={12} gap={16} fullWidth>
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

        <DemoSubtitle>Holy Grail Layout</DemoSubtitle>
        <HolyGrailContainer direction="column" gap={16} fullWidth>
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
        </HolyGrailContainer>

        <CodeBlock>{`<HolyGrailContainer direction="column" gap={16} fullWidth>
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