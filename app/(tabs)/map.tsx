import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Button,
  useColorScheme,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import { useUserLocation } from "@/components";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import {
  PADDING,
  MARGIN,
  GAPS,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Activity, User } from "@/services/api";

const { height: screenHeight } = Dimensions.get("window");

// Conditional Mapbox import for simulator compatibility
let MapboxGL: any = null;
const isSimulator = Platform.OS === "ios" && !!__DEV__; // iOS Simulator detection
const forceFallback = process.env.EXPO_PUBLIC_FORCE_MAP_FALLBACK === "true";

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
  const { colors } = useTheme();
  const userLocation = useUserLocation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [heat, setHeat] = useState<HeatPoint[]>([]);
  const [ghostMode, setGhostMode] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [modalVisible, setModalVisible] = useState(true); // Always visible by default
  const [droppedPin, setDroppedPin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const { activities, loadActivities } = useApi();
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  // Animation values for drag-to-close
  const translateY = useRef(new Animated.Value(0)).current;
  const modalHeight = screenHeight * 0.5;

  // Detect system theme (light | dark)
  const colorScheme = useColorScheme();
  const mapStyle = MapboxGL
    ? colorScheme === "dark"
      ? MapboxGL.StyleURL.Dark
      : MapboxGL.StyleURL.Light
    : null;

  // Activities are loaded centrally by ApiContext

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/create-activity",
        params: { searchLocation: searchQuery.trim() },
      });
    }
  };

  const handleMapLongPress = (event: any) => {
    const { latitude, longitude } = event.geometry.coordinates;
    setDroppedPin({ lat: latitude, lng: longitude });
  };

  const handleCreateActivityAtPin = () => {
    if (droppedPin) {
      router.push({
        pathname: "/create-activity",
        params: {
          latitude: droppedPin.lat.toString(),
          longitude: droppedPin.lng.toString(),
        },
      });
    }
  };

  const clearDroppedPin = () => {
    setDroppedPin(null);
  };

  const handleModalClose = () => {
    Animated.timing(translateY, {
      toValue: modalHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      translateY.setValue(0);
    });
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleGestureEnd = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;

    // If dragged down more than 100px or velocity is high enough, close modal
    if (translationY > 100 || velocityY > 500) {
      handleModalClose();
    } else {
      // Snap back to original position
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (userLocation && activities.length > 0) {
      // Calculate nearby activities (within 10km)
      const nearby = activities
        .filter((activity) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            activity.location.latitude,
            activity.location.longitude
          );
          return distance <= 10; // 10km radius
        })
        .sort((a, b) => {
          const distA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.location.latitude,
            a.location.longitude
          );
          const distB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.location.latitude,
            b.location.longitude
          );
          return distA - distB;
        });

      setNearbyActivities(nearby);
    }

    // Convert activities to events
    const eventsData: Event[] = activities.map((activity) => ({
      id: activity._id,
      lat: activity.location.latitude,
      lng: activity.location.longitude,
      title: activity.title,
    }));

    // Convert users to friends (simulate nearby friends)
    const friendsData: Friend[] = activities
      .slice(0, 3)
      .map((activity, index) => ({
        id: activity._id,
        lat: activity.location.latitude + (Math.random() - 0.5) * 0.01, // Random location near activity
        lng: activity.location.longitude + (Math.random() - 0.5) * 0.01,
        name: activity.title,
      }));

    // Generate heat points for activity density
    const heatData: HeatPoint[] = [
      { id: "1", lat: 40.7589, lng: -73.9851 },
      { id: "2", lat: 40.7505, lng: -73.9934 },
      { id: "3", lat: 40.7181, lng: -73.9973 },
      { id: "4", lat: 40.6782, lng: -73.9442 },
      { id: "5", lat: 40.7231, lng: -74.0026 },
    ];

    setEvents(eventsData);
    setFriends(friendsData);
    setHeat(heatData);
  }, [activities, userLocation]);

  if (!userLocation) return null;

  // Fallback component for when Mapbox is not available
  const MapFallback = () => (
    <View style={[styles.map, styles.fallbackMap, { backgroundColor: colors.background }]}>
      <View style={styles.fallbackContent}>
        <Text style={[styles.fallbackTitle, { color: colors.foreground }]}>Map View</Text>
        <Text style={[styles.fallbackSubtitle, { color: colors.muted }]}>
          {Platform.OS === "ios" ? "iOS Simulator" : "Android Emulator"}{" "}
          detected
        </Text>
        <Text style={[styles.fallbackText, { color: colors.muted }]}>
          Mapbox requires a physical device for full functionality.
        </Text>
        <Text style={[styles.fallbackText, { color: colors.muted }]}>
          Your location: {userLocation.latitude.toFixed(4)},{" "}
          {userLocation.longitude.toFixed(4)}
        </Text>
        <Text style={[styles.fallbackText, { color: colors.muted }]}>
          Friends nearby: {friends.length}
        </Text>
        <Text style={[styles.fallbackText, { color: colors.muted }]}>Events nearby: {events.length}</Text>
        {ghostMode && (
          <View style={styles.ghostModeContainer}>
            <FontAwesome name="eye-slash" size={16} color={colors.muted} />
            <Text style={[styles.ghostModeText, { color: colors.muted }]}>Ghost Mode Active</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, safeArea.header]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome
            name="search"
            size={20}
            color={colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search for a location to create activity..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {/* <TouchableOpacity
            onPress={handleSearchSubmit}
            style={styles.searchButton}
          >
            <FontAwesome name="arrow-right" size={16} color="#000" />
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/create-activity")}
          style={styles.searchButton}
        >
          <FontAwesome name="plus" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Ghost Mode Toggle */}
      {/* <View style={styles.ghostModeToggle}>
        <TouchableOpacity
          style={[styles.ghostButton, ghostMode && styles.ghostButtonActive]}
          onPress={() => setGhostMode((prev) => !prev)}
        >
          <FontAwesome name={ghostMode ? "eye-slash" : "eye"} size={16} color={ghostMode ? "#fff" : "#000"} />
          <Text style={[styles.ghostButtonText, ghostMode && styles.ghostButtonTextActive]}>
            {ghostMode ? "Ghost Mode" : "Visible"}
          </Text>
        </TouchableOpacity>
      </View> */}

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
          onLongPress={handleMapLongPress}
        >
          {/* Camera centers on user location like Snapchat */}
          <MapboxGL.Camera
            centerCoordinate={[userLocation.longitude, userLocation.latitude]}
            zoomLevel={14}
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

          {/* Activity markers with Snapchat-style icons */}
          {activities.map((activity) => (
            <MapboxGL.PointAnnotation
              key={activity._id}
              id={activity._id}
              coordinate={[
                activity.location.longitude,
                activity.location.latitude,
              ]}
              onSelected={() => handleActivitySelect(activity)}
            >
              <TouchableOpacity
                style={[
                  styles.activityMarker,
                  { backgroundColor: getCategoryColor(activity.category) },
                ]}
                onPress={() => handleActivitySelect(activity)}
              >
                <FontAwesome
                  name={getCategoryIcon(activity.category)}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </MapboxGL.PointAnnotation>
          ))}

          {/* Dropped Pin Marker */}
          {droppedPin && (
            <MapboxGL.PointAnnotation
              id="dropped-pin"
              coordinate={[droppedPin.lng, droppedPin.lat]}
            >
              <View style={styles.droppedPinMarker}>
                <FontAwesome name="map-pin" size={24} color="#ff4444" />
              </View>
            </MapboxGL.PointAnnotation>
          )}

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

      {/* Uber-style Activity Modal - Always visible with nearby activities */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={[styles.overlayTouchable, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
            activeOpacity={1}
            onPress={handleModalClose}
          />
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleGestureEnd}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { backgroundColor: colors.surface },
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              <View style={[styles.modalHandle, { backgroundColor: colors.muted }]} />

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Modal Header */}
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nearby Activities</Text>
                  {/* <Text style={styles.dragHint}>Drag down to close</Text> */}
                </View>

                {/* Dropped Pin Actions */}
                {droppedPin && (
                  <View style={[styles.droppedPinSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.droppedPinInfo}>
                      <FontAwesome name="map-pin" size={16} color={colors.error} />
                      <Text style={[styles.droppedPinText, { color: colors.muted }]}>
                        Pin dropped at location
                      </Text>
                    </View>
                    <View style={styles.droppedPinActions}>
                      <TouchableOpacity
                        style={[styles.createAtPinButton, { backgroundColor: colors.foreground }]}
                        onPress={handleCreateActivityAtPin}
                      >
                        <FontAwesome name="plus" size={16} color={colors.background} />
                        <Text style={[styles.createAtPinText, { color: colors.background }]}>
                          Create Activity Here
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.clearPinButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={clearDroppedPin}
                      >
                        <FontAwesome name="times" size={16} color={colors.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Nearby Activities List */}
                {nearbyActivities.length > 0 ? (
                  nearbyActivities.map((activity) => (
                    <TouchableOpacity
                      key={activity._id}
                      style={[styles.nearbyActivityItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleActivitySelect(activity)}
                    >
                      <View
                        style={[
                          styles.nearbyActivityIcon,
                          {
                            backgroundColor: getCategoryColor(
                              activity.category
                            ),
                          },
                        ]}
                      >
                        <FontAwesome
                          name={getCategoryIcon(activity.category)}
                          size={20}
                          color="#fff"
                        />
                      </View>
                      <View style={styles.nearbyActivityInfo}>
                        <Text style={[styles.nearbyActivityTitle, { color: colors.foreground }]}>
                          {activity.title}
                        </Text>
                        <Text style={[styles.nearbyActivityLocation, { color: colors.muted }]}>
                          {activity.location.name}
                        </Text>
                        <Text style={[styles.nearbyActivityDistance, { color: colors.muted }]}>
                          {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            activity.location.latitude,
                            activity.location.longitude
                          ).toFixed(1)}
                          km away
                        </Text>
                      </View>
                      <View style={styles.nearbyActivityMeta}>
                        <Text style={[styles.nearbyActivityParticipants, { color: colors.muted }]}>
                          {activity.participants.length}/
                          {activity.maxParticipants}
                        </Text>
                        <FontAwesome
                          name="chevron-right"
                          size={14}
                          color={colors.muted}
                        />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noActivitiesContainer}>
                    <FontAwesome name="map-marker" size={32} color={colors.muted} />
                    <Text style={[styles.noActivitiesTitle, { color: colors.muted }]}>
                      No nearby activities
                    </Text>
                    <Text style={[styles.noActivitiesSubtitle, { color: colors.muted }]}>
                      Long press on the map to create an activity at that
                      location
                    </Text>
                  </View>
              )}
            </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </View>
      )}
    </View>
  );
}

// Helper functions for activity styling
const getCategoryIcon = (category: string): any => {
  const icons: { [key: string]: any } = {
    social: "users",
    fitness: "heart",
    learning: "book",
    food: "cutlery",
    travel: "plane",
    music: "music",
    sports: "futbol-o",
    tech: "laptop",
  };
  return icons[category] || "star";
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    social: "#FF6B6B",
    fitness: "#4ECDC4",
    learning: "#45B7D1",
    food: "#96CEB4",
    travel: "#FFEAA7",
    music: "#DDA0DD",
    sports: "#98D8C8",
    tech: "#F7DC6F",
  };
  return colors[category] || "#95A5A6";
};

const formatActivityDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Starting soon";
  if (diffInHours < 24) return `In ${diffInHours}h`;
  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fallbackMap: {
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContent: {
    padding: 16,
    alignItems: "center",
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  ghostModeText: {
    fontSize: 16,
    fontStyle: "italic",
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
  ghostModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  // Search Bar Styles
  searchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3000, // Higher than modal overlay
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: PADDING.content.vertical,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.large,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    width: "90%",
  },
  searchIcon: {
    marginRight: GAPS.small,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    paddingVertical: 0,
  },
  searchButton: {
    padding: GAPS.small,
    marginLeft: GAPS.small,
  },
  // Ghost Mode Toggle
  ghostModeToggle: {
    position: "absolute",
    top: 130,
    right: PADDING.content.horizontal,
    zIndex: 3000, // Same as search bar
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical,
    borderRadius: BORDER_RADIUS.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ghostButtonActive: {
    backgroundColor: "#000",
  },
  ghostButtonText: {
    fontSize: FONT_SIZES.sm,
    color: "#000",
    marginLeft: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  ghostButtonTextActive: {
    color: "#fff",
  },
  // Activity Markers
  activityMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000, // Lower than search bar
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.4,
    borderTopLeftRadius: BORDER_RADIUS.large,
    borderTopRightRadius: BORDER_RADIUS.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: GAPS.small,
    marginBottom: GAPS.medium,
    position: "absolute",
    zIndex: 3000,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: PADDING.content.horizontal,
  },
  // Activity Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: GAPS.large,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  activityLocation: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: GAPS.small,
  },
  activityDate: {
    fontSize: FONT_SIZES.sm,
    color: "#999",
  },
  // Activity Details
  activityDetails: {
    marginBottom: GAPS.large,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: "#333",
    lineHeight: 20,
    marginBottom: GAPS.medium,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: GAPS.small,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginLeft: GAPS.small,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    marginBottom: PADDING.content.vertical,
  },
  joinButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: PADDING.button.vertical,
    paddingHorizontal: PADDING.button.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    marginRight: GAPS.small,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: GAPS.small,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: PADDING.button.vertical,
    paddingHorizontal: PADDING.button.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  viewButtonText: {
    color: "#000",
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: GAPS.small,
  },
  // Dropped Pin Styles
  droppedPinMarker: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ff4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Modal Header Styles
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: GAPS.medium,
    paddingVertical: PADDING.content.vertical * 3,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  dragHint: {
    fontSize: FONT_SIZES.sm,
    color: "#999",
    fontStyle: "italic",
  },
  // Dropped Pin Section Styles
  droppedPinSection: {
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.content.horizontal,
    marginBottom: GAPS.medium,
    borderWidth: 1,
  },
  droppedPinInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: GAPS.small,
  },
  droppedPinText: {
    fontSize: FONT_SIZES.sm,
    marginLeft: GAPS.small,
  },
  droppedPinActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createAtPinButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: PADDING.button.vertical,
    paddingHorizontal: PADDING.button.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    flex: 1,
    marginRight: GAPS.small,
  },
  createAtPinText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: GAPS.small,
  },
  clearPinButton: {
    padding: PADDING.button.vertical,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
  },
  // Nearby Activities List Styles
  nearbyActivityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: PADDING.content.vertical,
    paddingHorizontal: PADDING.content.horizontal,
    borderBottomWidth: 1,
  },
  nearbyActivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  nearbyActivityInfo: {
    flex: 1,
  },
  nearbyActivityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: GAPS.small,
  },
  nearbyActivityLocation: {
    fontSize: FONT_SIZES.sm,
    marginBottom: GAPS.small,
  },
  nearbyActivityDistance: {
    fontSize: FONT_SIZES.xs,
  },
  nearbyActivityMeta: {
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyActivityParticipants: {
    fontSize: FONT_SIZES.sm,
    marginBottom: GAPS.small,
  },
  // No Activities Styles
  noActivitiesContainer: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical * 2,
  },
  noActivitiesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  noActivitiesSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: "center",
    paddingHorizontal: PADDING.content.horizontal,
  },
});
