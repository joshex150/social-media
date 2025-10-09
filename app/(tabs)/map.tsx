import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, useColorScheme, Text, Platform } from "react-native";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import { useUserLocation } from "@/components";
// import footprint from "../../assets/images/foot.png";
// import male from "@/assets/images/male.png";
import mockData from "../api/index.json";

// Conditional Mapbox import for simulator compatibility
let MapboxGL;
const isSimulator = Platform.OS === 'ios' && __DEV__; // iOS Simulator detection
const forceFallback = process.env.EXPO_PUBLIC_FORCE_MAP_FALLBACK === 'true';

try {
  if (isSimulator || forceFallback) {
    console.warn("Mapbox disabled for simulator/fallback mode");
    MapboxGL = null;
  } else {
    MapboxGL = require("@rnmapbox/maps");
  }
} catch (error) {
  console.warn("Mapbox not available, using fallback");
  MapboxGL = null;
}

// Only set access token if Mapbox is available
if (MapboxGL) {
  MapboxGL.setAccessToken(
    "sk.eyJ1IjoieWVsZWthY2hpIiwiYSI6ImNtZmJoOXBnNDFzNW8yaXBmdWMwc3MxdTMifQ.qbjaBUFpFXIQazD-Ci830A"
  );
}

interface Friend {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface Event {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface HeatPoint {
  id: string;
  lat: number;
  lng: number;
}

export default function MapScreen() {
  const userLocation = useUserLocation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [heat, setHeat] = useState<HeatPoint[]>([]);
  const [ghostMode, setGhostMode] = useState(false);

  // Detect system theme (light | dark)
  const colorScheme = useColorScheme();
  const mapStyle = MapboxGL ? 
    (colorScheme === "dark" ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Light) : 
    null;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = mockData;
        setFriends(data.friends);
        setEvents(data.events);
        setHeat(data.heat);
      } catch (err) {
        console.error("Failed to fetch mock data", err);
      }
    }
    fetchData();
  }, []);

  if (!userLocation) return null;

  // Fallback component for when Mapbox is not available
  const MapFallback = () => (
    <View style={[styles.map, styles.fallbackMap]}>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackTitle}>Map View</Text>
        <Text style={styles.fallbackSubtitle}>
          {Platform.OS === 'ios' ? 'iOS Simulator' : 'Android Emulator'} detected
        </Text>
        <Text style={styles.fallbackText}>
          Mapbox requires a physical device for full functionality.
        </Text>
        <Text style={styles.fallbackText}>
          Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
        </Text>
        <Text style={styles.fallbackText}>
          Friends nearby: {friends.length}
        </Text>
        <Text style={styles.fallbackText}>
          Events nearby: {events.length}
        </Text>
        {ghostMode && (
          <Text style={styles.ghostModeText}>👻 Ghost Mode Active</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Ghost Mode Toggle */}
      <View style={{ position: "absolute", bottom: 10, left: 10, zIndex: 1 }}>
        <Button
          title={ghostMode ? "Disable Ghost Mode" : "Enable Ghost Mode"}
          onPress={() => setGhostMode((prev) => !prev)}
        />
      </View>

      {MapboxGL ? (
        <MapboxGL.MapView
          style={styles.map}
          styleURL={mapStyle}
          logoEnabled={false}
          attributionEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={false} // ❌ disable rotation
          pitchEnabled={false} // ❌ disable tilt (3D)
        >
        {/* Camera follows user */}
        <MapboxGL.Camera
          zoomLevel={3}
          minZoomLevel={3} // Set minimum zoom level
          maxZoomLevel={18} // Set maximum zoom level
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User marker (hidden in Ghost Mode) */}
        {!ghostMode && (
          <MapboxGL.PointAnnotation
            id="user"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {/* Friends markers */}
        {friends.map((friend) => (
          <MapboxGL.PointAnnotation
            key={friend.id}
            id={friend.id}
            coordinate={[friend.lng, friend.lat]}
          >
            <Image
              source={Asset.fromModule(require(`@/assets/images/male.png`))}
              style={{
                width: 30,
                height: 30,
                opacity: 0.25, // near-transparent
                tintColor: "#000", // optional: monochrome look
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              }}
              // resizeMode="contain"
            />
          </MapboxGL.PointAnnotation>
        ))}

        {/* Event markers */}
        {events.map((event) => (
          <MapboxGL.PointAnnotation
            key={event.id}
            id={event.id}
            coordinate={[event.lng, event.lat]}
          >
            <View style={styles.eventMarker} />
          </MapboxGL.PointAnnotation>
        ))}

        {/* Heatmap-style effect */}
        {heat.map((point) => (
          <MapboxGL.PointAnnotation
            key={point.id}
            id={point.id}
            coordinate={[point.lng, point.lat]}
          >
            <Image
              source={Asset.fromModule(require(`@/assets/images/foot.png`))} // 👣 create a transparent footprint PNG
              style={{
                width: 300,
                height: 30,
                // opacity: 0.25, // near-transparent
                tintColor: "#000", // optional: monochrome look
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              }}
              // resizeMode="contain"
            />
          </MapboxGL.PointAnnotation>
        ))}
        </MapboxGL.MapView>
      ) : (
        <MapFallback />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fallbackMap: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContent: {
    padding: 16,
    alignItems: 'center',
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  ghostModeText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "blue",
    borderWidth: 2,
    borderColor: "white",
  },
  friendMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: "white",
  },
  eventMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "purple",
    borderWidth: 2,
    borderColor: "white",
  },
  heatMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,0,0,0.3)",
  },
});
