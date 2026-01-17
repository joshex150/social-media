import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/components/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ApiProvider, useApi } from "@/contexts/ApiContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { View, Text, StyleSheet, LogBox } from "react-native";
import { ErrorBoundary } from "@/components";
import Logo from "@/components/Logo";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Suppress Hermes-specific warnings and errors
LogBox.ignoreLogs([
  '[runtime not ready]',
  'Exception in HostFunction',
  'Hermes',
  'Metro',
  'Bundle loading',
]);

// Add global error handler for development
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('runtime not ready') || 
        args[0]?.includes?.('Exception in HostFunction') ||
        args[0]?.includes?.('Hermes')) {
      console.warn('Hermes runtime error suppressed:', ...args);
      return;
    }
    originalConsoleError(...args);
  };

  // Global error handler
  if (typeof global !== 'undefined') {
    (global as any).ErrorUtils?.setGlobalHandler((error: any, isFatal: any) => {
      console.log('Global error caught:', error);
      if (isFatal) {
        console.log('Fatal error occurred, but continuing...');
      }
    });
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Don't hide splash screen here - wait for auth to complete
  // The splash will be hidden in AppNavigator after auth loads

  if (!loaded) {
    // Show loading screen while fonts are loading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Logo size={64} animated={true} color="#ffffff" />
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>
          Link Up
        </Text>
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add a small delay to ensure all modules are loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', padding: 20 }}>
          Something went wrong. Please restart the app.
        </Text>
      </View>
    );
  }

  if (!isReady) {
    // Show loading screen while modules are initializing
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Logo size={120} animated={true} color="#ffffff" />
        {/* <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>
          Link Up
        </Text> */}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary onError={setError}>
          <ApiProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AppNavigator />
            </GestureHandlerRootView>
          </ApiProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { isAuthenticated, isGuest, isLoading } = useApi();
  const { colors } = useTheme();
  const hasAccess = isAuthenticated || isGuest;

  // Add a fallback timeout to prevent infinite loading
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceShow(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const [splashHidden, setSplashHidden] = useState(false);

  // Hide splash screen once auth is ready
  useEffect(() => {
    if (!isLoading || forceShow) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        SplashScreen.hideAsync()
          .then(() => {
            setSplashHidden(true);
          })
          .catch(() => {
            // Ignore errors if splash is already hidden
            setSplashHidden(true);
          });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, forceShow]);

  if (isLoading && !forceShow) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: '#000000' }, // Always black to match splash screen
        ]}
      >
        <Logo size={120} animated={true} color="#ffffff" />
        {/* <Text style={[styles.loadingText, { color: '#ffffff' }]}>
          Link Up
        </Text> */}
        {/* <Text style={[styles.loadingSubtext, { color: '#999999' }]}>
          Loading...
        </Text> */}
      </View>
    );
  }

  // Show black background until splash is fully hidden to prevent white flash
  if (!splashHidden) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }} />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
        gestureDirection: "horizontal",
        contentStyle: { backgroundColor: colors.background }, // Use theme background after splash is hidden
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          ...(hasAccess && { href: null }), // Hide login when authenticated or guest
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          ...(hasAccess && { href: null }), // Hide onboarding when authenticated or guest
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe back gesture
          ...(!hasAccess && { href: null }), // Hide tabs when not authenticated and not guest
        }}
      />
      <Stack.Screen 
        name="create-activity" 
        options={{ 
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true, // Allow swipe to dismiss
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true, // Allow swipe to dismiss
        }} 
      />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    marginTop: 8,
  },
});
