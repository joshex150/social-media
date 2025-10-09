import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const EmotionSelector = ({ onSelect, selected }) => {
  const emotions = [
    { id: 'happy', icon: 'smile-o', label: 'Happy' },
    { id: 'neutral', icon: 'meh-o', label: 'Neutral' },
    { id: 'sad', icon: 'frown-o', label: 'Sad' },
    { id: 'excited', icon: 'star', label: 'Excited' },
    { id: 'tired', icon: 'bed', label: 'Tired' },
  ];

  return (
    <View style={styles.emotionSelector} testID="emotion-selector">
      {emotions.map((emotion) => (
        <TouchableOpacity
          key={emotion.id}
          testID={`emotion-${emotion.id}`}
          style={[
            styles.emotionButton,
            selected === emotion.id && styles.emotionButtonSelected,
          ]}
          onPress={() => onSelect(emotion.id)}
        >
          <FontAwesome name={emotion.icon} size={32} color="#000" />
          <Text style={styles.emotionLabel}>{emotion.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RatingSlider = ({ value, onValueChange, label }) => {
  return (
    <View style={styles.ratingContainer} testID="rating-slider">
      <Text style={styles.ratingLabel} testID="rating-label">{label}</Text>
      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            testID={`rating-${rating}`}
            style={[
              styles.ratingButton,
              value === rating && styles.ratingButtonSelected,
            ]}
            onPress={() => onValueChange(rating)}
          >
            <Text
              style={[
                styles.ratingText,
                value === rating && styles.ratingTextSelected,
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingValue} testID="rating-value">{value}/5</Text>
    </View>
  );
};

export default function FeedbackModal({ visible, event, onClose, onSubmit }) {
  const [emotion, setEmotion] = useState(null);
  const [rating, setRating] = useState(3);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!emotion) {
      setError('Please select an emotion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          emotion,
          rating,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      onSubmit(data);
      
      // Reset form
      setEmotion(null);
      setRating(3);
      setComments('');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal} testID="feedback-modal">
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            testID="close-button"
          >
            <FontAwesome name="times" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.title}>How was your experience?</Text>
          <Text style={styles.eventTitle}>{event?.title}</Text>
          <Text style={styles.participantCount}>
            {event?.participants?.length || 0} participants
          </Text>

          <EmotionSelector selected={emotion} onSelect={setEmotion} />

          <RatingSlider
            value={rating}
            onValueChange={setRating}
            label="Overall Rating"
          />

          <TextInput
            testID="comments-input"
            style={styles.commentsInput}
            placeholder="Add comments (optional)"
            placeholderTextColor="#999"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            testID="submit-button"
          >
            {loading ? (
              <ActivityIndicator testID="loading-indicator" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  participantCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  emotionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  emotionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionButtonSelected: {
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  emotionEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  ratingTextSelected: {
    color: '#fff',
  },
  ratingValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
