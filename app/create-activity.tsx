import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaStyle } from '@/hooks/useSafeAreaStyle';
import { useRouter } from 'expo-router';

export default function CreateActivityScreen() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Social',
    description: '',
    location: '',
    maxParticipants: 10,
    startDate: '',
    startTime: '',
    radius: 5,
  });
  const [loading, setLoading] = useState(false);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const categories = ['Social', 'Fitness', 'Learning', 'Food', 'Entertainment', 'Outdoor'];
  const radiusOptions = [1, 3, 5, 10, 20];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: 'user_123',
          userName: 'You',
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Activity created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error('Failed to create activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, safeArea.content]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Activity</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="e.g., Morning Coffee Walk"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive
                ]}
                onPress={() => handleInputChange('category', category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe your activity..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            placeholder="e.g., Central Park, New York"
            placeholderTextColor="#999"
          />
        </View>

        {/* Max Participants */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Participants</Text>
          <TextInput
            style={styles.input}
            value={formData.maxParticipants.toString()}
            onChangeText={(value) => handleInputChange('maxParticipants', parseInt(value) || 10)}
            placeholder="10"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Date and Time */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={(value) => handleInputChange('startDate', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={formData.startTime}
              onChangeText={(value) => handleInputChange('startTime', value)}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Radius */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Search Radius (km)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.radiusScroll}>
            {radiusOptions.map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  formData.radius === radius && styles.radiusButtonActive
                ]}
                onPress={() => handleInputChange('radius', radius)}
              >
                <Text style={[
                  styles.radiusButtonText,
                  formData.radius === radius && styles.radiusButtonTextActive
                ]}>
                  {radius}km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Activity'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 60, // Balance the back button
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  radiusScroll: {
    marginTop: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  radiusButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  radiusButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
