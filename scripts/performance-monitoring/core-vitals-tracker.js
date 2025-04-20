/**
 * Core Web Vitals Tracker
 * 
 * This script tracks Core Web Vitals and other performance metrics
 * for real user monitoring and performance optimization.
 * 
 * Features:
 * - Tracks Largest Contentful Paint (LCP)
 * - Tracks First Input Delay (FID)
 * - Tracks Cumulative Layout Shift (CLS)
 * - Tracks First Contentful Paint (FCP)
 * - Tracks Time to First Byte (TTFB)
 * - Supports analytics reporting (Google Analytics, PostHog)
 * - Provides a development overlay for real-time monitoring
 */

// Configuration
const config = {
  // Enable/disable performance tracking
  enabled: true,
  
  // Reporting options
  analytics: {
    // Report to analytics service (Google Analytics, PostHog)
    enabled: true,
    // Which analytics service to use ('ga', 'posthog', 'custom')
    service: 'ga',
    // Custom analytics endpoint (when service is 'custom')
    endpoint: '/api/performance',
    // Event category for GA events
    eventCategory: 'Web Vitals',
  },
  
  // Console logging options
  logging: {
    // Log metrics to console
    enabled: true,
    // Include debug information in logs
    verbose: false,
  },
  
  // Local storage options for metrics history
  storage: {
    // Store metrics in localStorage
    enabled: true,
    // Key to use for localStorage
    key: 'web-vitals',
    // Max entries to keep in history (per page)
    maxEntries: 50,
  },
  
  // Development overlay configuration
  overlay: {
    // Show real-time metrics overlay during development
    enabled: process.env.NODE_ENV === 'development',
    // Position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
    position: 'top-right',
  },
  
  // User sampling - only track a percentage of users
  sampling: {
    // Percentage of users to track (0-100)
    percentage: 100,
    // Consistent sampling based on user ID or session
    consistent: true,
  },
  
  // Performance budgets/thresholds
  thresholds: {
    LCP: {
      good: 2500,      // 2.5s
      needsImprovement: 4000,  // 4s
    },
    FID: {
      good: 100,       // 100ms
      needsImprovement: 300,   // 300ms
    },
    CLS: {
      good: 0.1,       // 0.1
      needsImprovement: 0.25,  // 0.25
    },
    FCP: {
      good: 1800,      // 1.8s
      needsImprovement: 3000,  // 3s
    },
    TTFB: {
      good: 800,       // 800ms
      needsImprovement: 1800,  // 1.8s
    },
  },
  
  // URLs to exclude from tracking
  excludePatterns: [
    /^\/api\//,        // API endpoints
    /^\/admin\//,      // Admin pages
    /^\/static\//,     // Static assets
    /^\/assets\//,     // Assets
    /^\/healthcheck$/  // Health check endpoint
  ],
  
  // Custom metrics to track
  customMetrics: {
    // Time to Interactive approximation
    TTI: true,
    // Application specific events
    appLoad: true,
    // First meaningful paint (deprecated but still useful)
    FMP: false,
  },
};

/**
 * Determine if the current page should be excluded from tracking
 */
function shouldExcludePage() {
  const currentPath = window.location.pathname;
  
  return config.excludePatterns.some(pattern => pattern.test(currentPath));
}

/**
 * Determine if the current user should be sampled
 */
function shouldSampleUser() {
  if (config.sampling.percentage >= 100) {
    return true;
  }
  
  if (config.sampling.percentage <= 0) {
    return false;
  }
  
  if (config.sampling.consistent) {
    // Get or generate a user ID for consistent sampling
    let userId = localStorage.getItem('perf_user_id');
    
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('perf_user_id', userId);
    }
    
    // Hash the user ID for consistent sampling
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Normalize to 0-100 range
    const normalizedHash = Math.abs(hash % 100);
    
    return normalizedHash < config.sampling.percentage;
  }
  
  // Random sampling
  return Math.random() * 100 < config.sampling.percentage;
}

/**
 * Send metrics to analytics
 */
function sendToAnalytics(metric) {
  if (!config.analytics.enabled) return;
  
  // Get the rating for the metric (good, needs improvement, poor)
  const rating = getRating(metric);
  
  // Store the metrics in localStorage if enabled
  if (config.storage.enabled) {
    const metrics = JSON.parse(localStorage.getItem(config.storage.key) || '{}');
    metrics[metric.name] = {
      value: metric.value,
      rating,
      timestamp: Date.now(),
    };
    localStorage.setItem(config.storage.key, JSON.stringify(metrics));
    
    // Also store metrics history if enabled
    const historyKey = `${config.storage.key}_history_${window.location.pathname}`;
    const metricsHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    metricsHistory.push({
      name: metric.name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
    });
    
    // Limit history size
    if (metricsHistory.length > config.storage.maxEntries) {
      metricsHistory.splice(0, metricsHistory.length - config.storage.maxEntries);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(metricsHistory));
  }
  
  // Log to console if enabled
  if (config.logging.enabled) {
    const style = `
      color: white;
      background-color: ${
        rating === 'good' ? '#0cce6b' : 
        rating === 'needs-improvement' ? '#ffa400' : '#ff4e42'
      };
      padding: 2px 5px;
      border-radius: 3px;
    `;
    
    console.log(
      `%c ${metric.name}: ${metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${rating}) `,
      style
    );
    
    if (config.logging.verbose) {
      console.log('Metric details:', metric);
    }
  }
  
  // Send to Google Analytics if configured
  if (config.analytics.service === 'ga' && typeof ga === 'function') {
    ga('send', 'event', {
      eventCategory: config.analytics.eventCategory,
      eventAction: metric.name,
      eventLabel: rating,
      eventValue: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      nonInteraction: true,
    });
  }
  
  // Send to PostHog if configured
  if (config.analytics.service === 'posthog' && typeof posthog === 'object' && posthog.capture) {
    posthog.capture('web_vital', {
      metric: metric.name,
      value: metric.value,
      rating,
      page: window.location.pathname,
    });
  }
  
  // Send to custom endpoint if configured
  if (config.analytics.service === 'custom') {
    fetch(config.analytics.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating,
        page: window.location.pathname,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink,
        } : null,
      }),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    }).catch(err => {
      // Silently catch errors - don't affect user experience
      if (config.logging.verbose) {
        console.error('Error sending metrics to custom endpoint:', err);
      }
    });
  }
  
  // Update the development overlay if enabled
  if (config.overlay.enabled) {
    updateOverlay(metric);
  }
}

/**
 * Get the rating for a metric based on thresholds
 */
function getRating(metric) {
  const threshold = config.thresholds[metric.name];
  
  if (!threshold) return 'unknown';
  
  if (metric.value <= threshold.good) {
    return 'good';
  } else if (metric.value <= threshold.needsImprovement) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Create and update the development overlay
 */
let overlayElement = null;

function updateOverlay(metric) {
  if (!config.overlay.enabled) return;
  
  // Create overlay if it doesn't exist
  if (!overlayElement) {
    overlayElement = document.createElement('div');
    overlayElement.id = 'perf-metrics-overlay';
    
    // Set styles for the overlay
    Object.assign(overlayElement.style, {
      position: 'fixed',
      zIndex: '10000',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.5',
      borderRadius: '4px',
      maxWidth: '300px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    });
    
    // Set position based on config
    switch (config.overlay.position) {
      case 'top-left':
        Object.assign(overlayElement.style, { top: '10px', left: '10px' });
        break;
      case 'top-right':
        Object.assign(overlayElement.style, { top: '10px', right: '10px' });
        break;
      case 'bottom-left':
        Object.assign(overlayElement.style, { bottom: '10px', left: '10px' });
        break;
      case 'bottom-right':
        Object.assign(overlayElement.style, { bottom: '10px', right: '10px' });
        break;
    }
    
    // Add heading
    const heading = document.createElement('div');
    heading.textContent = 'Core Web Vitals';
    Object.assign(heading.style, {
      fontWeight: 'bold',
      marginBottom: '5px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      paddingBottom: '5px',
    });
    overlayElement.appendChild(heading);
    
    // Create container for metrics
    const metricsContainer = document.createElement('div');
    metricsContainer.id = 'perf-metrics-container';
    overlayElement.appendChild(metricsContainer);
    
    // Add to document
    document.body.appendChild(overlayElement);
  }
  
  // Update metrics in the overlay
  const metricsContainer = document.getElementById('perf-metrics-container');
  if (!metricsContainer) return;
  
  // Get all metrics from localStorage
  const metrics = JSON.parse(localStorage.getItem(config.storage.key) || '{}');
  
  // Update with the new metric
  metrics[metric.name] = {
    value: metric.value,
    rating: getRating(metric),
    timestamp: Date.now(),
  };
  
  // Clear previous content
  metricsContainer.innerHTML = '';
  
  // Add each metric to the container
  for (const [name, data] of Object.entries(metrics)) {
    const metricElement = document.createElement('div');
    
    // Set color based on rating
    const color = 
      data.rating === 'good' ? '#0cce6b' : 
      data.rating === 'needs-improvement' ? '#ffa400' : '#ff4e42';
    
    metricElement.innerHTML = `
      <span style="display: inline-block; width: 40px;">${name}:</span>
      <span style="color: ${color}; font-weight: bold;">
        ${name === 'CLS' ? data.value.toFixed(3) : Math.round(data.value)}${name === 'CLS' ? '' : 'ms'}
      </span>
    `;
    
    metricsContainer.appendChild(metricElement);
  }
}

/**
 * Measure Time to Interactive (approximate)
 */
function measureTTI() {
  if (!config.customMetrics.TTI) return;
  
  // This is a simplified TTI approximation
  // For accurate TTI, you would need to use the TTI polyfill
  
  // Wait for the load event
  window.addEventListener('load', () => {
    // Wait for a stable network and CPU
    setTimeout(() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      
      if (navigationEntry) {
        // Approximate TTI as domInteractive + a small delay
        const ttiValue = navigationEntry.domInteractive + 200;
        
        // Report TTI as a custom metric
        sendToAnalytics({
          name: 'TTI',
          value: ttiValue,
        });
      }
    }, 500);
  });
}

/**
 * Measure app-specific load time
 */
function measureAppLoad() {
  if (!config.customMetrics.appLoad) return;
  
  // Create a custom performance mark for when the app is fully loaded
  // This should be called by the application when it has completed loading
  window.markAppLoaded = () => {
    if (window.performance && window.performance.mark) {
      // Mark the app loaded time
      window.performance.mark('app-loaded');
      
      // Measure from navigation start to app loaded
      window.performance.measure('app-load', 'navigationStart', 'app-loaded');
      
      const appLoadMeasure = window.performance.getEntriesByName('app-load')[0];
      
      // Report the app load time
      if (appLoadMeasure) {
        sendToAnalytics({
          name: 'AppLoad',
          value: appLoadMeasure.duration,
        });
      }
    }
  };
}

/**
 * Mark the start of components/features
 */
window.markStart = (name) => {
  if (window.performance && window.performance.mark) {
    window.performance.mark(`${name}_start`);
  }
};

/**
 * Mark the end of components/features and measure the duration
 */
window.markEnd = (name) => {
  if (window.performance && window.performance.mark) {
    const startName = `${name}_start`;
    const endName = `${name}_end`;
    
    window.performance.mark(endName);
    
    try {
      window.performance.measure(`measure_${name}`, startName, endName);
      
      const entries = window.performance.getEntriesByName(`measure_${name}`);
      if (entries.length > 0) {
        const customMetrics = JSON.parse(localStorage.getItem('custom-metrics') || '{}');
        customMetrics[`measure_${name}`] = {
          value: entries[0].duration,
          timestamp: Date.now(),
        };
        localStorage.setItem('custom-metrics', JSON.stringify(customMetrics));
      }
    } catch (e) {
      if (config.logging.verbose) {
        console.error(`Error measuring ${name}:`, e);
      }
    }
  }
};

/**
 * Initialize Core Web Vitals tracking
 */
function initCoreWebVitalsTracking() {
  if (!config.enabled) return;
  
  // Check if we should track this page
  if (shouldExcludePage()) {
    if (config.logging.verbose) {
      console.log('Performance tracking disabled for this page due to exclusion pattern');
    }
    return;
  }
  
  // Check if this user should be sampled
  if (!shouldSampleUser()) {
    if (config.logging.verbose) {
      console.log('Performance tracking disabled for this user due to sampling configuration');
    }
    return;
  }
  
  // Dynamically import the web-vitals library to avoid adding it to the main bundle
  // for users who won't be tracked
  import('web-vitals').then(({ getLCP, getFID, getCLS, getFCP, getTTFB }) => {
    // Measure LCP (Largest Contentful Paint)
    getLCP(metric => {
      // Add attribution data to enrich the metric
      if (metric.entries && metric.entries.length) {
        const lastEntry = metric.entries[metric.entries.length - 1];
        metric.element = lastEntry.element ? lastEntry.element.tagName : null;
        metric.size = lastEntry.size;
      }
      
      sendToAnalytics(metric);
    }, true);
    
    // Measure FID (First Input Delay)
    getFID(metric => {
      // Add attribution data to enrich the metric
      if (metric.entries && metric.entries.length) {
        const firstEntry = metric.entries[0];
        metric.eventType = firstEntry.name;
        metric.target = firstEntry.target ? firstEntry.target.tagName : null;
      }
      
      sendToAnalytics(metric);
    }, true);
    
    // Measure CLS (Cumulative Layout Shift)
    getCLS(metric => {
      // Add attribution data to enrich the metric
      if (metric.entries && metric.entries.length) {
        const lastEntry = metric.entries[metric.entries.length - 1];
        if (lastEntry.sources && lastEntry.sources.length) {
          const largestSource = lastEntry.sources.reduce((a, b) => {
            return a.node.clientArea > b.node.clientArea ? a : b;
          });
          
          metric.largestShiftTarget = largestSource.node ? largestSource.node.tagName : null;
        }
      }
      
      sendToAnalytics(metric);
    }, true);
    
    // Measure FCP (First Contentful Paint)
    getFCP(metric => {
      sendToAnalytics(metric);
    }, true);
    
    // Measure TTFB (Time to First Byte)
    getTTFB(metric => {
      sendToAnalytics(metric);
    });
    
    // Measure custom metrics
    measureTTI();
    measureAppLoad();
    
    if (config.logging.verbose) {
      console.log('Core Web Vitals tracking initialized');
    }
  }).catch(err => {
    if (config.logging.enabled) {
      console.error('Failed to load web-vitals library:', err);
    }
  });
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCoreWebVitalsTracking);
} else {
  initCoreWebVitalsTracking();
}

export default {
  initCoreWebVitalsTracking,
  markStart: window.markStart,
  markEnd: window.markEnd,
  markAppLoaded: window.markAppLoaded,
}; 