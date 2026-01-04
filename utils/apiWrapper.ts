import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SafeApiOptions {
  showErrorAlert?: boolean;
  context?: string;
  fallbackValue?: any;
  retryAttempts?: number;
  retryDelay?: number;
}

export class SafeApiWrapper {
  private errorHandler: ReturnType<typeof useErrorHandler>;

  constructor(errorHandler: ReturnType<typeof useErrorHandler>) {
    this.errorHandler = errorHandler;
  }

  async call<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options: SafeApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      showErrorAlert = true,
      context = 'API call',
      fallbackValue = null,
      retryAttempts = 0,
      retryDelay = 1000
    } = options;

    let lastError: any = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const result = await apiCall();
        
        // If the API call succeeded but returned an error response
        if (!result.success && result.error) {
          throw new Error(result.error);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.error(`API call failed (attempt ${attempt + 1}/${retryAttempts + 1}):`, error);
        
        // If this is not the last attempt, wait before retrying
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // If we've exhausted all retry attempts, handle the error
        if (showErrorAlert) {
          this.errorHandler.handleError(error, context);
        }
        
        return {
          success: false,
          error: (error as Error)?.message || 'An unexpected error occurred',
          data: fallbackValue
        };
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: (lastError as Error)?.message || 'An unexpected error occurred',
      data: fallbackValue
    };
  }

  // Convenience method for API calls that should not show error alerts
  async callSilent<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    context?: string,
    fallbackValue?: any
  ): Promise<ApiResponse<T>> {
    return this.call(apiCall, {
      showErrorAlert: false,
      context,
      fallbackValue
    });
  }

  // Convenience method for API calls with retry logic
  async callWithRetry<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    context?: string,
    retryAttempts: number = 2,
    fallbackValue?: any
  ): Promise<ApiResponse<T>> {
    return this.call(apiCall, {
      context,
      retryAttempts,
      fallbackValue
    });
  }
}

// Utility function to create a safe API wrapper
export const createSafeApiWrapper = (errorHandler: ReturnType<typeof useErrorHandler>) => {
  return new SafeApiWrapper(errorHandler);
};
