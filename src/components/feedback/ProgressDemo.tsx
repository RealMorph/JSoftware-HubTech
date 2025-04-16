import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Button } from '../base/Button';
import { Progress } from './Progress';

const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const ProgressDemo: React.FC = () => {
  const [linearValue, setLinearValue] = useState(0);
  const [circularValue, setCircularValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        setLinearValue((prev) => (prev >= 100 ? 0 : prev + 10));
        setCircularValue((prev) => (prev >= 100 ? 0 : prev + 10));
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleStartLoading = () => {
    setIsLoading(true);
  };

  const handleStopLoading = () => {
    setIsLoading(false);
  };

  const handleReset = () => {
    setLinearValue(0);
    setCircularValue(0);
    setIsLoading(false);
  };

  return (
    <DemoContainer>
      <h2>Progress Component Demo</h2>
      
      <Section>
        <h3>Linear Progress</h3>
        <ProgressContainer>
          <Progress 
            type="linear" 
            variant="determinate" 
            value={linearValue} 
            color="primary"
            label="Determinate Progress"
            showPercentage
          />
          <Progress 
            type="linear" 
            variant="indeterminate" 
            color="secondary"
            label="Indeterminate Progress"
          />
          <Progress 
            type="linear" 
            variant="determinate" 
            value={linearValue} 
            color="success"
            size="small"
            label="Small Progress"
            showPercentage
          />
          <Progress 
            type="linear" 
            variant="determinate" 
            value={linearValue} 
            color="error"
            size="large"
            label="Large Progress"
            showPercentage
          />
        </ProgressContainer>
      </Section>
      
      <Section>
        <h3>Circular Progress</h3>
        <ProgressContainer>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Progress 
              type="circular" 
              variant="determinate" 
              value={circularValue} 
              color="primary"
              showPercentage
            />
            <Progress 
              type="circular" 
              variant="indeterminate" 
              color="secondary"
            />
            <Progress 
              type="circular" 
              variant="determinate" 
              value={circularValue} 
              color="success"
              size="small"
              showPercentage
            />
            <Progress 
              type="circular" 
              variant="determinate" 
              value={circularValue} 
              color="error"
              size="large"
              showPercentage
            />
          </div>
        </ProgressContainer>
      </Section>
      
      <ButtonGroup>
        <Button variant="primary" onClick={handleStartLoading}>
          Start Loading
        </Button>
        <Button variant="secondary" onClick={handleStopLoading}>
          Stop Loading
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </ButtonGroup>
    </DemoContainer>
  );
};

export default ProgressDemo; 