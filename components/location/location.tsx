import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";

interface UserCoords {
  latitude: number;
  longitude: number;
}

export function useUserLocation(): UserCoords | null {
  const [location, setLocation] = useState<UserCoords | null>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location denied");
          return;
        }

        // Get current location first
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }

        // Then watch for updates
        watchSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Increased interval to reduce updates
            distanceInterval: 50, // Increased distance to reduce updates
          },
          (loc) => {
            if (isMounted) {
              setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          }
        );
      } catch (error) {
        console.warn("Error getting location:", error);
      }
    };

    getLocation();

    // Cleanup function
    return () => {
      isMounted = false;
      if (watchSubscription.current) {
        watchSubscription.current.remove();
        watchSubscription.current = null;
      }
    };
  }, []);

  return location;
}
