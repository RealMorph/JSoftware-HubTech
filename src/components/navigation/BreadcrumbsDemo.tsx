import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

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

const HomeSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
  </svg>
);

/**
 * Demo component for the Breadcrumbs
 */
export const BreadcrumbsDemo: React.FC = () => {
  // Simple breadcrumbs example
  const simpleBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Laptops', path: '/products/laptops', active: true },
  ];

  // Breadcrumbs with icons
  const iconBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/', icon: <HomeSvg /> },
    { label: 'Users', path: '/users' },
    { label: 'User Profile', path: '/users/profile' },
    { label: 'Settings', path: '/users/profile/settings', active: true },
  ];

  // Long breadcrumbs that will be collapsed
  const longBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Electronics', path: '/products/electronics' },
    { label: 'Computers', path: '/products/electronics/computers' },
    { label: 'Laptops', path: '/products/electronics/computers/laptops' },
    { label: 'Gaming', path: '/products/electronics/computers/laptops/gaming' },
    { label: 'RTX Series', path: '/products/electronics/computers/laptops/gaming/rtx' },
    {
      label: 'RTX 4090',
      path: '/products/electronics/computers/laptops/gaming/rtx/4090',
      active: true,
    },
  ];

  // Custom separators
  const separators = ['/', '>', '|', '•', '→'];
  const [currentSeparator, setCurrentSeparator] = useState(0);

  const handleChangeSeparator = () => {
    setCurrentSeparator(prev => (prev + 1) % separators.length);
  };

  return (
    <DemoContainer>
      <h1>Breadcrumbs Component Demo</h1>
      <p>
        This demo showcases the various configurations and capabilities of the Breadcrumbs
        component.
      </p>

      <DemoSection>
        <Title>Basic Usage</Title>
        <Description>A simple Breadcrumbs component showing the navigation path.</Description>

        <ExampleContainer>
          <ExampleTitle>Standard Breadcrumbs</ExampleTitle>
          <CodeBlock>{`<Breadcrumbs 
  items={[
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Laptops', path: '/products/laptops', active: true }
  ]}
/>`}</CodeBlock>

          <Breadcrumbs items={simpleBreadcrumbs} />
        </ExampleContainer>
      </DemoSection>

      <DemoSection>
        <Title>With Icons</Title>
        <Description>Breadcrumbs can include icons to enhance visual hierarchy.</Description>

        <ExampleContainer>
          <ExampleTitle>Breadcrumbs with Icons</ExampleTitle>
          <CodeBlock>{`<Breadcrumbs 
  items={[
    { label: 'Home', path: '/', icon: <HomeSvg /> },
    { label: 'Users', path: '/users' },
    { label: 'User Profile', path: '/users/profile' },
    { label: 'Settings', path: '/users/profile/settings', active: true }
  ]}
/>`}</CodeBlock>

          <Breadcrumbs items={iconBreadcrumbs} />
        </ExampleContainer>
      </DemoSection>

      <DemoSection>
        <Title>Long Breadcrumbs with Collapse</Title>
        <Description>
          For deep navigation hierarchies, breadcrumbs automatically collapse with ellipsis.
        </Description>

        <ExampleContainer>
          <ExampleTitle>Auto-collapsing Breadcrumbs</ExampleTitle>
          <CodeBlock>{`<Breadcrumbs 
  items={longBreadcrumbs}
  maxItems={5}
  itemsBeforeCollapse={2}
  itemsAfterCollapse={2}
/>`}</CodeBlock>

          <Breadcrumbs
            items={longBreadcrumbs}
            maxItems={5}
            itemsBeforeCollapse={2}
            itemsAfterCollapse={2}
          />
        </ExampleContainer>
      </DemoSection>

      <DemoSection>
        <Title>Custom Separators</Title>
        <Description>Breadcrumbs can use custom separators between items.</Description>

        <ExampleContainer>
          <ExampleTitle>Different Separator Types</ExampleTitle>
          <CodeBlock>{`<Breadcrumbs 
  items={simpleBreadcrumbs}
  separator="${separators[currentSeparator]}"
/>`}</CodeBlock>

          <button
            onClick={handleChangeSeparator}
            style={{
              marginBottom: '16px',
              padding: '6px 12px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Change Separator
          </button>

          <Breadcrumbs items={simpleBreadcrumbs} separator={separators[currentSeparator]} />
        </ExampleContainer>
      </DemoSection>

      <DemoSection>
        <Title>Auto-generated Breadcrumbs</Title>
        <Description>
          Breadcrumbs can be automatically generated based on the current route.
        </Description>

        <ExampleContainer>
          <ExampleTitle>Route-based Breadcrumbs</ExampleTitle>
          <CodeBlock>{`<Breadcrumbs 
  autoGenerate={true}
  homeLabel="Dashboard"
  homePath="/dashboard"
  pathMap={{
    'products': 'Product Catalog',
    'laptops': 'Laptop Models'
  }}
/>`}</CodeBlock>

          <p style={{ marginBottom: '12px', color: '#6b7280', fontStyle: 'italic' }}>
            Note: In a real application, this would show breadcrumbs based on the current route. For
            demo purposes, it's shown with mock data.
          </p>

          <Breadcrumbs
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Product Catalog', path: '/dashboard/products' },
              { label: 'Laptop Models', path: '/dashboard/products/laptops', active: true },
            ]}
          />
        </ExampleContainer>
      </DemoSection>
    </DemoContainer>
  );
};
