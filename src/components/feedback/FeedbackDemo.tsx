import React from 'react';
import styled from 'styled-components';

import { ToastDemo } from './ToastDemo';
import { ProgressDemo } from './ProgressDemo';
import { ModalDemo } from './ModalDemo';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

export const FeedbackDemo: React.FC = () => {
  return (
    <Container>
      <ToastDemo />
      <ProgressDemo />
      <ModalDemo />
    </Container>
  );
}; 