import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RequestBanner({ request, onAccept, onReject }) {
  const { id, userName, message } = request;

  return (
    <View style={styles.banner} testID="request-banner">
      <View style={styles.content}>
        <Text style={styles.userName} testID="request-user">{userName}</Text>
        <Text style={styles.message} testID="request-message">{message}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => onReject(id)}
          testID="reject-button"
        >
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => onAccept(id)}
          testID="accept-button"
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  content: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  acceptButton: {
    backgroundColor: '#000',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
