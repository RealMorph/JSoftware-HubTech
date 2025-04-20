import React, { useState } from 'react';
import styled from 'styled-components';
import { useChartData } from '../../core/hooks/useChartData';
import { BarChart } from '../data-visualization/Charts';
import { LineChart } from '../data-visualization/Charts';
import { PieChart } from '../data-visualization/Charts';
import { ScatterChart } from '../data-visualization/ScatterChart';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Styled components for layout
const Container = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SubTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  margin-bottom: 1.5rem;
  max-width: 800px;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
`;

/**
 * Example component that demonstrates using the chart components with the useChartData hook
 */
const ChartWithApiExample: React.FC = () => {
  const theme = useDirectTheme();
  const { useBarChart, useLineChart, usePieChart, useScatterChart } = useChartData();
  
  // State for controlling chart settings
  const [period, setPeriod] = useState<string>('monthly');
  const [metric, setMetric] = useState<string>('revenue');
  const [category, setCategory] = useState<string>('product');
  
  // Create scatter plot parameters
  const scatterParams = {
    xMetric: 'price',
    yMetric: 'sales',
    category: category,
  };
  
  // Create chart transformation options
  const barChartOptions = {
    sortBy: 'value' as const,
    sortOrder: 'desc' as const,
    limit: 10,
    aggregateRemainder: true,
    aggregateLabel: 'Other',
  };
  
  // Fetch data using the hooks
  const { data: barData, isLoading: isBarLoading } = useBarChart(
    { period, metric, category }, 
    barChartOptions
  );
  
  const { data: lineData, isLoading: isLineLoading } = useLineChart(
    { period, metric, metrics: [metric], interval: 'monthly' }
  );
  
  const { data: pieData, isLoading: isPieLoading } = usePieChart(
    { category, metric }
  );
  
  const { data: scatterData, isLoading: isScatterLoading } = useScatterChart(scatterParams);
  
  // Handle data point click
  const handleDataPointClick = (pointId: string) => {
    console.log(`Clicked on data point with ID: ${pointId}`);
  };
  
  return (
    <Container>
      <Title>Chart Components with API Integration</Title>
      <Description>
        This example demonstrates how to use the chart components with the useChartData hook
        to fetch and display data from the API. The charts will update automatically when
        you change the parameters below.
      </Description>
      
      <Controls>
        <SelectGroup>
          <Label htmlFor="period">Time Period</Label>
          <Select 
            id="period" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </SelectGroup>
        
        <SelectGroup>
          <Label htmlFor="metric">Metric</Label>
          <Select 
            id="metric" 
            value={metric} 
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="customers">Customers</option>
            <option value="profit">Profit</option>
          </Select>
        </SelectGroup>
        
        <SelectGroup>
          <Label htmlFor="category">Category</Label>
          <Select 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="product">Product</option>
            <option value="region">Region</option>
            <option value="channel">Channel</option>
            <option value="segment">Segment</option>
          </Select>
        </SelectGroup>
      </Controls>
      
      <ChartGrid>
        {/* Bar Chart */}
        <ChartContainer>
          <SubTitle>Bar Chart</SubTitle>
          {isBarLoading ? (
            <div>Loading...</div>
          ) : (
            <BarChart
              data={barData.data}
              title={`${metric.charAt(0).toUpperCase() + metric.slice(1)} by ${category.charAt(0).toUpperCase() + category.slice(1)}`}
              showLegend={true}
              showTooltips={true}
              showValues={true}
              onDataPointClick={handleDataPointClick}
              height="300px"
            />
          )}
        </ChartContainer>
        
        {/* Line Chart */}
        <ChartContainer>
          <SubTitle>Line Chart</SubTitle>
          {isLineLoading ? (
            <div>Loading...</div>
          ) : (
            <LineChart
              data={lineData.data}
              title={`${metric.charAt(0).toUpperCase() + metric.slice(1)} Trend (${period})`}
              showLegend={true}
              showTooltips={true}
              onDataPointClick={handleDataPointClick}
              height="300px"
            />
          )}
        </ChartContainer>
        
        {/* Pie Chart */}
        <ChartContainer>
          <SubTitle>Pie Chart</SubTitle>
          {isPieLoading ? (
            <div>Loading...</div>
          ) : (
            <PieChart
              data={pieData.data}
              title={`${metric.charAt(0).toUpperCase() + metric.slice(1)} Distribution by ${category.charAt(0).toUpperCase() + category.slice(1)}`}
              showLegend={true}
              showTooltips={true}
              onDataPointClick={handleDataPointClick}
              height="300px"
            />
          )}
        </ChartContainer>
        
        {/* Scatter Chart */}
        <ChartContainer>
          <SubTitle>Scatter Chart</SubTitle>
          {isScatterLoading ? (
            <div>Loading...</div>
          ) : (
            <ScatterChart
              data={scatterData.data}
              title={`Price vs. Sales Correlation`}
              xAxisTitle="Price"
              yAxisTitle="Sales Volume"
              showLegend={true}
              showTooltips={true}
              onPointClick={handleDataPointClick}
              showRegressionLine={true}
              showQuadrants={true}
              quadrantLabels={['High Value', 'Premium', 'Basic', 'Value']}
              height="300px"
            />
          )}
        </ChartContainer>
      </ChartGrid>
    </Container>
  );
};

export default ChartWithApiExample; 