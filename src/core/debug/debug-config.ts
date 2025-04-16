interface DebugConfig {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  features: {
    componentProfiling: boolean;
    renderTracking: boolean;
    stateTracking: boolean;
    networkLogging: boolean;
    performanceMonitoring: boolean;
  };
  breakpoints: {
    componentErrors: boolean;
    stateChanges: boolean;
    networkErrors: boolean;
  };
}

class DebugManager {
  private static instance: DebugManager;
  private config: DebugConfig;

  private constructor() {
    // Initialize with default config
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
      features: {
        componentProfiling: false,
        renderTracking: false,
        stateTracking: false,
        networkLogging: false,
        performanceMonitoring: false,
      },
      breakpoints: {
        componentErrors: false,
        stateChanges: false,
        networkErrors: false,
      },
    };

    // Load config from localStorage if available
    this.loadConfig();
  }

  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('debug_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Failed to load debug config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('debug_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save debug config:', error);
    }
  }

  public getConfig(): DebugConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public enableFeature(feature: keyof DebugConfig['features']): void {
    this.config.features[feature] = true;
    this.saveConfig();
  }

  public disableFeature(feature: keyof DebugConfig['features']): void {
    this.config.features[feature] = false;
    this.saveConfig();
  }

  public setLogLevel(level: DebugConfig['logLevel']): void {
    this.config.logLevel = level;
    this.saveConfig();
  }

  public isFeatureEnabled(feature: keyof DebugConfig['features']): boolean {
    return this.config.enabled && this.config.features[feature];
  }

  public shouldLog(level: DebugConfig['logLevel']): boolean {
    const levels: DebugConfig['logLevel'][] = ['error', 'warn', 'info', 'debug', 'trace'];
    return this.config.enabled && levels.indexOf(level) <= levels.indexOf(this.config.logLevel);
  }
}

// Export singleton instance
const debugManager = DebugManager.getInstance();

// Export helper functions
export const getDebugConfig = (): DebugConfig => debugManager.getConfig();
export const updateDebugConfig = (config: Partial<DebugConfig>): void =>
  debugManager.updateConfig(config);
export const enableDebugFeature = (feature: keyof DebugConfig['features']): void =>
  debugManager.enableFeature(feature);
export const disableDebugFeature = (feature: keyof DebugConfig['features']): void =>
  debugManager.disableFeature(feature);
export const setDebugLogLevel = (level: DebugConfig['logLevel']): void =>
  debugManager.setLogLevel(level);
export const isDebugFeatureEnabled = (feature: keyof DebugConfig['features']): boolean =>
  debugManager.isFeatureEnabled(feature);
export const shouldDebugLog = (level: DebugConfig['logLevel']): boolean =>
  debugManager.shouldLog(level);

export type { DebugConfig };
export default debugManager;
