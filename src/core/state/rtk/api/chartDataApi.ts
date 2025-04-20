import { baseApi, standardizeError } from './baseApi';

/**
 * This file implements a Chart Data API service using RTK Query.
 * It provides endpoints for retrieving various types of chart data.
 */

// Chart data interfaces
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface ChartDataSet {
  id: string;
  title: string;
  description?: string;
  data: DataPoint[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSeriesDataPoint extends DataPoint {
  date: string;
  timestamp: number;
}

export interface TimeSeriesChartData {
  id: string;
  title: string;
  description?: string;
  data: TimeSeriesDataPoint[];
  timeRange: {
    start: string;
    end: string;
  };
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  metadata?: Record<string, any>;
}

export interface ScatterDataPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  category?: string;
}

export interface ScatterChartData {
  id: string;
  title: string;
  description?: string;
  data: ScatterDataPoint[];
  xAxis: {
    title: string;
    min?: number;
    max?: number;
  };
  yAxis: {
    title: string;
    min?: number;
    max?: number;
  };
  metadata?: Record<string, any>;
}

export interface PieChartData {
  id: string;
  title: string;
  description?: string;
  data: DataPoint[];
  total?: number;
  metadata?: Record<string, any>;
}

// Request types
export interface ChartDataRequest {
  period?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  metric?: string;
  dimensions?: string[];
  filters?: Record<string, any>;
  limit?: number;
}

export interface TimeSeriesRequest extends ChartDataRequest {
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: string[];
  compareWithPrevious?: boolean;
}

export interface ScatterChartRequest {
  xMetric: string;
  yMetric: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

// Define the chart data API by extending the base API
export const chartDataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get bar chart data
    getBarChartData: builder.query({
      query: (params: ChartDataRequest) => ({
        url: '/charts/bar',
        method: 'GET',
        params,
      }),
      transformErrorResponse: standardizeError,
    }),
    
    // Get line chart data (time series)
    getLineChartData: builder.query({
      query: (params: TimeSeriesRequest) => ({
        url: '/charts/line',
        method: 'GET',
        params,
      }),
      transformErrorResponse: standardizeError,
    }),
    
    // Get pie chart data
    getPieChartData: builder.query({
      query: (params: ChartDataRequest) => ({
        url: '/charts/pie',
        method: 'GET',
        params,
      }),
      transformErrorResponse: standardizeError,
    }),
    
    // Get scatter chart data
    getScatterChartData: builder.query({
      query: (params: ScatterChartRequest) => ({
        url: '/charts/scatter',
        method: 'GET',
        params,
      }),
      transformErrorResponse: standardizeError,
    }),
    
    // Get metrics overview
    getMetricsOverview: builder.query({
      query: (params: { period?: string }) => ({
        url: '/charts/metrics/overview',
        method: 'GET',
        params,
      }),
      transformErrorResponse: standardizeError,
    }),
    
    // Get available metrics
    getAvailableMetrics: builder.query({
      query: () => '/charts/metrics',
      transformErrorResponse: standardizeError,
    }),
    
    // Get dashboard data
    getDashboardData: builder.query({
      query: (params: { id: string }) => `/charts/dashboards/${params.id}`,
      transformErrorResponse: standardizeError,
    }),
  }),
  overrideExisting: false,
});

// Export generated hooks
export const {
  useGetBarChartDataQuery,
  useGetLineChartDataQuery,
  useGetPieChartDataQuery,
  useGetScatterChartDataQuery,
  useGetMetricsOverviewQuery,
  useGetAvailableMetricsQuery,
  useGetDashboardDataQuery,
} = chartDataApi; 