import React, { useState } from 'react';
import styled from '@emotion/styled';
import { DatePicker, DateValue, DateRangeValue } from './DatePicker';
import { Card, CardHeader, CardContent } from './Card';

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const DemoTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
`;

const DemoCard = styled.div`
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  overflow: auto;
  margin: 12px 0;
`;

const ResultDisplay = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px dashed #ddd;
`;

const DatePickerDemo: React.FC = () => {
  // Single date picker state
  const [singleDate, setSingleDate] = useState<DateValue>(null);
  const [formattedDate, setFormattedDate] = useState<DateValue>(null);
  const [requiredDate, setRequiredDate] = useState<DateValue>(null);
  const [disabledDate, setDisabledDate] = useState<DateValue>(null);
  const [constrainedDate, setConstrainedDate] = useState<DateValue>(null);

  // Date range picker state
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [workweekRange, setWorkweekRange] = useState<DateRangeValue>([null, null]);

  // Multiple dates picker state
  const [multipleDates, setMultipleDates] = useState<DateValue[]>([]);

  // Type-safe handlers for DatePicker onChange
  const handleSingleDateChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (value instanceof Date || value === null) {
      setSingleDate(value);
    }
  };

  const handleFormattedDateChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (value instanceof Date || value === null) {
      setFormattedDate(value);
    }
  };

  const handleRequiredDateChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (value instanceof Date || value === null) {
      setRequiredDate(value);
    }
  };

  const handleDisabledDateChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (value instanceof Date || value === null) {
      setDisabledDate(value);
    }
  };

  const handleConstrainedDateChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (value instanceof Date || value === null) {
      setConstrainedDate(value);
    }
  };

  const handleDateRangeChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (Array.isArray(value) && value.length === 2) {
      setDateRange(value as DateRangeValue);
    }
  };

  const handleWorkweekRangeChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (Array.isArray(value) && value.length === 2) {
      setWorkweekRange(value as DateRangeValue);
    }
  };

  const handleMultipleDatesChange = (value: DateValue | DateValue[] | DateRangeValue) => {
    if (Array.isArray(value) && (value.length !== 2 || value[0] === null || value[1] === null)) {
      setMultipleDates(value as DateValue[]);
    }
  };

  // Set min/max dates for examples
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 7);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  // Disable weekends function
  const disableWeekends = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Function to disable dates in the past
  const disablePastDates = (date: Date): boolean => {
    return date < today;
  };

  return (
    <DemoContainer>
      <h1>DatePicker Component Demo</h1>
      <p>This demo showcases the various configurations and capabilities of the DatePicker component.</p>

      <DemoSection>
        <DemoTitle>Basic Usage</DemoTitle>
        <DemoGrid>
          <DemoCard>
            <h3>Single Date Selection</h3>
            <CodeBlock>{`<DatePicker
  label="Select a date"
  value={singleDate}
  onChange={handleSingleDateChange}
  placeholder="MM/DD/YYYY"
/>`}</CodeBlock>

            <DatePicker
              label="Select a date"
              value={singleDate}
              onChange={handleSingleDateChange}
              placeholder="MM/DD/YYYY"
            />

            <ResultDisplay>
              Selected date: {singleDate ? singleDate.toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>Date Range Selection</h3>
            <CodeBlock>{`<DatePicker
  label="Select a date range"
  mode="range"
  value={dateRange}
  onChange={handleDateRangeChange}
/>`}</CodeBlock>

            <DatePicker
              label="Select a date range"
              mode="range"
              value={dateRange}
              onChange={handleDateRangeChange}
            />

            <ResultDisplay>
              Start date: {dateRange[0] ? dateRange[0].toLocaleDateString() : 'None'}<br />
              End date: {dateRange[1] ? dateRange[1].toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>Multiple Date Selection</h3>
            <CodeBlock>{`<DatePicker
  label="Select multiple dates"
  mode="multiple"
  value={multipleDates}
  onChange={handleMultipleDatesChange}
/>`}</CodeBlock>

            <DatePicker
              label="Select multiple dates"
              mode="multiple"
              value={multipleDates}
              onChange={handleMultipleDatesChange}
            />

            <ResultDisplay>
              Selected dates: {multipleDates.length > 0 
                ? multipleDates.map(date => date?.toLocaleDateString()).join(', ') 
                : 'None'}
            </ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Advanced Configuration</DemoTitle>
        <DemoGrid>
          <DemoCard>
            <h3>Custom Date Format</h3>
            <CodeBlock>{`<DatePicker
  label="Custom format (yyyy-MM-dd)"
  value={formattedDate}
  onChange={handleFormattedDateChange}
  format="yyyy-MM-dd"
/>`}</CodeBlock>

            <DatePicker
              label="Custom format (yyyy-MM-dd)"
              value={formattedDate}
              onChange={handleFormattedDateChange}
              format="yyyy-MM-dd"
            />

            <ResultDisplay>
              Selected date: {formattedDate ? formattedDate.toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>Min/Max Date Constraints</h3>
            <CodeBlock>{`<DatePicker
  label="Date within constraints"
  value={constrainedDate}
  onChange={handleConstrainedDateChange}
  minDate={minDate}
  maxDate={maxDate}
  helperText="Select a date between the last 7 days and next 30 days"
/>`}</CodeBlock>

            <DatePicker
              label="Date within constraints"
              value={constrainedDate}
              onChange={handleConstrainedDateChange}
              minDate={minDate}
              maxDate={maxDate}
              helperText="Select a date between the last 7 days and next 30 days"
            />

            <ResultDisplay>
              Selected date: {constrainedDate ? constrainedDate.toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>Disable Weekends</h3>
            <CodeBlock>{`<DatePicker
  label="Select a workday"
  value={workweekRange}
  onChange={handleWorkweekRangeChange}
  mode="range"
  shouldDisableDate={disableWeekends}
  helperText="Only weekdays can be selected"
/>`}</CodeBlock>

            <DatePicker
              label="Select a workday"
              value={workweekRange}
              onChange={handleWorkweekRangeChange}
              mode="range"
              shouldDisableDate={disableWeekends}
              helperText="Only weekdays can be selected"
            />

            <ResultDisplay>
              Workweek: {workweekRange[0] ? workweekRange[0].toLocaleDateString() : 'None'} to {workweekRange[1] ? workweekRange[1].toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Form Integration</DemoTitle>
        <DemoGrid>
          <DemoCard>
            <h3>Required Field</h3>
            <CodeBlock>{`<DatePicker
  label="Required date"
  value={requiredDate}
  onChange={handleRequiredDateChange}
  required
  error={!requiredDate}
  errorMessage={!requiredDate ? "Date is required" : undefined}
/>`}</CodeBlock>

            <DatePicker
              label="Required date"
              value={requiredDate}
              onChange={handleRequiredDateChange}
              required
              error={!requiredDate}
              errorMessage={!requiredDate ? "Date is required" : undefined}
            />
          </DemoCard>

          <DemoCard>
            <h3>Disabled Field</h3>
            <CodeBlock>{`<DatePicker
  label="Disabled date picker"
  value={disabledDate}
  onChange={handleDisabledDateChange}
  disabled
/>`}</CodeBlock>

            <DatePicker
              label="Disabled date picker"
              value={disabledDate}
              onChange={handleDisabledDateChange}
              disabled
            />
          </DemoCard>

          <DemoCard>
            <h3>With Future Date Validation</h3>
            <CodeBlock>{`<DatePicker
  label="Future date only"
  value={disabledDate}
  onChange={handleDisabledDateChange}
  shouldDisableDate={disablePastDates}
  helperText="Only future dates can be selected"
/>`}</CodeBlock>

            <DatePicker
              label="Future date only"
              value={disabledDate}
              onChange={handleDisabledDateChange}
              shouldDisableDate={disablePastDates}
              helperText="Only future dates can be selected"
            />
          </DemoCard>
        </DemoGrid>
      </DemoSection>
    </DemoContainer>
  );
};

export { DatePickerDemo }; 