import React, { useState } from 'react';
import { FormContainer, FieldConfig } from './FormContainer';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { ValidationRule } from './Form';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme styles interface
interface ThemeStyles {
  // Colors
  textPrimary: string;
  textSecondary: string;
  backgroundColor: string;
  backgroundSecondary: string;
  borderColor: string;
  // Typography
  headingFontSize: string;
  bodyFontSize: string;
  fontFamily: string;
  fontWeightBold: number;
  fontWeightNormal: number;
  // Spacing
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  // Other
  borderRadius: string;
  boxShadow: string;
}

// Create theme styles from DirectTheme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;

  return {
    // Colors with fallbacks
    textPrimary: getColor('text.primary', '#333333'),
    textSecondary: getColor('gray.600', '#666666'),
    backgroundColor: getColor('background', '#ffffff'),
    backgroundSecondary: getColor('gray.50', '#f9f9f9'),
    borderColor: getColor('border', '#e2e8f0'),
    // Typography with fallbacks
    headingFontSize: getTypography('fontSize.xl', '1.5rem') as string,
    bodyFontSize: getTypography('fontSize.md', '1rem') as string,
    fontFamily: getTypography('fontFamily.base', 'system-ui, sans-serif') as string,
    fontWeightBold: getTypography('fontWeight.bold', 600) as number,
    fontWeightNormal: getTypography('fontWeight.normal', 400) as number,
    // Spacing with fallbacks
    spacingSm: getSpacing('sm', '0.5rem'),
    spacingMd: getSpacing('md', '1rem'),
    spacingLg: getSpacing('lg', '2rem'),
    // Other with fallbacks
    borderRadius: getBorderRadius('md', '0.25rem'),
    boxShadow: getShadow('md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
  };
};

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacingLg};
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacingMd};
  font-family: ${props => props.$themeStyles.fontFamily};
  color: ${props => props.$themeStyles.textPrimary};
`;

const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacingSm};
  margin-bottom: ${props => props.$themeStyles.spacingMd};
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.headingFontSize};
  font-weight: ${props => props.$themeStyles.fontWeightBold};
  margin-bottom: ${props => props.$themeStyles.spacingSm};
  color: ${props => props.$themeStyles.textPrimary};
`;

const SectionDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.bodyFontSize};
  margin-bottom: ${props => props.$themeStyles.spacingMd};
  color: ${props => props.$themeStyles.textSecondary};
`;

const ResultCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacingMd};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.boxShadow};
`;

const ResultContent = styled.pre<{ $themeStyles: ThemeStyles }>`
  font-family: monospace;
  font-size: ${props => props.$themeStyles.bodyFontSize};
  white-space: pre-wrap;
  word-break: break-word;
  padding: ${props => props.$themeStyles.spacingMd};
  background-color: ${props => props.$themeStyles.backgroundSecondary};
  border-radius: ${props => props.$themeStyles.borderRadius};
  border: 1px solid ${props => props.$themeStyles.borderColor};
`;

/**
 * Form demo component showcasing various form configurations and validation scenarios
 */
export const FormDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const [simpleFormResult, setSimpleFormResult] = useState<Record<string, unknown> | null>(null);
  const [validationFormResult, setValidationFormResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [horizontalFormResult, setHorizontalFormResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [embeddedFormResult, setEmbeddedFormResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [loadingState, setLoadingState] = useState({
    simple: false,
    validation: false,
    horizontal: false,
    embedded: false,
  });

  // Simple form fields
  const simpleFields: FieldConfig[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      name: 'email',
      label: 'Email',
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

  // Form with complex validation rules
  const emailRule: ValidationRule = {
    validator: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
  };

  const passwordRule: ValidationRule = {
    validator: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value),
    message:
      'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
  };

  const validationFields: FieldConfig[] = [
    {
      name: 'username',
      label: 'Username',
      required: true,
      placeholder: 'Enter username (min 3 characters)',
      validationRules: [
        {
          validator: value => value.length >= 3,
          message: 'Username must be at least 3 characters long',
        },
      ],
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
      validationRules: [emailRule],
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
      validationRules: [
        {
          validator: (value: string, values?: Record<string, unknown>) =>
            value === values?.password,
          message: 'Passwords do not match',
        },
      ],
    },
  ];

  // Horizontal layout form fields
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

  // Embedded form fields (without Card container)
  const embeddedFields: FieldConfig[] = [
    {
      name: 'searchTerm',
      label: 'Search',
      placeholder: 'Enter search term',
      fullWidth: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
    },
  ];

  // Handle form submissions with simulated API calls
  const handleSimpleSubmit = (values: Record<string, unknown>) => {
    setLoadingState(prev => ({ ...prev, simple: true }));
    // Simulate API call
    setTimeout(() => {
      setSimpleFormResult(values);
      setLoadingState(prev => ({ ...prev, simple: false }));
    }, 1000);
  };

  const handleValidationSubmit = (values: Record<string, unknown>) => {
    setLoadingState(prev => ({ ...prev, validation: true }));
    // Simulate API call
    setTimeout(() => {
      // Create a copy of values without the confirmPassword field
      const resultValues = { ...values };
      delete resultValues.confirmPassword;

      setValidationFormResult(resultValues);
      setLoadingState(prev => ({ ...prev, validation: false }));
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

  const handleEmbeddedSubmit = (values: Record<string, unknown>) => {
    setLoadingState(prev => ({ ...prev, embedded: true }));
    // Simulate API call
    setTimeout(() => {
      setEmbeddedFormResult(values);
      setLoadingState(prev => ({ ...prev, embedded: false }));
    }, 600);
  };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <h1>Form Component Demo</h1>
      <p>
        This demo shows different configurations and capabilities of the FormContainer component.
      </p>

      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Simple Contact Form</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
          <ResultCard $themeStyles={themeStyles}>
            <CardHeader>Form Submission Result</CardHeader>
            <CardContent>
              <ResultContent $themeStyles={themeStyles}>
                {JSON.stringify(simpleFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Form with Complex Validation</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
          <ResultCard $themeStyles={themeStyles}>
            <CardHeader>Account Creation Result</CardHeader>
            <CardContent>
              <ResultContent $themeStyles={themeStyles}>
                {JSON.stringify(validationFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Horizontal Layout Form</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
          <ResultCard $themeStyles={themeStyles}>
            <CardHeader>Sign In Result</CardHeader>
            <CardContent>
              <ResultContent $themeStyles={themeStyles}>
                {JSON.stringify(horizontalFormResult, null, 2)}
              </ResultContent>
            </CardContent>
          </ResultCard>
        )}
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Embedded Form (No Card Container)</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
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
              <ResultContent $themeStyles={themeStyles}>
                {JSON.stringify(embeddedFormResult, null, 2)}
              </ResultContent>
            </CardFooter>
          )}
        </Card>
      </DemoSection>
    </DemoContainer>
  );
};
