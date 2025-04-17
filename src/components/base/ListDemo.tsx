import React from 'react';
import { List, ListItem } from './List';
import { Button } from './Button';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme styles interface
interface ThemeStyles {
  // Colors
  textPrimary: string;
  textSecondary: string;
  backgroundColor: string;
  backgroundHover: string;
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
  borderColor: string;
}

// Create theme styles from DirectTheme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  const { getColor, getTypography, getSpacing, getBorderRadius } = themeContext;

  return {
    // Colors with fallbacks
    textPrimary: getColor('text.primary', '#333333'),
    textSecondary: getColor('text.secondary', '#666666'),
    backgroundColor: getColor('background', '#ffffff'),
    backgroundHover: getColor('background.hover', '#f5f5f5'),
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
    borderColor: getColor('border', '#e2e8f0'),
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

const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacingXl};
`;

const DemoTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeMd};
  font-weight: ${props => props.$themeStyles.fontWeightBold};
  margin-bottom: ${props => props.$themeStyles.spacingMd};
`;

const DemoSubtitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeMd};
  margin-bottom: ${props => props.$themeStyles.spacingSm};
`;

const DemoRow = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacingMd};
  margin-bottom: ${props => props.$themeStyles.spacingMd};
`;

const DemoCell = styled.div<{ $width?: string; $themeStyles: ThemeStyles }>`
  width: ${props => props.$width || '250px'};
`;

const ComplexItemTitle = styled.div<{ $themeStyles: ThemeStyles }>`
  font-weight: ${props => props.$themeStyles.fontWeightBold};
`;

const ComplexItemSubtitle = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeSm};
  color: ${props => props.$themeStyles.textSecondary};
`;

/**
 * Demo component showcasing different configurations of the List component
 */
export const ListDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Icons (using simple spans for demonstration)
  const UserIcon = <span style={{ fontSize: '16px' }}>👤</span>;
  const SettingsIcon = <span style={{ fontSize: '16px' }}>⚙️</span>;
  const InfoIcon = <span style={{ fontSize: '16px' }}>ℹ️</span>;
  const StarIcon = <span style={{ fontSize: '16px' }}>⭐</span>;

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <PageTitle $themeStyles={themeStyles}>List Component Demo</PageTitle>

      {/* List Variants */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>List Variants</DemoTitle>
        <DemoRow $themeStyles={themeStyles}>
          <DemoCell $themeStyles={themeStyles}>
            <DemoSubtitle $themeStyles={themeStyles}>Default</DemoSubtitle>
            <List>
              <ListItem>Item 1</ListItem>
              <ListItem>Item 2</ListItem>
              <ListItem>Item 3</ListItem>
            </List>
          </DemoCell>

          <DemoCell $themeStyles={themeStyles}>
            <DemoSubtitle $themeStyles={themeStyles}>Bordered</DemoSubtitle>
            <List variant="bordered">
              <ListItem>Item 1</ListItem>
              <ListItem>Item 2</ListItem>
              <ListItem>Item 3</ListItem>
            </List>
          </DemoCell>

          <DemoCell $themeStyles={themeStyles}>
            <DemoSubtitle $themeStyles={themeStyles}>Divided</DemoSubtitle>
            <List variant="divided">
              <ListItem>Item 1</ListItem>
              <ListItem>Item 2</ListItem>
              <ListItem>Item 3</ListItem>
            </List>
          </DemoCell>
        </DemoRow>
      </DemoSection>

      {/* List Sizes */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>List Sizes</DemoTitle>
        <DemoRow $themeStyles={themeStyles}>
          <DemoCell $themeStyles={themeStyles}>
            <DemoSubtitle $themeStyles={themeStyles}>Small</DemoSubtitle>
            <List variant="bordered" size="small">
              <ListItem>Small item 1</ListItem>
              <ListItem>Small item 2</ListItem>
              <ListItem>Small item 3</ListItem>
            </List>
          </DemoCell>

          <DemoCell $themeStyles={themeStyles}>
            <DemoSubtitle $themeStyles={themeStyles}>Medium (Default)</DemoSubtitle>
            <List variant="bordered" size="medium">
              <ListItem>Medium item 1</ListItem>
              <ListItem>Medium item 2</ListItem>
              <ListItem>Medium item 3</ListItem>
            </List>
          </DemoCell>

          <DemoCell $themeStyles={themeStyles}>
            <DemoSubtitle $themeStyles={themeStyles}>Large</DemoSubtitle>
            <List variant="bordered" size="large">
              <ListItem>Large item 1</ListItem>
              <ListItem>Large item 2</ListItem>
              <ListItem>Large item 3</ListItem>
            </List>
          </DemoCell>
        </DemoRow>
      </DemoSection>

      {/* Interactive List */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Interactive List</DemoTitle>
        <DemoRow $themeStyles={themeStyles}>
          <DemoCell $width="300px" $themeStyles={themeStyles}>
            <List variant="bordered" interactive>
              <ListItem>Clickable item 1</ListItem>
              <ListItem selected>Selected item</ListItem>
              <ListItem disabled>Disabled item</ListItem>
              <ListItem>Clickable item 4</ListItem>
            </List>
          </DemoCell>
        </DemoRow>
      </DemoSection>

      {/* List with Icons */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>List with Start Content</DemoTitle>
        <DemoRow $themeStyles={themeStyles}>
          <DemoCell $width="300px" $themeStyles={themeStyles}>
            <List variant="divided">
              <ListItem startContent={UserIcon}>Profile</ListItem>
              <ListItem startContent={SettingsIcon}>Settings</ListItem>
              <ListItem startContent={InfoIcon}>Help & Support</ListItem>
            </List>
          </DemoCell>
        </DemoRow>
      </DemoSection>

      {/* List with Actions */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>List with End Content</DemoTitle>
        <DemoRow $themeStyles={themeStyles}>
          <DemoCell $width="350px" $themeStyles={themeStyles}>
            <List variant="divided">
              <ListItem
                endContent={
                  <Button variant="primary" size="sm">
                    View
                  </Button>
                }
              >
                Item with action
              </ListItem>
              <ListItem
                endContent={
                  <Button variant="primary" size="sm">
                    Download
                  </Button>
                }
              >
                Another item with action
              </ListItem>
              <ListItem endContent={StarIcon}>Item with icon</ListItem>
            </List>
          </DemoCell>
        </DemoRow>
      </DemoSection>

      {/* Complex List Item */}
      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Complex List Items</DemoTitle>
        <DemoRow $themeStyles={themeStyles}>
          <DemoCell $width="400px" $themeStyles={themeStyles}>
            <List variant="divided">
              <ListItem
                startContent={UserIcon}
                endContent={
                  <Button variant="primary" size="sm">
                    Follow
                  </Button>
                }
              >
                <div>
                  <ComplexItemTitle $themeStyles={themeStyles}>John Doe</ComplexItemTitle>
                  <ComplexItemSubtitle $themeStyles={themeStyles}>
                    Software Engineer
                  </ComplexItemSubtitle>
                </div>
              </ListItem>
              <ListItem
                startContent={UserIcon}
                endContent={
                  <Button variant="primary" size="sm">
                    Follow
                  </Button>
                }
                selected
              >
                <div>
                  <ComplexItemTitle $themeStyles={themeStyles}>Jane Smith</ComplexItemTitle>
                  <ComplexItemSubtitle $themeStyles={themeStyles}>
                    Product Designer
                  </ComplexItemSubtitle>
                </div>
              </ListItem>
              <ListItem
                startContent={UserIcon}
                endContent={
                  <Button variant="primary" size="sm">
                    Follow
                  </Button>
                }
                disabled
              >
                <div>
                  <ComplexItemTitle $themeStyles={themeStyles}>Bob Johnson</ComplexItemTitle>
                  <ComplexItemSubtitle $themeStyles={themeStyles}>
                    Marketing Manager
                  </ComplexItemSubtitle>
                </div>
              </ListItem>
            </List>
          </DemoCell>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
};
