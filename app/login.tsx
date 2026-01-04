import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { alert, showAlert, hideAlert } = useCustomAlert();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isBecomingGuest, setIsBecomingGuest] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const safeArea = useSafeAreaStyle();
  const { login, register, continueAsGuest, isAuthenticated, isGuest, isLoading } = useApi();

  // Redirect if already authenticated or guest
  React.useEffect(() => {
    // Only run if we have authentication state and haven't navigated yet
    // Skip if we're in the process of becoming a guest (continueAsGuest handles navigation)
    if ((isAuthenticated || isGuest) && !hasNavigated && !isBecomingGuest) {
      // If guest is trying to access a protected route, don't redirect them back
      if (isGuest && params.from) {
        return;
      }
      
      // Add a small delay to prevent flicker
      const timer = setTimeout(async () => {
        // If guest, go directly to main app (bypass onboarding)
        if (isGuest) {
          // console.log('Guest user, redirecting to main app...');
          setHasNavigated(true);
          router.replace("/(tabs)");
          return;
        }
        
        // If authenticated user, check onboarding status
        if (isAuthenticated) {
          // console.log('Authenticated user, checking onboarding...');
          const onboardingComplete = await checkOnboardingStatus();
          // console.log('Onboarding complete:', onboardingComplete);
          // console.log('Params from:', params.from);
          
          if (onboardingComplete) {
            // If user came from a protected route, redirect them there
            if (params.from === 'create-activity') {
              // console.log('Redirecting to create-activity page...');
              setHasNavigated(true);
              router.replace('/create-activity');
            } else {
              // console.log('Redirecting to main app...');
              setHasNavigated(true);
              router.replace("/(tabs)");
            }
          } else {
            // If user came from a protected route but needs onboarding, 
            // redirect them to the protected route after onboarding
            if (params.from === 'create-activity') {
              // console.log('Redirecting to onboarding, then create-activity...');
              setHasNavigated(true);
              router.replace('/onboarding?redirect=create-activity');
            } else {
              // console.log('Redirecting to onboarding...');
              setHasNavigated(true);
              router.replace("/onboarding");
            }
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isGuest, router, params.from, isBecomingGuest, hasNavigated]);

  // Reset navigation flag when authentication state changes
  React.useEffect(() => {
    if (!isAuthenticated && !isGuest) {
      setHasNavigated(false);
    }
  }, [isAuthenticated, isGuest]);

  const checkOnboardingStatus = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      const userProfile = await AsyncStorage.getItem('userProfile');
      const isNewUser = await AsyncStorage.getItem('isNewUser');
      
      // If this is a new user (just registered), they need onboarding
      if (isNewUser === 'true') {
        return false;
      }
      
      // If onboarding is explicitly marked as complete, user has finished onboarding
      if (onboardingComplete === 'true') {
        return true;
      }
      
      // If user has a saved profile, they've likely completed onboarding
      if (userProfile) {
        return true;
      }
      
      // Default to false for new users
      return false;
    } catch (error) {
      console.warn('Error checking onboarding status:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showAlert("Error", "Please fill in all required fields", "error");
      return;
    }

    if (!isLogin && !name) {
      showAlert("Error", "Please enter your name", "error");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      showAlert("Error", "Passwords do not match", "error");
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (result.success) {
        // For new users (register), set a flag to ensure they go to onboarding
        if (!isLogin) {
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('isNewUser', 'true');
          } catch (error) {
            console.warn('Error setting new user flag:', error);
          }
        }
        // Don't navigate here - let the useEffect handle it
        return;
      } else {
        showAlert("Error", result.error || "Something went wrong", "error");
      }
    } catch (error) {
      showAlert("Error", "Network error. Please try again.", "error");
    }
  };

  return (
    <View style={[styles.container, safeArea.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, safeArea.content]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <FontAwesome name="users" size={48} color={colors.foreground} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {isLogin ? "Welcome Back" : "Join Link Up"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isLogin
                ? "Sign in to connect with people around you"
                : "Create your account to get started"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.foreground }, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={[styles.submitButtonText, { color: colors.background }]}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Continue as Guest Button */}
            <TouchableOpacity
              style={[styles.guestButton, { backgroundColor: colors.background, borderColor: colors.foreground }]}
              onPress={async () => {
                if (params.from) {
                  // If trying to access a protected route, switch to registration form
                  // Creating an account doesn't require authentication
                  setIsLogin(false);
                  // Clear form fields
                  setName("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                } else {
                  // Normal guest flow - let useEffect handle navigation after state is set
                  setIsBecomingGuest(true);
                  await continueAsGuest();
                  setIsBecomingGuest(false);
                  // useEffect will detect isGuest and navigate
                }
              }}
              disabled={isLoading}
            >
              <Text style={[styles.guestButtonText, { color: colors.foreground }]}>
                {params.from ? "Create Account to Continue" : "Continue as Guest"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Login/Register */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, { color: colors.muted }]}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
            >
              <Text style={[styles.toggleButtonText, { color: colors.accent }]}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          {/* <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>Email: alex.johnson@example.com</Text>
            <Text style={styles.demoText}>Password: password123</Text>
          </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    paddingTop: Math.max(PADDING.content.vertical, 20), // Ensure minimum top padding
  },
  header: {
    alignItems: "center",
    marginBottom: PADDING.content.vertical * 2,
    marginTop: PADDING.content.horizontal,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAPS.large,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: GAPS.small,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: PADDING.content.horizontal,
    marginBottom: PADDING.content.vertical * 2,
  },
  inputContainer: {
    marginBottom: GAPS.large,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: GAPS.small,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical,
    fontSize: FONT_SIZES.md,
    minHeight: 56,
  },
  submitButton: {
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: PADDING.button.vertical,
    alignItems: "center",
    marginTop: GAPS.large,
    minHeight: 56,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: PADDING.button.vertical,
    alignItems: "center",
    marginTop: GAPS.medium,
    minHeight: 56,
    justifyContent: "center",
  },
  guestButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
  },
  toggleText: {
    fontSize: FONT_SIZES.md,
    marginRight: GAPS.small,
  },
  toggleButton: {
    paddingVertical: GAPS.small,
  },
  toggleButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  demoContainer: {
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
  },
  demoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: GAPS.small,
  },
  demoText: {
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
});
