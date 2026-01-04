import { useCallback, useState } from 'react';
import { useCustomAlert } from './useCustomAlert';

interface ErrorHandler {
  handleError: (error: any, context?: string) => void;
  clearError: () => void;
  hasError: boolean;
  error: any;
}

export const useErrorHandler = (): ErrorHandler => {
  const [error, setError] = useState<any>(null);
  const [hasError, setHasError] = useState(false);
  const { showAlert } = useCustomAlert();

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    setError(error);
    setHasError(true);

    // Determine user-friendly error message
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error?.message) {
      if (error.message.includes('Network')) {
        message = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('timeout')) {
        message = 'Request timed out. Please try again.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        message = 'Please log in again to continue.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        message = 'You don\'t have permission to perform this action.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        message = 'The requested resource was not found.';
      } else if (error.message.includes('500') || error.message.includes('Server Error')) {
        message = 'Server error. Please try again later.';
      } else if (error.message.includes('Validation')) {
        message = error.message;
      } else {
        message = error.message;
      }
    }

    // Show error alert to user
    showAlert(
      'Error',
      message,
      'error',
      [
        {
          text: 'OK',
          onPress: () => {
            setHasError(false);
            setError(null);
          }
        }
      ]
    );
  }, [showAlert]);

  const clearError = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  return {
    handleError,
    clearError,
    hasError,
    error,
  };
};
