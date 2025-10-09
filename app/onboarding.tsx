import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTERESTS = [
  'social', 'fitness', 'sports', 'music', 'food', 'arts', 
  'outdoors', 'gaming', 'reading', 'travel'
];

const LANGUAGES = [
  'english', 'spanish', 'french', 'german', 'chinese', 
  'japanese', 'arabic', 'hindi', 'portuguese', 'russian'
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    interests: [] as string[],
    languages: [] as string[],
  });

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleNext = () => {
    if (step === 0 && (!profile.name || !profile.location)) {
      Alert.alert('Error', 'Please enter your name and location');
      return;
    }
    if (step === 1 && profile.interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }
    if (step === 2 && profile.languages.length === 0) {
      Alert.alert('Error', 'Please select at least one language');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      await AsyncStorage.setItem('userCreatedAt', Date.now().toString());
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome to Link Up</Text>
            <Text style={styles.subtitle}>
              We are not a dating platform. We connect people for meaningful activities.
            </Text>
            
            <TextInput
              testID="name-input"
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#999"
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
            
            <TextInput
              testID="location-input"
              style={styles.input}
              placeholder="Your Location"
              placeholderTextColor="#999"
              value={profile.location}
              onChangeText={(text) => setProfile({ ...profile, location: text })}
            />
          </View>
        );
      
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Select Your Interests</Text>
            <Text style={styles.subtitle}>
              Choose activities you enjoy
            </Text>
            
            <View style={styles.optionsContainer}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  testID={`interest-${interest}`}
                  style={[
                    styles.optionButton,
                    profile.interests.includes(interest) && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleInterestToggle(interest)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      profile.interests.includes(interest) && styles.optionTextSelected,
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
            <Text style={styles.title}>Languages You Speak</Text>
            <Text style={styles.subtitle}>
              Select languages you're comfortable with
            </Text>
            
            <View style={styles.optionsContainer}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language}
                  testID={`language-${language}`}
                  style={[
                    styles.optionButton,
                    profile.languages.includes(language) && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleLanguageToggle(language)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      profile.languages.includes(language) && styles.optionTextSelected,
                    ]}
                  >
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>You're All Set!</Text>
            <Text style={styles.subtitle}>
              Let's start connecting with people around you
            </Text>
            
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Your Profile</Text>
              <Text style={styles.summaryText}>Name: {profile.name}</Text>
              <Text style={styles.summaryText}>Location: {profile.location}</Text>
              <Text style={styles.summaryText}>
                Interests: {profile.interests.join(', ')}
              </Text>
              <Text style={styles.summaryText}>
                Languages: {profile.languages.join(', ')}
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderStep()}
      
      <View style={styles.navigationContainer}>
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s === step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity
          testID={step < 2 ? 'interests-continue' : step === 2 ? 'languages-continue' : 'onboarding-complete'}
          style={styles.continueButton}
          onPress={handleNext}
        >
          <Text style={styles.continueButtonText}>
            {step === 3 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
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
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#fff',
  },
  summaryContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
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
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#000',
    width: 24,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
