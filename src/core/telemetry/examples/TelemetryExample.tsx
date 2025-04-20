import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../TelemetryProvider';
import { UIEvents, FeatureEvents, FormEvents, PerformanceEvents, NavigationEvents } from '../constants';
import {
  trackButtonClick,
  trackFeatureEvent,
  trackFormEvent,
  trackUIEvent,
  trackPerformance,
  trackNavigationEvent,
  createPerformanceTracker
} from '../utils/eventTracking';
import styled from '@emotion/styled';

/**
 * Example component demonstrating various telemetry usage patterns
 */
const TelemetryExample: React.FC = () => {
  const { trackEvent, isEnabled, consentSettings, updateConsent } = useTelemetry();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submittedData, setSubmittedData] = useState<null | typeof formData>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'events'>('info');

  // Track component render performance
  useEffect(() => {
    if (isEnabled && consentSettings.featureUsage) {
      const endTracking = createPerformanceTracker('RENDER_TIME', {
        component: 'TelemetryExample'
      });
      
      // Clean up and record duration on unmount
      return () => {
        endTracking();
      };
    }
  }, [isEnabled, consentSettings.featureUsage]);
  
  // Track when a feature is used
  useEffect(() => {
    if (isEnabled && consentSettings.featureUsage) {
      trackFeatureEvent('FEATURE_USED', 'telemetry-example', {
        time: new Date().toISOString()
      });
    }
  }, [isEnabled, consentSettings.featureUsage]);
  
  // Handle tab changes
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    
    // Track UI interaction
    if (isEnabled && consentSettings.analytics) {
      trackNavigationEvent('TAB_CHANGED', {
        tab_id: tab,
        previous_tab: activeTab
      });
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Track form field change
    if (isEnabled && consentSettings.analytics) {
      trackFormEvent('FIELD_CHANGED', 'example-form', {
        field_name: name,
        field_type: 'text',
        has_value: value.length > 0
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission
    if (isEnabled && consentSettings.analytics) {
      trackFormEvent('FORM_SUBMITTED', 'example-form', {
        fields_count: Object.keys(formData).length,
        completed_fields: Object.values(formData).filter(v => v.length > 0).length
      });
    }
    
    setSubmittedData(formData);
  };
  
  // Handle consent change
  const handleConsentToggle = (setting: keyof typeof consentSettings) => {
    updateConsent({
      ...consentSettings,
      [setting]: !consentSettings[setting]
    });
  };
  
  return (
    <Container>
      <Title>Telemetry System Example</Title>
      
      <TelemetryStatus>
        Telemetry Status: <StatusIndicator active={isEnabled}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </StatusIndicator>
      </TelemetryStatus>
      
      <TabContainer>
        <TabButton
          active={activeTab === 'info'}
          onClick={() => handleTabChange('info')}
        >
          Information
        </TabButton>
        <TabButton
          active={activeTab === 'settings'}
          onClick={() => handleTabChange('settings')}
        >
          Consent Settings
        </TabButton>
        <TabButton
          active={activeTab === 'events'}
          onClick={() => handleTabChange('events')}
        >
          Track Events
        </TabButton>
      </TabContainer>
      
      <TabContent>
        {activeTab === 'info' && (
          <div>
            <p>
              This component demonstrates how to use the telemetry system to track
              user interactions, performance metrics, and feature usage.
            </p>
            <p>
              The telemetry system respects user privacy and only tracks events
              when explicitly allowed through the consent settings.
            </p>
            <p>
              Current consent settings:
            </p>
            <List>
              <ListItem>Analytics: {consentSettings.analytics ? '✅' : '❌'}</ListItem>
              <ListItem>Session Recording: {consentSettings.sessionRecording ? '✅' : '❌'}</ListItem>
              <ListItem>Error Reporting: {consentSettings.errorReporting ? '✅' : '❌'}</ListItem>
              <ListItem>Feature Usage: {consentSettings.featureUsage ? '✅' : '❌'}</ListItem>
            </List>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <p>Update your telemetry consent settings:</p>
            
            <ConsentOption>
              <label>
                <input
                  type="checkbox"
                  checked={consentSettings.analytics}
                  onChange={() => handleConsentToggle('analytics')}
                />
                Analytics
              </label>
              <small>Tracks page views, interactions, and usage patterns</small>
            </ConsentOption>
            
            <ConsentOption>
              <label>
                <input
                  type="checkbox"
                  checked={consentSettings.sessionRecording}
                  onChange={() => handleConsentToggle('sessionRecording')}
                />
                Session Recording
              </label>
              <small>Records user sessions to improve UX</small>
            </ConsentOption>
            
            <ConsentOption>
              <label>
                <input
                  type="checkbox"
                  checked={consentSettings.errorReporting}
                  onChange={() => handleConsentToggle('errorReporting')}
                />
                Error Reporting
              </label>
              <small>Tracks application errors to improve stability</small>
            </ConsentOption>
            
            <ConsentOption>
              <label>
                <input
                  type="checkbox"
                  checked={consentSettings.featureUsage}
                  onChange={() => handleConsentToggle('featureUsage')}
                />
                Feature Usage
              </label>
              <small>Tracks which features you use most</small>
            </ConsentOption>
          </div>
        )}
        
        {activeTab === 'events' && (
          <div>
            <p>
              This tab demonstrates tracking various events. Try the
              buttons and form below to see telemetry in action.
            </p>
            
            <ButtonContainer>
              <ActionButton
                onClick={() => {
                  trackButtonClick('example-button-1', 'Click Me');
                }}
              >
                Track Button Click
              </ActionButton>
              
              <ActionButton
                onClick={() => {
                  trackFeatureEvent('FEATURE_CONFIGURED', 'dark-mode', {
                    enabled: true
                  });
                }}
              >
                Track Feature Configuration
              </ActionButton>
              
              <ActionButton
                onClick={() => {
                  const startTime = performance.now();
                  // Simulate some work
                  for (let i = 0; i < 1000000; i++) {
                    // Empty loop to simulate work
                  }
                  const duration = performance.now() - startTime;
                  
                  trackPerformance('RENDER_TIME', duration, {
                    component: 'Simulation'
                  });
                }}
              >
                Track Performance
              </ActionButton>
            </ButtonContainer>
            
            <FormContainer onSubmit={handleSubmit}>
              <FormTitle>Example Form</FormTitle>
              
              <FormField>
                <label htmlFor="name">Name:</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormField>
              
              <FormField>
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormField>
              
              <SubmitButton type="submit">Submit Form</SubmitButton>
            </FormContainer>
            
            {submittedData && (
              <ResultContainer>
                <ResultTitle>Form Submitted</ResultTitle>
                <pre>
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </ResultContainer>
            )}
          </div>
        )}
      </TabContent>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text.primary || '#333'};
`;

const TelemetryStatus = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${({ active }) => active ? '#4caf50' : '#f44336'};
  color: white;
  font-size: 14px;
  font-weight: 500;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  border: none;
  background-color: ${({ active }) => active ? '#f5f5f5' : 'transparent'};
  border-bottom: 2px solid ${({ active }) => active ? '#2196f3' : 'transparent'};
  cursor: pointer;
  font-weight: ${({ active }) => active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ active }) => active ? '#f5f5f5' : '#f0f0f0'};
  }
`;

const TabContent = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  min-height: 300px;
`;

const List = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
`;

const ConsentOption = styled.div`
  margin-bottom: 16px;
  
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  small {
    display: block;
    margin-left: 24px;
    color: #666;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  background-color: #2196f3;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #1976d2;
  }
`;

const FormContainer = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
`;

const FormField = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const ResultContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: #e8f5e9;
  border-radius: 4px;
  border: 1px solid #c8e6c9;
`;

const ResultTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 10px;
  color: #2e7d32;
`;

export default TelemetryExample; 