import React, { useState } from 'react';
import styled from 'styled-components';
import { Toast } from './Toast';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, variant }) => 
    variant === 'success' 
      ? theme.colors?.success || '#4caf50'
      : variant === 'error'
      ? theme.colors?.error || '#f44336'
      : theme.colors?.primary || '#2196f3'
  };
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const DemoSection = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

export const ToastDemo: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Container>
      <Title>Toast Notifications</Title>
      <ButtonsContainer>
        <Button 
          variant="success" 
          onClick={() => setShowSuccess(true)}
        >
          Show Success Toast
        </Button>
        <Button 
          variant="error" 
          onClick={() => setShowError(true)}
        >
          Show Error Toast
        </Button>
        <Button 
          onClick={() => setShowInfo(true)}
        >
          Show Info Toast
        </Button>
      </ButtonsContainer>

      {showSuccess && (
        <Toast 
          type="success"
          title="Success"
          message="Operation completed successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showError && (
        <Toast 
          type="error"
          title="Error"
          message="An error occurred. Please try again."
          onClose={() => setShowError(false)}
        />
      )}

      {showInfo && (
        <Toast 
          type="info"
          title="Information"
          message="This is an informational message."
          onClose={() => setShowInfo(false)}
        />
      )}
    </Container>
  );
}; 