import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { PADDING, FONT_SIZES, FONT_WEIGHTS, GAPS } from "@/constants/spacing";

const INTERESTS = [
  'social', 'fitness', 'learning', 'food', 'travel', 'music', 'sports', 'tech'
];


export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { alert, showAlert, hideAlert } = useCustomAlert();
  const router = useRouter();
  const params = useLocalSearchParams();
  const safeArea = useSafeAreaStyle();
  const { user, updateProfile } = useApi();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    location: '',
    interests: [] as string[],
  });

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };


  const handleNext = () => {
    if (step === 0 && !profile.location) {
      showAlert('Error', 'Please enter your location', 'error');
      return;
    }
    if (step === 1 && profile.interests.length === 0) {
      showAlert('Error', 'Please select at least one interest', 'error');
      return;
    }
    
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Try to update user profile via API if available
      try {
        const profileData = {
          location: profile.location ? { address: profile.location } : undefined,
          preferences: {
            radius: 10, // Default radius
            notifications: {
              email: true,
              push: true,
              joinRequests: true,
              activityReminders: true,
            },
            categories: profile.interests, // Map interests to categories
          }
        };

        const result = await updateProfile(profileData);
        
        if (!result.success) {
          console.warn('API update failed, saving locally:', result.error);
          // Continue with local save if API fails
        }
      } catch (apiError) {
        console.warn('API not available, saving locally:', apiError);
        // Continue with local save if API is not available
      }

      // Save onboarding completion status locally
      const fullProfile = {
        ...profile,
        name: user?.name || 'User',
        completedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(fullProfile));
      await AsyncStorage.setItem('userCreatedAt', Date.now().toString());
      await AsyncStorage.setItem('onboardingComplete', 'true');
      
      // Clear the new user flag since onboarding is complete
      await AsyncStorage.removeItem('isNewUser');
      
      // Show success message
      showAlert(
        'Welcome to Link Up!',
        'Your profile has been set up successfully. You can now start connecting with people around you.',
        'success',
        [
          {
            text: 'Get Started',
            onPress: () => {
              // Navigate to main app or redirect destination
              // console.log('Onboarding complete, redirect param:', params.redirect);
              if (params.redirect === 'create-activity') {
                // console.log('Redirecting to create-activity page...');
                router.replace('/create-activity');
              } else {
                // console.log('Redirecting to main app...');
                router.replace('/(tabs)');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Onboarding completion error:', error);
      showAlert('Error', 'Failed to save profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome, {user?.name || 'User'}!</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Let's set up your profile to help you connect with people for meaningful activities.
            </Text>
            
            <TextInput
              testID="location-input"
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Your Location (e.g., New York, NY)"
              placeholderTextColor={colors.muted}
              value={profile.location}
              onChangeText={(text) => setProfile({ ...profile, location: text })}
            />
          </View>
        );
      
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.foreground }]}>Select Your Interests</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Choose activities you enjoy
            </Text>
            
            <View style={styles.optionsContainer}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  testID={`interest-${interest}`}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    profile.interests.includes(interest) && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                  onPress={() => handleInterestToggle(interest)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.muted },
                      profile.interests.includes(interest) && { color: colors.background },
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.foreground }]}>You're All Set!</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Let's start connecting with people around you
            </Text>
            
            <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Your Profile</Text>
              <Text style={[styles.summaryText, { color: colors.muted }]}>Name: {user?.name || 'User'}</Text>
              <Text style={[styles.summaryText, { color: colors.muted }]}>Location: {profile.location}</Text>
              <Text style={[styles.summaryText, { color: colors.muted }]}>
                Interests: {profile.interests.join(', ')}
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Safe Header */}
      <View style={[styles.header, safeArea.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          {step > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
        </View>
               <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                 {step === 0 ? 'Location' : 
                  step === 1 ? 'Interests' : 'Complete'}
               </Text>
        <View style={styles.headerRight}>
          <Text style={[styles.stepIndicator, { color: colors.muted }]}>{step + 1}/3</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {renderStep()}
        
        <View style={styles.navigationContainer}>
          <View style={styles.progressContainer}>
            {[0, 1, 2].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  { backgroundColor: colors.border },
                  s === step && { backgroundColor: colors.accent },
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity
            testID={step < 1 ? 'location-continue' : step === 1 ? 'interests-continue' : 'onboarding-complete'}
            style={[
              styles.continueButton, 
              { backgroundColor: colors.accent },
              isLoading && { backgroundColor: colors.muted }
            ]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={[styles.continueButtonText, { color: colors.background }]}>
              {isLoading ? 'Saving...' : step === 2 ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: GAPS.small,
  },
  stepIndicator: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  stepContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 8,
  },
  navigationContainer: {
    marginTop: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
