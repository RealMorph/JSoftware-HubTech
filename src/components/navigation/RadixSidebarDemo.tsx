import React, { useState } from 'react';
import styled from '@emotion/styled';
import { RadixSidebar, SidebarMenuItem } from './RadixSidebar';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Simple icon components for demo
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 4L21 9.5V20H15V14H9V20H3V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3738 17.7642 20.3738 18.295C20.3738 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2938 18.375 20.2938C17.8442 20.2938 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4801 19.5793 14.0826 20.1434 14.08 20.77V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0677 20.2603 9.65074 19.6889 9.03 19.44C8.41289 19.1677 7.69219 19.2983 7.21 19.77L7.15 19.83C6.77487 20.2056 6.26578 20.4138 5.735 20.4138C5.20422 20.4138 4.69513 20.2056 4.32 19.83C3.94437 19.4549 3.73615 18.9458 3.73615 18.415C3.73615 17.8842 3.94437 17.3751 4.32 17L4.38 16.94C4.85167 16.4578 4.98226 15.7371 4.71 15.12C4.45069 14.5201 3.88655 14.1226 3.26 14.12H3C2.46957 14.12 1.96086 13.9093 1.58579 13.5342C1.21071 13.1591 1 12.6504 1 12.12C1 11.5896 1.21071 11.0809 1.58579 10.7058C1.96086 10.3307 2.46957 10.12 3 10.12H3.09C3.73967 10.1077 4.31114 9.69074 4.56 9.07C4.83226 8.45289 4.70167 7.73219 4.23 7.25L4.17 7.19C3.79437 6.81487 3.58615 6.30578 3.58615 5.775C3.58615 5.24422 3.79437 4.73513 4.17 4.36C4.54513 3.98437 5.05422 3.77615 5.585 3.77615C6.11578 3.77615 6.62487 3.98437 7 4.36L7.06 4.42C7.54219 4.89167 8.26289 5.02226 8.88 4.75H9C9.59994 4.49069 9.99744 3.92655 10 3.3V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0026 3.71655 14.4001 4.28069 15 4.54C15.6171 4.81226 16.3378 4.68167 16.82 4.21L16.88 4.15C17.2551 3.77437 17.7642 3.56615 18.295 3.56615C18.8258 3.56615 19.3349 3.77437 19.71 4.15C20.0856 4.52513 20.2938 5.03422 20.2938 5.565C20.2938 6.09578 20.0856 6.60487 19.71 6.98L19.65 7.04C19.1783 7.52219 19.0477 8.24289 19.32 8.86V9C19.5793 9.59994 20.1434 9.99744 20.77 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.2834 14.0026 19.7193 14.4001 19.46 15L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 9H22V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 9V7C22 6.46957 21.7893 5.96086 21.4142 5.58579C21.0391 5.21071 20.5304 5 20 5H4C3.46957 5 2.96086 5.21071 2.58579 5.58579C2.21071 5.96086 2 6.46957 2 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  padding: 1rem;
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const DemoTitle = styled.h2`
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const DemoContent = styled.div`
  display: flex;
  min-height: 400px;
  position: relative;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const Controls = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

// Demo sidebar items
const demoItems: SidebarMenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon />,
    href: '#'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <ChartIcon />,
    href: '#',
    active: true
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <ProjectsIcon />,
    items: [
      {
        id: 'active-projects',
        label: 'Active Projects',
        href: '#'
      },
      {
        id: 'archived-projects',
        label: 'Archived Projects',
        href: '#'
      },
      {
        id: 'create-project',
        label: 'Create New Project',
        href: '#'
      }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    icon: <UsersIcon />,
    items: [
      {
        id: 'team-members',
        label: 'Team Members',
        href: '#'
      },
      {
        id: 'invitations',
        label: 'Invitations',
        href: '#',
        disabled: true
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '#'
  }
];

export const RadixSidebarDemo: React.FC = () => {
  const theme = useDirectTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  return (
    <DemoContainer>
      <DemoSection>
        <DemoTitle>Radix UI Sidebar - Desktop</DemoTitle>
        <DemoContent>
          <RadixSidebar
            items={demoItems}
            title="Admin Dashboard"
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            footer={
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {!collapsed && 'User: John Doe'}
              </div>
            }
          />
          <MainContent>
            <h3>Main Content Area</h3>
            <p>This area would contain your application's main content.</p>
            <Controls>
              <ControlButton onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              </ControlButton>
            </Controls>
          </MainContent>
        </DemoContent>
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Radix UI Sidebar - Mobile</DemoTitle>
        <DemoContent>
          <MainContent>
            <h3>Mobile Responsive Sidebar Demo</h3>
            <p>This demo shows how the sidebar works in mobile view. The sidebar starts hidden and slides in when toggled.</p>
            <Controls>
              <ControlButton onClick={() => setMobileExpanded(!mobileExpanded)}>
                {mobileExpanded ? 'Close Mobile Sidebar' : 'Open Mobile Sidebar'}
              </ControlButton>
            </Controls>
          </MainContent>
          <RadixSidebar
            items={demoItems}
            title="Mobile Dashboard"
            mobileExpanded={mobileExpanded}
            onMobileExpandedChange={setMobileExpanded}
            footer={
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Version 1.0.0
              </div>
            }
          />
        </DemoContent>
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Sidebar Implementation Notes</DemoTitle>
        <div style={{ padding: '1rem' }}>
          <h4>Features</h4>
          <ul>
            <li>Built with Radix UI Navigation Menu and Collapsible components</li>
            <li>Supports nested menu items with animations</li>
            <li>Responsive design with mobile drawer variant</li>
            <li>Collapsible mode for desktop view</li>
            <li>Keyboard navigation and ARIA support for accessibility</li>
            <li>Integrates with the DirectTheme system</li>
            <li>Support for icons, active states, and disabled items</li>
          </ul>
          
          <h4>Usage</h4>
          <p>The sidebar can be controlled externally through props:</p>
          <ul>
            <li><code>collapsed</code>: Controls collapsed state on desktop</li>
            <li><code>mobileExpanded</code>: Controls expanded state on mobile</li>
            <li><code>items</code>: Define navigation structure with nested items</li>
            <li><code>title</code> & <code>footer</code>: Optional content for the top and bottom</li>
          </ul>
        </div>
      </DemoSection>
    </DemoContainer>
  );
}; 