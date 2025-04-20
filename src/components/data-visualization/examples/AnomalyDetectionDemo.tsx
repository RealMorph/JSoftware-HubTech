import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { LineChart } from '../Chart';
import { useTheme } from '../../../core/theme/ThemeContext';
import { createThemeStyles } from '../../../core/theme/utils/themeUtils';
import { filterTransientProps } from '../../../core/styled-components/transient-props';

/**
 * Anomaly Detection Visualization Demo
 * 
 * This component demonstrates advanced analytics visualization features
 * including anomaly detection, moving averages, and trend analysis.
 */

// Sample data with anomalies
const timeSeriesData = [
  { id: '1', label: 'Jan', value: 45 },
  { id: '2', label: 'Feb', value: 52 },
  { id: '3', label: 'Mar', value: 49 },
  { id: '4', label: 'Apr', value: 55 },
  { id: '5', label: 'May', value: 59 },
  { id: '6', label: 'Jun', value: 58 },
  { id: '7', label: 'Jul', value: 61 },
  { id: '8', label: 'Aug', value: 95 }, // Anomaly
  { id: '9', label: 'Sep', value: 63 },
  { id: '10', label: 'Oct', value: 68 },
  { id: '11', label: 'Nov', value: 25 }, // Anomaly
  { id: '12', label: 'Dec', value: 72 },
];

// Create filtered base components
const FilteredButton = filterTransientProps(styled.button``);
const FilteredDiv = filterTransientProps(styled.div``);

// Styled components
const DemoContainer = styled.div<{ $themeStyles: any }>`
  padding: 24px;
  background-color: ${props => props.$themeStyles.colors.background.default};
  border-radius: ${props => props.$themeStyles.borders.radius.large};
  margin-bottom: 24px;
`;

const Title = styled.h2<{ $themeStyles: any }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.xl};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
  color: ${props => props.$themeStyles.colors.text.primary};
  margin-bottom: 16px;
`;

const Description = styled.p<{ $themeStyles: any }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  color: ${props => props.$themeStyles.colors.text.secondary};
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ChartContainer = styled.div<{ $themeStyles: any }>`
  position: relative;
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: 16px;
  box-shadow: ${props => props.$themeStyles.shadows.card};
  overflow: hidden;
  height: 400px;
  margin-bottom: 24px;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const ButtonGroup = styled(FilteredDiv)<{ $themeStyles: any }>`
  display: flex;
  gap: 8px;
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  padding: 4px;
  border-radius: ${props => props.$themeStyles.borders.radius.small};
`;

const Button = styled(FilteredButton)<{ $themeStyles: any, $active?: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  background-color: ${props => props.$active 
    ? props.$themeStyles.colors.primary.main 
    : props.$themeStyles.colors.background.paper};
  color: ${props => props.$active 
    ? props.$themeStyles.colors.primary.contrastText 
    : props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active 
      ? props.$themeStyles.colors.primary.main 
      : props.$themeStyles.colors.hover.light};
  }
`;

const InfoPanel = styled(FilteredDiv)<{ $themeStyles: any }>`
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: 16px;
  margin-bottom: 24px;
`;

const ThresholdInput = styled.div<{ $themeStyles: any }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  label {
    font-size: ${props => props.$themeStyles.typography.fontSize.sm};
    color: ${props => props.$themeStyles.colors.text.secondary};
  }
  
  input {
    width: 80px;
    padding: 4px 8px;
    border: 1px solid ${props => props.$themeStyles.colors.border.main};
    border-radius: ${props => props.$themeStyles.borders.radius.small};
    font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  }
`;

// Function to detect anomalies using Z-score
const detectAnomalies = (data, threshold = 2) => {
  // Calculate mean and standard deviation
  const values = data.map(d => d.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Add anomaly flag and z-score to each data point
  return data.map(point => {
    const zScore = Math.abs((point.value - mean) / stdDev);
    const isAnomaly = zScore > threshold;
    return {
      ...point,
      zScore,
      isAnomaly,
      annotation: isAnomaly ? `Anomaly (z=${zScore.toFixed(2)})` : undefined,
      annotationColor: isAnomaly ? '#f44336' : undefined,
    };
  });
};

// Function to calculate moving average
const calculateMovingAverage = (data, windowSize = 3) => {
  return data.map((point, index) => {
    // Can't calculate MA for the first windowSize-1 points
    if (index < windowSize - 1) {
      return {
        ...point,
        movingAvg: undefined,
      };
    }
    
    // Calculate the average of the window
    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += data[index - i].value;
    }
    const movingAvg = sum / windowSize;
    
    return {
      ...point,
      movingAvg,
    };
  });
};

// Enhanced line chart for anomaly detection
const AnomalyDetectionChart = ({ 
  data, 
  threshold = 2,
  showMovingAverage = false,
  showTrend = false,
  windowSize = 3
}) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  // Process data to detect anomalies and calculate moving average
  const processedData = useMemo(() => {
    const anomalyData = detectAnomalies(data, threshold);
    return showMovingAverage ? calculateMovingAverage(anomalyData, windowSize) : anomalyData;
  }, [data, threshold, showMovingAverage, windowSize]);
  
  // Create additional datasets for the chart
  const chartData = useMemo(() => {
    if (!showMovingAverage) {
      return processedData;
    }
    
    // Create a new dataset for moving average line
    const maLine = processedData
      .filter(d => d.movingAvg !== undefined)
      .map((d, i) => ({
        id: `ma-${d.id}`,
        label: d.label,
        value: d.movingAvg,
        color: '#1976d2',
        isMovingAverage: true,
      }));
    
    return [...processedData];
  }, [processedData, showMovingAverage]);
  
  // Customize point rendering to highlight anomalies
  const customizePoint = (point) => {
    if (point.isAnomaly) {
      return {
        radius: 8,
        fill: '#f44336',
        stroke: '#ffffff',
        strokeWidth: 2,
      };
    }
    return null;
  };
  
  return (
    <LineChart
      data={chartData}
      title="Monthly Data with Anomaly Detection"
      showLegend={true}
      showTooltips={true}
      showValues={false}
      showTrendline={showTrend}
      trendlineOptions={{
        color: '#4caf50',
        strokeWidth: 2,
        lineStyle: 'dashed',
      }}
      showAnnotations={true}
    />
  );
};

// Control panel for analytics visualization options
const AnalyticsControls = ({ 
  threshold, 
  setThreshold, 
  showMovingAverage, 
  setShowMovingAverage,
  showTrend,
  setShowTrend,
  windowSize,
  setWindowSize
}) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  return (
    <ControlsContainer>
      <ThresholdInput $themeStyles={themeStyles}>
        <label>Anomaly Threshold (Z-score):</label>
        <input 
          type="number" 
          value={threshold} 
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          min="1"
          max="5"
          step="0.1"
        />
      </ThresholdInput>
      
      <ThresholdInput $themeStyles={themeStyles}>
        <label>Moving Average Window:</label>
        <input 
          type="number" 
          value={windowSize} 
          onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
          min="2"
          max="6"
          step="1"
          disabled={!showMovingAverage}
        />
      </ThresholdInput>
      
      <ButtonGroup $themeStyles={themeStyles}>
        <Button 
          $themeStyles={themeStyles} 
          $active={showMovingAverage}
          onClick={() => setShowMovingAverage(!showMovingAverage)}
        >
          Show Moving Average
        </Button>
        <Button 
          $themeStyles={themeStyles} 
          $active={showTrend}
          onClick={() => setShowTrend(!showTrend)}
        >
          Show Trend Line
        </Button>
      </ButtonGroup>
    </ControlsContainer>
  );
};

// Information panel about anomalies
const AnomalyInfoPanel = ({ data, threshold }) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  // Detect anomalies
  const processedData = useMemo(() => {
    return detectAnomalies(data, threshold);
  }, [data, threshold]);
  
  // Get anomalies
  const anomalies = useMemo(() => {
    return processedData.filter(d => d.isAnomaly);
  }, [processedData]);
  
  return (
    <InfoPanel $themeStyles={themeStyles}>
      <h3>Anomaly Detection Results</h3>
      <p>Detected {anomalies.length} anomalies using Z-score threshold of {threshold}</p>
      
      {anomalies.length > 0 && (
        <div>
          <p><strong>Anomalies:</strong></p>
          <ul>
            {anomalies.map(anomaly => (
              <li key={anomaly.id}>
                {anomaly.label}: {anomaly.value} (Z-score: {anomaly.zScore.toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </InfoPanel>
  );
};

// Main demo component
export const AnomalyDetectionDemo: React.FC = () => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  // State for visualization options
  const [threshold, setThreshold] = useState(2);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [windowSize, setWindowSize] = useState(3);
  
  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>Advanced Analytics: Anomaly Detection</Title>
      <Description $themeStyles={themeStyles}>
        This demo showcases advanced analytics visualization features including anomaly detection,
        moving averages, and trend analysis. Adjust the controls below to explore different
        analytical techniques and their visual representation.
      </Description>
      
      <AnalyticsControls 
        threshold={threshold}
        setThreshold={setThreshold}
        showMovingAverage={showMovingAverage}
        setShowMovingAverage={setShowMovingAverage}
        showTrend={showTrend}
        setShowTrend={setShowTrend}
        windowSize={windowSize}
        setWindowSize={setWindowSize}
      />
      
      <AnomalyInfoPanel 
        data={timeSeriesData}
        threshold={threshold}
      />
      
      <ChartContainer $themeStyles={themeStyles}>
        <AnomalyDetectionChart 
          data={timeSeriesData}
          threshold={threshold}
          showMovingAverage={showMovingAverage}
          showTrend={showTrend}
          windowSize={windowSize}
        />
      </ChartContainer>
    </DemoContainer>
  );
}; 