import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Conditional Mapbox import for simulator compatibility
let MapboxGL;
const isSimulator = Platform.OS === 'ios' && __DEV__; // iOS Simulator detection
const forceFallback = process.env.EXPO_PUBLIC_FORCE_MAP_FALLBACK === 'true';

try {
  if (isSimulator || forceFallback) {
    console.warn("Mapbox disabled for simulator/fallback mode in MapView");
    MapboxGL = null;
  } else {
    MapboxGL = require('@rnmapbox/maps');
  }
} catch (error) {
  console.warn("Mapbox not available in MapView, using fallback");
  MapboxGL = null;
}

export default function MapView({ event, participants }) {
  const { location, latitude, longitude } = event;

  // Fallback component for when Mapbox is not available
  const MapFallback = () => (
    <View style={[styles.map, styles.fallbackMap]} testID="map-fallback">
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackTitle}>Event Location</Text>
        <Text style={styles.fallbackText}>{location}</Text>
        <Text style={styles.fallbackText}>
          Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <Text style={styles.fallbackText}>
          {participants.length} participants
        </Text>
        <Text style={styles.fallbackSubtext}>
          Map view requires a physical device
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container} testID="map-view">
      <Text style={styles.location} testID="event-location">{location}</Text>
      <Text style={styles.participants} testID="participants-count">
        {participants.length} participants
      </Text>
      
      {MapboxGL ? (
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Light}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MapboxGL.Camera
            zoomLevel={14}
            centerCoordinate={[longitude, latitude]}
            animationMode="flyTo"
            animationDuration={1000}
          />
          
          {/* Event location marker */}
          <MapboxGL.PointAnnotation
            id="event-location"
            coordinate={[longitude, latitude]}
          >
            <View style={styles.eventMarker} />
          </MapboxGL.PointAnnotation>
          
          {/* Participant markers */}
          {participants.map((participant, index) => (
            participant.latitude && participant.longitude && (
              <MapboxGL.PointAnnotation
                key={participant.id}
                id={`participant-${participant.id}`}
                coordinate={[participant.longitude, participant.latitude]}
              >
                <View style={styles.participantMarker} />
              </MapboxGL.PointAnnotation>
            )
          ))}
        </MapboxGL.MapView>
      ) : (
        <MapFallback />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  location: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    padding: 16,
    backgroundColor: '#fff',
  },
  participants: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  fallbackMap: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContent: {
    padding: 20,
    alignItems: 'center',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  eventMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
  },
  participantMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#666',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
