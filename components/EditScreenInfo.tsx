import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - will be themed by wrapper
      return (
        <ThemedErrorUI 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Themed error UI component
const ThemedErrorUI = ({ error, errorInfo, onRetry }: { error: Error | null; errorInfo: any; onRetry: () => void }) => {
  // Fallback colors in case theme context is not available
  const fallbackColors = {
    background: '#ffffff',
    foreground: '#000000',
    muted: '#666666',
    surface: '#f5f5f5',
    error: '#ff6b6b',
  };

  let colors = fallbackColors;
  
  try {
    const theme = useTheme();
    colors = theme.colors;
  } catch (error) {
    // Theme context not available, use fallback colors
    console.warn('Theme context not available in ErrorBoundary, using fallback colors');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={48} color={colors.error} />
        <Text style={[styles.title, { color: colors.foreground }]}>Oops! Something went wrong</Text>
        <Text style={[styles.message, { color: colors.muted }]}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        
        {__DEV__ && error && (
          <ScrollView style={[styles.debugContainer, { backgroundColor: colors.surface }]} showsVerticalScrollIndicator={true}>
            <Text style={[styles.debugTitle, { color: colors.foreground }]}>Debug Information:</Text>
            <Text style={[styles.debugText, { color: colors.muted }]}>{error.toString()}</Text>
            {errorInfo && (
              <Text style={[styles.debugText, { color: colors.muted }]}>
                {errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>
        )}
        
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.foreground }]} onPress={onRetry}>
          <Text style={[styles.retryButtonText, { color: colors.background }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ErrorBoundaryClass;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    width: '100%',
    height: '40%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
