import React, { JSX } from 'react';
import styled from '@emotion/styled';
import { Button } from './Button';
import { useDirectTheme } from '../DirectThemeProvider';

interface ThemeStyles {
  colors: {
    background: {
      primary: string;
    };
    text: {
      primary: string;
    };
  };
  spacing: {
    '4': string;
    '6': string;
    '8': string;
  };
  typography: {
    sizes: {
      xl: {
        fontSize: string;
        lineHeight: string;
      };
    };
  };
}

const createThemeStyles = (theme: any): ThemeStyles => ({
  colors: {
    background: {
      primary: theme.colors.background.primary,
    },
    text: {
      primary: theme.colors.text.primary,
    },
  },
  spacing: {
    '4': theme.spacing['4'],
    '6': theme.spacing['6'],
    '8': theme.spacing['8'],
  },
  typography: {
    sizes: {
      xl: theme.typography.sizes.xl,
    },
  },
});

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${({ $themeStyles }) => $themeStyles.spacing['8']};
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div<{ $themeStyles: ThemeStyles }>`
  margin: ${({ $themeStyles }) => $themeStyles.spacing['6']} 0;

  & > h2 {
    font-size: ${({ $themeStyles }) => $themeStyles.typography.sizes.xl.fontSize};
    line-height: ${({ $themeStyles }) => $themeStyles.typography.sizes.xl.lineHeight};
    margin: ${({ $themeStyles }) => $themeStyles.spacing['4']} 0;
  }

  & > div {
    display: flex;
    gap: ${({ $themeStyles }) => $themeStyles.spacing['4']};
    flex-wrap: wrap;
  }
`;

export function ButtonDemo(): JSX.Element {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);

  if (!theme) {
    return <div>Loading theme...</div>;
  }

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <h1>Button Component Demo</h1>
      
      <Section $themeStyles={themeStyles}>
        <h2>Button Variants</h2>
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      </Section>

      <Section $themeStyles={themeStyles}>
        <h2>Button Sizes</h2>
        <div>
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </Section>

      <Section $themeStyles={themeStyles}>
        <h2>Full Width Buttons</h2>
        <div style={{ width: '100%' }}>
          <Button fullWidth>Full Width Button</Button>
          <Button fullWidth variant="secondary">Full Width Secondary</Button>
          <Button fullWidth variant="outline">Full Width Outline</Button>
        </div>
      </Section>

      <Section $themeStyles={themeStyles}>
        <h2>Disabled State</h2>
        <div>
          <Button disabled>Disabled Primary</Button>
          <Button disabled variant="secondary">Disabled Secondary</Button>
          <Button disabled variant="outline">Disabled Outline</Button>
        </div>
      </Section>
    </DemoContainer>
  );
}
