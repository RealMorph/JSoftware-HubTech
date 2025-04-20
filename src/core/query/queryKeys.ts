/**
 * Query Keys for React Query
 * This file contains all the query keys used throughout the application.
 * Using this structure helps maintain consistency and avoid key collisions.
 */

export const queryKeys = {
  // User related queries
  users: {
    all: ['users'] as const,
    details: (userId: string) => ['users', userId] as const,
    profile: (userId: string) => ['users', userId, 'profile'] as const,
    settings: (userId: string) => ['users', userId, 'settings'] as const,
    roles: (userId: string) => ['users', userId, 'roles'] as const
  },
  
  // Authentication related queries
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
    session: ['auth', 'session'] as const
  },
  
  // Contact related queries
  contacts: {
    all: ['contacts'] as const,
    details: (contactId: string) => ['contacts', contactId] as const,
    byUser: (userId: string) => ['contacts', 'user', userId] as const,
    stats: ['contacts', 'stats'] as const
  },
  
  // Deal related queries
  deals: {
    all: ['deals'] as const,
    details: (dealId: string) => ['deals', dealId] as const,
    byUser: (userId: string) => ['deals', 'user', userId] as const,
    byContact: (contactId: string) => ['deals', 'contact', contactId] as const,
    stats: ['deals', 'stats'] as const
  },
  
  // Activity related queries
  activities: {
    all: ['activities'] as const,
    byUser: (userId: string) => ['activities', 'user', userId] as const,
    recent: (limit: number) => ['activities', 'recent', limit] as const
  },
  
  // Settings related queries
  settings: {
    app: ['settings', 'app'] as const,
    user: (userId: string) => ['settings', 'user', userId] as const
  },
  
  // Payment related queries
  payments: {
    subscriptions: (userId: string) => ['payments', 'subscriptions', userId] as const,
    paymentMethods: (userId: string) => ['payments', 'methods', userId] as const,
    invoices: (userId: string) => ['payments', 'invoices', userId] as const
  },
  
  // Chart data related queries
  charts: {
    // Bar chart data
    barChart: {
      all: ['charts', 'barChart'] as const,
      byId: (chartId: string) => ['charts', 'barChart', chartId] as const,
      byPeriod: (period: string) => ['charts', 'barChart', 'period', period] as const,
      byMetric: (metric: string) => ['charts', 'barChart', 'metric', metric] as const,
      byCategory: (category: string) => ['charts', 'barChart', 'category', category] as const,
      custom: (params: Record<string, any>) => ['charts', 'barChart', 'custom', params] as const
    },
    
    // Line chart data
    lineChart: {
      all: ['charts', 'lineChart'] as const,
      byId: (chartId: string) => ['charts', 'lineChart', chartId] as const,
      timeSeries: (period: string, interval: string) => ['charts', 'lineChart', 'timeSeries', period, interval] as const,
      byMetric: (metric: string) => ['charts', 'lineChart', 'metric', metric] as const,
      comparison: (metrics: string[], period: string) => ['charts', 'lineChart', 'comparison', metrics, period] as const,
      trend: (metric: string, period: string) => ['charts', 'lineChart', 'trend', metric, period] as const
    },
    
    // Pie chart data
    pieChart: {
      all: ['charts', 'pieChart'] as const,
      byId: (chartId: string) => ['charts', 'pieChart', chartId] as const,
      byCategory: (category: string) => ['charts', 'pieChart', 'category', category] as const,
      distribution: (metric: string) => ['charts', 'pieChart', 'distribution', metric] as const
    },
    
    // Scatter chart data
    scatterChart: {
      all: ['charts', 'scatterChart'] as const,
      byId: (chartId: string) => ['charts', 'scatterChart', chartId] as const,
      correlation: (xMetric: string, yMetric: string) => ['charts', 'scatterChart', 'correlation', xMetric, yMetric] as const,
      byDimensions: (dimensions: string[]) => ['charts', 'scatterChart', 'dimensions', dimensions] as const
    },
    
    // General chart data
    metrics: {
      all: ['charts', 'metrics'] as const,
      byId: (metricId: string) => ['charts', 'metrics', metricId] as const,
      byCategory: (category: string) => ['charts', 'metrics', 'category', category] as const
    },
    
    // Dashboard related queries
    dashboards: {
      all: ['charts', 'dashboards'] as const,
      byId: (dashboardId: string) => ['charts', 'dashboards', dashboardId] as const,
      byUser: (userId: string) => ['charts', 'dashboards', 'user', userId] as const,
      widgets: (dashboardId: string) => ['charts', 'dashboards', dashboardId, 'widgets'] as const
    }
  }
};

/**
 * Helper function to create custom query keys
 * @param scope - The top-level scope (e.g., 'custom-entity')
 * @returns An object with methods to create query keys in this scope
 */
export function createQueryKeys(scope: string) {
  return {
    all: [scope] as const,
    details: (id: string) => [scope, id] as const,
    lists: (...args: unknown[]) => [scope, 'list', ...args] as const,
    infiniteLists: (...args: unknown[]) => [scope, 'infinite', ...args] as const
  };
} 