# Error Handling Guide

This guide outlines the comprehensive error handling system implemented in the Link Up app to prevent crashes and provide a better user experience.

## 🛡️ Error Handling Architecture

### 1. Global Error Boundary
- **Location**: `components/ErrorBoundary.tsx`
- **Purpose**: Catches JavaScript errors anywhere in the component tree
- **Features**:
  - Graceful error UI with retry functionality
  - Debug information in development mode
  - Prevents app crashes from unhandled errors

### 2. Error Handler Hook
- **Location**: `hooks/useErrorHandler.ts`
- **Purpose**: Centralized error handling with user-friendly messages
- **Features**:
  - Automatic error categorization
  - User-friendly error messages
  - Custom alert integration

### 3. Safe API Wrapper
- **Location**: `utils/apiWrapper.ts`
- **Purpose**: Wraps API calls with error handling and retry logic
- **Features**:
  - Automatic retry on network failures
  - Silent error handling for background operations
  - Consistent error response format

## 🔧 Implementation

### Basic Error Handling in Components

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function MyComponent() {
  const errorHandler = useErrorHandler();
  
  const handleApiCall = async () => {
    try {
      const result = await someApiCall();
      // Handle success
    } catch (error) {
      errorHandler.handleError(error, 'API call context');
    }
  };
}
```

### Using Safe API Wrapper

```typescript
import { createSafeApiWrapper } from '@/utils/apiWrapper';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function MyComponent() {
  const errorHandler = useErrorHandler();
  const safeApi = createSafeApiWrapper(errorHandler);
  
  const handleApiCall = async () => {
    const result = await safeApi.call(
      () => someApiCall(),
      {
        context: 'Loading data',
        retryAttempts: 2,
        showErrorAlert: true
      }
    );
    
    if (result.success) {
      // Handle success
    }
  };
}
```

## 📱 Error Types and Handling

### 1. Network Errors
- **Detection**: Network timeouts, connection failures
- **User Message**: "Network error. Please check your connection and try again."
- **Action**: Automatic retry with exponential backoff

### 2. Authentication Errors
- **Detection**: 401 Unauthorized, token expiration
- **User Message**: "Please log in again to continue."
- **Action**: Redirect to login screen

### 3. Permission Errors
- **Detection**: 403 Forbidden
- **User Message**: "You don't have permission to perform this action."
- **Action**: Show appropriate UI state

### 4. Validation Errors
- **Detection**: 400 Bad Request with validation details
- **User Message**: Specific validation error message
- **Action**: Highlight form fields with errors

### 5. Server Errors
- **Detection**: 500 Internal Server Error
- **User Message**: "Server error. Please try again later."
- **Action**: Log error for debugging, show retry option

## 🎯 Best Practices

### 1. Always Use Try-Catch
```typescript
// ❌ Bad
const handleClick = async () => {
  const result = await apiCall();
  // No error handling
};

// ✅ Good
const handleClick = async () => {
  try {
    const result = await apiCall();
    // Handle success
  } catch (error) {
    errorHandler.handleError(error, 'Button click');
  }
};
```

### 2. Provide Context
```typescript
// ❌ Bad
errorHandler.handleError(error);

// ✅ Good
errorHandler.handleError(error, 'Creating activity');
```

### 3. Handle Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleApiCall = async () => {
  try {
    setLoading(true);
    const result = await apiCall();
    // Handle success
  } catch (error) {
    errorHandler.handleError(error, 'API call');
  } finally {
    setLoading(false);
  }
};
```

### 4. Use Error Boundaries for Component Trees
```typescript
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## 🧪 Testing Error Scenarios

### 1. Network Failures
- Disable network connection
- Test offline functionality
- Verify retry mechanisms

### 2. API Errors
- Test with invalid credentials
- Test with expired tokens
- Test with server errors

### 3. Component Errors
- Test with invalid props
- Test with missing data
- Test with malformed responses

## 📊 Error Monitoring

### Development Mode
- Console error logging
- Debug information in error UI
- Stack traces for debugging

### Production Mode
- User-friendly error messages
- No sensitive information exposed
- Graceful degradation

## 🔄 Error Recovery

### 1. Automatic Recovery
- Network retry with backoff
- Token refresh for auth errors
- Fallback data loading

### 2. User-Initiated Recovery
- Retry buttons in error UI
- Refresh functionality
- Manual retry options

### 3. Graceful Degradation
- Show cached data when possible
- Disable features that require network
- Provide offline alternatives

## 📝 Error Logging

### What to Log
- Error messages and stack traces
- User actions that led to errors
- Network conditions
- Device information

### What NOT to Log
- Sensitive user data
- Passwords or tokens
- Personal information

## 🚀 Future Improvements

1. **Error Analytics**: Track error patterns and frequency
2. **Automatic Error Reporting**: Send errors to monitoring service
3. **User Feedback**: Allow users to report errors
4. **Error Prevention**: Proactive error detection and prevention

## 📚 Related Files

- `components/ErrorBoundary.tsx` - Global error boundary
- `hooks/useErrorHandler.ts` - Error handling hook
- `utils/apiWrapper.ts` - Safe API wrapper
- `utils/safeApi.ts` - Additional safe API utilities
- `components/CustomAlert.tsx` - Error alert component

## 🎯 Key Takeaways

1. **Always handle errors gracefully**
2. **Provide meaningful feedback to users**
3. **Use error boundaries for component isolation**
4. **Implement retry logic for transient failures**
5. **Log errors appropriately for debugging**
6. **Test error scenarios thoroughly**
7. **Plan for graceful degradation**
