import React, { useState } from 'react';
import { FormContainer, FieldConfig } from './FormContainer';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { TextField } from './TextField';
import { ValidationRule } from './Form';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getThemeValue } from '../../core/theme/styled';

const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SectionDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${props => getThemeValue(props.theme, 'colors.gray.600')};
`;

const ResultCard = styled(Card)`
  margin-top: 1rem;
`;

const ResultContent = styled.pre`
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 1rem;
  background-color: ${props => getThemeValue(props.theme, 'colors.gray.50')};
  border-radius: 4px;
`;

export const FormDemo: React.FC = () => {
  const { currentTheme } = useTheme();
  const [simpleFormResult, setSimpleFormResult] = useState<Record<string, any> | null>(null);
  const [validationFormResult, setValidationFormResult] = useState<Record<string, any> | null>(null);
  const [horizontalFormResult, setHorizontalFormResult] = useState<Record<string, any> | null>(null);
  const [embeddedFormResult, setEmbeddedFormResult] = useState<Record<string, any> | null>(null);
  const [loadingState, setLoadingState] = useState({
    simple: false,
    validation: false,
    horizontal: false,
    embedded: false
  });

  // Simple form fields
  const simpleFields: FieldConfig[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address',
      helperText: 'We will never share your email with anyone else.'
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your message',
      fullWidth: true
    }
  ];

  // Form with complex validation rules
  const emailRule: ValidationRule = {
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  };

  const passwordRule: ValidationRule = {
    validator: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value),
    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
  };

  const validationFields: FieldConfig[] = [
    {
      name: 'username',
      label: 'Username',
      required: true,
      placeholder: 'Enter username (min 3 characters)',
      validationRules: [
        {
          validator: (value) => value.length >= 3,
          message: 'Username must be at least 3 characters long'
        }
      ]
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
      validationRules: [emailRule]
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter password',
      validationRules: [passwordRule]
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      placeholder: 'Confirm password',
      validationRules: [
        {
          validator: (value: any, values?: Record<string, any>) => value === values?.password,
          message: 'Passwords do not match'
        }
      ]
    }
  ];

  // Horizontal layout form fields
  const horizontalFields: FieldConfig[] = [
    {
      name: 'username',
      label: 'Username',
      required: true,
      placeholder: 'Enter username'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter password'
    },
    {
      name: 'rememberMe',
      label: 'Remember me',
      type: 'checkbox'
    }
  ];

  // Embedded form fields (without Card container)
  const embeddedFields: FieldConfig[] = [
    {
      name: 'searchTerm',
      label: 'Search',
      placeholder: 'Enter search term',
      fullWidth: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select'
    }
  ];

  // Handle form submissions with simulated API calls
  const handleSimpleSubmit = (values: Record<string, any>) => {
    setLoadingState(prev => ({ ...prev, simple: true }));
    // Simulate API call
    setTimeout(() => {
      setSimpleFormResult(values);
      setLoadingState(prev => ({ ...prev, simple: false }));
    }, 1000);
  };

  const handleValidationSubmit = (values: Record<string, any>) => {
    setLoadingState(prev => ({ ...prev, validation: true }));
    // Simulate API call
    setTimeout(() => {
      // Remove confirmPassword from the result
      const { confirmPassword, ...resultValues } = values;
      setValidationFormResult(resultValues);
      setLoadingState(prev => ({ ...prev, validation: false }));
    }, 1500);
  };

  const handleHorizontalSubmit = (values: Record<string, any>) => {
    setLoadingState(prev => ({ ...prev, horizontal: true }));
    // Simulate API call
    setTimeout(() => {
      setHorizontalFormResult(values);
      setLoadingState(prev => ({ ...prev, horizontal: false }));
    }, 800);
  };

  const handleEmbeddedSubmit = (values: Record<string, any>) => {
    setLoadingState(prev => ({ ...prev, embedded: true }));
    // Simulate API call
    setTimeout(() => {
      setEmbeddedFormResult(values);
      setLoadingState(prev => ({ ...prev, embedded: false }));
    }, 600);
  };

  return (
    <DemoContainer>
      <h1>Form Component Demo</h1>
      <p>This demo shows different configurations and capabilities of the FormContainer component.</p>

      <DemoSection>
        <SectionTitle>Simple Contact Form</SectionTitle>
        <SectionDescription>
          A basic contact form with simple required field validation.
        </SectionDescription>

        <FormContainer
          title="Contact Us"
          description="Fill out this form to send us a message."
          fields={simpleFields}
          onSubmit={handleSimpleSubmit}
          isLoading={loadingState.simple}
          submitButtonText="Send Message"
        />

        {simpleFormResult && (
          <ResultCard>
            <CardHeader>Form Submission Result</CardHeader>
            <CardContent>
              <ResultContent>
                {JSON.stringify(simpleFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection>
        <SectionTitle>Form with Complex Validation</SectionTitle>
        <SectionDescription>
          Demonstrates advanced validation rules including password requirements and field matching.
        </SectionDescription>

        <FormContainer
          title="Create Account"
          description="Create a new account with username and password."
          fields={validationFields}
          onSubmit={handleValidationSubmit}
          isLoading={loadingState.validation}
          submitButtonText="Create Account"
        />

        {validationFormResult && (
          <ResultCard>
            <CardHeader>Account Creation Result</CardHeader>
            <CardContent>
              <ResultContent>
                {JSON.stringify(validationFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection>
        <SectionTitle>Horizontal Layout Form</SectionTitle>
        <SectionDescription>
          Form with horizontal layout, useful for login forms or simple data entry.
        </SectionDescription>

        <FormContainer
          title="Sign In"
          description="Sign in to your account."
          fields={horizontalFields}
          onSubmit={handleHorizontalSubmit}
          isLoading={loadingState.horizontal}
          submitButtonText="Sign In"
          layout="horizontal"
        />

        {horizontalFormResult && (
          <ResultCard>
            <CardHeader>Sign In Result</CardHeader>
            <CardContent>
              <ResultContent>
                {JSON.stringify(horizontalFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection>
        <SectionTitle>Embedded Form (No Card Container)</SectionTitle>
        <SectionDescription>
          Form without the Card container, useful for embedding in other components.
        </SectionDescription>

        <Card>
          <CardHeader>Search Panel</CardHeader>
          <CardContent>
            <FormContainer
              fields={embeddedFields}
              onSubmit={handleEmbeddedSubmit}
              isLoading={loadingState.embedded}
              submitButtonText="Search"
              embedded={true}
            />
          </CardContent>
          {embeddedFormResult && (
            <CardFooter>
              <ResultContent>
                {JSON.stringify(embeddedFormResult, null, 2)}
              </ResultContent>
            </CardFooter>
          )}
        </Card>
      </DemoSection>
    </DemoContainer>
  );
}; 