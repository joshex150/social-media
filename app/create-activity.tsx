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
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '@/constants/spacing';
import { useApi } from '@/contexts/ApiContext';

export default function CreateActivityScreen() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'social',
    description: '',
    location: '',
    address: '',
    latitude: 0,
    longitude: 0,
    maxParticipants: 10,
    startDate: '',
    startTime: '',
    duration: 60,
    radius: 5,
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { createActivity } = useApi();

  const categories = [
    { id: 'social', name: 'Social', icon: 'users' },
    { id: 'fitness', name: 'Fitness', icon: 'heart' },
    { id: 'learning', name: 'Learning', icon: 'book' },
    { id: 'food', name: 'Food', icon: 'cutlery' },
    { id: 'travel', name: 'Travel', icon: 'plane' },
    { id: 'music', name: 'Music', icon: 'music' },
    { id: 'sports', name: 'Sports', icon: 'futbol-o' },
    { id: 'tech', name: 'Tech', icon: 'laptop' }
  ];

  const radiusOptions = [1, 3, 5, 10, 15, 20, 30];
  const durationOptions = [30, 60, 90, 120, 180, 240];
  const maxParticipantsOptions = [5, 10, 15, 20, 25, 50];

  const popularTags = [
    'outdoor', 'indoor', 'free', 'paid', 'beginner', 'intermediate', 'advanced',
    'family-friendly', 'pet-friendly', 'wheelchair-accessible', 'networking',
    'creative', 'educational', 'relaxing', 'energetic', 'cultural'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const activityData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as 'social' | 'fitness' | 'learning' | 'food' | 'travel' | 'music' | 'sports' | 'tech',
        location: {
          name: formData.location,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        date: formData.startDate,
        time: formData.startTime,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        radius: formData.radius,
        tags: selectedTags,
      };

      const result = await createActivity(activityData);
      
      if (result.success) {
        Alert.alert(
          'Success!',
          'Your activity has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create activity');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Activity</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="What's your activity about?"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  formData.category === category.id && styles.categoryButtonActive
                ]}
                onPress={() => handleInputChange('category', category.id)}
              >
                <FontAwesome 
                  name={category.icon as any} 
                  size={16} 
                  color={formData.category === category.id ? "#fff" : "#666"} 
                />
                <Text style={[
                  styles.categoryText,
                  formData.category === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Describe your activity in detail..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="Where will this take place?"
            placeholderTextColor="#999"
          />
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Full address (optional)"
            placeholderTextColor="#999"
          />
        </View>

        {/* Date and Time */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={(text) => handleInputChange('startDate', text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              value={formData.startTime}
              onChangeText={(text) => handleInputChange('startTime', text)}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Duration and Max Participants */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
              {durationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.optionButton,
                    formData.duration === duration && styles.optionButtonActive
                  ]}
                  onPress={() => handleInputChange('duration', duration)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.duration === duration && styles.optionTextActive
                  ]}>
                    {duration}m
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Max Participants</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
              {maxParticipantsOptions.map((max) => (
                <TouchableOpacity
                  key={max}
                  style={[
                    styles.optionButton,
                    formData.maxParticipants === max && styles.optionButtonActive
                  ]}
                  onPress={() => handleInputChange('maxParticipants', max)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.maxParticipants === max && styles.optionTextActive
                  ]}>
                    {max}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Search Radius */}
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
                  styles.radiusText,
                  formData.radius === radius && styles.radiusTextActive
                ]}>
                  {radius}km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (optional)</Text>
          <Text style={styles.subLabel}>Help others find your activity</Text>
          <View style={styles.tagsContainer}>
            {popularTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagActive
                ]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextActive
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <FontAwesome name="spinner" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Creating...</Text>
            </>
          ) : (
            <>
              <FontAwesome name="plus" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Create Activity</Text>
            </>
          )}
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
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PADDING.content.vertical,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 44,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: '#000',
    marginLeft: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#000',
  },
  placeholder: {
    width: 60,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: PADDING.content.vertical,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#000',
    marginBottom: GAPS.small,
  },
  subLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    marginBottom: GAPS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical + 4,
    fontSize: FONT_SIZES.md,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 56,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical + 4,
    fontSize: FONT_SIZES.md,
    color: '#000',
    backgroundColor: '#fff',
    height: 140,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: GAPS.small,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 4,
    marginRight: GAPS.small,
    minHeight: 42,
  },
  categoryButtonActive: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    marginLeft: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  categoryTextActive: {
    color: '#fff',
  },
  optionScroll: {
    marginBottom: GAPS.small,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 4,
    marginRight: GAPS.small,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#000',
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontWeight: FONT_WEIGHTS.medium,
  },
  optionTextActive: {
    color: '#fff',
  },
  radiusScroll: {
    marginBottom: GAPS.small,
  },
  radiusButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 4,
    marginRight: GAPS.small,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#000',
  },
  radiusText: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontWeight: FONT_WEIGHTS.medium,
  },
  radiusTextActive: {
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 2,
    marginRight: GAPS.small,
    marginBottom: GAPS.small,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontWeight: FONT_WEIGHTS.medium,
  },
  tagTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: PADDING.button.vertical + 8,
    marginTop: PADDING.content.vertical,
    minHeight: 56,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#fff',
    marginLeft: GAPS.small,
  },
});