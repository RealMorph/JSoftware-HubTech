import React, { useState } from 'react';
import { FormContainer, FieldConfig } from './FormContainer';
import { TextField } from './TextField';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { Card, CardHeader, CardContent } from './Card';
import { ValidationRule } from './Form';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/theme-context';
import { getThemeValue } from '../../core/theme/styled';
import { getThemeProperty } from '../../core/theme/theme-provider-wrapper';

const FormDemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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
  color: ${props => getThemeProperty(props.theme, 'colors.gray.600', '#4B5563')};
`;

const ResultCard = styled(Card)`
  margin-top: 1rem;
  background-color: ${props => getThemeProperty(props.theme, 'colors.gray.50', '#F9FAFB')};
`;

const ResultContent = styled.pre`
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

// Helper function to access theme values safely
const getThemeVal = (currentTheme: any, path: string): string => {
  if (!currentTheme) return '';
  return getThemeProperty(currentTheme, path, '');
};

/**
 * Demo component for FormContainer showcasing different validation scenarios
 */
export const FormContainerDemo: React.FC = () => {
  const { currentTheme } = useTheme();
  const [basicFormResult, setBasicFormResult] = useState<Record<string, any> | null>(null);
  const [advancedFormResult, setAdvancedFormResult] = useState<Record<string, any> | null>(null);
  const [horizontalFormResult, setHorizontalFormResult] = useState<Record<string, any> | null>(null);
  const [loadingState, setLoadingState] = useState<{
    basic: boolean;
    advanced: boolean;
    horizontal: boolean;
  }>({
    basic: false,
    advanced: false,
    horizontal: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Basic form fields
  const basicFields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address',
      helperText: 'We will never share your email with anyone else.',
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your message',
      fullWidth: true,
    },
  ];

  // Advanced form fields with custom validation
  const passwordRule: ValidationRule = {
    validator: (value) => {
      // Password must have at least 8 characters, 1 uppercase, 1 lowercase, and 1 number
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    },
    message: 'Password must have at least 8 characters, 1 uppercase, 1 lowercase, and 1 number',
  };

  const matchPasswordRule = (values: Record<string, any>): ValidationRule => ({
    validator: (value) => value === values.password,
    message: 'Passwords do not match',
  });

  const advancedFields: FieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      required: true,
      placeholder: 'Enter your first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      required: true,
      placeholder: 'Enter your last name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter password',
      validationRules: [passwordRule],
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      placeholder: 'Confirm password',
      // We'll add this validation rule dynamically based on the password field
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      required: true,
      validationRules: [
        {
          validator: (value) => parseInt(value) >= 18,
          message: 'You must be at least 18 years old',
        },
      ],
    },
    {
      name: 'terms',
      label: 'I agree to the Terms and Conditions',
      type: 'checkbox',
      required: true,
      validationRules: [
        {
          validator: (value) => value === true,
          message: 'You must agree to the Terms and Conditions',
        },
      ],
    },
  ];

  // Horizontal form fields (for layout demo)
  const horizontalFields: FieldConfig[] = [
    {
      name: 'username',
      label: 'Username',
      required: true,
      placeholder: 'Enter username',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter password',
    },
    {
      name: 'rememberMe',
      label: 'Remember me',
      type: 'checkbox',
    },
  ];

  // Handle form submissions with simulated API call
  const handleBasicSubmit = (values: Record<string, any>) => {
    setLoadingState(prev => ({ ...prev, basic: true }));
    setErrorMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      setBasicFormResult(values);
      setLoadingState(prev => ({ ...prev, basic: false }));
    }, 1000);
  };

  const handleAdvancedSubmit = (values: Record<string, any>) => {
    setLoadingState(prev => ({ ...prev, advanced: true }));
    setErrorMessage(null);
    
    // Simulate API call with possible error
    setTimeout(() => {
      // 20% chance of error for demo purposes
      if (Math.random() < 0.2) {
        setErrorMessage('Server error: Failed to submit form. Please try again later.');
        setAdvancedFormResult(null);
      } else {
        // Remove confirmPassword from the result
        const { confirmPassword, ...resultValues } = values;
        setAdvancedFormResult(resultValues);
        setErrorMessage(null);
      }
      setLoadingState(prev => ({ ...prev, advanced: false }));
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

  return (
    <FormDemoContainer>
      <DemoSection>
        <SectionTitle>Basic Form</SectionTitle>
        <SectionDescription>
          A simple contact form with basic validation.
        </SectionDescription>
        
        <FormContainer
          title="Contact Us"
          description="Fill out this form to get in touch with our team."
          fields={basicFields}
          onSubmit={handleBasicSubmit}
          submitButtonText="Send Message"
          isLoading={loadingState.basic}
        />
        
        {basicFormResult && (
          <ResultCard>
            <CardHeader>Form Submission</CardHeader>
            <CardContent>
              <ResultContent>
                {JSON.stringify(basicFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection>
        <SectionTitle>Advanced Form with Custom Validation</SectionTitle>
        <SectionDescription>
          A registration form with custom validation rules and error handling.
        </SectionDescription>
        
        <FormContainer
          title="Create Account"
          description="Sign up for a new account with advanced validation."
          fields={advancedFields.map(field => 
            field.name === 'confirmPassword' 
              ? { ...field, validationRules: [matchPasswordRule(advancedFormResult || {})] } 
              : field
          )}
          onSubmit={handleAdvancedSubmit}
          submitButtonText="Create Account"
          isLoading={loadingState.advanced}
        />
        
        {errorMessage && (
          <ResultCard>
            <CardContent style={{ color: getThemeVal(currentTheme, 'colors.error.500') }}>
              {errorMessage}
            </CardContent>
          </ResultCard>
        )}
        
        {advancedFormResult && (
          <ResultCard>
            <CardHeader>Account Created Successfully</CardHeader>
            <CardContent>
              <ResultContent>
                {JSON.stringify(advancedFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection>
        <SectionTitle>Horizontal Layout Form</SectionTitle>
        <SectionDescription>
          A login form with horizontal layout for compact display.
        </SectionDescription>
        
        <FormContainer
          title="Login"
          description="Sign in to your account"
          fields={horizontalFields}
          onSubmit={handleHorizontalSubmit}
          submitButtonText="Sign In"
          layout="horizontal"
          isLoading={loadingState.horizontal}
        />
        
        {horizontalFormResult && (
          <ResultCard>
            <CardHeader>Login Attempt</CardHeader>
            <CardContent>
              <ResultContent>
                {JSON.stringify(horizontalFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>
    </FormDemoContainer>
  );
};

export default FormContainerDemo; 