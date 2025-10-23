import React, { useState } from 'react';
import { ScrollView, RefreshControl, View, Text, StyleSheet } from 'react-native';
import RefreshLoader from './RefreshLoader';

const RefreshControlExample = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshProgress(0);
    
    // Simulate refresh progress
    const progressInterval = setInterval(() => {
      setRefreshProgress(prev => {
        if (prev >= 1) {
          clearInterval(progressInterval);
          setRefreshing(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    // Simulate API call
    setTimeout(() => {
      clearInterval(progressInterval);
      setRefreshing(false);
      setRefreshProgress(0);
    }, 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={50}
          renderToHardwareTextureAndroid={true}
          tintColor="transparent"
          colors={['transparent']}
          progressBackgroundColor="transparent"
        >
          <RefreshLoader
            refreshing={refreshing}
            progress={refreshProgress}
            title="Pull to refresh"
            refreshingTitle="Refreshing data..."
            color="#000"
            size={20}
            showProgress={true}
            animationType="spin"
          />
        </RefreshControl>
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Pull Down to Refresh</Text>
        <Text style={styles.subtitle}>
          This example shows how to use the custom RefreshLoader component
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RefreshControlExample;
