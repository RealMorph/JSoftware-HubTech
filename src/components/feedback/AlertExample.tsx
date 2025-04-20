import React, { useState } from 'react';
import { useAlert } from './AlertContext';
import styled from 'styled-components';
import { getSpacing } from '../../core/theme/spacing';

const ExampleContainer = styled.div`
  padding: ${getSpacing('6')};
  display: flex;
  flex-direction: column;
  gap: ${getSpacing('4')};
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${getSpacing('3')};
`;

const Button = styled.button<{ variant: 'success' | 'error' | 'warning' | 'info' | 'default' }>`
  padding: ${getSpacing('2')} ${getSpacing('4')};
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return `
          background-color: #10B981;
          color: white;
          &:hover {
            background-color: #059669;
          }
        `;
      case 'error':
        return `
          background-color: #EF4444;
          color: white;
          &:hover {
            background-color: #DC2626;
          }
        `;
      case 'warning':
        return `
          background-color: #F59E0B;
          color: white;
          &:hover {
            background-color: #D97706;
          }
        `;
      case 'info':
        return `
          background-color: #3B82F6;
          color: white;
          &:hover {
            background-color: #2563EB;
          }
        `;
      default:
        return `
          background-color: #6B7280;
          color: white;
          &:hover {
            background-color: #4B5563;
          }
        `;
    }
  }}
`;

const Section = styled.div`
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: ${getSpacing('4')};
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: ${getSpacing('3')};
  font-size: 1.125rem;
`;

const ConfigOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${getSpacing('2')};
  
  label {
    margin-right: ${getSpacing('2')};
  }
`;

const AlertExample: React.FC = () => {
  const alert = useAlert();
  const [isAutoCloseEnabled, setIsAutoCloseEnabled] = useState(true);
  
  // Basic alerts
  const showSuccessAlert = () => {
    alert.success('Operation completed successfully!', {
      title: 'Success',
    });
  };
  
  const showErrorAlert = () => {
    alert.error('An error occurred while processing your request.', {
      title: 'Error',
    });
  };
  
  const showWarningAlert = () => {
    alert.warning('This action cannot be undone.', {
      title: 'Warning',
    });
  };
  
  const showInfoAlert = () => {
    alert.info('Your session will expire in 5 minutes.', {
      title: 'Information',
    });
  };
  
  // Customized alerts
  const showPersistentAlert = () => {
    alert.info('This alert will not auto-close. Click the X to dismiss it.', {
      title: 'Persistent Alert',
      autoClose: false,
    });
  };
  
  const showLongDurationAlert = () => {
    alert.success('This alert will stay for 10 seconds.', {
      title: 'Long Duration',
      duration: 10000,
    });
  };
  
  const showNoIconAlert = () => {
    alert.warning('This alert has no icon.', {
      title: 'No Icon',
      showIcon: false,
    });
  };
  
  // Position alerts
  const showTopLeftAlert = () => {
    alert.info('This alert appears in the top-left corner.', {
      position: 'top-left',
    });
  };
  
  const showBottomRightAlert = () => {
    alert.info('This alert appears in the bottom-right corner.', {
      position: 'bottom-right',
    });
  };
  
  const showBottomCenterAlert = () => {
    alert.info('This alert appears in the bottom-center position.', {
      position: 'bottom-center',
    });
  };
  
  // Set default configurations
  const setTopRightDefault = () => {
    alert.setDefaultPosition('top-right');
    alert.info('Default position set to top-right');
  };
  
  const setBottomRightDefault = () => {
    alert.setDefaultPosition('bottom-right');
    alert.info('Default position set to bottom-right');
  };
  
  const toggleAutoClose = () => {
    const newValue = !isAutoCloseEnabled;
    setIsAutoCloseEnabled(newValue);
    alert.setDefaultAutoClose(newValue);
    alert.info(`Auto-close has been ${newValue ? 'enabled' : 'disabled'}.`);
  };
  
  const clearAllAlerts = () => {
    alert.clearAlerts();
  };

  return (
    <ExampleContainer>
      <h2>Alert Component Examples</h2>
      
      <Section>
        <SectionTitle>Basic Alerts</SectionTitle>
        <ButtonsContainer>
          <Button variant="success" onClick={showSuccessAlert}>Success Alert</Button>
          <Button variant="error" onClick={showErrorAlert}>Error Alert</Button>
          <Button variant="warning" onClick={showWarningAlert}>Warning Alert</Button>
          <Button variant="info" onClick={showInfoAlert}>Info Alert</Button>
        </ButtonsContainer>
      </Section>
      
      <Section>
        <SectionTitle>Customized Alerts</SectionTitle>
        <ButtonsContainer>
          <Button variant="default" onClick={showPersistentAlert}>Persistent Alert</Button>
          <Button variant="default" onClick={showLongDurationAlert}>Long Duration Alert</Button>
          <Button variant="default" onClick={showNoIconAlert}>No Icon Alert</Button>
        </ButtonsContainer>
      </Section>
      
      <Section>
        <SectionTitle>Positioned Alerts</SectionTitle>
        <ButtonsContainer>
          <Button variant="info" onClick={showTopLeftAlert}>Top Left</Button>
          <Button variant="info" onClick={showBottomRightAlert}>Bottom Right</Button>
          <Button variant="info" onClick={showBottomCenterAlert}>Bottom Center</Button>
        </ButtonsContainer>
      </Section>
      
      <Section>
        <SectionTitle>Alert Default Settings</SectionTitle>
        <ConfigOption>
          <label>Default Position:</label>
          <Button variant="default" onClick={setTopRightDefault}>Set Top Right</Button>
          <Button variant="default" onClick={setBottomRightDefault}>Set Bottom Right</Button>
        </ConfigOption>
        <ConfigOption>
          <Button variant="default" onClick={toggleAutoClose}>
            Toggle Auto-Close (Currently {isAutoCloseEnabled ? 'On' : 'Off'})
          </Button>
        </ConfigOption>
        <ConfigOption>
          <Button variant="error" onClick={clearAllAlerts}>Clear All Alerts</Button>
        </ConfigOption>
      </Section>
    </ExampleContainer>
  );
};

export default AlertExample; 