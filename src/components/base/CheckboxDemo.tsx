import React, { useState, useEffect } from 'react';
import { Checkbox } from './Checkbox';
import { Card, CardHeader, CardContent } from './Card';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define a theme styles interface for consistent theming
interface ThemeStyles {
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    heading: string;
    subheading: string;
    border: string;
  };
  spacing: {
    page: string;
    section: string;
    item: string;
    card: string;
    indent: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
    };
    heading: {
      fontSize: string;
      fontWeight: string;
    };
    subheading: {
      fontSize: string;
      fontWeight: string;
    };
  };
  shadows: {
    card: string;
  };
  borderRadius: string;
}

// Theme-based styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.page};
  color: ${props => props.$themeStyles.colors.text};
  background-color: ${props => props.$themeStyles.colors.background};
`;

const DemoTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  font-size: ${props => props.$themeStyles.typography.title.fontSize};
  font-weight: ${props => props.$themeStyles.typography.title.fontWeight};
  color: ${props => props.$themeStyles.colors.heading};
`;

const Section = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const SectionTitle = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.subheading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.subheading.fontWeight};
  color: ${props => props.$themeStyles.colors.subheading};
`;

const CheckboxGroup = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.item};
`;

const IndentedGroup = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-left: ${props => props.$themeStyles.spacing.indent};
`;

const CheckboxSpacing = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.item};
`;

const StyledCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  box-shadow: ${props => props.$themeStyles.shadows.card};
`;

// Create theme styles based on DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;

  return {
    colors: {
      background: getColor('background', '#ffffff'),
      text: getColor('text.primary', '#333333'),
      textSecondary: getColor('text.secondary', '#666666'),
      heading: getColor('text.primary', '#111827'),
      subheading: getColor('text.primary', '#111827'),
      border: getColor('border', '#e5e7eb'),
    },
    spacing: {
      page: getSpacing('6', '24px'),
      section: getSpacing('8', '32px'),
      item: getSpacing('3', '12px'),
      card: getSpacing('6', '24px'),
      indent: getSpacing('7', '28px'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.xl', '24px') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
      heading: {
        fontSize: getTypography('fontSize.lg', '18px') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
      subheading: {
        fontSize: getTypography('fontSize.sm', '16px') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
      },
    },
    shadows: {
      card: getShadow(
        'md',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      ),
    },
    borderRadius: getBorderRadius('md', '0.375rem'),
  };
}

export const CheckboxDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // State for basic checkbox examples
  const [basicChecked, setBasicChecked] = useState(false);
  const [withLabelChecked, setWithLabelChecked] = useState(false);
  const [withHelperChecked, setWithHelperChecked] = useState(false);
  const [disabledChecked, setDisabledChecked] = useState(true);
  const [errorChecked, setErrorChecked] = useState(false);

  // State for indeterminate example
  const [parent, setParent] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [child1, setChild1] = useState(true);
  const [child2, setChild2] = useState(false);
  const [child3, setChild3] = useState(true);

  // Update parent state based on children
  useEffect(() => {
    const allChecked = child1 && child2 && child3;
    const someChecked = child1 || child2 || child3;

    setParent(allChecked);
    setIndeterminate(someChecked && !allChecked);
  }, [child1, child2, child3]);

  // Handle parent checkbox change
  const handleParentChange = (checked: boolean) => {
    setParent(checked);
    setChild1(checked);
    setChild2(checked);
    setChild3(checked);
    setIndeterminate(false);
  };

  // State for color examples
  const [primaryChecked, setPrimaryChecked] = useState(true);
  const [secondaryChecked, setSecondaryChecked] = useState(true);
  const [successChecked, setSuccessChecked] = useState(true);
  const [errorColorChecked, setErrorColorChecked] = useState(true);
  const [warningChecked, setWarningChecked] = useState(true);
  const [infoChecked, setInfoChecked] = useState(true);

  // State for size examples
  const [smallChecked, setSmallChecked] = useState(true);
  const [mediumChecked, setMediumChecked] = useState(true);
  const [largeChecked, setLargeChecked] = useState(true);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoTitle $themeStyles={themeStyles}>Checkbox Component Demo</DemoTitle>

      {/* Basic Examples */}
      <StyledCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Basic Checkboxes</h2>
        </CardHeader>
        <CardContent>
          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Simple checkbox without label</SectionTitle>
            <Checkbox checked={basicChecked} onChange={checked => setBasicChecked(checked)} />
          </Section>

          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>With label</SectionTitle>
            <Checkbox
              label="Accept terms and conditions"
              checked={withLabelChecked}
              onChange={checked => setWithLabelChecked(checked)}
            />
          </Section>

          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>With helper text</SectionTitle>
            <Checkbox
              label="Send me email updates"
              helperText="We'll only send important updates"
              checked={withHelperChecked}
              onChange={checked => setWithHelperChecked(checked)}
            />
          </Section>

          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Disabled state</SectionTitle>
            <Checkbox
              label="Disabled checkbox (checked)"
              checked={disabledChecked}
              onChange={checked => setDisabledChecked(checked)}
              disabled
            />
            <CheckboxSpacing $themeStyles={themeStyles}>
              <Checkbox label="Disabled checkbox (unchecked)" disabled />
            </CheckboxSpacing>
          </Section>

          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Error state</SectionTitle>
            <Checkbox
              label="Required checkbox"
              error={!errorChecked}
              helperText={!errorChecked ? 'This field is required' : ''}
              checked={errorChecked}
              onChange={checked => setErrorChecked(checked)}
            />
          </Section>
        </CardContent>
      </StyledCard>

      {/* Indeterminate State */}
      <StyledCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Indeterminate State</h2>
        </CardHeader>
        <CardContent>
          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Parent-Child Relationship</SectionTitle>
            <CheckboxGroup $themeStyles={themeStyles}>
              <Checkbox
                label="Select All"
                checked={parent}
                indeterminate={indeterminate}
                onChange={handleParentChange}
              />
              <IndentedGroup $themeStyles={themeStyles}>
                <Checkbox
                  label="Option 1"
                  checked={child1}
                  onChange={checked => setChild1(checked)}
                />
                <CheckboxSpacing $themeStyles={themeStyles}>
                  <Checkbox
                    label="Option 2"
                    checked={child2}
                    onChange={checked => setChild2(checked)}
                  />
                </CheckboxSpacing>
                <CheckboxSpacing $themeStyles={themeStyles}>
                  <Checkbox
                    label="Option 3"
                    checked={child3}
                    onChange={checked => setChild3(checked)}
                  />
                </CheckboxSpacing>
              </IndentedGroup>
            </CheckboxGroup>
          </Section>
        </CardContent>
      </StyledCard>

      {/* Color Variations */}
      <StyledCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Color Variations</h2>
        </CardHeader>
        <CardContent>
          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Different Colors</SectionTitle>
            <CheckboxGroup $themeStyles={themeStyles}>
              <Checkbox
                label="Primary color"
                color="primary"
                checked={primaryChecked}
                onChange={checked => setPrimaryChecked(checked)}
              />
              <Checkbox
                label="Secondary color"
                color="secondary"
                checked={secondaryChecked}
                onChange={checked => setSecondaryChecked(checked)}
              />
              <Checkbox
                label="Success color"
                color="success"
                checked={successChecked}
                onChange={checked => setSuccessChecked(checked)}
              />
              <Checkbox
                label="Error color"
                color="error"
                checked={errorColorChecked}
                onChange={checked => setErrorColorChecked(checked)}
              />
              <Checkbox
                label="Warning color"
                color="warning"
                checked={warningChecked}
                onChange={checked => setWarningChecked(checked)}
              />
              <Checkbox
                label="Info color"
                color="info"
                checked={infoChecked}
                onChange={checked => setInfoChecked(checked)}
              />
            </CheckboxGroup>
          </Section>
        </CardContent>
      </StyledCard>

      {/* Size Variations */}
      <StyledCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Size Variations</h2>
        </CardHeader>
        <CardContent>
          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Different Sizes</SectionTitle>
            <CheckboxGroup $themeStyles={themeStyles}>
              <Checkbox
                label="Small size"
                size="small"
                checked={smallChecked}
                onChange={checked => setSmallChecked(checked)}
              />
              <Checkbox
                label="Medium size (default)"
                size="medium"
                checked={mediumChecked}
                onChange={checked => setMediumChecked(checked)}
              />
              <Checkbox
                label="Large size"
                size="large"
                checked={largeChecked}
                onChange={checked => setLargeChecked(checked)}
              />
            </CheckboxGroup>
          </Section>
        </CardContent>
      </StyledCard>

      {/* Form Integration */}
      <StyledCard variant="elevation" $themeStyles={themeStyles}>
        <CardHeader>
          <h2>Form Integration Example</h2>
        </CardHeader>
        <CardContent>
          <Section $themeStyles={themeStyles}>
            <SectionTitle $themeStyles={themeStyles}>Form with checkboxes</SectionTitle>
            <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '4px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Newsletter Preferences</h3>
              <CheckboxGroup $themeStyles={themeStyles}>
                <Checkbox label="Weekly newsletter" />
                <Checkbox label="Product updates" />
                <Checkbox label="Marketing emails" />
                <Checkbox label="Partner offers" />
              </CheckboxGroup>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </Section>
        </CardContent>
      </StyledCard>
    </DemoContainer>
  );
};

export default CheckboxDemo;
