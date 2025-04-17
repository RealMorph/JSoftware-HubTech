import React, { useState } from 'react';
import styled from '@emotion/styled';
import { TimePicker, TimeValue } from './TimePicker';

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

/**
 * Demo component for the TimePicker
 */
const TimePickerDemo: React.FC = () => {
  // State for basic time picker
  const [basicTime, setBasicTime] = useState<TimeValue>(null);

  // State for 12-hour format
  const [time12h, setTime12h] = useState<TimeValue>(null);

  // State for 24-hour format
  const [time24h, setTime24h] = useState<TimeValue>(null);

  // State for time with minutes step
  const [timeMinuteStep, setTimeMinuteStep] = useState<TimeValue>(null);

  // State for time with seconds
  const [timeWithSeconds, setTimeWithSeconds] = useState<TimeValue>(null);

  // State for time with min/max constraints
  const [constrainedTime, setConstrainedTime] = useState<TimeValue>(null);

  // State for required time
  const [requiredTime, setRequiredTime] = useState<TimeValue>(null);

  // State for disabled time picker
  const [disabledTime, setDisabledTime] = useState<TimeValue>(null);

  // Create min/max times for example
  const createTimeFromHMS = (hours: number, minutes: number, seconds: number = 0): Date => {
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  };

  const minTime = createTimeFromHMS(9, 0); // 9:00 AM
  const maxTime = createTimeFromHMS(17, 0); // 5:00 PM

  // Function to format time for display
  const formatTimeForDisplay = (time: TimeValue): string => {
    if (!time) return 'None';

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    const hoursStr = hours12.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr}:${secondsStr} ${period} (${hours.toString().padStart(2, '0')}:${minutesStr}:${secondsStr})`;
  };

  return (
    <DemoContainer>
      <h1>TimePicker Component Demo</h1>
      <p>
        This demo showcases the various configurations and capabilities of the TimePicker component.
      </p>

      <DemoSection>
        <DemoTitle>Basic Usage</DemoTitle>
        <DemoGrid>
          <DemoCard>
            <h3>Basic Time Selection</h3>
            <CodeBlock>{`<TimePicker
  label="Select a time"
  value={basicTime}
  onChange={setBasicTime}
  placeholder="HH:MM"
/>`}</CodeBlock>

            <TimePicker
              label="Select a time"
              value={basicTime}
              onChange={setBasicTime}
              placeholder="HH:MM"
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(basicTime)}</ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>12-hour Format</h3>
            <CodeBlock>{`<TimePicker
  label="12-hour format"
  value={time12h}
  onChange={setTime12h}
  placeholder="HH:MM AM/PM"
  hourFormat="12"
  format="hh:mm a"
/>`}</CodeBlock>

            <TimePicker
              label="12-hour format"
              value={time12h}
              onChange={setTime12h}
              placeholder="HH:MM AM/PM"
              hourFormat="12"
              format="hh:mm a"
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(time12h)}</ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>24-hour Format</h3>
            <CodeBlock>{`<TimePicker
  label="24-hour format"
  value={time24h}
  onChange={setTime24h}
  placeholder="HH:MM"
  hourFormat="24"
  format="HH:mm"
/>`}</CodeBlock>

            <TimePicker
              label="24-hour format"
              value={time24h}
              onChange={setTime24h}
              placeholder="HH:MM"
              hourFormat="24"
              format="HH:mm"
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(time24h)}</ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Advanced Configuration</DemoTitle>
        <DemoGrid>
          <DemoCard>
            <h3>15-Minute Steps</h3>
            <CodeBlock>{`<TimePicker
  label="15-minute intervals"
  value={timeMinuteStep}
  onChange={setTimeMinuteStep}
  minuteStep={15}
  helperText="Time with 15-minute intervals"
/>`}</CodeBlock>

            <TimePicker
              label="15-minute intervals"
              value={timeMinuteStep}
              onChange={setTimeMinuteStep}
              minuteStep={15}
              helperText="Time with 15-minute intervals"
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(timeMinuteStep)}</ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>With Seconds</h3>
            <CodeBlock>{`<TimePicker
  label="Time with seconds"
  value={timeWithSeconds}
  onChange={setTimeWithSeconds}
  showSeconds
  format="HH:mm:ss"
  helperText="Time with seconds selection"
/>`}</CodeBlock>

            <TimePicker
              label="Time with seconds"
              value={timeWithSeconds}
              onChange={setTimeWithSeconds}
              showSeconds
              format="HH:mm:ss"
              helperText="Time with seconds selection"
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(timeWithSeconds)}</ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>Time Range Constraints</h3>
            <CodeBlock>{`<TimePicker
  label="Business hours (9AM-5PM)"
  value={constrainedTime}
  onChange={setConstrainedTime}
  minTime={minTime}
  maxTime={maxTime}
  helperText="Select a time between 9AM and 5PM"
/>`}</CodeBlock>

            <TimePicker
              label="Business hours (9AM-5PM)"
              value={constrainedTime}
              onChange={setConstrainedTime}
              minTime={minTime}
              maxTime={maxTime}
              helperText="Select a time between 9AM and 5PM"
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(constrainedTime)}</ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>

      <DemoSection>
        <DemoTitle>Form Integration</DemoTitle>
        <DemoGrid>
          <DemoCard>
            <h3>Required Field</h3>
            <CodeBlock>{`<TimePicker
  label="Required time"
  value={requiredTime}
  onChange={setRequiredTime}
  required
  error={!requiredTime}
  errorMessage={!requiredTime ? "Time is required" : undefined}
/>`}</CodeBlock>

            <TimePicker
              label="Required time"
              value={requiredTime}
              onChange={setRequiredTime}
              required
              error={!requiredTime}
              errorMessage={!requiredTime ? 'Time is required' : undefined}
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(requiredTime)}</ResultDisplay>
          </DemoCard>

          <DemoCard>
            <h3>Disabled Field</h3>
            <CodeBlock>{`<TimePicker
  label="Disabled time picker"
  value={disabledTime}
  onChange={setDisabledTime}
  disabled
/>`}</CodeBlock>

            <TimePicker
              label="Disabled time picker"
              value={disabledTime}
              onChange={setDisabledTime}
              disabled
            />

            <ResultDisplay>Selected time: {formatTimeForDisplay(disabledTime)}</ResultDisplay>
          </DemoCard>
        </DemoGrid>
      </DemoSection>
    </DemoContainer>
  );
};

export { TimePickerDemo };
