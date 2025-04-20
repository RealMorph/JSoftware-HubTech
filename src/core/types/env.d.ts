declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'staging' | 'test';
    
    // Firebase
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
    VITE_FIREBASE_MEASUREMENT_ID: string;
    
    // Application settings
    VITE_APP_ENV: string;
    VITE_APP_VERSION: string;
    VITE_APP_URL: string;
    VITE_COMPANY_NAME: string;
    
    // Error reporting
    VITE_ENABLE_ERROR_REPORTING: string;
    VITE_SENTRY_DSN: string;
    VITE_FORCE_ERROR_REPORTING: string;
    
    // Analytics
    VITE_ENABLE_ANALYTICS: string;
    VITE_POSTHOG_API_KEY: string;
    VITE_POSTHOG_HOST: string;
    VITE_GA_MEASUREMENT_ID: string;
    
    // Feature flags
    VITE_ENABLE_FEATURE_FLAGS: string;
    VITE_GROWTHBOOK_API_HOST: string;
    VITE_GROWTHBOOK_CLIENT_KEY: string;
    
    // Other services
    VITE_STRIPE_PUBLIC_KEY: string;
    VITE_WEBSOCKET_URL: string;
    VITE_ENABLE_PERFORMANCE_MONITORING: string;
  }
} 