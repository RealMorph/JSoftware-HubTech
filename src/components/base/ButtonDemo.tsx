import React from 'react';
import styled from '@emotion/styled';
import { Button } from './Button';

const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const ButtonDemo: React.FC = () => {
  return (
    <DemoContainer>
      <h2>Button Variants</h2>
      <ButtonRow>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="ghost">Ghost</Button>
      </ButtonRow>

      <h2>Button Sizes</h2>
      <ButtonRow>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </ButtonRow>

      <h2>Button States</h2>
      <ButtonRow>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button fullWidth>Full Width</Button>
      </ButtonRow>
    </DemoContainer>
  );
};
