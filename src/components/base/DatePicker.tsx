import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Type definitions
export type DateValue = Date | null;
export type DateRangeValue = [DateValue, DateValue];

export interface DatePickerProps {
  /** Label for the date picker */
  label?: string;
  /** Value for controlled component */
  value?: DateValue | DateValue[] | DateRangeValue;
  /** Callback when date selection changes */
  onChange?: (value: DateValue | DateValue[] | DateRangeValue) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the field has an error */
  error?: boolean | string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Selection mode: single, range, or multiple */
  mode?: 'single' | 'range' | 'multiple';
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of dates that should be disabled */
  disabledDates?: Date[];
  /** Function to determine if a date should be disabled */
  shouldDisableDate?: (date: Date) => boolean;
  /** Date format for display (e.g., 'MM/dd/yyyy') */
  format?: string;
  /** Initial month to display in calendar */
  initialMonth?: Date;
  /** Custom class name */
  className?: string;
}

// Date utility functions
const DAYS_IN_WEEK = 7;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};

const isDateInRange = (date: Date, startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) return false;
  const time = date.getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
};

const isDateDisabled = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[],
  shouldDisableDate?: (date: Date) => boolean
): boolean => {
  // Check min/max constraints
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  
  // Check explicitly disabled dates
  if (disabledDates && disabledDates.some(disabledDate => isSameDay(date, disabledDate))) {
    return true;
  }
  
  // Check custom disable function
  if (shouldDisableDate && shouldDisableDate(date)) {
    return true;
  }
  
  return false;
};

const getDateFromFormat = (dateStr: string, format: string): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Simple implementation for common formats
    // In a production app, use a library like date-fns
    const now = new Date();
    const parts = dateStr.split(/[/.-]/);
    
    if (format.startsWith('MM')) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10) || now.getFullYear();
      return new Date(year, month, day);
    } else if (format.startsWith('dd')) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10) || now.getFullYear();
      return new Date(year, month, day);
    } else if (format.startsWith('yyyy')) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Default fallback
    return new Date(dateStr);
  } catch (e) {
    return null;
  }
};

const formatDate = (date: Date | null, format?: string): string => {
  if (!date) return '';
  
  // Simple implementation - in a production app, use a library like date-fns
  if (format) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year.toString())
      .replace('yy', year.toString().slice(-2));
  }
  
  // Default format
  return date.toLocaleDateString();
};

// Styled components
const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Label = styled.label<{ hasError?: boolean; disabled?: boolean }>`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    const theme = useDirectTheme();
    if (props.disabled) return theme.getColor('text.disabled', '#999999');
    if (props.hasError) return theme.getColor('error', '#f44336');
    return theme.getColor('text.primary', '#333333');
  }};
`;

const RequiredIndicator = styled.span`
  color: ${() => {
    const theme = useDirectTheme();
    return theme.getColor('error', '#f44336');
  }};
  margin-left: 4px;
`;

const InputContainer = styled.div<{ hasError?: boolean; disabled?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${props => {
    const theme = useDirectTheme();
    if (props.disabled) return theme.getColor('text.disabled', '#999999');
    if (props.hasError) return theme.getColor('error', '#f44336');
    return theme.getColor('border', '#e0e0e0');
  }};
  border-radius: 4px;
  background-color: ${props => {
    const theme = useDirectTheme();
    return props.disabled 
      ? theme.getColor('background', '#f5f5f5')
      : theme.getColor('white', '#ffffff');
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    border-color: ${props => {
      const theme = useDirectTheme();
      if (props.disabled) return theme.getColor('text.disabled', '#999999');
      if (props.hasError) return theme.getColor('error', '#f44336');
      return theme.getColor('primary', '#1976d2');
    }};
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  color: ${props => {
    const theme = useDirectTheme();
    return props.disabled 
      ? theme.getColor('text.disabled', '#999999')
      : theme.getColor('text.primary', '#333333');
  }};
  font-size: 14px;
  cursor: inherit;
  
  &::placeholder {
    color: ${() => {
      const theme = useDirectTheme();
      return theme.getColor('text.secondary', '#666666');
    }};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const CalendarIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  color: ${() => {
    const theme = useDirectTheme();
    return theme.getColor('text.secondary', '#666666');
  }};
`;

const HelperText = styled.div<{ hasError?: boolean }>`
  font-size: 12px;
  margin-top: 4px;
  color: ${props => {
    const theme = useDirectTheme();
    return props.hasError 
      ? theme.getColor('error', '#f44336')
      : theme.getColor('text.secondary', '#666666');
  }};
`;

const PopoverContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 9999;
  width: 100%;
  background: #FFFFFF;
  background-color: #FFFFFF;
  border-radius: 4px;
  box-shadow: ${() => {
    const theme = useDirectTheme();
    return theme.getShadow('lg', '0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)');
  }};
  display: ${props => (props.visible ? 'block' : 'none')};
  border: 1px solid ${() => {
    const theme = useDirectTheme();
    return theme.getColor('border', '#e0e0e0');
  }};
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  overflow: hidden;
`;

const CalendarContainer = styled.div`
  padding: 16px;
  background: #FFFFFF;
  background-color: #FFFFFF;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthYearDisplay = styled.div`
  font-weight: 500;
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${() => {
      const theme = useDirectTheme();
      return theme.getColor('background.hover', '#f5f5f5');
    }};
  }
  
  &:focus {
    outline: none;
    background-color: ${() => {
      const theme = useDirectTheme();
      return theme.getColor('background.hover', '#f5f5f5');
    }};
  }
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  background: #FFFFFF;
  background-color: #FFFFFF;
`;

const WeekdayCell = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${() => {
    const theme = useDirectTheme();
    return theme.getColor('text.secondary', '#666666');
  }};
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 36px);
  gap: 2px;
  background: #FFFFFF;
  background-color: #FFFFFF;
`;

const DayCell = styled.button<{
  isOutsideMonth?: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  isToday?: boolean;
  isDisabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: ${props => {
    const theme = useDirectTheme();
    if (props.isDisabled) return theme.getColor('background', '#f5f5f5');
    if (props.isSelected) return theme.getColor('primary', '#1976d2');
    if (props.isInRange) return theme.getColor('primary', '#1976d2') + '33'; // Add opacity
    return '#FFFFFF';
  }};
  background-color: ${props => {
    const theme = useDirectTheme();
    if (props.isDisabled) return theme.getColor('background', '#f5f5f5');
    if (props.isSelected) return theme.getColor('primary', '#1976d2');
    if (props.isInRange) return theme.getColor('primary', '#1976d2') + '33'; // Add opacity
    return '#FFFFFF';
  }};
  border-radius: ${props => {
    if (props.isRangeStart) return '50% 0 0 50%';
    if (props.isRangeEnd) return '0 50% 50% 0';
    if (props.isSelected) return '50%';
    return '0';
  }};
  color: ${props => {
    const theme = useDirectTheme();
    if (props.isDisabled) return theme.getColor('text.disabled', '#999999');
    if (props.isOutsideMonth) return theme.getColor('text.disabled', '#999999');
    if (props.isSelected) return theme.getColor('white', '#ffffff');
    if (props.isToday) return theme.getColor('primary', '#1976d2');
    return theme.getColor('text.primary', '#333333');
  }};
  font-weight: ${props => (props.isToday ? '600' : '400')};
  cursor: ${props => (props.isDisabled ? 'not-allowed' : 'pointer')};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    display: ${props => (props.isToday && !props.isSelected ? 'block' : 'none')};
    background-color: currentColor;
  }
  
  &:hover {
    background-color: ${props => {
      const theme = useDirectTheme();
      if (props.isDisabled) return theme.getColor('background', '#f5f5f5');
      if (props.isSelected) return theme.getColor('primary', '#1976d2');
      return theme.getColor('background.hover', '#f5f5f5');
    }};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${props => {
      const theme = useDirectTheme();
      return !props.isDisabled ? `0 0 0 2px ${theme.getColor('primary', '#1976d2')}33` : 'none';
    }};
  }
`;

// Calendar component
interface CalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  mode: 'single' | 'range' | 'multiple';
  value: DateValue | DateValue[] | DateRangeValue;
  onChange: (value: DateValue | DateValue[] | DateRangeValue) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  shouldDisableDate?: (date: Date) => boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  month,
  onMonthChange,
  mode,
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates,
  shouldDisableDate,
}) => {
  // Generate dates for the calendar grid
  const generateDays = (currentMonth: Date) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const lastDate = lastDay.getDate();
    
    // Array to hold all days to display
    const days: { date: Date; isOutsideMonth: boolean }[] = [];
    
    // Add days from previous month to fill the first row
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDate = prevMonth.getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isOutsideMonth: true,
      });
    }
    
    // Add days of the current month
    for (let i = 1; i <= lastDate; i++) {
      days.push({
        date: new Date(year, month, i),
        isOutsideMonth: false,
      });
    }
    
    // Add days from next month to complete the grid (6 rows * 7 days = 42 cells)
    const daysNeeded = 42 - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isOutsideMonth: true,
      });
    }
    
    return days;
  };
  
  const days = generateDays(month);
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(month);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };
  
  const handleDayClick = (day: Date) => {
    const isDisabled = isDateDisabled(day, minDate, maxDate, disabledDates, shouldDisableDate);
    if (isDisabled) return;
    
    // Handle different selection modes
    if (mode === 'single') {
      onChange(day);
    } else if (mode === 'range') {
      const currentRange = value as DateRangeValue;
      if (!currentRange[0] || (currentRange[0] && currentRange[1])) {
        // Start a new range
        onChange([day, null]);
      } else {
        // Complete the range
        const start = currentRange[0];
        if (day < start) {
          onChange([day, start]);
        } else {
          onChange([start, day]);
        }
      }
    } else if (mode === 'multiple') {
      const currentValues = value as DateValue[];
      const existingIndex = currentValues.findIndex(d => d && isSameDay(d, day));
      
      if (existingIndex >= 0) {
        // Remove date if already selected
        const newValues = [...currentValues];
        newValues.splice(existingIndex, 1);
        onChange(newValues);
      } else {
        // Add date to selection
        onChange([...currentValues, day]);
      }
    }
  };
  
  const isDateSelected = (day: Date): boolean => {
    if (mode === 'single') {
      return isSameDay(day, value as DateValue);
    } else if (mode === 'range') {
      const range = value as DateRangeValue;
      return isSameDay(day, range[0]) || isSameDay(day, range[1]);
    } else if (mode === 'multiple') {
      const multiDates = value as DateValue[];
      return multiDates.some(d => isSameDay(d, day));
    }
    return false;
  };
  
  const isDateInCurrentRange = (day: Date): boolean => {
    if (mode !== 'range') return false;
    const range = value as DateRangeValue;
    if (!range[0] || !range[1]) return false;
    return isDateInRange(day, range[0], range[1]) && 
           !isSameDay(day, range[0]) && 
           !isSameDay(day, range[1]);
  };
  
  const isRangeStart = (day: Date): boolean => {
    if (mode !== 'range') return false;
    const range = value as DateRangeValue;
    return !!range[0] && isSameDay(day, range[0]) && !!range[1];
  };
  
  const isRangeEnd = (day: Date): boolean => {
    if (mode !== 'range') return false;
    const range = value as DateRangeValue;
    return !!range[1] && isSameDay(day, range[1]);
  };
  
  const today = new Date();
  
  return (
    <CalendarContainer>
      <CalendarHeader>
        <NavigationButton onClick={handlePrevMonth} type="button">
          &lt;
        </NavigationButton>
        <MonthYearDisplay>
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
        </MonthYearDisplay>
        <NavigationButton onClick={handleNextMonth} type="button">
          &gt;
        </NavigationButton>
      </CalendarHeader>
      
      <WeekdaysRow>
        {DAY_NAMES.map(day => (
          <WeekdayCell key={day}>{day}</WeekdayCell>
        ))}
      </WeekdaysRow>
      
      <DaysGrid>
        {days.map(({ date, isOutsideMonth }, index) => {
          const isSelected = isDateSelected(date);
          const isInRange = isDateInCurrentRange(date);
          const isToday = isSameDay(date, today);
          const isDisabled = isDateDisabled(
            date,
            minDate,
            maxDate,
            disabledDates,
            shouldDisableDate
          );
          const isRangeStartDate = isRangeStart(date);
          const isRangeEndDate = isRangeEnd(date);
          
          return (
            <DayCell
              key={index}
              isOutsideMonth={isOutsideMonth}
              isSelected={isSelected}
              isInRange={isInRange}
              isRangeStart={isRangeStartDate}
              isRangeEnd={isRangeEndDate}
              isToday={isToday}
              isDisabled={isDisabled}
              onClick={() => handleDayClick(date)}
              type="button"
              tabIndex={isOutsideMonth || isDisabled ? -1 : 0}
              aria-label={date.toLocaleDateString()}
              aria-disabled={isDisabled}
              aria-selected={isSelected}
            >
              {date.getDate()}
            </DayCell>
          );
        })}
      </DaysGrid>
    </CalendarContainer>
  );
};

// Main DatePicker component
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  helperText,
  errorMessage,
  error = false,
  required = false,
  disabled = false,
  mode = 'single',
  minDate,
  maxDate,
  disabledDates,
  shouldDisableDate,
  format = 'MM/dd/yyyy',
  initialMonth,
  className,
}) => {
  const theme = useDirectTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize value based on mode
  const [internalValue, setInternalValue] = useState<DateValue | DateValue[] | DateRangeValue>(() => {
    if (value !== undefined) return value;
    if (mode === 'single') return null;
    if (mode === 'range') return [null, null];
    return [];
  });
  
  // Calendar state
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialMonth) return initialMonth;
    if (mode === 'single' && value) return value as Date;
    if (mode === 'range' && (value as DateRangeValue)?.[0]) return (value as DateRangeValue)[0] as Date;
    if (mode === 'multiple' && (value as DateValue[])?.length) return (value as DateValue[])[0] as Date;
    return new Date();
  });
  
  // Update internal value when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  // Format displayed value in the input field
  const getDisplayValue = (): string => {
    if (mode === 'single') {
      return formatDate(internalValue as DateValue, format);
    } else if (mode === 'range') {
      const range = internalValue as DateRangeValue;
      if (range[0] && range[1]) {
        return `${formatDate(range[0], format)} - ${formatDate(range[1], format)}`;
      } else if (range[0]) {
        return `${formatDate(range[0], format)} - ...`;
      }
      return '';
    } else if (mode === 'multiple') {
      const dates = internalValue as DateValue[];
      if (dates.length === 0) return '';
      if (dates.length === 1) return formatDate(dates[0], format);
      return `${formatDate(dates[0], format)} (+${dates.length - 1} more)`;
    }
    return '';
  };
  
  // Handle input change (typing dates)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (mode === 'single') {
      const parsedDate = getDateFromFormat(input, format);
      setInternalValue(parsedDate);
      if (onChange && parsedDate) {
        onChange(parsedDate);
      }
    }
    // For range and multiple modes, we'll rely on the calendar selection
  };
  
  // Handle calendar change
  const handleCalendarChange = (newValue: DateValue | DateValue[] | DateRangeValue) => {
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    // Close the calendar for single selection once a date is picked
    if (mode === 'single') {
      setIsOpen(false);
    }
    
    // Close the calendar for range selection once both dates are picked
    if (mode === 'range') {
      const range = newValue as DateRangeValue;
      if (range[0] && range[1]) {
        setIsOpen(false);
      }
    }
  };
  
  // Toggle calendar visibility
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Determine if there's an error to display
  const hasError = Boolean(error || errorMessage);
  const displayedError = typeof error === 'string' ? error : errorMessage;
  
  return (
    <DatePickerContainer ref={containerRef} className={className}>
      {label && (
        <Label hasError={hasError} disabled={disabled}>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </Label>
      )}
      
      <InputContainer 
        hasError={hasError}
        disabled={disabled}
        onClick={handleInputClick}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={getDisplayValue()}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={mode !== 'single'} // Only allow typing in single mode
        />
        <CalendarIcon>
          {/* Calendar icon - could be replaced with SVG or icon library */}
          📅
        </CalendarIcon>
      </InputContainer>
      
      {(hasError && displayedError) ? (
        <HelperText hasError={true}>{displayedError}</HelperText>
      ) : helperText ? (
        <HelperText>{helperText}</HelperText>
      ) : null}
      
      <PopoverContainer visible={isOpen}>
        <Calendar
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          mode={mode}
          value={internalValue}
          onChange={handleCalendarChange}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          shouldDisableDate={shouldDisableDate}
        />
      </PopoverContainer>
    </DatePickerContainer>
  );
}; 