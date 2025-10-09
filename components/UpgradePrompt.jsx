import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function UpgradePrompt({ onUpgrade, onDismiss, daysUsed }) {
  return (
    <View style={styles.container} testID="upgrade-prompt">
      <Text style={styles.title} testID="prompt-message">
        You've been using Link Up for {daysUsed} days. Upgrade for more features!
      </Text>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          testID="prompt-dismiss"
        >
          <Text style={styles.dismissButtonText}>Maybe Later</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgrade}
          testID="prompt-upgrade"
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
