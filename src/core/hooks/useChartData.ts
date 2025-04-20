import { useMemo } from 'react';
import { 
  useGetBarChartDataQuery, 
  useGetLineChartDataQuery, 
  useGetPieChartDataQuery, 
  useGetScatterChartDataQuery,
  useGetMetricsOverviewQuery,
  useGetAvailableMetricsQuery,
  ChartDataRequest,
  TimeSeriesRequest,
  ScatterChartRequest,
  DataPoint
} from '../state/rtk/api/chartDataApi';
import { useFetch, useDataMutation } from './useReactQuery';
import { queryKeys } from '../query/queryKeys';

// Mock data generator for development and fallback
const generateMockData = (type: 'bar' | 'line' | 'pie' | 'scatter', params?: any): any => {
  // Base mock data
  const mockBarData = {
    id: 'mock-bar-chart',
    title: 'Mock Bar Chart',
    description: 'Sample data for development',
    data: [
      { id: '1', label: 'Jan', value: 45 },
      { id: '2', label: 'Feb', value: 62 },
      { id: '3', label: 'Mar', value: 58 },
      { id: '4', label: 'Apr', value: 71 },
      { id: '5', label: 'May', value: 89 },
      { id: '6', label: 'Jun', value: 83 },
    ],
    metadata: {
      category: params?.category || 'sales',
      period: params?.period || 'monthly',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTimeSeriesData = {
    id: 'mock-line-chart',
    title: 'Mock Line Chart',
    description: 'Sample time series data for development',
    data: [
      { id: '1', label: 'Week 1', value: 12, date: '2023-01-01', timestamp: 1672531200000 },
      { id: '2', label: 'Week 2', value: 19, date: '2023-01-08', timestamp: 1673136000000 },
      { id: '3', label: 'Week 3', value: 15, date: '2023-01-15', timestamp: 1673740800000 },
      { id: '4', label: 'Week 4', value: 25, date: '2023-01-22', timestamp: 1674345600000 },
      { id: '5', label: 'Week 5', value: 32, date: '2023-01-29', timestamp: 1674950400000 },
      { id: '6', label: 'Week 6', value: 28, date: '2023-02-05', timestamp: 1675555200000 },
      { id: '7', label: 'Week 7', value: 36, date: '2023-02-12', timestamp: 1676160000000 },
    ],
    timeRange: {
      start: '2023-01-01',
      end: '2023-02-12',
    },
    interval: params?.interval || 'weekly',
    metadata: {
      metric: params?.metric || 'revenue',
    },
  };

  const mockPieData = {
    id: 'mock-pie-chart',
    title: 'Mock Pie Chart',
    description: 'Sample distribution data for development',
    data: [
      { id: '1', label: 'Product A', value: 35 },
      { id: '2', label: 'Product B', value: 25 },
      { id: '3', label: 'Product C', value: 20 },
      { id: '4', label: 'Product D', value: 15 },
      { id: '5', label: 'Other', value: 5 },
    ],
    total: 100,
    metadata: {
      category: params?.category || 'product',
    },
  };

  const mockScatterData = {
    id: 'mock-scatter-chart',
    title: 'Mock Scatter Chart',
    description: 'Sample correlation data for development',
    data: [
      { id: '1', label: 'Point 1', x: 10, y: 8, size: 10, category: 'A' },
      { id: '2', label: 'Point 2', x: 15, y: 12, size: 15, category: 'A' },
      { id: '3', label: 'Point 3', x: 25, y: 18, size: 12, category: 'B' },
      { id: '4', label: 'Point 4', x: 32, y: 28, size: 20, category: 'B' },
      { id: '5', label: 'Point 5', x: 43, y: 36, size: 8, category: 'C' },
      { id: '6', label: 'Point 6', x: 52, y: 42, size: 18, category: 'C' },
    ],
    xAxis: {
      title: params?.xMetric || 'Price',
      min: 0,
      max: 60,
    },
    yAxis: {
      title: params?.yMetric || 'Sales Volume',
      min: 0,
      max: 50,
    },
    metadata: {
      correlation: 0.87,
    },
  };

  switch (type) {
    case 'bar':
      return mockBarData;
    case 'line':
      return mockTimeSeriesData;
    case 'pie':
      return mockPieData;
    case 'scatter':
      return mockScatterData;
    default:
      return mockBarData;
  }
};

// Data transformation utilities
interface TransformOptions {
  sortBy?: 'value' | 'label';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  aggregateRemainder?: boolean;
  aggregateLabel?: string;
}

const transformChartData = (data: DataPoint[], options?: TransformOptions): DataPoint[] => {
  if (!data) return [];
  
  let transformedData = [...data];
  
  // Sort data if requested
  if (options?.sortBy) {
    transformedData.sort((a, b) => {
      const aValue = options.sortBy === 'value' ? a.value : a.label;
      const bValue = options.sortBy === 'value' ? b.value : b.label;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return options.sortOrder === 'desc' 
          ? bValue.localeCompare(aValue) 
          : aValue.localeCompare(bValue);
      } else {
        return options.sortOrder === 'desc' 
          ? (bValue as number) - (aValue as number) 
          : (aValue as number) - (bValue as number);
      }
    });
  }
  
  // Limit data and aggregate remainder if requested
  if (options?.limit && options.limit < transformedData.length) {
    if (options.aggregateRemainder) {
      const visibleData = transformedData.slice(0, options.limit);
      const remainderData = transformedData.slice(options.limit);
      
      const remainderSum = remainderData.reduce((sum, item) => sum + item.value, 0);
      const remainderItem: DataPoint = {
        id: 'remainder',
        label: options.aggregateLabel || 'Other',
        value: remainderSum,
      };
      
      transformedData = [...visibleData, remainderItem];
    } else {
      transformedData = transformedData.slice(0, options.limit);
    }
  }
  
  return transformedData;
};

/**
 * A hook that provides data for various chart types, with support for filtering, 
 * transformations, and caching through React Query
 */
export const useChartData = () => {
  // Use the React Query hooks for each chart type
  const useBarChart = (params: ChartDataRequest = {}, options?: TransformOptions) => {
    const { data, isLoading, error, refetch } = useGetBarChartDataQuery(params);
    
    // Transform the data according to specified options
    const transformedData = useMemo(() => {
      if (!data) return null;
      return {
        ...data,
        data: transformChartData(data.data, options),
      };
    }, [data, options]);
    
    // For development or when the API is not available
    const mockData = useMemo(() => generateMockData('bar', params), [params]);
    
    return {
      data: transformedData || mockData,
      isLoading,
      error,
      refetch,
    };
  };
  
  const useLineChart = (params: TimeSeriesRequest, options?: TransformOptions) => {
    const { data, isLoading, error, refetch } = useGetLineChartDataQuery(params);
    
    // Transform the data according to specified options
    const transformedData = useMemo(() => {
      if (!data) return null;
      return {
        ...data,
        data: transformChartData(data.data, options),
      };
    }, [data, options]);
    
    // For development or when the API is not available
    const mockData = useMemo(() => generateMockData('line', params), [params]);
    
    return {
      data: transformedData || mockData,
      isLoading,
      error,
      refetch,
    };
  };
  
  const usePieChart = (params: ChartDataRequest = {}, options?: TransformOptions) => {
    const { data, isLoading, error, refetch } = useGetPieChartDataQuery(params);
    
    // Transform the data according to specified options
    const transformedData = useMemo(() => {
      if (!data) return null;
      return {
        ...data,
        data: transformChartData(data.data, options),
      };
    }, [data, options]);
    
    // For development or when the API is not available
    const mockData = useMemo(() => generateMockData('pie', params), [params]);
    
    return {
      data: transformedData || mockData,
      isLoading,
      error,
      refetch,
    };
  };
  
  const useScatterChart = (params: ScatterChartRequest, options?: TransformOptions) => {
    const { data, isLoading, error, refetch } = useGetScatterChartDataQuery(params);
    
    // No transformation for scatter data as it has a different structure
    // For development or when the API is not available
    const mockData = useMemo(() => generateMockData('scatter', params), [params]);
    
    return {
      data: data || mockData,
      isLoading,
      error,
      refetch,
    };
  };
  
  const useMetricsOverview = (period?: string) => {
    const { data, isLoading, error } = useGetMetricsOverviewQuery({ period });
    
    return {
      data,
      isLoading,
      error,
    };
  };
  
  const useAvailableMetrics = () => {
    const { data, isLoading, error } = useGetAvailableMetricsQuery();
    
    return {
      metrics: data || [],
      isLoading,
      error,
    };
  };
  
  // Using the more flexible useFetch from useReactQuery for custom chart data
  const useCustomChartData = <T>(endpoint: string, params: Record<string, any> = {}) => {
    const queryKey = useMemo(() => 
      queryKeys.charts.barChart.custom(params), 
      [params]
    );
    
    return useFetch<T>(
      queryKey,
      async () => {
        // You can use a custom fetch implementation here
        const response = await fetch(`/api/charts/${endpoint}?${new URLSearchParams(params as any)}`);
        if (!response.ok) throw new Error('Failed to fetch chart data');
        return response.json();
      },
      {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };
  
  return {
    useBarChart,
    useLineChart,
    usePieChart,
    useScatterChart,
    useMetricsOverview,
    useAvailableMetrics,
    useCustomChartData,
    transformChartData,
  };
}; 