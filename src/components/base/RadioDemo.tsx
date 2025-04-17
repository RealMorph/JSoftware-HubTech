import React, { useState } from 'react';
import { Radio } from './Radio';
import { Card, CardHeader, CardContent } from './Card';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme styles interface
interface ThemeStyles {
  // Colors
  textPrimary: string;
  textSecondary: string;
  backgroundColor: string;
  borderColor: string;
  primaryColor: string;
  errorColor: string;
  // Typography
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontWeightNormal: number;
  fontWeightBold: number;
  // Spacing
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
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
    textSecondary: getColor('text.secondary', '#666666'),
    backgroundColor: getColor('background', '#ffffff'),
    borderColor: getColor('border', '#e0e0e0'),
    primaryColor: getColor('primary', '#0073ea'),
    errorColor: getColor('error', '#d32f2f'),
    // Typography with fallbacks
    fontSizeSm: getTypography('fontSize.sm', '0.875rem') as string,
    fontSizeMd: getTypography('fontSize.md', '1rem') as string,
    fontSizeLg: getTypography('fontSize.lg', '1.25rem') as string,
    fontWeightNormal: getTypography('fontWeight.normal', 400) as number,
    fontWeightBold: getTypography('fontWeight.bold', 700) as number,
    // Spacing with fallbacks
    spacingXs: getSpacing('xs', '0.25rem'),
    spacingSm: getSpacing('sm', '0.5rem'),
    spacingMd: getSpacing('md', '1rem'),
    spacingLg: getSpacing('lg', '1.5rem'),
    spacingXl: getSpacing('xl', '2rem'),
    // Other with fallbacks
    borderRadius: getBorderRadius('md', '0.25rem'),
    boxShadow: getShadow('md', '0 2px 4px rgba(0,0,0,0.1)'),
  };
};

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacingXl};
  color: ${props => props.$themeStyles.textPrimary};
`;

const PageTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacingXl};
  font-size: ${props => props.$themeStyles.fontSizeLg};
  font-weight: ${props => props.$themeStyles.fontWeightBold};
`;

const DemoCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacingXl};
`;

const SectionContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacingXl};
`;

const SectionTitle = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeMd};
  margin-bottom: ${props => props.$themeStyles.spacingSm};
  font-weight: ${props => props.$themeStyles.fontWeightBold};
`;

const RadioGroup = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacingSm};
`;

const SelectedOption = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacingMd};
`;

const HorizontalRadioGroup = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacingLg};
  flex-wrap: wrap;
`;

const FormContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  border: 1px solid ${props => props.$themeStyles.borderColor};
  padding: ${props => props.$themeStyles.spacingMd};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const FormSectionTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacingMd};
  font-size: ${props => props.$themeStyles.fontSizeMd};
`;

const FormDivider = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: ${props => props.$themeStyles.spacingLg} 0 ${props => props.$themeStyles.spacingMd};
  font-size: ${props => props.$themeStyles.fontSizeMd};
`;

const ActionButton = styled.button<{ $themeStyles: ThemeStyles; $isEnabled: boolean }>`
  padding: ${props => props.$themeStyles.spacingSm} ${props => props.$themeStyles.spacingMd};
  background-color: ${props => props.$themeStyles.primaryColor};
  color: white;
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius};
  cursor: pointer;
  opacity: ${props => (props.$isEnabled ? 1 : 0.5)};
  margin-top: ${props => props.$themeStyles.spacingLg};
`;

/**
 * Demo component showcasing different configurations of the Radio component
 */
export const RadioDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // State for radio examples
  const [selectedBasic, setSelectedBasic] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [selectedColor, setSelectedColor] = useState<string>('primary');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <PageTitle $themeStyles={themeStyles}>Radio Component Demo</PageTitle>

      {/* Basic Radio Group */}
      <DemoCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Basic Radio Group</h2>
        </CardHeader>
        <CardContent>
          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Basic selection</SectionTitle>
            <RadioGroup $themeStyles={themeStyles}>
              <Radio
                label="Option One"
                name="basic-demo"
                value="one"
                checked={selectedBasic === 'one'}
                onChange={() => setSelectedBasic('one')}
              />
              <Radio
                label="Option Two"
                name="basic-demo"
                value="two"
                checked={selectedBasic === 'two'}
                onChange={() => setSelectedBasic('two')}
              />
              <Radio
                label="Option Three"
                name="basic-demo"
                value="three"
                checked={selectedBasic === 'three'}
                onChange={() => setSelectedBasic('three')}
              />
            </RadioGroup>
            {selectedBasic && (
              <SelectedOption $themeStyles={themeStyles}>
                Selected option: <strong>{selectedBasic}</strong>
              </SelectedOption>
            )}
          </SectionContainer>

          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>With helper text</SectionTitle>
            <RadioGroup $themeStyles={themeStyles}>
              <Radio
                label="Standard delivery (Free)"
                helperText="Delivery within 5-7 business days"
                name="delivery"
                value="standard"
              />
              <Radio
                label="Express delivery ($9.99)"
                helperText="Delivery within 2-3 business days"
                name="delivery"
                value="express"
              />
              <Radio
                label="Next day delivery ($19.99)"
                helperText="Order before 4pm for next day delivery"
                name="delivery"
                value="next-day"
              />
            </RadioGroup>
          </SectionContainer>

          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Disabled state</SectionTitle>
            <RadioGroup $themeStyles={themeStyles}>
              <Radio label="Available option" name="disabled-demo" value="available" />
              <Radio
                label="Currently unavailable"
                name="disabled-demo"
                value="unavailable"
                disabled
              />
              <Radio
                label="Selected but disabled"
                name="disabled-demo"
                value="selected-disabled"
                checked
                disabled
              />
            </RadioGroup>
          </SectionContainer>
        </CardContent>
      </DemoCard>

      {/* Sizes */}
      <DemoCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Size Variations</h2>
        </CardHeader>
        <CardContent>
          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Different sizes</SectionTitle>
            <RadioGroup $themeStyles={themeStyles}>
              <Radio
                label="Small size"
                size="small"
                name="size-demo"
                value="small"
                checked={selectedSize === 'small'}
                onChange={() => setSelectedSize('small')}
              />
              <Radio
                label="Medium size (default)"
                size="medium"
                name="size-demo"
                value="medium"
                checked={selectedSize === 'medium'}
                onChange={() => setSelectedSize('medium')}
              />
              <Radio
                label="Large size"
                size="large"
                name="size-demo"
                value="large"
                checked={selectedSize === 'large'}
                onChange={() => setSelectedSize('large')}
              />
            </RadioGroup>
          </SectionContainer>
        </CardContent>
      </DemoCard>

      {/* Colors */}
      <DemoCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Color Variations</h2>
        </CardHeader>
        <CardContent>
          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Different colors</SectionTitle>
            <RadioGroup $themeStyles={themeStyles}>
              <Radio
                label="Primary color (default)"
                color="primary"
                name="color-demo"
                value="primary"
                checked={selectedColor === 'primary'}
                onChange={() => setSelectedColor('primary')}
              />
              <Radio
                label="Secondary color"
                color="secondary"
                name="color-demo"
                value="secondary"
                checked={selectedColor === 'secondary'}
                onChange={() => setSelectedColor('secondary')}
              />
              <Radio
                label="Success color"
                color="success"
                name="color-demo"
                value="success"
                checked={selectedColor === 'success'}
                onChange={() => setSelectedColor('success')}
              />
              <Radio
                label="Error color"
                color="error"
                name="color-demo"
                value="error"
                checked={selectedColor === 'error'}
                onChange={() => setSelectedColor('error')}
              />
              <Radio
                label="Warning color"
                color="warning"
                name="color-demo"
                value="warning"
                checked={selectedColor === 'warning'}
                onChange={() => setSelectedColor('warning')}
              />
              <Radio
                label="Info color"
                color="info"
                name="color-demo"
                value="info"
                checked={selectedColor === 'info'}
                onChange={() => setSelectedColor('info')}
              />
            </RadioGroup>
          </SectionContainer>
        </CardContent>
      </DemoCard>

      {/* Error State */}
      <DemoCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Error State</h2>
        </CardHeader>
        <CardContent>
          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Error indication</SectionTitle>
            <RadioGroup $themeStyles={themeStyles}>
              <Radio
                label="Option with error"
                error
                helperText="This field has an error"
                name="error-demo"
                value="error"
              />
              <Radio label="Normal option" name="error-demo" value="normal" />
            </RadioGroup>
          </SectionContainer>
        </CardContent>
      </DemoCard>

      {/* Form Integration */}
      <DemoCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Form Integration Example</h2>
        </CardHeader>
        <CardContent>
          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Subscription Plans</SectionTitle>
            <FormContainer $themeStyles={themeStyles}>
              <FormSectionTitle $themeStyles={themeStyles}>Choose a Plan</FormSectionTitle>
              <RadioGroup $themeStyles={themeStyles}>
                <Radio
                  label="Basic Plan - $9.99/month"
                  helperText="Access to basic features"
                  name="subscription-plan"
                  value="basic"
                  checked={selectedPlan === 'basic'}
                  onChange={() => setSelectedPlan('basic')}
                />
                <Radio
                  label="Pro Plan - $19.99/month"
                  helperText="Access to all features with priority support"
                  name="subscription-plan"
                  value="pro"
                  checked={selectedPlan === 'pro'}
                  onChange={() => setSelectedPlan('pro')}
                />
                <Radio
                  label="Enterprise Plan - $49.99/month"
                  helperText="Custom solutions for large organizations"
                  name="subscription-plan"
                  value="enterprise"
                  checked={selectedPlan === 'enterprise'}
                  onChange={() => setSelectedPlan('enterprise')}
                />
              </RadioGroup>

              {selectedPlan && (
                <>
                  <FormDivider $themeStyles={themeStyles}>Payment Method</FormDivider>
                  <RadioGroup $themeStyles={themeStyles}>
                    <Radio
                      label="Credit Card"
                      name="payment-method"
                      value="credit-card"
                      checked={paymentMethod === 'credit-card'}
                      onChange={() => setPaymentMethod('credit-card')}
                    />
                    <Radio
                      label="PayPal"
                      name="payment-method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                    <Radio
                      label="Bank Transfer"
                      name="payment-method"
                      value="bank-transfer"
                      checked={paymentMethod === 'bank-transfer'}
                      onChange={() => setPaymentMethod('bank-transfer')}
                    />
                  </RadioGroup>
                </>
              )}

              <ActionButton
                $themeStyles={themeStyles}
                $isEnabled={!!(selectedPlan && paymentMethod)}
                disabled={!selectedPlan || !paymentMethod}
              >
                Subscribe Now
              </ActionButton>
            </FormContainer>
          </SectionContainer>
        </CardContent>
      </DemoCard>

      {/* Horizontal Layout */}
      <DemoCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Horizontal Layout</h2>
        </CardHeader>
        <CardContent>
          <SectionContainer $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Radio buttons in a row</SectionTitle>
            <HorizontalRadioGroup $themeStyles={themeStyles}>
              <Radio label="Option A" name="horizontal-demo" value="a" />
              <Radio label="Option B" name="horizontal-demo" value="b" />
              <Radio label="Option C" name="horizontal-demo" value="c" />
            </HorizontalRadioGroup>
          </SectionContainer>
        </CardContent>
      </DemoCard>
    </DemoContainer>
  );
};

export default RadioDemo;
