import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import { useDevTools } from './DevToolsProvider';

/**
 * Performance metric type
 */
interface PerformanceMetric {
  type: string;
  name: string;
  duration: number;
  timestamp: number;
  id: string;
}

interface GroupedMetrics {
  [key: string]: {
    count: number;
    totalDuration: number;
    avgDuration: number;
    maxDuration: number;
    lastTimestamp: number;
    samples: PerformanceMetric[];
  };
}

/**
 * Custom PerformanceEntry interface for component performance
 */
interface ComponentPerformanceEntry {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

/**
 * Properties for DevPerformanceMonitor
 */
interface DevPerformanceMonitorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  refreshInterval?: number;
  recordingActive?: boolean;
  maxEntries?: number;
}

/**
 * DevPerformanceMonitor component
 * 
 * A tool for monitoring and visualizing real-time performance metrics
 */
export const DevPerformanceMonitor: React.FC<DevPerformanceMonitorProps> = ({
  position = 'top-right',
  refreshInterval = 1000,
  recordingActive = false,
  maxEntries = 20
}) => {
  const { config, isEnabled } = useDevTools();
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [history, setHistory] = useState<{ [key: string]: number[] }>({});
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'avg' | 'max' | 'total'>('avg');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hoverMetric, setHoverMetric] = useState<string | null>(null);
  const [perfEntries, setPerfEntries] = useState<ComponentPerformanceEntry[]>([]);
  const [entriesLimit, setEntriesLimit] = useState<number>(maxEntries);
  const observerRef = useRef<PerformanceObserver | null>(null);
  
  // Position styles for the monitor panel
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
  };
  
  // Check if monitoring is enabled from config directly
  const monitoringEnabled = config.performanceMonitoring === true;
  
  // Group metrics by name
  const groupedMetrics = useMemo(() => {
    const grouped: GroupedMetrics = {};
    
    metrics.forEach(metric => {
      const key = `${metric.type}_${metric.name}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          maxDuration: 0,
          lastTimestamp: 0,
          samples: []
        };
      }
      
      const group = grouped[key];
      group.count++;
      group.totalDuration += metric.duration;
      group.avgDuration = group.totalDuration / group.count;
      group.maxDuration = Math.max(group.maxDuration, metric.duration);
      group.lastTimestamp = Math.max(group.lastTimestamp, metric.timestamp);
      
      // Keep only the last 10 samples for each metric
      if (group.samples.length >= 10) {
        group.samples.shift();
      }
      group.samples.push(metric);
    });
    
    return grouped;
  }, [metrics]);
  
  // Update entriesLimit when maxEntries prop changes
  useEffect(() => {
    setEntriesLimit(maxEntries);
  }, [maxEntries]);
  
  // Sorted and filtered metrics for display
  const sortedMetrics = useMemo(() => {
    const result = Object.entries(groupedMetrics)
      .filter(([key]) => !filterType || key.startsWith(filterType))
      .sort(([keyA, metricsA], [keyB, metricsB]) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = keyA.localeCompare(keyB);
            break;
          case 'count':
            comparison = metricsA.count - metricsB.count;
            break;
          case 'avg':
            comparison = metricsA.avgDuration - metricsB.avgDuration;
            break;
          case 'max':
            comparison = metricsA.maxDuration - metricsB.maxDuration;
            break;
          case 'total':
            comparison = metricsA.totalDuration - metricsB.totalDuration;
            break;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    
    return result;
  }, [groupedMetrics, filterType, sortBy, sortDirection]);
  
  // Observer for performance entries
  useEffect(() => {
    if (!monitoringEnabled || !recordingActive) return;
    
    // Performance observer to watch for measure and paint events
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      setMetrics(prev => {
        const newMetrics = [...prev];
        
        entries.forEach(entry => {
          newMetrics.push({
            type: entry.entryType,
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime,
            id: `${entry.name}_${entry.startTime}`
          });
        });
        
        // Limit the number of entries to prevent memory issues
        while (newMetrics.length > entriesLimit) {
          newMetrics.shift();
        }
        
        return newMetrics;
      });
    });
    
    // Observe various performance metrics
    observer.observe({ entryTypes: ['measure', 'paint', 'resource', 'navigation', 'longtask'] });
    
    return () => {
      observer.disconnect();
    };
  }, [monitoringEnabled, recordingActive, entriesLimit]);
  
  // Monitor React renders
  useEffect(() => {
    if (!recordingActive) return;
    
    // Check if React DevTools hook exists before accessing it
    // Using type assertion since the type is defined in global.d.ts
    const reactDevTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!reactDevTools) return;
    
    // Store original hook to restore on cleanup
    const originalOnCommitFiberRoot = reactDevTools.onCommitFiberRoot;
    
    if (originalOnCommitFiberRoot) {
      reactDevTools.onCommitFiberRoot = (...args: any[]) => {
        const result = originalOnCommitFiberRoot.apply(reactDevTools, args);
        
        // Mark the render in performance
        const markName = `react-render-${Date.now()}`;
        performance.mark(markName);
        performance.measure('React Render', markName);
        performance.clearMarks(markName);
        
        return result;
      };
    }
    
    return () => {
      if (reactDevTools && originalOnCommitFiberRoot) {
        reactDevTools.onCommitFiberRoot = originalOnCommitFiberRoot;
      }
    };
  }, [recordingActive]);
  
  // Add some manual markers for important events
  useEffect(() => {
    if (!monitoringEnabled) return;
    
    // Mark the initial load time
    performance.mark('app-init');
    performance.measure('App Initialization', 'navigationStart', 'app-init');
    
    // Monitor route changes
    const handleRouteChange = () => {
      performance.mark('route-change');
      performance.measure('Route Change', 'route-change');
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [monitoringEnabled]);
  
  // Component performance monitoring
  useEffect(() => {
    if (!recordingActive) return;
    
    // Only initialize performance monitoring if it's active
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Clear previous observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      try {
        // Create a new performance observer
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
            .filter(entry => entry.entryType === 'measure' && entry.name.startsWith('Component:'))
            .map(entry => ({
              componentName: entry.name.replace('Component:', ''),
              renderTime: entry.duration,
              timestamp: entry.startTime
            }));
            
          if (entries.length > 0) {
            setPerfEntries(prev => {
              const newEntries = [...prev, ...entries];
              // Limit the number of entries
              return newEntries.slice(-entriesLimit);
            });
          }
        });
        
        // Observe render measurements
        observer.observe({ entryTypes: ['measure'] });
        observerRef.current = observer;
        
        // Setup the monitoring pattern by patching React's component lifecycle
        // Note: In a real implementation, this would use React DevTools or a custom babel plugin
        // This is a simplified example for demonstration purposes
        console.log('Performance monitoring initialized');
        
        return () => {
          observer.disconnect();
          observerRef.current = null;
        };
      } catch (error) {
        console.error('Error setting up performance monitoring:', error);
      }
    }
  }, [recordingActive, entriesLimit]);
  
  // Don't render anything if monitoring is disabled
  if (!monitoringEnabled) {
    return null;
  }
  
  // Handle sorting change
  const handleSortChange = (newSortBy: 'name' | 'count' | 'avg' | 'max' | 'total') => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };
  
  // Clear all metrics
  const handleClearMetrics = () => {
    setMetrics([]);
    performance.clearMarks();
    performance.clearMeasures();
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    // This function is currently unused
    console.log('Toggle recording state');
  };
  
  const clearEntries = () => {
    setPerfEntries([]);
  };
  
  return (
    <MonitorPanel style={positionStyles[position]}>
      <MonitorHeader onClick={() => setIsExpanded(!isExpanded)}>
        <span>📊 Performance Monitor</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </MonitorHeader>
      
      {isExpanded && (
        <MonitorContent>
          <FilterBar>
            <FilterGroup>
              <FilterLabel>Filter:</FilterLabel>
              <FilterSelect 
                value={filterType || ''}
                onChange={(e) => setFilterType(e.target.value || null)}
              >
                <option value="">All Types</option>
                <option value="measure">Measures</option>
                <option value="paint">Paint</option>
                <option value="react-render">React Renders</option>
                <option value="resource">Resources</option>
                <option value="navigation">Navigation</option>
                <option value="longtask">Long Tasks</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Max Entries:</FilterLabel>
              <FilterSelect 
                value={entriesLimit}
                onChange={(e) => setEntriesLimit(Number(e.target.value))}
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </FilterSelect>
            </FilterGroup>
          </FilterBar>
          
          <MetricsTable>
            <thead>
              <tr>
                <TableHeader 
                  isActive={sortBy === 'name'}
                  isAsc={sortBy === 'name' && sortDirection === 'asc'}
                  onClick={() => handleSortChange('name')}
                >
                  Name
                </TableHeader>
                <TableHeader 
                  isActive={sortBy === 'count'}
                  isAsc={sortBy === 'count' && sortDirection === 'asc'}
                  onClick={() => handleSortChange('count')}
                >
                  Count
                </TableHeader>
                <TableHeader 
                  isActive={sortBy === 'avg'}
                  isAsc={sortBy === 'avg' && sortDirection === 'asc'}
                  onClick={() => handleSortChange('avg')}
                >
                  Avg (ms)
                </TableHeader>
                <TableHeader 
                  isActive={sortBy === 'max'}
                  isAsc={sortBy === 'max' && sortDirection === 'asc'}
                  onClick={() => handleSortChange('max')}
                >
                  Max (ms)
                </TableHeader>
                <TableHeader 
                  isActive={sortBy === 'total'}
                  isAsc={sortBy === 'total' && sortDirection === 'asc'}
                  onClick={() => handleSortChange('total')}
                >
                  Total (ms)
                </TableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState>
                      No metrics recorded yet. Interact with the app to generate performance data.
                    </EmptyState>
                  </td>
                </tr>
              ) : (
                sortedMetrics.map(([key, metric]) => (
                  <TableRow 
                    key={key}
                    onMouseEnter={() => setHoverMetric(key)}
                    onMouseLeave={() => setHoverMetric(null)}
                    isHovered={hoverMetric === key}
                  >
                    <td>
                      <MetricName>
                        <MetricType>{key.split('_')[0]}</MetricType>
                        {key.split('_').slice(1).join('_')}
                      </MetricName>
                    </td>
                    <td>{metric.count}</td>
                    <td>{metric.avgDuration.toFixed(2)}</td>
                    <td>{metric.maxDuration.toFixed(2)}</td>
                    <td>{metric.totalDuration.toFixed(2)}</td>
                  </TableRow>
                ))
              )}
            </tbody>
          </MetricsTable>
          
          {hoverMetric && groupedMetrics[hoverMetric] && (
            <MetricDetails>
              <DetailHeader>Recent Samples for: {hoverMetric}</DetailHeader>
              <SamplesTable>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Duration (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedMetrics[hoverMetric].samples.map((sample) => (
                    <tr key={sample.id}>
                      <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                      <td>{sample.duration.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </SamplesTable>
            </MetricDetails>
          )}
          
          <PerformanceButtons>
            <PerformanceButton
              onClick={() => {
                performance.mark('dev-test-start');
                setTimeout(() => {
                  performance.mark('dev-test-end');
                  performance.measure('dev-test', 'dev-test-start', 'dev-test-end');
                  alert('Performance entry added to Performance tab');
                }, 500);
              }}
            >
              Add Test Marker
            </PerformanceButton>
            
            <PerformanceButton
              onClick={() => {
                performance.clearMarks();
                performance.clearMeasures();
                alert('Performance marks cleared');
              }}
            >
              Clear Marks
            </PerformanceButton>
          </PerformanceButtons>
          
          <PerformanceTip>
            💡 Open Chrome DevTools Performance tab for detailed analysis
          </PerformanceTip>
          
          <ComponentPerformanceTable>
            <HeaderRow>
              <div>Component Performance</div>
              <ClearButton onClick={clearEntries}>Clear</ClearButton>
            </HeaderRow>
            
            {perfEntries.length === 0 ? (
              <div>No performance data recorded yet.</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Component</TableHeader>
                    <TableHeader>Render Time</TableHeader>
                    <TableHeader>Time</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {perfEntries.map((entry, index) => (
                    <Row key={index} isSlowRender={entry.renderTime > 16.67}>
                      <TableCell>{entry.componentName}</TableCell>
                      <TableCell>{entry.renderTime.toFixed(2)}ms</TableCell>
                      <TableCell>{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
                    </Row>
                  ))}
                </tbody>
              </Table>
            )}
            
            <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.7 }}>
              Note: Render times above 16.67ms (60fps) are highlighted in red.
            </div>
          </ComponentPerformanceTable>
        </MonitorContent>
      )}
    </MonitorPanel>
  );
};

// Styled components
const MonitorPanel = styled.div`
  position: fixed;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 250px;
  max-width: 350px;
  font-family: monospace;
  font-size: 12px;
  backdrop-filter: blur(10px);
`;

const MonitorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const MonitorContent = styled.div`
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
`;

const FilterBar = styled.div`
  display: flex;
  margin-bottom: 16px;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  color: #4a5568;
`;

const FilterSelect = styled.select`
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #4a5568;
`;

const MetricsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const TableHeader = styled.th<{ isActive?: boolean; isAsc?: boolean }>`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
  color: ${props => props.isActive ? '#4a90e2' : '#4a5568'};
  position: relative;
  
  &:after {
    content: '${props => props.isActive ? (props.isAsc ? '▲' : '▼') : ''}';
    position: absolute;
    margin-left: 4px;
  }
  
  &:hover {
    color: #4a90e2;
  }
`;

const TableRow = styled.tr<{ isHovered: boolean }>`
  background-color: ${props => props.isHovered ? '#f7fafc' : 'transparent'};
  border-bottom: 1px solid #e2e8f0;
  
  td {
    padding: 8px 12px;
  }
  
  &:hover {
    background-color: #f7fafc;
  }
`;

const MetricName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricType = styled.span`
  font-size: 11px;
  background-color: #edf2f7;
  color: #4a5568;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MetricDetails = styled.div`
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
`;

const DetailHeader = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #4a5568;
`;

const SamplesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  
  th {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    color: #4a5568;
  }
  
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const PerformanceButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`;

const PerformanceButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background-color: #444;
  }
`;

const PerformanceTip = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 15px;
  font-style: italic;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #4a5568;
  font-style: italic;
`;

const ComponentPerformanceTable = styled.div`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 16px;
  font-family: monospace;
  font-size: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableCell = styled.td`
  padding: 4px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const Row = styled.tr<{ isSlowRender: boolean }>`
  background-color: ${({ isSlowRender }) => isSlowRender ? 'rgba(255, 0, 0, 0.05)' : 'transparent'};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ClearButton = styled.button`
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

// Custom performance entry interface for internal use
interface CustomPerformanceEntry {
  entryType: string;
  name: string;
  startTime: number;
  duration: number;
} 