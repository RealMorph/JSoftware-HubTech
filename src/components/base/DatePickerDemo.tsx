import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { DatePicker, DateValue, DateRangeValue } from './DatePicker';

// Define a theme styles interface for consistent theming
interface ThemeStyles {
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    codeBackground: string;
    resultBackground: string;
    cardBorder: string;
    cardShadow: string;
  };
  spacing: {
    page: string;
    section: string;
    component: string;
    card: string;
    item: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
    };
    heading: {
      fontSize: string;
      fontWeight: string;
    };
    subheading: {
      fontSize: string;
      fontWeight: string;
    };
    code: {
      fontSize: string;
    };
  };
  borderRadius: string;
}

// Theme-based styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.page};
  max-width: 1200px;
  margin: 0 auto;
  color: ${props => props.$themeStyles.colors.text};
`;

const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const DemoTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.title.fontSize};
  font-weight: ${props => props.$themeStyles.typography.title.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
  padding-bottom: ${props => props.$themeStyles.spacing.item};
  color: ${props => props.$themeStyles.colors.text};
`;

const DemoGrid = styled.div<{ $themeStyles: ThemeStyles }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.$themeStyles.spacing.component};
  width: 100%;
`;

const DemoCard = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.card};
  border: 1px solid ${props => props.$themeStyles.colors.cardBorder};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.colors.cardShadow};
  width: 100%;
  box-sizing: border-box;
`;

const CodeBlock = styled.pre<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.colors.codeBackground};
  padding: ${props => props.$themeStyles.spacing.item};
  border-radius: ${props => props.$themeStyles.borderRadius};
  font-size: ${props => props.$themeStyles.typography.code.fontSize};
  overflow: auto;
  margin: ${props => props.$themeStyles.spacing.item} 0;
`;

const ResultDisplay = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.item};
  padding: ${props => props.$themeStyles.spacing.item};
  background-color: ${props => props.$themeStyles.colors.resultBackground};
  border-radius: ${props => props.$themeStyles.borderRadius};
  border: 1px dashed ${props => props.$themeStyles.colors.border};
  color: ${props => props.$themeStyles.colors.text};
`;

const PageTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.heading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.heading.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  color: ${props => props.$themeStyles.colors.text};
`;

const PageDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  color: ${props => props.$themeStyles.colors.textSecondary};
`;

const CardTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.subheading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.subheading.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  color: ${props => props.$themeStyles.colors.text};
`;

// Create theme styles based on DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;

  return {
    colors: {
      background: getColor('background', '#ffffff'),
      text: getColor('text.primary', '#333333'),
      textSecondary: getColor('text.secondary', '#666666'),
      border: getColor('border', '#eeeeee'),
      codeBackground: getColor('gray.50', '#f5f5f5'),
      resultBackground: getColor('gray.50', '#f9f9f9'),
      cardBorder: getColor('border', '#eeeeee'),
      cardShadow: getShadow('sm', '0 2px 4px rgba(0, 0, 0, 0.05)'),
    },
    spacing: {
      page: getSpacing('6', '24px'),
      section: getSpacing('8', '32px'),
      component: getSpacing('6', '24px'),
      card: getSpacing('4', '16px'),
      item: getSpacing('3', '12px'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.lg', '20px') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
      },
      heading: {
        fontSize: getTypography('fontSize.xl', '24px') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
      subheading: {
        fontSize: getTypography('fontSize.md', '16px') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
      },
      code: {
        fontSize: getTypography('fontSize.sm', '13px') as string,
      },
    },
    borderRadius: getBorderRadius('md', '8px'),
  };
}

const DatePickerDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

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
    <DemoContainer $themeStyles={themeStyles}>
      <PageTitle $themeStyles={themeStyles}>DatePicker Component Demo</PageTitle>
      <PageDescription $themeStyles={themeStyles}>
        This demo showcases the various configurations and capabilities of the DatePicker component.
      </PageDescription>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Basic Usage</DemoTitle>
        <DemoGrid $themeStyles={themeStyles}>
          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Single Date Selection</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

            <ResultDisplay $themeStyles={themeStyles}>
              Selected date: {singleDate ? singleDate.toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Date Range Selection</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

            <ResultDisplay $themeStyles={themeStyles}>
              Start date: {dateRange[0] ? dateRange[0].toLocaleDateString() : 'None'}
              <br />
              End date: {dateRange[1] ? dateRange[1].toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Multiple Date Selection</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

            <ResultDisplay $themeStyles={themeStyles}>
              Selected dates:{' '}
              {multipleDates.length > 0
                ? multipleDates.map(date => date?.toLocaleDateString()).join(', ')
                : 'None'}
            </ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Advanced Configuration</DemoTitle>
        <DemoGrid $themeStyles={themeStyles}>
          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Custom Date Format</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

            <ResultDisplay $themeStyles={themeStyles}>
              Selected date: {formattedDate ? formattedDate.toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Min/Max Date Constraints</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

            <ResultDisplay $themeStyles={themeStyles}>
              Selected date: {constrainedDate ? constrainedDate.toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>

          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Disable Weekends</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

            <ResultDisplay $themeStyles={themeStyles}>
              Workweek: {workweekRange[0] ? workweekRange[0].toLocaleDateString() : 'None'} to{' '}
              {workweekRange[1] ? workweekRange[1].toLocaleDateString() : 'None'}
            </ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>

      <DemoSection $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Form Integration</DemoTitle>
        <DemoGrid $themeStyles={themeStyles}>
          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Required Field</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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
              errorMessage={!requiredDate ? 'Date is required' : undefined}
            />
          </DemoCard>

          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>Disabled Field</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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

          <DemoCard $themeStyles={themeStyles}>
            <CardTitle $themeStyles={themeStyles}>With Future Date Validation</CardTitle>
            <CodeBlock $themeStyles={themeStyles}>{`<DatePicker
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
