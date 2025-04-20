import { GrowthBook, GrowthBookProvider, Experiment } from '@growthbook/growthbook-react';

// Feature flag configuration
export interface FeatureFlagConfig {
  apiHost: string;
  clientKey: string;
  enableDevMode?: boolean;
  trackingCallback?: (
    experiment: Experiment<any>,
    result: {
      variationId: number;
      value: any;
    }
  ) => void;
}

// Default config for local development
export const defaultConfig: FeatureFlagConfig = {
  apiHost: process.env.REACT_APP_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: process.env.REACT_APP_GROWTHBOOK_CLIENT_KEY || 'sdk-dummy-key',
  enableDevMode: process.env.NODE_ENV !== 'production',
  trackingCallback: (experiment, result) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Experiment: ${experiment.key}`, result);
    }
    // In production, you would send this to your analytics tool
  },
};

// Feature flag service
export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private growthbook: GrowthBook;
  private config: FeatureFlagConfig;
  
  private constructor(config: FeatureFlagConfig = defaultConfig) {
    this.config = config;
    
    // Initialize GrowthBook instance
    this.growthbook = new GrowthBook({
      apiHost: this.config.apiHost,
      clientKey: this.config.clientKey,
      enableDevMode: this.config.enableDevMode,
      subscribeToChanges: true,
      trackingCallback: this.config.trackingCallback,
    });
  }
  
  // Get singleton instance
  public static getInstance(config?: FeatureFlagConfig): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService(config);
    }
    return FeatureFlagService.instance;
  }
  
  // Get GrowthBook instance
  public getGrowthBook(): GrowthBook {
    return this.growthbook;
  }
  
  // Initialize the service
  public async init(): Promise<void> {
    try {
      // Load features from API
      await this.growthbook.loadFeatures();
      
      // Set default attributes
      this.growthbook.setAttributes({
        id: this.getUserId(),
        environment: process.env.NODE_ENV || 'development',
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
      });
      
      console.log('GrowthBook initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GrowthBook:', error);
    }
  }
  
  // Update user attributes
  public setAttributes(attributes: Record<string, any>): void {
    this.growthbook.setAttributes({
      ...this.growthbook.getAttributes(),
      ...attributes,
    });
  }
  
  // Check if a feature is enabled
  public isFeatureEnabled(featureKey: string): boolean {
    return this.growthbook.isOn(featureKey);
  }
  
  // Get feature value with a default fallback
  public getFeatureValue<T>(featureKey: string, defaultValue: T): unknown {
    return this.growthbook.getFeatureValue(featureKey, defaultValue);
  }
  
  // Get a unique user ID (or generate one)
  private getUserId(): string {
    let userId = localStorage.getItem('user_id');
    
    if (!userId) {
      userId = this.generateUniqueId();
      localStorage.setItem('user_id', userId);
    }
    
    return userId;
  }
  
  // Generate a simple unique ID
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // Detect device type
  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }
    
    return 'desktop';
  }
  
  // Detect browser
  private getBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('chrome') > -1) return 'chrome';
    if (userAgent.indexOf('firefox') > -1) return 'firefox';
    if (userAgent.indexOf('safari') > -1) return 'safari';
    if (userAgent.indexOf('edge') > -1) return 'edge';
    if (userAgent.indexOf('msie') > -1 || userAgent.indexOf('trident') > -1) return 'ie';
    
    return 'unknown';
  }
} 