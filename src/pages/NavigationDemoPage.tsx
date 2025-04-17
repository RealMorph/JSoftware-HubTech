import React from 'react';
import styled from '@emotion/styled';
import { BreadcrumbsDemo } from '../components/navigation/BreadcrumbsDemo';
import { PaginationDemo } from '../components/navigation/PaginationDemo';
import { MenuDemo } from '../components/navigation/MenuDemo';

const PageContainer = styled.div`
  padding: 24px;
`;

const SectionTitle = styled.h1`
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
`;

const SectionContainer = styled.div`
  margin-bottom: 48px;
`;

const NavigationDemoPage: React.FC = () => {
  return (
    <PageContainer>
      <SectionTitle>Navigation Components</SectionTitle>

      <SectionContainer>
        <h2>Breadcrumbs</h2>
        <BreadcrumbsDemo />
      </SectionContainer>

      <SectionContainer>
        <h2>Pagination</h2>
        <PaginationDemo />
      </SectionContainer>

      <SectionContainer>
        <h2>Menu</h2>
        <MenuDemo />
      </SectionContainer>
    </PageContainer>
  );
};

export default NavigationDemoPage;
