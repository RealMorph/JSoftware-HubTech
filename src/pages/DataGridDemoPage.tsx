import React from 'react';
import styled from '@emotion/styled';
import DataGridDemo from '../components/data-visualization/DataGridDemo';

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

const DataGridDemoPage = () => {
  return (
    <PageContainer>
      <SectionTitle>Data Grid Component</SectionTitle>
      <DataGridDemo />
    </PageContainer>
  );
};

export default DataGridDemoPage;
