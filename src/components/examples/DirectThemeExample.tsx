import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

/**
 * Example component demonstrating direct theme implementation
 * Shows how to use the DirectThemeProvider's utilities to access theme properties
 */
const DirectThemeExample: React.FC = () => {
  // Get theme access through the DirectTheme hook
  const { 
    theme, 
    getColor, 
    getTypography, 
    getSpacing, 
    getBorderRadius, 
    getShadow, 
    getTransition 
  } = useDirectTheme();

  return (
    <Container>
      <Heading>Direct Theme Implementation Example</Heading>
      
      <Section>
        <SectionTitle>Color Usage</SectionTitle>
        <ColorGrid>
          <ColorSwatch bgColor={getColor('primary')}>Primary</ColorSwatch>
          <ColorSwatch bgColor={getColor('secondary')}>Secondary</ColorSwatch>
          <ColorSwatch bgColor={getColor('success')}>Success</ColorSwatch>
          <ColorSwatch bgColor={getColor('error')}>Error</ColorSwatch>
          <ColorSwatch 
            bgColor={typeof theme.colors.text === 'string' 
              ? theme.colors.text 
              : theme.colors.text.primary
            }
            isTextColor
          >
            Text
          </ColorSwatch>
        </ColorGrid>
      </Section>

      <Section>
        <SectionTitle>Typography Usage</SectionTitle>
        <TypographySample 
          fontSize={getTypography('fontSize.xl') as string}
          fontWeight={getTypography('fontWeight.bold') as number}
        >
          Extra Large Bold Text
        </TypographySample>
        <TypographySample 
          fontSize={getTypography('fontSize.lg') as string}
          fontWeight={getTypography('fontWeight.medium') as number}
        >
          Large Medium Text
        </TypographySample>
        <TypographySample 
          fontSize={getTypography('fontSize.md') as string}
          fontWeight={getTypography('fontWeight.normal') as number}
        >
          Medium Normal Text
        </TypographySample>
        <TypographySample 
          fontSize={getTypography('fontSize.sm') as string}
          fontWeight={getTypography('fontWeight.light') as number}
        >
          Small Light Text
        </TypographySample>
      </Section>

      <Section>
        <SectionTitle>Spacing Usage</SectionTitle>
        <SpacingGrid>
          <SpacingBlock size={getSpacing('xs')}>XS</SpacingBlock>
          <SpacingBlock size={getSpacing('sm')}>SM</SpacingBlock>
          <SpacingBlock size={getSpacing('md')}>MD</SpacingBlock>
          <SpacingBlock size={getSpacing('lg')}>LG</SpacingBlock>
          <SpacingBlock size={getSpacing('xl')}>XL</SpacingBlock>
        </SpacingGrid>
      </Section>

      <Section>
        <SectionTitle>Border Radius Usage</SectionTitle>
        <BorderRadiusGrid>
          <BorderRadiusBlock radius={getBorderRadius('none')}>None</BorderRadiusBlock>
          <BorderRadiusBlock radius={getBorderRadius('sm')}>SM</BorderRadiusBlock>
          <BorderRadiusBlock radius={getBorderRadius('md')}>MD</BorderRadiusBlock>
          <BorderRadiusBlock radius={getBorderRadius('lg')}>LG</BorderRadiusBlock>
          <BorderRadiusBlock radius={getBorderRadius('full')}>Full</BorderRadiusBlock>
        </BorderRadiusGrid>
      </Section>

      <Section>
        <SectionTitle>Shadow Usage</SectionTitle>
        <ShadowGrid>
          <ShadowBlock shadow={getShadow('none')}>None</ShadowBlock>
          <ShadowBlock shadow={getShadow('sm')}>SM</ShadowBlock>
          <ShadowBlock shadow={getShadow('md')}>MD</ShadowBlock>
          <ShadowBlock shadow={getShadow('lg')}>LG</ShadowBlock>
          <ShadowBlock shadow={getShadow('xl')}>XL</ShadowBlock>
        </ShadowGrid>
      </Section>

      <Section>
        <SectionTitle>Transition Usage</SectionTitle>
        <TransitionButton 
          duration={getTransition('duration.fast')}
          timing={getTransition('timing.easeOut')}
        >
          Fast Button
        </TransitionButton>
        <TransitionButton 
          duration={getTransition('duration.normal')}
          timing={getTransition('timing.easeInOut')}
        >
          Normal Button
        </TransitionButton>
        <TransitionButton 
          duration={getTransition('duration.slow')}
          timing={getTransition('timing.easeIn')}
        >
          Slow Button
        </TransitionButton>
      </Section>

      <Section>
        <SectionTitle>Direct Theme Object Access</SectionTitle>
        <CodeBlock>
          <pre>
            {`// Direct theme object access example
const { theme } = useDirectTheme();

// Color access
const primary = theme.colors.primary;
const textColor = typeof theme.colors.text === 'string' 
  ? theme.colors.text 
  : theme.colors.text.primary;

// Typography access
const bodyFontFamily = theme.typography.fontFamily.base;
const headingFontSize = theme.typography.fontSize['2xl'];

// Spacing access
const standardPadding = theme.spacing.md;`}
          </pre>
        </CodeBlock>
      </Section>
    </Container>
  );
};

// Styled components using the theme directly
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Heading = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

interface ColorSwatchProps {
  bgColor: string;
  isTextColor?: boolean;
}

const ColorSwatch = styled.div<ColorSwatchProps>`
  padding: 1rem;
  background-color: ${props => props.bgColor};
  color: ${props => props.isTextColor ? 'white' : 'inherit'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  height: 80px;
  color: ${props => props.isTextColor ? '#ffffff' : props.bgColor === '#ffffff' ? '#000000' : '#ffffff'};
  box-shadow: ${props => props.bgColor === '#ffffff' ? '0 0 0 1px rgba(0,0,0,0.1) inset' : 'none'};
  font-weight: bold;
`;

interface TypographySampleProps {
  fontSize: string;
  fontWeight: number;
}

const TypographySample = styled.p<TypographySampleProps>`
  font-size: ${props => props.fontSize};
  font-weight: ${props => props.fontWeight};
  margin: 0.5rem 0;
`;

const SpacingGrid = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
`;

interface SpacingBlockProps {
  size: string;
}

const SpacingBlock = styled.div<SpacingBlockProps>`
  width: ${props => props.size};
  height: ${props => props.size};
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const BorderRadiusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

interface BorderRadiusBlockProps {
  radius: string;
}

const BorderRadiusBlock = styled.div<BorderRadiusBlockProps>`
  height: 80px;
  background-color: #e0e0e0;
  border-radius: ${props => props.radius};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const ShadowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

interface ShadowBlockProps {
  shadow: string;
}

const ShadowBlock = styled.div<ShadowBlockProps>`
  height: 80px;
  background-color: white;
  border-radius: 6px;
  box-shadow: ${props => props.shadow};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

interface TransitionButtonProps {
  duration: string;
  timing: string;
}

const TransitionButton = styled.button<TransitionButtonProps>`
  padding: 0.75rem 1.5rem;
  margin-right: 1rem;
  background-color: #e0e0e0;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition-property: background-color, transform;
  transition-duration: ${props => props.duration};
  transition-timing-function: ${props => props.timing};

  &:hover {
    background-color: #bbbbbb;
    transform: scale(1.05);
  }
`;

const CodeBlock = styled.div`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: monospace;
  }
`;

export default DirectThemeExample; 