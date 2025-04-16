import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../DirectThemeProvider';
import { Button } from './Button';
import { ThemeConfig } from '../consolidated-types';

// Using simple styles without the legacy mixins
const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing?.lg || '1.5rem'};
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin: ${props => props.theme.spacing?.md || '1rem'} 0;
  
  & > h2 {
    font-size: ${props => props.theme.typography?.fontSize.xl || '1.25rem'};
    margin-bottom: ${props => props.theme.spacing?.md || '1rem'};
  }
  
  & > div {
    display: flex;
    gap: ${props => props.theme.spacing?.md || '1rem'};
    flex-wrap: wrap;
  }
`;

export function ButtonDemo() {
  const { theme } = useDirectTheme();

  if (!theme) {
    return <div>Loading theme...</div>;
  }

  return (
    <DemoContainer>
      <h1>Button Component Demo</h1>

      <Section>
        <h2>Button Variants</h2>
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      </Section>

      <Section>
        <h2>Button Sizes</h2>
        <div>
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </Section>

      <Section>
        <h2>Full Width Buttons</h2>
        <div style={{ width: '100%' }}>
          <Button fullWidth>Full Width Button</Button>
          <Button fullWidth variant="secondary">
            Full Width Secondary
          </Button>
          <Button fullWidth variant="outline">
            Full Width Outline
          </Button>
        </div>
      </Section>

      <Section>
        <h2>Disabled State</h2>
        <div>
          <Button disabled>Disabled Primary</Button>
          <Button disabled variant="secondary">
            Disabled Secondary
          </Button>
          <Button disabled variant="outline">
            Disabled Outline
          </Button>
        </div>
      </Section>

      <Section>
        <h2>Loading State</h2>
        <div>
          <Button loading>Loading Primary</Button>
          <Button loading variant="secondary">
            Loading Secondary
          </Button>
          <Button loading variant="outline">
            Loading Outline
          </Button>
        </div>
      </Section>
    </DemoContainer>
  );
}
