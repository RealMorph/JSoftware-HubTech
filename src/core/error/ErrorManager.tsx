/**
 * Error Management Service
 * 
 * A centralized component for managing and analyzing application errors,
 * providing tools for filtering, categorizing, and viewing detailed error information.
 */
import React, { useEffect, useState } from 'react';
import errorLogger, { ErrorLog, ErrorSeverity } from './error-logger';
import { useDirectTheme } from '../theme/DirectThemeProvider';

// Error categories for organization
export enum ErrorCategory {
  UI = 'ui',
  API = 'api',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

// Categorize errors based on message or stack trace
export const categorizeError = (error: ErrorLog): ErrorCategory => {
  const { message, stack = '' } = error;
  
  // Check for API/network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('api') ||
    message.includes('http') ||
    message.includes('request') ||
    stack.includes('fetch') ||
    stack.includes('api')
  ) {
    return ErrorCategory.API;
  }
  
  // Check for authentication errors
  if (
    message.includes('auth') ||
    message.includes('login') ||
    message.includes('permission') ||
    message.includes('token') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // Check for validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('missing')
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Check for UI/React errors
  if (
    message.includes('react') ||
    message.includes('element') ||
    message.includes('component') ||
    message.includes('render') ||
    message.includes('prop') ||
    stack.includes('react')
  ) {
    return ErrorCategory.UI;
  }
  
  // Default to unknown
  return ErrorCategory.UNKNOWN;
};

// Component to display error logs with filtering
export const ErrorLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | 'all'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  const theme = useDirectTheme();
  const { getColor, getSpacing, getTypography } = theme;
  
  // Load logs on mount
  useEffect(() => {
    const loadedLogs = errorLogger.getErrorLogs();
    setLogs(loadedLogs);
  }, []);
  
  // Filter logs based on selected category and severity
  const filteredLogs = logs.filter(log => {
    const category = categorizeError(log);
    
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    
    return matchesCategory && matchesSeverity;
  });
  
  // Clear all logs
  const handleClearLogs = () => {
    errorLogger.clearErrorLogs();
    setLogs([]);
  };
  
  // Styles
  const styles = {
    container: {
      padding: getSpacing('md', '1rem'),
      backgroundColor: getColor('gray.50', '#f9fafb'),
      borderRadius: '8px',
      color: getColor('gray.900', '#111827'),
      fontFamily: getTypography('fontFamily.base', 'system-ui, sans-serif').toString(),
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getSpacing('md', '1rem'),
    },
    title: {
      fontSize: getTypography('fontSize.xl', '1.25rem'),
      fontWeight: 'bold' as const,
      margin: 0,
    },
    filters: {
      display: 'flex',
      gap: getSpacing('md', '1rem'),
      marginBottom: getSpacing('md', '1rem'),
    },
    select: {
      padding: `${getSpacing('xs', '0.25rem')} ${getSpacing('sm', '0.5rem')}`,
      borderRadius: '4px',
      border: `1px solid ${getColor('gray.300', '#d1d5db')}`,
      backgroundColor: 'white',
      fontSize: getTypography('fontSize.sm', '0.875rem'),
    },
    button: {
      padding: `${getSpacing('xs', '0.25rem')} ${getSpacing('sm', '0.5rem')}`,
      backgroundColor: getColor('red.600', '#dc2626'),
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: getTypography('fontSize.sm', '0.875rem'),
    },
    logList: {
      maxHeight: '500px',
      overflowY: 'auto' as const,
    },
    logItem: {
      padding: getSpacing('sm', '0.5rem'),
      marginBottom: getSpacing('xs', '0.25rem'),
      borderRadius: '4px',
      borderLeft: '4px solid',
      cursor: 'pointer',
      backgroundColor: 'white',
    },
    logHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: getTypography('fontSize.sm', '0.875rem'),
    },
    logDetails: {
      marginTop: getSpacing('sm', '0.5rem'),
      padding: getSpacing('sm', '0.5rem'),
      backgroundColor: getColor('gray.100', '#f3f4f6'),
      borderRadius: '4px',
      fontSize: getTypography('fontSize.xs', '0.75rem'),
      fontFamily: getTypography('fontFamily.monospace', 'monospace').toString(),
      whiteSpace: 'pre-wrap' as const,
    },
    noLogs: {
      padding: getSpacing('md', '1rem'),
      textAlign: 'center' as const,
      color: getColor('gray.500', '#6b7280'),
    },
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Error Logs</h2>
        <button style={styles.button} onClick={handleClearLogs}>Clear Logs</button>
      </div>
      
      <div style={styles.filters}>
        <div>
          <label htmlFor="category-filter">Category: </label>
          <select
            id="category-filter"
            style={styles.select}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as ErrorCategory | 'all')}
          >
            <option value="all">All Categories</option>
            {Object.values(ErrorCategory).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="severity-filter">Severity: </label>
          <select
            id="severity-filter"
            style={styles.select}
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value as ErrorSeverity | 'all')}
          >
            <option value="all">All Severities</option>
            {Object.values(ErrorSeverity).map(severity => (
              <option key={severity} value={severity}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={styles.logList}>
        {filteredLogs.length === 0 ? (
          <div style={styles.noLogs}>No error logs found</div>
        ) : (
          filteredLogs.map(log => {
            const category = categorizeError(log);
            
            // Select color based on severity
            let borderColor;
            switch (log.severity) {
              case ErrorSeverity.CRITICAL:
                borderColor = getColor('red.600', '#dc2626');
                break;
              case ErrorSeverity.ERROR:
                borderColor = getColor('red.500', '#ef4444');
                break;
              case ErrorSeverity.WARNING:
                borderColor = getColor('yellow.500', '#eab308');
                break;
              default:
                borderColor = getColor('blue.500', '#3b82f6');
            }
            
            const isExpanded = expandedLogId === log.id;
            
            return (
              <div
                key={log.id}
                style={{
                  ...styles.logItem,
                  borderLeftColor: borderColor,
                }}
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
              >
                <div style={styles.logHeader}>
                  <span>
                    <strong>{log.severity.toUpperCase()}</strong> - 
                    <span style={{ marginLeft: '8px', color: getColor('gray.700', '#374151') }}>
                      [{category}]
                    </span>
                  </span>
                  <span style={{ color: getColor('gray.500', '#6b7280') }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ marginTop: '4px' }}>{log.message}</div>
                
                {isExpanded && (
                  <div style={styles.logDetails}>
                    {log.stack && (
                      <>
                        <div style={{ fontWeight: 'bold' }}>Stack:</div>
                        <div style={{ marginBottom: '8px' }}>{log.stack}</div>
                      </>
                    )}
                    
                    {log.componentStack && (
                      <>
                        <div style={{ fontWeight: 'bold' }}>Component Stack:</div>
                        <div style={{ marginBottom: '8px' }}>{log.componentStack}</div>
                      </>
                    )}
                    
                    <div style={{ fontWeight: 'bold' }}>Context:</div>
                    <div style={{ marginBottom: '8px' }}>
                      {JSON.stringify(log.context, null, 2)}
                    </div>
                    
                    <div style={{ color: getColor('gray.500', '#6b7280') }}>
                      URL: {log.url}<br />
                      User Agent: {log.userAgent}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Debug tool to trigger test errors
export const ErrorDebugTools: React.FC = () => {
  const theme = useDirectTheme();
  const { getColor, getSpacing } = theme;
  
  const styles = {
    container: {
      padding: getSpacing('md', '1rem'),
      backgroundColor: getColor('gray.100', '#f3f4f6'),
      borderRadius: '8px',
      marginTop: getSpacing('md', '1rem'),
    },
    title: {
      fontSize: '1rem',
      fontWeight: 'bold' as const,
      marginBottom: getSpacing('sm', '0.5rem'),
    },
    buttonGroup: {
      display: 'flex',
      gap: getSpacing('sm', '0.5rem'),
      flexWrap: 'wrap' as const,
    },
    button: {
      padding: `${getSpacing('xs', '0.25rem')} ${getSpacing('sm', '0.5rem')}`,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
  };
  
  // Test error functions
  const triggerRenderError = () => {
    throw new Error('Test render error');
  };
  
  const triggerAsyncError = () => {
    setTimeout(() => {
      throw new Error('Test async error');
    }, 100);
  };
  
  const triggerNetworkError = () => {
    errorLogger.logError('Network request failed', {
      severity: ErrorSeverity.ERROR,
      context: {
        url: 'https://api.example.com/data',
        method: 'GET',
        status: 500,
      },
    });
  };
  
  const triggerValidationError = () => {
    errorLogger.logError('Validation failed: Required field missing', {
      severity: ErrorSeverity.WARNING,
      context: {
        field: 'email',
        form: 'registration',
        validations: ['required', 'email'],
      },
    });
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.title}>Error Debug Tools</div>
      <div style={styles.buttonGroup}>
        <button
          style={{ ...styles.button, backgroundColor: getColor('red.500', '#ef4444'), color: 'white' }}
          onClick={triggerRenderError}
        >
          Trigger Render Error
        </button>
        
        <button
          style={{ ...styles.button, backgroundColor: getColor('orange.500', '#f97316'), color: 'white' }}
          onClick={triggerAsyncError}
        >
          Trigger Async Error
        </button>
        
        <button
          style={{ ...styles.button, backgroundColor: getColor('yellow.500', '#eab308'), color: 'black' }}
          onClick={triggerNetworkError}
        >
          Log Network Error
        </button>
        
        <button
          style={{ ...styles.button, backgroundColor: getColor('blue.500', '#3b82f6'), color: 'white' }}
          onClick={triggerValidationError}
        >
          Log Validation Error
        </button>
      </div>
    </div>
  );
};

// A complete error management dashboard
export const ErrorManagementDashboard: React.FC = () => {
  return (
    <div>
      <ErrorLogViewer />
      <ErrorDebugTools />
    </div>
  );
}; 