import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { useTheme } from '../../core/theme/theme-context';

// Helper function to safely access theme values in styled-components
const themeValue = (path: string) => (props: any) => {
  // Check if theme is available in props
  if (props.theme && props.theme.currentTheme) {
    return getThemeValue(props.theme.currentTheme, path);
  }
  // Fallback to empty string if theme is not available
  return '';
};

// Type definitions
export type TimeValue = Date | null;

export interface TimePickerProps {
  /** Label for the time picker */
  label?: string;
  /** Value for controlled component */
  value?: TimeValue;
  /** Callback when time selection changes */
  onChange?: (value: TimeValue) => void;
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
  /** Hour format: 12 or 24 */
  hourFormat?: '12' | '24';
  /** Minimum selectable time */
  minTime?: Date;
  /** Maximum selectable time */
  maxTime?: Date;
  /** Minute step (15 for quarter hour, 30 for half hour, etc.) */
  minuteStep?: number;
  /** Whether to show seconds selector */
  showSeconds?: boolean;
  /** Second step */
  secondStep?: number;
  /** Time format for display (e.g., 'HH:mm', 'hh:mm a') */
  format?: string;
  /** Custom class name */
  className?: string;
}

// Time utility functions
const formatTime = (date: Date | null, format?: string, hourFormat: '12' | '24' = '24'): string => {
  if (!date) return '';
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  if (format) {
    let formattedTime = format;
    
    if (hourFormat === '12') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      
      formattedTime = formattedTime
        .replace('hh', hours12.toString().padStart(2, '0'))
        .replace('h', hours12.toString())
        .replace('a', period)
        .replace('A', period.toUpperCase());
    } else {
      formattedTime = formattedTime
        .replace('HH', hours.toString().padStart(2, '0'))
        .replace('H', hours.toString());
    }
    
    return formattedTime
      .replace('mm', minutes.toString().padStart(2, '0'))
      .replace('m', minutes.toString())
      .replace('ss', seconds.toString().padStart(2, '0'))
      .replace('s', seconds.toString());
  }
  
  // Default format based on hourFormat
  if (hourFormat === '12') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
};

const parseTimeString = (timeStr: string, hourFormat: '12' | '24' = '24'): Date | null => {
  if (!timeStr) return null;
  
  try {
    const now = new Date();
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let isPM = false;
    
    // Simple parsing - in production, consider a more robust time parser
    if (hourFormat === '12') {
      // 12-hour format (e.g., "9:30 PM")
      const match = timeStr.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        seconds = match[3] ? parseInt(match[3], 10) : 0;
        isPM = match[4].toLowerCase() === 'pm';
        
        // Convert to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      } else {
        return null;
      }
    } else {
      // 24-hour format (e.g., "14:30")
      const match = timeStr.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        seconds = match[3] ? parseInt(match[3], 10) : 0;
      } else {
        return null;
      }
    }
    
    // Validate hours, minutes, seconds
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return null;
    }
    
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
  } catch (e) {
    return null;
  }
};

const isTimeInRange = (
  time: Date,
  minTime?: Date,
  maxTime?: Date
): boolean => {
  if (!time) return true;
  
  const timeValue = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
  
  if (minTime) {
    const minValue = minTime.getHours() * 3600 + minTime.getMinutes() * 60 + minTime.getSeconds();
    if (timeValue < minValue) return false;
  }
  
  if (maxTime) {
    const maxValue = maxTime.getHours() * 3600 + maxTime.getMinutes() * 60 + maxTime.getSeconds();
    if (timeValue > maxValue) return false;
  }
  
  return true;
};

// Styled components
const TimePickerContainer = styled.div`
  position: relative;
  width: 100%;
  font-family: ${props => themeValue('typography.family.primary')(props) || 
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'};
`;

const Label = styled.label<{ hasError?: boolean; disabled?: boolean }>`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    if (props.disabled) return themeValue('colors.text.disabled')(props) || '#a0a0a0';
    if (props.hasError) return themeValue('colors.error.main')(props) || '#e44258';
    return themeValue('colors.text.primary')(props) || '#323338';
  }};
`;

const RequiredIndicator = styled.span`
  color: ${props => themeValue('colors.error.main')(props) || '#e44258'};
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
    if (props.disabled) return themeValue('colors.border.disabled')(props) || '#d1d5db';
    if (props.hasError) return themeValue('colors.error.main')(props) || '#e44258';
    return themeValue('colors.border.main')(props) || '#d1d5db';
  }};
  border-radius: ${props => themeValue('borderRadius.md')(props) || '8px'};
  background-color: ${props => 
    props.disabled ? 
    themeValue('colors.background.disabled')(props) || '#f5f6f8' : 
    themeValue('colors.background.paper')(props) || '#ffffff'
  };
  transition: all ${props => themeValue('transitions.duration.shorter')(props) || '200'}ms 
    ${props => themeValue('transitions.easing.easeInOut')(props) || 'cubic-bezier(0.4, 0, 0.2, 1)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    border-color: ${props => {
      if (props.disabled) return themeValue('colors.border.disabled')(props) || '#d1d5db';
      if (props.hasError) return themeValue('colors.error.main')(props) || '#e44258';
      return themeValue('colors.primary.main')(props) || '#0073ea';
    }};
  }
  
  &:focus-within {
    border-color: ${props => {
      if (props.disabled) return themeValue('colors.border.disabled')(props) || '#d1d5db';
      if (props.hasError) return themeValue('colors.error.main')(props) || '#e44258';
      return themeValue('colors.primary.main')(props) || '#0073ea';
    }};
    box-shadow: 0 0 0 2px ${props => {
      if (props.hasError) return themeValue('colors.error.light')(props) || 'rgba(228, 66, 88, 0.2)';
      return themeValue('colors.primary.light')(props) || 'rgba(0, 115, 234, 0.2)';
    }};
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 14px;
  color: ${props => themeValue('colors.text.primary')(props) || '#323338'};
  cursor: inherit;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${props => themeValue('colors.text.secondary')(props) || '#676879'};
    opacity: 0.7;
  }
  
  &:disabled {
    color: ${props => themeValue('colors.text.disabled')(props) || '#a0a0a0'};
  }
`;

const ClockIcon = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  color: ${props => themeValue('colors.text.secondary')(props) || '#676879'};
  font-size: 16px;
`;

const HelperText = styled.p<{ hasError?: boolean }>`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${props => 
    props.hasError ? 
    themeValue('colors.error.main')(props) || '#e44258' : 
    themeValue('colors.text.secondary')(props) || '#676879'
  };
`;

const PopoverContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  z-index: 1000;
  top: calc(100% + 4px);
  left: 0;
  display: ${props => props.visible ? 'block' : 'none'};
  width: 280px;
  background-color: ${props => themeValue('colors.background.paper')(props) || '#ffffff'};
  border-radius: ${props => themeValue('borderRadius.md')(props) || '8px'};
  box-shadow: ${props => themeValue('shadows.lg')(props) || 
    '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.07)'};
  border: 1px solid ${props => themeValue('colors.border.light')(props) || '#e5e7eb'};
`;

// Time picker components
const TimePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => themeValue('colors.border.light')(props) || '#e5e7eb'};
`;

const FormatToggle = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 4px 8px;
  margin: 0 2px;
  background-color: ${props => 
    props.active ? 
    themeValue('colors.primary.main')(props) || '#0073ea' : 
    'transparent'
  };
  color: ${props => 
    props.active ? 
    themeValue('colors.primary.contrastText')(props) || '#ffffff' : 
    themeValue('colors.text.primary')(props) || '#323338'
  };
  border: 1px solid ${props => 
    props.active ? 
    themeValue('colors.primary.main')(props) || '#0073ea' : 
    themeValue('colors.border.main')(props) || '#d1d5db'
  };
  border-radius: ${props => themeValue('borderRadius.sm')(props) || '4px'};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => 
      props.active ? 
      themeValue('colors.primary.dark')(props) || '#0060c7' : 
      themeValue('colors.gray.100')(props) || '#f3f4f6'
    };
  }
`;

const TimeSelectionContainer = styled.div`
  display: flex;
  padding: 16px;
  justify-content: center;
`;

const TimeColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  max-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => themeValue('colors.gray.100')(props) || '#f3f4f6'};
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => themeValue('colors.gray.300')(props) || '#d1d5db'};
    border-radius: 4px;
  }
`;

const ColumnHeader = styled.div`
  font-size: 12px;
  color: ${props => themeValue('colors.text.secondary')(props) || '#676879'};
  margin-bottom: 8px;
  text-align: center;
`;

const TimeOption = styled.div<{ selected: boolean; disabled: boolean }>`
  padding: 8px 0;
  margin: 2px 0;
  width: 100%;
  text-align: center;
  border-radius: ${props => themeValue('borderRadius.sm')(props) || '4px'};
  background-color: ${props => {
    if (props.disabled) return themeValue('colors.gray.100')(props) || '#f3f4f6';
    if (props.selected) return themeValue('colors.primary.light')(props) || '#69c0ff';
    return 'transparent';
  }};
  color: ${props => {
    if (props.disabled) return themeValue('colors.text.disabled')(props) || '#a0a0a0';
    if (props.selected) return themeValue('colors.primary.dark')(props) || '#0060c7';
    return themeValue('colors.text.primary')(props) || '#323338';
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  transition: all 0.15s;
  
  &:hover {
    background-color: ${props => {
      if (props.disabled) return themeValue('colors.gray.100')(props) || '#f3f4f6';
      if (props.selected) return themeValue('colors.primary.light')(props) || '#69c0ff';
      return themeValue('colors.gray.200')(props) || '#e5e7eb';
    }};
  }
`;

const ColumnSeparator = styled.div`
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => themeValue('colors.text.primary')(props) || '#323338'};
  margin: 0 4px;
  padding-top: 28px; // Align with the time options
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid ${props => themeValue('colors.border.light')(props) || '#e5e7eb'};
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 12px;
  margin-left: 8px;
  background-color: ${props => 
    props.primary ? 
    themeValue('colors.primary.main')(props) || '#0073ea' : 
    'transparent'
  };
  color: ${props => 
    props.primary ? 
    themeValue('colors.primary.contrastText')(props) || '#ffffff' : 
    themeValue('colors.primary.main')(props) || '#0073ea'
  };
  border: 1px solid ${props => 
    props.primary ? 
    themeValue('colors.primary.main')(props) || '#0073ea' : 
    themeValue('colors.border.main')(props) || '#d1d5db'
  };
  border-radius: ${props => themeValue('borderRadius.md')(props) || '8px'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => 
      props.primary ? 
      themeValue('colors.primary.dark')(props) || '#0060c7' : 
      themeValue('colors.gray.100')(props) || '#f3f4f6'
    };
  }
`;

// TimePicker component implementation
export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  helperText,
  errorMessage,
  error = false,
  required = false,
  disabled = false,
  hourFormat = '24',
  minTime,
  maxTime,
  minuteStep = 1,
  showSeconds = false,
  secondStep = 1,
  format,
  className,
}) => {
  const { currentTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Default format based on hour format
  const defaultFormat = hourFormat === '12' 
    ? showSeconds ? 'hh:mm:ss a' : 'hh:mm a'
    : showSeconds ? 'HH:mm:ss' : 'HH:mm';
  
  const timeFormat = format || defaultFormat;
  
  // Initialize internal value
  const [internalValue, setInternalValue] = useState<TimeValue>(() => {
    return value !== undefined ? value : null;
  });
  
  // Picker state
  const [isOpen, setIsOpen] = useState(false);
  const [localHourFormat, setLocalHourFormat] = useState<'12' | '24'>(hourFormat);
  
  // Generate hours, minutes, seconds options
  const getHourOptions = () => {
    const options = [];
    const maxHour = localHourFormat === '12' ? 12 : 23;
    const minHour = localHourFormat === '12' ? 1 : 0;
    
    for (let i = minHour; i <= maxHour; i++) {
      options.push(i);
    }
    
    return options;
  };
  
  const getMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += minuteStep) {
      options.push(i);
    }
    return options;
  };
  
  const getSecondOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += secondStep) {
      options.push(i);
    }
    return options;
  };
  
  // Extract hours, minutes, seconds from the current value
  const getTimeComponents = () => {
    if (!internalValue) {
      // Default to current time
      const now = new Date();
      return {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        period: now.getHours() >= 12 ? 'PM' : 'AM'
      };
    }
    
    const hours = internalValue.getHours();
    const minutes = internalValue.getMinutes();
    const seconds = internalValue.getSeconds();
    const period = hours >= 12 ? 'PM' : 'AM';
    
    return { hours, minutes, seconds, period };
  };
  
  const { hours, minutes, seconds, period } = getTimeComponents();
  
  // Handle hour format toggle
  const handleFormatToggle = (format: '12' | '24') => {
    setLocalHourFormat(format);
  };
  
  // Handle time selection
  const handleSelectHour = (hour: number) => {
    if (disabled) return;
    
    const newDate = new Date(internalValue || new Date());
    
    if (localHourFormat === '12') {
      // Convert to 24-hour format for internal storage
      const isPM = period === 'PM';
      const hours24 = hour === 12 
        ? (isPM ? 12 : 0) 
        : (isPM ? hour + 12 : hour);
      
      newDate.setHours(hours24);
    } else {
      newDate.setHours(hour);
    }
    
    if (isTimeInRange(newDate, minTime, maxTime)) {
      setInternalValue(newDate);
      if (onChange) onChange(newDate);
    }
  };
  
  const handleSelectMinute = (minute: number) => {
    if (disabled) return;
    
    const newDate = new Date(internalValue || new Date());
    newDate.setMinutes(minute);
    
    if (isTimeInRange(newDate, minTime, maxTime)) {
      setInternalValue(newDate);
      if (onChange) onChange(newDate);
    }
  };
  
  const handleSelectSecond = (second: number) => {
    if (disabled) return;
    
    const newDate = new Date(internalValue || new Date());
    newDate.setSeconds(second);
    
    if (isTimeInRange(newDate, minTime, maxTime)) {
      setInternalValue(newDate);
      if (onChange) onChange(newDate);
    }
  };
  
  const handleSelectPeriod = (newPeriod: 'AM' | 'PM') => {
    if (disabled) return;
    
    const newDate = new Date(internalValue || new Date());
    const currentHours = newDate.getHours();
    
    if (newPeriod === 'AM' && currentHours >= 12) {
      newDate.setHours(currentHours - 12);
    } else if (newPeriod === 'PM' && currentHours < 12) {
      newDate.setHours(currentHours + 12);
    }
    
    if (isTimeInRange(newDate, minTime, maxTime)) {
      setInternalValue(newDate);
      if (onChange) onChange(newDate);
    }
  };
  
  // Update internal value when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  // Handle input change (typing time)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const parsedTime = parseTimeString(input, localHourFormat);
    
    if (parsedTime && isTimeInRange(parsedTime, minTime, maxTime)) {
      setInternalValue(parsedTime);
      if (onChange) onChange(parsedTime);
    }
  };
  
  // Toggle time picker visibility
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Handle now button click
  const handleNowClick = () => {
    const now = new Date();
    
    if (isTimeInRange(now, minTime, maxTime)) {
      setInternalValue(now);
      if (onChange) onChange(now);
    }
  };
  
  // Handle clear button click
  const handleClearClick = () => {
    setInternalValue(null);
    if (onChange) onChange(null);
    setIsOpen(false);
  };
  
  // Close picker when clicking outside
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
  
  // Convert hours for display
  const displayHour = localHourFormat === '12' 
    ? (hours % 12 || 12) 
    : hours;
  
  // Check if a time option is disabled
  const isOptionDisabled = (type: 'hour' | 'minute' | 'second', value: number): boolean => {
    if (!minTime && !maxTime) return false;
    
    const currentTime = new Date(internalValue || new Date());
    let testTime = new Date(currentTime);
    
    if (type === 'hour') {
      let hours24 = value;
      if (localHourFormat === '12') {
        const isPM = period === 'PM';
        hours24 = value === 12 
          ? (isPM ? 12 : 0) 
          : (isPM ? value + 12 : value);
      }
      testTime.setHours(hours24);
    } else if (type === 'minute') {
      testTime.setMinutes(value);
    } else if (type === 'second') {
      testTime.setSeconds(value);
    }
    
    return !isTimeInRange(testTime, minTime, maxTime);
  };
  
  return (
    <TimePickerContainer ref={containerRef} className={className}>
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
          value={internalValue ? formatTime(internalValue, timeFormat, localHourFormat) : ''}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <ClockIcon>
          {/* Clock icon - could be replaced with SVG or icon library */}
          🕒
        </ClockIcon>
      </InputContainer>
      
      {(hasError && displayedError) ? (
        <HelperText hasError={true}>{displayedError}</HelperText>
      ) : helperText ? (
        <HelperText>{helperText}</HelperText>
      ) : null}
      
      <PopoverContainer visible={isOpen}>
        <TimePickerHeader>
          <FormatToggle>
            <ToggleButton 
              active={localHourFormat === '24'}
              onClick={() => handleFormatToggle('24')}
            >
              24h
            </ToggleButton>
            <ToggleButton 
              active={localHourFormat === '12'}
              onClick={() => handleFormatToggle('12')}
            >
              12h
            </ToggleButton>
          </FormatToggle>
        </TimePickerHeader>
        
        <TimeSelectionContainer>
          {/* Hours Column */}
          <TimeColumn>
            <ColumnHeader>Hour</ColumnHeader>
            {getHourOptions().map(hour => (
              <TimeOption
                key={hour}
                selected={hour === displayHour}
                disabled={isOptionDisabled('hour', hour)}
                onClick={() => handleSelectHour(hour)}
              >
                {hour.toString().padStart(2, '0')}
              </TimeOption>
            ))}
          </TimeColumn>
          
          <ColumnSeparator>:</ColumnSeparator>
          
          {/* Minutes Column */}
          <TimeColumn>
            <ColumnHeader>Min</ColumnHeader>
            {getMinuteOptions().map(minute => (
              <TimeOption
                key={minute}
                selected={minute === minutes}
                disabled={isOptionDisabled('minute', minute)}
                onClick={() => handleSelectMinute(minute)}
              >
                {minute.toString().padStart(2, '0')}
              </TimeOption>
            ))}
          </TimeColumn>
          
          {/* Seconds Column (Optional) */}
          {showSeconds && (
            <>
              <ColumnSeparator>:</ColumnSeparator>
              <TimeColumn>
                <ColumnHeader>Sec</ColumnHeader>
                {getSecondOptions().map(second => (
                  <TimeOption
                    key={second}
                    selected={second === seconds}
                    disabled={isOptionDisabled('second', second)}
                    onClick={() => handleSelectSecond(second)}
                  >
                    {second.toString().padStart(2, '0')}
                  </TimeOption>
                ))}
              </TimeColumn>
            </>
          )}
          
          {/* AM/PM Column (for 12-hour format) */}
          {localHourFormat === '12' && (
            <>
              <ColumnSeparator></ColumnSeparator>
              <TimeColumn>
                <ColumnHeader>AM/PM</ColumnHeader>
                <TimeOption
                  selected={period === 'AM'}
                  disabled={false}
                  onClick={() => handleSelectPeriod('AM')}
                >
                  AM
                </TimeOption>
                <TimeOption
                  selected={period === 'PM'}
                  disabled={false}
                  onClick={() => handleSelectPeriod('PM')}
                >
                  PM
                </TimeOption>
              </TimeColumn>
            </>
          )}
        </TimeSelectionContainer>
        
        <ActionButtons>
          <Button onClick={handleNowClick}>Now</Button>
          <Button onClick={handleClearClick}>Clear</Button>
          <Button primary onClick={() => setIsOpen(false)}>Ok</Button>
        </ActionButtons>
      </PopoverContainer>
    </TimePickerContainer>
  );
}; 