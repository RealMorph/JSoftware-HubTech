import React from 'react';
import BreadcrumbsWithTabs, { TabManagerProvider } from '../components/navigation/BreadcrumbsWithTabs';
import { useBreadcrumbNavigation } from '../core/hooks/useBreadcrumbNavigation';
import { TabManager } from '../core/tabs/TabManager';
import styled from 'styled-components';

// Styled container for the example
const ExampleContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ExampleHeader = styled.h2`
  margin-bottom: 1.5rem;
  color: #333333;
`;

const ExampleSection = styled.section`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 0.375rem;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ExampleDescription = styled.p`
  margin-bottom: 1.5rem;
  color: #666666;
  font-size: 0.875rem;
`;

// Tab breadcrumb example component
export const TabBreadcrumbExample: React.FC = () => {
  // Initialize services
  const tabManager = React.useMemo(() => 
    new TabManager(), []);
  
  // Custom breadcrumb items
  const basicBreadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Electronics', path: '/products/electronics' },
    { label: 'Smartphones', path: '/products/electronics/smartphones', active: true },
  ];
  
  // Tab-enabled breadcrumbs
  const tabBreadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products', openInTab: true },
    { label: 'Electronics', path: '/products/electronics', openInTab: true },
    { label: 'Smartphones', path: '/products/electronics/smartphones', active: true },
  ];
  
  // Use the custom hook for navigation
  const { 
    breadcrumbs,
    navigateTo,
    getBreadcrumbsWithTabSupport
  } = useBreadcrumbNavigation({
    generateBreadcrumbs: false,
    homeLabel: 'Dashboard',
    homePath: '/dashboard'
  });
  
  // Handle navigation
  const handleNavigate = (path: string, openInTab: boolean) => {
    console.log(`Navigating to ${path}${openInTab ? ' in new tab' : ''}`);
    // In a real application, this would use the router's navigation
  };
  
  return (
    <TabManagerProvider tabManager={tabManager}>
      <ExampleContainer>
        <ExampleHeader>Breadcrumb Integration Examples</ExampleHeader>
        
        <ExampleSection>
          <h3>Basic Breadcrumbs</h3>
          <ExampleDescription>
            Standard breadcrumb navigation without tab integration
          </ExampleDescription>
          <BreadcrumbsWithTabs
            tabManager={tabManager}
            items={basicBreadcrumbs}
            onNavigate={handleNavigate}
          />
        </ExampleSection>
        
        <ExampleSection>
          <h3>Tab-Enabled Breadcrumbs</h3>
          <ExampleDescription>
            Breadcrumbs with tab integration (Products and Electronics links open in tabs)
          </ExampleDescription>
          <BreadcrumbsWithTabs
            tabManager={tabManager}
            items={tabBreadcrumbs}
            onNavigate={handleNavigate}
          />
        </ExampleSection>
        
        <ExampleSection>
          <h3>DeepLinkRouter Integration</h3>
          <ExampleDescription>
            Example of how DeepLinkRouter would be integrated with breadcrumbs
          </ExampleDescription>
          <p>
            When using DeepLinkRouter, you can create links that open in tabs by adding
            the "openInTab=true" parameter to URLs. When a user clicks such a link, the
            DeepLinkRouter will intercept it and open the page in a new tab instead of 
            navigating directly.
          </p>
          <code>
            Example URL: /products/electronics?openInTab=true
          </code>
        </ExampleSection>
      </ExampleContainer>
    </TabManagerProvider>
  );
};

export default TabBreadcrumbExample; 