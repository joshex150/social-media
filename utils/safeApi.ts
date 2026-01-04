import { useErrorHandler } from '@/hooks/useErrorHandler';

interface SafeApiOptions {
  showErrorAlert?: boolean;
  context?: string;
  fallbackValue?: any;
}

export const createSafeApiCall = (errorHandler: ReturnType<typeof useErrorHandler>) => {
  return async <T>(
    apiCall: () => Promise<T>,
    options: SafeApiOptions = {}
  ): Promise<T | null> => {
    const {
      showErrorAlert = true,
      context = 'API call',
      fallbackValue = null
    } = options;

    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error(`Safe API call failed in ${context}:`, error);
      
      if (showErrorAlert) {
        errorHandler.handleError(error, context);
      }
      
      return fallbackValue;
    }
  };
};

// Utility function for handling async operations safely
export const safeAsync = async <T>(
  asyncOperation: () => Promise<T>,
  errorHandler: ReturnType<typeof useErrorHandler>,
  context?: string,
  fallbackValue?: T
): Promise<T | null> => {
  try {
    return await asyncOperation();
  } catch (error) {
    errorHandler.handleError(error, context);
    return fallbackValue || null;
  }
};

// Utility function for handling sync operations safely
export const safeSync = <T>(
  syncOperation: () => T,
  errorHandler: ReturnType<typeof useErrorHandler>,
  context?: string,
  fallbackValue?: T
): T | null => {
  try {
    return syncOperation();
  } catch (error) {
    errorHandler.handleError(error, context);
    return fallbackValue || null;
  }
};
