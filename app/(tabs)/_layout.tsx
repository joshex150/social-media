// app/(tabs)/_layout.tsx
import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  useColorScheme,
} from "react-native";
import PagerView from "react-native-pager-view";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Import each screen statically
import HomeScreen from "./index";
import ProfileScreen from "./profile";
import ChatScreen from "./chat";
import MapScreen from "./map";

const screens = [
  {
    name: "map",
    title: "Map",
    icon: "map-pin",
    component: MapScreen,
  },
  { name: "index", title: "Home", icon: "home", component: HomeScreen },
  {
    name: "create",
    title: "Create",
    icon: "plus",
    component: null, // This will be handled specially
  },
  { name: "chat", title: "Chat", icon: "comment", component: ChatScreen },
  { name: "profile", title: "Profile", icon: "user", component: ProfileScreen },
];

function CustomTabBar({ currentIndex, onTabPress, insets }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: isDark ? "#0b0b0b" : "#fff",
          borderColor: isDark ? "#222" : "#eee",
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {screens.map((screen, index) => {
        // Adjust currentIndex for the create tab since it's not in the PagerView
        const adjustedIndex = screen.name === "create" ? -1 : 
          screens.filter(s => s.component !== null).findIndex(s => s.name === screen.name);
        const isFocused = currentIndex === adjustedIndex;
        const color = isFocused
          ? isDark
            ? "#fff"
            : "#000"
          : isDark
          ? "#888"
          : "#999";
        return (
          <TouchableOpacity
            key={screen.name}
            onPress={() => onTabPress(index)}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <FontAwesome name={screen.icon as any} size={28} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const position = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(0)).current;
  const indexAnim = Animated.add(position, offset);
  const pagerRef = useRef<PagerView | null>(null);
  const [page, setPage] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const TOTAL_GAP = 24; // total gap between pages
  const HALF_GAP = TOTAL_GAP / 2;

  const gapColor = isDark ? "#111213" : "#e6e6e6";
  const pageColor = isDark ? "#0b0b0b" : "#fff";

  const onPageScroll = Animated.event(
    [{ nativeEvent: { position: position, offset: offset } }],
    { useNativeDriver: false }
  );

  const handlePageSelected = (e: any) => {
    setPage(e.nativeEvent.position);
  };

  const handleTabPress = (index: number) => {
    const screen = screens[index];
    if (screen.name === "create") {
      // Navigate to create activity page instead of changing tab
      router.push("/create-activity");
      return;
    }
    
    // Map the tab index to the PagerView index (excluding create tab)
    const pagerIndex = screens.filter(s => s.component !== null).findIndex(s => s.name === screen.name);
    if (pagerIndex !== -1) {
      pagerRef.current?.setPage(pagerIndex);
      setPage(pagerIndex);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: gapColor }]}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageScroll={onPageScroll}
        onPageSelected={handlePageSelected}
        pageMargin={Platform.OS === "android" ? TOTAL_GAP : 0}
      >
        {screens.filter(screen => screen.component !== null).map((screen, idx) => {
          const distance = indexAnim.interpolate({
            inputRange: [idx - 1, idx, idx + 1],
            outputRange: [1, 0, 1],
            extrapolate: "clamp",
          });

          // padding for peek effect
          const padding = distance.interpolate({
            inputRange: [0, 1],
            outputRange: [0, HALF_GAP],
            extrapolate: "clamp",
          });

          // animated border radius (0 when centered)
          const borderRadius = distance.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 50], // adjust as needed
            extrapolate: "clamp",
          });

          const ScreenComponent = screen.component;

          return (
            <Animated.View
              key={screen.name}
              style={{
                flex: 1,
                paddingHorizontal: padding,
              }}
            >
              <Animated.View
                style={[
                  styles.pageInner,
                  {
                    backgroundColor: pageColor,
                    borderRadius,
                  },
                ]}
              >
                <ScreenComponent />
              </Animated.View>
            </Animated.View>
          );
        })}
      </PagerView>

      <CustomTabBar currentIndex={page} onTabPress={handleTabPress} insets={insets} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pager: { flex: 1 },
  pageInner: {
    flex: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
});
