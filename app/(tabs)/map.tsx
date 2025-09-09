import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import MapboxGL from "@rnmapbox/maps";
import { useUserLocation } from "@/components";
// import footprint from "../../assets/images/foot.png";
// import male from "@/assets/images/male.png";
import mockData from "../api/index.json";

MapboxGL.setAccessToken(
  "sk.eyJ1IjoieWVsZWthY2hpIiwiYSI6ImNtZmJoOXBnNDFzNW8yaXBmdWMwc3MxdTMifQ.qbjaBUFpFXIQazD-Ci830A"
);

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
  const mapStyle =
    colorScheme === "dark" ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Light;

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

  return (
    <View style={styles.container}>
      {/* Ghost Mode Toggle */}
      <View style={{ position: "absolute", bottom: 10, left: 10, zIndex: 1 }}>
        <Button
          title={ghostMode ? "Disable Ghost Mode" : "Enable Ghost Mode"}
          onPress={() => setGhostMode((prev) => !prev)}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
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
