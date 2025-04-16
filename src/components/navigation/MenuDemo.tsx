import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Menu, MenuItem } from './Menu';

// Styled components for the demo
const DemoContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const DemoSection = styled.section`
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  background-color: white;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #323338;
`;

const Description = styled.p`
  margin-bottom: 20px;
  color: #676879;
`;

const ExampleContainer = styled.div`
  margin-bottom: 24px;
`;

const ExampleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #323338;
`;

const CodeBlock = styled.pre`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  overflow-x: auto;
  color: #1f2937;
`;

const ResultDisplay = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 4px;
  border: 1px dashed #ddd;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
`;

const Column = styled.div`
  flex: 1;
  min-width: 280px;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

// Icons for menu items
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
  </svg>
);

const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"></path>
  </svg>
);

/**
 * Demo component for the Menu
 */
const MenuDemo: React.FC = () => {
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
    { id: 'dashboard', label: 'Dashboard', onClick: () => console.log('Dashboard clicked') },
    { id: 'projects', label: 'Projects', onClick: () => console.log('Projects clicked') },
    { id: 'tasks', label: 'Tasks', onClick: () => console.log('Tasks clicked') },
    { id: 'calendar', label: 'Calendar', onClick: () => console.log('Calendar clicked') },
  ];
  
  // Nested menu items
  const nestedMenuItems: MenuItem[] = [
    { id: 'file', label: 'File', subItems: [
      { id: 'new', label: 'New', subItems: [
        { id: 'document', label: 'Document', onClick: () => console.log('New Document clicked') },
        { id: 'spreadsheet', label: 'Spreadsheet', onClick: () => console.log('New Spreadsheet clicked') },
        { id: 'presentation', label: 'Presentation', onClick: () => console.log('New Presentation clicked') },
      ]},
      { id: 'open', label: 'Open', onClick: () => console.log('Open clicked') },
      { id: 'save', label: 'Save', onClick: () => console.log('Save clicked') },
      { id: 'divider1', label: '-', disabled: true },
      { id: 'print', label: 'Print', onClick: () => console.log('Print clicked') },
      { id: 'export', label: 'Export', onClick: () => console.log('Export clicked') },
    ]},
    { id: 'edit', label: 'Edit', subItems: [
      { id: 'undo', label: 'Undo', onClick: () => console.log('Undo clicked') },
      { id: 'redo', label: 'Redo', onClick: () => console.log('Redo clicked') },
      { id: 'divider2', label: '-', disabled: true },
      { id: 'cut', label: 'Cut', onClick: () => console.log('Cut clicked') },
      { id: 'copy', label: 'Copy', onClick: () => console.log('Copy clicked') },
      { id: 'paste', label: 'Paste', onClick: () => console.log('Paste clicked') },
    ]},
    { id: 'view', label: 'View', subItems: [
      { id: 'zoom_in', label: 'Zoom In', onClick: () => console.log('Zoom In clicked') },
      { id: 'zoom_out', label: 'Zoom Out', onClick: () => console.log('Zoom Out clicked') },
      { id: 'fullscreen', label: 'Fullscreen', onClick: () => console.log('Fullscreen clicked') },
    ]},
    { id: 'help', label: 'Help', subItems: [
      { id: 'documentation', label: 'Documentation', onClick: () => console.log('Documentation clicked') },
      { id: 'about', label: 'About', onClick: () => console.log('About clicked') },
    ]},
  ];
  
  // Dropdown menu items
  const dropdownMenuItems: MenuItem[] = [
    { id: 'profile', label: 'View Profile', icon: <UserIcon />, onClick: () => console.log('Profile clicked') },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, onClick: () => console.log('Settings clicked') },
    { id: 'divider', label: '-', disabled: true },
    { id: 'help', label: 'Help Center', icon: <HelpIcon />, onClick: () => console.log('Help clicked') },
    { id: 'logout', label: 'Logout', onClick: () => console.log('Logout clicked') },
  ];
  
  // Handle menu click
  const handleItemClick = (itemId: string) => {
    console.log(`Menu item ${itemId} clicked`);
  };

  return (
    <DemoContainer>
      <h1>Menu Component Demo</h1>
      <p>This demo showcases the various configurations and capabilities of the Menu component.</p>

      <DemoSection>
        <Title>Basic Menus</Title>
        <Description>
          Basic vertical and horizontal menus for navigation.
        </Description>
        
        <Row>
          <Column>
            <ExampleTitle>Vertical Menu</ExampleTitle>
            <CodeBlock>{`<Menu
  items={verticalMenuItems}
  variant="vertical"
  showIcons={true}
/>`}</CodeBlock>
            
            <Menu
              items={verticalMenuItems}
              variant="vertical"
              showIcons={true}
              bordered={true}
            />
          </Column>
          
          <Column>
            <ExampleTitle>Horizontal Menu</ExampleTitle>
            <CodeBlock>{`<Menu
  items={horizontalMenuItems}
  variant="horizontal"
  bordered={true}
/>`}</CodeBlock>
            
            <Menu
              items={horizontalMenuItems}
              variant="horizontal"
              bordered={true}
            />
          </Column>
        </Row>
      </DemoSection>

      <DemoSection>
        <Title>Menu Variations</Title>
        <Description>
          Different variations and styles of menus.
        </Description>
        
        <Row>
          <Column>
            <ExampleTitle>With Dividers</ExampleTitle>
            <CodeBlock>{`<Menu
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
          
          <Column>
            <ExampleTitle>Compact Size</ExampleTitle>
            <CodeBlock>{`<Menu
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
        
        <Row>
          <Column>
            <ExampleTitle>Without Icons</ExampleTitle>
            <CodeBlock>{`<Menu
  items={verticalMenuItems}
  variant="vertical"
  showIcons={false}
/>`}</CodeBlock>
            
            <Menu
              items={verticalMenuItems}
              variant="vertical"
              showIcons={false}
              bordered={true}
            />
          </Column>
          
          <Column>
            <ExampleTitle>Large Size</ExampleTitle>
            <CodeBlock>{`<Menu
  items={horizontalMenuItems}
  variant="horizontal"
  size="large"
/>`}</CodeBlock>
            
            <Menu
              items={horizontalMenuItems}
              variant="horizontal"
              size="large"
              bordered={true}
            />
          </Column>
        </Row>
      </DemoSection>

      <DemoSection>
        <Title>Nested Menus</Title>
        <Description>
          Menus with dropdowns and nested submenus.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Horizontal Menu with Dropdowns</ExampleTitle>
          <CodeBlock>{`<Menu
  items={nestedMenuItems}
  variant="horizontal"
  bordered={true}
/>`}</CodeBlock>
          
          <Menu
            items={nestedMenuItems}
            variant="horizontal"
            bordered={true}
          />
          
          <ResultDisplay>
            Hover over menu items to see dropdown submenus. Try clicking on items to see console output.
          </ResultDisplay>
        </ExampleContainer>
      </DemoSection>

      <DemoSection>
        <Title>Dropdown Menu</Title>
        <Description>
          A standalone dropdown menu triggered by a button.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>User Dropdown</ExampleTitle>
          <CodeBlock>{`// State to control dropdown visibility
const [isOpen, setIsOpen] = useState(false);

<DropdownContainer>
  <DropdownButton onClick={() => setIsOpen(!isOpen)}>
    User Menu ▾
  </DropdownButton>
  
  <Menu
    items={dropdownMenuItems}
    variant="dropdown"
    isOpen={isOpen}
    onOpenChange={setIsOpen}
    showIcons={true}
    closeOnClick={true}
  />
</DropdownContainer>`}</CodeBlock>
          
          <DropdownContainer>
            <DropdownButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              User Menu {isDropdownOpen ? '▴' : '▾'}
            </DropdownButton>
            
            <Menu
              items={dropdownMenuItems}
              variant="dropdown"
              isOpen={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
              showIcons={true}
              closeOnClick={true}
            />
          </DropdownContainer>
          
          <ResultDisplay>
            Click the button above to toggle the dropdown menu.
          </ResultDisplay>
        </ExampleContainer>
      </DemoSection>
    </DemoContainer>
  );
};

export { MenuDemo }; 