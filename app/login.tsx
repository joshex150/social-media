import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useApi } from "@/contexts/ApiContext";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const safeArea = useSafeAreaStyle();
  const { login, register, continueAsGuest, isAuthenticated, isGuest, isLoading } = useApi();

  // Redirect if already authenticated or guest
  React.useEffect(() => {
    if (isAuthenticated || isGuest) {
      // Add a small delay to prevent flicker
      const timer = setTimeout(async () => {
        // If guest, go directly to main app
        if (isGuest) {
          router.replace("/(tabs)");
          return;
        }
        
        // Check if user has completed onboarding
        const onboardingComplete = await checkOnboardingStatus();
        if (onboardingComplete) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isGuest, router]);

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
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
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
        Alert.alert("Error", result.error || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  return (
    <View style={[styles.container, safeArea.container]}>
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
            <View style={styles.logoContainer}>
              <FontAwesome name="users" size={48} color="#000" />
            </View>
            <Text style={styles.title}>
              {isLogin ? "Welcome Back" : "Join Link Up"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Sign in to connect with people around you"
                : "Create your account to get started"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Continue as Guest Button */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={continueAsGuest}
              disabled={isLoading}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Login/Register */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
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
              <Text style={styles.toggleButtonText}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAPS.large,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: "#666",
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
    color: "#000",
    marginBottom: GAPS.small,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical,
    fontSize: FONT_SIZES.md,
    backgroundColor: "#fff",
    minHeight: 56,
  },
  submitButton: {
    backgroundColor: "#000",
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: PADDING.button.vertical,
    alignItems: "center",
    marginTop: GAPS.large,
    minHeight: 56,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: PADDING.button.vertical,
    alignItems: "center",
    marginTop: GAPS.medium,
    minHeight: 56,
    justifyContent: "center",
  },
  guestButtonText: {
    color: "#000",
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
    color: "#666",
    marginRight: GAPS.small,
  },
  toggleButton: {
    paddingVertical: GAPS.small,
  },
  toggleButtonText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    fontWeight: FONT_WEIGHTS.semibold,
  },
  demoContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
  },
  demoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  demoText: {
    fontSize: FONT_SIZES.xs,
    color: "#666",
    marginBottom: 2,
  },
});
