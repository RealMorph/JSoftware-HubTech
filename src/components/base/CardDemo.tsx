import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define a theme styles interface to maintain consistency
interface ThemeStyles {
  spacing: {
    section: string;
    gap: string;
    contentPadding: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
      marginBottom: string;
    };
    sectionTitle: {
      fontSize: string;
      fontWeight: string;
      marginBottom: string;
    };
    cardHeader: {
      fontWeight: string;
    };
  };
}

// Theme-based styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.section};
`;

const DemoTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const DemoSectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.sectionTitle.fontSize};
  font-weight: ${props => props.$themeStyles.typography.sectionTitle.fontWeight};
  margin-bottom: ${props => props.$themeStyles.typography.sectionTitle.marginBottom};
`;

const DemoRow = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacing.gap};
  margin-bottom: ${props => props.$themeStyles.spacing.gap};
`;

const CardTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  font-weight: ${props => props.$themeStyles.typography.cardHeader.fontWeight};
`;

// Create theme styles based on DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getSpacing, getTypography } = themeContext;

  return {
    spacing: {
      section: getSpacing('8', '24px'),
      gap: getSpacing('4', '16px'),
      contentPadding: getSpacing('4', '16px'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.xl', '24px') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
        marginBottom: getSpacing('8', '24px'),
      },
      sectionTitle: {
        fontSize: getTypography('fontSize.lg', '18px') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
        marginBottom: getSpacing('4', '16px'),
      },
      cardHeader: {
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
    },
  };
}

export const CardDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  const cardContentStyle: React.CSSProperties = {
    padding: themeStyles.spacing.contentPadding,
    minHeight: '80px',
  };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoTitle $themeStyles={themeStyles}>Card Component Demo</DemoTitle>

      {/* Card Variants */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoSectionTitle $themeStyles={themeStyles}>Card Variants</DemoSectionTitle>
        <DemoRow $themeStyles={themeStyles}>
          <Card variant="elevation" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Elevation</CardTitle>
              <p>Card with shadow elevation</p>
            </CardContent>
          </Card>

          <Card variant="outlined" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Outlined</CardTitle>
              <p>Card with outline border</p>
            </CardContent>
          </Card>

          <Card variant="flat" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Flat</CardTitle>
              <p>Card without shadow or border</p>
            </CardContent>
          </Card>
        </DemoRow>
      </DemoSection>

      {/* Padding Options */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoSectionTitle $themeStyles={themeStyles}>Padding Options</DemoSectionTitle>
        <DemoRow $themeStyles={themeStyles}>
          <Card padding="small" style={{ width: '200px' }}>
            <CardContent>
              <CardTitle $themeStyles={themeStyles}>Small Padding</CardTitle>
              <p>Card with small padding</p>
            </CardContent>
          </Card>

          <Card padding="medium" style={{ width: '200px' }}>
            <CardContent>
              <CardTitle $themeStyles={themeStyles}>Medium Padding</CardTitle>
              <p>Card with medium padding</p>
            </CardContent>
          </Card>

          <Card padding="large" style={{ width: '200px' }}>
            <CardContent>
              <CardTitle $themeStyles={themeStyles}>Large Padding</CardTitle>
              <p>Card with large padding</p>
            </CardContent>
          </Card>
        </DemoRow>
      </DemoSection>

      {/* Interactive Card */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoSectionTitle $themeStyles={themeStyles}>Interactive Card</DemoSectionTitle>
        <DemoRow $themeStyles={themeStyles}>
          <Card interactive style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Interactive</CardTitle>
              <p>Hover over me!</p>
            </CardContent>
          </Card>

          <Card variant="outlined" interactive style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Interactive Outlined</CardTitle>
              <p>Hover over me!</p>
            </CardContent>
          </Card>
        </DemoRow>
      </DemoSection>

      {/* Full Width Card */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoSectionTitle $themeStyles={themeStyles}>Full Width Card</DemoSectionTitle>
        <Card fullWidth>
          <CardContent style={cardContentStyle}>
            <CardTitle $themeStyles={themeStyles}>Full Width</CardTitle>
            <p>This card takes up the full width of its container</p>
          </CardContent>
        </Card>
      </DemoSection>

      {/* Card with Header and Footer */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoSectionTitle $themeStyles={themeStyles}>Card with Header and Footer</DemoSectionTitle>
        <DemoRow $themeStyles={themeStyles}>
          <Card style={{ width: '300px' }}>
            <CardHeader>
              <CardTitle $themeStyles={themeStyles}>Card Title</CardTitle>
            </CardHeader>
            <CardContent style={cardContentStyle}>
              <p>This card has a header and footer</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="outlined" style={{ width: '300px' }}>
            <CardHeader>
              <CardTitle $themeStyles={themeStyles}>Outlined Card</CardTitle>
            </CardHeader>
            <CardContent style={cardContentStyle}>
              <p>This outlined card has a header and footer</p>
            </CardContent>
            <CardFooter>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: themeStyles.spacing.gap,
                }}
              >
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button variant="primary" size="sm">
                  Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        </DemoRow>
      </DemoSection>

      {/* Custom Color Card */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoSectionTitle $themeStyles={themeStyles}>Custom Color Card</DemoSectionTitle>
        <DemoRow $themeStyles={themeStyles}>
          <Card bgColor="primary.50" borderColor="primary.200" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Primary Theme</CardTitle>
              <p>Card with primary theme colors</p>
            </CardContent>
          </Card>

          <Card bgColor="gray.50" borderColor="gray.300" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Gray Theme</CardTitle>
              <p>Card with gray theme colors</p>
            </CardContent>
          </Card>

          <Card bgColor="#f0fdf4" borderColor="#86efac" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <CardTitle $themeStyles={themeStyles}>Custom Color</CardTitle>
              <p>Card with custom color values</p>
            </CardContent>
          </Card>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
};
