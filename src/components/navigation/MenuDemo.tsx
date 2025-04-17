import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Menu, MenuItem } from './Menu';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  textPrimary: string;
  textSecondary: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  borderColor: string;
  borderRadius: string;
  spacing: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getBorderRadius, getSpacing } = themeContext;

  return {
    textPrimary: getColor('text.primary', '#323338'),
    textSecondary: getColor('text.secondary', '#676879'),
    backgroundPrimary: getColor('background', '#ffffff'),
    backgroundSecondary: getColor('gray.50', '#f9fafb'),
    borderColor: getColor('border', '#e5e7eb'),
    borderRadius: getBorderRadius('md', '8px'),
    spacing: {
      sm: getSpacing('3', '12px'),
      md: getSpacing('6', '24px'),
      lg: getSpacing('8', '32px'),
      xl: getSpacing('12', '48px'),
    },
  };
}

// Styled components for the demo
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.md};
`;

const DemoSection = styled.section<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.lg};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  padding: ${props => props.$themeStyles.spacing.md};
  background-color: ${props => props.$themeStyles.backgroundPrimary};
`;

const Title = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: ${props => props.$themeStyles.spacing.sm};
  color: ${props => props.$themeStyles.textPrimary};
`;

const Description = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.md};
  color: ${props => props.$themeStyles.textSecondary};
`;

/* Unused styled components
const ExampleContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.md};
`;
*/

const ExampleTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${props => props.$themeStyles.spacing.sm};
  color: ${props => props.$themeStyles.textPrimary};
`;

const CodeBlock = styled.pre<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.backgroundSecondary};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  padding: ${props => props.$themeStyles.spacing.sm};
  margin: ${props => props.$themeStyles.spacing.sm} 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  overflow-x: auto;
  color: ${props => props.$themeStyles.textPrimary};
`;

/* Unused styled components
const ResultDisplay = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.sm};
  padding: ${props => props.$themeStyles.spacing.sm};
  background-color: ${props => props.$themeStyles.backgroundSecondary};
  border-radius: 4px;
  border: 1px dashed ${props => props.$themeStyles.borderColor};
`;
*/

const Row = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacing.md};
  margin-bottom: ${props => props.$themeStyles.spacing.md};
`;

const Column = styled.div<{ $themeStyles: ThemeStyles }>`
  flex: 1;
  min-width: 280px;
`;

const DropdownContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button<{ $themeStyles: ThemeStyles }>`
  padding: 8px 16px;
  background-color: ${props => props.$themeStyles.backgroundSecondary};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$themeStyles.textPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background-color: ${props => props.$themeStyles.borderColor};
  }
`;

// Icons for menu items
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
  </svg>
);

const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"></path>
  </svg>
);

/**
 * Demo component for the Menu
 */
const MenuDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // For dropdown example
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Basic vertical menu items
  const verticalMenuItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, selected: true },
    { id: 'profile', label: 'Profile', icon: <UserIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    { id: 'help', label: 'Help', icon: <HelpIcon /> },
  ];

  // Horizontal menu items
  const horizontalMenuItems: MenuItem[] = [
    // eslint-disable-next-line no-console
    { id: 'dashboard', label: 'Dashboard', onClick: () => console.log('Dashboard clicked') },
    // eslint-disable-next-line no-console
    { id: 'projects', label: 'Projects', onClick: () => console.log('Projects clicked') },
    // eslint-disable-next-line no-console
    { id: 'tasks', label: 'Tasks', onClick: () => console.log('Tasks clicked') },
    // eslint-disable-next-line no-console
    { id: 'calendar', label: 'Calendar', onClick: () => console.log('Calendar clicked') },
  ];

  // Nested menu items
  const nestedMenuItems: MenuItem[] = [
    {
      id: 'file',
      label: 'File',
      subItems: [
        {
          id: 'new',
          label: 'New',
          subItems: [
            {
              id: 'document',
              label: 'Document',
              onClick: () => console.log('New Document clicked'),
            },
            {
              id: 'spreadsheet',
              label: 'Spreadsheet',
              onClick: () => console.log('New Spreadsheet clicked'),
            },
            {
              id: 'presentation',
              label: 'Presentation',
              onClick: () => console.log('New Presentation clicked'),
            },
          ],
        },
        { id: 'open', label: 'Open', onClick: () => console.log('Open clicked') },
        { id: 'save', label: 'Save', onClick: () => console.log('Save clicked') },
        { id: 'divider1', label: '-', disabled: true },
        { id: 'print', label: 'Print', onClick: () => console.log('Print clicked') },
        { id: 'export', label: 'Export', onClick: () => console.log('Export clicked') },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      subItems: [
        { id: 'undo', label: 'Undo', onClick: () => console.log('Undo clicked') },
        { id: 'redo', label: 'Redo', onClick: () => console.log('Redo clicked') },
        { id: 'divider2', label: '-', disabled: true },
        { id: 'cut', label: 'Cut', onClick: () => console.log('Cut clicked') },
        { id: 'copy', label: 'Copy', onClick: () => console.log('Copy clicked') },
        { id: 'paste', label: 'Paste', onClick: () => console.log('Paste clicked') },
      ],
    },
    {
      id: 'view',
      label: 'View',
      subItems: [
        { id: 'zoom_in', label: 'Zoom In', onClick: () => console.log('Zoom In clicked') },
        { id: 'zoom_out', label: 'Zoom Out', onClick: () => console.log('Zoom Out clicked') },
        { id: 'fullscreen', label: 'Fullscreen', onClick: () => console.log('Fullscreen clicked') },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      subItems: [
        {
          id: 'documentation',
          label: 'Documentation',
          onClick: () => console.log('Documentation clicked'),
        },
        { id: 'about', label: 'About', onClick: () => console.log('About clicked') },
      ],
    },
  ];

  // Dropdown menu items
  const dropdownMenuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: <UserIcon />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => console.log('Settings clicked'),
    },
    { id: 'divider', label: '-', disabled: true },
    {
      id: 'help',
      label: 'Help Center',
      icon: <HelpIcon />,
      onClick: () => console.log('Help clicked'),
    },
    { id: 'logout', label: 'Logout', onClick: () => console.log('Logout clicked') },
  ];

  // Remove unused handleItemClick function or use it in the component
  // const handleItemClick = (itemId: string) => {
  //   console.log(`Item clicked: ${itemId}`);
  // };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <h1>Menu Component Demo</h1>
      <p>This demo showcases the various configurations and capabilities of the Menu component.</p>

      <DemoSection $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Basic Menus</Title>
        <Description $themeStyles={themeStyles}>
          Basic vertical and horizontal menus for navigation.
        </Description>

        <Row $themeStyles={themeStyles}>
          <Column $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Vertical Menu</ExampleTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<Menu
  items={verticalMenuItems}
  variant="vertical"
  showIcons={true}
/>`}</CodeBlock>

            <Menu items={verticalMenuItems} variant="vertical" showIcons={true} bordered={true} />
          </Column>

          <Column $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Horizontal Menu</ExampleTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<Menu
  items={horizontalMenuItems}
  variant="horizontal"
  bordered={true}
/>`}</CodeBlock>

            <Menu items={horizontalMenuItems} variant="horizontal" bordered={true} />
          </Column>
        </Row>
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Menu Variations</Title>
        <Description $themeStyles={themeStyles}>
          Different variations and styles of menus.
        </Description>

        <Row $themeStyles={themeStyles}>
          <Column $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>With Dividers</ExampleTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<Menu
  items={verticalMenuItems}
  variant="vertical"
  dividers={true}
  showIcons={true}
/>`}</CodeBlock>

            <Menu
              items={verticalMenuItems}
              variant="vertical"
              dividers={true}
              showIcons={true}
              bordered={true}
            />
          </Column>

          <Column $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Compact Size</ExampleTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<Menu
  items={verticalMenuItems}
  variant="vertical"
  size="small"
  compact={true}
  showIcons={true}
/>`}</CodeBlock>

            <Menu
              items={verticalMenuItems}
              variant="vertical"
              size="small"
              compact={true}
              showIcons={true}
              bordered={true}
            />
          </Column>
        </Row>

        <Row $themeStyles={themeStyles}>
          <Column $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Without Icons</ExampleTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<Menu
  items={verticalMenuItems}
  variant="vertical"
  showIcons={false}
/>`}</CodeBlock>

            <Menu items={verticalMenuItems} variant="vertical" showIcons={false} bordered={true} />
          </Column>

          <Column $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Large Size</ExampleTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<Menu
  items={horizontalMenuItems}
  variant="horizontal"
  size="large"
/>`}</CodeBlock>

            <Menu items={horizontalMenuItems} variant="horizontal" size="large" bordered={true} />
          </Column>
        </Row>
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Dropdown Menu</Title>
        <Description $themeStyles={themeStyles}>Menu displayed as a dropdown on click.</Description>

        <DropdownContainer $themeStyles={themeStyles}>
          <DropdownButton
            $themeStyles={themeStyles}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            User Menu
            <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
          </DropdownButton>

          {isDropdownOpen && (
            <div style={{ position: 'absolute', zIndex: 100, marginTop: '4px' }}>
              <Menu
                items={dropdownMenuItems}
                variant="dropdown"
                showIcons={true}
                closeOnClick={true}
                onOpenChange={isOpen => setIsDropdownOpen(isOpen)}
              />
            </div>
          )}
        </DropdownContainer>

        <CodeBlock $themeStyles={themeStyles}>{`// State for dropdown
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

// Toggle dropdown
<button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
  User Menu
</button>

// Show menu when open
{isDropdownOpen && (
  <Menu
    items={dropdownMenuItems}
    variant="dropdown"
    showIcons={true}
    closeOnClick={true}
  />
)}`}</CodeBlock>
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Nested Menus</Title>
        <Description $themeStyles={themeStyles}>
          Hierarchical menu structure with submenu items.
        </Description>

        <Menu items={nestedMenuItems} variant="horizontal" bordered={true} />

        <CodeBlock $themeStyles={themeStyles}>{`const nestedMenuItems = [
  { id: 'file', label: 'File', subItems: [
    { id: 'new', label: 'New', subItems: [
      { id: 'document', label: 'Document' },
      { id: 'spreadsheet', label: 'Spreadsheet' },
      ...
    ]},
    { id: 'open', label: 'Open' },
    ...
  ]},
  { id: 'edit', label: 'Edit', subItems: [...] },
  ...
];

<Menu
  items={nestedMenuItems}
  variant="horizontal"
  bordered={true}
/>`}</CodeBlock>
      </DemoSection>
    </DemoContainer>
  );
};

export default MenuDemo;
