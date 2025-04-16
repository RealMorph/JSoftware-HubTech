import React, { useState, useEffect } from 'react';
import {
  getDebugConfig,
  updateDebugConfig,
  enableDebugFeature,
  disableDebugFeature,
  setDebugLogLevel,
  type DebugConfig,
} from './debug-config';

interface DebugPanelProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ position = 'bottom-right' }) => {
  const [config, setConfig] = useState<DebugConfig>(getDebugConfig());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update local state when config changes
    const handleConfigChange = () => {
      setConfig(getDebugConfig());
    };

    window.addEventListener('debug:configChanged', handleConfigChange);
    return () => {
      window.removeEventListener('debug:configChanged', handleConfigChange);
    };
  }, []);

  const handleFeatureToggle = (feature: keyof DebugConfig['features']) => {
    if (config.features[feature]) {
      disableDebugFeature(feature);
    } else {
      enableDebugFeature(feature);
    }
    setConfig(getDebugConfig());
  };

  const handleLogLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDebugLogLevel(event.target.value as DebugConfig['logLevel']);
    setConfig(getDebugConfig());
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
  };

  if (!config.enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        minWidth: '200px',
        maxWidth: '300px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>🐛 Debug Panel</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Log Level:
              <select
                value={config.logLevel}
                onChange={handleLogLevelChange}
                style={{
                  marginLeft: '10px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid white',
                }}
              >
                <option value="error">Error</option>
                <option value="warn">Warn</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
                <option value="trace">Trace</option>
              </select>
            </label>
          </div>

          <div>
            <h4 style={{ margin: '10px 0' }}>Features:</h4>
            {Object.entries(config.features).map(([feature, enabled]) => (
              <div key={feature} style={{ marginBottom: '5px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleFeatureToggle(feature as keyof DebugConfig['features'])}
                  />{' '}
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ margin: '10px 0' }}>Performance:</h4>
            <div style={{ fontSize: '11px' }}>
              <div>Memory: {Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024)}MB</div>
              <div>FPS: {Math.round(1000 / performance.now())}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
