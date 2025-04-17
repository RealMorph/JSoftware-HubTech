import React from 'react';
import { DatePickerDemo } from '../components/base/DatePickerDemo';
import { TimePickerDemo } from '../components/base/TimePickerDemo';
import styled from '@emotion/styled';

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

const DatePickerDemoPage = () => {
  return (
    <PageContainer>
      <SectionTitle>Date & Time Pickers</SectionTitle>

      <SectionContainer>
        <h2>Date Picker</h2>
        <DatePickerDemo />
      </SectionContainer>

      <SectionContainer>
        <h2>Time Picker</h2>
        <TimePickerDemo />
      </SectionContainer>
    </PageContainer>
  );
};

export default DatePickerDemoPage;
