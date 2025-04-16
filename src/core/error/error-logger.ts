interface ErrorLogData {
  error: Error;
  errorInfo?: {
    componentStack?: string;
    [key: string]: any;
  };
  context?: Record<string, any>;
  severity?: 'error' | 'warning' | 'info';
  tags?: string[];
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private isDebugMode: boolean;

  private constructor() {
    this.isDebugMode = process.env.NODE_ENV === 'development';
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(message: string, data: ErrorLogData): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      ...data,
      error: {
        name: data.error.name,
        message: data.error.message,
        stack: data.error.stack,
      },
    };

    // Always log to console in development
    if (this.isDebugMode) {
      console.error('[Error]', logEntry);
      if (data.errorInfo?.componentStack) {
        console.error('Component Stack:', data.errorInfo.componentStack);
      }
    }

    // In production, we could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement production error reporting
      // e.g., send to Sentry, LogRocket, etc.
    }

    // Emit custom event for error monitoring
    const errorEvent = new CustomEvent('app:error', {
      detail: {
        type: 'error',
        timestamp,
        message,
        error: data.error,
      },
    });
    window.dispatchEvent(errorEvent);
  }

  public enableDebugMode(): void {
    this.isDebugMode = true;
  }

  public disableDebugMode(): void {
    this.isDebugMode = false;
  }
}

// Export singleton instance
const errorLogger = ErrorLogger.getInstance();

// Export helper functions
export const logError = (message: string, data: ErrorLogData): void => {
  errorLogger.logError(message, data);
};

export const enableDebugMode = (): void => {
  errorLogger.enableDebugMode();
};

export const disableDebugMode = (): void => {
  errorLogger.disableDebugMode();
};

export default errorLogger;
