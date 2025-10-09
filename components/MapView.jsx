import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

export default function MapView({ event, participants }) {
  const { location, latitude, longitude } = event;

  return (
    <View style={styles.container} testID="map-view">
      <Text style={styles.location} testID="event-location">{location}</Text>
      <Text style={styles.participants} testID="participants-count">
        {participants.length} participants
      </Text>
      
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
