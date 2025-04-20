import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.error};
`;

const Message = styled.p`
  font-size: 1.1rem;
  max-width: 600px;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    filter: brightness(0.9);
  }
`;

const SecondaryButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    opacity: 0.9;
  }
`;

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <Container>
      <Title>Access Denied</Title>
      <Message>
        You don't have permission to access this resource. Please contact your administrator 
        if you believe this is a mistake or you need access to this area.
      </Message>
      
      <ButtonContainer>
        <Button onClick={handleGoBack}>Go Back</Button>
        <SecondaryButton to="/dashboard">Go to Dashboard</SecondaryButton>
      </ButtonContainer>
    </Container>
  );
};

export default UnauthorizedPage;