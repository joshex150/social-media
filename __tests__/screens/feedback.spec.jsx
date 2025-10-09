import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FeedbackModal from '@/components/FeedbackModal';

// Mock the feedback components
jest.mock('@/components/EmotionSelector', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function EmotionSelector({ onSelect, selected }) {
    const emotions = ['happy', 'neutral', 'sad', 'excited', 'tired'];
    
    return (
      <View testID="emotion-selector">
        {emotions.map(emotion => (
          <TouchableOpacity
            key={emotion}
            testID={`emotion-${emotion}`}
            onPress={() => onSelect(emotion)}
            style={{ backgroundColor: selected === emotion ? '#000' : '#fff' }}
          >
            <Text>{emotion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

jest.mock('@/components/RatingSlider', () => {
  const { View, Text, Slider } = require('react-native');
  return function RatingSlider({ value, onValueChange, label }) {
    return (
      <View testID="rating-slider">
        <Text testID="rating-label">{label}</Text>
        <Slider
          testID="slider"
          value={value}
          onValueChange={onValueChange}
          minimumValue={1}
          maximumValue={5}
        />
        <Text testID="rating-value">{value}/5</Text>
      </View>
    );
  };
});

describe('Feedback Modal', () => {
  const mockEvent = {
    id: '1',
    title: 'Morning Coffee Walk',
    participants: ['Alice', 'Bob', 'Charlie']
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders feedback modal', () => {
    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    expect(getByTestId('feedback-modal')).toBeTruthy();
    expect(getByTestId('emotion-selector')).toBeTruthy();
    expect(getByTestId('rating-slider')).toBeTruthy();
  });

  it('displays event information', () => {
    const { getByText } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    expect(getByText('How was your experience?')).toBeTruthy();
    expect(getByText('Morning Coffee Walk')).toBeTruthy();
  });

  it('handles emotion selection', () => {
    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    fireEvent.press(getByTestId('emotion-happy'));
    
    // Should show selected emotion
    expect(getByTestId('emotion-happy')).toHaveStyle({ backgroundColor: '#000' });
  });

  it('handles rating changes', () => {
    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    fireEvent(getByTestId('slider'), 'onValueChange', 4);
    
    expect(getByTestId('rating-value')).toHaveTextContent('4/5');
  });

  it('submits feedback successfully', async () => {
    const mockOnSubmit = jest.fn();
    
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, feedbackId: 'fb1' })
    });

    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Select emotion and rating
    fireEvent.press(getByTestId('emotion-happy'));
    fireEvent(getByTestId('slider'), 'onValueChange', 4);
    
    // Submit feedback
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"emotion":"happy"')
        })
      );
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('validates required fields', () => {
    const { getByTestId, getByText } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    // Try to submit without selecting emotion
    fireEvent.press(getByTestId('submit-button'));
    
    expect(getByText('Please select an emotion')).toBeTruthy();
  });

  it('handles submission errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId, getByText } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    // Fill out form
    fireEvent.press(getByTestId('emotion-happy'));
    fireEvent(getByTestId('slider'), 'onValueChange', 4);
    
    // Submit
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(getByText('Failed to submit feedback')).toBeTruthy();
    });
  });

  it('closes modal on close button', () => {
    const mockOnClose = jest.fn();
    
    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={mockOnClose} 
        onSubmit={() => {}} 
      />
    );
    
    fireEvent.press(getByTestId('close-button'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    // Fill out form
    fireEvent.press(getByTestId('emotion-happy'));
    fireEvent(getByTestId('slider'), 'onValueChange', 4);
    
    // Submit
    fireEvent.press(getByTestId('submit-button'));
    
    // Should show loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeDisabled();
  });

  it('resets form after successful submission', async () => {
    const mockOnSubmit = jest.fn();
    
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, feedbackId: 'fb1' })
    });

    const { getByTestId, rerender } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Fill out form
    fireEvent.press(getByTestId('emotion-happy'));
    fireEvent(getByTestId('slider'), 'onValueChange', 4);
    
    // Submit
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Re-render to simulate modal reopening
    rerender(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Form should be reset
    expect(getByTestId('rating-value')).toHaveTextContent('3/5'); // default value
  });

  it('displays participant count', () => {
    const { getByText } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    expect(getByText('3 participants')).toBeTruthy();
  });

  it('handles optional comments', () => {
    const { getByTestId } = render(
      <FeedbackModal 
        visible={true} 
        event={mockEvent} 
        onClose={() => {}} 
        onSubmit={() => {}} 
      />
    );
    
    const commentsInput = getByTestId('comments-input');
    fireEvent.changeText(commentsInput, 'Great activity!');
    
    expect(commentsInput).toHaveTextContent('Great activity!');
  });
});
