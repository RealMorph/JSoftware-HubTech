import React from 'react';
import styled from 'styled-components';
import { Alert, AlertProvider, useAlert, AlertType, AlertPosition } from './';

const DemoContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Button = styled.button<{ $variant?: AlertType }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  }};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #D1D5DB;
  margin-right: 0.5rem;
  background-color: white;
`;

const AlertControls: React.FC = () => {
  const { 
    addAlert, 
    setDefaultPosition, 
    setDefaultDuration, 
    setDefaultAutoClose, 
    clearAlerts 
  } = useAlert();
  
  const handleAddAlert = (type: AlertType) => {
    addAlert({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Alert`,
      message: `This is a ${type} alert message. It can be customized with various options.`,
    });
  };
  
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultPosition(e.target.value as AlertPosition);
  };
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultDuration(parseInt(e.target.value));
  };
  
  const handleAutoCloseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultAutoClose(e.target.value === 'true');
  };
  
  return (
    <>
      <Section>
        <SectionTitle>Alert Types</SectionTitle>
        <ButtonContainer>
          <Button $variant="success" onClick={() => handleAddAlert('success')}>
            Success Alert
          </Button>
          <Button $variant="error" onClick={() => handleAddAlert('error')}>
            Error Alert
          </Button>
          <Button $variant="warning" onClick={() => handleAddAlert('warning')}>
            Warning Alert
          </Button>
          <Button $variant="info" onClick={() => handleAddAlert('info')}>
            Info Alert
          </Button>
        </ButtonContainer>
      </Section>
      
      <Section>
        <SectionTitle>Alert Settings</SectionTitle>
        <div>
          <label>
            Position: 
            <Select onChange={handlePositionChange} defaultValue="top-right">
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-center">Bottom Center</option>
            </Select>
          </label>
          
          <label>
            Duration: 
            <Select onChange={handleDurationChange} defaultValue="5000">
              <option value="1000">1 second</option>
              <option value="3000">3 seconds</option>
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
            </Select>
          </label>
          
          <label>
            Auto Close: 
            <Select onChange={handleAutoCloseChange} defaultValue="true">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </label>
        </div>
      </Section>
      
      <Section>
        <Button onClick={() => clearAlerts()}>
          Clear All Alerts
        </Button>
      </Section>
    </>
  );
};

const AlertDemo: React.FC = () => {
  return (
    <AlertProvider>
      <DemoContainer>
        <Title>Alert Component Demo</Title>
        <AlertControls />
        
        <Section>
          <SectionTitle>Standalone Alert Examples</SectionTitle>
          <Alert 
            type="success"
            title="Success Alert"
            message="This is a standalone success alert example with a title."
            autoClose={false}
          />
          <Alert 
            type="error"
            message="This is a standalone error alert example without a title."
            autoClose={false}
          />
        </Section>
      </DemoContainer>
    </AlertProvider>
  );
};

export default AlertDemo; 