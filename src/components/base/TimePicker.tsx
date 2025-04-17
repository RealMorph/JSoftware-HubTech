import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

/**
 * Interface for theme-based styles used in the component
 */
interface ThemeStyles {
  fontFamily: string;
  typography: {
    fontSize: {
      sm: string;
      xs: string;
    };
    fontWeight: {
      medium: string;
      regular: string;
    };
  };
  colors: {
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    error: string;
    primaryMain: string;
    primaryLight: string;
    primaryDark: string;
    primaryContrastText: string;
  };
  borderRadius: string;
  borderRadiusSm: string;
  borderMain: string;
  borderLight: string;
  borderDisabled: string;
  errorMain: string;
  errorLight: string;
  backgroundPaper: string;
  backgroundDisabled: string;
  gray100: string;
  gray300: string;
  transitionDuration: string;
  transitionEasing: string;
  shadowsLg: string;
}

/**
 * Creates theme styles object from the DirectTheme context
 */
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  return {
    fontFamily: String(themeContext.getTypography('fontFamily', 'sans-serif')),
    typography: {
      fontSize: {
        sm: String(themeContext.getTypography('fontSize.sm', '0.875rem')),
        xs: String(themeContext.getTypography('fontSize.xs', '0.75rem')),
      },
      fontWeight: {
        medium: String(themeContext.getTypography('fontWeight.medium', '500')),
        regular: String(themeContext.getTypography('fontWeight.regular', '400')),
      },
    },
    colors: {
      textPrimary: String(themeContext.getColor('text.primary', '#000000')),
      textSecondary: String(themeContext.getColor('text.secondary', '#666666')),
      textDisabled: String(themeContext.getColor('text.disabled', '#999999')),
      error: String(themeContext.getColor('error.main', '#d32f2f')),
      primaryMain: String(themeContext.getColor('primary.main', '#1976d2')),
      primaryLight: String(themeContext.getColor('primary.light', '#4791db')),
      primaryDark: String(themeContext.getColor('primary.dark', '#115293')),
      primaryContrastText: String(themeContext.getColor('primary.contrastText', '#ffffff')),
    },
    borderRadius: String(themeContext.getSpacing('borderRadius.base', '4px')),
    borderRadiusSm: String(themeContext.getSpacing('borderRadius.sm', '2px')),
    borderMain: String(themeContext.getColor('border.main', '#cccccc')),
    borderLight: String(themeContext.getColor('border.light', '#e0e0e0')),
    borderDisabled: String(themeContext.getColor('border.disabled', '#e0e0e0')),
    errorMain: String(themeContext.getColor('error.main', '#d32f2f')),
    errorLight: String(themeContext.getColor('error.light', '#ef5350')),
    backgroundPaper: String(themeContext.getColor('background.paper', '#ffffff')),
    backgroundDisabled: String(themeContext.getColor('background.disabled', '#f5f5f5')),
    gray100: String(themeContext.getColor('gray.100', '#f3f4f6')),
    gray300: String(themeContext.getColor('gray.300', '#d1d5db')),
    transitionDuration: String(themeContext.getTransition('duration.standard', '0.3s')),
    transitionEasing: String(themeContext.getTransition('easing.easeInOut', 'ease-in-out')),
    shadowsLg: String(
      themeContext.getShadow(
        'lg',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      )
    ),
  };
}

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

const isTimeInRange = (time: Date, minTime?: Date, maxTime?: Date): boolean => {
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
const TimePickerContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  position: relative;
  width: 100%;
  font-family: ${props => props.$themeStyles.fontFamily};
`;

const Label = styled.label<{ hasError?: boolean; disabled?: boolean; $themeStyles: ThemeStyles }>`
  display: block;
  margin-bottom: 8px;
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.sm};
  font-weight: ${({ $themeStyles }) => $themeStyles.typography.fontWeight.medium};
  color: ${({ $themeStyles, hasError, disabled }) => {
    if (disabled) return $themeStyles.colors.textDisabled;
    if (hasError) return $themeStyles.colors.error;
    return $themeStyles.colors.textPrimary;
  }};
`;

const RequiredIndicator = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${({ $themeStyles }) => $themeStyles.colors.error};
  margin-left: 4px;
`;

const InputContainer = styled.div<{
  hasError?: boolean;
  disabled?: boolean;
  $themeStyles: ThemeStyles;
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid
    ${props => {
      if (props.disabled) return props.$themeStyles.borderDisabled;
      if (props.hasError) return props.$themeStyles.errorMain;
      return props.$themeStyles.borderMain;
    }};
  border-radius: ${props => props.$themeStyles.borderRadius};
  background-color: ${props =>
    props.disabled ? props.$themeStyles.backgroundDisabled : props.$themeStyles.backgroundPaper};
  transition: all ${props => props.$themeStyles.transitionDuration}
    ${props => props.$themeStyles.transitionEasing};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    border-color: ${props => {
      if (props.disabled) return props.$themeStyles.borderDisabled;
      if (props.hasError) return props.$themeStyles.errorMain;
      return props.$themeStyles.colors.primaryMain;
    }};
  }

  &:focus-within {
    border-color: ${props => {
      if (props.disabled) return props.$themeStyles.borderDisabled;
      if (props.hasError) return props.$themeStyles.errorMain;
      return props.$themeStyles.colors.primaryMain;
    }};
    box-shadow: 0 0 0 2px
      ${props => {
        if (props.hasError) return props.$themeStyles.errorLight;
        return props.$themeStyles.colors.primaryLight;
      }};
  }
`;

const Input = styled.input<{ $themeStyles: ThemeStyles }>`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 14px;
  color: ${props => props.$themeStyles.colors.textPrimary};
  cursor: inherit;

  &:focus {
    outline: none;
  }

  &:disabled {
    color: ${props => props.$themeStyles.colors.textDisabled};
  }

  &::placeholder {
    color: ${props => props.$themeStyles.colors.textDisabled};
    opacity: 0.7;
  }
`;

const ClockIcon = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-left: 8px;
  color: ${props => props.$themeStyles.colors.textSecondary};
  font-size: 16px;
`;

const HelperText = styled.p<{ hasError?: boolean; $themeStyles: ThemeStyles }>`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${props =>
    props.hasError ? props.$themeStyles.errorMain : props.$themeStyles.colors.textSecondary};
`;

const PopoverContainer = styled.div<{ visible: boolean; $themeStyles: ThemeStyles }>`
  position: absolute;
  z-index: 1000;
  top: calc(100% + 8px);
  left: 0;
  display: ${props => (props.visible ? 'block' : 'none')};
  width: 280px;
  background-color: ${props => props.$themeStyles.backgroundPaper};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.shadowsLg};
  border: 1px solid ${props => props.$themeStyles.borderLight};
`;

// Time picker components
const TimePickerHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.$themeStyles.borderLight};
`;

const FormatToggle = styled.div`
  display: flex;
`;

const ToggleButton = styled.button<{ active: boolean; $themeStyles: ThemeStyles }>`
  padding: 4px 8px;
  margin: 0 2px;
  background-color: ${props =>
    props.active ? props.$themeStyles.colors.primaryMain : 'transparent'};
  color: ${props =>
    props.active
      ? props.$themeStyles.colors.primaryContrastText
      : props.$themeStyles.colors.textPrimary};
  border: 1px solid
    ${props =>
      props.active ? props.$themeStyles.colors.primaryMain : props.$themeStyles.borderMain};
  border-radius: ${props => props.$themeStyles.borderRadiusSm};
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: ${props =>
      props.active ? props.$themeStyles.colors.primaryDark : props.$themeStyles.gray100};
  }
`;

const TimeSelectionContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  padding: 16px;
  justify-content: center;
`;

const TimeColumn = styled.div<{ $themeStyles: ThemeStyles }>`
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
    background: ${props => props.$themeStyles.gray100 || '#f3f4f6'};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.$themeStyles.gray300 || '#d1d5db'};
    border-radius: 4px;
  }
`;

const ColumnHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  color: ${props => props.$themeStyles.colors.textSecondary};
  margin-bottom: 8px;
  text-align: center;
`;

const TimeOption = styled.div<{ selected: boolean; disabled: boolean; $themeStyles: ThemeStyles }>`
  padding: 8px 0;
  margin: 2px 0;
  width: 100%;
  text-align: center;
  background-color: ${props =>
    props.selected ? props.$themeStyles.colors.primaryLight : 'transparent'};
  color: ${props => {
    if (props.disabled) return props.$themeStyles.colors.textDisabled;
    if (props.selected) return props.$themeStyles.colors.primaryMain;
    return props.$themeStyles.colors.textPrimary;
  }};
  border-radius: ${props => props.$themeStyles.borderRadiusSm};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props =>
      props.disabled
        ? 'transparent'
        : props.selected
          ? props.$themeStyles.colors.primaryLight
          : props.$themeStyles.gray100};
  }
`;

const ColumnSeparator = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$themeStyles.colors.textPrimary || '#323338'};
  margin: 0 4px;
  padding-top: 28px; // Align with the time options
`;

const TimeFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid ${props => props.$themeStyles.borderLight};
`;

const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary';
  $themeStyles: ThemeStyles;
}>`
  padding: 6px 12px;
  background-color: ${props =>
    props.variant === 'primary' ? props.$themeStyles.colors.primaryMain : 'transparent'};
  color: ${props =>
    props.variant === 'primary'
      ? props.$themeStyles.colors.primaryContrastText
      : props.$themeStyles.colors.primaryMain};
  border: 1px solid
    ${props =>
      props.variant === 'primary'
        ? props.$themeStyles.colors.primaryMain
        : props.$themeStyles.borderMain};
  border-radius: ${props => props.$themeStyles.borderRadius};
  cursor: pointer;
  font-size: 14px;
  margin: 0 4px;

  &:hover {
    background-color: ${props =>
      props.variant === 'primary'
        ? props.$themeStyles.colors.primaryDark
        : props.$themeStyles.gray100};
  }
`;

const TimePickerBody = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.$themeStyles.gray100};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.$themeStyles.gray300};
    border-radius: 4px;
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
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default format based on hour format
  const defaultFormat =
    hourFormat === '12'
      ? showSeconds
        ? 'hh:mm:ss a'
        : 'hh:mm a'
      : showSeconds
        ? 'HH:mm:ss'
        : 'HH:mm';

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
        period: now.getHours() >= 12 ? 'PM' : 'AM',
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
      const hours24 = hour === 12 ? (isPM ? 12 : 0) : isPM ? hour + 12 : hour;

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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
  const displayHour = localHourFormat === '12' ? hours % 12 || 12 : hours;

  // Check if a time option is disabled
  const isOptionDisabled = (type: 'hour' | 'minute' | 'second', value: number): boolean => {
    if (!minTime && !maxTime) return false;

    const currentTime = new Date(internalValue || new Date());
    let testTime = new Date(currentTime);

    if (type === 'hour') {
      let hours24 = value;
      if (localHourFormat === '12') {
        const isPM = period === 'PM';
        hours24 = value === 12 ? (isPM ? 12 : 0) : isPM ? value + 12 : value;
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
    <TimePickerContainer $themeStyles={themeStyles} className={className} ref={containerRef}>
      {label && (
        <Label hasError={hasError} disabled={disabled} $themeStyles={themeStyles}>
          {label}
          {required && <RequiredIndicator $themeStyles={themeStyles}>*</RequiredIndicator>}
        </Label>
      )}

      <InputContainer
        hasError={hasError}
        disabled={disabled}
        onClick={handleInputClick}
        $themeStyles={themeStyles}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={internalValue ? formatTime(internalValue, timeFormat, localHourFormat) : ''}
          onChange={handleInputChange}
          disabled={disabled}
          $themeStyles={themeStyles}
        />
        <ClockIcon $themeStyles={themeStyles}>
          <span>🕒</span>
        </ClockIcon>
      </InputContainer>

      {hasError && displayedError ? (
        <HelperText hasError={true} $themeStyles={themeStyles}>
          {displayedError}
        </HelperText>
      ) : helperText ? (
        <HelperText $themeStyles={themeStyles}>{helperText}</HelperText>
      ) : null}

      <PopoverContainer visible={isOpen} $themeStyles={themeStyles}>
        <TimePickerHeader $themeStyles={themeStyles}>
          <FormatToggle>
            <ToggleButton
              active={localHourFormat === '24'}
              onClick={() => handleFormatToggle('24')}
              $themeStyles={themeStyles}
            >
              24h
            </ToggleButton>
            <ToggleButton
              active={localHourFormat === '12'}
              onClick={() => handleFormatToggle('12')}
              $themeStyles={themeStyles}
            >
              12h
            </ToggleButton>
          </FormatToggle>
        </TimePickerHeader>

        <TimeSelectionContainer $themeStyles={themeStyles}>
          {/* Hours Column */}
          <TimeColumn $themeStyles={themeStyles}>
            <ColumnHeader $themeStyles={themeStyles}>Hour</ColumnHeader>
            {getHourOptions().map(hour => (
              <TimeOption
                key={hour}
                selected={hour === displayHour}
                disabled={isOptionDisabled('hour', hour)}
                onClick={() => handleSelectHour(hour)}
                $themeStyles={themeStyles}
              >
                {hour.toString().padStart(2, '0')}
              </TimeOption>
            ))}
          </TimeColumn>

          <ColumnSeparator $themeStyles={themeStyles}>:</ColumnSeparator>

          {/* Minutes Column */}
          <TimeColumn $themeStyles={themeStyles}>
            <ColumnHeader $themeStyles={themeStyles}>Min</ColumnHeader>
            {getMinuteOptions().map(minute => (
              <TimeOption
                key={minute}
                selected={minute === minutes}
                disabled={isOptionDisabled('minute', minute)}
                onClick={() => handleSelectMinute(minute)}
                $themeStyles={themeStyles}
              >
                {minute.toString().padStart(2, '0')}
              </TimeOption>
            ))}
          </TimeColumn>

          {/* Seconds Column (Optional) */}
          {showSeconds && (
            <>
              <ColumnSeparator $themeStyles={themeStyles}>:</ColumnSeparator>
              <TimeColumn $themeStyles={themeStyles}>
                <ColumnHeader $themeStyles={themeStyles}>Sec</ColumnHeader>
                {getSecondOptions().map(second => (
                  <TimeOption
                    key={second}
                    selected={second === seconds}
                    disabled={isOptionDisabled('second', second)}
                    onClick={() => handleSelectSecond(second)}
                    $themeStyles={themeStyles}
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
              <ColumnSeparator $themeStyles={themeStyles}></ColumnSeparator>
              <TimeColumn $themeStyles={themeStyles}>
                <ColumnHeader $themeStyles={themeStyles}>AM/PM</ColumnHeader>
                <TimeOption
                  selected={period === 'AM'}
                  disabled={false}
                  onClick={() => handleSelectPeriod('AM')}
                  $themeStyles={themeStyles}
                >
                  AM
                </TimeOption>
                <TimeOption
                  selected={period === 'PM'}
                  disabled={false}
                  onClick={() => handleSelectPeriod('PM')}
                  $themeStyles={themeStyles}
                >
                  PM
                </TimeOption>
              </TimeColumn>
            </>
          )}
        </TimeSelectionContainer>

        <TimeFooter $themeStyles={themeStyles}>
          <ActionButton onClick={handleNowClick} variant="secondary" $themeStyles={themeStyles}>
            Now
          </ActionButton>
          <ActionButton onClick={handleClearClick} variant="secondary" $themeStyles={themeStyles}>
            Clear
          </ActionButton>
          <ActionButton
            onClick={() => setIsOpen(false)}
            variant="primary"
            $themeStyles={themeStyles}
          >
            Done
          </ActionButton>
        </TimeFooter>
      </PopoverContainer>
    </TimePickerContainer>
  );
};
