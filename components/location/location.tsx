import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface UserCoords {
  latitude: number;
  longitude: number;
}

export function useUserLocation(): UserCoords | null {
  const [location, setLocation] = useState<UserCoords | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location denied");
        return;
      }

      // Watch location in real-time
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();
  }, []);

  return location;
}
