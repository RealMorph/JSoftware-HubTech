import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../../core/theme/ThemeContext';
import { createThemeStyles } from '../../../core/theme/utils/themeUtils';
import { ScatterChart } from '../ScatterChart';
import { filterTransientProps } from '../../../core/styled-components/transient-props';

/**
 * Correlation Analysis Visualization Demo
 * 
 * This component demonstrates advanced analytics visualization features
 * for correlation analysis, including heatmaps, scatter plots, and 
 * statistical calculations for measuring relationships between variables.
 */

// Sample data for correlation analysis with multiple variables
const multivariableData = [
  { id: 1, product: 'Product A', sales: 120, advertising: 3400, satisfaction: 4.2, returns: 8 },
  { id: 2, product: 'Product B', sales: 145, advertising: 4100, satisfaction: 4.5, returns: 5 },
  { id: 3, product: 'Product C', sales: 210, advertising: 5200, satisfaction: 4.8, returns: 3 },
  { id: 4, product: 'Product D', sales: 88, advertising: 2100, satisfaction: 3.9, returns: 12 },
  { id: 5, product: 'Product E', sales: 257, advertising: 6300, satisfaction: 4.7, returns: 4 },
  { id: 6, product: 'Product F', sales: 103, advertising: 2800, satisfaction: 4.1, returns: 9 },
  { id: 7, product: 'Product G', sales: 186, advertising: 4700, satisfaction: 4.6, returns: 6 },
  { id: 8, product: 'Product H', sales: 134, advertising: 3800, satisfaction: 4.3, returns: 7 },
  { id: 9, product: 'Product I', sales: 221, advertising: 5500, satisfaction: 4.7, returns: 4 },
  { id: 10, product: 'Product J', sales: 175, advertising: 4400, satisfaction: 4.4, returns: 6 }
];

// Create filtered base components
const FilteredButton = filterTransientProps(styled.button``);
const FilteredDiv = filterTransientProps(styled.div``);
const FilteredSelect = filterTransientProps(styled.select``);

// Styled components
const DemoContainer = styled(FilteredDiv)<{ $themeStyles: any }>`
  padding: 24px;
  background-color: ${props => props.$themeStyles.colors.background.default};
  border-radius: ${props => props.$themeStyles.borders.radius.large};
  margin-bottom: 24px;
`;

const Title = styled(FilteredDiv)<{ $themeStyles: any }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.xl};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
  color: ${props => props.$themeStyles.colors.text.primary};
  margin-bottom: 16px;
`;

const Description = styled(FilteredDiv)<{ $themeStyles: any }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  color: ${props => props.$themeStyles.colors.text.secondary};
  margin-bottom: 24px;
  line-height: 1.5;
`;

const VisualizationContainer = styled(FilteredDiv)<{ $themeStyles: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled(FilteredDiv)<{ $themeStyles: any }>`
  position: relative;
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: 16px;
  box-shadow: ${props => props.$themeStyles.shadows.card};
  overflow: hidden;
  height: 400px;
`;

const ControlsContainer = styled(FilteredDiv)`
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

const Select = styled(FilteredSelect)<{ $themeStyles: any }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$themeStyles.colors.border.main};
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  background-color: ${props => props.$themeStyles.colors.background.paper};
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${props => props.$themeStyles.colors.primary.main};
    outline: none;
  }
`;

const CorrelationMatrix = styled(FilteredDiv)<{ $themeStyles: any }>`
  display: grid;
  grid-template-columns: auto repeat(var(--columns), 1fr);
  grid-template-rows: auto repeat(var(--rows), 1fr);
  gap: 2px;
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  overflow: auto;
  height: 100%;
`;

const MatrixCell = styled(FilteredDiv)<{ $themeStyles: any, $value?: number, $isHeader?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: ${props => props.$isHeader 
    ? props.$themeStyles.colors.background.paper
    : props.$value !== undefined
      ? `rgba(${
          props.$value > 0 
            ? `33, 150, 243, ${Math.abs(props.$value)}` 
            : `244, 67, 54, ${Math.abs(props.$value)}`
        })`
      : 'transparent'};
  color: ${props => props.$isHeader 
    ? props.$themeStyles.colors.text.primary
    : props.$value !== undefined && Math.abs(props.$value) > 0.5
      ? '#ffffff'
      : props.$themeStyles.colors.text.primary};
  font-weight: ${props => props.$isHeader ? props.$themeStyles.typography.fontWeight.semibold : 'normal'};
  border: 1px solid ${props => props.$themeStyles.colors.border.light};
`;

const ScatterPlotContainer = styled(FilteredDiv)`
  width: 100%;
  height: 100%;
  position: relative;
`;

const InfoPanel = styled(FilteredDiv)<{ $themeStyles: any }>`
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: 16px;
  margin-bottom: 24px;
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
`;

const StatRow = styled(FilteredDiv)`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

// Calculate Pearson correlation coefficient between two arrays
const calculateCorrelation = (x, y) => {
  const n = x.length;
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let xVariance = 0;
  let yVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    covariance += xDiff * yDiff;
    xVariance += xDiff * xDiff;
    yVariance += yDiff * yDiff;
  }
  
  // Calculate correlation coefficient
  const correlation = covariance / (Math.sqrt(xVariance) * Math.sqrt(yVariance));
  
  return correlation;
};

// Generate correlation matrix from data
const generateCorrelationMatrix = (data) => {
  const numericVariables = ['sales', 'advertising', 'satisfaction', 'returns'];
  const matrix = {};
  
  // Initialize matrix
  numericVariables.forEach(variable => {
    matrix[variable] = {};
  });
  
  // Calculate correlations
  numericVariables.forEach(var1 => {
    numericVariables.forEach(var2 => {
      if (var1 === var2) {
        matrix[var1][var2] = 1; // Self-correlation is always 1
      } else {
        const values1 = data.map(item => item[var1]);
        const values2 = data.map(item => item[var2]);
        matrix[var1][var2] = calculateCorrelation(values1, values2);
      }
    });
  });
  
  return { matrix, variables: numericVariables };
};

// Calculate linear regression
const calculateLinearRegression = (x, y) => {
  const n = x.length;
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  // Calculate R-squared
  const yPredicted = x.map(xi => slope * xi + intercept);
  const ssr = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPredicted[i], 2), 0);
  const sst = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const rSquared = 1 - (ssr / sst);
  
  return {
    slope,
    intercept,
    rSquared,
    predict: (xValue) => slope * xValue + intercept
  };
};

// SVG ScatterPlot component
const ScatterPlot = ({ 
  xData, 
  yData, 
  xLabel, 
  yLabel, 
  showRegression = true 
}) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 500 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;
  
  // Calculate min/max for axes
  const xMin = Math.min(...xData);
  const xMax = Math.max(...xData);
  const yMin = Math.min(...yData);
  const yMax = Math.max(...yData);
  
  // Add some padding to the range
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xPadding = xRange * 0.1;
  const yPadding = yRange * 0.1;
  
  // Scale functions
  const xScale = (value) => {
    return ((value - xMin) / (xMax - xMin)) * width;
  };
  
  const yScale = (value) => {
    return height - ((value - yMin) / (yMax - yMin)) * height;
  };
  
  // Calculate regression line
  const regression = calculateLinearRegression(xData, yData);
  
  // Generate points for regression line
  const regressionPoints = showRegression ? [
    { x: xMin - xPadding, y: regression.predict(xMin - xPadding) },
    { x: xMax + xPadding, y: regression.predict(xMax + xPadding) }
  ] : [];
  
  // Format axis ticks
  const formatTick = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(1);
  };
  
  const correlation = calculateCorrelation(xData, yData);
  
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* X axis */}
          <line
            x1={0}
            y1={height}
            x2={width}
            y2={height}
            stroke="#ccc"
            strokeWidth={1}
          />
          
          {/* Y axis */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={height}
            stroke="#ccc"
            strokeWidth={1}
          />
          
          {/* X axis label */}
          <text
            x={width / 2}
            y={height + 35}
            textAnchor="middle"
            fill={themeStyles.colors.text.primary}
            fontSize={12}
          >
            {xLabel}
          </text>
          
          {/* Y axis label */}
          <text
            x={-40}
            y={height / 2}
            textAnchor="middle"
            fill={themeStyles.colors.text.primary}
            fontSize={12}
            transform={`rotate(-90, -40, ${height / 2})`}
          >
            {yLabel}
          </text>
          
          {/* X axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const value = xMin + (xMax - xMin) * factor;
            return (
              <g key={`x-tick-${factor}`}>
                <line
                  x1={xScale(value)}
                  y1={height}
                  x2={xScale(value)}
                  y2={height + 5}
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <text
                  x={xScale(value)}
                  y={height + 20}
                  textAnchor="middle"
                  fill={themeStyles.colors.text.secondary}
                  fontSize={10}
                >
                  {formatTick(value)}
                </text>
              </g>
            );
          })}
          
          {/* Y axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const value = yMin + (yMax - yMin) * factor;
            return (
              <g key={`y-tick-${factor}`}>
                <line
                  x1={-5}
                  y1={yScale(value)}
                  x2={0}
                  y2={yScale(value)}
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <text
                  x={-10}
                  y={yScale(value) + 4}
                  textAnchor="end"
                  fill={themeStyles.colors.text.secondary}
                  fontSize={10}
                >
                  {formatTick(value)}
                </text>
              </g>
            );
          })}
          
          {/* Data points */}
          {xData.map((x, i) => (
            <circle
              key={i}
              cx={xScale(x)}
              cy={yScale(yData[i])}
              r={5}
              fill={themeStyles.colors.primary.light}
              stroke={themeStyles.colors.primary.main}
              strokeWidth={1}
              opacity={0.8}
            />
          ))}
          
          {/* Regression line */}
          {showRegression && regressionPoints.length > 0 && (
            <line
              x1={xScale(regressionPoints[0].x)}
              y1={yScale(regressionPoints[0].y)}
              x2={xScale(regressionPoints[1].x)}
              y2={yScale(regressionPoints[1].y)}
              stroke={correlation > 0 ? "#2196f3" : "#f44336"}
              strokeWidth={2}
              strokeDasharray={correlation > 0 ? "none" : "5,5"}
            />
          )}
          
          {/* Correlation info */}
          <text
            x={width - 10}
            y={20}
            textAnchor="end"
            fill={themeStyles.colors.text.primary}
            fontSize={12}
            fontWeight="bold"
          >
            r = {correlation.toFixed(2)}
          </text>
          
          {showRegression && (
            <text
              x={width - 10}
              y={40}
              textAnchor="end"
              fill={themeStyles.colors.text.primary}
              fontSize={12}
            >
              R² = {regression.rSquared.toFixed(2)}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};

// Correlation matrix visualization component
const CorrelationMatrixViz = ({ data }) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  const { matrix, variables } = useMemo(() => {
    return generateCorrelationMatrix(data);
  }, [data]);
  
  return (
    <CorrelationMatrix 
      $themeStyles={themeStyles}
      style={{ 
        '--columns': variables.length, 
        '--rows': variables.length 
      } as React.CSSProperties}
    >
      {/* Header row */}
      <MatrixCell $themeStyles={themeStyles} $isHeader />
      {variables.map(variable => (
        <MatrixCell key={`header-${variable}`} $themeStyles={themeStyles} $isHeader>
          {variable}
        </MatrixCell>
      ))}
      
      {/* Data rows */}
      {variables.map(rowVar => (
        <React.Fragment key={`row-${rowVar}`}>
          <MatrixCell $themeStyles={themeStyles} $isHeader>
            {rowVar}
          </MatrixCell>
          
          {variables.map(colVar => (
            <MatrixCell 
              key={`${rowVar}-${colVar}`} 
              $themeStyles={themeStyles}
              $value={matrix[rowVar][colVar]}
            >
              {matrix[rowVar][colVar].toFixed(2)}
            </MatrixCell>
          ))}
        </React.Fragment>
      ))}
    </CorrelationMatrix>
  );
};

// Controls for correlation analysis
const CorrelationControls = ({ 
  selectedVariables, 
  setSelectedVariables,
  showRegression,
  setShowRegression,
  variables
}) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  const handleVar1Change = (e) => {
    setSelectedVariables({
      ...selectedVariables,
      var1: e.target.value
    });
  };
  
  const handleVar2Change = (e) => {
    setSelectedVariables({
      ...selectedVariables,
      var2: e.target.value
    });
  };
  
  return (
    <ControlsContainer>
      <div>
        <Select 
          $themeStyles={themeStyles}
          value={selectedVariables.var1}
          onChange={handleVar1Change}
        >
          {variables.map(variable => (
            <option key={`var1-${variable}`} value={variable}>
              {variable}
            </option>
          ))}
        </Select>
      </div>
      
      <div>
        <Select 
          $themeStyles={themeStyles}
          value={selectedVariables.var2}
          onChange={handleVar2Change}
        >
          {variables.map(variable => (
            <option key={`var2-${variable}`} value={variable}>
              {variable}
            </option>
          ))}
        </Select>
      </div>
      
      <ButtonGroup $themeStyles={themeStyles}>
        <Button 
          $themeStyles={themeStyles} 
          $active={showRegression}
          onClick={() => setShowRegression(!showRegression)}
        >
          Show Regression Line
        </Button>
      </ButtonGroup>
    </ControlsContainer>
  );
};

// Correlation information panel
const CorrelationInfoPanel = ({ data, selectedVariables }) => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  const xData = data.map(item => item[selectedVariables.var1]);
  const yData = data.map(item => item[selectedVariables.var2]);
  
  const correlation = calculateCorrelation(xData, yData);
  const regression = calculateLinearRegression(xData, yData);
  
  const interpretCorrelation = (r) => {
    const absR = Math.abs(r);
    if (absR < 0.3) return 'Weak';
    if (absR < 0.6) return 'Moderate';
    return 'Strong';
  };
  
  return (
    <InfoPanel $themeStyles={themeStyles}>
      <h3>Correlation Analysis</h3>
      
      <StatRow>
        <span>Pearson Correlation (r):</span>
        <span>{correlation.toFixed(3)}</span>
      </StatRow>
      
      <StatRow>
        <span>Strength:</span>
        <span>{interpretCorrelation(correlation)}</span>
      </StatRow>
      
      <StatRow>
        <span>Direction:</span>
        <span>{correlation > 0 ? 'Positive' : correlation < 0 ? 'Negative' : 'No correlation'}</span>
      </StatRow>
      
      <StatRow>
        <span>R-squared:</span>
        <span>{regression.rSquared.toFixed(3)}</span>
      </StatRow>
      
      <StatRow>
        <span>Regression Equation:</span>
        <span>y = {regression.slope.toFixed(2)}x + {regression.intercept.toFixed(2)}</span>
      </StatRow>
    </InfoPanel>
  );
};

// Main demo component
export const CorrelationAnalysisDemo: React.FC = () => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  const variables = useMemo(() => {
    return ['sales', 'advertising', 'satisfaction', 'returns'];
  }, []);
  
  // State for selected variables to compare
  const [selectedVariables, setSelectedVariables] = useState({
    var1: 'advertising',
    var2: 'sales'
  });
  
  // State for visualization options
  const [showRegression, setShowRegression] = useState(true);
  
  // Extract data for selected variables
  const xData = multivariableData.map(item => item[selectedVariables.var1]);
  const yData = multivariableData.map(item => item[selectedVariables.var2]);
  
  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>Advanced Analytics: Correlation Analysis</Title>
      <Description $themeStyles={themeStyles}>
        This demo showcases correlation analysis visualization techniques to explore relationships
        between different variables in a dataset. The correlation matrix provides an overview
        of all pairwise correlations, while the scatter plot allows for detailed exploration
        of specific variable relationships.
      </Description>
      
      <CorrelationControls 
        selectedVariables={selectedVariables}
        setSelectedVariables={setSelectedVariables}
        showRegression={showRegression}
        setShowRegression={setShowRegression}
        variables={variables}
      />
      
      <CorrelationInfoPanel 
        data={multivariableData}
        selectedVariables={selectedVariables}
      />
      
      <VisualizationContainer $themeStyles={themeStyles}>
        <ChartContainer $themeStyles={themeStyles}>
          <ScatterPlotContainer>
            <ScatterPlot 
              xData={xData}
              yData={yData}
              xLabel={selectedVariables.var1.charAt(0).toUpperCase() + selectedVariables.var1.slice(1)}
              yLabel={selectedVariables.var2.charAt(0).toUpperCase() + selectedVariables.var2.slice(1)}
              showRegression={showRegression}
            />
          </ScatterPlotContainer>
        </ChartContainer>
        
        <ChartContainer $themeStyles={themeStyles}>
          <CorrelationMatrixViz data={multivariableData} />
        </ChartContainer>
      </VisualizationContainer>
    </DemoContainer>
  );
}; 