import React, { useState } from 'react';
import { Button } from '../base/Button';
import { DialogProvider, useDialog } from '../feedback/DialogProvider';
import styled from '@emotion/styled';

// Demo styled components
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const Description = styled.p`
  margin: 0 0 1rem 0;
  color: #4b5563;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

// Simple form component for the demo
const SimpleForm = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
        <input 
          id="name"
          type="text" 
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '0.25rem' 
          }}
        />
      </div>
      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
        <input 
          id="email"
          type="email" 
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '0.25rem' 
          }}
        />
      </div>
    </div>
  );
};

// Form Dialog examples component
const FormDialogExamples = () => {
  const { form } = useDialog();
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  
  // Show result message
  const showResult = (message: string) => {
    setResultMessage(message);
    setTimeout(() => setResultMessage(null), 3000);
  };
  
  // Form dialog examples
  const showSimpleFormDialog = () => {
    form({
      title: 'Update Profile',
      children: <SimpleForm />,
      onSubmit: (e) => {
        e.preventDefault();
        showResult('Profile updated successfully');
      },
    });
  };
  
  const showAsyncFormDialog = () => {
    form({
      title: 'Create Account',
      children: <SimpleForm />,
      onSubmit: async (e) => {
        e.preventDefault();
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1500));
        showResult('Account created successfully');
      },
      submitText: 'Create Account',
    });
  };
  
  const showErrorFormDialog = () => {
    form({
      title: 'Login',
      children: <SimpleForm />,
      onSubmit: async (e) => {
        e.preventDefault();
        // Simulate async operation with error
        await new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Invalid credentials')), 1500)
        );
      },
      submitText: 'Login',
    });
  };
  
  const showCustomizedFormDialog = () => {
    form({
      title: 'Send Feedback',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem' }}>Subject</label>
            <input 
              id="subject"
              type="text" 
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.25rem' 
              }}
            />
          </div>
          <div>
            <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem' }}>Message</label>
            <textarea 
              id="message"
              rows={4}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.25rem' 
              }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" />
              <span>Send me a copy</span>
            </label>
          </div>
        </div>
      ),
      onSubmit: async (e) => {
        e.preventDefault();
        await new Promise(resolve => setTimeout(resolve, 1000));
        showResult('Feedback sent successfully');
      },
      submitText: 'Send Feedback',
      cancelText: 'Maybe Later',
      size: 'medium',
      position: 'center',
    });
  };
  
  return (
    <DemoContainer>
      <h1>Form Dialog Demo</h1>
      
      <Section>
        <SectionTitle>Form Dialog Examples</SectionTitle>
        <Description>
          Specialized dialogs with form handling capabilities for collecting user input.
        </Description>
        <ButtonGroup>
          <Button onClick={showSimpleFormDialog}>Simple Form</Button>
          <Button onClick={showAsyncFormDialog} variant="secondary">Async Form Submission</Button>
          <Button onClick={showErrorFormDialog} variant="accent">Form With Error</Button>
          <Button onClick={showCustomizedFormDialog} variant="primary">Customized Form</Button>
        </ButtonGroup>
      </Section>
      
      {resultMessage && (
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem', 
          padding: '1rem', 
          backgroundColor: '#10B981', 
          color: 'white',
          borderRadius: '0.25rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
          {resultMessage}
        </div>
      )}
    </DemoContainer>
  );
};

// Main demo component wrapped with DialogProvider
const FormDialogDemo: React.FC = () => {
  return (
    <DialogProvider>
      <FormDialogExamples />
    </DialogProvider>
  );
};

export default FormDialogDemo; 