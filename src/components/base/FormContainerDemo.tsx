import React, { useState } from 'react';
import { FormContainer, FieldConfig } from './FormContainer';
import { Card, CardHeader, CardContent } from './Card';
import { ValidationRule } from './Form';
import styled from '@emotion/styled';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';

// Define a theme styles interface for consistent theming - simplified for this demo
interface ThemeStyles {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      bold: number;
    };
  };
  borderRadius: string;
}

// Theme-based styled components
const FormDemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.xl};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.md};
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.large};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.bold};
  margin-bottom: ${props => props.$themeStyles.spacing.md};
`;

const SectionDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.medium};
  margin-bottom: ${props => props.$themeStyles.spacing.md};
  color: ${props => props.$themeStyles.colors.secondary};
`;

const ResultCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.md};
  background-color: ${props => props.$themeStyles.colors.surface};
`;

const ResultContent = styled.pre<{ $themeStyles: ThemeStyles }>`
  font-family: ${props => props.$themeStyles.typography.fontFamily};
  font-size: ${props => props.$themeStyles.typography.fontSize.small};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ErrorContent = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.error};
  padding: 0.5rem;
`;

// Create theme styles from the theme context
function createThemeStyles(themeContext: DirectThemeContextType): ThemeStyles {
  const { theme } = themeContext;

  return {
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: typeof theme.colors.text === 'string' ? theme.colors.text : theme.colors.text.primary,
      error: theme.colors.error,
    },
    spacing: {
      xs: theme.spacing.xs,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
    },
    typography: {
      fontFamily: theme.typography.fontFamily.base,
      fontSize: {
        small: theme.typography.fontSize.sm,
        medium: theme.typography.fontSize.md,
        large: theme.typography.fontSize.lg,
      },
      fontWeight: {
        regular: theme.typography.fontWeight.normal,
        medium: theme.typography.fontWeight.medium,
        bold: theme.typography.fontWeight.bold,
      },
    },
    borderRadius: theme.borderRadius.base,
  };
}

/**
 * Demo component for FormContainer showcasing different validation scenarios
 */
export const FormContainerDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const [basicFormResult, setBasicFormResult] = useState<Record<string, unknown> | null>(null);
  const [advancedFormResult, setAdvancedFormResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [horizontalFormResult, setHorizontalFormResult] = useState<Record<string, unknown> | null>(
    null
  );
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
    validator: value => {
      // Password must have at least 8 characters, 1 uppercase, 1 lowercase, and 1 number
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    },
    message: 'Password must have at least 8 characters, 1 uppercase, 1 lowercase, and 1 number',
  };

  const matchPasswordRule = (values: Record<string, unknown>): ValidationRule => ({
    validator: value => value === values.password,
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
          validator: value => parseInt(value) >= 18,
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
          validator: value => value === true,
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
  const handleBasicSubmit = (values: Record<string, unknown>) => {
    setLoadingState(prev => ({ ...prev, basic: true }));
    setErrorMessage(null);

    // Simulate API call
    setTimeout(() => {
      setBasicFormResult(values);
      setLoadingState(prev => ({ ...prev, basic: false }));
    }, 1000);
  };

  const handleAdvancedSubmit = (values: Record<string, unknown>) => {
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
        const { ...resultValues } = values;
        setAdvancedFormResult(resultValues);
        setErrorMessage(null);
      }
      setLoadingState(prev => ({ ...prev, advanced: false }));
    }, 1500);
  };

  const handleHorizontalSubmit = (values: Record<string, unknown>) => {
    setLoadingState(prev => ({ ...prev, horizontal: true }));

    // Simulate API call
    setTimeout(() => {
      setHorizontalFormResult(values);
      setLoadingState(prev => ({ ...prev, horizontal: false }));
    }, 800);
  };

  return (
    <FormDemoContainer $themeStyles={themeStyles}>
      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Basic Form</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
          <ResultCard $themeStyles={themeStyles}>
            <CardHeader>Form Submission</CardHeader>
            <CardContent>
              <ResultContent $themeStyles={themeStyles}>
                {JSON.stringify(basicFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Advanced Form with Custom Validation</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
          <ResultCard $themeStyles={themeStyles}>
            <CardContent>
              <ErrorContent $themeStyles={themeStyles}>{errorMessage}</ErrorContent>
            </CardContent>
          </ResultCard>
        )}

        {advancedFormResult && (
          <ResultCard $themeStyles={themeStyles}>
            <CardHeader>Account Created Successfully</CardHeader>
            <CardContent>
              <ResultContent $themeStyles={themeStyles}>
                {JSON.stringify(advancedFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Horizontal Layout Form</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
          <ResultCard $themeStyles={themeStyles}>
            <CardHeader>Login Attempt</CardHeader>
            <CardContent>
              <ResultContent $themeStyles={themeStyles}>
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
